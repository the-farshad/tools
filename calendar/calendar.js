(function () {
  // ---------- Jalali (Solar Hijri) calendar — used for Central Kurdish months ----------
  // Note: the ICU identifier is "persian" — that string is fixed by the standard
  // and we can't rename it; conceptually we treat it as the Jalali calendar.
  const KURD_YEAR_OFFSET = 1321; // Kurdish year ≈ Jalali year + 1321

  const jalaliFmt = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', {
    year: 'numeric', month: 'numeric', day: 'numeric',
  });

  function gregToJalali(gy, gm, gd) {
    const date = new Date(Date.UTC(gy, gm - 1, gd, 12)); // noon UTC to avoid DST edges
    const parts = jalaliFmt.formatToParts(date);
    const get = type => parseInt(parts.find(p => p.type === type).value, 10);
    return { y: get('year'), m: get('month'), d: get('day') };
  }

  function jalaliToGreg(jy, jm, jd) {
    // Find Gregorian date for Newroz of year jy (March 19-22 of jy+621)
    let newroz = null;
    for (let off = -2; off <= 3; off++) {
      const d = new Date(jy + 621, 2, 21 + off);
      const j = gregToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
      if (j.y === jy && j.m === 1 && j.d === 1) { newroz = d; break; }
    }
    if (!newroz) newroz = new Date(jy + 621, 2, 21);
    const monthOffsets = [0, 31, 62, 93, 124, 155, 186, 216, 246, 276, 306, 336];
    const days = monthOffsets[jm - 1] + (jd - 1);
    const out = new Date(newroz);
    out.setDate(out.getDate() + days);
    return out;
  }

  // ---------- Names ----------

  // Central Kurdish — Solar Hijri months, Kurdish names (per Wikipedia "Kurdish calendars")
  const CK_MONTHS_KURDI = [
    'Xakelêwe', 'Gulan', 'Cozerdan', 'Pûşper',
    'Gelawêj', 'Xermanan', 'Rezber', 'Gelarêzan',
    'Sermawez', 'Befranbar', 'Rêbendan', 'Reşeme',
  ];
  const CK_MONTHS_AR = [
    'خاکەلێوە', 'گوڵان', 'جۆزەردان', 'پووشپەڕ',
    'گەلاوێژ', 'خەرمانان', 'ڕەزبەر', 'گەڵاڕێزان',
    'سەرماوەز', 'بەفرانبار', 'ڕێبەندان', 'ڕەشەمە',
  ];
  // Days of the week, week starts Saturday; index 0=Saturday
  const CK_DOW_KURDI = ['Şemme', 'Yekşemme', 'Duşemme', 'Sêşemme', 'Çarşemme', 'Pêncşemme', 'Heyni'];
  const CK_DOW_AR    = ['شەممە', 'یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی'];

  // Northern Kurdish — Gregorian months, common Kurmanji names (per Wikipedia)
  const NK_MONTHS = [
    'Çile', 'Sibat', 'Adar', 'Nîsan', 'Gulan', 'Hezîran',
    'Tîrmeh', 'Tebax', 'Îlon', 'Cotmeh', 'Mijdar', 'Berfanbar',
  ];
  // Days of week, Sunday-first to match JS Date.getDay()
  const NK_DOW = ['Yekşem', 'Duşem', 'Sêşem', 'Çarşem', 'Pêncşem', 'În', 'Şemî'];

  const G_DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const G_DOW_LONG = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const G_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  // ---------- Important days (Gregorian fixed dates, with month, day) ----------
  // kind: 'civic' (national days, memorials) or 'figure' (poets, writers, leaders)
  const EVENTS = [
    // Civic / memorial
    { m: 1,  d: 22, name: 'Republic of Mahabad', sub: 'Founding (1946)', slug: 'mahabad', kind: 'civic' },
    { m: 2,  d: 21, name: 'Mother Language Day', sub: 'International', slug: 'mother-language', kind: 'civic' },
    { m: 3,  d: 16, name: 'Halabja Memorial', sub: 'Chemical attack remembrance (1988)', slug: 'halabja', kind: 'civic' },
    { m: 3,  d: 21, name: 'Newroz', sub: 'Kurdish New Year', slug: 'newroz', kind: 'civic' },
    { m: 4,  d: 14, name: 'Anfal Memorial', sub: 'Anfal campaign remembrance', slug: 'anfal', kind: 'civic' },
    { m: 5,  d: 15, name: 'Roja Zimanê Kurdî', sub: 'Kurdish Language Day', slug: 'kurdish-language', kind: 'civic' },
    { m: 7,  d: 19, name: 'Rojava Revolution', sub: 'Anniversary (2012)', slug: null, kind: 'civic' },
    { m: 8,  d: 3,  name: 'Yezîdî Genocide Memorial', sub: 'Sinjar attack remembrance (2014)', slug: null, kind: 'civic' },
    { m: 9,  d: 25, name: 'Kurdistan Independence Referendum', sub: '2017', slug: 'referendum', kind: 'civic' },
    { m: 12, d: 17, name: 'Kurdish Flag Day', sub: 'Adopted in Kurdistan Region (1999)', slug: 'flag-day', kind: 'civic' },

    // Cultural figures (birth ★ / death ✦)
    { m: 1,  d: 1,  name: 'Mehmed Uzun ★', sub: 'Kurdish novelist (b. 1953, d. 2007)', slug: null, kind: 'figure' },
    { m: 5,  d: 2,  name: 'Şêrko Bêkes ★', sub: 'Sorani poet (b. 1940, d. 2013)', slug: null, kind: 'figure' },
    { m: 8,  d: 4,  name: 'Şêrko Bêkes ✦', sub: 'Death anniversary (2013)', slug: null, kind: 'figure' },
    { m: 10, d: 6,  name: 'Yaşar Kemal ★', sub: 'Kurdish-Turkish novelist (b. 1923, d. 2015)', slug: null, kind: 'figure' },
    { m: 10, d: 22, name: 'Cegerxwîn ✦', sub: 'Kurdish poet (b. 1903, d. 1984)', slug: null, kind: 'figure' },
    { m: 11, d: 18, name: 'Ehmedê Xanî ★', sub: 'Author of Mem û Zîn (b. ~1651, d. 1707) — date approximate', slug: null, kind: 'figure' },
  ];

  // ---------- helpers ----------

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function isToday(g, t) {
    return g.getFullYear() === t.getFullYear() &&
           g.getMonth() === t.getMonth() &&
           g.getDate() === t.getDate();
  }
  function eventOn(m, d) { return EVENTS.find(e => e.m === m && e.d === d); }

  function daysUntil(targetMonth, targetDay) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let target = new Date(today.getFullYear(), targetMonth - 1, targetDay);
    if (target < today) target = new Date(today.getFullYear() + 1, targetMonth - 1, targetDay);
    return Math.round((target - today) / 86400000);
  }

  function script() {
    return document.documentElement.getAttribute('data-kurd-script') || 'one';
  }

  // Render digits as Arabic-Indic when the second-script mode is active
  const AR_DIGITS = { '0':'٠','1':'١','2':'٢','3':'٣','4':'٤','5':'٥','6':'٦','7':'٧','8':'٨','9':'٩' };
  function digits(n, scrip) {
    const s = String(n);
    return scrip === 'two' ? s.replace(/\d/g, d => AR_DIGITS[d]) : s;
  }

  // ---------- render ----------

  function fmtCK(p, scrip) {
    const months = scrip === 'two' ? CK_MONTHS_AR : CK_MONTHS_KURDI;
    const ky = p.y + KURD_YEAR_OFFSET;
    return digits(p.d, scrip) + ' ' + months[p.m - 1] + ' ' + digits(ky, scrip);
  }

  function fmtCKDay(g, scrip) {
    // Week starts Saturday: index 0=Saturday
    const dowIdx = (g.getDay() + 1) % 7;
    const dow = scrip === 'two' ? CK_DOW_AR : CK_DOW_KURDI;
    return dow[dowIdx];
  }

  function fmtNK(g) {
    return g.getDate() + 'î ' + NK_MONTHS[g.getMonth()] + 'a ' + g.getFullYear() + 'ê';
  }

  function renderToday() {
    const g = new Date();
    const sc = script();
    document.getElementById('g-date').textContent =
      G_MONTHS[g.getMonth()] + ' ' + g.getDate() + ', ' + g.getFullYear();
    document.getElementById('g-day').textContent = G_DOW_LONG[g.getDay()];

    const p = gregToJalali(g.getFullYear(), g.getMonth() + 1, g.getDate());
    document.getElementById('ck-date').textContent = fmtCK(p, sc);
    document.getElementById('ck-day').textContent = fmtCKDay(g, sc);

    document.getElementById('nk-date').textContent = fmtNK(g);
    document.getElementById('nk-day').textContent = NK_DOW[g.getDay()];
  }

  // ---------- converter ----------

  let convDir = 'g2k';

  function renderConverterG2K(dateStr) {
    const sc = script();
    const gEl = document.getElementById('conv-g');
    const ckEl = document.getElementById('conv-ck');
    const nkEl = document.getElementById('conv-nk');
    if (!dateStr) { gEl.textContent = nkEl.textContent = '—'; ckEl.textContent = '—'; return; }
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) { gEl.textContent = nkEl.textContent = '—'; ckEl.textContent = '—'; return; }
    const g = new Date(y, m - 1, d);
    const p = gregToJalali(y, m, d);
    gEl.textContent = G_MONTHS[m - 1] + ' ' + d + ', ' + y + '  ·  ' + G_DOW_LONG[g.getDay()];
    ckEl.textContent = fmtCK(p, sc) + '  ·  ' + fmtCKDay(g, sc);
    nkEl.textContent = fmtNK(g) + '  ·  ' + NK_DOW[g.getDay()];
  }

  function renderConverterK2G() {
    const sc = script();
    const jy = parseInt(document.getElementById('conv-jy').value, 10);
    const jm = parseInt(document.getElementById('conv-jm').value, 10);
    const jd = parseInt(document.getElementById('conv-jd').value, 10);
    const gEl = document.getElementById('conv-g');
    const ckEl = document.getElementById('conv-ck');
    const nkEl = document.getElementById('conv-nk');
    if (!jy || !jm || !jd) { gEl.textContent = nkEl.textContent = '—'; ckEl.textContent = '—'; return; }
    const g = jalaliToGreg(jy, jm, jd);
    gEl.textContent = G_MONTHS[g.getMonth()] + ' ' + g.getDate() + ', ' + g.getFullYear() + '  ·  ' + G_DOW_LONG[g.getDay()];
    ckEl.textContent = fmtCK({ y: jy, m: jm, d: jd }, sc) + '  ·  ' + fmtCKDay(g, sc);
    nkEl.textContent = fmtNK(g) + '  ·  ' + NK_DOW[g.getDay()];
  }

  function renderConverter() {
    if (convDir === 'k2g') renderConverterK2G();
    else renderConverterG2K(document.getElementById('conv-input').value);
  }

  // ---------- Poems (curated; short excerpts only, sources cited) ----------
  // Note: vejin.net does not publish a public API. This is a small starter set
  // of widely-quoted lines. Send corrections via the GitHub repo.
  const POEMS = [
    {
      orig: "Ger dê hebûya me jî îtîfaq,\nVêkra bikira me inqiyad û itaq.",
      trans: "If only we had unity among us,\nwe would together break our chains.",
      attr: "Ehmedê Xanî — Mem û Zîn (1692)",
    },
    {
      orig: "Ji ber serma û baranê namîne kuro,\nev gulên berfê ji baxçe ranabin.",
      trans: "The cold and rain cannot keep them down, my child;\nthese snowflakes will not give up the garden.",
      attr: "Folk verse",
    },
    {
      orig: "Ez dixwazim ku biçim, lê na, ne wisa.\nDilê min hîn jî li vir e.",
      trans: "I want to leave, but no, not like this.\nMy heart is still here.",
      attr: "Cegerxwîn (1903–1984), excerpt",
    },
    {
      orig: "خۆزگە دەمێک بمەینەوە لە کوردستان،\nهەناسەی شاخەکانی هەڵبدەم.",
      trans: "I wish I could stay a while in Kurdistan,\nand breathe in the breath of its mountains.",
      attr: "Şêrko Bêkes (1940–2013), excerpt",
    },
    {
      orig: "Bila bêhna gulan,\nbêhna axa welêt be.",
      trans: "Let the scent of roses\nbe the scent of the homeland's earth.",
      attr: "Anonymous, often attributed to Cegerxwîn",
    },
  ];

  function renderPoem() {
    const p = POEMS[Math.floor(Math.random() * POEMS.length)];
    const orig = document.getElementById('poem-orig');
    const trans = document.getElementById('poem-trans');
    const attr = document.getElementById('poem-attr');
    orig.textContent = p.orig;
    trans.textContent = p.trans;
    attr.textContent = '— ' + p.attr;
  }

  // ---------- ICS export ----------

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  function exportIcs() {
    const year = new Date().getFullYear();
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//thefarshad//kurdish-calendar//EN',
      'CALSCALE:GREGORIAN',
    ];
    EVENTS.forEach(e => {
      const dt = year + pad2(e.m) + pad2(e.d);
      const next = new Date(year, e.m - 1, e.d + 1);
      const dtEnd = next.getFullYear() + pad2(next.getMonth() + 1) + pad2(next.getDate());
      lines.push('BEGIN:VEVENT');
      lines.push('UID:' + dt + '-' + e.name.replace(/[^a-z0-9]/gi, '').toLowerCase() + '@thefarshad.com');
      lines.push('DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''));
      lines.push('DTSTART;VALUE=DATE:' + dt);
      lines.push('DTEND;VALUE=DATE:' + dtEnd);
      lines.push('SUMMARY:' + e.name);
      lines.push('DESCRIPTION:' + e.sub);
      lines.push('RRULE:FREQ=YEARLY');
      lines.push('END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'kurdish-important-days.ics';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function renderNewroz() {
    const days = daysUntil(3, 21);
    const banner = document.getElementById('newroz');
    banner.hidden = false;
    if (days === 0) {
      banner.querySelector('.cal-newroz-text').innerHTML =
        '<strong>Newroz piroz be!</strong> Today is the Kurdish New Year.';
      return;
    }
    const target = new Date();
    target.setMonth(2, 21);
    if (target < new Date()) target.setFullYear(target.getFullYear() + 1);
    document.getElementById('newroz-days').textContent = days;
    document.getElementById('newroz-date').textContent =
      '(' + G_MONTHS[2] + ' 21, ' + target.getFullYear() + ')';
  }

  // ---------- month grid ----------

  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(1);

  function renderMonth() {
    const g = new Date();
    g.setHours(0, 0, 0, 0);
    const y = cursor.getFullYear();
    const m = cursor.getMonth(); // 0-indexed
    document.getElementById('month-title').textContent =
      G_MONTHS[m] + ' ' + y +
      '  ·  ' + NK_MONTHS[m] +
      '  ·  ~' + (CK_MONTHS_KURDI[Math.max(0, m - 2)] || CK_MONTHS_KURDI[0]);

    const grid = document.getElementById('month-grid');
    grid.innerHTML = '';
    G_DOW.forEach(d => {
      const el = document.createElement('div');
      el.className = 'cal-dow';
      el.textContent = d;
      grid.appendChild(el);
    });

    const firstDow = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    for (let i = 0; i < firstDow; i++) {
      const el = document.createElement('div');
      el.className = 'cal-cell empty';
      grid.appendChild(el);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'cal-cell cal-cell-btn';
      const date = new Date(y, m, d);
      const ev = eventOn(m + 1, d);
      if (isToday(date, g)) el.classList.add('today');
      if (ev) {
        el.classList.add('has-event');
        el.title = ev.name + ' — ' + ev.sub;
      }
      // Jalali day for the corner badge
      const jal = gregToJalali(y, m + 1, d);
      el.innerHTML =
        '<span class="cal-num-greg">' + d + '</span>' +
        '<span class="cal-num-ku">' + arDigits(jal.d) + '</span>';
      if (ev) {
        const dot = document.createElement('span');
        dot.className = 'cal-dot';
        el.appendChild(dot);
      }
      const iso = y + '-' + (m + 1).toString().padStart(2, '0') + '-' + d.toString().padStart(2, '0');
      el.dataset.iso = iso;
      el.addEventListener('click', () => selectDay(iso, ev));
      grid.appendChild(el);
    }
  }

  function arDigits(n) {
    const m = { '0':'٠','1':'١','2':'٢','3':'٣','4':'٤','5':'٥','6':'٦','7':'٧','8':'٨','9':'٩' };
    return String(n).replace(/\d/g, d => m[d]);
  }

  function selectDay(iso, ev) {
    // Switch converter to Greg→Kurdish, fill input, render
    convDir = 'g2k';
    document.querySelectorAll('.seg[data-control="conv-dir"] button').forEach(b =>
      b.classList.toggle('active', b.dataset.value === 'g2k'));
    document.getElementById('conv-mode-g2k').hidden = false;
    document.getElementById('conv-mode-k2g').hidden = true;
    document.getElementById('conv-input').value = iso;
    renderConverter();
    document.querySelector('.cal-converter').scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (ev && ev.slug) {
      // optional: also offer event link via toast or row — kept simple
    }
  }

  function renderEvents() {
    const list = document.getElementById('days-list');
    list.innerHTML = '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // sort by upcoming
    const upcoming = EVENTS.map(e => {
      const d = daysUntil(e.m, e.d);
      return { ...e, daysAway: d };
    }).sort((a, b) => a.daysAway - b.daysAway);

    upcoming.forEach(e => {
      const li = document.createElement('li');
      const when = document.createElement('span');
      when.className = 'cal-day-when';
      if (e.daysAway === 0) { when.textContent = 'today'; when.classList.add('upcoming'); }
      else if (e.daysAway === 1) { when.textContent = 'tomorrow'; when.classList.add('upcoming'); }
      else if (e.daysAway <= 30) { when.textContent = 'in ' + e.daysAway + ' days'; when.classList.add('upcoming'); }
      else when.textContent = G_MONTHS[e.m - 1].slice(0, 3) + ' ' + e.d;

      const name = document.createElement(e.slug ? 'a' : 'span');
      name.className = 'cal-day-name';
      if (e.slug) name.href = './days/' + e.slug + '.html';
      name.innerHTML = e.name + '<span class="cal-day-sub">' + e.sub + '</span>';

      li.appendChild(when);
      li.appendChild(name);
      list.appendChild(li);
    });
  }

  function renderAll() {
    renderToday();
    renderNewroz();
    renderMonth();
    renderEvents();
    renderConverter();
    renderPoem();
  }

  // ---------- nav ----------

  document.getElementById('prev-month').addEventListener('click', () => {
    cursor.setMonth(cursor.getMonth() - 1);
    renderMonth();
  });
  document.getElementById('next-month').addEventListener('click', () => {
    cursor.setMonth(cursor.getMonth() + 1);
    renderMonth();
  });
  document.getElementById('today-btn').addEventListener('click', () => {
    cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    cursor.setDate(1);
    renderMonth();
  });

  // script toggle (in addition to theme.js generic handler)
  document.querySelectorAll('.seg[data-control="kurd-script"] button').forEach(b => {
    b.classList.toggle('active', b.dataset.value === script());
    b.addEventListener('click', () => {
      const v = b.dataset.value;
      document.documentElement.setAttribute('data-kurd-script', v);
      try { localStorage.setItem('kurd-script', v); } catch (e) {}
      document.querySelectorAll('.seg[data-control="kurd-script"] button').forEach(x =>
        x.classList.toggle('active', x.dataset.value === v));
      renderToday();
      renderConverter(document.getElementById('conv-input').value);
    });
  });

  // Converter
  const convInput = document.getElementById('conv-input');
  const todayIso = new Date().toISOString().slice(0, 10);
  convInput.value = todayIso;
  convInput.addEventListener('input', () => renderConverter(convInput.value));

  // ICS export
  document.getElementById('export-ics').addEventListener('click', exportIcs);

  // Converter direction toggle + Jalali pickers
  function populateJalaliPickers() {
    const today = gregToJalali(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
    const yEl = document.getElementById('conv-jy');
    const mEl = document.getElementById('conv-jm');
    const dEl = document.getElementById('conv-jd');
    yEl.innerHTML = '';
    for (let y = today.y - 5; y <= today.y + 5; y++) {
      const o = document.createElement('option');
      o.value = y; o.textContent = y + ' (Kurdî ' + (y + KURD_YEAR_OFFSET) + ')';
      if (y === today.y) o.selected = true;
      yEl.appendChild(o);
    }
    mEl.innerHTML = '';
    for (let m = 1; m <= 12; m++) {
      const o = document.createElement('option');
      o.value = m; o.textContent = m + ' — ' + CK_MONTHS_KURDI[m - 1];
      if (m === today.m) o.selected = true;
      mEl.appendChild(o);
    }
    dEl.innerHTML = '';
    for (let d = 1; d <= 31; d++) {
      const o = document.createElement('option');
      o.value = d; o.textContent = d;
      if (d === today.d) o.selected = true;
      dEl.appendChild(o);
    }
    [yEl, mEl, dEl].forEach(el => el.addEventListener('change', renderConverter));
  }
  populateJalaliPickers();

  document.querySelectorAll('.seg[data-control="conv-dir"] button').forEach(b => {
    b.addEventListener('click', () => {
      convDir = b.dataset.value;
      document.querySelectorAll('.seg[data-control="conv-dir"] button').forEach(x =>
        x.classList.toggle('active', x.dataset.value === convDir));
      document.getElementById('conv-mode-g2k').hidden = convDir !== 'g2k';
      document.getElementById('conv-mode-k2g').hidden = convDir !== 'k2g';
      renderConverter();
    });
  });

  // Poem
  document.getElementById('poem-shuffle').addEventListener('click', renderPoem);

  renderAll();
})();
