(function () {
  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const urlsafe = document.getElementById('urlsafe');
  const status = document.getElementById('status');

  function setStatus(msg, isError) {
    status.innerHTML = '';
    if (!msg) return;
    const div = document.createElement('div');
    div.className = 'notice' + (isError ? ' error' : '');
    div.textContent = msg;
    status.appendChild(div);
  }

  // UTF-8 safe encode/decode using TextEncoder/TextDecoder
  function utf8ToBytes(s) { return new TextEncoder().encode(s); }
  function bytesToUtf8(b) { return new TextDecoder('utf-8', { fatal: true }).decode(b); }

  function bytesToBase64(bytes) {
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function base64ToBytes(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function toUrlSafe(s) {
    return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function fromUrlSafe(s) {
    let r = s.replace(/-/g, '+').replace(/_/g, '/');
    while (r.length % 4) r += '=';
    return r;
  }

  document.getElementById('encode').addEventListener('click', () => {
    try {
      const src = input.value;
      if (!src) throw new Error('Input is empty.');
      let b64 = bytesToBase64(utf8ToBytes(src));
      if (urlsafe.checked) b64 = toUrlSafe(b64);
      output.textContent = b64;
      setStatus('Encoded ' + src.length + ' chars.');
    } catch (e) {
      setStatus(e.message, true);
      output.textContent = '';
    }
  });

  document.getElementById('decode').addEventListener('click', () => {
    try {
      let src = input.value.trim();
      if (!src) throw new Error('Input is empty.');
      if (urlsafe.checked) src = fromUrlSafe(src);
      // remove any whitespace inside
      src = src.replace(/\s+/g, '');
      const bytes = base64ToBytes(src);
      let text;
      try {
        text = bytesToUtf8(bytes);
      } catch {
        // fall back to raw byte hex if not valid UTF-8
        text = '<' + bytes.length + ' bytes — not valid UTF-8 — hex: ' +
               Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ') + '>';
      }
      output.textContent = text;
      setStatus('Decoded.');
    } catch (e) {
      setStatus('Decode failed: ' + e.message, true);
      output.textContent = '';
    }
  });

  document.getElementById('copy').addEventListener('click', () => {
    const text = output.textContent || '';
    if (!text.trim()) { setStatus('Nothing to copy.', true); return; }
    navigator.clipboard.writeText(text).then(
      () => setStatus('Copied to clipboard.'),
      () => setStatus('Copy failed (clipboard unavailable).', true)
    );
  });

  document.getElementById('swap').addEventListener('click', () => {
    const out = output.textContent || '';
    if (!out.trim()) { setStatus('Nothing to swap.', true); return; }
    input.value = out;
    output.textContent = '';
    setStatus('Output moved to input.');
  });

  document.getElementById('clear').addEventListener('click', () => {
    input.value = '';
    output.textContent = '';
    setStatus('');
  });
})();
