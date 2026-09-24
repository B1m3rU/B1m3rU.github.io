"""Utilidades compartidas por los tests.

Parser mínimo de front matter (sin PyYAML): solo entiende `clave: valor`
y listas en línea `clave: [a, b]`, que es lo que usa este sitio.
"""
import re
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent

# Carpetas que Jekyll no publica como páginas (o que no son del sitio)
NON_PAGE_DIRS = {"_layouts", "_includes", "_site", "tests", ".git", ".claude", "vendor"}
DATED_POST = re.compile(r"^\d{4}-\d{2}-\d{2}-(.+)\.(md|markdown|html)$")


def front_matter(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\s*\n(.*?)\n---\s*(\n|$)", text, re.S)
    if not m:
        return {}
    data = {}
    for line in m.group(1).splitlines():
        kv = re.match(r"^([A-Za-z_][\w-]*):\s*(.*?)\s*$", line)
        if not kv:
            continue
        key, val = kv.groups()
        if val.startswith("[") and val.endswith("]"):
            val = [v.strip().strip("\"'") for v in val[1:-1].split(",") if v.strip()]
        else:
            val = val.strip("\"'")
        data[key] = val
    return data


def slugify(s: str) -> str:
    """Aproximación al filtro `slugify` de Jekyll (modo por defecto)."""
    return re.sub(r"[^a-z0-9._~!$&'()+,;=@]+", "-", s.lower()).strip("-")


def source_files():
    for p in ROOT.rglob("*"):
        if p.is_file() and not (set(p.relative_to(ROOT).parts) & NON_PAGE_DIRS):
            yield p


def posts():
    """Posts válidos de _posts (Jekyll ignora los que no llevan fecha en el nombre)."""
    for p in (ROOT / "_posts").rglob("*"):
        m = DATED_POST.match(p.name)
        if m:
            yield p, m.group(1)


def pages():
    """Páginas (no posts) con front matter."""
    for p in source_files():
        if p.suffix in {".md", ".html", ".json", ".xml"} and "_posts" not in p.parts and front_matter(p):
            yield p


@pytest.fixture(scope="session")
def site_urls() -> set:
    """Todas las URLs que Jekyll generará (permalinks + posts + assets)."""
    urls = {"/"}
    for p in pages():
        fm = front_matter(p)
        if "permalink" in fm:
            urls.add(fm["permalink"])
        elif p.stem == "index":
            urls.add("/" + p.parent.relative_to(ROOT).as_posix().strip(".") + "/")
        else:
            urls.add("/" + p.relative_to(ROOT).with_suffix(".html").as_posix())
    for p, slug in posts():
        cats = front_matter(p).get("categories", [])
        cats = [cats] if isinstance(cats, str) else cats
        # permalink: /:categories/:title/
        urls.add("/" + "/".join(cats + [slug]) + "/")
    for p in (ROOT / "assets").rglob("*"):
        if p.is_file():
            rel = "/" + p.relative_to(ROOT).as_posix()
            urls.add(rel[:-5] + ".css" if rel.endswith(".scss") else rel)
    return urls
