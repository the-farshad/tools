(function () {
  const swatch = document.getElementById('swatch');
  const picker = document.getElementById('picker');
  const hexIn = document.getElementById('hex');
  const rgbOut = document.getElementById('rgb');
  const hslOut = document.getElementById('hsl');
  const hexOut = document.getElementById('hex-out');
  const palette = document.getElementById('palette');
  const statusEl = document.getElementById('status');

  const STEPS = [50,100,200,300,400,500,600,700,800,900,950];

  function setStatus(msg, isError) {
    statusEl.innerHTML = '';
    if (!msg) return;
    const div = document.createElement('div');
    div.className = 'notice' + (isError ? ' error' : '');
    div.textContent = msg;
    statusEl.appendChild(div);
    setTimeout(() => { if (statusEl.firstChild === div) statusEl.innerHTML = ''; }, 1500);
  }

  // ---------- conversions ----------

  function parseHex(s) {
    s = s.trim().replace(/^#/, '');
    if (s.length === 3) s = s.split('').map(c => c + c).join('');
    if (!/^[0-9a-f]{6}$/i.test(s)) return null;
    return [
      parseInt(s.slice(0,2), 16),
      parseInt(s.slice(2,4), 16),
      parseInt(s.slice(4,6), 16),
    ];
  }
  function rgbToHex([r,g,b]) {
    return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
  }
  function rgbToHsl([r,g,b]) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }
  function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function buildPalette([r,g,b]) {
    const [h,s] = rgbToHsl([r,g,b]);
    palette.innerHTML = '';
    STEPS.forEach(step => {
      // map 50..950 to lightness 95..10
      const l = Math.round(95 - (step - 50) / 9);
      const rgb = hslToRgb(h, s, l);
      const hex = rgbToHex(rgb);
      const sw = document.createElement('div');
      sw.className = 'palette-step';
      sw.style.background = hex;
      sw.title = step + ' · ' + hex;
      sw.innerHTML = '<span class="pal-label">' + step + '</span>';
      sw.addEventListener('click', () => {
        navigator.clipboard.writeText(hex).then(
          () => setStatus(hex + ' copied'),
          () => setStatus(hex, false)
        );
      });
      palette.appendChild(sw);
    });
  }

  function update(rgb) {
    swatch.style.background = rgbToHex(rgb);
    picker.value = rgbToHex(rgb);
    hexIn.value = rgbToHex(rgb);
    rgbOut.value = 'rgb(' + rgb.join(', ') + ')';
    const hsl = rgbToHsl(rgb);
    hslOut.value = 'hsl(' + hsl[0] + ', ' + hsl[1] + '%, ' + hsl[2] + '%)';
    hexOut.value = rgbToHex(rgb);
    buildPalette(rgb);
  }

  picker.addEventListener('input', () => {
    const rgb = parseHex(picker.value);
    if (rgb) update(rgb);
  });
  hexIn.addEventListener('input', () => {
    const rgb = parseHex(hexIn.value);
    if (rgb) update(rgb);
  });

  document.querySelectorAll('button[data-copy]').forEach(b => {
    b.addEventListener('click', () => {
      const v = document.getElementById(b.dataset.copy).value;
      navigator.clipboard.writeText(v).then(
        () => setStatus(v + ' copied'),
        () => setStatus('Copy failed', true)
      );
    });
  });

  update(parseHex('#fdc114'));
})();
