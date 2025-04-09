(function () {
  const style = document.createElement("style");
  style.textContent = `
    .color-label {
      position: absolute;
      background: #000;
      color: #fff;
      padding: 2px 6px;
      font-size: 11px;
      border-radius: 3px;
      z-index: 9999;
      pointer-events: auto;
      white-space: nowrap;
      font-family: monospace;
      display: none; /* Por defecto, no se muestra */
    }
  `;
  document.head.appendChild(style);

  function rgbToHex(rgb) {
    const result = rgb.match(/\d+(\.\d+)?/g).map(Number);
    if (result.length < 3) return "#000000";
    const [r, g, b, a] = result;
    const hex = (n) => n.toString(16).padStart(2, "0");
    let hexColor = `#${hex(r)}${hex(g)}${hex(b)}`;
    if (a !== undefined && a < 1) {
      hexColor += hex(Math.round(a * 255));
    }
    return hexColor.toLowerCase();
  }

  function isYellow(hex) {
    return hex !== "#000000" && hex !== "#ffffff" && /^#ffff[0-9a-f]{2}$/.test(hex);
  }

  function isElementVisible(el) {
    return el.offsetParent && el.textContent.trim();
  }

  function hasOwnText(el) {
    return Array.from(el.childNodes).some(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
    );
  }

  function applyHighlight(el, prop, value, color = "pink") {
    const originalKey = `original${prop.charAt(0).toUpperCase() + prop.slice(1)}`;
    el.dataset[originalKey] = el.style[prop];
    el.style[prop] = color;
  }

  function restoreHighlight(el, prop) {
    const originalKey = `original${prop.charAt(0).toUpperCase() + prop.slice(1)}`;
    if (el.dataset[originalKey] !== undefined) {
      el.style[prop] = el.dataset[originalKey];
      delete el.dataset[originalKey];
    }
  }

  function getBorderColors(style) {
    return [
      rgbToHex(style.borderTopColor),
      rgbToHex(style.borderRightColor),
      rgbToHex(style.borderBottomColor),
      rgbToHex(style.borderLeftColor),
    ];
  }

  function getLabelText({ colorValid, colorHex, bgValid, bgHex, borderValid, borderHexes, placeholderValid, placeholderHex }) {
    const parts = [];
    if (colorValid) parts.push(`color: ${colorHex}`);
    if (bgValid) parts.push(`background: ${bgHex}`);
    if (borderValid) {
      const unique = [...new Set(borderHexes.filter(isYellow))];
      parts.push(`border: ${unique.join(", ")}`);
    }
    if (placeholderValid) parts.push(`placeholder: ${placeholderHex}`);

    return parts.join(" | ");
  }

  function appendLabel(el, flags) {
    const label = document.createElement("div");
    const rect = el.getBoundingClientRect();

    label.className = "color-label";
    label.textContent = getLabelText(flags);
    
    const labelTop = Math.max(0, window.scrollY + rect.top - 20);
    label.style.top = `${labelTop}px`;
    label.style.left = `${window.scrollX + rect.left}px`;

    label.dataset.targetId = Math.random().toString(36).substring(2);
    el.dataset.colorLabelTarget = label.dataset.targetId;

    // Mostrar la etiqueta cuando el mouse pase por encima del elemento
    el.addEventListener("mouseover", (event) => {
      label.style.display = "block"; // Mostrar la etiqueta
      document.querySelectorAll(".color-label").forEach((l) => {
        if (l !== label) l.style.opacity = "0.1";
      });

      applyHighlight(el, "outline", null, "2px solid pink");
      if (flags.colorValid) applyHighlight(el, "color");
      if (flags.bgValid) applyHighlight(el, "backgroundColor");
      if (flags.borderValid) applyHighlight(el, "borderColor");

      // Detener la propagación del evento para que solo se active en el elemento más bajo
      event.stopPropagation();
    });

    // Ocultar la etiqueta cuando el mouse salga del elemento
    el.addEventListener("mouseout", () => {
      label.style.display = "none"; // Ocultar la etiqueta
      document.querySelectorAll(".color-label").forEach((l) => (l.style.opacity = "1"));
      ["color", "backgroundColor", "borderColor", "outline"].forEach((prop) => restoreHighlight(el, prop));
    });

    document.body.appendChild(label);
  }

  function analyzeAndRenderLabels() {
    const elements = document.body.querySelectorAll("*");
    const processed = new Set();

    elements.forEach((el) => {
      if (!isElementVisible(el)) return;

      const style = window.getComputedStyle(el);
      const colorHex = rgbToHex(style.color);
      const bgHex = rgbToHex(style.backgroundColor);
      const borderHexes = getBorderColors(style);

      const colorValid = isYellow(colorHex);
      const bgValid = style.backgroundColor !== "transparent" && isYellow(bgHex);
      const borderValid = borderHexes.some(isYellow);

      let placeholderHex = null;
      let placeholderValid = false;

      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        const placeholderStyle = window.getComputedStyle(el, '::placeholder');
        if (placeholderStyle && placeholderStyle.color) {
          placeholderHex = rgbToHex(placeholderStyle.color);
          placeholderValid = isYellow(placeholderHex);
        }
      }

      if (!(colorValid || bgValid || borderValid || placeholderValid)) return;

      appendLabel(el, {
        colorValid,
        colorHex,
        bgValid,
        bgHex,
        borderValid,
        borderHexes,
        placeholderValid,
        placeholderHex
      });
    });
  }

  analyzeAndRenderLabels();
})();
