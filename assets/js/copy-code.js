/* assets/js/copy-code.js */
(function () {
  // Encuentra el contenedor “más externo” de cada bloque
  function getCodeBlocks() {
    const all = Array.from(document.querySelectorAll(
      ".highlighter-rouge, figure.highlight, div.highlight"
    ));
    const uniq = new Set(all.map(el => el.closest(".highlighter-rouge") || el));
    return Array.from(uniq);
  }

  function addButtonTo(block) {
    if (block.querySelector(".code-copy-btn")) return;

    // Asegura posición para el botón
    const style = window.getComputedStyle(block);
    if (style.position === "static") block.style.position = "relative";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "code-copy-btn";
    btn.setAttribute("aria-label", "Copiar código");
    btn.textContent = "Copiar";

    btn.addEventListener("click", async () => {
      const codeEl = block.querySelector("pre, code");
      const text = (codeEl ? codeEl.innerText : block.innerText).replace(/\s+$/, "");
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // Fallback
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      const prev = btn.textContent;
      btn.textContent = "¡Copiado!";
      btn.disabled = true;
      setTimeout(() => { btn.textContent = prev; btn.disabled = false; }, 1500);
    });

    block.appendChild(btn);
  }

  function init() {
    getCodeBlocks().forEach(addButtonTo);
  }

  // Ejecuta al cargar y también ante cambios (por si el tema hidrata algo)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  window.addEventListener("load", init);

  // Observa el DOM por si se inyectan bloques después
  const mo = new MutationObserver(init);
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
