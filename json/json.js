(function () {
  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const indentSel = document.getElementById('indent');
  const sortSel = document.getElementById('sort-keys');
  const status = document.getElementById('status');

  function setStatus(msg, isError) {
    status.innerHTML = '';
    if (!msg) return;
    const div = document.createElement('div');
    div.className = 'notice' + (isError ? ' error' : '');
    div.textContent = msg;
    status.appendChild(div);
  }

  function indentValue() {
    const v = indentSel.value;
    if (v === '\\t') return '\t';
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 2;
  }

  function sortKeys(value) {
    if (Array.isArray(value)) return value.map(sortKeys);
    if (value && typeof value === 'object') {
      const out = {};
      Object.keys(value).sort().forEach(k => { out[k] = sortKeys(value[k]); });
      return out;
    }
    return value;
  }

  function parseInput() {
    const src = input.value.trim();
    if (!src) throw new Error('Input is empty.');
    return JSON.parse(src);
  }

  function formatLine(err) {
    // V8 / Firefox tend to include "position N"; surface that.
    const m = err.message.match(/position\s+(\d+)/i);
    if (!m) return err.message;
    const pos = parseInt(m[1], 10);
    const before = input.value.slice(0, pos);
    const line = before.split(/\r?\n/).length;
    const col = pos - (before.lastIndexOf('\n') + 1) + 1;
    return err.message + ' (line ' + line + ', col ' + col + ')';
  }

  document.getElementById('format').addEventListener('click', () => {
    try {
      let v = parseInput();
      if (sortSel.value === '1') v = sortKeys(v);
      output.textContent = JSON.stringify(v, null, indentValue());
      setStatus('Valid JSON.');
    } catch (e) {
      setStatus(formatLine(e), true);
      output.textContent = '';
    }
  });

  document.getElementById('minify').addEventListener('click', () => {
    try {
      let v = parseInput();
      if (sortSel.value === '1') v = sortKeys(v);
      output.textContent = JSON.stringify(v);
      setStatus('Minified.');
    } catch (e) {
      setStatus(formatLine(e), true);
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
