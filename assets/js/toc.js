// assets/js/toc.js — índice automático para posts/writeups (h2 + h3).
// Solo en artículos (article.h-entry), no en páginas como About.
(function () {
  const MIN_SECTIONS = 3;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const content = document.querySelector('article.h-entry .post-content');
    if (!content || content.querySelector('#markdown-toc')) return; // ya tiene TOC manual

    const headings = [...content.querySelectorAll(':scope > h2[id], :scope > h3[id]')];
    if (headings.filter(h => h.tagName === 'H2').length < MIN_SECTIONS) return;

    const nav = document.createElement('nav');
    nav.className = 'toc-box';
    nav.setAttribute('aria-label', 'Contents');

    const title = document.createElement('p');
    title.className = 'toc-box__title';
    title.textContent = 'Contents';
    nav.appendChild(title);

    const root = document.createElement('ul');
    let currentSub = null;
    let lastH2Item = null;

    headings.forEach(h => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);

      if (h.tagName === 'H2' || !lastH2Item) {
        root.appendChild(li);
        lastH2Item = li;
        currentSub = null;
      } else {
        if (!currentSub) {
          currentSub = document.createElement('ul');
          lastH2Item.appendChild(currentSub);
        }
        currentSub.appendChild(li);
      }
    });

    nav.appendChild(root);
    content.insertBefore(nav, content.firstChild);
  }
})();
