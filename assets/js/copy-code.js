/* assets/js/copy-code.js
   Añade un botón “Copiar” a cada bloque de código de Jekyll/Rouge (minima). */

(function () {
  // Utilidad: normaliza el texto que vamos a copiar
  function getCodeText(block) {
    // Busca el <code> real dentro del bloque
    const code = block.querySelector('code') || block;
    // Extrae texto plano
    let text = code.innerText || '';
    // Quita prompts comunes ($, >, PS C:\), preservando identación
    text = text
      .split('\n')
      .map(line => line.replace(/^(\s*)(\$|>|PS [^>]*>|\# )\s?/, '$1'))
      .join('\n')
      .trimEnd(); // evita salto extra al final
    return text;
  }

  // Crea un botón con estilo y comportamiento
  function createCopyButton() {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Copiar código');
    btn.textContent = 'Copiar';
    return btn;
  }

  // Lógica de copiado con fallback
  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback para navegadores antiguos
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      document.body.removeChild(ta);
      return false;
    }
  }

  // Inserta botones en todos los bloques de código
  function enhanceAll() {
    const blocks = document.querySelectorAll('pre.highlight, figure.highlight, pre > code');
    blocks.forEach(block => {
      const host = block.closest('figure.highlight, pre.highlight, pre') || block;
      // Evita duplicados
      if (host.querySelector('.copy-btn')) return;

      // Asegura posicionamiento relativo del contenedor
      host.classList.add('copy-host');

      const btn = createCopyButton();
      btn.addEventListener('click', async () => {
        const text = getCodeText(host);
        const ok = await copyToClipboard(text);
        const old = btn.textContent;
        btn.textContent = ok ? 'Copiado ✓' : 'Error';
        btn.classList.toggle('copied', !!ok);
        setTimeout(() => {
          btn.textContent = old;
          btn.classList.remove('copied');
        }, 1400);
      });

      host.appendChild(btn);
    });
  }

  // Ejecuta cuando el DOM está listo (tenemos defer, pero por si acaso)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceAll);
  } else {
    enhanceAll();
  }
})();
