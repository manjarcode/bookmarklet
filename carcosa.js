    (function() {
      const style = document.createElement('style');
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
        }
      `;
      document.head.appendChild(style);

      function rgbToHex(rgb) {
        const result = rgb.match(/\d+(\.\d+)?/g).map(Number);
        if (result.length < 3) return "#000000";
        const [r, g, b, a] = result;
        const hex = n => n.toString(16).padStart(2, "0");
        let hexColor = `#${hex(r)}${hex(g)}${hex(b)}`;
        if (a !== undefined && a < 1) {
          hexColor += hex(Math.round(a * 255));
        }
        return hexColor.toLowerCase();
      }

      function isYellow(hex) {
        if (hex === "#000000" || hex === "#ffffff") return false;
        return /^#ffff[0-9a-f]{2}$/.test(hex);
      }

      function isElementVisible(el) {
        return el.offsetParent && el.textContent.trim()
      }

      function mostrarColoresFiltrados() {
        const elementos = document.body.querySelectorAll("*");

        elementos.forEach(el => {
          if (!isElementVisible) return;
          const style = window.getComputedStyle(el);
          const color = style.color;
          const bgColor = style.backgroundColor;
   
          const colorHex = rgbToHex(color);
          const bgHex = rgbToHex(bgColor);

          const colorValido = isYellow(colorHex);
          const bgValido = bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent" && isYellow(bgHex);

          if (colorValido || bgValido) {
            appendLabel(el, colorValido, colorHex, bgValido, bgHex)
          }
        });          

        function appendLabel(el, colorValido, colorHex, bgValido, bgHex) {
          let labelText = [];
            if (colorValido) labelText.push(`color: ${colorHex}`);
            if (bgValido) labelText.push(`background: ${bgHex}`);

            const rect = el.getBoundingClientRect();
            const label = document.createElement('div');
            label.className = 'color-label';
            label.textContent = labelText.join(" | ");
            label.style.top = `${window.scrollY + rect.top - 20}px`;
            label.style.left = `${window.scrollX + rect.left}px`;

            // Asociar el label con su elemento original
            label.dataset.targetId = Math.random().toString(36).substring(2);
            el.dataset.colorLabelTarget = label.dataset.targetId;

            label.addEventListener('mouseover', () => {
              if (colorValido) {
                el.dataset.originalColor = el.style.color;
                el.style.color = "pink";
              }
              if (bgValido) {
                el.dataset.originalBg = el.style.backgroundColor;
                el.style.backgroundColor = "pink";
              }
            });

            label.addEventListener('mouseout', () => {
              if (el.dataset.originalColor !== undefined) {
                el.style.color = el.dataset.originalColor;
                delete el.dataset.originalColor;
              }
              if (el.dataset.originalBg !== undefined) {
                el.style.backgroundColor = el.dataset.originalBg;
                delete el.dataset.originalBg;
              }
            });
            document.body.appendChild(label);
          }
        }

        mostrarColoresFiltrados();
      })();