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
 *     // Each event/figure carries bilingual fields:
 *     //   { name, sub, name_ar, sub_ar, … }                       (events)
 *     //   { name, role, bio, name_ar, role_ar, bio_ar, … }        (figures)
 *
 *     // Sorani text conversion (Arabic-script → Hawar/Bedirxan Latin) —
 *     // contextual و/ی, schwa epenthesis, ي→ی + ك→ک normalization:
 *     KurdishCalendar.arToLatin('ئاگر');                // → 'agir'
 *     KurdishCalendar.arToLatin('کوردستان');            // → 'kurdistan'
 *     KurdishCalendar.arToLatin('دەنگی يار مەيۆ');      // → 'dengî yar meyo'
 *     KurdishCalendar.titleCaseLatin('hejar');          // → 'Hejar'
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
    { m: 1,  d: 22, name: 'Republic of Kurdistan',                    sub: 'Founding in Mahabad (1946)',                name_ar: 'کۆماری کوردستان', sub_ar: 'دامەزراندن لە مەهاباد (١٩٤٦)', slug: 'mahabad' },
    { m: 1,  d: 26, name: 'Liberation of Kobanê',                     sub: 'End of the ISIS siege (2015)',              name_ar: 'ڕزگاربوونی کۆبانی', sub_ar: 'کۆتایی گەمارۆی داعش (٢٠١٥)', slug: 'kobane-liberation' },
    { m: 2,  d: 21, name: 'Mother Language Day',                      sub: 'International',                             name_ar: 'ڕۆژی زمانی دایک', sub_ar: 'نێودەوڵەتی', slug: 'mother-language' },
    { m: 3,  d: 16, name: 'Halabja Memorial',                         sub: 'Chemical attack remembrance (1988)',        name_ar: 'یادی هەڵەبجە', sub_ar: 'یادی هێرشی کیمیایی (١٩٨٨)', slug: 'halabja' },
    { m: 3,  d: 21, name: 'Newroz',                                   sub: 'Kurdish New Year',                          name_ar: 'نەورۆز', sub_ar: 'سەری ساڵی کوردی', slug: 'newroz' },
    { m: 3,  d: 31, name: 'Execution of the Republic of Kurdistan leaders', sub: 'Qazi Muhammad and others (1947)',     name_ar: 'لەسێدارەدانی سەرکردایەتی کۆماری کوردستان', sub_ar: 'قازی محەممەد و چەند کەسی تر (١٩٤٧)', slug: 'mahabad-execution' },
    { m: 4,  d: 14, name: 'Anfal Memorial',                           sub: 'Anfal campaign remembrance',                name_ar: 'یادی ئەنفال', sub_ar: 'یادی شاڵاوی ئەنفال', slug: 'anfal' },
    { m: 5,  d: 15, name: 'Roja Zimanê Kurdî',                        sub: 'Kurdish Language Day',                      name_ar: 'ڕۆژی زمانی کوردی', sub_ar: 'ڕۆژی نیشتمانیی زمان', slug: 'kurdish-language' },
    { m: 6,  d: 1,  name: 'Founding of the PUK',                      sub: 'Patriotic Union of Kurdistan (1975)',       name_ar: 'دامەزراندنی یەکێتی', sub_ar: 'یەکێتیی نیشتمانیی کوردستان (١٩٧٥)', slug: 'puk-founding' },
    { m: 7,  d: 19, name: 'Rojava Revolution',                        sub: 'Anniversary (2012)',                        name_ar: 'شۆڕشی ڕۆژاوا', sub_ar: 'یادی (٢٠١٢)', slug: 'rojava-revolution' },
    { m: 8,  d: 3,  name: 'Yezîdî Genocide Memorial',                 sub: 'Sinjar attack remembrance (2014)',          name_ar: 'یادی جینۆسایدی ئێزدییەکان', sub_ar: 'یادی هێرشی شنگال (٢٠١٤)', slug: 'yezidi-memorial' },
    { m: 8,  d: 16, name: 'Founding of the KDP',                      sub: 'Kurdistan Democratic Party (1946)',         name_ar: 'دامەزراندنی پارتی', sub_ar: 'پارتیی دیموکراتیی کوردستان (١٩٤٦)', slug: 'kdp-founding' },
    { m: 9,  d: 25, name: 'Kurdistan Independence Referendum',        sub: '2017',                                      name_ar: 'ڕیفراندۆمی سەربەخۆیی کوردستان', sub_ar: '٢٠١٧', slug: 'referendum' },
    { m: 9,  d: 13, name: 'Beginning of the Siege of Kobanê',         sub: 'ISIS attack on Kobanê (2014)',              name_ar: 'دەستپێکی گەمارۆی کۆبانی', sub_ar: 'هێرشی داعش بۆ کۆبانی (٢٠١٤)', slug: 'kobane-siege' },
    { m: 12, d: 16, name: 'Fall of the Republic of Kurdistan',        sub: 'Mahabad re-occupied by Iranian forces (1946)',          name_ar: 'کەوتنی کۆماری کوردستان', sub_ar: 'داگیرکردنەوەی مەهاباد لەلایەن هێزە ئێرانییەکان (١٩٤٦)', slug: 'mahabad-fall' },
    { m: 12, d: 17, name: 'Kurdish Flag Day',                         sub: 'Adopted in Kurdistan Region (1999)',                    name_ar: 'ڕۆژی ئاڵای کوردستان', sub_ar: 'پەسەندکراوە لە هەرێمی کوردستان (١٩٩٩)', slug: 'flag-day' },
    // Treaties and major historical turning points
    { m: 8,  d: 23, name: 'Battle of Chaldiran',                      sub: '1514 — Ottoman-Safavid war; Kurdistan split between two empires', name_ar: 'جەنگی چاڵدێران', sub_ar: '١٥١٤ — جەنگی عوسمانی-سەفەوی؛ کوردستان دابەش بوو', slug: 'chaldiran' },
    { m: 5,  d: 17, name: 'Treaty of Zuhab',                          sub: '1639 — first formal partition of Kurdistan',            name_ar: 'پەیماننامەی زوهاب', sub_ar: '١٦٣٩ — یەکەم پارچەکردنی فەرمیی کوردستان', slug: 'zuhab' },
    { m: 8,  d: 10, name: 'Treaty of Sèvres',                         sub: '1920 — first international promise of a Kurdish state', name_ar: 'پەیماننامەی سێڤر', sub_ar: '١٩٢٠ — یەکەم بەڵێنی نێودەوڵەتی بۆ دەوڵەتی کورد', slug: 'sevres' },
    { m: 7,  d: 24, name: 'Treaty of Lausanne',                       sub: '1923 — replaced Sèvres; partitioned Kurdistan',         name_ar: 'پەیماننامەی لۆزان', sub_ar: '١٩٢٣ — جێگری سێڤر؛ پارچەکردنی کوردستان', slug: 'lausanne' },
    { m: 4,  d: 7,  name: 'Establishment of the No-Fly Zone',         sub: '1991 — protected Iraqi Kurdistan after the uprising',   name_ar: 'دامەزراندنی ناوچەی نەفڕین', sub_ar: '١٩٩١ — پاراستنی کوردستانی عێراق پاش ڕاپەڕین', slug: 'no-fly-zone' },
    { m: 5,  d: 19, name: 'First Kurdistan Region elections',         sub: '1992 — first parliamentary vote in Iraqi Kurdistan',    name_ar: 'یەکەم هەڵبژاردنی هەرێمی کوردستان', sub_ar: '١٩٩٢ — یەکەم دەنگدانی پەرلەمانی لە کوردستانی عێراق', slug: 'kri-elections' },
    { m: 10, d: 16, name: 'Iraqi forces re-take Kirkuk',              sub: '2017 — aftermath of the independence referendum',       name_ar: 'گرتنەوەی کەرکوک لەلایەن هێزە عێراقییەکان', sub_ar: '٢٠١٧ — پاش ڕیفراندۆم', slug: 'kirkuk-2017' },
    // Major uprisings
    { m: 2,  d: 13, name: 'Beginning of the Sheikh Said rebellion',   sub: '1925 — Kurdish uprising in Turkey',                     name_ar: 'دەستپێکی ڕاپەڕینی شێخ سەعید', sub_ar: '١٩٢٥ — ڕاپەڕینی کورد لە تورکیا', slug: 'sheikh-said-rebellion' },
    { m: 3,  d: 5,  name: 'Beginning of the 1991 Kurdish uprising',   sub: 'Iraqi Kurds rise after the Gulf War',                   name_ar: 'دەستپێکی ڕاپەڕینی ١٩٩١', sub_ar: 'کوردانی عێراق هەستان پاش جەنگی کەنداو', slug: '1991-uprising' },
    { m: 3,  d: 12, name: 'Qamişlo uprising',                         sub: '2004 — Syrian Kurdish uprising',                        name_ar: 'ڕاپەڕینی قامیشلۆ', sub_ar: '٢٠٠٤ — ڕاپەڕینی کوردانی سوریا', slug: 'qamishlo-uprising' },
    { m: 9,  d: 16, name: 'Death of Jina Mahsa Amini',                sub: '2022 — sparked the Jin Jiyan Azadî movement',           name_ar: 'کۆچی دوایی ژینا مەهسا ئەمینی', sub_ar: '٢٠٢٢ — هاندەری بزووتنەوەی ژن ژیان ئازادی', slug: 'jina-amini' },
    // Major Kurdish political organizations (chronological, neutral)
    { m: 9,  d: 20, name: 'Founding of the PYD',                      sub: '2003 — Democratic Union Party (Syrian Kurdistan)',                name_ar: 'دامەزراندنی پی‌دی‌دی', sub_ar: '٢٠٠٣ — پارتیی یەکێتیی دیموکراتی (کوردستانی سوریا)', slug: 'pyd-founding' },
    { m: 9,  d: 21, name: 'Founding of Gorran',                       sub: '2009 — Movement for Change (Iraqi Kurdistan)',                    name_ar: 'دامەزراندنی گۆڕان', sub_ar: '٢٠٠٩ — بزووتنەوەی گۆڕان (کوردستانی عێراق)', slug: 'goran-founding' },
    { m: 9,  d: 26, name: 'Founding of Komala',                       sub: '1969 — Society of Revolutionary Toilers (Iranian Kurdistan)',     name_ar: 'دامەزراندنی کۆمەڵە', sub_ar: '١٩٦٩ — کۆمەڵەی شۆڕشگێڕانی زەحمەتکێشانی کوردستانی ئێران', slug: 'komala-founding' },
    { m: 10, d: 5,  name: 'Founding of the Khoybûn League',           sub: '1927 — first transnational Kurdish nationalist organization', name_ar: 'دامەزراندنی خۆیبوون', sub_ar: '١٩٢٧ — یەکەم ڕێکخراوی نیشتمانیی نێودەوڵەتیی کورد', slug: 'khoyboun' },
    { m: 8,  d: 16, name: 'Founding of the KDP-Iran (KDPI)',          sub: '1945 — Democratic Party of Iranian Kurdistan',          name_ar: 'دامەزراندنی پارتی دیموکراتی کوردستانی ئێران', sub_ar: '١٩٤٥ — پارتی دیموکراتیی کوردستانی ئێران', slug: 'kdpi-founding' },
    { m: 11, d: 27, name: 'Founding of the PKK',                      sub: '1978 — Kurdistan Workers\' Party',                      name_ar: 'دامەزراندنی پی‌کی‌کە', sub_ar: '١٩٧٨ — پارتی کرێکارانی کوردستان', slug: 'pkk-founding' },
    { m: 10, d: 15, name: 'Founding of the HDP',                      sub: '2012 — Peoples\' Democratic Party (Turkey)',            name_ar: 'دامەزراندنی هە‌دە‌پە', sub_ar: '٢٠١٢ — پارتیی دیموکراتیکی گەلان (تورکیا)', slug: 'hdp-founding' },
  ];

  var FIGURES = [
    // January
    { m: 1,  d: 1,  type: 'b', name: 'Mehmed Uzun',                role: 'Kurdish novelist',                  years: '1953—2007', bio: 'Kurdish novelist whose works revived modern literary Kurdish. Lived much of his life in Swedish exile.', wiki: 'https://en.wikipedia.org/wiki/Mehmed_Uzun', name_ar: 'محەممەد ئوزون', role_ar: 'ڕۆماننووسی کورد', bio_ar: 'ڕۆماننووسی ناودار، نووسینەکانی ئەدەبیاتی هاوچەرخی کوردیی نوێی زیندوو کردەوە. زۆربەی ژیانی لە سوێد لە دوورخراوەییدا بەسەربرد.' },
    { m: 1,  d: 9,  type: 'd', name: 'Sakine Cansız',              role: 'Kurdish political activist',        years: '1958—2013', bio: 'Co-founder of the PKK; assassinated in Paris in 2013.', wiki: 'https://en.wikipedia.org/wiki/Sakine_Cans%C4%B1z', name_ar: 'سەکینە جانسز', role_ar: 'چالاکی سیاسیی کورد', bio_ar: 'یەکێک لە دامەزرێنەرانی پکک؛ لە ٢٠١٣ لە پاریس تیرۆر کرا.' },
    { m: 1,  d: 15, type: 'b', name: 'Aram Tigran',                role: 'Kurdish musician',         years: '1934—2009', bio: 'Beloved singer who composed and performed in Kurdish, Armenian, Turkish, and Arabic.', wiki: 'https://en.wikipedia.org/wiki/Aram_Tigran', name_ar: 'ئارام تیگران', role_ar: 'موزیکژەنی کورد', bio_ar: 'گۆرانیبێژی خۆشەویست، بە کوردی، ئەرمەنی، تورکی و عەرەبی گۆرانی دەوت.' },
    { m: 1,  d: 31, type: 'd', name: 'Idris Barzani',              role: 'Kurdish leader',                    years: '1944—1987', bio: 'Son of Mustafa Barzani and joint leader of the KDP after his father; succeeded by his brother Massoud.', wiki: 'https://en.wikipedia.org/wiki/Idris_Barzani', name_ar: 'ئیدریس بارزانی', role_ar: 'سەرکردەی کورد', bio_ar: 'کوڕی مەلا مستەفا بارزانی و سەرکردەی هاوبەشی پارتی پاش باوکی؛ پاشان مەسعود جێی گرتەوە.' },

    // February
    { m: 2,  d: 12, type: 'b', name: 'Sakine Cansız',              role: 'Kurdish political activist',        years: '1958—2013', bio: 'Co-founder of the PKK and a long-time political prisoner.', wiki: 'https://en.wikipedia.org/wiki/Sakine_Cans%C4%B1z', name_ar: 'سەکینە جانسز', role_ar: 'چالاکی سیاسیی کورد', bio_ar: 'یەکێک لە دامەزرێنەرانی پکک و گرتووی سیاسیی درێژخایەن.' },
    { m: 2,  d: 22, type: 'd', name: 'Hejar Mukrîyanî',            role: 'Kurdish poet and translator',         years: '1920—1991', bio: 'Pen name of Abdurrahman Sharafkandi. Translator of the Quran and the Shahnameh into Kurdish.', wiki: 'https://en.wikipedia.org/wiki/Hejar', name_ar: 'ھەژار موکریانی', role_ar: 'شاعیر و وەرگێڕی کورد', bio_ar: 'ناوی نهێنیی عبدالڕحمن شەرەفکەندی. وەرگێڕی قورئان و شاهنامە بۆ کوردی.' },
    { m: 2,  d: 25, type: 'b', name: 'Sharaf Khan Bidlisi',        role: 'Historian, prince of Bitlis',       years: '1543—1603', bio: 'Author of the Sharafnama (1597), the first major historical chronicle of the Kurds.', wiki: 'https://en.wikipedia.org/wiki/Sharaf_Khan_Bidlisi', name_ar: 'شەرەفخانی بدلیسی', role_ar: 'مێژوونووس، میری بدلیس', bio_ar: 'نووسەری شەرەفنامە (١٥٩٧)، یەکەم کرۆنیکی مێژووییی گرنگ سەبارەت بە کورد.' },
    { m: 2,  d: 28, type: 'd', name: 'Yaşar Kemal',                role: 'Kurdish novelist',          years: '1923—2015', bio: 'Author of Memed, My Hawk; one of the great Turkish-language novelists of the 20th century, of Kurdish origin.', wiki: 'https://en.wikipedia.org/wiki/Ya%C5%9Far_Kemal', name_ar: 'یاشار کەمال', role_ar: 'ڕۆماننووسی کورد', bio_ar: 'نووسەری «مەحمەد، باژەکەم»؛ یەکێک لە ڕۆماننووسە مەزنەکانی سەدەی بیستەمی زمانی تورکی، بنەچەی کوردی.' },

    // March
    { m: 3,  d: 1,  type: 'd', name: 'Mustafa Barzani',            role: 'Kurdish leader',                    years: '1903—1979', bio: 'Founding leader of the modern Kurdish national movement in Iraq; Defense Minister of the Republic of Kurdistan.', wiki: 'https://en.wikipedia.org/wiki/Mustafa_Barzani', name_ar: 'مەلا مستەفا بارزانی', role_ar: 'سەرکردەی کورد', bio_ar: 'دامەزرێنەری بزووتنەوەی نیشتمانیی نوێی کورد لە عێراق؛ وەزیری بەرگری کۆماری کوردستان.' },
    { m: 3,  d: 4,  type: 'd', name: 'Saladin (Selahaddînê Eyûbî)',role: 'Sultan and military leader',        years: '1137—1193', bio: 'Founder of the Ayyubid dynasty; of Kurdish origin from Tikrit. Recaptured Jerusalem in 1187.', wiki: 'https://en.wikipedia.org/wiki/Saladin', name_ar: 'سەڵاحەددینی ئەییووبی', role_ar: 'سوڵتان و سەرکردەی سەربازی', bio_ar: 'دامەزرێنەری دودمانی ئەییوبی؛ کوردی تکریتی. لە ١١٨٧ بەیت‌المقدسی گرتەوە.' },
    { m: 3,  d: 14, type: 'b', name: 'Mustafa Barzani',            role: 'Kurdish leader',                    years: '1903—1979', bio: 'Founding leader of the modern Kurdish national movement in Iraq.', wiki: 'https://en.wikipedia.org/wiki/Mustafa_Barzani', name_ar: 'مەلا مستەفا بارزانی', role_ar: 'سەرکردەی کورد', bio_ar: 'دامەزرێنەری بزووتنەوەی نیشتمانیی نوێی کورد لە عێراق.' },
    { m: 3,  d: 15, type: 'b', name: 'Hejar Mukrîyanî',            role: 'Kurdish poet and translator',         years: '1920—1991', bio: 'Major figure in 20th-century Kurdish letters; produced one of the most important Kurdish dictionaries.', wiki: 'https://en.wikipedia.org/wiki/Hejar', name_ar: 'ھەژار موکریانی', role_ar: 'شاعیر و وەرگێڕی کورد', bio_ar: 'سیمایەکی گرنگ لە ئەدەبی کوردیی سەدەی بیستەم؛ یەکێک لە گرنگترین فەرهەنگەکانی کوردیی پێکهێنا.' },
    { m: 3,  d: 31, type: 'd', name: 'Qazi Muhammad',              role: 'President of the Republic of Kurdistan', years: '1893—1947', bio: 'Founder and only president of the short-lived Republic of Kurdistan (1946). Executed in 1947 in the same square where he proclaimed the republic.', wiki: 'https://en.wikipedia.org/wiki/Qazi_Muhammad', name_ar: 'قازی محەممەد', role_ar: 'سەرۆکی کۆماری کوردستان', bio_ar: 'دامەزرێنەر و تاکە سەرۆکی کۆماری کوردستان (١٩٤٦). لە ١٩٤٧ لەسێدارە درا، لەو گۆڕەپانەی کۆمارەکەی تێیدا ڕاگەیاند.' },

    // April
    { m: 4,  d: 1,  type: 'b', name: 'Yılmaz Güney',               role: 'Kurdish filmmaker',         years: '1937—1984', bio: 'Director of "Yol" (Palme d\'Or, 1982); one of the most acclaimed filmmakers of his generation.', wiki: 'https://en.wikipedia.org/wiki/Y%C4%B1lmaz_G%C3%BCney', name_ar: 'یەڵماز گونەی', role_ar: 'فیلمسازی کورد', bio_ar: 'دەرهێنەری «یۆل» (پاڵمەی زێڕین، ١٩٨٢)؛ یەکێک لە دەرهێنەرە بەناوبانگەکانی نەوەی خۆی.' },
    { m: 4,  d: 4,  type: 'b', name: 'Abdullah Öcalan',            role: 'Founder of the PKK',                years: 'b. 1948',   bio: 'Co-founder of the PKK and one of the most influential — and controversial — figures in modern Kurdish politics. Imprisoned in Turkey since 1999.', wiki: 'https://en.wikipedia.org/wiki/Abdullah_%C3%96calan', name_ar: 'عەبدوڵڵا ئۆجەلان', role_ar: 'دامەزرێنەری پکک', bio_ar: 'هاوبەشی دامەزرێنەری پکک و یەکێک لە کاریگەرترین — و دژبەرترین — کەسایەتیی سیاسەتی کوردیی هاوچەرخ. لە ١٩٩٩ەوە لە تورکیا گیراوە.' },
    { m: 4,  d: 18, type: 'd', name: 'Hêmin Mukrîyanî',            role: 'Kurdish poet',                       years: '1921—1986', bio: 'Pen name of Mohammad Amin Sheikhalislami. One of the leading Kurdish poets of the 20th century.', wiki: 'https://en.wikipedia.org/wiki/H%C3%AAmin', name_ar: 'ھێمن موکریانی', role_ar: 'شاعیری کورد', bio_ar: 'ناوی نهێنیی محمد ئەمین شێخ‌الئسلامی. یەکێک لە سەرۆک شاعیرانی کوردیی سەدەی بیستەم.' },

    // May
    { m: 5,  d: 2,  type: 'b', name: 'Şêrko Bêkes',                role: 'Kurdish poet',                       years: '1940—2013', bio: 'One of the giants of modern Kurdish poetry. Pioneered the "poster poem" form.', wiki: 'https://en.wikipedia.org/wiki/Sherko_Bekas', name_ar: 'شێرکۆ بێکەس', role_ar: 'شاعیری کورد', bio_ar: 'یەکێک لە کۆلۆسەکانی شیعری کوردیی نوێ. شێوازی «شیعری پۆستەر»ی بنیادنا.' },
    { m: 5,  d: 3,  type: 'b', name: 'Leyla Zana',                 role: 'Kurdish politician',        years: 'b. 1961',   bio: 'First Kurdish woman elected to the Turkish parliament; sentenced for speaking Kurdish at her swearing-in.', wiki: 'https://en.wikipedia.org/wiki/Leyla_Zana', name_ar: 'لەیلا زانا', role_ar: 'سیاسەتمەداری کورد', bio_ar: 'یەکەم ژنی کورد لە پەرلەمانی تورکیا هەڵبژێردرا؛ بۆ قسەکردن بە کوردی لە مەراسیمی سوێندخواردنەکەی حوکم درا.' },
    { m: 5,  d: 9,  type: 'd', name: 'Ferzad Kemanger',            role: 'Kurdish teacher and activist',      years: '1975—2010', bio: 'Kurdish teacher and human-rights activist; executed by Iran on charges he denied.', wiki: 'https://en.wikipedia.org/wiki/Farzad_Kamangar', name_ar: 'فەرزاد کەمانگەر', role_ar: 'مامۆستا و چالاکی کورد', bio_ar: 'مامۆستا و چالاکی مافی مرۆڤی کوردی ئێرانی؛ لەلایەن ئێرانەوە لەسێدارە درا، تاوانێک کە خۆی نکۆڵی لێ کرد.' },
    { m: 5,  d: 12, type: 'd', name: 'Leyla Qasim',                role: 'Kurdish activist',                  years: '1952—1974', bio: 'First Kurdish woman to be executed for political activism in modern Iraq. Member of the KDP.', wiki: 'https://en.wikipedia.org/wiki/Leyla_Qasim', name_ar: 'لەیلا قاسم', role_ar: 'چالاکی کورد', bio_ar: 'یەکەم ژنی کورد کە لە عێراقی نوێدا بۆ چالاکی سیاسی لەسێدارە درا. ئەندامی پارتی.' },
    { m: 5,  d: 15, type: 'b', name: 'Salim Barakat',              role: 'Kurdish poet and novelist',  years: 'b. 1951',   bio: 'Major contemporary Arabic-language poet and novelist of Kurdish origin from Qamishli.', wiki: 'https://en.wikipedia.org/wiki/Salim_Barakat', name_ar: 'سەلیم بەرەکات', role_ar: 'شاعیر و ڕۆماننووسی کورد', bio_ar: 'شاعیر و ڕۆماننووسی هاوچەرخی زمانی عەرەبی، بنەچەی کوردی لە قامیشلۆ.' },

    // June
    { m: 6,  d: 11, type: 'd', name: 'Piremerd',                   role: 'Kurdish poet, journalist',           years: '1867—1950', bio: 'Pen name of Hac Tofiq. Influential Kurdish poet, journalist, and educator from Sulaymaniyah.', wiki: 'https://en.wikipedia.org/wiki/Piremerd', name_ar: 'پیرەمێرد', role_ar: 'شاعیر و ڕۆژنامەنووسی کورد', bio_ar: 'ناوی نهێنیی حاج تۆفیق. شاعیر، ڕۆژنامەنووس و پەروەردەکاری بەناوبانگی کوردیی سلێمانی.' },
    { m: 6,  d: 29, type: 'd', name: 'Sheikh Said',                role: 'Religious leader, rebellion of 1925',years: '1865—1925', bio: 'Naqshbandi sheikh who led the 1925 Kurdish uprising in Turkey; executed with 46 others in Diyarbakır.', wiki: 'https://en.wikipedia.org/wiki/Sheikh_Said', name_ar: 'شێخ سەعید', role_ar: 'پێشەوای ئایینی، ڕاپەڕینی ١٩٢٥', bio_ar: 'مامۆستای نەقشبەندی کە سەرکردایەتیی ڕاپەڕینی ١٩٢٥ی کوردی لە تورکیای کرد؛ لەگەڵ ٤٦ کەسی تردا لە دیاربەکر لەسێدارە درا.' },

    // July
    { m: 7,  d: 13, type: 'd', name: 'Abdul Rahman Ghassemlou',    role: 'Leader of KDPI',                    years: '1930—1989', bio: 'Long-time leader of KDPI. Assassinated in Vienna during peace talks with Iranian agents.', wiki: 'https://en.wikipedia.org/wiki/Abdul_Rahman_Ghassemlou', name_ar: 'عەبدوڕەحمان قاسملوو', role_ar: 'سەرکردەی پارتی دیموکراتی کوردستانی ئێران', bio_ar: 'سەرۆکی درێژخایەنی پارتی دیموکراتی کوردستانی ئێران. لە ڤیەننا لە دانوستاندنی ئاشتیدا لەلایەن کارمەندانی ئێرانەوە تیرۆر کرا.' },

    // August
    { m: 8,  d: 4,  type: 'd', name: 'Şêrko Bêkes',                role: 'Kurdish poet',                       years: '1940—2013', bio: 'Death anniversary of one of the giants of modern Kurdish poetry.', wiki: 'https://en.wikipedia.org/wiki/Sherko_Bekas', name_ar: 'شێرکۆ بێکەس', role_ar: 'شاعیری کورد', bio_ar: 'یادی کۆچی دوایی یەکێک لە کۆلۆسەکانی شیعری کوردیی نوێ.' },
    { m: 8,  d: 8,  type: 'd', name: 'Aram Tigran',                role: 'Kurdish musician',         years: '1934—2009', bio: 'Death anniversary of the multilingual singer who carried Kurdish songs to the Armenian and Syriac diasporas.', wiki: 'https://en.wikipedia.org/wiki/Aram_Tigran', name_ar: 'ئارام تیگران', role_ar: 'موزیکژەنی کورد', bio_ar: 'یادی کۆچی دوایی گۆرانیبێژی فرە‌زمان کە گۆرانیی کوردیی بە دیاسپۆرای ئەرمەنی و سریانی گەیاند.' },
    { m: 8,  d: 16, type: 'b', name: 'Massoud Barzani',            role: 'KDP leader, former president of KRI',years: 'b. 1946',   bio: 'Son of Mustafa Barzani; led the KDP from 1979 and served as President of the Kurdistan Region (2005–2017).', wiki: 'https://en.wikipedia.org/wiki/Massoud_Barzani', name_ar: 'مەسعوود بارزانی', role_ar: 'سەرکردەی پارتی، سەرۆکی پێشووی هەرێمی کوردستان', bio_ar: 'کوڕی مەلا مستەفا بارزانی؛ لە ١٩٧٩ەوە سەرکردایەتیی پارتیی کرد و سەرۆکایەتیی هەرێمی کوردستانی کرد (٢٠٠٥–٢٠١٧).' },

    // September
    { m: 9,  d: 9,  type: 'd', name: 'Yılmaz Güney',               role: 'Kurdish filmmaker',         years: '1937—1984', bio: 'Director of "Yol" (1982); won the Palme d\'Or while in exile in France.', wiki: 'https://en.wikipedia.org/wiki/Y%C4%B1lmaz_G%C3%BCney', name_ar: 'یەڵماز گونەی', role_ar: 'فیلمسازی کورد', bio_ar: 'دەرهێنەری «یۆل» (١٩٨٢)؛ پاڵمەی زێڕینی بەدەستهێنا کاتێک لە فەڕەنسا لە دوورخراوەییدا بوو.' },
    { m: 9,  d: 17, type: 'd', name: 'Sadegh Sharafkandi',         role: 'Successor of Ghassemlou (KDPI)',     years: '1938—1992', bio: 'Secretary-general of KDPI after Ghassemlou. Assassinated at the Mykonos restaurant in Berlin.', wiki: 'https://en.wikipedia.org/wiki/Sadegh_Sharafkandi', name_ar: 'سادق شەرەفکەندی', role_ar: 'جێگری قاسملۆ (پارتی دیموکراتی کوردستانی ئێران)', bio_ar: 'سکرتێری گشتیی پارتی دیموکراتی کوردستانی ئێران پاش قاسملۆ. لە چێشتخانەی میکۆنۆس لە بەرلین تیرۆر کرا.' },

    // October
    { m: 10, d: 3,  type: 'd', name: 'Jalal Talabani',             role: 'Co-founder of PUK, President of Iraq', years: '1933—2017', bio: 'Founding leader of the PUK and President of Iraq (2005–2014); the first non-Arab president of an Arab-majority state in modern history.', wiki: 'https://en.wikipedia.org/wiki/Jalal_Talabani', name_ar: 'جەلال تاڵەبانی', role_ar: 'هاوبەشی دامەزرێنەری یەکێتی، سەرۆکی عێراق', bio_ar: 'دامەزرێنەری یەکێتی نیشتمانیی کوردستان و سەرۆکی عێراق (٢٠٠٥–٢٠١٤)؛ یەکەم سەرۆکی نا‌عەرەب لە دەوڵەتێکی زۆرینەی عەرەبدا لە مێژووی نوێدا.' },
    { m: 10, d: 6,  type: 'b', name: 'Yaşar Kemal',                role: 'Kurdish novelist',          years: '1923—2015', bio: 'Author of Memed, My Hawk and the İnce Memed cycle.', wiki: 'https://en.wikipedia.org/wiki/Ya%C5%9Far_Kemal', name_ar: 'یاشار کەمال', role_ar: 'ڕۆماننووسی کورد', bio_ar: 'نووسەری «مەحمەد، باژەکەم» و چەرخەی «ئینجە مەحمەد».' },
    { m: 10, d: 9,  type: 'd', name: 'Sheikh Mahmud Barzanji',     role: 'King of Kurdistan (1922—1924)',     years: '1878—1956', bio: 'Led several uprisings against British control of southern Kurdistan; briefly proclaimed himself King of Kurdistan.', wiki: 'https://en.wikipedia.org/wiki/Mahmud_Barzanji', name_ar: 'شێخ مەحموودی حەفید', role_ar: 'پاشای کوردستان (١٩٢٢—١٩٢٤)', bio_ar: 'چەند ڕاپەڕینی لە دژی کۆنترۆڵی بەریتانی بۆ کوردستانی باشوور سەرکردایەتی کرد؛ بۆ ماوەیەکی کورت خۆی بە پاشای کوردستان ڕاگەیاند.' },
    { m: 10, d: 11, type: 'd', name: 'Mehmed Uzun',                role: 'Kurdish novelist',                  years: '1953—2007', bio: 'Death anniversary of the writer who brought modern Kurdish literature to a wider audience.', wiki: 'https://en.wikipedia.org/wiki/Mehmed_Uzun', name_ar: 'محەممەد ئوزون', role_ar: 'ڕۆماننووسی کورد', bio_ar: 'یادی کۆچی دوایی نووسەرێک کە ئەدەبیاتی نوێی کوردی هێنایە بەرچاوی جیهان.' },
    { m: 10, d: 12, type: 'd', name: 'Hevrîn Xelef',               role: 'Kurdish politician',         years: '1984—2019', bio: 'Secretary-general of the Future Syria Party; assassinated in northern Syria during the 2019 Turkish offensive.', wiki: 'https://en.wikipedia.org/wiki/Hevrin_Khalaf', name_ar: 'ھەڤرین خەلەف', role_ar: 'سیاسەتمەداری کورد', bio_ar: 'سکرتێری گشتیی پارتی داهاتووی سوریا؛ لە ٢٠١٩ لە سەرکردایەتی هێرشی تورکیای سەر باکوری سوریا تیرۆر کرا.' },
    { m: 10, d: 22, type: 'd', name: 'Cegerxwîn',                  role: 'Kurdish poet',                     years: '1903—1984', bio: 'Pen name of Şêx Mûs Hesen. One of the most influential Kurdish poets; his verse was central to 20th-century Kurdish national consciousness.', wiki: 'https://en.wikipedia.org/wiki/Cegerxw%C3%AEn', name_ar: 'جگەرخوێن', role_ar: 'شاعیری کورد', bio_ar: 'ناوی نهێنیی شێخ موسی حەسەن. یەکێک لە کاریگەرترین شاعیرانی کوردی؛ شیعرەکانی لە بزووتنەوەی نیشتمانیی کوردیی سەدەی بیستەمدا گرنگ بوون.' },

    // November
    { m: 11, d: 9,  type: 'b', name: 'Piremerd',                   role: 'Kurdish poet, journalist',           years: '1867—1950', bio: 'Sulaymaniyah-born poet whose journalism shaped early modern Kurdish prose.', wiki: 'https://en.wikipedia.org/wiki/Piremerd', name_ar: 'پیرەمێرد', role_ar: 'شاعیر و ڕۆژنامەنووسی کورد', bio_ar: 'شاعیری سلێمانی کە ڕۆژنامەنووسیی پەخشانی کوردیی نوێی شێوەداڕشت.' },
    { m: 11, d: 9,  type: 'b', name: 'Abdulla Pashew',             role: 'Kurdish poet',                       years: 'b. 1946',   bio: 'One of the most widely read living Kurdish poets; lives in exile in Norway.', wiki: 'https://en.wikipedia.org/wiki/Abdulla_Pashew', name_ar: 'عەبدوڵڵا پەشێو', role_ar: 'شاعیری کورد', bio_ar: 'یەکێک لە بەناوبانگترین شاعیرانی کوردی زیندوو؛ لە نەرویج لە دوورخراوەییدا دەژی.' },
    { m: 11, d: 12, type: 'b', name: 'Jalal Talabani',             role: 'Co-founder of PUK, President of Iraq', years: '1933—2017', bio: 'Founding leader of the PUK; later President of Iraq (2005–2014).', wiki: 'https://en.wikipedia.org/wiki/Jalal_Talabani', name_ar: 'جەلال تاڵەبانی', role_ar: 'هاوبەشی دامەزرێنەری یەکێتی، سەرۆکی عێراق', bio_ar: 'دامەزرێنەری یەکێتی نیشتمانیی کوردستان؛ پاشان سەرۆکی عێراق (٢٠٠٥–٢٠١٤).' },
    { m: 11, d: 18, type: 'b', name: 'Ehmedê Xanî',                role: 'Classical poet',                    years: '~1651—1707',bio: 'Author of the Kurdish national epic Mem û Zîn (1692); pioneer of literary Kurdish. Birth date approximate.', wiki: 'https://en.wikipedia.org/wiki/Ahmad_Khani', name_ar: 'ئەحمەدی خانی', role_ar: 'شاعیری کلاسیک', bio_ar: 'نووسەری ئەپۆسی نیشتمانیی کوردیی «مەم و زین» (١٦٩٢)؛ پێشەنگی ئەدەبیاتی کوردی. ساڵی لەدایکبوون نزیکە.' },
    { m: 11, d: 18, type: 'd', name: 'Goran',                      role: 'Kurdish modernist poet',             years: '1904—1962', bio: 'Pen name of Abdulla Sulaiman. Pioneer of modern Kurdish free-verse and a touchstone of 20th-century Kurdish poetry.', wiki: 'https://en.wikipedia.org/wiki/Abdulla_Goran', name_ar: 'عەبدوڵڵا گۆران', role_ar: 'شاعیری مۆدێرنیستی کورد', bio_ar: 'ناوی نهێنیی عبدوڵڵا سلێمان. پێشەنگی شیعری ئازادی نوێی کوردی و ستوونێکی شیعری کوردیی سەدەی بیستەم.' },

    // December
    { m: 12, d: 16, type: 'd', name: 'Mihemed Mamlê',              role: 'Kurdish singer',                    years: '1925—1999', bio: 'Iconic singer of Kurdish folk and patriotic songs from Mukriyan; long held a near-monopoly on Iran-state Kurdish broadcasting.', wiki: 'https://en.wikipedia.org/wiki/Mohammad_Mamle', name_ar: 'محەممەد ماملێ', role_ar: 'گۆرانیبێژی کورد', bio_ar: 'گۆرانیبێژی نمادینی گۆرانی فۆلکلۆری و نیشتمانیی کوردی لە موکریان؛ ماوەیەکی درێژ بەشی کوردیی ڕادیۆی ئێرانی هەڵگرتبوو.' },
    { m: 12, d: 18, type: 'd', name: 'Eyşe Şan',                   role: 'Kurdish singer',                    years: '1938—1996', bio: 'Pioneering Kurdish woman singer from Diyarbakır; defied bans on Kurdish-language song.', wiki: 'https://en.wikipedia.org/wiki/Ay%C5%9Fe_%C5%9Fan', name_ar: 'ئایشە شان', role_ar: 'گۆرانیبێژی کورد', bio_ar: 'پێشەنگی گۆرانیبێژیی ژنانی کورد لە دیاربەکر؛ لە دژی قەدەغەکانی گۆرانی بە زمانی کوردی وەستایەوە.' },
    { m: 12, d: 22, type: 'b', name: 'Abdul Rahman Ghassemlou',    role: 'Leader of KDPI',                    years: '1930—1989', bio: 'Born in Urmia. Led the Democratic Party of Iranian Kurdistan for two decades.', wiki: 'https://en.wikipedia.org/wiki/Abdul_Rahman_Ghassemlou', name_ar: 'عەبدوڕەحمان قاسملوو', role_ar: 'سەرکردەی پارتی دیموکراتی کوردستانی ئێران', bio_ar: 'لە ورمێ لەدایک بوو. دوو دەیە سەرۆکایەتیی پارتی دیموکراتی کوردستانی ئێرانی کرد.' },
    { m: 12, d: 23, type: 'b', name: 'Şivan Perwer',               role: 'Kurdish singer',                    years: 'b. 1955',   bio: 'One of the most beloved Kurdish musicians; his songs are central to modern Kurdish popular culture.', wiki: 'https://en.wikipedia.org/wiki/%C5%9Eivan_Perwer', name_ar: 'شڤان پەروەر', role_ar: 'گۆرانیبێژی کورد', bio_ar: 'یەکێک لە موزیکژەنە خۆشەویستەکانی کورد؛ گۆرانیەکانی لە کلتووری کوردیی نوێ گرنگن.' },

    // ---- Round 2 of figures research ----

    // Bedirxan family — language reformers / nationalists
    { m: 4,  d: 26, type: 'b', name: 'Celadet Bedirxan',           role: 'Linguist, founder of Hawar journal', years: '1893—1951', bio: 'Created the modern Latin-script Kurdish alphabet (Hawar alphabet, 1932); his journal Hawar shaped 20th-century Kurdish literacy.', wiki: 'https://en.wikipedia.org/wiki/Celadet_Ali_Bedirkhan', name_ar: 'جەلادەت عالی بەدرخان', role_ar: 'زمانناس، دامەزرێنەری گۆڤاری هەوار', bio_ar: 'ئەلفبێی لاتینیی نوێی کوردیی نووسی (ئەلفبێی هەوار، ١٩٣٢)؛ گۆڤاری هەواری ساز کرد کە خوێندەواریی کوردیی سەدەی بیستەمی شێوەداڕشت.' },
    { m: 9,  d: 21, type: 'b', name: 'Kamuran Bedirxan',           role: 'Writer, diplomat',                  years: '1895—1978', bio: 'Brother of Celadet; co-edited Hawar and Ronahî, taught Kurdish at the Sorbonne, and represented the Kurdish question in Europe for decades.', wiki: 'https://en.wikipedia.org/wiki/Kamuran_Bedirkhan', name_ar: 'کامەران بەدرخان', role_ar: 'نووسەر، دیپلۆمات', bio_ar: 'برای جەلادەت؛ گۆڤارەکانی هەوار و ڕۆناهیی هاوبەش بەڕێوە برد، لە سۆربۆن کوردیی فێر کرد و چەند دەیە نوێنەرایەتیی پرسی کوردیی لە ئەوروپا کرد.' },
    { m: 11, d: 15, type: 'd', name: 'Idris Bitlisi',              role: 'Historian, statesman',              years: '1457—1520', bio: 'Ottoman-era Kurdish polymath; negotiated the alliance between Ottoman Sultan Selim I and Kurdish emirs that defined Kurdish autonomy for centuries.', wiki: 'https://en.wikipedia.org/wiki/Idris_Bitlisi', name_ar: 'ئیدریسی بەدلیسی', role_ar: 'مێژوونووس، دەوڵەتمەدار', bio_ar: 'زانایەکی فرە‌زانستی کورد لە سەردەمی عوسمانی؛ هاوپەیمانیی نێوان سوڵتان سلێمی یەکەمی عوسمانی و میرە کوردەکانی ڕێکخست کە بۆ سەدان ساڵ خۆبەڕێوەبەریی کوردیی دیاری کرد.' },

    // Singers / cultural figures
    { m: 6,  d: 4,  type: 'd', name: 'Hesen Zîrek',                role: 'Kurdish singer',                     years: '1921—1972', bio: 'Prolific Kurdish folk singer from Bukan; recorded thousands of pieces, many of which became standards.', wiki: 'https://en.wikipedia.org/wiki/Hassan_Zirak', name_ar: 'حەسەن زیرەک', role_ar: 'گۆرانیبێژی کورد', bio_ar: 'گۆرانیبێژی فۆلکلۆری کوردی لە بۆکان؛ هەزاران بەرهەمی تۆمار کرد، زۆربەی بوون بە ستاندارد.' },
    { m: 10, d: 28, type: 'b', name: 'Ahmet Kaya',                 role: 'Kurdish singer',            years: '1957—2000', bio: 'Beloved political singer of Kurdish origin who sang in Turkish; exiled after publicly singing in Kurdish, died in Paris.', wiki: 'https://en.wikipedia.org/wiki/Ahmet_Kaya', name_ar: 'ئەحمەد کایا', role_ar: 'گۆرانیبێژی کورد', bio_ar: 'گۆرانیبێژی سیاسی خۆشەویست بە بنەچەی کوردی کە بە تورکی گۆرانیی دەوت؛ پاش گۆرانی گوتنی ئاشکرای بە کوردی دوور خرایەوە، لە پاریس کۆچی دوایی کرد.' },
    { m: 11, d: 16, type: 'd', name: 'Ahmet Kaya',                 role: 'Kurdish singer',            years: '1957—2000', bio: 'Death anniversary of one of the great voices of Anatolia.', wiki: 'https://en.wikipedia.org/wiki/Ahmet_Kaya', name_ar: 'ئەحمەد کایا', role_ar: 'گۆرانیبێژی کورد', bio_ar: 'یادی کۆچی دوایی یەکێک لە دەنگە مەزنەکانی ئەناتۆلیا.' },

    // Filmmakers / contemporary
    { m: 2,  d: 1,  type: 'b', name: 'Bahman Ghobadi',             role: 'Kurdish filmmaker',                 years: 'b. 1969',   bio: 'Director of A Time for Drunken Horses, Turtles Can Fly, and No One Knows About Persian Cats; one of the most internationally recognized Kurdish filmmakers.', wiki: 'https://en.wikipedia.org/wiki/Bahman_Ghobadi', name_ar: 'بەھمەن قوبادی', role_ar: 'فیلمسازی کورد', bio_ar: 'دەرهێنەری «کاتێک بۆ ئەسپە سەرخۆشەکان»، «کیسەڵەکان دەتوانن بفڕن» و «کەس لە پشیلە فارسییەکان نازانێ»؛ یەکێک لە بەناوبانگترین فیلمسازە کوردەکان.' },

    // Activists / contemporary politics
    { m: 3,  d: 10, type: 'b', name: 'Nadia Murad',                role: 'Yezîdî activist, Nobel laureate',    years: 'b. 1993',   bio: 'Yezîdî survivor of the 2014 ISIS attacks; awarded the 2018 Nobel Peace Prize for her work documenting genocide and assisting survivors.', wiki: 'https://en.wikipedia.org/wiki/Nadia_Murad', name_ar: 'نادیە موراد', role_ar: 'چالاکی ئێزدی، نازناوبەخشی نۆبڵی ئاشتی', bio_ar: 'ڕزگاربووی ئێزدی هێرشەکانی داعش لە ٢٠١٤؛ بە نازناوی نۆبڵی ئاشتیی ٢٠١٨ بەخشرا بە دامەزراندنی جینۆساید و یارمەتی ڕزگاربووان.' },
    { m: 4,  d: 10, type: 'b', name: 'Selahattin Demirtaş',        role: 'Kurdish politician',         years: 'b. 1973',   bio: 'Former co-chair of the HDP; presidential candidate in Turkey; imprisoned since 2016.', wiki: 'https://en.wikipedia.org/wiki/Selahattin_Demirta%C5%9F', name_ar: 'سەلاحەدین دەمیرتاش', role_ar: 'سیاسەتمەداری کورد', bio_ar: 'سەرۆکی پێشووی هاوبەشی هدپ؛ کاندیدای سەرۆکایەتیی تورکیا؛ لە ٢٠١٦ەوە لە زیندانە.' },
    { m: 5,  d: 22, type: 'd', name: 'Mîr Bedirxan',               role: 'Kurdish prince',                    years: '1803—1869', bio: 'Last semi-autonomous emir of Cizîre-Botan; led one of the major 19th-century Kurdish revolts against Ottoman centralization.', wiki: 'https://en.wikipedia.org/wiki/Bedir_Khan_Beg', name_ar: 'بەدرخان بەگ', role_ar: 'میری کورد', bio_ar: 'دواین میری ئازادی نیمچە‌خۆبەڕێوەبەری جزیرە‌بۆتان؛ یەکێک لە ڕاپەڕینە گەورەکانی کوردیی سەدەی نۆزدەی لە دژی ناوەندی عوسمانی سەرکردایەتی کرد.' },

    // Older figures
    { m: 7,  d: 1,  type: 'b', name: 'Karim Khan Zand',            role: 'Founder of the Zand dynasty',        years: '~1705—1779',bio: 'Lak/Lor-Kurdish founder of the Zand dynasty in Iran; widely remembered as one of Iran\'s most just rulers. Birth date approximate.', wiki: 'https://en.wikipedia.org/wiki/Karim_Khan_Zand', name_ar: 'کەریم خانی زەند', role_ar: 'دامەزرێنەری دودمانی زەند', bio_ar: 'دامەزرێنەری دودمانی زەند لە ئێران، بنەچەی لاک/لۆر-کوردی؛ یەکێک لە دادپەروەرترین فەرمانڕەوایانی ئێران بە بیر دەهێنرێتەوە. ساڵی لەدایکبوون نزیکە.' },

    // Modern Kurdish literature
    { m: 4,  d: 28, type: 'b', name: 'Bextiyar Elî',               role: 'Kurdish novelist',                    years: 'b. 1966',   bio: 'Major contemporary Kurdish novelist and poet; his fiction has been translated into many European languages.', wiki: 'https://en.wikipedia.org/wiki/Bachtyar_Ali', name_ar: 'بەختیار عەلی', role_ar: 'ڕۆماننووسی کورد', bio_ar: 'ڕۆماننووس و شاعیری هاوچەرخی گرنگی کوردی؛ ڕۆمانەکانی بۆ زۆر زمانی ئەوروپی وەرگێڕدراون.' },
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
    'ئ':'','ؤ':'','ء':'','ـ':'','أ':'a','إ':'i','ذ':'z','ث':'s','ص':'s','ض':'d','ط':'t','ظ':'z','ة':'h',
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
    // Normalize Arabic-only character variants to Kurdish/Persian forms first.
    s = String(s)
      .replace(/[ً-ٰٟۖ-ۭ]/g, '')
      .replace(/[يى]/g, 'ی')
      .replace(/ك/g, 'ک');
    s = s.replace(/وو/g, '');
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
    version: '3.7.0',
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
