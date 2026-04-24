(function () {
  const patternEl = document.getElementById('pattern');
  const flagsEl = document.getElementById('flags');
  const sampleEl = document.getElementById('sample');
  const previewEl = document.getElementById('preview');
  const matchesEl = document.getElementById('matches');
  const countEl = document.getElementById('match-count');
  const statusEl = document.getElementById('status');

  function escHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function setStatus(msg, isError) {
    statusEl.innerHTML = '';
    if (!msg) return;
    const div = document.createElement('div');
    div.className = 'notice' + (isError ? ' error' : '');
    div.textContent = msg;
    statusEl.appendChild(div);
  }

  function update() {
    const pattern = patternEl.value;
    const flags = flagsEl.value;
    if (!pattern) {
      previewEl.textContent = sampleEl.value;
      matchesEl.innerHTML = '';
      countEl.textContent = '';
      setStatus('');
      return;
    }
    let re;
    try {
      // ensure 'g' for iteration
      const f = flags.includes('g') ? flags : flags + 'g';
      re = new RegExp(pattern, f);
      setStatus('');
    } catch (e) {
      setStatus(e.message, true);
      previewEl.textContent = sampleEl.value;
      matchesEl.innerHTML = '';
      countEl.textContent = '';
      return;
    }

    const text = sampleEl.value;
    const all = [];
    let m;
    let safety = 0;
    while ((m = re.exec(text)) !== null) {
      all.push({ match: m[0], index: m.index, groups: m.slice(1) });
      if (m[0] === '') re.lastIndex++; // avoid infinite loop on zero-width
      if (++safety > 5000) { setStatus('Stopped at 5000 matches.', true); break; }
    }

    // highlight
    let html = '', cursor = 0;
    for (const x of all) {
      html += escHtml(text.slice(cursor, x.index));
      html += '<mark class="match">' + escHtml(x.match || '') + '</mark>';
      cursor = x.index + x.match.length;
    }
    html += escHtml(text.slice(cursor));
    previewEl.innerHTML = html || '<span style="opacity:.5">(no text)</span>';

    // list
    matchesEl.innerHTML = '';
    countEl.textContent = all.length ? ('(' + all.length + ')') : '(none)';
    all.slice(0, 200).forEach((x, i) => {
      const li = document.createElement('li');
      let groupsHtml = '';
      if (x.groups.length) {
        groupsHtml = '<span class="match-groups">groups: [' +
          x.groups.map((g, gi) => (gi + 1) + '=' + (g == null ? 'undefined' : escHtml(JSON.stringify(g)))).join(', ') +
          ']</span>';
      }
      li.innerHTML = '<span class="match-text">' + escHtml(x.match || '(empty)') + '</span>' +
                     '<span class="match-meta">@' + x.index + '</span>' + groupsHtml;
      matchesEl.appendChild(li);
    });
    if (all.length > 200) {
      const li = document.createElement('li');
      li.style.opacity = '0.7';
      li.textContent = '... ' + (all.length - 200) + ' more';
      matchesEl.appendChild(li);
    }
  }

  patternEl.addEventListener('input', update);
  flagsEl.addEventListener('input', update);
  sampleEl.addEventListener('input', update);

  update();
})();
