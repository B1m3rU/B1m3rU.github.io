// assets/js/copy-code.js
(function () {
  const ICON_CLIP =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M15 9V6a3 3 0 0 0-3-3H4A3 3 0 0 0 1 6v8a3 3 0 0 0 3 3h3"/></svg>';

  const ICON_OK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Rouge: div.highlighter-rouge / figure.highlight
    // Simple: pre > code
    const blocks = document.querySelectorAll('div.highlighter-rouge, figure.highlight, pre > code');
    blocks.forEach(attachCopyUI);
  }

  function attachCopyUI(codeOrContainer) {
    let container = codeOrContainer.closest('div.highlighter-rouge, figure.highlight');
    let codeEl = codeOrContainer;

    if (!container) {
      const pre = codeOrContainer.closest('pre');
      if (!pre) return;                 // nada que hacer

      // Envoltura: anclaje no scrollable
      const wrapper = document.createElement('div');
      wrapper.className = 'codebox';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      container = wrapper;
      codeEl = pre.querySelector('code') || pre;
    } else {
      // En Rouge, el código puede estar en <pre> o <code>
      const maybeCode = container.querySelector('code, pre, .highlight');
      if (maybeCode) codeEl = maybeCode;
    }

    // Evitar duplicados
    if (container.querySelector('.copy-btn')) return;

    // Botón copiar
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Copiar al portapapeles');
    btn.innerHTML = ICON_CLIP;

    // Toast
    const toast = document.createElement('span');
    toast.className = 'copy-toast';
    toast.textContent = '¡Copiado!';

    container.appendChild(btn);
    container.appendChild(toast);

    // Lógica de copiado
    btn.addEventListener('click', async () => {
      const text =
        codeEl && 'innerText' in codeEl ? codeEl.innerText : (codeEl.textContent || '');

      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // Fallback antiguo
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
      }

      feedback(btn, toast);
    });
  }

  function feedback(btn, toast) {
    btn.classList.add('ok');
    btn.innerHTML = ICON_OK;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      btn.classList.remove('ok');
      btn.innerHTML = ICON_CLIP;
    }, 1200);
  }
})();
