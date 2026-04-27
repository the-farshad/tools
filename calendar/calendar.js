(function () {
  // ---------- Jalali (Solar Hijri) calendar — used for Kurdish months ----------
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

  // Kurdish Calendar — Solar Hijri months, Kurdish names (per Wikipedia "Kurdish calendars")
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

  // Official calendar — Gregorian months, common Kurdish names (per Wikipedia)
  const NK_MONTHS = [
    'Çile', 'Sibat', 'Adar', 'Nîsan', 'Gulan', 'Hezîran',
    'Tîrmeh', 'Tebax', 'Îlon', 'Cotmeh', 'Mijdar', 'Berfanbar',
  ];
  // Days of week, Sunday-first to match JS Date.getDay()
  const NK_DOW = ['Yekşem', 'Duşem', 'Sêşem', 'Çarşem', 'Pêncşem', 'În', 'Şemî'];

  const G_DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const G_DOW_LONG = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const G_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  // Kurdish (Arabic-script) names for the Gregorian calendar — Levantine names
  // commonly used in Sorani Kurdish media.
  const G_MONTHS_AR = ['کانوونی دووەم','شوبات','ئازار','نیسان','ئایار','حوزەیران','تەمموز','ئاب','ئەیلوول','تشرینی یەکەم','تشرینی دووەم','کانوونی یەکەم'];
  const G_DOW_LONG_AR = ['یەکشەممە','دووشەممە','سێشەممە','چوارشەممە','پێنجشەممە','هەینی','شەممە'];
  const G_DOW_AR = ['یەک','دوو','سێ','چوار','پێنج','هەی','شەم'];

  function gMonth(idx)    { return script() === 'two' ? G_MONTHS_AR[idx]    : G_MONTHS[idx]; }
  function gMonthShort(idx){ return script() === 'two' ? G_MONTHS_AR[idx]   : G_MONTHS[idx].slice(0, 3); }
  function gDowLong(idx)  { return script() === 'two' ? G_DOW_LONG_AR[idx]  : G_DOW_LONG[idx]; }
  function gDow(idx)      { return script() === 'two' ? G_DOW_AR[idx]       : G_DOW[idx]; }

  // ---------- Important days (civic / national / memorial) ----------
  const EVENTS = [
    { m: 1,  d: 22, name: 'Republic of Kurdistan',                    sub: 'Founding in Mahabad (1946)',                slug: 'mahabad' },
    { m: 1,  d: 26, name: 'Liberation of Kobanê',                     sub: 'End of the ISIS siege (2015)',              slug: 'kobane-liberation' },
    { m: 2,  d: 21, name: 'Mother Language Day',                      sub: 'International',                             slug: 'mother-language' },
    { m: 3,  d: 16, name: 'Halabja Memorial',                         sub: 'Chemical attack remembrance (1988)',        slug: 'halabja' },
    { m: 3,  d: 21, name: 'Newroz',                                   sub: 'Kurdish New Year',                          slug: 'newroz' },
    { m: 3,  d: 31, name: 'Execution of the Republic of Kurdistan leaders', sub: 'Qazi Muhammad and others (1947)',     slug: 'mahabad-execution' },
    { m: 4,  d: 14, name: 'Anfal Memorial',                           sub: 'Anfal campaign remembrance',                slug: 'anfal' },
    { m: 5,  d: 15, name: 'Roja Zimanê Kurdî',                        sub: 'Kurdish Language Day',                      slug: 'kurdish-language' },
    { m: 6,  d: 1,  name: 'Founding of the PUK',                      sub: 'Patriotic Union of Kurdistan (1975)',       slug: 'puk-founding' },
    { m: 7,  d: 19, name: 'Rojava Revolution',                        sub: 'Anniversary (2012)',                        slug: 'rojava-revolution' },
    { m: 8,  d: 3,  name: 'Yezîdî Genocide Memorial',                 sub: 'Sinjar attack remembrance (2014)',          slug: 'yezidi-memorial' },
    { m: 8,  d: 16, name: 'Founding of the KDP',                      sub: 'Kurdistan Democratic Party (1946)',         slug: 'kdp-founding' },
    { m: 9,  d: 25, name: 'Kurdistan Independence Referendum',        sub: '2017',                                      slug: 'referendum' },
    { m: 9,  d: 13, name: 'Beginning of the Siege of Kobanê',         sub: 'ISIS attack on Kobanê (2014)',              slug: 'kobane-siege' },
    { m: 12, d: 16, name: 'Fall of the Republic of Kurdistan',        sub: 'Mahabad re-occupied by Iranian forces (1946)',          slug: 'mahabad-fall' },
    { m: 12, d: 17, name: 'Kurdish Flag Day',                         sub: 'Adopted in Kurdistan Region (1999)',                    slug: 'flag-day' },
    // Treaties and major historical turning points
    { m: 8,  d: 23, name: 'Battle of Chaldiran',                      sub: '1514 — Ottoman-Safavid war; Kurdistan split between two empires', slug: 'chaldiran' },
    { m: 5,  d: 17, name: 'Treaty of Zuhab',                          sub: '1639 — first formal partition of Kurdistan',            slug: 'zuhab' },
    { m: 8,  d: 10, name: 'Treaty of Sèvres',                         sub: '1920 — first international promise of a Kurdish state', slug: 'sevres' },
    { m: 7,  d: 24, name: 'Treaty of Lausanne',                       sub: '1923 — replaced Sèvres; partitioned Kurdistan',         slug: 'lausanne' },
    { m: 4,  d: 7,  name: 'Establishment of the No-Fly Zone',         sub: '1991 — protected Iraqi Kurdistan after the uprising',   slug: 'no-fly-zone' },
    { m: 5,  d: 19, name: 'First Kurdistan Region elections',         sub: '1992 — first parliamentary vote in Iraqi Kurdistan',    slug: 'kri-elections' },
    { m: 10, d: 16, name: 'Iraqi forces re-take Kirkuk',              sub: '2017 — aftermath of the independence referendum',       slug: 'kirkuk-2017' },
    // Major uprisings
    { m: 2,  d: 13, name: 'Beginning of the Sheikh Said rebellion',   sub: '1925 — Kurdish uprising in Turkey',                     slug: 'sheikh-said-rebellion' },
    { m: 3,  d: 5,  name: 'Beginning of the 1991 Kurdish uprising',   sub: 'Iraqi Kurds rise after the Gulf War',                   slug: '1991-uprising' },
    { m: 3,  d: 12, name: 'Qamişlo uprising',                         sub: '2004 — Syrian Kurdish uprising',                        slug: 'qamishlo-uprising' },
    { m: 9,  d: 16, name: 'Death of Jina Mahsa Amini',                sub: '2022 — sparked the Jin Jiyan Azadî movement',           slug: 'jina-amini' },
    // Major Kurdish political organizations (chronological, neutral)
    { m: 9,  d: 20, name: 'Founding of the PYD',                      sub: '2003 — Democratic Union Party (Syrian Kurdistan)',                slug: 'pyd-founding' },
    { m: 9,  d: 21, name: 'Founding of Gorran',                       sub: '2009 — Movement for Change (Iraqi Kurdistan)',                    slug: 'goran-founding' },
    { m: 9,  d: 26, name: 'Founding of Komala',                       sub: '1969 — Society of Revolutionary Toilers (Iranian Kurdistan)',     slug: 'komala-founding' },
    { m: 10, d: 5,  name: 'Founding of the Khoybûn League',           sub: '1927 — first transnational Kurdish nationalist organization', slug: 'khoyboun' },
    { m: 8,  d: 16, name: 'Founding of the KDP-Iran (KDPI)',          sub: '1945 — Democratic Party of Iranian Kurdistan',          slug: 'kdpi-founding' },
    { m: 11, d: 27, name: 'Founding of the PKK',                      sub: '1978 — Kurdistan Workers\' Party',                      slug: 'pkk-founding' },
    { m: 10, d: 15, name: 'Founding of the HDP',                      sub: '2012 — Peoples\' Democratic Party (Turkey)',            slug: 'hdp-founding' },
  ];

  // ---------- Figures (poets, writers, leaders, activists) ----------
  // type: 'b' (birth) / 'd' (death anniversary). Approximate dates marked ~.
  // All entries link to Wikipedia where a page exists.
  const FIGURES = [
    // January
    { m: 1,  d: 1,  type: 'b', name: 'Mehmed Uzun',                role: 'Kurdish novelist',                  years: '1953—2007', bio: 'Kurdish novelist whose works revived modern literary Kurdish. Lived much of his life in Swedish exile.', wiki: 'https://en.wikipedia.org/wiki/Mehmed_Uzun' },
    { m: 1,  d: 9,  type: 'd', name: 'Sakine Cansız',              role: 'Kurdish political activist',        years: '1958—2013', bio: 'Co-founder of the PKK; assassinated in Paris in 2013.', wiki: 'https://en.wikipedia.org/wiki/Sakine_Cans%C4%B1z' },
    { m: 1,  d: 15, type: 'b', name: 'Aram Tigran',                role: 'Kurdish musician',         years: '1934—2009', bio: 'Beloved singer who composed and performed in Kurdish, Armenian, Turkish, and Arabic.', wiki: 'https://en.wikipedia.org/wiki/Aram_Tigran' },
    { m: 1,  d: 31, type: 'd', name: 'Idris Barzani',              role: 'Kurdish leader',                    years: '1944—1987', bio: 'Son of Mustafa Barzani and joint leader of the KDP after his father; succeeded by his brother Massoud.', wiki: 'https://en.wikipedia.org/wiki/Idris_Barzani' },

    // February
    { m: 2,  d: 12, type: 'b', name: 'Sakine Cansız',              role: 'Kurdish political activist',        years: '1958—2013', bio: 'Co-founder of the PKK and a long-time political prisoner.', wiki: 'https://en.wikipedia.org/wiki/Sakine_Cans%C4%B1z' },
    { m: 2,  d: 22, type: 'd', name: 'Hejar Mukrîyanî',            role: 'Kurdish poet and translator',         years: '1920—1991', bio: 'Pen name of Abdurrahman Sharafkandi. Translator of the Quran and the Shahnameh into Kurdish.', wiki: 'https://en.wikipedia.org/wiki/Hejar' },
    { m: 2,  d: 25, type: 'b', name: 'Sharaf Khan Bidlisi',        role: 'Historian, prince of Bitlis',       years: '1543—1603', bio: 'Author of the Sharafnama (1597), the first major historical chronicle of the Kurds.', wiki: 'https://en.wikipedia.org/wiki/Sharaf_Khan_Bidlisi' },
    { m: 2,  d: 28, type: 'd', name: 'Yaşar Kemal',                role: 'Kurdish novelist',          years: '1923—2015', bio: 'Author of Memed, My Hawk; one of the great Turkish-language novelists of the 20th century, of Kurdish origin.', wiki: 'https://en.wikipedia.org/wiki/Ya%C5%9Far_Kemal' },

    // March
    { m: 3,  d: 1,  type: 'd', name: 'Mustafa Barzani',            role: 'Kurdish leader',                    years: '1903—1979', bio: 'Founding leader of the modern Kurdish national movement in Iraq; Defense Minister of the Republic of Kurdistan.', wiki: 'https://en.wikipedia.org/wiki/Mustafa_Barzani' },
    { m: 3,  d: 4,  type: 'd', name: 'Saladin (Selahaddînê Eyûbî)',role: 'Sultan and military leader',        years: '1137—1193', bio: 'Founder of the Ayyubid dynasty; of Kurdish origin from Tikrit. Recaptured Jerusalem in 1187.', wiki: 'https://en.wikipedia.org/wiki/Saladin' },
    { m: 3,  d: 14, type: 'b', name: 'Mustafa Barzani',            role: 'Kurdish leader',                    years: '1903—1979', bio: 'Founding leader of the modern Kurdish national movement in Iraq.', wiki: 'https://en.wikipedia.org/wiki/Mustafa_Barzani' },
    { m: 3,  d: 15, type: 'b', name: 'Hejar Mukrîyanî',            role: 'Kurdish poet and translator',         years: '1920—1991', bio: 'Major figure in 20th-century Kurdish letters; produced one of the most important Kurdish dictionaries.', wiki: 'https://en.wikipedia.org/wiki/Hejar' },
    { m: 3,  d: 31, type: 'd', name: 'Qazi Muhammad',              role: 'President of the Republic of Kurdistan', years: '1893—1947', bio: 'Founder and only president of the short-lived Republic of Kurdistan (1946). Executed in 1947 in the same square where he proclaimed the republic.', wiki: 'https://en.wikipedia.org/wiki/Qazi_Muhammad' },

    // April
    { m: 4,  d: 1,  type: 'b', name: 'Yılmaz Güney',               role: 'Kurdish filmmaker',         years: '1937—1984', bio: 'Director of "Yol" (Palme d\'Or, 1982); one of the most acclaimed filmmakers of his generation.', wiki: 'https://en.wikipedia.org/wiki/Y%C4%B1lmaz_G%C3%BCney' },
    { m: 4,  d: 4,  type: 'b', name: 'Abdullah Öcalan',            role: 'Founder of the PKK',                years: 'b. 1948',   bio: 'Co-founder of the PKK and one of the most influential — and controversial — figures in modern Kurdish politics. Imprisoned in Turkey since 1999.', wiki: 'https://en.wikipedia.org/wiki/Abdullah_%C3%96calan' },
    { m: 4,  d: 18, type: 'd', name: 'Hêmin Mukrîyanî',            role: 'Kurdish poet',                       years: '1921—1986', bio: 'Pen name of Mohammad Amin Sheikhalislami. One of the leading Kurdish poets of the 20th century.', wiki: 'https://en.wikipedia.org/wiki/H%C3%AAmin' },

    // May
    { m: 5,  d: 2,  type: 'b', name: 'Şêrko Bêkes',                role: 'Kurdish poet',                       years: '1940—2013', bio: 'One of the giants of modern Kurdish poetry. Pioneered the "poster poem" form.', wiki: 'https://en.wikipedia.org/wiki/Sherko_Bekas' },
    { m: 5,  d: 3,  type: 'b', name: 'Leyla Zana',                 role: 'Kurdish politician',        years: 'b. 1961',   bio: 'First Kurdish woman elected to the Turkish parliament; sentenced for speaking Kurdish at her swearing-in.', wiki: 'https://en.wikipedia.org/wiki/Leyla_Zana' },
    { m: 5,  d: 9,  type: 'd', name: 'Ferzad Kemanger',            role: 'Kurdish teacher and activist',      years: '1975—2010', bio: 'Kurdish teacher and human-rights activist; executed by Iran on charges he denied.', wiki: 'https://en.wikipedia.org/wiki/Farzad_Kamangar' },
    { m: 5,  d: 12, type: 'd', name: 'Leyla Qasim',                role: 'Kurdish activist',                  years: '1952—1974', bio: 'First Kurdish woman to be executed for political activism in modern Iraq. Member of the KDP.', wiki: 'https://en.wikipedia.org/wiki/Leyla_Qasim' },
    { m: 5,  d: 15, type: 'b', name: 'Salim Barakat',              role: 'Kurdish poet and novelist',  years: 'b. 1951',   bio: 'Major contemporary Arabic-language poet and novelist of Kurdish origin from Qamishli.', wiki: 'https://en.wikipedia.org/wiki/Salim_Barakat' },

    // June
    { m: 6,  d: 11, type: 'd', name: 'Piremerd',                   role: 'Kurdish poet, journalist',           years: '1867—1950', bio: 'Pen name of Hac Tofiq. Influential Kurdish poet, journalist, and educator from Sulaymaniyah.', wiki: 'https://en.wikipedia.org/wiki/Piremerd' },
    { m: 6,  d: 29, type: 'd', name: 'Sheikh Said',                role: 'Religious leader, rebellion of 1925',years: '1865—1925', bio: 'Naqshbandi sheikh who led the 1925 Kurdish uprising in Turkey; executed with 46 others in Diyarbakır.', wiki: 'https://en.wikipedia.org/wiki/Sheikh_Said' },

    // July
    { m: 7,  d: 13, type: 'd', name: 'Abdul Rahman Ghassemlou',    role: 'Leader of KDPI',                    years: '1930—1989', bio: 'Long-time leader of KDPI. Assassinated in Vienna during peace talks with Iranian agents.', wiki: 'https://en.wikipedia.org/wiki/Abdul_Rahman_Ghassemlou' },

    // August
    { m: 8,  d: 4,  type: 'd', name: 'Şêrko Bêkes',                role: 'Kurdish poet',                       years: '1940—2013', bio: 'Death anniversary of one of the giants of modern Kurdish poetry.', wiki: 'https://en.wikipedia.org/wiki/Sherko_Bekas' },
    { m: 8,  d: 8,  type: 'd', name: 'Aram Tigran',                role: 'Kurdish musician',         years: '1934—2009', bio: 'Death anniversary of the multilingual singer who carried Kurdish songs to the Armenian and Syriac diasporas.', wiki: 'https://en.wikipedia.org/wiki/Aram_Tigran' },
    { m: 8,  d: 16, type: 'b', name: 'Massoud Barzani',            role: 'KDP leader, former president of KRI',years: 'b. 1946',   bio: 'Son of Mustafa Barzani; led the KDP from 1979 and served as President of the Kurdistan Region (2005–2017).', wiki: 'https://en.wikipedia.org/wiki/Massoud_Barzani' },

    // September
    { m: 9,  d: 9,  type: 'd', name: 'Yılmaz Güney',               role: 'Kurdish filmmaker',         years: '1937—1984', bio: 'Director of "Yol" (1982); won the Palme d\'Or while in exile in France.', wiki: 'https://en.wikipedia.org/wiki/Y%C4%B1lmaz_G%C3%BCney' },
    { m: 9,  d: 17, type: 'd', name: 'Sadegh Sharafkandi',         role: 'Successor of Ghassemlou (KDPI)',     years: '1938—1992', bio: 'Secretary-general of KDPI after Ghassemlou. Assassinated at the Mykonos restaurant in Berlin.', wiki: 'https://en.wikipedia.org/wiki/Sadegh_Sharafkandi' },

    // October
    { m: 10, d: 3,  type: 'd', name: 'Jalal Talabani',             role: 'Co-founder of PUK, President of Iraq', years: '1933—2017', bio: 'Founding leader of the PUK and President of Iraq (2005–2014); the first non-Arab president of an Arab-majority state in modern history.', wiki: 'https://en.wikipedia.org/wiki/Jalal_Talabani' },
    { m: 10, d: 6,  type: 'b', name: 'Yaşar Kemal',                role: 'Kurdish novelist',          years: '1923—2015', bio: 'Author of Memed, My Hawk and the İnce Memed cycle.', wiki: 'https://en.wikipedia.org/wiki/Ya%C5%9Far_Kemal' },
    { m: 10, d: 9,  type: 'd', name: 'Sheikh Mahmud Barzanji',     role: 'King of Kurdistan (1922—1924)',     years: '1878—1956', bio: 'Led several uprisings against British control of southern Kurdistan; briefly proclaimed himself King of Kurdistan.', wiki: 'https://en.wikipedia.org/wiki/Mahmud_Barzanji' },
    { m: 10, d: 11, type: 'd', name: 'Mehmed Uzun',                role: 'Kurdish novelist',                  years: '1953—2007', bio: 'Death anniversary of the writer who brought modern Kurdish literature to a wider audience.', wiki: 'https://en.wikipedia.org/wiki/Mehmed_Uzun' },
    { m: 10, d: 12, type: 'd', name: 'Hevrîn Xelef',               role: 'Kurdish politician',         years: '1984—2019', bio: 'Secretary-general of the Future Syria Party; assassinated in northern Syria during the 2019 Turkish offensive.', wiki: 'https://en.wikipedia.org/wiki/Hevrin_Khalaf' },
    { m: 10, d: 22, type: 'd', name: 'Cegerxwîn',                  role: 'Kurdish poet',                     years: '1903—1984', bio: 'Pen name of Şêx Mûs Hesen. One of the most influential Kurdish poets; his verse was central to 20th-century Kurdish national consciousness.', wiki: 'https://en.wikipedia.org/wiki/Cegerxw%C3%AEn' },

    // November
    { m: 11, d: 9,  type: 'b', name: 'Piremerd',                   role: 'Kurdish poet, journalist',           years: '1867—1950', bio: 'Sulaymaniyah-born poet whose journalism shaped early modern Kurdish prose.', wiki: 'https://en.wikipedia.org/wiki/Piremerd' },
    { m: 11, d: 9,  type: 'b', name: 'Abdulla Pashew',             role: 'Kurdish poet',                       years: 'b. 1946',   bio: 'One of the most widely read living Kurdish poets; lives in exile in Norway.', wiki: 'https://en.wikipedia.org/wiki/Abdulla_Pashew' },
    { m: 11, d: 12, type: 'b', name: 'Jalal Talabani',             role: 'Co-founder of PUK, President of Iraq', years: '1933—2017', bio: 'Founding leader of the PUK; later President of Iraq (2005–2014).', wiki: 'https://en.wikipedia.org/wiki/Jalal_Talabani' },
    { m: 11, d: 18, type: 'b', name: 'Ehmedê Xanî',                role: 'Classical poet',                    years: '~1651—1707',bio: 'Author of the Kurdish national epic Mem û Zîn (1692); pioneer of literary Kurdish. Birth date approximate.', wiki: 'https://en.wikipedia.org/wiki/Ahmad_Khani' },
    { m: 11, d: 18, type: 'd', name: 'Goran',                      role: 'Kurdish modernist poet',             years: '1904—1962', bio: 'Pen name of Abdulla Sulaiman. Pioneer of modern Kurdish free-verse and a touchstone of 20th-century Kurdish poetry.', wiki: 'https://en.wikipedia.org/wiki/Abdulla_Goran' },

    // December
    { m: 12, d: 16, type: 'd', name: 'Mihemed Mamlê',              role: 'Kurdish singer',                    years: '1925—1999', bio: 'Iconic singer of Kurdish folk and patriotic songs from Mukriyan; long held a near-monopoly on Iran-state Kurdish broadcasting.', wiki: 'https://en.wikipedia.org/wiki/Mohammad_Mamle' },
    { m: 12, d: 18, type: 'd', name: 'Eyşe Şan',                   role: 'Kurdish singer',                    years: '1938—1996', bio: 'Pioneering Kurdish woman singer from Diyarbakır; defied bans on Kurdish-language song.', wiki: 'https://en.wikipedia.org/wiki/Ay%C5%9Fe_%C5%9Fan' },
    { m: 12, d: 22, type: 'b', name: 'Abdul Rahman Ghassemlou',    role: 'Leader of KDPI',                    years: '1930—1989', bio: 'Born in Urmia. Led the Democratic Party of Iranian Kurdistan for two decades.', wiki: 'https://en.wikipedia.org/wiki/Abdul_Rahman_Ghassemlou' },
    { m: 12, d: 23, type: 'b', name: 'Şivan Perwer',               role: 'Kurdish singer',                    years: 'b. 1955',   bio: 'One of the most beloved Kurdish musicians; his songs are central to modern Kurdish popular culture.', wiki: 'https://en.wikipedia.org/wiki/%C5%9Eivan_Perwer' },

    // ---- Round 2 of figures research ----

    // Bedirxan family — language reformers / nationalists
    { m: 4,  d: 26, type: 'b', name: 'Celadet Bedirxan',           role: 'Linguist, founder of Hawar journal', years: '1893—1951', bio: 'Created the modern Latin-script Kurdish alphabet (Hawar alphabet, 1932); his journal Hawar shaped 20th-century Kurdish literacy.', wiki: 'https://en.wikipedia.org/wiki/Celadet_Ali_Bedirkhan' },
    { m: 9,  d: 21, type: 'b', name: 'Kamuran Bedirxan',           role: 'Writer, diplomat',                  years: '1895—1978', bio: 'Brother of Celadet; co-edited Hawar and Ronahî, taught Kurdish at the Sorbonne, and represented the Kurdish question in Europe for decades.', wiki: 'https://en.wikipedia.org/wiki/Kamuran_Bedirkhan' },
    { m: 11, d: 15, type: 'd', name: 'Idris Bitlisi',              role: 'Historian, statesman',              years: '1457—1520', bio: 'Ottoman-era Kurdish polymath; negotiated the alliance between Ottoman Sultan Selim I and Kurdish emirs that defined Kurdish autonomy for centuries.', wiki: 'https://en.wikipedia.org/wiki/Idris_Bitlisi' },

    // Singers / cultural figures
    { m: 6,  d: 4,  type: 'd', name: 'Hesen Zîrek',                role: 'Kurdish singer',                     years: '1921—1972', bio: 'Prolific Kurdish folk singer from Bukan; recorded thousands of pieces, many of which became standards.', wiki: 'https://en.wikipedia.org/wiki/Hassan_Zirak' },
    { m: 10, d: 28, type: 'b', name: 'Ahmet Kaya',                 role: 'Kurdish singer',            years: '1957—2000', bio: 'Beloved political singer of Kurdish origin who sang in Turkish; exiled after publicly singing in Kurdish, died in Paris.', wiki: 'https://en.wikipedia.org/wiki/Ahmet_Kaya' },
    { m: 11, d: 16, type: 'd', name: 'Ahmet Kaya',                 role: 'Kurdish singer',            years: '1957—2000', bio: 'Death anniversary of one of the great voices of Anatolia.', wiki: 'https://en.wikipedia.org/wiki/Ahmet_Kaya' },

    // Filmmakers / contemporary
    { m: 2,  d: 1,  type: 'b', name: 'Bahman Ghobadi',             role: 'Kurdish filmmaker',                 years: 'b. 1969',   bio: 'Director of A Time for Drunken Horses, Turtles Can Fly, and No One Knows About Persian Cats; one of the most internationally recognized Kurdish filmmakers.', wiki: 'https://en.wikipedia.org/wiki/Bahman_Ghobadi' },

    // Activists / contemporary politics
    { m: 3,  d: 10, type: 'b', name: 'Nadia Murad',                role: 'Yezîdî activist, Nobel laureate',    years: 'b. 1993',   bio: 'Yezîdî survivor of the 2014 ISIS attacks; awarded the 2018 Nobel Peace Prize for her work documenting genocide and assisting survivors.', wiki: 'https://en.wikipedia.org/wiki/Nadia_Murad' },
    { m: 4,  d: 10, type: 'b', name: 'Selahattin Demirtaş',        role: 'Kurdish politician',         years: 'b. 1973',   bio: 'Former co-chair of the HDP; presidential candidate in Turkey; imprisoned since 2016.', wiki: 'https://en.wikipedia.org/wiki/Selahattin_Demirta%C5%9F' },
    { m: 5,  d: 22, type: 'd', name: 'Mîr Bedirxan',               role: 'Kurdish prince',                    years: '1803—1869', bio: 'Last semi-autonomous emir of Cizîre-Botan; led one of the major 19th-century Kurdish revolts against Ottoman centralization.', wiki: 'https://en.wikipedia.org/wiki/Bedir_Khan_Beg' },

    // Older figures
    { m: 7,  d: 1,  type: 'b', name: 'Karim Khan Zand',            role: 'Founder of the Zand dynasty',        years: '~1705—1779',bio: 'Lak/Lor-Kurdish founder of the Zand dynasty in Iran; widely remembered as one of Iran\'s most just rulers. Birth date approximate.', wiki: 'https://en.wikipedia.org/wiki/Karim_Khan_Zand' },

    // Modern Kurdish literature
    { m: 4,  d: 28, type: 'b', name: 'Bextiyar Elî',               role: 'Kurdish novelist',                    years: 'b. 1966',   bio: 'Major contemporary Kurdish novelist and poet; his fiction has been translated into many European languages.', wiki: 'https://en.wikipedia.org/wiki/Bachtyar_Ali' },
  ];

  // ---------- helpers ----------

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function isToday(g, t) {
    return g.getFullYear() === t.getFullYear() &&
           g.getMonth() === t.getMonth() &&
           g.getDate() === t.getDate();
  }
  // ---------- Computed (year-dependent) events ----------
  // Çarşema Sor (Yezidi New Year): the first Wednesday on or after 14 April
  // (start of Nisan in the Julian calendar used in Yezidi tradition).
  function carsemaSor(year) {
    for (let d = 14; d <= 20; d++) {
      const dow = new Date(year, 3, d).getDay(); // 0=Sun, 3=Wed
      if (dow === 3) {
        return { m: 4, d, name: 'Çarşema Sor (Yezidi New Year)', sub: 'First Wednesday of Nisan in the Yezidi religious calendar', slug: 'carsema-sor' };
      }
    }
    return null;
  }
  const COMPUTED_EVENTS = [carsemaSor];

  function eventsForYear(year) {
    const computed = COMPUTED_EVENTS.map(fn => fn(year)).filter(Boolean);
    return EVENTS.concat(computed);
  }

  function eventOn(m, d, year) {
    return eventsForYear(year || new Date().getFullYear()).find(e => e.m === m && e.d === d);
  }
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

  // Swap UI labels with Arabic-script Kurdish equivalents when script === 'two'.
  // Source elements declare alternates via data-ar / data-ar-placeholder.
  function applyScriptLabels() {
    const isAr = script() === 'two';
    document.querySelectorAll('[data-ar]').forEach(el => {
      if (!el.hasAttribute('data-en')) el.setAttribute('data-en', el.textContent);
      el.textContent = isAr ? el.getAttribute('data-ar') : el.getAttribute('data-en');
      if (isAr) {
        el.style.fontFamily = "'Vazirmatn','Tahoma',sans-serif";
        el.setAttribute('dir', 'rtl');
      } else {
        el.style.fontFamily = '';
        el.removeAttribute('dir');
      }
    });
    document.querySelectorAll('[data-ar-placeholder]').forEach(el => {
      if (!el.hasAttribute('data-en-placeholder')) el.setAttribute('data-en-placeholder', el.placeholder || '');
      el.placeholder = isAr ? el.getAttribute('data-ar-placeholder') : el.getAttribute('data-en-placeholder');
      el.style.fontFamily = isAr ? "'Vazirmatn','Tahoma',sans-serif" : '';
    });
    document.querySelectorAll('[data-ar-title]').forEach(el => {
      if (!el.hasAttribute('data-en-title')) el.setAttribute('data-en-title', el.title || '');
      el.title = isAr ? el.getAttribute('data-ar-title') : el.getAttribute('data-en-title');
    });
  }

  // Dynamic UI strings — translated by JS at render time. (Static strings live
  // in the HTML as data-ar attributes, handled by applyScriptLabels above.)
  const I18N = {
    loading:        { en: 'Loading…',                                 ar: 'بارکردن…' },
    poemErr:        { en: 'Could not load a poem',                    ar: 'هۆنراوە بار نەبوو' },
    savedEmpty:     { en: 'No saved poems yet. Tap ☆ to save one.',  ar: 'هیچ هۆنراوەیەک پاشەکەوت نەکراوە. ☆ بکە بۆ پاشەکەوتکردن.' },
    untitled:       { en: '(untitled)',                               ar: '(بێ ناونیشان)' },
    share:          { en: 'share',                                    ar: 'هاوبەشی' },
    viewFull:       { en: 'view full',                                ar: 'بینینی تەواو' },
    showLess:       { en: 'show less',                                ar: 'کەمتر' },
    onGitHub:       { en: 'on GitHub',                                ar: 'لە GitHub' },
    translate:      { en: 'translate',                                ar: 'وەرگێڕان' },
    bookmark:       { en: 'Bookmark',                                 ar: 'پاشەکەوت' },
    removeBookmark: { en: 'Remove bookmark',                          ar: 'لابردنی پاشەکەوت' },
    close:          { en: 'Close',                                    ar: 'داخستن' },
    copyLink:       { en: 'Copy link',                                ar: 'کۆپیکردنی بەستەر' },
    copied:         { en: 'Copied ✓',                                 ar: 'کۆپی کرا ✓' },
    copyFailed:     { en: 'Copy failed',                              ar: 'کۆپی نەکرا' },
    sharePoem:      { en: 'Share poem',                               ar: 'هاوبەشی هۆنراوە' },
    newrozIn:       { en: 'in',                                       ar: 'لە' },
    newrozDays:     { en: 'days',                                     ar: 'ڕۆژدا' },
    newrozPiroz:    { en: 'Newroz piroz be!',                         ar: 'نەورۆز پیرۆز بێ!' },
    newrozToday:    { en: 'Today is the Kurdish New Year.',           ar: 'ئەمڕۆ سەری ساڵی کوردییە.' },
    showAll:        { en: 'Show all',                                 ar: 'هەموو پیشان بدە' },
    showOnly:       { en: 'Show only',                                ar: 'تەنیا پیشان بدە' },
  };
  function t(key) {
    const e = I18N[key];
    if (!e) return key;
    return script() === 'two' ? e.ar : e.en;
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
      gMonth(g.getMonth()) + ' ' + g.getDate() + ', ' + g.getFullYear();
    document.getElementById('g-day').textContent = gDowLong(g.getDay());

    const p = gregToJalali(g.getFullYear(), g.getMonth() + 1, g.getDate());
    document.getElementById('ck-date').textContent = fmtCK(p, sc);
    document.getElementById('ck-day').textContent = fmtCKDay(g, sc);

    document.getElementById('nk-date').textContent = fmtNK(g);
    document.getElementById('nk-day').textContent = NK_DOW[g.getDay()];
  }

  // ---------- converter ----------

  let convDir = (function () {
    try {
      const v = localStorage.getItem('cal-conv-dir');
      return (v === 'g2k' || v === 'k2g') ? v : 'g2k';
    } catch { return 'g2k'; }
  })();

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
    gEl.textContent = gMonth(m - 1) + ' ' + d + ', ' + y + '  ·  ' + gDowLong(g.getDay());
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
    gEl.textContent = gMonth(g.getMonth()) + ' ' + g.getDate() + ', ' + g.getFullYear() + '  ·  ' + gDowLong(g.getDay());
    ckEl.textContent = fmtCK({ y: jy, m: jm, d: jd }, sc) + '  ·  ' + fmtCKDay(g, sc);
    nkEl.textContent = fmtNK(g) + '  ·  ' + NK_DOW[g.getDay()];
  }

  function renderConverter() {
    if (convDir === 'k2g') renderConverterK2G();
    else renderConverterG2K(document.getElementById('conv-input').value);
  }

  // ---------- Poems ----------
  // Fetched live from your fork: github.com/the-farshad/poems
  // (originally allekok-poems, public domain).
  //
  // Adding poems: just push them to your fork under شیعرەکان/ — to surface
  // here, also append their path to POEM_INDEX below.
  //
  // Adding translations: drop a sibling file with ".en" appended next to
  // the poem (same folder, same name + ".en"). The calendar fetches both;
  // if the .en sibling exists it shows as the translation, otherwise the
  // UI offers a one-click "Translate ↗" link to Google Translate.
  const POEM_BASE = 'https://raw.githubusercontent.com/the-farshad/poems/master/شیعرەکان/';
  const POEM_VIEW = 'https://github.com/the-farshad/poems/blob/master/شیعرەکان/';

  const POEM_INDEX = [
    // Şêrko Bêkes — Trifey Helbest
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
    // Hêjar Mukrîyanî — Bo Kurdistan
    'هەژار موکریانی/بۆ کوردستان/١٧. نامرادێک',
    'هەژار موکریانی/بۆ کوردستان/٢٧. هەر کوردم',
    'هەژار موکریانی/بۆ کوردستان/٢٠. وەرام بۆ کچێکی سۆڤیەتی',
    'هەژار موکریانی/بۆ کوردستان/٣٣. کوردم',
    // Goran — Beheşt û Yadigar
    'عەبدوڵڵا گۆران/بەهەشت و یادگار/٢٦. هەرچەن',
    'عەبدوڵڵا گۆران/بەهەشت و یادگار/١٥. بۆ خانمێک',
    'عەبدوڵڵا گۆران/بەهەشت و یادگار/٢٢. لە لادێ',
    'عەبدوڵڵا گۆران/بەهەشت و یادگار/١٢. هەڵبەستی ڕەنجاو',
    'عەبدوڵڵا گۆران/بەهەشت و یادگار/٦. سکاڵا',
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

  // Sorani Arabic-script → Latin transliteration following the Hawar/Bedirxan
  // alphabet conventions (Wikipedia: "Sorani alphabet"). و and ی are
  // contextual: vowel (u, î) between consonants or in coda after a consonant;
  // consonant (w, y) elsewhere. وو is the long vowel û.
  const CK_AR_TO_LAT = {
    'ا':'a','آ':'a','ب':'b','پ':'p','ت':'t','ج':'c','چ':'ç',
    'ح':'h','خ':'x','د':'d','ر':'r','ڕ':'rr','ز':'z','ژ':'j',
    'س':'s','ش':'ş','ع':'','غ':'gh','ف':'f','ڤ':'v','ق':'q',
    'ک':'k','ك':'k','گ':'g','ل':'l','ڵ':'l','م':'m','ن':'n',
    'ھ':'h','ه':'h','ە':'e','ۆ':'o','ێ':'ê',
    'ئ':'','ؤ':'','ء':'','ـ':'',
    '٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9',
    '،':',','؛':';','؟':'?','«':'"','»':'"',
  };
  const CK_CONS = new Set('بپتجچحخدرڕزژسشعغفڤقکكگلڵمنھه'.split(''));
  const CK_VOW_LET = new Set('اآەێۆ'.split(''));
  const CK_AMB = c => c === 'و' || c === 'ی';
  const CK_LETTER = c => CK_CONS.has(c) || CK_VOW_LET.has(c) || CK_AMB(c);

  function ckArToLat(s) {
    if (!s) return '';
    // Step 1 — letter-by-letter map. وو digraph → û. و and ی are contextual.
    s = String(s).replace(/وو/g, '');
    const chars = [...s];
    let out = '';
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      if (c === '') { out += 'û'; continue; }
      if (CK_AMB(c)) {
        const prev = chars[i - 1] || '';
        const next = chars[i + 1] || '';
        const prevIsCons = CK_CONS.has(prev);
        const nextIsCons = CK_CONS.has(next);
        const nextIsLetter = CK_LETTER(next);
        const asVowel = prevIsCons && (nextIsCons || !nextIsLetter);
        if (c === 'و') out += asVowel ? 'u' : 'w';
        else out += asVowel ? 'î' : 'y';
        continue;
      }
      out += (c in CK_AR_TO_LAT) ? CK_AR_TO_LAT[c] : c;
    }
    // Step 2 — schwa epenthesis: Sorani inserts "i" to break impermissible
    // consonant clusters that aren't written in the Arabic script
    // (ئاگر → agir, کتێب → kitêb, کوردستان → kurdistan).
    return ckEpenthesize(out);
  }

  // Permissible word-final 2-consonant clusters in Sorani Latin. If a word
  // ends in CC and the cluster is in this set, no "i" is inserted (e.g. -rd
  // in "kurd"); otherwise an "i" is inserted before the last C (e.g. -gr in
  // "agr" → "agir"). Mid-word V-CC-V keeps the cluster (e.g. "kurdî"); a
  // 3+ consonant run is split with "i" between the first 2 and the rest.
  const CK_PERM_FIN = new Set([
    'rd','rt','rk','rg','rp','rb','rs','rş','rz','rj','rç','rm','rn','rl','rv','rf','rx',
    'ld','lt','lk','lp','ls','lm','lf',
    'nd','nt','nk','ng','ns','nş','nc','nj','nz',
    'mp','mb','ms','mr','mn',
    'st','sk','sp','sm','sn','sl','sr',
    'ft','xt','kt','şt','çt','pt',
    'ks','ps','ts','xs','vs','fs',
    'şm','şn','şk','şr',
  ]);
  const CK_VOWELS_LAT = 'aeêioîuûAEÊIOÎUÛ';
  function isLatVow(c) { return c && CK_VOWELS_LAT.includes(c); }
  function isLatCons(c) { return c && /\p{L}/u.test(c) && !isLatVow(c); }

  function ckEpenthesize(latin) {
    return latin.replace(/[\p{L}']+/gu, word => {
      const N = word.length;
      let out = '';
      let i = 0;
      while (i < N) {
        if (!isLatCons(word[i])) { out += word[i]; i++; continue; }
        let j = i;
        while (j < N && isLatCons(word[j])) j++;
        const run = word.slice(i, j);
        const len = run.length;
        const atStart = (i === 0);
        const atEnd = (j === N);
        if (len === 1) {
          out += run;
        } else if (len === 2) {
          const cluster = run.toLowerCase();
          if (atStart) {
            out += run[0] + 'i' + run[1];
          } else if (atEnd) {
            out += CK_PERM_FIN.has(cluster) ? run : (run[0] + 'i' + run[1]);
          } else {
            out += run;
          }
        } else {
          const chunks = [];
          let p = 0;
          while (p < len) {
            chunks.push(run.slice(p, Math.min(p + 2, len)));
            p += 2;
          }
          if (atStart && chunks[0].length === 2) {
            chunks[0] = chunks[0][0] + 'i' + chunks[0][1];
          }
          if (atEnd) {
            const last = chunks[chunks.length - 1];
            if (last.length === 2 && !CK_PERM_FIN.has(last.toLowerCase())) {
              chunks[chunks.length - 1] = last[0] + 'i' + last[1];
            }
          }
          out += chunks.join('i');
        }
        i = j;
      }
      return out;
    });
  }

  // Title case for transliterated names (e.g. "hejar mukrîyanî" → "Hejar Mukrîyanî").
  function titleCaseLat(s) {
    return String(s || '').replace(/(^|[\s\-])(\p{L})/gu, (m, sep, ch) => sep + ch.toUpperCase());
  }
  // First letter of each line (for the poem body).
  function capLinesLat(s) {
    return String(s || '').split('\n').map(line => {
      const m = line.match(/^(\s*)(\p{L})(.*)$/u);
      return m ? m[1] + m[2].toUpperCase() + m[3] : line;
    }).join('\n');
  }

  function truncateLines(text, maxLines) {
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length <= maxLines) return text;
    return lines.slice(0, maxLines).join('\n') + '\n…';
  }

  // ---- Poem state for the currently displayed piece ----
  let currentPoem = null;       // {path, body, fullBody, poet, book, title, viewUrl, dir}
  let poemExpanded = false;
  const POEM_BM_KEY = 'cal-poem-bookmarks';

  function getBookmarks() {
    try { return JSON.parse(localStorage.getItem(POEM_BM_KEY) || '[]'); }
    catch { return []; }
  }
  function setBookmarks(arr) {
    try { localStorage.setItem(POEM_BM_KEY, JSON.stringify(arr)); } catch (e) {}
  }
  function isBookmarked(path) {
    return getBookmarks().some(b => b.path === path);
  }
  function toggleBookmark() {
    if (!currentPoem) return;
    const arr = getBookmarks();
    const idx = arr.findIndex(b => b.path === currentPoem.path);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.unshift({
      path: currentPoem.path,
      poet: currentPoem.poet,
      book: currentPoem.book,
      title: currentPoem.title,
      savedAt: Math.floor(Date.now() / 1000),
    });
    setBookmarks(arr);
    renderPoemActions();
    renderSavedList();
  }

  function renderSavedList() {
    const ul = document.getElementById('poem-saved');
    const countEl = document.getElementById('poem-saved-count');
    const arr = getBookmarks();
    if (countEl) countEl.textContent = arr.length;
    if (!ul) return;
    ul.innerHTML = '';
    if (arr.length === 0) {
      const li = document.createElement('li');
      li.className = 'poem-saved-empty';
      li.textContent = t('savedEmpty');
      ul.appendChild(li);
      return;
    }
    const isLatin = script() === 'one';
    const tx = s => isLatin ? titleCaseLat(ckArToLat(s || '')) : (s || '');
    arr.forEach(b => {
      const li = document.createElement('li');
      li.className = 'poem-saved-item';
      li.innerHTML =
        '<button type="button" class="poem-saved-load" data-path="' + escapeHtml(b.path) + '">' +
          '<span class="poem-saved-title">' + escapeHtml(tx(b.title) || t('untitled')) + '</span>' +
          '<span class="poem-saved-meta">' + escapeHtml(tx(b.poet)) + (b.book ? ' · ' + escapeHtml(tx(b.book)) : '') + '</span>' +
        '</button>' +
        '<button type="button" class="poem-saved-remove" data-path="' + escapeHtml(b.path) + '" title="Remove">&times;</button>';
      ul.appendChild(li);
    });
  }

  function renderPoemActions() {
    const attr = document.getElementById('poem-attr');
    if (!attr || !currentPoem) return;
    const linkStyle = 'color:var(--fg);text-decoration:underline;text-decoration-style:dotted;cursor:pointer;background:none;border:0;padding:0;font:inherit';
    const translateUrl = 'https://translate.google.com/?sl=ckb&tl=en&text=' + encodeURIComponent(currentPoem.fullBody || currentPoem.body || '');
    const saved = isBookmarked(currentPoem.path);
    const star = saved ? '★' : '☆';
    const expandLabel = poemExpanded ? t('showLess') : t('viewFull');
    const poetAr = currentPoem.poet || '';
    const bookAr = currentPoem.book || '';
    const poetLat = titleCaseLat(ckArToLat(poetAr));
    const bookLat = titleCaseLat(ckArToLat(bookAr));
    const arFont = "'Vazirmatn','Tahoma',sans-serif";

    // Show the poet/book in BOTH scripts so they're always visible regardless
    // of the active toggle. Arabic line first (if a real poet name exists),
    // then the Latin transliteration on a second line.
    const arBlock = poetAr
      ? '<span dir="rtl" style="display:block;font-family:' + arFont + '">— ' + escapeHtml(poetAr) +
        (bookAr ? '  ·  <span style="opacity:.75">' + escapeHtml(bookAr) + '</span>' : '') +
        '</span>'
      : '';
    const latBlock = poetLat
      ? '<span dir="ltr" style="display:block;opacity:.85">— ' + escapeHtml(poetLat) +
        (bookLat ? '  ·  <span style="opacity:.75">' + escapeHtml(bookLat) + '</span>' : '') +
        '</span>'
      : '';

    attr.style.fontFamily = '';
    attr.innerHTML =
      '<span class="poem-attr-names" style="display:flex;flex-direction:column;gap:2px;flex:1 1 auto;min-width:0">' +
        arBlock + latBlock +
      '</span>' +
      '<span dir="ltr" style="opacity:.9;font-family:inherit;display:inline-flex;gap:10px;align-items:baseline;flex-wrap:wrap">' +
        '<button type="button" class="poem-bookmark" title="' + (saved ? t('removeBookmark') : t('bookmark')) + '" style="' + linkStyle + ';opacity:' + (saved ? 1 : 0.7) + '">' + star + '</button>' +
        '<button type="button" class="poem-share" title="' + t('share') + '" style="' + linkStyle + '">' + t('share') + ' &#x2197;</button>' +
        (currentPoem.fullBody && currentPoem.fullBody !== currentPoem.body && !poemExpanded ? '<button type="button" class="poem-expand" style="' + linkStyle + '">' + expandLabel + '</button>' : '') +
        (poemExpanded ? '<button type="button" class="poem-expand" style="' + linkStyle + '">' + t('showLess') + '</button>' : '') +
        (currentPoem.viewUrl ? '<a href="' + currentPoem.viewUrl + '" target="_blank" rel="noopener" style="' + linkStyle + '">' + t('onGitHub') + ' &#x2197;</a>' : '') +
        ((currentPoem.fullBody || currentPoem.body) ? '<a href="' + translateUrl + '" target="_blank" rel="noopener" style="' + linkStyle + '">' + t('translate') + ' &#x2197;</a>' : '') +
      '</span>';
  }

  async function sharePoem() {
    if (!currentPoem) return;
    const url = currentPoem.viewUrl || (location.origin + location.pathname);
    const poetLat = titleCaseLat(ckArToLat(currentPoem.poet || ''));
    const titleLat = titleCaseLat(ckArToLat(currentPoem.title || '')) || 'Kurdish poem';
    const snippet = (currentPoem.body || '').split('\n').slice(0, 4).join('\n');
    const text = snippet + (poetLat ? '\n\n— ' + poetLat : '');
    if (navigator.share) {
      try { await navigator.share({ title: titleLat, text: text, url: url }); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    showShareMenu({ title: titleLat, text: text, url: url });
  }

  function showShareMenu(d) {
    const enc = encodeURIComponent;
    const tweetText = (d.text + ' — ' + d.url).slice(0, 270);
    const links = [
      { name: 'X (Twitter)', href: 'https://twitter.com/intent/tweet?text=' + enc(tweetText) },
      { name: 'WhatsApp',    href: 'https://wa.me/?text=' + enc(d.text + '\n' + d.url) },
      { name: 'Telegram',    href: 'https://t.me/share/url?url=' + enc(d.url) + '&text=' + enc(d.text) },
      { name: 'Facebook',    href: 'https://www.facebook.com/sharer/sharer.php?u=' + enc(d.url) },
      { name: 'Email',       href: 'mailto:?subject=' + enc(d.title) + '&body=' + enc(d.text + '\n\n' + d.url) },
      { name: t('copyLink'), action: 'copy' },
    ];
    const overlay = document.createElement('div');
    overlay.className = 'poem-share-overlay';
    const items = links.map((l, i) => l.href
      ? '<a href="' + l.href + '" target="_blank" rel="noopener" class="poem-share-link">' + l.name + '</a>'
      : '<button type="button" data-i="' + i + '" class="poem-share-link">' + l.name + '</button>'
    ).join('');
    overlay.innerHTML = '<div class="poem-share-menu" role="dialog" aria-label="' + t('sharePoem') + '">' +
      items +
      '<button type="button" class="poem-share-close">' + t('close') + '</button>' +
      '</div>';
    overlay.addEventListener('click', e => {
      if (e.target === overlay || e.target.classList.contains('poem-share-close')) {
        overlay.remove();
        return;
      }
      const idx = e.target.dataset && e.target.dataset.i;
      if (idx != null) {
        const link = links[+idx];
        if (link.action === 'copy') {
          (navigator.clipboard ? navigator.clipboard.writeText(d.url) : Promise.reject())
            .then(() => { e.target.textContent = t('copied'); setTimeout(() => overlay.remove(), 700); })
            .catch(() => { e.target.textContent = t('copyFailed'); });
        }
      }
    });
    document.body.appendChild(overlay);
  }

  function setPoemUI(p) {
    currentPoem = p;
    poemExpanded = false;
    renderPoemBody();
    renderPoemActions();
  }

  function renderPoemBody() {
    if (!currentPoem) return;
    const p = currentPoem;
    const titleAr = document.getElementById('poem-title');
    const titleLat = document.getElementById('poem-title-lat');
    const orig = document.getElementById('poem-orig');
    const latin = document.getElementById('poem-latin');
    const trans = document.getElementById('poem-trans');
    const sourceDir = p.dir || 'rtl';
    const isArabicSource = sourceDir === 'rtl';
    const rawBody = poemExpanded && p.fullBody ? p.fullBody : p.body;

    // Title (poem name): shown both in Arabic script and Latin transliteration.
    if (titleAr) {
      if (isArabicSource && p.title) {
        titleAr.textContent = p.title;
        titleAr.style.display = '';
      } else {
        titleAr.style.display = 'none';
      }
    }
    if (titleLat) {
      if (isArabicSource && p.title) {
        titleLat.textContent = titleCaseLat(ckArToLat(p.title));
        titleLat.style.display = '';
      } else {
        titleLat.style.display = 'none';
      }
    }

    // Original (Arabic-script) — always shown if source is rtl.
    orig.textContent = rawBody;
    if (isArabicSource) {
      orig.setAttribute('dir', 'rtl');
      orig.style.fontFamily = "'Vazirmatn','Tahoma',sans-serif";
      orig.style.textAlign = 'right';
    } else {
      orig.setAttribute('dir', 'ltr');
      orig.style.fontFamily = '';
      orig.style.textAlign = 'left';
    }
    orig.style.display = '';

    // Latin transliteration — shown alongside the original for rtl poems.
    if (latin) {
      if (isArabicSource) {
        latin.textContent = capLinesLat(ckArToLat(rawBody));
        latin.setAttribute('dir', 'ltr');
        latin.style.display = '';
      } else {
        latin.textContent = '';
        latin.style.display = 'none';
      }
    }

    // Translation (English) — shown if available. Title is now rendered separately
    // above the body in both Arabic and Latin, so we don't fall back to it here.
    if (p.translation) {
      trans.textContent = p.translation;
      trans.setAttribute('dir', 'ltr');
      trans.style.fontFamily = '';
      trans.style.textAlign = 'left';
      trans.style.display = '';
    } else {
      trans.style.display = 'none';
    }
  }

  function togglePoemExpand() {
    if (!currentPoem || !currentPoem.fullBody) return;
    poemExpanded = !poemExpanded;
    renderPoemBody();
    renderPoemActions();
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function loadPoem(path) {
    setPoemUI({ path: path, body: t('loading'), fullBody: '', poet: '', dir: 'ltr' });
    const url = POEM_BASE + encodeURI(path);
    const enUrl = POEM_BASE + encodeURI(path + '.en');
    const view = POEM_VIEW + encodeURI(path);

    Promise.all([
      fetch(url).then(r => r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status))),
      fetch(enUrl).then(r => r.ok ? r.text() : '').catch(() => ''),
    ])
      .then(([text, enText]) => {
        const parsed = parseAllekok(text);
        const truncated = truncateLines(parsed.body, 6);
        let translation = '';
        if (enText) {
          const enParsed = parseAllekok(enText);
          translation = enParsed.body || enText.trim();
        }
        setPoemUI({
          path: path,
          body: truncated,
          fullBody: parsed.body,
          poet: parsed.poet,
          book: parsed.book,
          title: parsed.title,
          viewUrl: view,
          translation: translation,
          dir: 'rtl',
        });
      })
      .catch(err => {
        setPoemUI({
          path: path,
          body: t('poemErr') + ' (' + err.message + ').\nSee https://github.com/the-farshad/poems',
          fullBody: '',
          poet: '', dir: 'ltr',
        });
      });
  }

  function renderPoem() {
    const path = POEM_INDEX[Math.floor(Math.random() * POEM_INDEX.length)];
    loadPoem(path);
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
    eventsForYear(year).forEach(e => {
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
        '<strong>' + t('newrozPiroz') + '</strong> ' + t('newrozToday');
      return;
    }
    const target = new Date();
    target.setMonth(2, 21);
    if (target < new Date()) target.setFullYear(target.getFullYear() + 1);
    const sc = script();
    document.getElementById('newroz-days').textContent = digits(days, sc);
    document.getElementById('newroz-date').textContent = sc === 'two'
      ? '(' + digits(21, sc) + 'ی ' + gMonth(2) + '، ' + digits(target.getFullYear(), sc) + ')'
      : '(' + gMonth(2) + ' 21, ' + target.getFullYear() + ')';
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
      gMonth(m) + ' ' + y +
      '  ·  ' + NK_MONTHS[m] +
      '  ·  ~' + (CK_MONTHS_KURDI[Math.max(0, m - 2)] || CK_MONTHS_KURDI[0]);

    const grid = document.getElementById('month-grid');
    grid.innerHTML = '';
    for (let dIdx = 0; dIdx < 7; dIdx++) {
      const el = document.createElement('div');
      el.className = 'cal-dow';
      el.textContent = gDow(dIdx);
      grid.appendChild(el);
    }

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
      const ev = eventOn(m + 1, d, y);
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

  let daysShowAll = false;
  let daysQuery = '';

  function renderEvents() {
    const list = document.getElementById('days-list');
    list.innerHTML = '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const curMonth = today.getMonth() + 1;
    const q = daysQuery.trim().toLowerCase();

    const allEvents = eventsForYear(today.getFullYear());
    let items = allEvents.map(e => ({ ...e, daysAway: daysUntil(e.m, e.d) }));
    if (q) {
      items = items.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.sub.toLowerCase().includes(q));
    } else if (!daysShowAll) {
      items = items.filter(e => e.m === curMonth);
    }
    items.sort((a, b) => (q || daysShowAll) ? (a.m - b.m || a.d - b.d) : a.daysAway - b.daysAway);

    if (!items.length) {
      const li = document.createElement('li');
      li.style.opacity = '0.7';
      li.style.fontSize = '0.9em';
      li.textContent = q ? 'No matches.' : 'No important days this month. Tap "Show all" for the full year.';
      list.appendChild(li);
    }

    items.forEach(e => {
      const li = document.createElement('li');
      const when = document.createElement('span');
      when.className = 'cal-day-when';
      if (e.daysAway === 0) { when.textContent = 'today'; when.classList.add('upcoming'); }
      else if (e.daysAway === 1) { when.textContent = 'tomorrow'; when.classList.add('upcoming'); }
      else if (e.daysAway <= 30 && !daysShowAll && !q) { when.textContent = 'in ' + e.daysAway + ' days'; when.classList.add('upcoming'); }
      else when.textContent = gMonthShort(e.m - 1) + ' ' + e.d;

      const name = document.createElement(e.slug ? 'a' : 'span');
      name.className = 'cal-day-name';
      if (e.slug) name.href = './days/' + e.slug + '.html';
      name.innerHTML = escapeHtml(e.name) + '<span class="cal-day-sub">' + escapeHtml(e.sub) + '</span>';

      li.appendChild(when);
      li.appendChild(name);
      list.appendChild(li);
    });

    const btn = document.getElementById('days-toggle');
    if (btn) btn.textContent = (daysShowAll || q) ? (t('showOnly') + ' ' + gMonth(curMonth - 1)) : t('showAll');
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
  let figuresQuery = '';

  function renderFigures() {
    const list = document.getElementById('figures-list');
    if (!list) return;
    list.innerHTML = '';
    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const curDay = now.getDate();
    const q = figuresQuery.trim().toLowerCase();

    let items = FIGURES.slice();
    if (q) {
      items = items.filter(f =>
        (f.name || '').toLowerCase().includes(q) ||
        (f.role || '').toLowerCase().includes(q) ||
        (f.bio || '').toLowerCase().includes(q));
    } else if (!figuresShowAll) {
      items = items.filter(f => f.m === curMonth);
    }
    items.sort((a, b) => a.m - b.m || a.d - b.d);

    if (!items.length) {
      const li = document.createElement('li');
      li.style.opacity = '0.7';
      li.style.fontSize = '0.9em';
      li.textContent = q ? 'No matches.' : 'No figures recorded for this month. Tap "Show all" for the full list.';
      list.appendChild(li);
    }

    items.forEach(f => {
      const slug = figureSlug(f);
      const li = document.createElement('li');
      li.id = 'fig-' + slug;
      li.className = 'fig-item';
      if (f.m === curMonth && f.d === curDay) li.classList.add('today');
      const date = gMonthShort(f.m - 1) + ' ' + f.d;
      const star = f.type === 'b' ? '★' : '✦';
      const summary = document.createElement('button');
      summary.type = 'button';
      summary.className = 'fig-summary';
      summary.innerHTML =
        '<span class="fig-when">' + date + '</span>' +
        '<span class="fig-name"><span class="fig-mark">' + star + '</span>' + escapeHtml(f.name) + '</span>' +
        '<span class="fig-role">' + escapeHtml(f.role) + ' · ' + escapeHtml(f.years) + '</span>';
      summary.addEventListener('click', () => li.classList.toggle('expanded'));

      const detail = document.createElement('div');
      detail.className = 'fig-detail';
      detail.innerHTML =
        '<p>' + escapeHtml(f.bio || '') + '</p>' +
        (f.wiki ? '<p><a href="' + f.wiki + '" target="_blank" rel="noopener">Wikipedia &rarr;</a></p>' : '');

      li.appendChild(summary);
      li.appendChild(detail);
      list.appendChild(li);
    });

    const btn = document.getElementById('figures-toggle');
    if (btn) btn.textContent = (figuresShowAll || q) ? (t('showOnly') + ' ' + gMonth(curMonth - 1)) : t('showAll');
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
      renderMonth();
      renderEvents();
      renderFigures();
      populateJalaliPickers();
      renderNewroz();
      renderPoemBody();
      renderPoemActions();
      renderSavedList();
      applyScriptLabels();
    });
  });

  // Converter
  const convInput = document.getElementById('conv-input');
  const todayIso = new Date().toISOString().slice(0, 10);
  convInput.value = todayIso;
  convInput.addEventListener('input', () => renderConverter(convInput.value));

  // ICS export
  document.getElementById('export-ics').addEventListener('click', exportIcs);

  // Days show-all toggle + search
  const daysToggle = document.getElementById('days-toggle');
  if (daysToggle) daysToggle.addEventListener('click', () => {
    daysShowAll = !daysShowAll;
    daysQuery = '';
    const s = document.getElementById('days-search');
    if (s) s.value = '';
    renderEvents();
  });
  const daysSearch = document.getElementById('days-search');
  if (daysSearch) daysSearch.addEventListener('input', () => {
    daysQuery = daysSearch.value;
    renderEvents();
  });

  // Converter direction toggle + Jalali pickers
  function populateJalaliPickers() {
    const today = gregToJalali(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
    const yEl = document.getElementById('conv-jy');
    const mEl = document.getElementById('conv-jm');
    const dEl = document.getElementById('conv-jd');
    const sc = script();
    yEl.innerHTML = '';
    for (let y = today.y - 5; y <= today.y + 5; y++) {
      const o = document.createElement('option');
      // Just the Kurdish year (Jalali + 1321) — no separate Jalali number.
      o.value = y; o.textContent = digits(y + KURD_YEAR_OFFSET, sc);
      if (y === today.y) o.selected = true;
      yEl.appendChild(o);
    }
    mEl.innerHTML = '';
    const ckMonths = sc === 'two' ? CK_MONTHS_AR : CK_MONTHS_KURDI;
    for (let m = 1; m <= 12; m++) {
      const o = document.createElement('option');
      o.value = m; o.textContent = ckMonths[m - 1];
      if (m === today.m) o.selected = true;
      mEl.appendChild(o);
    }
    dEl.innerHTML = '';
    for (let d = 1; d <= 31; d++) {
      const o = document.createElement('option');
      o.value = d; o.textContent = digits(d, sc);
      if (d === today.d) o.selected = true;
      dEl.appendChild(o);
    }
    [yEl, mEl, dEl].forEach(el => el.addEventListener('change', renderConverter));
  }
  populateJalaliPickers();

  function applyConvDir(dir) {
    convDir = dir;
    try { localStorage.setItem('cal-conv-dir', dir); } catch (e) {}
    document.querySelectorAll('.seg[data-control="conv-dir"] button').forEach(x =>
      x.classList.toggle('active', x.dataset.value === convDir));
    document.getElementById('conv-mode-g2k').hidden = convDir !== 'g2k';
    document.getElementById('conv-mode-k2g').hidden = convDir !== 'k2g';
    renderConverter();
  }
  // initial state
  applyConvDir(convDir);
  document.querySelectorAll('.seg[data-control="conv-dir"] button').forEach(b => {
    b.addEventListener('click', () => applyConvDir(b.dataset.value));
  });

  // Poem
  document.getElementById('poem-shuffle').addEventListener('click', renderPoem);

  // Poem actions (delegated): bookmark, expand
  document.getElementById('poem-attr').addEventListener('click', (e) => {
    if (e.target.closest('.poem-bookmark')) toggleBookmark();
    if (e.target.closest('.poem-share')) sharePoem();
    if (e.target.closest('.poem-expand')) togglePoemExpand();
  });

  // Saved-poems toggle
  const savedToggle = document.getElementById('poem-saved-toggle');
  const savedList = document.getElementById('poem-saved');
  if (savedToggle && savedList) {
    savedToggle.addEventListener('click', () => {
      savedList.hidden = !savedList.hidden;
      if (!savedList.hidden) renderSavedList();
    });
    savedList.addEventListener('click', (e) => {
      const load = e.target.closest('.poem-saved-load');
      const remove = e.target.closest('.poem-saved-remove');
      if (load) {
        loadPoem(load.dataset.path);
        savedList.hidden = true;
      } else if (remove) {
        const arr = getBookmarks().filter(b => b.path !== remove.dataset.path);
        setBookmarks(arr);
        renderSavedList();
        renderPoemActions();
      }
    });
  }
  renderSavedList();
  applyScriptLabels();

  // Figures show-all toggle
  const figToggle = document.getElementById('figures-toggle');
  if (figToggle) figToggle.addEventListener('click', () => {
    figuresShowAll = !figuresShowAll;
    figuresQuery = '';
    const s = document.getElementById('figures-search');
    if (s) s.value = '';
    renderFigures();
  });
  // Figures search
  const figSearch = document.getElementById('figures-search');
  if (figSearch) figSearch.addEventListener('input', () => {
    figuresQuery = figSearch.value;
    renderFigures();
  });

  renderAll();
})();
