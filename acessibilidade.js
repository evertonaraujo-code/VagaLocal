(function () {
  const STORAGE_KEY = "vagaLocalA11y";
  const DEFAULTS = {
    theme: "default",
    font: 0,
    spacing: false,
    width: false
  };

  function loadPrefs() {
    try {
      return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(STORAGE_KEY)) || {});
    } catch (error) {
      return Object.assign({}, DEFAULTS);
    }
  }

  function savePrefs(prefs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }

  function applyPrefs(prefs) {
    const body = document.body;
    const root = document.documentElement;
    const classes = [
      "theme-light",
      "theme-contrast",
      "a11y-font-sm",
      "a11y-font-lg",
      "a11y-font-xl",
      "a11y-text-spacing",
      "a11y-readable-width"
    ];

    body.classList.remove(...classes);
    root.classList.remove(...classes);

    if (prefs.theme === "light") body.classList.add("theme-light");
    if (prefs.theme === "contrast") body.classList.add("theme-contrast");
    if (prefs.font === -1) root.classList.add("a11y-font-sm");
    if (prefs.font === 1) root.classList.add("a11y-font-lg");
    if (prefs.font === 2) root.classList.add("a11y-font-xl");
    if (prefs.spacing) body.classList.add("a11y-text-spacing");
    if (prefs.width) body.classList.add("a11y-readable-width");
  }

  function setActiveStates(widget, prefs) {
    widget.querySelectorAll("[data-theme]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.theme === prefs.theme));
    });
    widget.querySelector("[data-action='spacing']").setAttribute("aria-pressed", String(prefs.spacing));
    widget.querySelector("[data-action='width']").setAttribute("aria-pressed", String(prefs.width));
    widget.querySelector("[data-font-status]").textContent = `${100 + prefs.font * 20}%`;
  }

  function createWidget() {
    const widget = document.createElement("section");
    widget.className = "accessibility-widget";
    widget.setAttribute("aria-label", "Recursos de acessibilidade");
    widget.innerHTML = `
      <button class="accessibility-toggle" type="button" aria-expanded="false" aria-controls="accessibility-panel">
        <span aria-hidden="true">&#9881;</span>
        <span>Acessibilidade</span>
      </button>
      <div class="accessibility-panel" id="accessibility-panel" hidden>
        <div class="accessibility-group">
          <span class="accessibility-label">Cores</span>
          <div class="accessibility-actions">
            <button type="button" data-theme="default">Padrao</button>
            <button type="button" data-theme="contrast">Alto contraste</button>
            <button type="button" data-theme="light">Tema claro</button>
          </div>
        </div>
        <div class="accessibility-group">
          <span class="accessibility-label">Texto</span>
          <div class="accessibility-actions">
            <button type="button" data-action="font-down" aria-label="Diminuir tamanho do texto">A-</button>
            <span class="accessibility-status" data-font-status>100%</span>
            <button type="button" data-action="font-up" aria-label="Aumentar tamanho do texto">A+</button>
          </div>
          <div class="accessibility-actions">
            <button type="button" data-action="spacing">Espacamento</button>
            <button type="button" data-action="width">Largura de leitura</button>
          </div>
        </div>
        <button class="accessibility-reset" type="button" data-action="reset">Restaurar padrao</button>
      </div>
    `;
    return widget;
  }

  function initAccessibility() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    let prefs = loadPrefs();
    const widget = createWidget();
    navbar.insertAdjacentElement("afterend", widget);
    applyPrefs(prefs);
    setActiveStates(widget, prefs);

    const toggle = widget.querySelector(".accessibility-toggle");
    const panel = widget.querySelector(".accessibility-panel");

    toggle.addEventListener("click", () => {
      const isOpen = !panel.hidden;
      panel.hidden = isOpen;
      toggle.setAttribute("aria-expanded", String(!isOpen));
    });

    widget.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;

      if (button.dataset.theme) {
        prefs.theme = button.dataset.theme;
      }

      switch (button.dataset.action) {
        case "font-down":
          prefs.font = Math.max(-1, prefs.font - 1);
          break;
        case "font-up":
          prefs.font = Math.min(2, prefs.font + 1);
          break;
        case "spacing":
          prefs.spacing = !prefs.spacing;
          break;
        case "width":
          prefs.width = !prefs.width;
          break;
        case "reset":
          prefs = Object.assign({}, DEFAULTS);
          break;
      }

      applyPrefs(prefs);
      savePrefs(prefs);
      setActiveStates(widget, prefs);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAccessibility);
  } else {
    initAccessibility();
  }
})();
