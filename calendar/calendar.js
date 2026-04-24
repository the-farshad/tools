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
  // 1-indexed month
  const EVENTS = [
    { m: 1,  d: 22, name: 'Republic of Mahabad', sub: 'Founding (1946)', slug: 'mahabad' },
    { m: 2,  d: 21, name: 'Mother Language Day', sub: 'International, marked widely in Kurdish communities', slug: 'mother-language' },
    { m: 3,  d: 16, name: 'Halabja Memorial', sub: 'Chemical attack remembrance (1988)', slug: 'halabja' },
    { m: 3,  d: 21, name: 'Newroz', sub: 'Kurdish New Year', slug: 'newroz' },
    { m: 4,  d: 14, name: 'Anfal Memorial', sub: 'Anfal campaign remembrance', slug: 'anfal' },
    { m: 5,  d: 15, name: 'Roja Zimanê Kurdî', sub: 'Kurdish Language Day', slug: 'kurdish-language' },
    { m: 9,  d: 25, name: 'Kurdistan Independence Referendum', sub: 'Referendum anniversary (2017)', slug: 'referendum' },
    { m: 12, d: 17, name: 'Kurdish Flag Day', sub: 'Adopted in Kurdistan Region (1999)', slug: 'flag-day' },
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

  function renderConverter(dateStr) {
    const sc = script();
    const ckEl = document.getElementById('conv-ck');
    const nkEl = document.getElementById('conv-nk');
    if (!dateStr) { ckEl.textContent = '—'; nkEl.textContent = '—'; return; }
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) { ckEl.textContent = '—'; nkEl.textContent = '—'; return; }
    const g = new Date(y, m - 1, d);
    const p = gregToJalali(y, m, d);
    ckEl.textContent = fmtCK(p, sc) + '  ·  ' + fmtCKDay(g, sc);
    nkEl.textContent = fmtNK(g) + '  ·  ' + NK_DOW[g.getDay()];
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
      const el = document.createElement('div');
      el.className = 'cal-cell';
      const date = new Date(y, m, d);
      const ev = eventOn(m + 1, d);
      if (isToday(date, g)) el.classList.add('today');
      if (ev) {
        el.classList.add('has-event');
        el.title = ev.name;
      }
      el.textContent = d;
      if (ev) {
        const dot = document.createElement('span');
        dot.className = 'cal-dot';
        el.appendChild(dot);
      }
      grid.appendChild(el);
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

      const name = document.createElement('a');
      name.className = 'cal-day-name';
      name.href = './days/' + e.slug + '.html';
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
    renderConverter(document.getElementById('conv-input').value);
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

  renderAll();
})();
