/* assets/js/copy-code.js */
(function () {
  function uniqueSel(el) {
    // evita duplicados (busca botón dentro del mismo bloque)
    return el.querySelector(".code-copy-btn");
  }

  function getBlocks() {
    // cubre todas las variantes que genera Kramdown/Rouge
    const a = Array.from(document.querySelectorAll(".highlighter-rouge"));
    const b = Array.from(document.querySelectorAll("figure.highlight, .highlight"));
    // preferimos el wrapper más externo para poner el botón
    const set = new Set();
    [...a, ...b].forEach(el => set.add(el.closest(".highlighter-rouge") || el));
    return Array.from(set);
  }

  async function copyText(txt, btn) {
    try {
      await navigator.clipboard.writeText(txt);
    } catch {
      // Fallback para navegadores/casos raros
      const ta = document.createElement("textarea");
      ta.value = txt;
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    const old = btn.textContent;
    btn.textContent = "¡Copiado!";
    btn.disabled = true;
    setTimeout(() => { btn.textContent = old; btn.disabled = false; }, 1500);
  }

  function addButtons() {
    getBlocks().forEach(block => {
      if (uniqueSel(block)) return;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "code-copy-btn";
      btn.setAttribute("aria-label", "Copiar código");
      btn.textContent = "Copiar";

      btn.addEventListener("click", () => {
        const codeEl = block.querySelector("pre, code");
        const text = codeEl ? codeEl.innerText : block.innerText;
        copyText(text, btn);
      });

      // asegúrate de que el contenedor tenga posición
      block.style.position ||= "relative";
      block.appendChild(btn);
    });
  }

  // Ejecutar en DOMContentLoaded y en load por si hay hidratación tardía
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addButtons);
  } else {
    addButtons();
  }
  window.addEventListener("load", addButtons);
})();
