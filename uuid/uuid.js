(function () {
  const versionEl = document.getElementById('version');
  const countEl = document.getElementById('count');
  const caseEl = document.getElementById('case');
  const output = document.getElementById('output');
  const statusEl = document.getElementById('status');

  function setStatus(msg, isError) {
    statusEl.innerHTML = '';
    if (!msg) return;
    const div = document.createElement('div');
    div.className = 'notice' + (isError ? ' error' : '');
    div.textContent = msg;
    statusEl.appendChild(div);
  }

  function bytesToHex(b, sep) {
    return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join(sep || '');
  }

  function uuidV4() {
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = bytesToHex(b);
    return h.slice(0,8) + '-' + h.slice(8,12) + '-' + h.slice(12,16) + '-' + h.slice(16,20) + '-' + h.slice(20);
  }

  function uuidV7() {
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    const ms = Date.now();
    // 48-bit unix ms timestamp into bytes 0-5
    b[0] = (ms / 2 ** 40) & 0xff;
    b[1] = (ms / 2 ** 32) & 0xff;
    b[2] = (ms >>> 24) & 0xff;
    b[3] = (ms >>> 16) & 0xff;
    b[4] = (ms >>> 8) & 0xff;
    b[5] = ms & 0xff;
    // version 7 in byte 6 high nibble
    b[6] = (b[6] & 0x0f) | 0x70;
    // variant in byte 8
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = bytesToHex(b);
    return h.slice(0,8) + '-' + h.slice(8,12) + '-' + h.slice(12,16) + '-' + h.slice(16,20) + '-' + h.slice(20);
  }

  function generate() {
    const n = Math.max(1, Math.min(500, parseInt(countEl.value, 10) || 1));
    const v = versionEl.value;
    const out = [];
    for (let i = 0; i < n; i++) out.push(v === '7' ? uuidV7() : uuidV4());
    let text = out.join('\n');
    if (caseEl.value === 'upper') text = text.toUpperCase();
    output.textContent = text;
    setStatus('Generated ' + n + ' UUID' + (n === 1 ? '' : 's') + '.');
  }

  document.getElementById('generate').addEventListener('click', generate);
  document.getElementById('copy').addEventListener('click', () => {
    if (!output.textContent.trim()) { setStatus('Nothing to copy.', true); return; }
    navigator.clipboard.writeText(output.textContent).then(
      () => setStatus('Copied to clipboard.'),
      () => setStatus('Copy failed.', true)
    );
  });

  generate();
})();
