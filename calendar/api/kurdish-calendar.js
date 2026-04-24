/*!
 * kurdish-calendar.js
 *
 * Tiny zero-dependency client-side library for the Kurdish (Jalali) calendar.
 *
 * Usage in a browser:
 *   <script src="https://tools.thefarshad.com/calendar/api/kurdish-calendar.js"></script>
 *   <script>
 *     const t = KurdishCalendar.today();
 *     // -> { gregorian: {...}, central: {...}, northern: {...}, event: {...}|null }
 *   </script>
 *
 * Usage with ES modules:
 *   import * as KurdishCalendar from './kurdish-calendar.js';
 *
 * License: CC0-1.0 (public domain). Send improvements via:
 *   https://github.com/the-farshad/tools
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KurdishCalendar = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var KURD_YEAR_OFFSET = 1321; // Kurdish year ≈ Jalali year + 1321

  var CK_KURDI = ['Xakelêwe','Gulan','Cozerdan','Pûşper','Gelawêj','Xermanan','Rezber','Gelarêzan','Sermawez','Befranbar','Rêbendan','Reşeme'];
  var CK_ARABIC = ['خاکەلێوە','گوڵان','جۆزەردان','پووشپەڕ','گەلاوێژ','خەرمانان','ڕەزبەر','گەڵاڕێزان','سەرماوەز','بەفرانبار','ڕێبەندان','ڕەشەمە'];
  var NK_MONTHS = ['Çile','Sibat','Adar','Nîsan','Gulan','Hezîran','Tîrmeh','Tebax','Îlon','Cotmeh','Mijdar','Berfanbar'];
  var CK_DOW_KURDI = ['Şemme','Yekşemme','Duşemme','Sêşemme','Çarşemme','Pêncşemme','Heyni'];
  var CK_DOW_AR = ['شەممە','یەکشەممە','دووشەممە','سێشەممە','چوارشەممە','پێنجشەممە','هەینی'];
  var NK_DOW = ['Yekşem','Duşem','Sêşem','Çarşem','Pêncşem','În','Şemî'];
  var AR_DIGITS = {'0':'٠','1':'١','2':'٢','3':'٣','4':'٤','5':'٥','6':'٦','7':'٧','8':'٨','9':'٩'};

  var EVENTS = [
    { m: 1, d: 22, name: 'Republic of Mahabad', sub: 'Founding (1946)', slug: 'mahabad' },
    { m: 2, d: 21, name: 'Mother Language Day', sub: 'International', slug: 'mother-language' },
    { m: 3, d: 16, name: 'Halabja Memorial', sub: 'Chemical attack remembrance (1988)', slug: 'halabja' },
    { m: 3, d: 21, name: 'Newroz', sub: 'Kurdish New Year', slug: 'newroz' },
    { m: 4, d: 14, name: 'Anfal Memorial', sub: 'Anfal campaign remembrance', slug: 'anfal' },
    { m: 5, d: 15, name: 'Roja Zimanê Kurdî', sub: 'Kurdish Language Day', slug: 'kurdish-language' },
    { m: 7, d: 19, name: 'Rojava Revolution', sub: 'Anniversary (2012)', slug: null },
    { m: 8, d: 3, name: 'Yezîdî Genocide Memorial', sub: 'Sinjar attack remembrance (2014)', slug: null },
    { m: 9, d: 25, name: 'Kurdistan Independence Referendum', sub: '2017', slug: 'referendum' },
    { m: 12, d: 17, name: 'Kurdish Flag Day', sub: 'Adopted in Kurdistan Region (1999)', slug: 'flag-day' }
  ];

  var FIGURES = [
    { m: 1, d: 1, type: 'b', name: 'Mehmed Uzun', role: 'Kurdish novelist', years: '1953—2007', wiki: 'https://en.wikipedia.org/wiki/Mehmed_Uzun' },
    { m: 1, d: 9, type: 'd', name: 'Sakine Cansız', role: 'Kurdish political activist', years: '1958—2013', wiki: 'https://en.wikipedia.org/wiki/Sakine_Cans%C4%B1z' },
    { m: 2, d: 12, type: 'b', name: 'Sakine Cansız', role: 'Kurdish political activist', years: '1958—2013', wiki: 'https://en.wikipedia.org/wiki/Sakine_Cans%C4%B1z' },
    { m: 2, d: 28, type: 'd', name: 'Yaşar Kemal', role: 'Kurdish-Turkish novelist', years: '1923—2015', wiki: 'https://en.wikipedia.org/wiki/Ya%C5%9Far_Kemal' },
    { m: 3, d: 1, type: 'd', name: 'Mustafa Barzani', role: 'Kurdish leader', years: '1903—1979', wiki: 'https://en.wikipedia.org/wiki/Mustafa_Barzani' },
    { m: 3, d: 4, type: 'd', name: 'Saladin (Selahaddînê Eyûbî)', role: 'Sultan and military leader', years: '1137—1193', wiki: 'https://en.wikipedia.org/wiki/Saladin' },
    { m: 3, d: 14, type: 'b', name: 'Mustafa Barzani', role: 'Kurdish leader', years: '1903—1979', wiki: 'https://en.wikipedia.org/wiki/Mustafa_Barzani' },
    { m: 3, d: 31, type: 'd', name: 'Qazi Muhammad', role: 'President of the Republic of Mahabad', years: '1893—1947', wiki: 'https://en.wikipedia.org/wiki/Qazi_Muhammad' },
    { m: 4, d: 4, type: 'b', name: 'Abdullah Öcalan', role: 'Founder of the PKK', years: 'b. 1948', wiki: 'https://en.wikipedia.org/wiki/Abdullah_%C3%96calan' },
    { m: 5, d: 2, type: 'b', name: 'Şêrko Bêkes', role: 'Sorani poet', years: '1940—2013', wiki: 'https://en.wikipedia.org/wiki/Sherko_Bekas' },
    { m: 5, d: 9, type: 'd', name: 'Ferzad Kemanger', role: 'Kurdish teacher and activist', years: '1975—2010', wiki: 'https://en.wikipedia.org/wiki/Farzad_Kamangar' },
    { m: 5, d: 12, type: 'd', name: 'Leyla Qasim', role: 'Kurdish activist', years: '1952—1974', wiki: 'https://en.wikipedia.org/wiki/Leyla_Qasim' },
    { m: 6, d: 11, type: 'd', name: 'Piremerd', role: 'Sorani poet, journalist', years: '1867—1950', wiki: 'https://en.wikipedia.org/wiki/Piremerd' },
    { m: 7, d: 13, type: 'd', name: 'Abdul Rahman Ghassemlou', role: 'Leader of KDPI', years: '1930—1989', wiki: 'https://en.wikipedia.org/wiki/Abdul_Rahman_Ghassemlou' },
    { m: 8, d: 4, type: 'd', name: 'Şêrko Bêkes', role: 'Sorani poet', years: '1940—2013', wiki: 'https://en.wikipedia.org/wiki/Sherko_Bekas' },
    { m: 9, d: 17, type: 'd', name: 'Sadegh Sharafkandi', role: 'Successor of Ghassemlou', years: '1938—1992', wiki: 'https://en.wikipedia.org/wiki/Sadegh_Sharafkandi' },
    { m: 10, d: 6, type: 'b', name: 'Yaşar Kemal', role: 'Kurdish-Turkish novelist', years: '1923—2015', wiki: 'https://en.wikipedia.org/wiki/Ya%C5%9Far_Kemal' },
    { m: 10, d: 11, type: 'd', name: 'Mehmed Uzun', role: 'Kurdish novelist', years: '1953—2007', wiki: 'https://en.wikipedia.org/wiki/Mehmed_Uzun' },
    { m: 10, d: 12, type: 'd', name: 'Hevrîn Xelef', role: 'Syrian-Kurdish politician', years: '1984—2019', wiki: 'https://en.wikipedia.org/wiki/Hevrin_Khalaf' },
    { m: 10, d: 22, type: 'd', name: 'Cegerxwîn', role: 'Kurdish poet', years: '1903—1984', wiki: 'https://en.wikipedia.org/wiki/Cegerxw%C3%AEn' },
    { m: 11, d: 9, type: 'b', name: 'Piremerd', role: 'Sorani poet, journalist', years: '1867—1950', wiki: 'https://en.wikipedia.org/wiki/Piremerd' },
    { m: 11, d: 18, type: 'b', name: 'Ehmedê Xanî', role: 'Classical poet', years: '~1651—1707', wiki: 'https://en.wikipedia.org/wiki/Ahmad_Khani' },
    { m: 12, d: 22, type: 'b', name: 'Abdul Rahman Ghassemlou', role: 'Leader of KDPI', years: '1930—1989', wiki: 'https://en.wikipedia.org/wiki/Abdul_Rahman_Ghassemlou' },
    { m: 12, d: 23, type: 'b', name: 'Şivan Perwer', role: 'Kurdish singer', years: 'b. 1955', wiki: 'https://en.wikipedia.org/wiki/%C5%9Eivan_Perwer' }
  ];

  // Intl-based Jalali (uses ICU "persian" identifier)
  var jalaliFmt = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric' });

  function gregToJalali(gy, gm, gd) {
    var date = new Date(Date.UTC(gy, gm - 1, gd, 12));
    var parts = jalaliFmt.formatToParts(date);
    function get(t) { for (var i = 0; i < parts.length; i++) if (parts[i].type === t) return parseInt(parts[i].value, 10); }
    return { y: get('year'), m: get('month'), d: get('day') };
  }

  function jalaliToGreg(jy, jm, jd) {
    var newroz = null;
    for (var off = -2; off <= 3; off++) {
      var dt = new Date(jy + 621, 2, 21 + off);
      var j = gregToJalali(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
      if (j.y === jy && j.m === 1 && j.d === 1) { newroz = dt; break; }
    }
    if (!newroz) newroz = new Date(jy + 621, 2, 21);
    var monthOffsets = [0, 31, 62, 93, 124, 155, 186, 216, 246, 276, 306, 336];
    var days = monthOffsets[jm - 1] + (jd - 1);
    var out = new Date(newroz);
    out.setDate(out.getDate() + days);
    return out;
  }

  function arDigits(s) {
    return String(s).replace(/\d/g, function (d) { return AR_DIGITS[d]; });
  }

  function eventOn(month, day) {
    return EVENTS.filter(function (e) { return e.m === month && e.d === day; });
  }

  function figuresOn(month, day) {
    return FIGURES.filter(function (f) { return f.m === month && f.d === day; });
  }

  function describe(date) {
    var g = (date instanceof Date) ? date : new Date(date);
    var p = gregToJalali(g.getFullYear(), g.getMonth() + 1, g.getDate());
    var ky = p.y + KURD_YEAR_OFFSET;
    var ckDowIdx = (g.getDay() + 1) % 7; // week starts Saturday
    var matches = eventOn(g.getMonth() + 1, g.getDate());
    var figs = figuresOn(g.getMonth() + 1, g.getDate());
    return {
      gregorian: {
        year: g.getFullYear(),
        month: g.getMonth() + 1,
        day: g.getDate(),
        weekday: g.getDay(), // 0=Sun
        iso: g.getFullYear() + '-' + pad(g.getMonth() + 1) + '-' + pad(g.getDate())
      },
      central: {
        jalali_year: p.y,
        kurdish_year: ky,
        month: p.m,
        day: p.d,
        month_name_kurdi: CK_KURDI[p.m - 1],
        month_name_arabic: CK_ARABIC[p.m - 1],
        day_name_kurdi: CK_DOW_KURDI[ckDowIdx],
        day_name_arabic: CK_DOW_AR[ckDowIdx],
        formatted_kurdi: p.d + ' ' + CK_KURDI[p.m - 1] + ' ' + ky,
        formatted_arabic: arDigits(p.d) + ' ' + CK_ARABIC[p.m - 1] + ' ' + arDigits(ky)
      },
      northern: {
        year: g.getFullYear(),
        month: g.getMonth() + 1,
        day: g.getDate(),
        month_name: NK_MONTHS[g.getMonth()],
        day_name: NK_DOW[g.getDay()],
        formatted: g.getDate() + 'î ' + NK_MONTHS[g.getMonth()] + 'a ' + g.getFullYear() + 'ê'
      },
      events: matches,
      figures: figs
    };
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function today() { return describe(new Date()); }

  function events() { return EVENTS.slice(); }

  function figures() { return FIGURES.slice(); }

  function daysUntilNewroz() {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var target = new Date(today.getFullYear(), 2, 21);
    if (target < today) target = new Date(today.getFullYear() + 1, 2, 21);
    return Math.round((target - today) / 86400000);
  }

  return {
    version: '2.0.0',
    KURD_YEAR_OFFSET: KURD_YEAR_OFFSET,
    today: today,
    describe: describe,
    gregToJalali: gregToJalali,
    jalaliToGreg: jalaliToGreg,
    events: events,
    eventOn: eventOn,
    figures: figures,
    figuresOn: figuresOn,
    daysUntilNewroz: daysUntilNewroz,
    months: { centralKurdi: CK_KURDI, centralArabic: CK_ARABIC, northern: NK_MONTHS },
    arDigits: arDigits
  };
});
