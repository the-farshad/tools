(function () {
  // Tasteful per-event canvas effects. Activated by a data-effect attribute on <html>.
  const overlay = document.getElementById('event-overlay');
  if (!overlay) return;
  const effect = document.documentElement.getAttribute('data-effect');
  if (!effect || effect === 'none') return;

  const ctx = overlay.getContext('2d');
  function resize() {
    overlay.width = window.innerWidth * devicePixelRatio;
    overlay.height = window.innerHeight * devicePixelRatio;
    overlay.style.width = window.innerWidth + 'px';
    overlay.style.height = window.innerHeight + 'px';
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  // ---------- effect: embers (Newroz fires rising) ----------
  function embers() {
    const colors = ['#ffb84d', '#ff7a1a', '#ffd97d', '#ff5e3a'];
    const parts = [];
    for (let i = 0; i < 60; i++) parts.push(spawnEmber());
    function spawnEmber() {
      return {
        x: Math.random() * W(),
        y: H() + Math.random() * 20,
        vy: -0.4 - Math.random() * 1.1,
        vx: (Math.random() - 0.5) * 0.6,
        size: 1.5 + Math.random() * 2.2,
        color: colors[(Math.random() * colors.length) | 0],
        life: 200 + Math.random() * 200,
        flick: Math.random() * Math.PI * 2,
      };
    }
    function tick() {
      ctx.clearRect(0, 0, overlay.width, overlay.height);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.flick += 0.15;
        p.life--;
        if (p.life <= 0 || p.y < -10) { parts[i] = spawnEmber(); continue; }
        const a = Math.max(0, Math.min(1, p.life / 200)) * (0.6 + 0.4 * Math.sin(p.flick));
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------- effect: ash (somber drifting gray particles) ----------
  function ash() {
    const parts = [];
    for (let i = 0; i < 40; i++) parts.push(spawnAsh(true));
    function spawnAsh(initial) {
      return {
        x: Math.random() * W(),
        y: initial ? Math.random() * H() : -10,
        vx: -0.1 + (Math.random() - 0.5) * 0.15,
        vy: 0.2 + Math.random() * 0.4,
        size: 1 + Math.random() * 1.8,
        opacity: 0.15 + Math.random() * 0.25,
      };
    }
    function tick() {
      ctx.clearRect(0, 0, overlay.width, overlay.height);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.y > H() + 10) { parts[i] = spawnAsh(false); continue; }
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = '#b0b0b0';
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------- effect: flag-stripes (Kurdish red/white/green sweep) ----------
  function flagStripes() {
    let t = 0;
    function tick() {
      ctx.clearRect(0, 0, overlay.width, overlay.height);
      const stripeH = H() / 3;
      const offset = (Math.sin(t * 0.01) * 6);
      const colors = ['rgba(237,28,36,0.10)', 'rgba(255,255,255,0.10)', 'rgba(40,167,69,0.10)'];
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = colors[i];
        ctx.fillRect(0, i * stripeH + offset, W(), stripeH);
      }
      // sun in middle
      const cx = W() / 2 + Math.sin(t * 0.005) * 8;
      const cy = H() / 2 + offset;
      ctx.fillStyle = 'rgba(255, 215, 0, 0.18)';
      ctx.beginPath();
      ctx.arc(cx, cy, 60 + Math.sin(t * 0.02) * 6, 0, Math.PI * 2);
      ctx.fill();
      t++;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------- effect: alphabet (Kurdish letters falling) ----------
  function alphabet() {
    const chars = 'ABCÇDEÊFGHIÎJKLMNOPQRSŞTUÛVWXYZکوردیئاێۆ';
    const cols = Math.ceil(W() / 18);
    const drops = Array.from({ length: cols }, () => Math.random() * -50);
    function tick() {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, W(), H());
      ctx.font = '16px VT323, monospace';
      ctx.fillStyle = 'rgba(253, 193, 20, 0.6)';
      for (let i = 0; i < cols; i++) {
        const ch = chars[(Math.random() * chars.length) | 0];
        ctx.fillText(ch, i * 18, drops[i] * 18);
        drops[i]++;
        if (drops[i] * 18 > H() && Math.random() > 0.975) drops[i] = 0;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------- effect: candles (sober warm glow at the bottom) ----------
  function candles() {
    let t = 0;
    function tick() {
      ctx.clearRect(0, 0, overlay.width, overlay.height);
      const grad = ctx.createLinearGradient(0, H() - 200, 0, H());
      grad.addColorStop(0, 'rgba(255, 184, 77, 0)');
      const flick = 0.12 + 0.04 * Math.sin(t * 0.05);
      grad.addColorStop(1, 'rgba(255, 130, 30, ' + flick + ')');
      ctx.fillStyle = grad;
      ctx.fillRect(0, H() - 200, W(), 200);
      t++;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------- effect: sunRiseSet (slow day/night cycle with stars) ----------
  function sunRiseSet() {
    let t = 0;
    const CYCLE = 2700; // frames for full cycle ≈ 45s at 60fps
    const HORIZON = 0.86;
    const stars = [];
    for (let i = 0; i < 80; i++) stars.push({
      x: Math.random() * W(), y: Math.random() * H() * HORIZON,
      s: 0.5 + Math.random() * 1.4, twinkle: Math.random() * Math.PI * 2,
    });

    function lerp(a, b, k) { return a + (b - a) * k; }
    function lerpC(a, b, k) {
      return [Math.round(lerp(a[0], b[0], k)), Math.round(lerp(a[1], b[1], k)), Math.round(lerp(a[2], b[2], k))];
    }

    // palette stops keyed by sun angle (0=below horizon, 1=zenith)
    // night → dawn → midday → dusk → night
    function skyColors(daylight) {
      // top of sky
      const NIGHT_TOP = [12, 18, 40], DAWN_TOP = [80, 70, 130], MID_TOP = [120, 180, 240], DUSK_TOP = [150, 90, 110];
      // bottom of sky
      const NIGHT_BOT = [25, 25, 55], DAWN_BOT = [240, 130, 90], MID_BOT = [255, 200, 130], DUSK_BOT = [255, 110, 60];
      let top, bot;
      if (daylight < 0.05) { top = NIGHT_TOP; bot = NIGHT_BOT; }
      else if (daylight < 0.25) { const k = (daylight - 0.05) / 0.20; top = lerpC(NIGHT_TOP, DAWN_TOP, k); bot = lerpC(NIGHT_BOT, DAWN_BOT, k); }
      else if (daylight < 0.55) { const k = (daylight - 0.25) / 0.30; top = lerpC(DAWN_TOP, MID_TOP, k); bot = lerpC(DAWN_BOT, MID_BOT, k); }
      else { const k = Math.min(1, (daylight - 0.55) / 0.45); top = lerpC(MID_TOP, DUSK_TOP, k); bot = lerpC(MID_BOT, DUSK_BOT, k); }
      return [top, bot];
    }

    function tick() {
      ctx.clearRect(0, 0, overlay.width, overlay.height);
      const phase = (t % CYCLE) / CYCLE;     // 0..1 across full cycle
      // sun arc: phase 0 = sunrise from horizon-left, 0.5 = noon overhead, 1 = sunset to horizon-right, then below
      const arc = Math.sin(phase * Math.PI); // 0..1..0
      const goingUp = phase < 0.5;
      const sunX = lerp(W() * 0.05, W() * 0.95, phase);
      const sunY = H() * HORIZON - arc * H() * 0.7;
      // daylight 0..1 with smooth ease at horizon
      const daylight = Math.max(0, Math.sin(phase * Math.PI));

      // sky gradient
      const [topC, botC] = skyColors(daylight);
      const grad = ctx.createLinearGradient(0, 0, 0, H());
      grad.addColorStop(0, 'rgba(' + topC[0] + ',' + topC[1] + ',' + topC[2] + ',0.18)');
      grad.addColorStop(HORIZON - 0.02, 'rgba(' + botC[0] + ',' + botC[1] + ',' + botC[2] + ',0.22)');
      grad.addColorStop(HORIZON + 0.001, 'rgba(40, 25, 20, 0.35)');
      grad.addColorStop(1, 'rgba(20, 12, 10, 0.45)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W(), H());

      // stars when dim
      if (daylight < 0.35) {
        const starAlpha = (0.35 - daylight) / 0.35;
        stars.forEach(s => {
          const tw = 0.6 + 0.4 * Math.sin(s.twinkle + t * 0.05);
          ctx.fillStyle = 'rgba(255,255,255,' + (starAlpha * tw * 0.7) + ')';
          ctx.fillRect(s.x, s.y, s.s, s.s);
        });
      }

      // sun (only above horizon)
      if (sunY < H() * HORIZON + 4) {
        const horizonAmt = 1 - daylight; // 1 at sunrise/sunset, 0 at noon
        const sunR = Math.round(255);
        const sunG = Math.round(lerp(255, 110, horizonAmt));
        const sunB = Math.round(lerp(180, 50, horizonAmt));
        const glowR = 180 + 80 * horizonAmt;
        const glow = ctx.createRadialGradient(sunX, sunY, 20, sunX, sunY, glowR);
        glow.addColorStop(0, 'rgba(' + sunR + ',' + sunG + ',' + sunB + ',' + (0.55 + 0.2 * horizonAmt) + ')');
        glow.addColorStop(1, 'rgba(' + sunR + ',' + sunG + ',' + sunB + ',0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, glowR, 0, Math.PI * 2);
        ctx.fill();
        // sun disk
        ctx.fillStyle = 'rgba(' + sunR + ',' + sunG + ',' + sunB + ',0.95)';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 38 + 6 * horizonAmt, 0, Math.PI * 2);
        ctx.fill();
      }

      // horizon line
      ctx.fillStyle = 'rgba(40, 20, 15, 0.30)';
      ctx.fillRect(0, H() * HORIZON, W(), 2);

      t++;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------- effect: flagRaise (Kurdish flag rising, waving in wind) ----------
  function flagRaise() {
    let t = 0;
    const RAISE_FRAMES = 180; // ~3s rise
    function tick() {
      ctx.clearRect(0, 0, overlay.width, overlay.height);
      // sky gradient (mountainous warm sky)
      const grad = ctx.createLinearGradient(0, 0, 0, H());
      grad.addColorStop(0, 'rgba(180, 210, 240, 0.10)');
      grad.addColorStop(1, 'rgba(255, 200, 130, 0.16)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W(), H());

      // pole — fixed center-right
      const poleX = W() * 0.78;
      const poleTopY = H() * 0.10;
      const poleBotY = H() * 0.92;
      ctx.fillStyle = 'rgba(80, 60, 40, 0.6)';
      ctx.fillRect(poleX - 2, poleTopY, 4, poleBotY - poleTopY);
      // finial
      ctx.beginPath();
      ctx.arc(poleX, poleTopY, 5, 0, Math.PI * 2);
      ctx.fill();

      // flag dimensions
      const flagW = Math.min(W() * 0.32, 280);
      const flagH = flagW * 0.66; // 3:2-ish
      // raise progression
      const raise = Math.min(1, t / RAISE_FRAMES);
      // flag top y goes from below pole to about 12% of pole height
      const restTopY = poleTopY + 12;
      const flagTopY = lerp(poleBotY - flagH, restTopY, easeOut(raise));

      // wind animation after raise
      const windT = Math.max(0, t - RAISE_FRAMES);

      // draw flag in vertical strips so we can curl it
      const STRIPS = 36;
      const stripW = flagW / STRIPS;
      // horizontal stripe bands inside flag: red, white, green
      const bandH = flagH / 3;

      for (let i = 0; i < STRIPS; i++) {
        const xRatio = i / STRIPS;
        // wind displacement: sinusoidal wave; left edge (near pole) moves less
        const damp = Math.min(1, xRatio * 1.4);
        const wave = Math.sin(windT * 0.08 - xRatio * 6.2) * 14 * damp +
                     Math.sin(windT * 0.13 - xRatio * 9) * 6 * damp;
        const stripX = poleX - flagW + i * stripW;
        const yShift = wave;
        // each strip is a vertical column of the flag — draw the three bands
        ctx.fillStyle = 'rgba(237, 28, 36, 0.95)';   // red
        ctx.fillRect(stripX, flagTopY + yShift, stripW + 0.5, bandH);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'; // white
        ctx.fillRect(stripX, flagTopY + bandH + yShift, stripW + 0.5, bandH);
        ctx.fillStyle = 'rgba(40, 167, 69, 0.95)';   // green
        ctx.fillRect(stripX, flagTopY + 2 * bandH + yShift, stripW + 0.5, bandH);
      }

      // sun in the middle (21 rays)
      const sunCx = poleX - flagW / 2;
      // approximate y-shift at center
      const cIdx = STRIPS / 2;
      const cWave = Math.sin(windT * 0.08 - (cIdx / STRIPS) * 6.2) * 14 * Math.min(1, (cIdx / STRIPS) * 1.4);
      const sunCy = flagTopY + flagH / 2 + cWave;
      const sunR = flagH * 0.20;
      // rays
      ctx.save();
      ctx.translate(sunCx, sunCy);
      ctx.fillStyle = 'rgba(255, 215, 0, 0.95)';
      const RAYS = 21;
      for (let r = 0; r < RAYS; r++) {
        const a = (r / RAYS) * Math.PI * 2;
        ctx.save();
        ctx.rotate(a);
        ctx.beginPath();
        ctx.moveTo(-sunR * 0.18, -sunR * 0.55);
        ctx.lineTo(sunR * 0.18, -sunR * 0.55);
        ctx.lineTo(0, -sunR * 1.55);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      // sun disc
      ctx.beginPath();
      ctx.arc(0, 0, sunR * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      t++;
      requestAnimationFrame(tick);
    }
    function easeOut(k) { return 1 - Math.pow(1 - k, 3); }
    function lerp(a, b, k) { return a + (b - a) * k; }
    requestAnimationFrame(tick);
  }

  // ---------- effect: snowFlowers (snow falling + flowers blooming) ----------
  function snowFlowers() {
    const snow = [];
    for (let i = 0; i < 90; i++) snow.push(makeSnow(true));
    function makeSnow(initial) {
      return {
        x: Math.random() * W(),
        y: initial ? Math.random() * H() : -10,
        vy: 0.25 + Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 0.25,
        r: 0.8 + Math.random() * 1.8,
      };
    }
    const flowers = [];
    let flowerTimer = 30;
    const COLORS = ['#e63946', '#ffd166', '#ff7a45', '#9b5de5', '#f783ac', '#ee6c4d'];

    function spawnFlower() {
      flowers.push({
        x: Math.random() * (W() - 80) + 40,
        y: H() * 0.7 + Math.random() * H() * 0.22,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        bloom: 0,
        target: 7 + Math.random() * 6,
        rise: 0,
        life: 700 + Math.random() * 400,
      });
    }

    function tick() {
      ctx.clearRect(0, 0, overlay.width, overlay.height);
      // snow
      ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
      for (let i = 0; i < snow.length; i++) {
        const s = snow[i];
        s.x += s.vx;
        s.y += s.vy;
        if (s.y > H() + 5) { snow[i] = makeSnow(false); continue; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // ground line of accumulated snow (subtle)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.fillRect(0, H() - 6, W(), 6);

      // flowers spawn
      flowerTimer--;
      if (flowerTimer <= 0) {
        spawnFlower();
        flowerTimer = 60 + Math.random() * 90;
      }

      // flowers draw
      for (let i = flowers.length - 1; i >= 0; i--) {
        const f = flowers[i];
        if (f.bloom < f.target) f.bloom += 0.08;
        if (f.rise < 12) f.rise += 0.2;
        f.life--;
        if (f.life <= 0) { flowers.splice(i, 1); continue; }
        const alpha = Math.min(1, f.life / 200);
        // stem
        ctx.strokeStyle = 'rgba(70, 120, 60, ' + (alpha * 0.7) + ')';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(f.x, f.y - f.rise);
        ctx.stroke();
        // petals (5)
        const cx = f.x, cy = f.y - f.rise;
        ctx.fillStyle = f.color;
        ctx.globalAlpha = alpha;
        for (let p = 0; p < 5; p++) {
          const a = (p / 5) * Math.PI * 2 - Math.PI / 2;
          const px = cx + Math.cos(a) * f.bloom * 0.7;
          const py = cy + Math.sin(a) * f.bloom * 0.7;
          ctx.beginPath();
          ctx.arc(px, py, f.bloom * 0.55, 0, Math.PI * 2);
          ctx.fill();
        }
        // center
        ctx.fillStyle = 'rgba(255, 215, 0, ' + alpha + ')';
        ctx.beginPath();
        ctx.arc(cx, cy, f.bloom * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------- effect: parchment (floating scrolls on a worn surface) ----------
  function parchment() {
    const PAPERS = 6;
    const papers = [];
    for (let i = 0; i < PAPERS; i++) papers.push(spawnPaper(true));
    function spawnPaper(initial) {
      return {
        x: Math.random() * W(),
        y: initial ? Math.random() * H() : H() + 60,
        w: 80 + Math.random() * 60,
        h: 110 + Math.random() * 70,
        rot: (Math.random() - 0.5) * 0.5,
        vy: -0.15 - Math.random() * 0.25,
        vx: (Math.random() - 0.5) * 0.15,
        vrot: (Math.random() - 0.5) * 0.0025,
        sway: Math.random() * Math.PI * 2,
      };
    }
    function tick() {
      ctx.clearRect(0, 0, overlay.width, overlay.height);
      // sepia-tinted wash
      ctx.fillStyle = 'rgba(120, 90, 60, 0.04)';
      ctx.fillRect(0, 0, W(), H());
      for (let i = 0; i < papers.length; i++) {
        const p = papers[i];
        p.sway += 0.01;
        p.x += p.vx + Math.sin(p.sway) * 0.15;
        p.y += p.vy;
        p.rot += p.vrot;
        if (p.y + p.h < -20) { papers[i] = spawnPaper(false); continue; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        // shadow
        ctx.fillStyle = 'rgba(60, 40, 20, 0.10)';
        ctx.fillRect(-p.w / 2 + 3, -p.h / 2 + 3, p.w, p.h);
        // parchment body
        ctx.fillStyle = 'rgba(245, 230, 200, 0.55)';
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        // ink lines suggesting writing
        ctx.fillStyle = 'rgba(70, 50, 30, 0.45)';
        for (let line = 0; line < 5; line++) {
          const ly = -p.h / 2 + 14 + line * 14;
          const lw = p.w * (0.5 + Math.random() * 0.4);
          ctx.fillRect(-p.w / 2 + 8, ly, lw, 2);
        }
        // a wax seal
        ctx.fillStyle = 'rgba(160, 30, 30, 0.55)';
        ctx.beginPath();
        ctx.arc(0, p.h / 2 - 14, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------- effect: anfalCandles ---------------------------------------
  // Anfal Memorial: a single solitary candle. The flame burns calmly at
  // first, the wind gradually picks up over minutes, the flame flickers
  // and dances, smoke wisps drift, then the wind extinguishes it. Wax
  // drips, the candle casts a soft shadow, and the smoke lingers.
  function anfalCandles() {
    document.body.style.transition = 'filter 8s ease-in';
    requestAnimationFrame(() => {
      document.body.style.filter = 'grayscale(0.55) brightness(0.92)';
    });

    // ---- single candle, centered horizontally, lower-third vertically ----
    let candle = null;
    function placeCandle() {
      candle = {
        x: W() / 2,
        y: H() * 0.78,
        height: 110,
        width: 22,
        flame: 1,                 // 0 (out) … 1 (full burn)
        flicker: 0,
        wax: [],                  // dripping wax beads
        smoke: [],
        out: false,
        outAt: 0,
      };
    }
    placeCandle();
    window.addEventListener('resize', placeCandle);

    // ---- wind: a slowly building force, with calm pauses and gusts ----
    let wind = 0;             // current wind strength, 0 … 1
    let windTarget = 0;       // smoothed target the wind walks toward
    let phase = 'calm';       // 'calm' → 'rising' → 'gust' → 'calm' …
    let phaseT = 0;           // time within current phase (frames)
    const PHASE_LEN = {       // ~60fps
      calm:    420,           // ~7s of stillness
      rising:  720,           // ~12s of gradual rise
      gust:    300,           // ~5s of strong wind
    };

    // ---- visible airflow streaks that ride the wind ----
    const streaks = [];

    function drawShadow() {
      // soft elliptical shadow on the ground, lengthens and bends with wind
      const sx = candle.x + wind * 28;
      const sy = candle.y + 6;
      const len = 40 + wind * 35;
      const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, len);
      grad.addColorStop(0, 'rgba(0,0,0,0.35)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(sx, sy, len, 6 + wind * 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawCandleBody() {
      const w = candle.width;
      const h = candle.height;
      const x = candle.x;
      const yTop = candle.y - h;

      // body — vertical gradient with subtle melting curvature
      const grad = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
      grad.addColorStop(0,    '#a8946a');
      grad.addColorStop(0.18, '#d6c389');
      grad.addColorStop(0.5,  '#f3e6bd');
      grad.addColorStop(0.82, '#c8b074');
      grad.addColorStop(1,    '#8e7a52');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x - w / 2, yTop + 4);
      ctx.quadraticCurveTo(x - w / 2 - 1, candle.y, x - w / 2, candle.y);
      ctx.lineTo(x + w / 2, candle.y);
      ctx.quadraticCurveTo(x + w / 2 + 1, candle.y, x + w / 2, yTop + 4);
      ctx.closePath();
      ctx.fill();

      // melting top rim — slightly uneven
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath();
      ctx.ellipse(x, yTop + 1, w / 2, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,240,200,0.5)';
      ctx.beginPath();
      ctx.ellipse(x, yTop, w / 2 - 2, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // a couple of static drips on the side
      ctx.fillStyle = 'rgba(220,200,150,0.85)';
      ctx.beginPath();
      ctx.moveTo(x - w / 2 + 2, yTop + 6);
      ctx.quadraticCurveTo(x - w / 2 - 1, yTop + 16, x - w / 2 + 1, yTop + 30);
      ctx.quadraticCurveTo(x - w / 2 + 4, yTop + 24, x - w / 2 + 4, yTop + 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(220,200,150,0.7)';
      ctx.beginPath();
      ctx.moveTo(x + w / 2 - 2, yTop + 12);
      ctx.quadraticCurveTo(x + w / 2 + 2, yTop + 22, x + w / 2 - 1, yTop + 38);
      ctx.quadraticCurveTo(x + w / 2 - 4, yTop + 30, x + w / 2 - 4, yTop + 14);
      ctx.closePath();
      ctx.fill();

      // wick stub
      ctx.fillStyle = '#231b10';
      ctx.fillRect(x - 0.8, yTop - 7, 1.6, 7);
      // glowing ember at tip when burning
      if (candle.flame > 0.05) {
        ctx.fillStyle = 'rgba(255, 80, 30, ' + (0.6 * candle.flame) + ')';
        ctx.beginPath();
        ctx.arc(x, yTop - 6, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawFlame() {
      if (candle.flame <= 0.05) return;
      const x = candle.x;
      const yWick = candle.y - candle.height;
      candle.flicker += 0.18 + Math.random() * 0.06;
      // sway from wind + tiny natural flicker
      const sway = wind * 14 + Math.sin(candle.flicker * 1.3) * 1.5 + Math.sin(candle.flicker * 0.5) * 0.6;
      const tilt = wind * 0.45;
      const tall = (16 + Math.sin(candle.flicker * 2) * 1.8) * candle.flame * (1 - wind * 0.15);
      const baseW = 4.4;
      const tipX = x + sway;
      const tipY = yWick - tall - 4;

      // 1) outer halo — soft gold light
      const haloR = 26 * candle.flame;
      const halo = ctx.createRadialGradient(x + sway * 0.5, yWick - 8, 0, x + sway * 0.5, yWick - 8, haloR);
      halo.addColorStop(0,    'rgba(255, 220, 130,' + (0.55 * candle.flame) + ')');
      halo.addColorStop(0.4,  'rgba(255, 175,  80,' + (0.30 * candle.flame) + ')');
      halo.addColorStop(1,    'rgba(255, 175,  80, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x + sway * 0.5, yWick - 8, haloR, 0, Math.PI * 2);
      ctx.fill();

      // 2) outer flame — soft orange teardrop
      const outer = ctx.createRadialGradient(tipX, tipY, 0, tipX, (yWick + tipY) / 2, tall);
      outer.addColorStop(0,   'rgba(255, 240, 180, 0.95)');
      outer.addColorStop(0.5, 'rgba(255, 150,  60, 0.85)');
      outer.addColorStop(1,   'rgba(255,  90,  20, 0.0)');
      ctx.fillStyle = outer;
      ctx.beginPath();
      ctx.moveTo(x - baseW / 2, yWick - 1);
      ctx.bezierCurveTo(
        x - baseW * 0.9 + sway * 0.1,  yWick - tall * 0.55,
        tipX  - 1.1,                     tipY + tall * 0.35,
        tipX,                            tipY
      );
      ctx.bezierCurveTo(
        tipX  + 1.1,                     tipY + tall * 0.35,
        x + baseW * 0.9 + sway * 0.1,  yWick - tall * 0.55,
        x + baseW / 2,                   yWick - 1
      );
      ctx.closePath();
      ctx.fill();

      // 3) inner blue cone (the hottest part near wick base)
      ctx.fillStyle = 'rgba(120, 180, 255, ' + (0.55 * candle.flame) + ')';
      ctx.beginPath();
      ctx.ellipse(x + sway * 0.3, yWick - 3, 1.4, 4, tilt, 0, Math.PI * 2);
      ctx.fill();
      // 4) tiny white-hot core
      ctx.fillStyle = 'rgba(255, 255, 240, ' + (0.85 * candle.flame) + ')';
      ctx.beginPath();
      ctx.ellipse(x + sway * 0.4, yWick - 4, 0.9, 2.4, tilt, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawStreaks() {
      // wind streaks
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i];
        s.x += s.vx;
        s.life--;
        s.opacity *= 0.985;
        if (s.life <= 0 || s.opacity < 0.01) { streaks.splice(i, 1); continue; }
        ctx.strokeStyle = 'rgba(170, 160, 145, ' + s.opacity + ')';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 6, s.y + Math.sin(s.x * 0.02) * 1.5);
        ctx.stroke();
      }
    }

    function drawSmoke() {
      for (let i = candle.smoke.length - 1; i >= 0; i--) {
        const s = candle.smoke[i];
        s.y -= s.vy;
        s.x += s.vx + wind * 0.6;
        s.r += 0.18;
        s.a -= 0.0035;
        s.vx += (Math.random() - 0.5) * 0.03;
        if (s.a <= 0) { candle.smoke.splice(i, 1); continue; }
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
        grad.addColorStop(0, 'rgba(80, 80, 80, ' + s.a + ')');
        grad.addColorStop(1, 'rgba(80, 80, 80, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function spawnSmokePuff(strength) {
      const yWick = candle.y - candle.height;
      const n = strength === 'big' ? 14 : 1;
      for (let k = 0; k < n; k++) {
        candle.smoke.push({
          x: candle.x + (Math.random() - 0.5) * 4 + wind * 6,
          y: yWick - 8 - Math.random() * 4,
          vx: (Math.random() - 0.5) * 0.4 + wind * 0.4,
          vy: 0.45 + Math.random() * 0.5,
          r: strength === 'big' ? 3 + Math.random() * 2 : 1.5 + Math.random() * 1,
          a: strength === 'big' ? 0.55 : 0.18,
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      // dim background gradient — feels like dusk indoors
      const sky = ctx.createRadialGradient(W() / 2, candle.y - 80, 30, W() / 2, candle.y - 80, Math.max(W(), H()));
      sky.addColorStop(0,   'rgba(90, 70, 50, 0.18)');
      sky.addColorStop(0.5, 'rgba(35, 30, 25, 0.35)');
      sky.addColorStop(1,   'rgba(8, 6, 5, 0.6)');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W(), H());

      // ground line
      ctx.fillStyle = 'rgba(20, 15, 10, 0.35)';
      ctx.fillRect(0, candle.y + 4, W(), 2);

      // wind state machine
      phaseT++;
      if (phase === 'calm' && phaseT >= PHASE_LEN.calm) {
        phase = 'rising'; phaseT = 0;
      } else if (phase === 'rising' && phaseT >= PHASE_LEN.rising) {
        phase = 'gust'; phaseT = 0;
      } else if (phase === 'gust' && phaseT >= PHASE_LEN.gust) {
        phase = 'calm'; phaseT = 0;
      }
      if (phase === 'calm')   windTarget = 0.04 + Math.sin(phaseT * 0.01) * 0.03;
      if (phase === 'rising') windTarget = (phaseT / PHASE_LEN.rising) * 0.5 + Math.sin(phaseT * 0.02) * 0.06;
      if (phase === 'gust')   windTarget = 0.7 + Math.sin(phaseT * 0.05) * 0.18;
      // smooth approach
      wind += (windTarget - wind) * 0.03;

      // streaks proportional to wind
      const spawnRate = wind * 1.2;
      if (Math.random() < spawnRate) {
        streaks.push({
          x: -20,
          y: H() * (0.45 + Math.random() * 0.45),
          vx: 2 + wind * 5 + Math.random() * 1.5,
          life: 100,
          opacity: 0.18 + Math.random() * 0.18,
        });
      }

      // flame response to wind
      if (!candle.out) {
        // tiny smoke even when calm (spent wax fumes)
        if (Math.random() < 0.08 + wind * 0.3) spawnSmokePuff('small');
        // wind erodes the flame
        if (wind > 0.55) {
          candle.flame -= (wind - 0.55) * 0.012;
          if (candle.flame <= 0.06) {
            candle.flame = 0;
            candle.out = true;
            candle.outAt = performance.now();
            spawnSmokePuff('big');
          }
        } else {
          // recover slowly when wind eases
          candle.flame = Math.min(1, candle.flame + 0.0035);
        }
      } else {
        // after extinguish, the embers pulse for a few seconds
        const since = performance.now() - candle.outAt;
        if (since > 16000) {
          // very long pause then relight to allow loop
          candle.flame = 0.4;
          candle.out = false;
          phase = 'calm'; phaseT = 0;
        }
      }

      drawStreaks();
      drawShadow();
      drawCandleBody();
      drawFlame();
      drawSmoke();

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------- effect: halabjaGray --------------------------------------
  // Halabja Memorial: a field of bright daffodils. A gray wind sweeps
  // across; as it passes, every flower it touches loses its colour and
  // turns gray. After all are gray, fresh ones slowly grow and the cycle
  // repeats.
  // ---------- effect: halabjaGray ---------------------------------------
  // Halabja Memorial: a field of bright daffodils. A toxic yellow-green
  // wind sweeps across; flowers it touches lose their colour and turn
  // gray. Once all are gray, fresh ones grow back and the cycle repeats.
  function halabjaGray() {
    document.body.style.transition = 'filter 8s ease-in';
    requestAnimationFrame(() => {
      document.body.style.filter = 'sepia(0.06) brightness(0.96)';
    });

    // ---- field of daffodils ----
    const flowers = [];
    function plantFlowers(reset) {
      if (reset) flowers.length = 0;
      const N = Math.max(18, Math.min(34, Math.floor(W() / 36)));
      for (let i = 0; i < N; i++) {
        flowers.push({
          x: 18 + (i / N) * (W() - 36) + (Math.random() - 0.5) * 18,
          y: H() * 0.82 + Math.random() * H() * 0.10,
          bloom: 0,
          targetBloom: 6.5 + Math.random() * 2.5,
          stemH: 26 + Math.random() * 14,
          gray: 0,
          tilt: 0,
          tiltTarget: 0,
          rotation: (Math.random() - 0.5) * 0.06,  // a little natural lean
          headTilt: 0.1 + Math.random() * 0.15,    // daffodil heads droop forward
        });
      }
    }
    plantFlowers(true);
    window.addEventListener('resize', () => plantFlowers(true));

    // ---- toxic wind: a single travelling band, with curling cloud ----
    const wind = { active: false, dir: 1, x: -200, speed: 1.8, width: 220 };
    let windTimer = 80;

    // Toxic dust particles ride the wind
    const dust = [];
    // Curling vapor wisps near ground level
    const wisps = [];

    function lerpColor(a, b, t) {
      const ar = parseInt(a.slice(1, 3), 16),
            ag = parseInt(a.slice(3, 5), 16),
            ab = parseInt(a.slice(5, 7), 16);
      const br = parseInt(b.slice(1, 3), 16),
            bg = parseInt(b.slice(3, 5), 16),
            bb = parseInt(b.slice(5, 7), 16);
      return 'rgb(' +
        Math.round(ar + (br - ar) * t) + ',' +
        Math.round(ag + (bg - ag) * t) + ',' +
        Math.round(ab + (bb - ab) * t) + ')';
    }

    function drawDaffodil(f) {
      ctx.save();
      ctx.translate(f.x, f.y);
      f.tilt += (f.tiltTarget - f.tilt) * 0.06;
      ctx.rotate(f.tilt + f.rotation);

      const stemH = f.stemH;
      const r = f.bloom;
      const g = f.gray;
      const stemAlive = 'rgba(82, 110, 60, 0.85)';
      const stemDead  = 'rgba(115, 115, 115, 0.7)';

      // ---- stem with subtle curve ----
      ctx.strokeStyle = g >= 1 ? stemDead : (g > 0 ? lerpColorRgba(stemAlive, stemDead, g) : stemAlive);
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(2, -stemH * 0.5, 0, -stemH);
      ctx.stroke();

      // ---- long arching leaf ----
      ctx.beginPath();
      ctx.moveTo(0, -stemH * 0.55);
      ctx.bezierCurveTo(8, -stemH * 0.6, 11, -stemH * 0.78, 5, -stemH * 0.95);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -stemH * 0.4);
      ctx.bezierCurveTo(-7, -stemH * 0.45, -10, -stemH * 0.62, -4, -stemH * 0.78);
      ctx.stroke();

      // ---- flower head: tilted forward like real daffodils ----
      ctx.save();
      ctx.translate(0, -stemH);
      ctx.rotate(-f.headTilt);

      // 6 petals (perianth) — cream-white in life, dull gray when poisoned
      const petalAlive = '#f6efd5';
      const petalDead  = '#9c9c9c';
      ctx.globalAlpha = 0.94;
      const petalColor = g >= 1 ? petalDead : lerpColor(petalAlive, petalDead, g);
      ctx.fillStyle = petalColor;
      // back petals (3, behind the trumpet)
      for (let p = 0; p < 6; p += 2) {
        const ang = (p / 6) * Math.PI * 2 + Math.PI / 6;
        const px = Math.cos(ang) * r * 0.78;
        const py = Math.sin(ang) * r * 0.78;
        ctx.beginPath();
        ctx.ellipse(px, py, r * 0.62, r * 0.42, ang, 0, Math.PI * 2);
        ctx.fill();
      }
      // front petals (3, in front)
      for (let p = 1; p < 6; p += 2) {
        const ang = (p / 6) * Math.PI * 2 + Math.PI / 6;
        const px = Math.cos(ang) * r * 0.78;
        const py = Math.sin(ang) * r * 0.78;
        ctx.beginPath();
        ctx.ellipse(px, py, r * 0.62, r * 0.42, ang, 0, Math.PI * 2);
        ctx.fill();
      }

      // trumpet (corona) — golden cup with frilled edge
      const cupAlive = '#e7a128';
      const cupDead  = '#6b6b6b';
      const cupColor = g >= 1 ? cupDead : lerpColor(cupAlive, cupDead, g);
      ctx.fillStyle = cupColor;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.5, r * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      // shaded inside of cup
      const cupDarkAlive = 'rgba(180, 105, 25, 0.85)';
      const cupDarkDead  = 'rgba(60, 60, 60, 0.85)';
      ctx.fillStyle = g >= 1 ? cupDarkDead : lerpColorRgba(cupDarkAlive, cupDarkDead, g);
      ctx.beginPath();
      ctx.ellipse(0, r * 0.05, r * 0.36, r * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      // tiny stamens at center
      if (g < 0.6) {
        ctx.fillStyle = 'rgba(255, 230, 170, 0.85)';
        for (let s = 0; s < 3; s++) {
          ctx.beginPath();
          ctx.arc((s - 1) * 1.1, r * 0.05, 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.restore();
      ctx.restore();
    }

    function lerpColorRgba(a, b, t) {
      // lerp between two rgba(...) strings
      const re = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/;
      const A = a.match(re), B = b.match(re);
      if (!A || !B) return a;
      const r = Math.round(+A[1] + (+B[1] - +A[1]) * t);
      const g = Math.round(+A[2] + (+B[2] - +A[2]) * t);
      const bl = Math.round(+A[3] + (+B[3] - +A[3]) * t);
      const al = (A[4] ? +A[4] : 1) + ((B[4] ? +B[4] : 1) - (A[4] ? +A[4] : 1)) * t;
      return 'rgba(' + r + ',' + g + ',' + bl + ',' + al.toFixed(3) + ')';
    }

    function tick() {
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      // Sky: pale, slightly sickly
      const sky = ctx.createLinearGradient(0, 0, 0, H());
      sky.addColorStop(0,   'rgba(170, 175, 130, 0.06)');
      sky.addColorStop(0.6, 'rgba(180, 185, 130, 0.10)');
      sky.addColorStop(1,   'rgba(150, 160, 110, 0.16)');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W(), H());

      // grow flowers gradually
      for (const f of flowers) {
        if (f.bloom < f.targetBloom) f.bloom += 0.05;
      }

      // schedule wind
      if (!wind.active) {
        windTimer--;
        if (windTimer <= 0) {
          wind.active = true;
          wind.dir = Math.random() < 0.5 ? 1 : -1;
          wind.x = wind.dir > 0 ? -wind.width : W() + wind.width;
          wind.speed = 1.4 + Math.random() * 0.7;
        }
      } else {
        wind.x += wind.dir * wind.speed;
        // spawn dust streaks within the wind band
        for (let k = 0; k < 6; k++) {
          dust.push({
            x: wind.x + (Math.random() - 0.5) * wind.width,
            y: H() * (0.5 + Math.random() * 0.4),
            vx: wind.dir * (wind.speed * 0.95 + Math.random() * 1.6),
            vy: -0.15 + Math.random() * 0.3,
            r: 0.7 + Math.random() * 1.6,
            a: 0.16 + Math.random() * 0.22,
            life: 110,
            tone: Math.random() < 0.7 ? 'toxic' : 'gray',
          });
        }
        // curling vapor wisps
        if (Math.random() < 0.5) {
          wisps.push({
            x: wind.x + (Math.random() - 0.5) * wind.width * 0.7,
            y: H() * (0.7 + Math.random() * 0.22),
            vx: wind.dir * wind.speed * 0.7,
            vy: -0.15 - Math.random() * 0.15,
            r: 14 + Math.random() * 18,
            a: 0.16 + Math.random() * 0.12,
            life: 240,
            phase: Math.random() * Math.PI * 2,
          });
        }
        // tilt + gray flowers within the wind band
        for (const f of flowers) {
          const d = Math.abs(f.x - wind.x);
          if (d < wind.width) {
            const intensity = (1 - d / wind.width);
            f.tiltTarget = wind.dir * intensity * 0.6;
            // permanent graying
            f.gray = Math.min(1, f.gray + intensity * 0.012);
          } else {
            f.tiltTarget *= 0.92;
          }
        }
        // wind exits the screen
        if ((wind.dir > 0 && wind.x > W() + wind.width) ||
            (wind.dir < 0 && wind.x < -wind.width)) {
          wind.active = false;
          if (flowers.every(f => f.gray >= 0.95)) {
            // long pause, then regrow
            windTimer = 700 + Math.random() * 500;
            setTimeout(() => plantFlowers(true), 4500);
          } else {
            windTimer = 280 + Math.random() * 220;
          }
        }
      }

      // draw curling vapor wisps (behind flowers)
      for (let i = wisps.length - 1; i >= 0; i--) {
        const w = wisps[i];
        w.x += w.vx;
        w.y += w.vy + Math.sin(w.phase + w.life * 0.05) * 0.08;
        w.r += 0.22;
        w.a *= 0.992;
        w.life--;
        if (w.life <= 0 || w.a < 0.01) { wisps.splice(i, 1); continue; }
        const grad = ctx.createRadialGradient(w.x, w.y, 0, w.x, w.y, w.r);
        grad.addColorStop(0,   'rgba(190, 205, 90, ' + (w.a * 0.55) + ')');
        grad.addColorStop(0.6, 'rgba(150, 170, 70, ' + (w.a * 0.30) + ')');
        grad.addColorStop(1,   'rgba(120, 140, 60, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // draw dust streaks
      for (let i = dust.length - 1; i >= 0; i--) {
        const d = dust[i];
        d.x += d.vx;
        d.y += d.vy;
        d.life--;
        if (d.life <= 0) { dust.splice(i, 1); continue; }
        ctx.fillStyle = d.tone === 'toxic'
          ? 'rgba(190, 205, 80, ' + d.a + ')'
          : 'rgba(160, 158, 150, ' + d.a + ')';
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ground
      ctx.fillStyle = 'rgba(80, 80, 80, 0.10)';
      ctx.fillRect(0, H() * 0.94, W(), 2);

      // flowers
      for (const f of flowers) drawDaffodil(f);

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const EFFECTS = {
    embers, ash, flagStripes, alphabet, candles, sunRiseSet, flagRaise, snowFlowers, parchment,
    anfalCandles, halabjaGray,
    // Aliases kept so old data-effect attributes still resolve.
    anfalBoots: anfalCandles, halabjaChemical: halabjaGray,
  };
  if (EFFECTS[effect]) EFFECTS[effect]();
})();
