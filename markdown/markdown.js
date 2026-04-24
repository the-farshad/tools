(function () {
  const input = document.getElementById('md-in');
  const output = document.getElementById('md-out');
  const statusEl = document.getElementById('status');

  function setStatus(msg, isError) {
    statusEl.innerHTML = '';
    if (!msg) return;
    const div = document.createElement('div');
    div.className = 'notice' + (isError ? ' error' : '');
    div.textContent = msg;
    statusEl.appendChild(div);
    setTimeout(() => { if (statusEl.firstChild === div) statusEl.innerHTML = ''; }, 1500);
  }

  function update() {
    if (!window.marked) {
      output.innerHTML = '<em>Loading marked.js...</em>';
      return;
    }
    try {
      output.innerHTML = window.marked.parse(input.value || '');
    } catch (e) {
      output.innerHTML = '<div class="notice error">' + e.message + '</div>';
    }
  }

  input.addEventListener('input', update);

  document.getElementById('copy-html').addEventListener('click', () => {
    if (!output.innerHTML.trim()) { setStatus('Nothing to copy.', true); return; }
    navigator.clipboard.writeText(output.innerHTML).then(
      () => setStatus('HTML copied to clipboard.'),
      () => setStatus('Copy failed.', true)
    );
  });

  document.getElementById('download-md').addEventListener('click', () => {
    const blob = new Blob([input.value || ''], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'document.md';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  document.getElementById('clear').addEventListener('click', () => {
    input.value = '';
    update();
  });

  if (window.marked) update();
  else {
    let tries = 0;
    const iv = setInterval(() => {
      if (window.marked || ++tries > 30) {
        clearInterval(iv);
        update();
      }
    }, 100);
  }
})();
