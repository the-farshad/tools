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

  // ---------- Important days (civic / national / memorial) ----------
  const EVENTS = [
    { m: 1,  d: 22, name: 'Republic of Mahabad', sub: 'Founding (1946)', slug: 'mahabad' },
    { m: 2,  d: 21, name: 'Mother Language Day', sub: 'International', slug: 'mother-language' },
    { m: 3,  d: 16, name: 'Halabja Memorial', sub: 'Chemical attack remembrance (1988)', slug: 'halabja' },
    { m: 3,  d: 21, name: 'Newroz', sub: 'Kurdish New Year', slug: 'newroz' },
    { m: 4,  d: 14, name: 'Anfal Memorial', sub: 'Anfal campaign remembrance', slug: 'anfal' },
    { m: 5,  d: 15, name: 'Roja Zimanê Kurdî', sub: 'Kurdish Language Day', slug: 'kurdish-language' },
    { m: 7,  d: 19, name: 'Rojava Revolution', sub: 'Anniversary (2012)', slug: null },
    { m: 8,  d: 3,  name: 'Yezîdî Genocide Memorial', sub: 'Sinjar attack remembrance (2014)', slug: null },
    { m: 9,  d: 25, name: 'Kurdistan Independence Referendum', sub: '2017', slug: 'referendum' },
    { m: 12, d: 17, name: 'Kurdish Flag Day', sub: 'Adopted in Kurdistan Region (1999)', slug: 'flag-day' },
  ];

  // ---------- Figures (poets, writers, leaders, activists) ----------
  // type: 'b' (birth) or 'd' (death anniversary)
  // Dates from Wikipedia where verifiable; some are approximate (~).
  const FIGURES = [
    // January
    { m: 1, d: 1, type: 'b', name: 'Mehmed Uzun', role: 'Kurdish novelist', years: '1953—2007', bio: 'Kurmanji-language novelist whose works helped revive modern literary Kurmanji. Lived much of his life in Swedish exile.', wiki: 'https://en.wikipedia.org/wiki/Mehmed_Uzun' },
    { m: 1, d: 9, type: 'd', name: 'Sakine Cansız', role: 'Kurdish political activist', years: '1958—2013', bio: 'Co-founder of the PKK; assassinated in Paris in 2013.', wiki: 'https://en.wikipedia.org/wiki/Sakine_Cans%C4%B1z' },

    // February
    { m: 2, d: 12, type: 'b', name: 'Sakine Cansız', role: 'Kurdish political activist', years: '1958—2013', bio: 'Co-founder of the PKK and a long-time political prisoner.', wiki: 'https://en.wikipedia.org/wiki/Sakine_Cans%C4%B1z' },
    { m: 2, d: 28, type: 'd', name: 'Yaşar Kemal', role: 'Kurdish-Turkish novelist', years: '1923—2015', bio: 'Author of Memed, My Hawk; one of the great Turkish-language novelists of the 20th century, of Kurdish origin.', wiki: 'https://en.wikipedia.org/wiki/Ya%C5%9Far_Kemal' },

    // March
    { m: 3, d: 1,  type: 'd', name: 'Mustafa Barzani', role: 'Kurdish leader', years: '1903—1979', bio: 'Founding leader of the modern Kurdish national movement in Iraq; Defense Minister of the Republic of Mahabad.', wiki: 'https://en.wikipedia.org/wiki/Mustafa_Barzani' },
    { m: 3, d: 4,  type: 'd', name: 'Saladin (Selahaddînê Eyûbî)', role: 'Sultan and military leader', years: '1137—1193', bio: 'Founder of the Ayyubid dynasty; of Kurdish origin from Tikrit.', wiki: 'https://en.wikipedia.org/wiki/Saladin' },
    { m: 3, d: 14, type: 'b', name: 'Mustafa Barzani', role: 'Kurdish leader', years: '1903—1979', bio: 'Founding leader of the modern Kurdish national movement in Iraq.', wiki: 'https://en.wikipedia.org/wiki/Mustafa_Barzani' },
    { m: 3, d: 31, type: 'd', name: 'Qazi Muhammad', role: 'President of the Republic of Mahabad', years: '1893—1947', bio: 'Founder and only president of the short-lived Republic of Mahabad. Executed in 1947 in the same square where he proclaimed the republic.', wiki: 'https://en.wikipedia.org/wiki/Qazi_Muhammad' },

    // April
    { m: 4, d: 4,  type: 'b', name: 'Abdullah Öcalan', role: 'Founder of the PKK', years: 'b. 1948', bio: 'Co-founder of the PKK and one of the most controversial figures in modern Kurdish politics. Imprisoned in Turkey since 1999.', wiki: 'https://en.wikipedia.org/wiki/Abdullah_%C3%96calan' },

    // May
    { m: 5, d: 2,  type: 'b', name: 'Şêrko Bêkes', role: 'Sorani poet', years: '1940—2013', bio: 'One of the most important Kurdish poets of the 20th century. Pioneer of the "poster poem" form.', wiki: 'https://en.wikipedia.org/wiki/Sherko_Bekas' },
    { m: 5, d: 9,  type: 'd', name: 'Ferzad Kemanger', role: 'Kurdish teacher and activist', years: '1975—2010', bio: 'Iranian-Kurdish teacher and human-rights activist; executed by the Islamic Republic of Iran on charges he denied.', wiki: 'https://en.wikipedia.org/wiki/Farzad_Kamangar' },
    { m: 5, d: 12, type: 'd', name: 'Leyla Qasim', role: 'Kurdish activist', years: '1952—1974', bio: 'First Kurdish woman to be executed for political activism in modern Iraq. Member of the Kurdistan Democratic Party.', wiki: 'https://en.wikipedia.org/wiki/Leyla_Qasim' },

    // June
    { m: 6, d: 11, type: 'd', name: 'Piremerd', role: 'Sorani poet, journalist', years: '1867—1950', bio: 'Pen name of Hac Tofiq. Influential Sorani poet, journalist, and educator from Sulaymaniyah.', wiki: 'https://en.wikipedia.org/wiki/Piremerd' },

    // July
    { m: 7, d: 13, type: 'd', name: 'Abdul Rahman Ghassemlou', role: 'Leader of KDPI', years: '1930—1989', bio: 'Long-time leader of the Democratic Party of Iranian Kurdistan. Assassinated in Vienna during peace talks with Iranian agents.', wiki: 'https://en.wikipedia.org/wiki/Abdul_Rahman_Ghassemlou' },

    // August
    { m: 8, d: 4,  type: 'd', name: 'Şêrko Bêkes', role: 'Sorani poet', years: '1940—2013', bio: 'Death anniversary of one of the giants of modern Kurdish poetry.', wiki: 'https://en.wikipedia.org/wiki/Sherko_Bekas' },

    // September
    { m: 9, d: 17, type: 'd', name: 'Sadegh Sharafkandi', role: 'Successor of Ghassemlou', years: '1938—1992', bio: 'Secretary-general of KDPI after Ghassemlou. Assassinated at the Mykonos restaurant in Berlin.', wiki: 'https://en.wikipedia.org/wiki/Sadegh_Sharafkandi' },

    // October
    { m: 10, d: 6,  type: 'b', name: 'Yaşar Kemal', role: 'Kurdish-Turkish novelist', years: '1923—2015', bio: 'Author of Memed, My Hawk and the İnce Memed cycle.', wiki: 'https://en.wikipedia.org/wiki/Ya%C5%9Far_Kemal' },
    { m: 10, d: 11, type: 'd', name: 'Mehmed Uzun', role: 'Kurdish novelist', years: '1953—2007', bio: 'Death anniversary of the writer who brought modern Kurmanji literature to a wider audience.', wiki: 'https://en.wikipedia.org/wiki/Mehmed_Uzun' },
    { m: 10, d: 12, type: 'd', name: 'Hevrîn Xelef', role: 'Syrian-Kurdish politician', years: '1984—2019', bio: 'Secretary-general of the Future Syria Party; assassinated in northern Syria during the 2019 Turkish offensive.', wiki: 'https://en.wikipedia.org/wiki/Hevrin_Khalaf' },
    { m: 10, d: 22, type: 'd', name: 'Cegerxwîn', role: 'Kurdish poet', years: '1903—1984', bio: 'One of the most influential Kurmanji poets; pen name of Şêx Mûs Hesen. His verse was central to 20th-century Kurdish national consciousness.', wiki: 'https://en.wikipedia.org/wiki/Cegerxw%C3%AEn' },

    // November
    { m: 11, d: 9,  type: 'b', name: 'Piremerd', role: 'Sorani poet, journalist', years: '1867—1950', bio: 'Pen name of Hac Tofiq. Sulaymaniyah-born poet whose journalism shaped early modern Sorani prose.', wiki: 'https://en.wikipedia.org/wiki/Piremerd' },
    { m: 11, d: 18, type: 'b', name: 'Ehmedê Xanî', role: 'Classical poet', years: '~1651—1707', bio: 'Author of the Kurdish national epic Mem û Zîn (1692); pioneer of literary Kurmanji. Birth date is approximate.', wiki: 'https://en.wikipedia.org/wiki/Ahmad_Khani' },

    // December
    { m: 12, d: 22, type: 'b', name: 'Abdul Rahman Ghassemlou', role: 'Leader of KDPI', years: '1930—1989', bio: 'Born in Urmia. Led the Democratic Party of Iranian Kurdistan for two decades.', wiki: 'https://en.wikipedia.org/wiki/Abdul_Rahman_Ghassemlou' },
    { m: 12, d: 23, type: 'b', name: 'Şivan Perwer', role: 'Kurdish singer', years: 'b. 1955', bio: 'One of the most beloved Kurdish musicians; his songs are central to modern Kurmanji popular culture.', wiki: 'https://en.wikipedia.org/wiki/%C5%9Eivan_Perwer' },
  ];

  // ---------- helpers ----------

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function isToday(g, t) {
    return g.getFullYear() === t.getFullYear() &&
           g.getMonth() === t.getMonth() &&
           g.getDate() === t.getDate();
  }
  function eventOn(m, d) { return EVENTS.find(e => e.m === m && e.d === d); }
  function figuresOn(m, d) { return FIGURES.filter(f => f.m === m && f.d === d); }

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

  // ---------- Poems ----------
  // Real Kurdish poetry pulled at runtime from the allekok-poems collection
  // (https://github.com/allekok/allekok-poems — used per its public-domain
  // license). We hold a small curated index of paths to keep network use
  // tiny; expand the list to surface more poems.
  const POEM_BASE = 'https://raw.githubusercontent.com/allekok/allekok-poems/master/شیعرەکان/';
  const POEM_VIEW = 'https://github.com/allekok/allekok-poems/blob/master/شیعرەکان/';
  const POEM_INDEX = [
    'شێرکۆ بێکەس/تریفەی ھەڵبەست/١١. تەنیا',
    'شێرکۆ بێکەس/تریفەی ھەڵبەست/٨. بێ تۆ',
    'شێرکۆ بێکەس/تریفەی ھەڵبەست/٢٥. چەپکە هەڵبەست',
    'شێرکۆ بێکەس/تریفەی ھەڵبەست/٣٤. هەڵبەست',
    'شێرکۆ بێکەس/تریفەی ھەڵبەست/١٩. لەگەڵ نالیدا',
    'شێرکۆ بێکەس/تریفەی ھەڵبەست/٤٢. وێنەکەی',
    'شێرکۆ بێکەس/تریفەی ھەڵبەست/٢٦. کاتێ',
    'شێرکۆ بێکەس/تریفەی ھەڵبەست/٢٣. نەوەی نوێ',
    'شێرکۆ بێکەس/تریفەی ھەڵبەست/٢٩. کەی بێ؟',
    'شێرکۆ بێکەس/تریفەی ھەڵبەست/٦. بڕوام',
  ];

  function parseAllekok(text) {
    // Format: lines of `key: value` for header (شاعیر, کتێب, سەرناو), blank line, then body.
    const lines = text.split(/\r?\n/);
    const meta = {};
    let bodyStart = 0;
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^(شاعیر|کتێب|سەرناو)\s*[:：]\s*(.+)$/);
      if (m) meta[m[1]] = m[2].trim();
      else if (lines[i].trim() === '' && Object.keys(meta).length) { bodyStart = i + 1; break; }
    }
    const body = lines.slice(bodyStart).join('\n').trim();
    return {
      poet: meta['شاعیر'] || '',
      book: meta['کتێب'] || '',
      title: meta['سەرناو'] || '',
      body: body,
    };
  }

  function truncateLines(text, maxLines) {
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length <= maxLines) return text;
    return lines.slice(0, maxLines).join('\n') + '\n…';
  }

  function setPoemUI(p) {
    const orig = document.getElementById('poem-orig');
    const trans = document.getElementById('poem-trans');
    const attr = document.getElementById('poem-attr');
    orig.textContent = p.body;
    orig.setAttribute('dir', p.dir || 'rtl');
    orig.style.fontFamily = (p.dir || 'rtl') === 'rtl' ? "'Vazirmatn','Tahoma',sans-serif" : '';
    orig.style.textAlign = (p.dir || 'rtl') === 'rtl' ? 'right' : 'left';
    trans.textContent = p.title || '';
    trans.setAttribute('dir', 'rtl');
    trans.style.fontFamily = "'Vazirmatn','Tahoma',sans-serif";
    trans.style.textAlign = 'right';
    if (p.viewUrl) {
      attr.innerHTML = '— ' + escapeHtml(p.poet) +
        (p.book ? '  ·  <span style="opacity:.75">' + escapeHtml(p.book) + '</span>' : '') +
        '  ·  <a href="' + p.viewUrl + '" target="_blank" rel="noopener" style="color:var(--fg);text-decoration:underline;text-decoration-style:dotted">view full</a>';
    } else {
      attr.textContent = '— ' + (p.attr || (p.poet || ''));
    }
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function renderPoem() {
    setPoemUI({ body: 'Loading…', poet: 'allekok-poems', dir: 'ltr' });
    const path = POEM_INDEX[Math.floor(Math.random() * POEM_INDEX.length)];
    const url = POEM_BASE + encodeURI(path);
    const view = POEM_VIEW + encodeURI(path);
    fetch(url)
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(text => {
        const parsed = parseAllekok(text);
        setPoemUI({
          body: truncateLines(parsed.body, 6),
          poet: parsed.poet,
          book: parsed.book,
          title: parsed.title,
          viewUrl: view,
          dir: 'rtl',
        });
      })
      .catch(err => {
        setPoemUI({
          body: 'Could not load a poem from allekok-poems (' + err.message + ').\nSee https://github.com/allekok/allekok-poems',
          poet: '', dir: 'ltr',
        });
      });
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
      const figs = figuresOn(m + 1, d);
      if (isToday(date, g)) el.classList.add('today');
      if (ev) {
        el.classList.add('has-event');
        el.title = ev.name + ' — ' + ev.sub;
      }
      if (figs.length) {
        el.classList.add('has-figure');
        const figTitle = figs.map(f => f.name + ' (' + (f.type === 'b' ? 'b.' : 'd.') + ')').join(', ');
        el.title = (el.title ? el.title + '\n' : '') + figTitle;
      }
      const jal = gregToJalali(y, m + 1, d);
      el.innerHTML =
        '<span class="cal-num-greg">' + d + '</span>' +
        '<span class="cal-num-ku">' + arDigits(jal.d) + '</span>';
      if (ev) {
        const dot = document.createElement('span');
        dot.className = 'cal-dot';
        el.appendChild(dot);
      }
      if (figs.length) {
        const star = document.createElement('span');
        star.className = 'cal-star';
        star.textContent = '★';
        el.appendChild(star);
      }
      const iso = y + '-' + (m + 1).toString().padStart(2, '0') + '-' + d.toString().padStart(2, '0');
      el.dataset.iso = iso;
      el.addEventListener('click', () => selectDay(iso, ev, figs));
      grid.appendChild(el);
    }
  }

  function arDigits(n) {
    const m = { '0':'٠','1':'١','2':'٢','3':'٣','4':'٤','5':'٥','6':'٦','7':'٧','8':'٨','9':'٩' };
    return String(n).replace(/\d/g, d => m[d]);
  }

  function selectDay(iso, ev, figs) {
    convDir = 'g2k';
    document.querySelectorAll('.seg[data-control="conv-dir"] button').forEach(b =>
      b.classList.toggle('active', b.dataset.value === 'g2k'));
    document.getElementById('conv-mode-g2k').hidden = false;
    document.getElementById('conv-mode-k2g').hidden = true;
    document.getElementById('conv-input').value = iso;
    renderConverter();
    if (figs && figs.length) {
      // ensure all figures are visible, then scroll to and expand the first match
      figuresShowAll = true;
      renderFigures();
      const first = figs[0];
      const slug = figureSlug(first);
      const el = document.getElementById('fig-' + slug);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('expanded');
      }
    } else {
      document.querySelector('.cal-converter').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function figureSlug(f) {
    return f.m + '-' + f.d + '-' + f.type + '-' + (f.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
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
    renderFigures();
    renderConverter();
    renderPoem();
  }

  // ---------- Figures section ----------

  let figuresShowAll = false;

  function renderFigures() {
    const list = document.getElementById('figures-list');
    if (!list) return;
    list.innerHTML = '';
    const today = new Date();
    const curMonth = today.getMonth() + 1;
    const items = figuresShowAll
      ? FIGURES.slice().sort((a, b) => a.m - b.m || a.d - b.d)
      : FIGURES.filter(f => f.m === curMonth).sort((a, b) => a.d - b.d);

    if (!items.length) {
      const li = document.createElement('li');
      li.style.opacity = '0.7';
      li.style.fontSize = '0.9em';
      li.textContent = 'No figures recorded for this month. Tap "Show all" for the full list.';
      list.appendChild(li);
    }

    items.forEach(f => {
      const slug = figureSlug(f);
      const li = document.createElement('li');
      li.id = 'fig-' + slug;
      li.className = 'fig-item';
      const date = G_MONTHS[f.m - 1].slice(0, 3) + ' ' + f.d;
      const star = f.type === 'b' ? '★' : '✦';
      const summary = document.createElement('button');
      summary.type = 'button';
      summary.className = 'fig-summary';
      summary.innerHTML =
        '<span class="fig-when">' + date + '</span>' +
        '<span class="fig-name"><span class="fig-mark">' + star + '</span>' + f.name + '</span>' +
        '<span class="fig-role">' + f.role + ' · ' + f.years + '</span>';
      summary.addEventListener('click', () => li.classList.toggle('expanded'));

      const detail = document.createElement('div');
      detail.className = 'fig-detail';
      detail.innerHTML =
        '<p>' + f.bio + '</p>' +
        (f.wiki ? '<p><a href="' + f.wiki + '" target="_blank" rel="noopener">Wikipedia &rarr;</a></p>' : '');

      li.appendChild(summary);
      li.appendChild(detail);
      list.appendChild(li);
    });

    const btn = document.getElementById('figures-toggle');
    if (btn) btn.textContent = figuresShowAll ? 'Show only ' + G_MONTHS[curMonth - 1] : 'Show all';
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

  // Figures show-all toggle
  const figToggle = document.getElementById('figures-toggle');
  if (figToggle) figToggle.addEventListener('click', () => {
    figuresShowAll = !figuresShowAll;
    renderFigures();
  });

  renderAll();
})();
