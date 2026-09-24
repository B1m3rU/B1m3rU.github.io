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


def test_csp_meta_is_first_in_head():
    """La CSP vía <meta> solo protege lo que se carga DESPUÉS de ella."""
    _, _, body = fetch(BASE + "/")
    head = body.split("</head>")[0]
    csp = re.search(r'<meta http-equiv="Content-Security-Policy" content="([^"]+)"', head)
    assert csp, "Falta la meta Content-Security-Policy"
    assert "'unsafe-inline'" not in csp.group(1)
    first_resource = re.search(r"<(script|link)\b", head)
    assert not first_resource or csp.start() < first_resource.start(), \
        "La CSP debe ir antes de cualquier <script>/<link>"


def test_home_open_graph():
    _, _, body = fetch(BASE + "/")
    meta = lambda key: re.findall(rf'<meta (?:property|name)="{re.escape(key)}" content="([^"]*)"', body)
    assert meta("og:image") == [f"https://{PROD_HOST}/assets/og-image.png"], meta("og:image")
    assert meta("og:image:width") == ["1200"] and meta("og:image:height") == ["630"]
    assert meta("og:title") == ["B1m3rU — Cybersecurity Portfolio"]
    assert meta("og:url") == [f"https://{PROD_HOST}/"]
    assert meta("og:type") == ["website"]
    assert meta("twitter:card") == ["summary_large_image"]
    assert len(meta("twitter:description")) == 1


def test_tag_links_point_to_existing_sections(site_pages):
    """Los chips enlazan a /tags/#<slug>: esa sección tiene que existir en /tags/."""
    _, _, tags_page = fetch(BASE + "/tags/")
    ids = set(re.findall(r'<section class="tag-section" id="([^"]+)"', tags_page))
    assert ids, "La página /tags/ no genera secciones"
    missing = set()
    for page in site_pages:
        for slug in re.findall(r'href="/tags/#([^"]+)"', fetch(page)[2]):
            if slug not in ids:
                missing.add(f"{page} -> #{slug}")
    assert not missing, "Chips a secciones inexistentes:\n" + "\n".join(sorted(missing))


def test_writeups_have_machine_card_and_toc_script():
    _, _, body = fetch(BASE + "/machines/jump-force/")
    assert 'class="machine-card"' in body, "Falta la ficha de la máquina"
    assert "min read" in body, "Falta el tiempo de lectura"
    assert "/assets/js/toc.js" in body, "Falta el script del índice"


def test_rss_feed():
    status, ctype, body = fetch(BASE + "/feed.xml")
    assert status == 200 and "<feed" in body
    _, _, home = fetch(BASE + "/")
    assert 'type="application/atom+xml"' in home, "Falta {% feed_meta %} en el <head>"
