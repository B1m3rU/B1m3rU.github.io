"""Tests estáticos sobre el código fuente: no necesitan Jekyll ni red.

Ejecutar:  python -m pytest tests/test_source.py -v
"""
import re
from collections import Counter

from conftest import ROOT, front_matter, pages, posts, slugify

SCANNED = [p for p in ROOT.rglob("*")
           if p.suffix in {".md", ".html", ".yml", ".webmanifest"}
           and not {".git", ".claude", "_site", "tests", "vendor"} & set(p.relative_to(ROOT).parts)]

# Rutas internas escritas a mano en el código
LINK_PATTERNS = [
    r"'(/[^'{}]*)'\s*\|\s*(?:relative|absolute)_url",   # {{ '/x/' | relative_url }}
    r"(?:href|src)=\"(/[^\"{}]*)\"",                     # href="/x/"  src="/x.png"
    r"\]\((/[^)\s]*)\)",                                 # [texto](/x/)
    r"^\s*(?:image|logo):\s*\"?(/[^\s\"]+)",             # front matter / _config.yml
    r"\"(?:src|start_url|scope|id)\":\s*\"(/[^\"]*)\"",  # site.webmanifest
]


def internal_links():
    for path in SCANNED:
        for n, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            for pat in LINK_PATTERNS:
                for url in re.findall(pat, line):
                    yield path.relative_to(ROOT).as_posix(), n, url.split("#")[0]


def test_internal_links_and_assets_exist(site_urls):
    """Cada ruta interna escrita a mano apunta a una página o fichero que existe."""
    broken = [f"{f}:{n} -> {u}" for f, n, u in internal_links() if u not in site_urls]
    assert not broken, "Rutas internas rotas:\n" + "\n".join(broken)


def test_no_duplicate_permalinks():
    """Dos páginas con el mismo permalink se pisan al generar el sitio."""
    counts = Counter(front_matter(p).get("permalink") for p in pages())
    counts.pop(None, None)
    dups = {k: v for k, v in counts.items() if v > 1}
    assert not dups, f"Permalinks duplicados: {dups}"


def test_every_tag_has_page():
    """Cada tag usado en un post tiene su página /tags/<slug>/ (si no, el chip da 404)."""
    tag_pages = {front_matter(p).get("permalink") for p in (ROOT / "tags").glob("*.md")}
    missing = {}
    for post, _ in posts():
        for tag in front_matter(post).get("tags", []):
            if f"/tags/{slugify(tag)}/" not in tag_pages:
                missing.setdefault(tag, []).append(post.name)
    assert not missing, f"Tags sin página en tags/: {missing}"


def test_posts_have_required_front_matter():
    for post, _ in posts():
        fm = front_matter(post)
        for key in ("layout", "title", "categories"):
            assert fm.get(key), f"{post.name}: falta '{key}' en el front matter"


def test_default_layout_is_valid_html():
    """Un único <!DOCTYPE> y un único <head> tras resolver el include de head.html."""
    layout = (ROOT / "_layouts/default.html").read_text(encoding="utf-8")
    head = (ROOT / "_includes/head.html").read_text(encoding="utf-8")
    html = re.sub(r"{%-?\s*include head\.html\s*-?%}", lambda _: head, layout)
    html = re.sub(r"{%-?\s*comment\s*-?%}.*?{%-?\s*endcomment\s*-?%}", "", html, flags=re.S)
    assert html.count("<!DOCTYPE") == 1, "default.html tiene más de un <!DOCTYPE>"
    assert len(re.findall(r"<head[\s>]", html)) == 1, "<head> anidado (default.html + head.html)"
    assert "<title>" not in html or "title=false" in html, \
        "Doble <title>: head.html escribe uno y {% seo %} genera otro"


# ---------- Seguridad ----------

def _html_sources():
    for path in SCANNED:
        if path.suffix in {".md", ".html"}:
            yield path.relative_to(ROOT).as_posix(), path.read_text(encoding="utf-8")


def test_target_blank_has_noopener():
    """target="_blank" sin rel="noopener noreferrer" permite reverse tabnabbing."""
    bad = []
    for name, text in _html_sources():
        for tag in re.findall(r"<a\b[^>]*target=[\"']_blank[\"'][^>]*>", text, re.I):
            rel = re.search(r"rel=[\"']([^\"']*)[\"']", tag)
            if not rel or not {"noopener", "noreferrer"} <= set(rel.group(1).split()):
                bad.append(f"{name}: {tag}")
    assert not bad, "Enlaces _blank sin noopener/noreferrer:\n" + "\n".join(bad)


def test_external_resources_have_sri():
    """Todo <script>/<link rel=stylesheet> externo necesita integrity + crossorigin."""
    bad = []
    for name, text in _html_sources():
        for tag in re.findall(r"<(?:script|link)\b[^>]*>", text, re.I):
            url = re.search(r"(?:src|href)=[\"'](https?:)?//", tag)
            is_resource = tag.lower().startswith("<script") or "stylesheet" in tag.lower()
            if url and is_resource and not ("integrity=" in tag and "crossorigin=" in tag):
                bad.append(f"{name}: {tag}")
    assert not bad, "Recursos externos sin SRI:\n" + "\n".join(bad)
