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

  // Northern Kurdish — Gregorian months, common Northern Kurdish names (per Wikipedia)
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
    { m: 1,  d: 1,  type: 'b', name: 'Mehmed Uzun',                role: 'Kurdish novelist',                  years: '1953—2007', bio: 'Northern Kurdish novelist whose works revived modern literary Northern Kurdish. Lived much of his life in Swedish exile.', wiki: 'https://en.wikipedia.org/wiki/Mehmed_Uzun' },
    { m: 1,  d: 9,  type: 'd', name: 'Sakine Cansız',              role: 'Kurdish political activist',        years: '1958—2013', bio: 'Co-founder of the PKK; assassinated in Paris in 2013.', wiki: 'https://en.wikipedia.org/wiki/Sakine_Cans%C4%B1z' },
    { m: 1,  d: 15, type: 'b', name: 'Aram Tigran',                role: 'Kurdish-Armenian musician',         years: '1934—2009', bio: 'Beloved singer who composed and performed in Kurdish, Armenian, Turkish, and Arabic.', wiki: 'https://en.wikipedia.org/wiki/Aram_Tigran' },
    { m: 1,  d: 31, type: 'd', name: 'Idris Barzani',              role: 'Kurdish leader',                    years: '1944—1987', bio: 'Son of Mustafa Barzani and joint leader of the KDP after his father; succeeded by his brother Massoud.', wiki: 'https://en.wikipedia.org/wiki/Idris_Barzani' },

    // February
    { m: 2,  d: 12, type: 'b', name: 'Sakine Cansız',              role: 'Kurdish political activist',        years: '1958—2013', bio: 'Co-founder of the PKK and a long-time political prisoner.', wiki: 'https://en.wikipedia.org/wiki/Sakine_Cans%C4%B1z' },
    { m: 2,  d: 22, type: 'd', name: 'Hejar Mukrîyanî',            role: 'Central Kurdish poet and translator',         years: '1920—1991', bio: 'Pen name of Abdurrahman Sharafkandi. Translator of the Quran and the Shahnameh into Central Kurdish.', wiki: 'https://en.wikipedia.org/wiki/Hejar' },
    { m: 2,  d: 25, type: 'b', name: 'Sharaf Khan Bidlisi',        role: 'Historian, prince of Bitlis',       years: '1543—1603', bio: 'Author of the Sharafnama (1597), the first major historical chronicle of the Kurds.', wiki: 'https://en.wikipedia.org/wiki/Sharaf_Khan_Bidlisi' },
    { m: 2,  d: 28, type: 'd', name: 'Yaşar Kemal',                role: 'Kurdish-Turkish novelist',          years: '1923—2015', bio: 'Author of Memed, My Hawk; one of the great Turkish-language novelists of the 20th century, of Kurdish origin.', wiki: 'https://en.wikipedia.org/wiki/Ya%C5%9Far_Kemal' },

    // March
    { m: 3,  d: 1,  type: 'd', name: 'Mustafa Barzani',            role: 'Kurdish leader',                    years: '1903—1979', bio: 'Founding leader of the modern Kurdish national movement in Iraq; Defense Minister of the Republic of Kurdistan.', wiki: 'https://en.wikipedia.org/wiki/Mustafa_Barzani' },
    { m: 3,  d: 4,  type: 'd', name: 'Saladin (Selahaddînê Eyûbî)',role: 'Sultan and military leader',        years: '1137—1193', bio: 'Founder of the Ayyubid dynasty; of Kurdish origin from Tikrit. Recaptured Jerusalem in 1187.', wiki: 'https://en.wikipedia.org/wiki/Saladin' },
    { m: 3,  d: 14, type: 'b', name: 'Mustafa Barzani',            role: 'Kurdish leader',                    years: '1903—1979', bio: 'Founding leader of the modern Kurdish national movement in Iraq.', wiki: 'https://en.wikipedia.org/wiki/Mustafa_Barzani' },
    { m: 3,  d: 15, type: 'b', name: 'Hejar Mukrîyanî',            role: 'Central Kurdish poet and translator',         years: '1920—1991', bio: 'Major figure in 20th-century Kurdish letters; produced one of the most important Central Kurdish dictionaries.', wiki: 'https://en.wikipedia.org/wiki/Hejar' },
    { m: 3,  d: 31, type: 'd', name: 'Qazi Muhammad',              role: 'President of the Republic of Kurdistan', years: '1893—1947', bio: 'Founder and only president of the short-lived Republic of Kurdistan (1946). Executed in 1947 in the same square where he proclaimed the republic.', wiki: 'https://en.wikipedia.org/wiki/Qazi_Muhammad' },

    // April
    { m: 4,  d: 1,  type: 'b', name: 'Yılmaz Güney',               role: 'Kurdish-Turkish filmmaker',         years: '1937—1984', bio: 'Director of "Yol" (Palme d\'Or, 1982); one of the most acclaimed filmmakers of his generation.', wiki: 'https://en.wikipedia.org/wiki/Y%C4%B1lmaz_G%C3%BCney' },
    { m: 4,  d: 4,  type: 'b', name: 'Abdullah Öcalan',            role: 'Founder of the PKK',                years: 'b. 1948',   bio: 'Co-founder of the PKK and one of the most influential — and controversial — figures in modern Kurdish politics. Imprisoned in Turkey since 1999.', wiki: 'https://en.wikipedia.org/wiki/Abdullah_%C3%96calan' },
    { m: 4,  d: 18, type: 'd', name: 'Hêmin Mukrîyanî',            role: 'Central Kurdish poet',                       years: '1921—1986', bio: 'Pen name of Mohammad Amin Sheikhalislami. One of the leading Central Kurdish poets of the 20th century.', wiki: 'https://en.wikipedia.org/wiki/H%C3%AAmin' },

    // May
    { m: 5,  d: 2,  type: 'b', name: 'Şêrko Bêkes',                role: 'Central Kurdish poet',                       years: '1940—2013', bio: 'One of the giants of modern Kurdish poetry. Pioneered the "poster poem" form.', wiki: 'https://en.wikipedia.org/wiki/Sherko_Bekas' },
    { m: 5,  d: 3,  type: 'b', name: 'Leyla Zana',                 role: 'Turkish-Kurdish politician',        years: 'b. 1961',   bio: 'First Kurdish woman elected to the Turkish parliament; sentenced for speaking Kurdish at her swearing-in.', wiki: 'https://en.wikipedia.org/wiki/Leyla_Zana' },
    { m: 5,  d: 9,  type: 'd', name: 'Ferzad Kemanger',            role: 'Kurdish teacher and activist',      years: '1975—2010', bio: 'Iranian-Kurdish teacher and human-rights activist; executed by Iran on charges he denied.', wiki: 'https://en.wikipedia.org/wiki/Farzad_Kamangar' },
    { m: 5,  d: 12, type: 'd', name: 'Leyla Qasim',                role: 'Kurdish activist',                  years: '1952—1974', bio: 'First Kurdish woman to be executed for political activism in modern Iraq. Member of the KDP.', wiki: 'https://en.wikipedia.org/wiki/Leyla_Qasim' },
    { m: 5,  d: 15, type: 'b', name: 'Salim Barakat',              role: 'Syrian-Kurdish poet and novelist',  years: 'b. 1951',   bio: 'Major contemporary Arabic-language poet and novelist of Kurdish origin from Qamishli.', wiki: 'https://en.wikipedia.org/wiki/Salim_Barakat' },

    // June
    { m: 6,  d: 11, type: 'd', name: 'Piremerd',                   role: 'Central Kurdish poet, journalist',           years: '1867—1950', bio: 'Pen name of Hac Tofiq. Influential Central Kurdish poet, journalist, and educator from Sulaymaniyah.', wiki: 'https://en.wikipedia.org/wiki/Piremerd' },
    { m: 6,  d: 29, type: 'd', name: 'Sheikh Said',                role: 'Religious leader, rebellion of 1925',years: '1865—1925', bio: 'Naqshbandi sheikh who led the 1925 Kurdish uprising in Turkey; executed with 46 others in Diyarbakır.', wiki: 'https://en.wikipedia.org/wiki/Sheikh_Said' },

    // July
    { m: 7,  d: 13, type: 'd', name: 'Abdul Rahman Ghassemlou',    role: 'Leader of KDPI',                    years: '1930—1989', bio: 'Long-time leader of KDPI. Assassinated in Vienna during peace talks with Iranian agents.', wiki: 'https://en.wikipedia.org/wiki/Abdul_Rahman_Ghassemlou' },

    // August
    { m: 8,  d: 4,  type: 'd', name: 'Şêrko Bêkes',                role: 'Central Kurdish poet',                       years: '1940—2013', bio: 'Death anniversary of one of the giants of modern Kurdish poetry.', wiki: 'https://en.wikipedia.org/wiki/Sherko_Bekas' },
    { m: 8,  d: 8,  type: 'd', name: 'Aram Tigran',                role: 'Kurdish-Armenian musician',         years: '1934—2009', bio: 'Death anniversary of the multilingual singer who carried Kurdish songs to the Armenian and Syriac diasporas.', wiki: 'https://en.wikipedia.org/wiki/Aram_Tigran' },
    { m: 8,  d: 16, type: 'b', name: 'Massoud Barzani',            role: 'KDP leader, former president of KRI',years: 'b. 1946',   bio: 'Son of Mustafa Barzani; led the KDP from 1979 and served as President of the Kurdistan Region (2005–2017).', wiki: 'https://en.wikipedia.org/wiki/Massoud_Barzani' },

    // September
    { m: 9,  d: 9,  type: 'd', name: 'Yılmaz Güney',               role: 'Kurdish-Turkish filmmaker',         years: '1937—1984', bio: 'Director of "Yol" (1982); won the Palme d\'Or while in exile in France.', wiki: 'https://en.wikipedia.org/wiki/Y%C4%B1lmaz_G%C3%BCney' },
    { m: 9,  d: 17, type: 'd', name: 'Sadegh Sharafkandi',         role: 'Successor of Ghassemlou (KDPI)',     years: '1938—1992', bio: 'Secretary-general of KDPI after Ghassemlou. Assassinated at the Mykonos restaurant in Berlin.', wiki: 'https://en.wikipedia.org/wiki/Sadegh_Sharafkandi' },

    // October
    { m: 10, d: 3,  type: 'd', name: 'Jalal Talabani',             role: 'Co-founder of PUK, President of Iraq', years: '1933—2017', bio: 'Founding leader of the PUK and President of Iraq (2005–2014); the first non-Arab president of an Arab-majority state in modern history.', wiki: 'https://en.wikipedia.org/wiki/Jalal_Talabani' },
    { m: 10, d: 6,  type: 'b', name: 'Yaşar Kemal',                role: 'Kurdish-Turkish novelist',          years: '1923—2015', bio: 'Author of Memed, My Hawk and the İnce Memed cycle.', wiki: 'https://en.wikipedia.org/wiki/Ya%C5%9Far_Kemal' },
    { m: 10, d: 9,  type: 'd', name: 'Sheikh Mahmud Barzanji',     role: 'King of Kurdistan (1922—1924)',     years: '1878—1956', bio: 'Led several uprisings against British control of southern Kurdistan; briefly proclaimed himself King of Kurdistan.', wiki: 'https://en.wikipedia.org/wiki/Mahmud_Barzanji' },
    { m: 10, d: 11, type: 'd', name: 'Mehmed Uzun',                role: 'Kurdish novelist',                  years: '1953—2007', bio: 'Death anniversary of the writer who brought modern Northern Kurdish literature to a wider audience.', wiki: 'https://en.wikipedia.org/wiki/Mehmed_Uzun' },
    { m: 10, d: 12, type: 'd', name: 'Hevrîn Xelef',               role: 'Syrian-Kurdish politician',         years: '1984—2019', bio: 'Secretary-general of the Future Syria Party; assassinated in northern Syria during the 2019 Turkish offensive.', wiki: 'https://en.wikipedia.org/wiki/Hevrin_Khalaf' },
    { m: 10, d: 22, type: 'd', name: 'Cegerxwîn',                  role: 'Northern Kurdish poet',                     years: '1903—1984', bio: 'Pen name of Şêx Mûs Hesen. One of the most influential Northern Kurdish poets; his verse was central to 20th-century Kurdish national consciousness.', wiki: 'https://en.wikipedia.org/wiki/Cegerxw%C3%AEn' },

    // November
    { m: 11, d: 9,  type: 'b', name: 'Piremerd',                   role: 'Central Kurdish poet, journalist',           years: '1867—1950', bio: 'Sulaymaniyah-born poet whose journalism shaped early modern Central Kurdish prose.', wiki: 'https://en.wikipedia.org/wiki/Piremerd' },
    { m: 11, d: 9,  type: 'b', name: 'Abdulla Pashew',             role: 'Central Kurdish poet',                       years: 'b. 1946',   bio: 'One of the most widely read living Kurdish poets; lives in exile in Norway.', wiki: 'https://en.wikipedia.org/wiki/Abdulla_Pashew' },
    { m: 11, d: 12, type: 'b', name: 'Jalal Talabani',             role: 'Co-founder of PUK, President of Iraq', years: '1933—2017', bio: 'Founding leader of the PUK; later President of Iraq (2005–2014).', wiki: 'https://en.wikipedia.org/wiki/Jalal_Talabani' },
    { m: 11, d: 18, type: 'b', name: 'Ehmedê Xanî',                role: 'Classical poet',                    years: '~1651—1707',bio: 'Author of the Kurdish national epic Mem û Zîn (1692); pioneer of literary Northern Kurdish. Birth date approximate.', wiki: 'https://en.wikipedia.org/wiki/Ahmad_Khani' },
    { m: 11, d: 18, type: 'd', name: 'Goran',                      role: 'Central Kurdish modernist poet',             years: '1904—1962', bio: 'Pen name of Abdulla Sulaiman. Pioneer of modern Central Kurdish free-verse and a touchstone of 20th-century Kurdish poetry.', wiki: 'https://en.wikipedia.org/wiki/Abdulla_Goran' },

    // December
    { m: 12, d: 16, type: 'd', name: 'Mihemed Mamlê',              role: 'Kurdish singer',                    years: '1925—1999', bio: 'Iconic singer of Kurdish folk and patriotic songs from Mukriyan; long held a near-monopoly on Iran-state Kurdish broadcasting.', wiki: 'https://en.wikipedia.org/wiki/Mohammad_Mamle' },
    { m: 12, d: 18, type: 'd', name: 'Eyşe Şan',                   role: 'Kurdish singer',                    years: '1938—1996', bio: 'Pioneering Kurdish woman singer from Diyarbakır; defied bans on Kurdish-language song.', wiki: 'https://en.wikipedia.org/wiki/Ay%C5%9Fe_%C5%9Fan' },
    { m: 12, d: 22, type: 'b', name: 'Abdul Rahman Ghassemlou',    role: 'Leader of KDPI',                    years: '1930—1989', bio: 'Born in Urmia. Led the Democratic Party of Iranian Kurdistan for two decades.', wiki: 'https://en.wikipedia.org/wiki/Abdul_Rahman_Ghassemlou' },
    { m: 12, d: 23, type: 'b', name: 'Şivan Perwer',               role: 'Kurdish singer',                    years: 'b. 1955',   bio: 'One of the most beloved Kurdish musicians; his songs are central to modern Northern Kurdish popular culture.', wiki: 'https://en.wikipedia.org/wiki/%C5%9Eivan_Perwer' },

    // ---- Round 2 of figures research ----

    // Bedirxan family — language reformers / nationalists
    { m: 4,  d: 26, type: 'b', name: 'Celadet Bedirxan',           role: 'Linguist, founder of Hawar journal', years: '1893—1951', bio: 'Created the modern Latin-script Northern Kurdish alphabet (Hawar alphabet, 1932); his journal Hawar shaped 20th-century Northern Kurdish literacy.', wiki: 'https://en.wikipedia.org/wiki/Celadet_Ali_Bedirkhan' },
    { m: 9,  d: 21, type: 'b', name: 'Kamuran Bedirxan',           role: 'Writer, diplomat',                  years: '1895—1978', bio: 'Brother of Celadet; co-edited Hawar and Ronahî, taught Kurdish at the Sorbonne, and represented the Kurdish question in Europe for decades.', wiki: 'https://en.wikipedia.org/wiki/Kamuran_Bedirkhan' },
    { m: 11, d: 15, type: 'd', name: 'Idris Bitlisi',              role: 'Historian, statesman',              years: '1457—1520', bio: 'Ottoman-era Kurdish polymath; negotiated the alliance between Ottoman Sultan Selim I and Kurdish emirs that defined Kurdish autonomy for centuries.', wiki: 'https://en.wikipedia.org/wiki/Idris_Bitlisi' },

    // Singers / cultural figures
    { m: 6,  d: 4,  type: 'd', name: 'Hesen Zîrek',                role: 'Central Kurdish singer',                     years: '1921—1972', bio: 'Prolific Central Kurdish folk singer from Bukan; recorded thousands of pieces, many of which became standards.', wiki: 'https://en.wikipedia.org/wiki/Hassan_Zirak' },
    { m: 10, d: 28, type: 'b', name: 'Ahmet Kaya',                 role: 'Kurdish-Turkish singer',            years: '1957—2000', bio: 'Beloved political singer of Kurdish origin who sang in Turkish; exiled after publicly singing in Kurdish, died in Paris.', wiki: 'https://en.wikipedia.org/wiki/Ahmet_Kaya' },
    { m: 11, d: 16, type: 'd', name: 'Ahmet Kaya',                 role: 'Kurdish-Turkish singer',            years: '1957—2000', bio: 'Death anniversary of one of the great voices of Anatolia.', wiki: 'https://en.wikipedia.org/wiki/Ahmet_Kaya' },

    // Filmmakers / contemporary
    { m: 2,  d: 1,  type: 'b', name: 'Bahman Ghobadi',             role: 'Kurdish filmmaker',                 years: 'b. 1969',   bio: 'Director of A Time for Drunken Horses, Turtles Can Fly, and No One Knows About Persian Cats; one of the most internationally recognized Kurdish filmmakers.', wiki: 'https://en.wikipedia.org/wiki/Bahman_Ghobadi' },

    // Activists / contemporary politics
    { m: 3,  d: 10, type: 'b', name: 'Nadia Murad',                role: 'Yezîdî activist, Nobel laureate',    years: 'b. 1993',   bio: 'Yezîdî survivor of the 2014 ISIS attacks; awarded the 2018 Nobel Peace Prize for her work documenting genocide and assisting survivors.', wiki: 'https://en.wikipedia.org/wiki/Nadia_Murad' },
    { m: 4,  d: 10, type: 'b', name: 'Selahattin Demirtaş',        role: 'Kurdish-Turkish politician',         years: 'b. 1973',   bio: 'Former co-chair of the HDP; presidential candidate in Turkey; imprisoned since 2016.', wiki: 'https://en.wikipedia.org/wiki/Selahattin_Demirta%C5%9F' },
    { m: 5,  d: 22, type: 'd', name: 'Mîr Bedirxan',               role: 'Kurdish prince',                    years: '1803—1869', bio: 'Last semi-autonomous emir of Cizîre-Botan; led one of the major 19th-century Kurdish revolts against Ottoman centralization.', wiki: 'https://en.wikipedia.org/wiki/Bedir_Khan_Beg' },

    // Older figures
    { m: 7,  d: 1,  type: 'b', name: 'Karim Khan Zand',            role: 'Founder of the Zand dynasty',        years: '~1705—1779',bio: 'Lak/Lor-Kurdish founder of the Zand dynasty in Iran; widely remembered as one of Iran\'s most just rulers. Birth date approximate.', wiki: 'https://en.wikipedia.org/wiki/Karim_Khan_Zand' },

    // Modern Northern Kurdish literature
    { m: 4,  d: 28, type: 'b', name: 'Bextiyar Elî',               role: 'Central Kurdish novelist',                    years: 'b. 1966',   bio: 'Major contemporary Central Kurdish novelist and poet; his fiction has been translated into many European languages.', wiki: 'https://en.wikipedia.org/wiki/Bachtyar_Ali' },
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

    // Translation slot: manual English translation if provided, else
    // hide and offer a "Translate ↗" link in the attribution row.
    if (p.translation) {
      trans.textContent = p.translation;
      trans.setAttribute('dir', 'ltr');
      trans.style.fontFamily = '';
      trans.style.textAlign = 'left';
      trans.style.display = '';
    } else {
      // show poem title in Kurdish script as fallback
      trans.textContent = p.title || '';
      trans.setAttribute('dir', 'rtl');
      trans.style.fontFamily = "'Vazirmatn','Tahoma',sans-serif";
      trans.style.textAlign = 'right';
      trans.style.display = p.title ? '' : 'none';
    }

    // Attribution row uses Vazirmatn so Kurdish-script names render correctly,
    // and includes view-full + translate links.
    attr.style.fontFamily = "'Vazirmatn','Tahoma',sans-serif";
    attr.style.direction = 'rtl';
    attr.style.textAlign = 'right';
    if (p.viewUrl || p.body) {
      const linkStyle = 'color:var(--fg);text-decoration:underline;text-decoration-style:dotted';
      const translateUrl = 'https://translate.google.com/?sl=ckb&tl=en&text=' + encodeURIComponent(p.body || '');
      attr.innerHTML =
        '<span dir="rtl">— ' + escapeHtml(p.poet || '') +
        (p.book ? '  ·  <span style="opacity:.75">' + escapeHtml(p.book) + '</span>' : '') +
        '</span>' +
        '<span dir="ltr" style="opacity:.85;margin-right:8px;font-family:inherit">' +
          (p.viewUrl ? '<a href="' + p.viewUrl + '" target="_blank" rel="noopener" style="' + linkStyle + '">view full</a>' : '') +
          (p.body ? '  ·  <a href="' + translateUrl + '" target="_blank" rel="noopener" style="' + linkStyle + '">translate &#x2197;</a>' : '') +
        '</span>';
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
    setPoemUI({ body: 'Loading…', poet: '', dir: 'ltr' });
    const path = POEM_INDEX[Math.floor(Math.random() * POEM_INDEX.length)];
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
          // .en sibling may have the same header format or be plain text;
          // strip header if present.
          const enParsed = parseAllekok(enText);
          translation = truncateLines(enParsed.body || enText.trim(), 8);
        }
        setPoemUI({
          body: truncated,
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
          body: 'Could not load a poem (' + err.message + ').\nSee https://github.com/the-farshad/poems',
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
      else when.textContent = G_MONTHS[e.m - 1].slice(0, 3) + ' ' + e.d;

      const name = document.createElement(e.slug ? 'a' : 'span');
      name.className = 'cal-day-name';
      if (e.slug) name.href = './days/' + e.slug + '.html';
      name.innerHTML = escapeHtml(e.name) + '<span class="cal-day-sub">' + escapeHtml(e.sub) + '</span>';

      li.appendChild(when);
      li.appendChild(name);
      list.appendChild(li);
    });

    const btn = document.getElementById('days-toggle');
    if (btn) btn.textContent = (daysShowAll || q) ? 'Show only ' + G_MONTHS[curMonth - 1] : 'Show all';
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
      const date = G_MONTHS[f.m - 1].slice(0, 3) + ' ' + f.d;
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
    if (btn) btn.textContent = (figuresShowAll || q) ? 'Show only ' + G_MONTHS[curMonth - 1] : 'Show all';
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
