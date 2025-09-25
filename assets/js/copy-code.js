/* assets/js/copy-code.js */
(function () {
  function addCopyButtons() {
    const blocks = document.querySelectorAll(".highlighter-rouge");
    blocks.forEach(block => {
      if (block.querySelector(".code-copy-btn")) return; // evita duplicados

      // botón
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "code-copy-btn";
      btn.setAttribute("aria-label", "Copiar código");
      btn.textContent = "Copiar";

      btn.addEventListener("click", async () => {
        const codeEl = block.querySelector("pre, code");
        const text = codeEl ? codeEl.innerText : block.innerText;
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = "¡Copiado!";
          btn.disabled = true;
          setTimeout(() => { btn.textContent = "Copiar"; btn.disabled = false; }, 1500);
        } catch (e) {
          // Fallback
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.top = "-9999px";
          document.body.appendChild(ta);
          ta.focus(); ta.select();
          try {
            document.execCommand("copy");
            btn.textContent = "¡Copiado!";
          } catch { btn.textContent = "Error"; }
          finally {
            document.body.removeChild(ta);
            setTimeout(() => { btn.textContent = "Copiar"; }, 1500);
          }
        }
      });

      block.appendChild(btn);
    });
  }

  // Ejecuta cuando DOM está listo (y también tras load por si hay hydration)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addCopyButtons);
  } else {
    addCopyButtons();
  }
  window.addEventListener("load", addCopyButtons);
})();
