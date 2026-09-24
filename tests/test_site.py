"""Smoke test HTTP contra el sitio ya generado (solo librería estándar).

Por defecto prueba producción. Para probar en local:
    SITE_URL=http://127.0.0.1:4000 python -m pytest tests/test_site.py -v
"""
import os
import re
import urllib.error
import urllib.request
from functools import lru_cache
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse

import pytest

BASE = os.environ.get("SITE_URL", "https://b1m3ru.github.io").rstrip("/")
PROD_HOST = "b1m3ru.github.io"
TIMEOUT = 15


@lru_cache(maxsize=None)
def fetch(url):
    """Devuelve (status, content_type, body). Cacheado para no repetir peticiones."""
    req = urllib.request.Request(url, headers={"User-Agent": "site-smoke-test"})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            return r.status, r.headers.get("Content-Type", ""), r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get("Content-Type", ""), e.read().decode("utf-8", "replace")


class RefCollector(HTMLParser):
    """Recoge enlaces <a>, imágenes, CSS/iconos/manifest y scripts."""
    ATTRS = {"a": "href", "img": "src", "script": "src", "link": "href", "source": "src"}

    def __init__(self):
        super().__init__()
        self.refs = []

    def handle_starttag(self, tag, attrs):
        attr = self.ATTRS.get(tag)
        value = dict(attrs).get(attr)
        if value and not value.startswith(("mailto:", "tel:", "javascript:", "#", "data:")):
            self.refs.append((tag, value))


def is_internal(url):
    host = urlparse(url).netloc
    return host in ("", urlparse(BASE).netloc, PROD_HOST)


def to_base(url):
    """Reescribe URLs absolutas de producción al BASE que se está probando."""
    p = urlparse(url)
    return BASE + (p.path or "/") + (f"?{p.query}" if p.query else "")


@pytest.fixture(scope="session")
def site_pages():
    try:
        status, _, body = fetch(BASE + "/sitemap.xml")
    except (urllib.error.URLError, TimeoutError) as e:
        pytest.skip(f"No se puede conectar a {BASE}: {e}")
    assert status == 200, "sitemap.xml no disponible (¿plugin jekyll-sitemap activo?)"
    urls = {to_base(u) for u in re.findall(r"<loc>(.*?)</loc>", body)}
    return sorted(urls | {BASE + "/", BASE + "/404.html"})


def test_home_loads():
    status, ctype, body = fetch(BASE + "/")
    assert status == 200
    assert "text/html" in ctype
    assert re.search(r"<title>[^<]+</title>", body), "La portada no tiene <title>"
    assert "/assets/main.css" in body, "La portada no enlaza la hoja de estilos"


def test_every_page_returns_200(site_pages):
    bad = [f"{u} -> {fetch(u)[0]}" for u in site_pages if fetch(u)[0] != 200]
    assert not bad, "Páginas que no cargan:\n" + "\n".join(bad)


def test_internal_links_and_resources_resolve(site_pages):
    """Ningún enlace interno ni recurso (img/css/js/icono) devuelve error."""
    broken = set()
    for page in site_pages:
        status, ctype, body = fetch(page)
        if status != 200 or "html" not in ctype:
            continue
        parser = RefCollector()
        parser.feed(body)
        for tag, ref in parser.refs:
            target = urljoin(page, ref).split("#")[0]
            if is_internal(target) and fetch(to_base(target))[0] >= 400:
                broken.add(f"{page} <{tag}> {ref} -> {fetch(to_base(target))[0]}")
    assert not broken, "Referencias rotas:\n" + "\n".join(sorted(broken))


def test_custom_404_page():
    status, _, body = fetch(BASE + "/esta-ruta-no-existe-xyz/")
    assert status == 404
    assert "Page not found" in body, "No se está sirviendo el 404.html personalizado"
