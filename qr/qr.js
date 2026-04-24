(function () {
  const textEl = document.getElementById('text');
  const eccEl = document.getElementById('ecc');
  const sizeEl = document.getElementById('size');
  const out = document.getElementById('qr-out');
  const statusEl = document.getElementById('status');

  function setStatus(msg, isError) {
    statusEl.innerHTML = '';
    if (!msg) return;
    const div = document.createElement('div');
    div.className = 'notice' + (isError ? ' error' : '');
    div.textContent = msg;
    statusEl.appendChild(div);
  }

  function makeSvg(text, ecc, displaySize) {
    if (!window.qrcode) return null;
    // typeNumber=0 lets the lib pick the smallest fit
    const qr = window.qrcode(0, ecc);
    qr.addData(text);
    qr.make();
    const moduleCount = qr.getModuleCount();
    const cell = displaySize / moduleCount;
    const parts = [];
    parts.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + moduleCount + ' ' + moduleCount + '" width="' + displaySize + '" height="' + displaySize + '" shape-rendering="crispEdges">');
    parts.push('<rect width="100%" height="100%" fill="#ffffff"/>');
    for (let r = 0; r < moduleCount; r++) {
      let runStart = -1;
      for (let c = 0; c < moduleCount; c++) {
        const dark = qr.isDark(r, c);
        if (dark && runStart < 0) runStart = c;
        if ((!dark || c === moduleCount - 1) && runStart >= 0) {
          const w = (dark ? c - runStart + 1 : c - runStart);
          parts.push('<rect x="' + runStart + '" y="' + r + '" width="' + w + '" height="1" fill="#000000"/>');
          runStart = -1;
        }
      }
    }
    parts.push('</svg>');
    return parts.join('');
  }

  function update() {
    const text = textEl.value;
    if (!text.trim()) {
      out.innerHTML = '<div style="opacity:.6;padding:40px;text-align:center">Enter text above to generate a QR code</div>';
      return;
    }
    try {
      const svg = makeSvg(text, eccEl.value, parseInt(sizeEl.value, 10));
      if (!svg) { setStatus('QR library not loaded.', true); return; }
      out.innerHTML = svg;
      setStatus('');
    } catch (e) {
      out.innerHTML = '';
      setStatus('Could not generate: ' + e.message, true);
    }
  }

  function download(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  document.getElementById('download-svg').addEventListener('click', () => {
    const svg = out.querySelector('svg');
    if (!svg) { setStatus('Nothing to download.', true); return; }
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml;charset=utf-8' });
    download('qrcode.svg', blob);
  });

  document.getElementById('download-png').addEventListener('click', () => {
    const svg = out.querySelector('svg');
    if (!svg) { setStatus('Nothing to download.', true); return; }
    const size = parseInt(sizeEl.value, 10) * 2; // 2x for crisp PNG
    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob(b => { if (b) download('qrcode.png', b); }, 'image/png');
    };
    img.onerror = () => setStatus('Failed to render PNG.', true);
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)));
  });

  textEl.addEventListener('input', update);
  eccEl.addEventListener('change', update);
  sizeEl.addEventListener('change', update);

  // wait for library to load if needed
  if (window.qrcode) update();
  else {
    let tries = 0;
    const iv = setInterval(() => {
      if (window.qrcode || ++tries > 30) {
        clearInterval(iv);
        if (window.qrcode) update();
        else setStatus('QR library failed to load (network blocked?)', true);
      }
    }, 100);
  }
})();
