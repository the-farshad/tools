/*!
 * kurdish-calendar.js
 *
 * Tiny zero-dependency client-side library for the Kurdish (Jalali) calendar.
 *
 * Usage in a browser:
 *   <script src="https://tools.thefarshad.com/calendar/api/kurdish-calendar.js"></script>
 *   <script>
 *     const t = KurdishCalendar.today();
 *     // -> { gregorian: {...}, central: {...}, northern: {...},
 *     //      events: [{...}], figures: [{...}] }
 *     //  (`central` = Kurdish Calendar; `northern` = Official Calendar.
 *     //   JSON keys kept stable for backward compatibility.)
 *
 *     // Sorani text conversion (Arabic-script → Hawar/Bedirxan Latin):
 *     KurdishCalendar.arToLatin('ئاگر');              // → 'agir'
 *     KurdishCalendar.arToLatin('کوردستان');          // → 'kurdistan'
 *     KurdishCalendar.titleCaseLatin('hejar');        // → 'Hejar'
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
    { m: 1,  d: 22, name: 'Republic of Kurdistan',                    sub: 'Founding in Mahabad (1946)',           slug: 'mahabad' },
    { m: 1,  d: 26, name: 'Liberation of Kobanê',                     sub: 'End of the ISIS siege (2015)',          slug: 'kobane-liberation' },
    { m: 2,  d: 21, name: 'Mother Language Day',                      sub: 'International',                         slug: 'mother-language' },
    { m: 3,  d: 16, name: 'Halabja Memorial',                         sub: 'Chemical attack remembrance (1988)',    slug: 'halabja' },
    { m: 3,  d: 21, name: 'Newroz',                                   sub: 'Kurdish New Year',                      slug: 'newroz' },
    { m: 3,  d: 31, name: 'Execution of the Republic of Kurdistan leaders', sub: 'Qazi Muhammad and others (1947)', slug: 'mahabad-execution' },
    { m: 4,  d: 14, name: 'Anfal Memorial',                           sub: 'Anfal campaign remembrance',            slug: 'anfal' },
    { m: 5,  d: 15, name: 'Roja Zimanê Kurdî',                        sub: 'Kurdish Language Day',                  slug: 'kurdish-language' },
    { m: 6,  d: 1,  name: 'Founding of the PUK',                      sub: 'Patriotic Union of Kurdistan (1975)',   slug: 'puk-founding' },
    { m: 7,  d: 19, name: 'Rojava Revolution',                        sub: 'Anniversary (2012)',                    slug: 'rojava-revolution' },
    { m: 8,  d: 3,  name: 'Yezîdî Genocide Memorial',                 sub: 'Sinjar attack remembrance (2014)',      slug: 'yezidi-memorial' },
    { m: 8,  d: 16, name: 'Founding of the KDP',                      sub: 'Kurdistan Democratic Party (1946)',     slug: 'kdp-founding' },
    { m: 9,  d: 13, name: 'Beginning of the Siege of Kobanê',         sub: 'ISIS attack on Kobanê (2014)',          slug: 'kobane-siege' },
    { m: 9,  d: 25, name: 'Kurdistan Independence Referendum',        sub: '2017',                                  slug: 'referendum' },
    { m: 12, d: 16, name: 'Fall of the Republic of Kurdistan',        sub: 'Mahabad re-occupied by Iranian forces (1946)',          slug: 'mahabad-fall' },
    { m: 12, d: 17, name: 'Kurdish Flag Day',                         sub: 'Adopted in Kurdistan Region (1999)',                    slug: 'flag-day' },
    { m: 8,  d: 23, name: 'Battle of Chaldiran',                      sub: '1514 — Ottoman-Safavid war; Kurdistan split between two empires', slug: 'chaldiran' },
    { m: 5,  d: 17, name: 'Treaty of Zuhab',                          sub: '1639 — first formal partition of Kurdistan',            slug: 'zuhab' },
    { m: 8,  d: 10, name: 'Treaty of Sèvres',                         sub: '1920 — first international promise of a Kurdish state', slug: 'sevres' },
    { m: 7,  d: 24, name: 'Treaty of Lausanne',                       sub: '1923 — replaced Sèvres; partitioned Kurdistan',         slug: 'lausanne' },
    { m: 4,  d: 7,  name: 'Establishment of the No-Fly Zone',         sub: '1991 — protected Iraqi Kurdistan after the uprising',   slug: 'no-fly-zone' },
    { m: 5,  d: 19, name: 'First Kurdistan Region elections',         sub: '1992 — first parliamentary vote in Iraqi Kurdistan',    slug: 'kri-elections' },
    { m: 10, d: 16, name: 'Iraqi forces re-take Kirkuk',              sub: '2017 — aftermath of the independence referendum',       slug: 'kirkuk-2017' },
    { m: 2,  d: 13, name: 'Beginning of the Sheikh Said rebellion',   sub: '1925 — Kurdish uprising in Turkey',                     slug: 'sheikh-said-rebellion' },
    { m: 3,  d: 5,  name: 'Beginning of the 1991 Kurdish uprising',   sub: 'Iraqi Kurds rise after the Gulf War',                   slug: '1991-uprising' },
    { m: 3,  d: 12, name: 'Qamişlo uprising',                         sub: '2004 — Syrian Kurdish uprising',                        slug: 'qamishlo-uprising' },
    { m: 9,  d: 16, name: 'Death of Jina Mahsa Amini',                sub: '2022 — sparked the Jin Jiyan Azadî movement',           slug: 'jina-amini' },
    { m: 9,  d: 20, name: 'Founding of the PYD',                      sub: '2003 — Democratic Union Party (Syrian Kurdistan)',                slug: 'pyd-founding' },
    { m: 9,  d: 21, name: 'Founding of Gorran',                       sub: '2009 — Movement for Change (Iraqi Kurdistan)',                    slug: 'goran-founding' },
    { m: 9,  d: 26, name: 'Founding of Komala',                       sub: '1969 — Society of Revolutionary Toilers (Iranian Kurdistan)',     slug: 'komala-founding' },
    { m: 10, d: 5,  name: 'Founding of the Khoybûn League',           sub: '1927 — first transnational Kurdish nationalist organization', slug: 'khoyboun' },
    { m: 8,  d: 16, name: 'Founding of the KDP-Iran (KDPI)',          sub: '1945 — Democratic Party of Iranian Kurdistan',          slug: 'kdpi-founding' },
    { m: 11, d: 27, name: 'Founding of the PKK',                      sub: "1978 — Kurdistan Workers' Party",                       slug: 'pkk-founding' },
    { m: 10, d: 15, name: 'Founding of the HDP',                      sub: "2012 — Peoples' Democratic Party (Turkey)",             slug: 'hdp-founding' }
  ];

  var FIGURES = [
    { m: 1,  d: 1,  type: 'b', name: 'Mehmed Uzun',             role: 'Kurdish novelist',                       years: '1953—2007', wiki: 'https://en.wikipedia.org/wiki/Mehmed_Uzun' },
    { m: 1,  d: 9,  type: 'd', name: 'Sakine Cansız',           role: 'Kurdish political activist',             years: '1958—2013', wiki: 'https://en.wikipedia.org/wiki/Sakine_Cans%C4%B1z' },
    { m: 1,  d: 15, type: 'b', name: 'Aram Tigran',             role: 'Kurdish musician',              years: '1934—2009', wiki: 'https://en.wikipedia.org/wiki/Aram_Tigran' },
    { m: 1,  d: 31, type: 'd', name: 'Idris Barzani',           role: 'Kurdish leader',                         years: '1944—1987', wiki: 'https://en.wikipedia.org/wiki/Idris_Barzani' },
    { m: 2,  d: 12, type: 'b', name: 'Sakine Cansız',           role: 'Kurdish political activist',             years: '1958—2013', wiki: 'https://en.wikipedia.org/wiki/Sakine_Cans%C4%B1z' },
    { m: 2,  d: 22, type: 'd', name: 'Hejar Mukrîyanî',         role: 'Kurdish poet and translator',             years: '1920—1991', wiki: 'https://en.wikipedia.org/wiki/Hejar' },
    { m: 2,  d: 25, type: 'b', name: 'Sharaf Khan Bidlisi',     role: 'Historian, prince of Bitlis',            years: '1543—1603', wiki: 'https://en.wikipedia.org/wiki/Sharaf_Khan_Bidlisi' },
    { m: 2,  d: 28, type: 'd', name: 'Yaşar Kemal',             role: 'Kurdish novelist',               years: '1923—2015', wiki: 'https://en.wikipedia.org/wiki/Ya%C5%9Far_Kemal' },
    { m: 3,  d: 1,  type: 'd', name: 'Mustafa Barzani',         role: 'Kurdish leader',                         years: '1903—1979', wiki: 'https://en.wikipedia.org/wiki/Mustafa_Barzani' },
    { m: 3,  d: 4,  type: 'd', name: 'Saladin (Selahaddînê Eyûbî)', role: 'Sultan and military leader',          years: '1137—1193', wiki: 'https://en.wikipedia.org/wiki/Saladin' },
    { m: 3,  d: 14, type: 'b', name: 'Mustafa Barzani',         role: 'Kurdish leader',                         years: '1903—1979', wiki: 'https://en.wikipedia.org/wiki/Mustafa_Barzani' },
    { m: 3,  d: 15, type: 'b', name: 'Hejar Mukrîyanî',         role: 'Kurdish poet and translator',             years: '1920—1991', wiki: 'https://en.wikipedia.org/wiki/Hejar' },
    { m: 3,  d: 31, type: 'd', name: 'Qazi Muhammad',           role: 'President of the Republic of Kurdistan', years: '1893—1947', wiki: 'https://en.wikipedia.org/wiki/Qazi_Muhammad' },
    { m: 4,  d: 1,  type: 'b', name: 'Yılmaz Güney',            role: 'Kurdish filmmaker',              years: '1937—1984', wiki: 'https://en.wikipedia.org/wiki/Y%C4%B1lmaz_G%C3%BCney' },
    { m: 4,  d: 4,  type: 'b', name: 'Abdullah Öcalan',         role: 'Founder of the PKK',                     years: 'b. 1948',   wiki: 'https://en.wikipedia.org/wiki/Abdullah_%C3%96calan' },
    { m: 4,  d: 18, type: 'd', name: 'Hêmin Mukrîyanî',         role: 'Kurdish poet',                            years: '1921—1986', wiki: 'https://en.wikipedia.org/wiki/H%C3%AAmin' },
    { m: 5,  d: 2,  type: 'b', name: 'Şêrko Bêkes',             role: 'Kurdish poet',                            years: '1940—2013', wiki: 'https://en.wikipedia.org/wiki/Sherko_Bekas' },
    { m: 5,  d: 3,  type: 'b', name: 'Leyla Zana',              role: 'Kurdish politician',             years: 'b. 1961',   wiki: 'https://en.wikipedia.org/wiki/Leyla_Zana' },
    { m: 5,  d: 9,  type: 'd', name: 'Ferzad Kemanger',         role: 'Kurdish teacher and activist',           years: '1975—2010', wiki: 'https://en.wikipedia.org/wiki/Farzad_Kamangar' },
    { m: 5,  d: 12, type: 'd', name: 'Leyla Qasim',             role: 'Kurdish activist',                       years: '1952—1974', wiki: 'https://en.wikipedia.org/wiki/Leyla_Qasim' },
    { m: 5,  d: 15, type: 'b', name: 'Salim Barakat',           role: 'Kurdish poet and novelist',       years: 'b. 1951',   wiki: 'https://en.wikipedia.org/wiki/Salim_Barakat' },
    { m: 6,  d: 11, type: 'd', name: 'Piremerd',                role: 'Kurdish poet, journalist',                years: '1867—1950', wiki: 'https://en.wikipedia.org/wiki/Piremerd' },
    { m: 6,  d: 29, type: 'd', name: 'Sheikh Said',             role: 'Religious leader, rebellion of 1925',    years: '1865—1925', wiki: 'https://en.wikipedia.org/wiki/Sheikh_Said' },
    { m: 7,  d: 13, type: 'd', name: 'Abdul Rahman Ghassemlou', role: 'Leader of KDPI',                         years: '1930—1989', wiki: 'https://en.wikipedia.org/wiki/Abdul_Rahman_Ghassemlou' },
    { m: 8,  d: 4,  type: 'd', name: 'Şêrko Bêkes',             role: 'Kurdish poet',                            years: '1940—2013', wiki: 'https://en.wikipedia.org/wiki/Sherko_Bekas' },
    { m: 8,  d: 8,  type: 'd', name: 'Aram Tigran',             role: 'Kurdish musician',              years: '1934—2009', wiki: 'https://en.wikipedia.org/wiki/Aram_Tigran' },
    { m: 8,  d: 16, type: 'b', name: 'Massoud Barzani',         role: 'KDP leader, former president of KRI',    years: 'b. 1946',   wiki: 'https://en.wikipedia.org/wiki/Massoud_Barzani' },
    { m: 9,  d: 9,  type: 'd', name: 'Yılmaz Güney',            role: 'Kurdish filmmaker',              years: '1937—1984', wiki: 'https://en.wikipedia.org/wiki/Y%C4%B1lmaz_G%C3%BCney' },
    { m: 9,  d: 17, type: 'd', name: 'Sadegh Sharafkandi',      role: 'Successor of Ghassemlou (KDPI)',          years: '1938—1992', wiki: 'https://en.wikipedia.org/wiki/Sadegh_Sharafkandi' },
    { m: 10, d: 3,  type: 'd', name: 'Jalal Talabani',          role: 'Co-founder of PUK, President of Iraq',   years: '1933—2017', wiki: 'https://en.wikipedia.org/wiki/Jalal_Talabani' },
    { m: 10, d: 6,  type: 'b', name: 'Yaşar Kemal',             role: 'Kurdish novelist',               years: '1923—2015', wiki: 'https://en.wikipedia.org/wiki/Ya%C5%9Far_Kemal' },
    { m: 10, d: 9,  type: 'd', name: 'Sheikh Mahmud Barzanji',  role: 'King of Kurdistan (1922—1924)',          years: '1878—1956', wiki: 'https://en.wikipedia.org/wiki/Mahmud_Barzanji' },
    { m: 10, d: 11, type: 'd', name: 'Mehmed Uzun',             role: 'Kurdish novelist',                       years: '1953—2007', wiki: 'https://en.wikipedia.org/wiki/Mehmed_Uzun' },
    { m: 10, d: 12, type: 'd', name: 'Hevrîn Xelef',            role: 'Kurdish politician',              years: '1984—2019', wiki: 'https://en.wikipedia.org/wiki/Hevrin_Khalaf' },
    { m: 10, d: 22, type: 'd', name: 'Cegerxwîn',               role: 'Kurdish poet',                          years: '1903—1984', wiki: 'https://en.wikipedia.org/wiki/Cegerxw%C3%AEn' },
    { m: 11, d: 9,  type: 'b', name: 'Piremerd',                role: 'Kurdish poet, journalist',                years: '1867—1950', wiki: 'https://en.wikipedia.org/wiki/Piremerd' },
    { m: 11, d: 9,  type: 'b', name: 'Abdulla Pashew',          role: 'Kurdish poet',                            years: 'b. 1946',   wiki: 'https://en.wikipedia.org/wiki/Abdulla_Pashew' },
    { m: 11, d: 12, type: 'b', name: 'Jalal Talabani',          role: 'Co-founder of PUK, President of Iraq',   years: '1933—2017', wiki: 'https://en.wikipedia.org/wiki/Jalal_Talabani' },
    { m: 11, d: 18, type: 'b', name: 'Ehmedê Xanî',             role: 'Classical poet',                         years: '~1651—1707',wiki: 'https://en.wikipedia.org/wiki/Ahmad_Khani' },
    { m: 11, d: 18, type: 'd', name: 'Goran',                   role: 'Kurdish modernist poet',                  years: '1904—1962', wiki: 'https://en.wikipedia.org/wiki/Abdulla_Goran' },
    { m: 12, d: 16, type: 'd', name: 'Mihemed Mamlê',           role: 'Kurdish singer',                         years: '1925—1999', wiki: 'https://en.wikipedia.org/wiki/Mohammad_Mamle' },
    { m: 12, d: 18, type: 'd', name: 'Eyşe Şan',                role: 'Kurdish singer',                         years: '1938—1996', wiki: 'https://en.wikipedia.org/wiki/Ay%C5%9Fe_%C5%9Fan' },
    { m: 12, d: 22, type: 'b', name: 'Abdul Rahman Ghassemlou', role: 'Leader of KDPI',                         years: '1930—1989', wiki: 'https://en.wikipedia.org/wiki/Abdul_Rahman_Ghassemlou' },
    { m: 12, d: 23, type: 'b', name: 'Şivan Perwer',            role: 'Kurdish singer',                         years: 'b. 1955',   wiki: 'https://en.wikipedia.org/wiki/%C5%9Eivan_Perwer' },
    { m: 4,  d: 26, type: 'b', name: 'Celadet Bedirxan',        role: 'Linguist, founder of Hawar journal',     years: '1893—1951', wiki: 'https://en.wikipedia.org/wiki/Celadet_Ali_Bedirkhan' },
    { m: 9,  d: 21, type: 'b', name: 'Kamuran Bedirxan',        role: 'Writer, diplomat',                       years: '1895—1978', wiki: 'https://en.wikipedia.org/wiki/Kamuran_Bedirkhan' },
    { m: 11, d: 15, type: 'd', name: 'Idris Bitlisi',           role: 'Historian, statesman',                   years: '1457—1520', wiki: 'https://en.wikipedia.org/wiki/Idris_Bitlisi' },
    { m: 6,  d: 4,  type: 'd', name: 'Hesen Zîrek',             role: 'Kurdish singer',                          years: '1921—1972', wiki: 'https://en.wikipedia.org/wiki/Hassan_Zirak' },
    { m: 10, d: 28, type: 'b', name: 'Ahmet Kaya',              role: 'Kurdish singer',                 years: '1957—2000', wiki: 'https://en.wikipedia.org/wiki/Ahmet_Kaya' },
    { m: 11, d: 16, type: 'd', name: 'Ahmet Kaya',              role: 'Kurdish singer',                 years: '1957—2000', wiki: 'https://en.wikipedia.org/wiki/Ahmet_Kaya' },
    { m: 2,  d: 1,  type: 'b', name: 'Bahman Ghobadi',          role: 'Kurdish filmmaker',                      years: 'b. 1969',   wiki: 'https://en.wikipedia.org/wiki/Bahman_Ghobadi' },
    { m: 3,  d: 10, type: 'b', name: 'Nadia Murad',             role: 'Yezîdî activist, Nobel laureate',         years: 'b. 1993',   wiki: 'https://en.wikipedia.org/wiki/Nadia_Murad' },
    { m: 4,  d: 10, type: 'b', name: 'Selahattin Demirtaş',     role: 'Kurdish politician',             years: 'b. 1973',   wiki: 'https://en.wikipedia.org/wiki/Selahattin_Demirta%C5%9F' },
    { m: 5,  d: 22, type: 'd', name: 'Mîr Bedirxan',            role: 'Kurdish prince',                         years: '1803—1869', wiki: 'https://en.wikipedia.org/wiki/Bedir_Khan_Beg' },
    { m: 7,  d: 1,  type: 'b', name: 'Karim Khan Zand',         role: 'Founder of the Zand dynasty',             years: '~1705—1779',wiki: 'https://en.wikipedia.org/wiki/Karim_Khan_Zand' },
    { m: 4,  d: 28, type: 'b', name: 'Bextiyar Elî',            role: 'Kurdish novelist',                         years: 'b. 1966',   wiki: 'https://en.wikipedia.org/wiki/Bachtyar_Ali' }
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

  // ---- Computed (year-dependent) events ----
  // Çarşema Sor (Yezidi New Year): first Wednesday on or after 14 April.
  function carsemaSor(year) {
    for (var d = 14; d <= 20; d++) {
      if (new Date(year, 3, d).getDay() === 3) {
        return { m: 4, d: d, name: 'Çarşema Sor (Yezidi New Year)', sub: 'First Wednesday of Nisan in the Yezidi religious calendar', slug: 'carsema-sor' };
      }
    }
    return null;
  }
  var COMPUTED_EVENTS = [carsemaSor];

  function eventsForYear(year) {
    var computed = COMPUTED_EVENTS.map(function (fn) { return fn(year); }).filter(Boolean);
    return EVENTS.concat(computed);
  }

  function eventOn(month, day, year) {
    var y = year || new Date().getFullYear();
    return eventsForYear(y).filter(function (e) { return e.m === month && e.d === day; });
  }

  function figuresOn(month, day) {
    return FIGURES.filter(function (f) { return f.m === month && f.d === day; });
  }

  function describe(date) {
    var g = (date instanceof Date) ? date : new Date(date);
    var p = gregToJalali(g.getFullYear(), g.getMonth() + 1, g.getDate());
    var ky = p.y + KURD_YEAR_OFFSET;
    var ckDowIdx = (g.getDay() + 1) % 7; // week starts Saturday
    var matches = eventOn(g.getMonth() + 1, g.getDate(), g.getFullYear());
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

  function events(year) { return eventsForYear(year || new Date().getFullYear()); }

  function figures() { return FIGURES.slice(); }

  function daysUntilNewroz() {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var target = new Date(today.getFullYear(), 2, 21);
    if (target < today) target = new Date(today.getFullYear() + 1, 2, 21);
    return Math.round((target - today) / 86400000);
  }

  // ---------- Sorani Arabic-script → Latin transliteration ----------
  // Hawar/Bedirxan-style mapping with contextual و/ی and schwa epenthesis to
  // break impermissible consonant clusters (ئاگر → Agir, کتێب → Kitêb,
  // کوردستان → Kurdistan).
  var CK_AR_TO_LAT = {
    'ا':'a','آ':'a','ب':'b','پ':'p','ت':'t','ج':'c','چ':'ç',
    'ح':'h','خ':'x','د':'d','ر':'r','ڕ':'rr','ز':'z','ژ':'j',
    'س':'s','ش':'ş','ع':'','غ':'gh','ف':'f','ڤ':'v','ق':'q',
    'ک':'k','ك':'k','گ':'g','ل':'l','ڵ':'l','م':'m','ن':'n',
    'ھ':'h','ه':'h','ە':'e','ۆ':'o','ێ':'ê',
    'ئ':'','ؤ':'','ء':'','ـ':'',
    '٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9',
    '،':',','؛':';','؟':'?','«':'"','»':'"'
  };
  var CK_CONS = {};
  'بپتجچحخدرڕزژسشعغفڤقکكگلڵمنھه'.split('').forEach(function (c) { CK_CONS[c] = 1; });
  var CK_VOW_LET = {};
  'اآەێۆ'.split('').forEach(function (c) { CK_VOW_LET[c] = 1; });
  function CK_AMB(c) { return c === 'و' || c === 'ی'; }
  function CK_LETTER(c) { return CK_CONS[c] || CK_VOW_LET[c] || CK_AMB(c); }
  var CK_PERM_FIN = {};
  ('rd rt rk rg rp rb rs rş rz rj rç rm rn rl rv rf rx ' +
   'ld lt lk lp ls lm lf ' +
   'nd nt nk ng ns nş nc nj nz ' +
   'mp mb ms mr mn ' +
   'st sk sp sm sn sl sr ' +
   'ft xt kt şt çt pt ' +
   'ks ps ts xs vs fs ' +
   'şm şn şk şr').split(' ').forEach(function (c) { CK_PERM_FIN[c] = 1; });
  var CK_VOWELS_LAT = 'aeêioîuûAEÊIOÎUÛ';
  function isLatVow(c)  { return c && CK_VOWELS_LAT.indexOf(c) >= 0; }
  function isLatCons(c) { return c && /[A-ɏÀ-ÿ]/.test(c) && !isLatVow(c); }

  function ckEpenthRun(run, atStart, atEnd) {
    var n = run.length;
    if (n <= 1) return run;
    if (n === 2) {
      if (atStart) return run.charAt(0) + 'i' + run.charAt(1);
      if (atEnd)   return CK_PERM_FIN[run.toLowerCase()] ? run : (run.charAt(0) + 'i' + run.charAt(1));
      return run;
    }
    if (atStart) return run.charAt(0) + 'i' + ckEpenthRun(run.slice(1), false, atEnd);
    var last2 = run.slice(n - 2).toLowerCase();
    if (CK_PERM_FIN[last2]) {
      return ckEpenthRun(run.slice(0, n - 2), false, false) + 'i' + run.slice(n - 2);
    }
    return ckEpenthRun(run.slice(0, n - 1), false, false) + 'i' + run.charAt(n - 1);
  }

  function ckEpenthesize(latin) {
    return latin.replace(/[A-Za-zÀ-ÿĀ-ſ']+/g, function (word) {
      var N = word.length, out = '', i = 0;
      while (i < N) {
        if (!isLatCons(word.charAt(i))) { out += word.charAt(i); i++; continue; }
        var j = i;
        while (j < N && isLatCons(word.charAt(j))) j++;
        out += ckEpenthRun(word.slice(i, j), i === 0, j === N);
        i = j;
      }
      return out;
    });
  }

  function arToLatin(s) {
    if (!s) return '';
    s = String(s).replace(/وو/g, '');
    var chars = s.split('');
    var out = '';
    for (var i = 0; i < chars.length; i++) {
      var c = chars[i];
      if (c === '') { out += 'û'; continue; }
      if (CK_AMB(c)) {
        var prev = chars[i - 1] || '';
        var next = chars[i + 1] || '';
        var prevIsCons = !!CK_CONS[prev];
        var nextIsCons = !!CK_CONS[next];
        var nextIsLetter = CK_LETTER(next);
        var asVowel = prevIsCons && (nextIsCons || !nextIsLetter);
        if (c === 'و') out += asVowel ? 'u' : 'w';
        else out += asVowel ? 'î' : 'y';
        continue;
      }
      out += (c in CK_AR_TO_LAT) ? CK_AR_TO_LAT[c] : c;
    }
    return ckEpenthesize(out);
  }

  function titleCaseLatin(s) {
    return String(s || '').replace(/(^|[\s\-])([A-Za-zÀ-ÿĀ-ſ])/g, function (m, sep, ch) {
      return sep + ch.toUpperCase();
    });
  }

  return {
    version: '3.6.0',
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
    arDigits: arDigits,
    // Sorani text conversion: Arabic-script → Latin (Hawar/Bedirxan with
    // schwa epenthesis) and a title-case helper for names.
    arToLatin: arToLatin,
    titleCaseLatin: titleCaseLatin
  };
});
