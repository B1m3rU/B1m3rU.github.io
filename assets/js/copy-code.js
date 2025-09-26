(function () {
  function getBlocks() {
    const all = Array.from(document.querySelectorAll(".highlighter-rouge, figure.highlight, div.highlight"));
    const uniq = new Set(all.map(el => el.closest(".highlighter-rouge") || el));
    return Array.from(uniq);
  }
  function addBtn(block) {
    if (block.querySelector(".code-copy-btn")) return;
    if (getComputedStyle(block).position === "static") block.style.position = "relative";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "code-copy-btn";
    btn.textContent = "Copiar";
    btn.addEventListener("click", async () => {
      const codeEl = block.querySelector("pre, code");
      const text = (codeEl ? codeEl.innerText : block.innerText).replace(/\s+$/, "");
      try { await navigator.clipboard.writeText(text); }
      catch {
        const ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.top = "-9999px";
        document.body.appendChild(ta); ta.focus(); ta.select(); document.execCommand("copy");
        document.body.removeChild(ta);
      }
      const prev = btn.textContent;
      btn.textContent = "¡Copiado!"; btn.disabled = true;
      setTimeout(() => { btn.textContent = prev; btn.disabled = false; }, 1500);
    });
    block.appendChild(btn);
  }
  function init(){ getBlocks().forEach(addBtn); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  window.addEventListener("load", init);
  new MutationObserver(init).observe(document.documentElement, { childList: true, subtree: true });
})();
