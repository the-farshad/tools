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
  // Anfal Memorial: a quiet row of candles in the dark; periodic high winds
  // blow them out one by one, leaving smoke trails. Daffodils (the Kurdish
  // narcissus) stand alongside, witnessing the loss.
  function anfalCandles() {
    document.body.style.transition = 'filter 8s ease-in';
    requestAnimationFrame(() => {
      document.body.style.filter = 'grayscale(0.55) brightness(0.92)';
    });

    // Candles laid out in a single row near the bottom-third of the page.
    const candles = [];
    function plantCandles() {
      candles.length = 0;
      const N = Math.max(7, Math.min(12, Math.floor(W() / 110)));
      for (let i = 0; i < N; i++) {
        candles.push({
          x: (W() / (N + 1)) * (i + 1),
          y: H() * 0.78,
          height: 38 + Math.random() * 14,
          flame: 1,        // 1 = burning, 0 = out
          flicker: Math.random() * Math.PI * 2,
          extinguishedAt: 0,
          smoke: [],
        });
      }
    }
    plantCandles();
    window.addEventListener('resize', plantCandles);

    // Daffodils between/around the candles
    const flowers = [];
    function plantFlowers() {
      flowers.length = 0;
      const N = 16;
      for (let i = 0; i < N; i++) {
        flowers.push({
          x: 24 + (i / N) * (W() - 48) + (Math.random() - 0.5) * 20,
          y: H() * 0.88 + Math.random() * H() * 0.06,
          bloom: 6 + Math.random() * 3,
          stemH: 24 + Math.random() * 14,
          tilt: 0,
          tiltTarget: 0,
        });
      }
    }
    plantFlowers();
    window.addEventListener('resize', plantFlowers);

    // Wind gusts — strong horizontal pulses that traverse the screen
    const gusts = [];
    let gustTimer = 90;
    function spawnGust() {
      const dir = Math.random() < 0.5 ? 1 : -1;
      gusts.push({
        dir: dir,
        x: dir > 0 ? -120 : W() + 120,
        speed: 7 + Math.random() * 4,
        strength: 0.85 + Math.random() * 0.4,
        width: 220 + Math.random() * 120,
      });
    }

    // Floating dust streaks that ride the wind
    const streaks = [];

    function drawCandle(c, t) {
      ctx.save();
      ctx.translate(c.x, c.y);
      // base shadow
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.beginPath();
      ctx.ellipse(0, 4, 10, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // body
      const grad = ctx.createLinearGradient(-6, 0, 6, 0);
      grad.addColorStop(0, '#d8c89e');
      grad.addColorStop(0.5, '#f3e6bd');
      grad.addColorStop(1, '#b89c64');
      ctx.fillStyle = grad;
      ctx.fillRect(-6, -c.height, 12, c.height);
      // top dripping wax line
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      ctx.fillRect(-6, -c.height, 12, 2);
      // wick
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(-0.7, -c.height - 6, 1.4, 6);
      // flame (only if burning)
      if (c.flame > 0.05) {
        c.flicker += 0.18 + Math.random() * 0.05;
        const sway = Math.sin(c.flicker) * 1.2;
        const tall = 13 * c.flame + Math.sin(c.flicker * 2) * 1.5;
        // outer halo
        const halo = ctx.createRadialGradient(0, -c.height - 8, 0, 0, -c.height - 8, 18 * c.flame);
        halo.addColorStop(0, 'rgba(255,210,120,' + (0.45 * c.flame) + ')');
        halo.addColorStop(1, 'rgba(255,210,120,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(0, -c.height - 8, 18 * c.flame, 0, Math.PI * 2);
        ctx.fill();
        // flame body
        ctx.fillStyle = '#ff9b3a';
        ctx.beginPath();
        ctx.moveTo(-3 + sway * 0.4, -c.height - 2);
        ctx.quadraticCurveTo(-2 + sway, -c.height - tall * 0.6, sway, -c.height - tall);
        ctx.quadraticCurveTo(2 + sway, -c.height - tall * 0.6, 3 + sway * 0.4, -c.height - 2);
        ctx.closePath();
        ctx.fill();
        // inner blue core
        ctx.fillStyle = 'rgba(120, 180, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(sway * 0.3, -c.height - 4, 1.3, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Smoke wisps for recently extinguished candles
      for (let i = c.smoke.length - 1; i >= 0; i--) {
        const s = c.smoke[i];
        s.y -= s.vy;
        s.x += s.vx;
        s.r += 0.18;
        s.a -= 0.005;
        if (s.a <= 0) { c.smoke.splice(i, 1); continue; }
        ctx.fillStyle = 'rgba(60,60,60,' + s.a + ')';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawDaffodil(f) {
      ctx.save();
      ctx.translate(f.x, f.y);
      // smooth tilt with current wind
      f.tilt += (f.tiltTarget - f.tilt) * 0.08;
      ctx.rotate(f.tilt);
      const stemH = f.stemH;
      // stem
      ctx.strokeStyle = 'rgba(75, 95, 55, 0.78)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(2, -stemH * 0.5, 0, -stemH);
      ctx.stroke();
      // leaf
      ctx.beginPath();
      ctx.moveTo(0, -stemH * 0.55);
      ctx.quadraticCurveTo(9, -stemH * 0.7, 4, -stemH * 0.95);
      ctx.stroke();
      // petals (6 cream-white)
      const r = f.bloom;
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = '#f5efd9';
      for (let p = 0; p < 6; p++) {
        const ang = (p / 6) * Math.PI * 2;
        const px = Math.cos(ang) * r * 0.7;
        const py = -stemH + Math.sin(ang) * r * 0.7;
        ctx.beginPath();
        ctx.ellipse(px, py, r * 0.6, r * 0.42, ang, 0, Math.PI * 2);
        ctx.fill();
      }
      // trumpet — daffodil's signature golden cup
      ctx.fillStyle = '#e7a128';
      ctx.beginPath();
      ctx.ellipse(0, -stemH, r * 0.42, r * 0.36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(180, 110, 30, 0.7)';
      ctx.beginPath();
      ctx.ellipse(0, -stemH + 1, r * 0.32, r * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    function tick() {
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      // Sky / atmosphere — soft dusk gradient
      const sky = ctx.createLinearGradient(0, 0, 0, H());
      sky.addColorStop(0, 'rgba(40, 35, 32, 0.18)');
      sky.addColorStop(0.6, 'rgba(60, 50, 42, 0.12)');
      sky.addColorStop(1, 'rgba(20, 15, 12, 0.10)');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W(), H());

      // ground line
      ctx.fillStyle = 'rgba(20, 15, 10, 0.22)';
      ctx.fillRect(0, H() * 0.94, W(), 2);

      // Wind gust scheduling
      gustTimer--;
      if (gustTimer <= 0) {
        spawnGust();
        gustTimer = 220 + Math.random() * 220;
      }

      // Update gusts and streaks
      for (let i = gusts.length - 1; i >= 0; i--) {
        const g = gusts[i];
        g.x += g.dir * g.speed;
        // streaks ride the gust
        if (Math.random() < 0.4) {
          streaks.push({
            x: g.x + (Math.random() - 0.5) * g.width,
            y: H() * (0.55 + Math.random() * 0.35),
            vx: g.dir * (g.speed * 0.85 + Math.random() * 1.5),
            len: 30 + Math.random() * 50,
            opacity: 0.16 + Math.random() * 0.18,
            life: 60,
          });
        }
        if ((g.dir > 0 && g.x > W() + 200) || (g.dir < 0 && g.x < -200)) {
          gusts.splice(i, 1);
        }
      }

      // Apply wind to flowers and candle flames
      for (const f of flowers) {
        let near = 0;
        for (const g of gusts) {
          const d = Math.abs(f.x - g.x);
          if (d < g.width) near = Math.max(near, (1 - d / g.width) * g.strength);
        }
        f.tiltTarget = near * 0.85 * (gusts.length && gusts[0].dir < 0 ? -1 : 1);
      }
      for (const c of candles) {
        if (c.flame <= 0.05) continue;
        let near = 0, dir = 0;
        for (const g of gusts) {
          const d = Math.abs(c.x - g.x);
          if (d < g.width) {
            const f = (1 - d / g.width) * g.strength;
            if (f > near) { near = f; dir = g.dir; }
          }
        }
        if (near > 0) {
          // flicker wildly, then extinguish if exposed long enough
          c.flame -= near * 0.018;
          if (c.flame <= 0.06) {
            c.flame = 0;
            // produce a smoke puff
            for (let k = 0; k < 8; k++) {
              c.smoke.push({
                x: c.x + (Math.random() - 0.5) * 4,
                y: c.y - c.height - 8,
                vx: dir * 0.4 + (Math.random() - 0.5) * 0.3,
                vy: 0.4 + Math.random() * 0.4,
                r: 2 + Math.random() * 2,
                a: 0.55,
              });
            }
          }
        }
      }

      // draw streaks (wind visualization)
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i];
        s.x += s.vx;
        s.life--;
        if (s.life <= 0) { streaks.splice(i, 1); continue; }
        ctx.strokeStyle = 'rgba(170, 160, 140, ' + s.opacity + ')';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - Math.sign(s.vx) * s.len, s.y);
        ctx.stroke();
      }

      // draw flowers behind candles
      for (const f of flowers) drawDaffodil(f);
      // draw candles
      for (const c of candles) drawCandle(c, performance.now());

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------- effect: halabjaGray --------------------------------------
  // Halabja Memorial: a field of bright daffodils. A gray wind sweeps
  // across; as it passes, every flower it touches loses its colour and
  // turns gray. After all are gray, fresh ones slowly grow and the cycle
  // repeats.
  function halabjaGray() {
    document.body.style.transition = 'filter 8s ease-in';
    requestAnimationFrame(() => {
      document.body.style.filter = 'brightness(0.95)';
    });

    const flowers = [];
    function plantFlowers(reset) {
      if (reset) flowers.length = 0;
      const N = 26;
      for (let i = 0; i < N; i++) {
        flowers.push({
          x: 18 + (i / N) * (W() - 36) + (Math.random() - 0.5) * 18,
          y: H() * 0.82 + Math.random() * H() * 0.10,
          bloom: 0,
          targetBloom: 6 + Math.random() * 3,
          stemH: 22 + Math.random() * 14,
          gray: 0,
          tilt: 0,
          tiltTarget: 0,
        });
      }
    }
    plantFlowers(true);
    window.addEventListener('resize', () => plantFlowers(true));

    // Gray wind: a single travelling band moves across the screen,
    // desaturating any flowers it passes over.
    const wind = { active: false, dir: 1, x: -200, speed: 1.7, width: 180 };
    let windTimer = 80;

    // Gray dust particles ride the wind
    const dust = [];

    function drawDaffodil(f) {
      ctx.save();
      ctx.translate(f.x, f.y);
      f.tilt += (f.tiltTarget - f.tilt) * 0.08;
      ctx.rotate(f.tilt);
      const stemH = f.stemH;
      const g = f.gray;
      // stem — green when alive, gray when wind-touched
      const stemColor = g >= 1
        ? 'rgba(110, 110, 110, 0.7)'
        : 'rgba(' + Math.round(75 + g * 35) + ',' + Math.round(95 + g * 15) + ',' + Math.round(55 + g * 55) + ', 0.78)';
      ctx.strokeStyle = stemColor;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(2, -stemH * 0.5, 0, -stemH);
      ctx.stroke();
      // leaf
      ctx.beginPath();
      ctx.moveTo(0, -stemH * 0.55);
      ctx.quadraticCurveTo(9, -stemH * 0.7, 4, -stemH * 0.95);
      ctx.stroke();
      // petals — daffodil cream-white in life, dull gray in death
      const r = f.bloom;
      const petalAlive = '#f5efd9';
      const petalDead = '#9c9c9c';
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = lerpColor(petalAlive, petalDead, g);
      for (let p = 0; p < 6; p++) {
        const ang = (p / 6) * Math.PI * 2;
        const px = Math.cos(ang) * r * 0.7;
        const py = -stemH + Math.sin(ang) * r * 0.7;
        ctx.beginPath();
        ctx.ellipse(px, py, r * 0.6, r * 0.42, ang, 0, Math.PI * 2);
        ctx.fill();
      }
      // trumpet — golden in life, dark gray when dead
      const trumpetAlive = '#e7a128';
      const trumpetDead = '#6c6c6c';
      ctx.fillStyle = lerpColor(trumpetAlive, trumpetDead, g);
      ctx.beginPath();
      ctx.ellipse(0, -stemH, r * 0.42, r * 0.36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    function lerpColor(a, b, t) {
      const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
      const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
      const r = Math.round(ar + (br - ar) * t), g = Math.round(ag + (bg - ag) * t), bl = Math.round(ab + (bb - ab) * t);
      return 'rgb(' + r + ',' + g + ',' + bl + ')';
    }

    function tick() {
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      // soft sky
      const sky = ctx.createLinearGradient(0, 0, 0, H());
      sky.addColorStop(0, 'rgba(150, 150, 150, 0.06)');
      sky.addColorStop(1, 'rgba(140, 140, 140, 0.10)');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W(), H());

      // grow flowers gradually
      for (const f of flowers) {
        if (f.bloom < f.targetBloom) f.bloom += 0.08;
      }

      // schedule wind
      if (!wind.active) {
        windTimer--;
        if (windTimer <= 0) {
          wind.active = true;
          wind.dir = Math.random() < 0.5 ? 1 : -1;
          wind.x = wind.dir > 0 ? -wind.width : W() + wind.width;
          wind.speed = 1.5 + Math.random() * 0.8;
        }
      } else {
        wind.x += wind.dir * wind.speed;
        // spawn dust particles within the wind band
        for (let k = 0; k < 4; k++) {
          dust.push({
            x: wind.x + (Math.random() - 0.5) * wind.width,
            y: H() * (0.55 + Math.random() * 0.4),
            vx: wind.dir * (wind.speed * 0.9 + Math.random() * 1.5),
            vy: -0.2 + Math.random() * 0.3,
            r: 0.7 + Math.random() * 1.3,
            a: 0.16 + Math.random() * 0.18,
            life: 100,
          });
        }
        // tilt + gray flowers within the wind
        for (const f of flowers) {
          const d = Math.abs(f.x - wind.x);
          if (d < wind.width) {
            const intensity = (1 - d / wind.width);
            f.tiltTarget = wind.dir * intensity * 0.55;
            // permanent graying
            f.gray = Math.min(1, f.gray + intensity * 0.012);
          } else {
            f.tiltTarget *= 0.9;
          }
        }
        // wind exits the screen
        if ((wind.dir > 0 && wind.x > W() + wind.width) ||
            (wind.dir < 0 && wind.x < -wind.width)) {
          wind.active = false;
          // if all gray, schedule a regrow + reset
          if (flowers.every(f => f.gray >= 0.95)) {
            windTimer = 600 + Math.random() * 400; // long pause
            // gradually replant
            setTimeout(() => plantFlowers(true), 4000);
          } else {
            windTimer = 280 + Math.random() * 220;
          }
        }
      }

      // draw dust streaks
      for (let i = dust.length - 1; i >= 0; i--) {
        const d = dust[i];
        d.x += d.vx;
        d.y += d.vy;
        d.life--;
        if (d.life <= 0) { dust.splice(i, 1); continue; }
        ctx.fillStyle = 'rgba(160, 158, 155, ' + d.a + ')';
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
