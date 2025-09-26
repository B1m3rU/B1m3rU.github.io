(function () {
  console.log('[copy-code] init'); // marca en consola

  function getCodeText(host) {
    const code = host.querySelector('code') || host;
    let text = code.innerText || '';
    text = text
      .split('\n')
      .map(line => line.replace(/^(\s*)(\$|>|PS [^>]*>|\# )\s?/, '$1'))
      .join('\n')
      .trimEnd();
    return text;
  }

  function createCopyButton() {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.textContent = 'Copiar';
    btn.setAttribute('aria-label', 'Copiar código');
    return btn;
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }

  function enhance() {
    // Cubre las variantes de Rouge/Jekyll/minima
    const candidates = document.querySelectorAll(
      'figure.highlight, div.highlighter-rouge, pre.highlight, pre:has(code)'
    );
    console.log('[copy-code] blocks:', candidates.length);

    candidates.forEach(container => {
      const host =
        container.closest('figure.highlight') ||
        container.closest('div.highlighter-rouge') ||
        container.closest('pre.highlight') ||
        container;

      if (!host || host.querySelector('.copy-btn')) return;

      host.classList.add('copy-host');

      const btn = createCopyButton();
      btn.addEventListener('click', async () => {
        const ok = await copyToClipboard(getCodeText(host));
        const old = btn.textContent;
        btn.textContent = ok ? 'Copiado ✓' : 'Error';
        btn.classList.toggle('copied', !!ok);
        setTimeout(() => {
          btn.textContent = old;
          btn.classList.remove('copied');
        }, 1200);
      });

      host.appendChild(btn);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhance);
  } else {
    enhance();
  }
})();
