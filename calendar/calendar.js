(function () {
  // ---------- Persian (Jalali) calendar — for Central Kurdish (Rojhilat) ----------
  // Use built-in Intl ICU for accuracy.
  const KURD_YEAR_OFFSET = 1321; // Kurdish year ≈ Persian year + 1321

  const persianFmt = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', {
    year: 'numeric', month: 'numeric', day: 'numeric',
  });

  function gregToPersian(gy, gm, gd) {
    const date = new Date(Date.UTC(gy, gm - 1, gd, 12)); // noon UTC to avoid DST edges
    const parts = persianFmt.formatToParts(date);
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
    { m: 1,  d: 22, name: 'Republic of Mahabad', sub: 'Founding (1946)' },
    { m: 2,  d: 21, name: 'Mother Language Day', sub: 'International, marked widely in Kurdish communities' },
    { m: 3,  d: 16, name: 'Halabja Memorial', sub: 'Chemical attack remembrance (1988)' },
    { m: 3,  d: 21, name: 'Newroz', sub: 'Kurdish New Year' },
    { m: 4,  d: 14, name: 'Anfal Memorial', sub: 'Anfal campaign remembrance' },
    { m: 5,  d: 15, name: 'Roja Zimanê Kurdî', sub: 'Kurdish Language Day' },
    { m: 9,  d: 25, name: 'Kurdistan Independence Referendum', sub: 'Referendum anniversary (2017)' },
    { m: 12, d: 17, name: 'Kurdish Flag Day', sub: 'Adopted in Kurdistan Region (1999)' },
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

  // ---------- render ----------

  function fmtCK(p, scrip) {
    const months = scrip === 'two' ? CK_MONTHS_AR : CK_MONTHS_KURDI;
    const ky = p.y + KURD_YEAR_OFFSET;
    return p.d + ' ' + months[p.m - 1] + ' ' + ky;
  }

  function fmtCKDay(g, scrip) {
    // Week starts Saturday: index 0=Saturday
    const dowIdx = (g.getDay() + 1) % 7;
    const dow = scrip === 'two' ? CK_DOW_AR : CK_DOW_KURDI;
    return dow[dowIdx];
  }

  function renderToday() {
    const g = new Date();
    const sc = script();
    document.getElementById('g-date').textContent =
      G_MONTHS[g.getMonth()] + ' ' + g.getDate() + ', ' + g.getFullYear();
    document.getElementById('g-day').textContent = G_DOW_LONG[g.getDay()];

    const p = gregToPersian(g.getFullYear(), g.getMonth() + 1, g.getDate());
    document.getElementById('ck-date').textContent = fmtCK(p, sc);
    document.getElementById('ck-day').textContent = fmtCKDay(g, sc);

    document.getElementById('nk-date').textContent =
      g.getDate() + 'î ' + NK_MONTHS[g.getMonth()] + 'a ' + g.getFullYear() + 'ê';
    document.getElementById('nk-day').textContent = NK_DOW[g.getDay()];
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

      const name = document.createElement('span');
      name.className = 'cal-day-name';
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
    });
  });

  renderAll();
})();
