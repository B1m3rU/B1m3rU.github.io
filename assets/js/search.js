// assets/js/search.js — buscador en cliente sobre /search.json (sin librerías externas).
(function () {
  const input = document.getElementById('search-input');
  if (!input) return;
  const results = document.getElementById('search-results');
  const status = document.getElementById('search-status');
  const browse = document.getElementById('tags-browse');   // nube + secciones de /tags/ (opcional)
  const MIN_CHARS = 2;
  const SNIPPET = 160;
  let index = null;
  let timer = null;

  // Minúsculas y sin tildes: "enumeración" encuentra "enumeracion" y viceversa
  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const slugify = s => norm(s).replace(/[^a-z0-9._~!$&'()+,;=@]+/g, '-').replace(/^-+|-+$/g, '');
  // strip_html de Jekyll deja entidades (&gt; &amp; &quot;…): se decodifican una vez al cargar.
  // DOMParser no ejecuta scripts ni carga recursos.
  const parser = new DOMParser();
  const decode = s => parser.parseFromString(s || '', 'text/html').documentElement.textContent;

  fetch(input.dataset.index)
    .then(r => r.json())
    .then(data => {
      index = data.map(raw => ({ ...raw, content: decode(raw.content), description: decode(raw.description) }))
      .map(e => ({
        ...e,
        _title: norm(e.title),
        _tags: norm((e.tags || []).join(' ')),
        _desc: norm(e.description),
        _content: norm(e.content)
      }));
      const q = new URLSearchParams(location.search).get('q');
      if (q) input.value = q;
      run();
    })
    .catch(() => { status.textContent = 'The search index could not be loaded.'; });

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(run, 120);
  });
  input.form.addEventListener('submit', e => { e.preventDefault(); run(); });

  // Pulsar un #tag de la nube: salir de la búsqueda para que la sección sea visible
  window.addEventListener('hashchange', () => {
    if (!input.value) return;
    input.value = '';
    run();
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) target.scrollIntoView();
  });

  function count(haystack, needle) {
    let n = 0, i = 0;
    while ((i = haystack.indexOf(needle, i)) !== -1) { n++; i += needle.length; }
    return n;
  }

  // Todos los términos tienen que aparecer; el título y los tags pesan más que el texto
  function score(e, terms) {
    let total = 0;
    for (const t of terms) {
      let s = 0;
      if (e._title.includes(t)) s += 10;
      if (e._tags.includes(t)) s += 6;
      if (e._desc.includes(t)) s += 3;
      s += Math.min(count(e._content, t), 5);
      if (!s) return 0;
      total += s;
    }
    return total;
  }

  function run() {
    if (!index) return;
    const raw = input.value.trim();
    const url = new URL(location.href);
    raw ? url.searchParams.set('q', raw) : url.searchParams.delete('q');
    history.replaceState(null, '', url);

    results.replaceChildren();
    const terms = norm(raw).split(/\s+/).filter(t => t.length >= MIN_CHARS);
    if (browse) browse.hidden = terms.length > 0;
    if (!terms.length) { status.textContent = ''; return; }

    const hits = index
      .map(e => ({ e, s: score(e, terms) }))
      .filter(h => h.s > 0)
      .sort((a, b) => b.s - a.s);

    status.textContent = hits.length
      ? `${hits.length} result${hits.length === 1 ? '' : 's'} for “${raw}”`
      : `No results for “${raw}”. Try another term or browse the tags.`;

    hits.forEach(({ e }) => results.appendChild(render(e, terms)));
  }

  function render(e, terms) {
    const li = document.createElement('li');
    li.className = 'search-result';

    const a = document.createElement('a');
    a.className = 'search-result__title';
    a.href = e.url;
    a.textContent = e.title;
    li.appendChild(a);

    const meta = [e.type === 'machines' ? 'Machine' : e.type === 'page' ? 'Page' : 'Post', e.date].filter(Boolean);
    const small = document.createElement('small');
    small.textContent = ' — ' + meta.join(' · ');
    li.appendChild(small);

    if (e.tags && e.tags.length) {
      const list = document.createElement('span');
      list.className = 'tag-list';
      e.tags.forEach(t => {
        const badge = document.createElement('span');
        badge.className = 'tag-badge';
        const link = document.createElement('a');
        link.href = '/tags/#' + slugify(t);
        link.textContent = t;
        badge.appendChild(link);
        list.appendChild(badge);
      });
      li.appendChild(list);
    }

    const p = document.createElement('p');
    p.className = 'search-result__snippet';
    appendHighlighted(p, snippet(e, terms), terms);
    li.appendChild(p);
    return li;
  }

  // Fragmento del texto alrededor de la primera coincidencia (o la descripción)
  function snippet(e, terms) {
    if (e.type === 'page') return e.description;          // en páginas, content son palabras clave internas
    const text = e.content || e.description || '';
    const pos = Math.min(...terms.map(t => { const i = e._content.indexOf(t); return i < 0 ? Infinity : i; }));
    if (!isFinite(pos)) return e.description || text.slice(0, SNIPPET);
    let start = Math.max(0, pos - 50);
    const space = text.indexOf(' ', start);                 // empezar en una palabra completa,
    if (start && space !== -1 && space < pos) start = space + 1; // sin saltarse la coincidencia
    return (start ? '…' : '') + text.slice(start, start + SNIPPET).trim() + (start + SNIPPET < text.length ? '…' : '');
  }

  // Resalta los términos con <mark> usando nodos de texto (nada de innerHTML)
  function appendHighlighted(el, text, terms) {
    const n = norm(text);
    let i = 0;
    while (i < text.length) {
      let next = -1, len = 0;
      for (const t of terms) {
        const j = n.indexOf(t, i);
        if (j !== -1 && (next === -1 || j < next)) { next = j; len = t.length; }
      }
      if (next === -1) { el.appendChild(document.createTextNode(text.slice(i))); break; }
      if (next > i) el.appendChild(document.createTextNode(text.slice(i, next)));
      const mark = document.createElement('mark');
      mark.textContent = text.slice(next, next + len);
      el.appendChild(mark);
      i = next + len;
    }
  }
})();
