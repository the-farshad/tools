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

  // ---------- effect: anfalBoots (gray sandstorm, marching column, crushed narcissus, smoke columns) ----------
  function anfalBoots() {
    document.body.style.transition = 'filter 8s ease-in';
    requestAnimationFrame(() => {
      document.body.style.filter = 'grayscale(0.62) brightness(0.92) contrast(1.05)';
    });

    // ---- distant smoke columns from burning villages on the horizon ----
    const smokes = [];
    function initSmokes() {
      smokes.length = 0;
      const n = 4 + ((Math.random() * 2) | 0);
      for (let i = 0; i < n; i++) {
        smokes.push({
          x: W() * (0.08 + i * 0.21 + Math.random() * 0.06),
          baseY: H() * 0.62,
          width: 24 + Math.random() * 22,
          height: 90 + Math.random() * 60,
          drift: (Math.random() - 0.5) * 0.4,
          seed: Math.random() * 100,
        });
      }
    }
    initSmokes();
    window.addEventListener('resize', initSmokes);

    function drawSmoke(s, t) {
      const px = s.x + s.drift * (t * 0.05);
      ctx.save();
      ctx.translate(px, s.baseY);
      const layers = 9;
      for (let i = layers - 1; i >= 0; i--) {
        const ratio = i / layers;
        const y = -s.height * ratio - 4;
        const w = s.width * (1 + ratio * 1.1) + Math.sin(t * 0.018 + s.seed + ratio * 3) * 5;
        const op = (1 - ratio) * 0.14;
        ctx.fillStyle = 'rgba(35, 30, 25, ' + op + ')';
        ctx.beginPath();
        ctx.ellipse(Math.sin(t * 0.012 + s.seed + ratio) * 6, y, w / 2, s.height / layers + 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // base ember glow
      const g = ctx.createRadialGradient(0, 4, 0, 0, 4, s.width * 0.6);
      g.addColorStop(0, 'rgba(170, 70, 30, 0.18)');
      g.addColorStop(1, 'rgba(170, 70, 30, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 4, s.width * 0.6, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ---- layered sandstorm dust ----
    const dust = [];
    const DUST_PALETTE = ['#5a5040', '#7a7064', '#9b8e74'];
    const DUST_SPEEDS = [0.5, 1.6, 3.6];
    const DUST_SIZES  = [0.5, 1.2, 1.9];
    const DUST_OP     = [0.10, 0.18, 0.24];
    function makeDust(initial) {
      const layer = (Math.random() * 3) | 0;
      return {
        x: initial ? Math.random() * W() : -10,
        y: Math.random() * H(),
        vx: DUST_SPEEDS[layer] * (0.7 + Math.random() * 0.7),
        vy: -0.25 + Math.random() * 0.5,
        size: DUST_SIZES[layer] * (0.7 + Math.random() * 0.7),
        opacity: DUST_OP[layer] * (0.6 + Math.random() * 0.5),
        layer: layer,
        life: -1,
      };
    }
    for (let i = 0; i < 220; i++) dust.push(makeDust(true));

    // ---- field of narcissus ----
    const flowers = [];
    function spawnFlower(grown, x, y) {
      const f = {
        x: x != null ? x : Math.random() * (W() - 40) + 20,
        y: y != null ? y : H() * 0.84 + Math.random() * H() * 0.12,
        bloom: 0,
        target: 6.5 + Math.random() * 3,
        stemH: 22 + Math.random() * 18,
        crushed: false,
        crushAmt: 0,
        side: Math.random() < 0.5 ? -1 : 1,
      };
      if (grown) f.bloom = f.target;
      flowers.push(f);
    }
    for (let i = 0; i < 28; i++) spawnFlower(true);

    // Footprints accumulate on the ground (fade slowly).
    const prints = [];

    // ---- marching column of boots ----
    // We simulate a column moving from one side to the other; periodic stomps
    // crush flowers and leave footprints.
    const boots = [];
    let waveTimer = 40;
    let columnDir = Math.random() < 0.5 ? 1 : -1;
    let columnX = columnDir > 0 ? -40 : W() + 40;

    function spawnBoot(targetX, targetY) {
      const b = {
        x: targetX,
        y: -110,
        targetY: targetY,
        vy: 6 + Math.random() * 3,
        stomped: false,
        stompTime: 0,
        fadeOut: 0,
      };
      boots.push(b);
      // Crush nearest still-standing flower
      let nearest = null, ndist = Infinity;
      for (const f of flowers) {
        if (f.crushed) continue;
        const d = Math.abs(f.x - targetX);
        if (d < ndist && d < 38) { ndist = d; nearest = f; }
      }
      if (nearest) nearest.crushed = true;
    }

    function dustBurst(x, y, n, intensity) {
      for (let k = 0; k < n; k++) {
        dust.push({
          x: x + (Math.random() - 0.5) * 36,
          y: y - Math.random() * 6,
          vx: (Math.random() - 0.5) * 5 * intensity,
          vy: -1 - Math.random() * 2.5 * intensity,
          size: 1.0 + Math.random() * 1.6,
          opacity: 0.32 + Math.random() * 0.22,
          layer: 2,
          life: 80,
        });
      }
    }

    function drawNarcissus(f) {
      ctx.save();
      ctx.translate(f.x, f.y);
      if (f.crushed) ctx.rotate(f.side * Math.min(1.55, f.crushAmt * 1.85));
      const stemH = f.stemH * (f.crushed ? Math.max(0.22, 1 - f.crushAmt * 0.55) : 1);
      ctx.strokeStyle = 'rgba(70, 90, 50, ' + (f.crushed ? Math.max(0.15, 0.7 - f.crushAmt * 0.55) : 0.7) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -stemH);
      ctx.stroke();
      // leaf
      ctx.beginPath();
      ctx.moveTo(0, -stemH * 0.55);
      ctx.quadraticCurveTo(8, -stemH * 0.7, 4, -stemH * 0.95);
      ctx.stroke();
      const r = f.bloom * (f.crushed ? Math.max(0.4, 1 - f.crushAmt * 0.4) : 1);
      const a = f.crushed ? Math.max(0.1, 1 - f.crushAmt) : 0.88;
      ctx.globalAlpha = a;
      ctx.fillStyle = '#f0ebd8';
      for (let p = 0; p < 6; p++) {
        const ang = (p / 6) * Math.PI * 2;
        const px = Math.cos(ang) * r * 0.7;
        const py = -stemH + Math.sin(ang) * r * 0.7;
        ctx.beginPath();
        ctx.ellipse(px, py, r * 0.55, r * 0.4, ang, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = f.crushed ? 'rgba(140, 120, 50, 0.5)' : '#d99935';
      ctx.beginPath();
      ctx.arc(0, -stemH, r * 0.36, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    function drawBoot(b) {
      ctx.save();
      let dy = 0;
      if (b.stomped) {
        // recoil bounce just after impact
        const pulse = Math.max(0, 1 - b.stompTime / 10);
        dy = -pulse * 5;
      }
      ctx.translate(b.x, b.y + dy);
      ctx.globalAlpha = (1 - b.fadeOut) * 0.95;
      // ground shadow under boot
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(2, 2, 32, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // sole
      ctx.fillStyle = '#0c0c0c';
      ctx.beginPath();
      ctx.moveTo(-28, 0);
      ctx.lineTo(32, 0);
      ctx.lineTo(32, -8);
      ctx.lineTo(-25, -8);
      ctx.closePath();
      ctx.fill();
      // upper boot — military style
      ctx.fillStyle = '#1c1a17';
      ctx.beginPath();
      ctx.moveTo(-25, -8);
      ctx.lineTo(24, -8);
      ctx.lineTo(22, -42);
      ctx.lineTo(8, -50);
      ctx.lineTo(-12, -42);
      ctx.lineTo(-25, -30);
      ctx.closePath();
      ctx.fill();
      // tread cleats
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.lineWidth = 1.2;
      for (let i = -22; i < 30; i += 4) {
        ctx.beginPath();
        ctx.moveTo(i, -1);
        ctx.lineTo(i, -7);
        ctx.stroke();
      }
      // laces
      ctx.strokeStyle = 'rgba(180,170,150,0.32)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const ly = -14 - i * 6;
        ctx.beginPath();
        ctx.moveTo(-9, ly);
        ctx.lineTo(11, ly - 1);
        ctx.stroke();
      }
      // highlight on toe cap
      ctx.fillStyle = 'rgba(60,55,48,0.35)';
      ctx.beginPath();
      ctx.ellipse(18, -12, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    function drawPrint(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = '#1a1610';
      // heel oval
      ctx.beginPath();
      ctx.ellipse(-7, 0, 7, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // sole
      ctx.beginPath();
      ctx.ellipse(6, -1, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // tread marks
      ctx.fillStyle = 'rgba(40,40,40,' + (p.opacity * 0.8) + ')';
      for (let i = -6; i < 16; i += 4) {
        ctx.fillRect(i, -3, 1.5, 3);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    let frame = 0;
    function tick() {
      frame++;
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      // Sky gradient — dusty haze
      const sky = ctx.createLinearGradient(0, 0, 0, H() * 0.7);
      sky.addColorStop(0, 'rgba(110, 105, 92, 0.10)');
      sky.addColorStop(1, 'rgba(160, 140, 105, 0.22)');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W(), H() * 0.7);

      // Distant horizon line
      ctx.fillStyle = 'rgba(60, 50, 40, 0.18)';
      ctx.fillRect(0, H() * 0.62, W(), 1);

      // Smoke columns (behind dust)
      for (const s of smokes) drawSmoke(s, frame);

      // Dust — back to front
      for (let layer = 0; layer < 3; layer++) {
        ctx.fillStyle = DUST_PALETTE[layer];
        for (let i = dust.length - 1; i >= 0; i--) {
          const d = dust[i];
          if (d.layer !== layer) continue;
          d.x += d.vx;
          d.y += d.vy;
          if (d.life > 0) { d.life--; if (d.life === 0) { dust.splice(i, 1); continue; } }
          if (d.x > W() + 20) {
            if (d.life >= 0) { dust.splice(i, 1); continue; }
            dust[i] = makeDust(false); continue;
          }
          ctx.globalAlpha = d.opacity;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Ground shadow (subtle dark band)
      ctx.fillStyle = 'rgba(20, 15, 10, 0.10)';
      ctx.fillRect(0, H() * 0.94, W(), H() * 0.06);

      // Footprints
      for (let i = prints.length - 1; i >= 0; i--) {
        const p = prints[i];
        p.opacity -= 0.0006;
        if (p.opacity <= 0) { prints.splice(i, 1); continue; }
        drawPrint(p);
      }

      // Flowers
      for (const f of flowers) {
        if (f.bloom < f.target) f.bloom += 0.1;
        if (f.crushed && f.crushAmt < 1.5) f.crushAmt += 0.022;
        drawNarcissus(f);
      }

      // March: advance the column position; periodically stomp
      columnX += columnDir * 0.6;
      // Wrap when column has crossed off-screen — flip direction and replant some flowers.
      if (columnX < -60 || columnX > W() + 60) {
        columnDir *= -1;
        columnX = columnDir > 0 ? -40 : W() + 40;
        // some flowers regrow over time
        for (let i = 0; i < 4; i++) {
          if (flowers.filter(f => f.crushed).length > 6) {
            // find a crushed one and regrow it as a new flower
            const idx = flowers.findIndex(f => f.crushed);
            if (idx >= 0) flowers.splice(idx, 1);
          }
          spawnFlower(false);
        }
      }

      // Stomp cadence: a boot lands roughly every 0.7s, near the column position
      waveTimer--;
      if (waveTimer <= 0) {
        const jitter = (Math.random() - 0.5) * 70;
        const tx = columnX + jitter;
        if (tx > -10 && tx < W() + 10) {
          spawnBoot(tx, H() * 0.92 + (Math.random() - 0.5) * 8);
        }
        waveTimer = 35 + Math.random() * 20;
      }

      // Boots
      for (let i = boots.length - 1; i >= 0; i--) {
        const b = boots[i];
        if (!b.stomped) {
          b.y += b.vy;
          b.vy += 0.45;
          if (b.y >= b.targetY) {
            b.y = b.targetY;
            b.stomped = true;
            prints.push({ x: b.x, y: b.targetY + 5, opacity: 0.55 });
            dustBurst(b.x, b.targetY, 26, 1);
          }
        } else {
          b.stompTime++;
          b.fadeOut += 0.014;
          if (b.fadeOut >= 1) { boots.splice(i, 1); continue; }
        }
        drawBoot(b);
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------- effect: halabjaChemical (bombers, carpet bombs, drifting chemical fog, dying flowers, falling birds) ----------
  function halabjaChemical() {
    document.body.style.transition = 'filter 6s ease-in';
    requestAnimationFrame(() => {
      document.body.style.filter = 'sepia(0.22) hue-rotate(-22deg) brightness(0.93) contrast(1.05)';
    });

    // ---- planes (silhouette) ----
    const planes = [];
    let planeTimer = 120;
    function spawnPlane() {
      const dir = Math.random() < 0.5 ? 1 : -1;
      planes.push({
        x: dir > 0 ? -100 : W() + 100,
        y: H() * 0.10 + Math.random() * H() * 0.14,
        vx: dir * (1.4 + Math.random() * 0.9),
        dropped: false,
      });
    }
    spawnPlane();

    function drawPlane(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.vx < 0) ctx.scale(-1, 1);
      ctx.fillStyle = 'rgba(20, 18, 22, 0.82)';
      // fuselage
      ctx.beginPath();
      ctx.ellipse(0, 0, 30, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // top wings (delta swept)
      ctx.beginPath();
      ctx.moveTo(-2, -2);
      ctx.lineTo(8, -2);
      ctx.lineTo(14, -16);
      ctx.lineTo(-6, -16);
      ctx.closePath();
      ctx.fill();
      // bottom wings
      ctx.beginPath();
      ctx.moveTo(-2, 2);
      ctx.lineTo(8, 2);
      ctx.lineTo(14, 16);
      ctx.lineTo(-6, 16);
      ctx.closePath();
      ctx.fill();
      // tail fin
      ctx.beginPath();
      ctx.moveTo(-26, -1);
      ctx.lineTo(-21, -1);
      ctx.lineTo(-19, -10);
      ctx.lineTo(-26, -10);
      ctx.closePath();
      ctx.fill();
      // engine glow trail
      ctx.fillStyle = 'rgba(255, 200, 80, 0.18)';
      ctx.beginPath();
      ctx.ellipse(-30, 0, 20, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ---- bombs ----
    const bombs = [];
    function dropCarpet(p) {
      const count = 5 + ((Math.random() * 3) | 0);
      const spacing = 32 + Math.random() * 8;
      const sgn = Math.sign(p.vx);
      for (let i = 0; i < count; i++) {
        bombs.push({
          x: p.x - sgn * (i * spacing + 10),
          y: p.y + 12 + (Math.random() - 0.5) * 4,
          vy: 1.5 + Math.random() * 1.4,
          rot: (Math.random() - 0.5) * 0.45,
          exploded: false,
          explodeAt: H() * 0.58 + Math.random() * H() * 0.22,
          smokeT: 0,
          delay: i * 4,
        });
      }
    }

    function drawBomb(b) {
      if (b.delay > 0) { b.delay--; return; }
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      // smoke trail (drawn before bomb so trail is behind nose direction)
      ctx.fillStyle = 'rgba(190, 200, 70, 0.22)';
      ctx.beginPath();
      ctx.ellipse(0, -20, 2.4, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(150, 165, 50, 0.13)';
      ctx.beginPath();
      ctx.ellipse(0, -38, 3.2, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      // body
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 4, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      // nose
      ctx.fillStyle = '#0c0c0c';
      ctx.beginPath();
      ctx.ellipse(0, -10, 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // tail fins
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.moveTo(-4, 8);
      ctx.lineTo(-7, 14);
      ctx.lineTo(-2, 12);
      ctx.closePath();
      ctx.moveTo(4, 8);
      ctx.lineTo(7, 14);
      ctx.lineTo(2, 12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // ---- chemical clouds ----
    const clouds = [];
    function drawCloud(c) {
      const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
      grad.addColorStop(0, 'rgba(210, 225, 65, ' + c.a * 0.55 + ')');
      grad.addColorStop(0.4, 'rgba(180, 200, 60, ' + c.a * 0.45 + ')');
      grad.addColorStop(0.75, 'rgba(140, 160, 50, ' + c.a * 0.25 + ')');
      grad.addColorStop(1, 'rgba(120, 140, 40, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      // wispy edge particles
      for (let i = 0; i < 3; i++) {
        const a = c.seed + c.age * 0.04 + i * 2.1;
        const wx = c.x + Math.cos(a) * c.r * 0.85;
        const wy = c.y + Math.sin(a) * c.r * 0.6;
        ctx.fillStyle = 'rgba(190, 210, 70, ' + (c.a * 0.18) + ')';
        ctx.beginPath();
        ctx.arc(wx, wy, c.r * 0.18, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ---- birds ----
    const birds = [];

    function drawBird(b) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rotation);
      ctx.globalAlpha = (1 - b.fadeOut) * 0.78;
      ctx.fillStyle = '#141414';
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // wings — limp / drooping
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(-13, b.onGround ? 1 : 4);
      ctx.lineTo(-6, 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.lineTo(13, b.onGround ? -1 : -4);
      ctx.lineTo(6, -1.5);
      ctx.closePath();
      ctx.fill();
      // tail
      ctx.fillRect(-7, -1, -3, 2);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // ---- flowers (denser, two staggered rows) ----
    const flowers = [];
    const FLOWER_COLORS = ['#e63946','#ff8b3d','#ffcc44','#ff80aa','#d62828','#ff5e5e'];
    function plantFlowers() {
      flowers.length = 0;
      for (let row = 0; row < 2; row++) {
        const count = 18;
        for (let i = 0; i < count; i++) {
          flowers.push({
            x: 18 + (i / count) * (W() - 36) + (Math.random() - 0.5) * 18,
            y: H() * (0.84 + row * 0.05) + Math.random() * H() * 0.04,
            bloom: 5 + Math.random() * 3,
            stemH: 22 + Math.random() * 14,
            color: FLOWER_COLORS[(i + row) % FLOWER_COLORS.length],
            wilted: 0,
            side: Math.random() < 0.5 ? -1 : 1,
          });
        }
      }
    }
    plantFlowers();
    window.addEventListener('resize', plantFlowers);

    function drawWiltingFlower(f) {
      ctx.save();
      ctx.translate(f.x, f.y);
      const tilt = f.side * f.wilted * 1.0;
      ctx.rotate(tilt);
      const stemH = f.stemH * (1 - f.wilted * 0.45);
      ctx.strokeStyle = f.wilted > 0.55 ? 'rgba(110, 100, 70, 0.6)' : 'rgba(60, 100, 60, 0.78)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -stemH);
      ctx.stroke();
      const r = f.bloom * (1 - f.wilted * 0.45);
      ctx.globalAlpha = f.wilted > 0.85 ? 0.32 : 0.92;
      ctx.fillStyle = f.wilted > 0.55 ? 'rgba(130, 120, 80, 0.85)' : f.color;
      for (let p = 0; p < 5; p++) {
        const ang = (p / 5) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(ang) * r * 0.7;
        const py = -stemH + Math.sin(ang) * r * 0.7;
        ctx.beginPath();
        ctx.arc(px, py, r * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = f.wilted > 0.55 ? '#5a5235' : '#ffd54a';
      ctx.beginPath();
      ctx.arc(0, -stemH, r * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    let frame = 0;
    let groundFog = 0;

    function tick() {
      frame++;
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      // Sky tint
      const sky = ctx.createLinearGradient(0, 0, 0, H() * 0.45);
      sky.addColorStop(0, 'rgba(180, 180, 100, 0.05)');
      sky.addColorStop(1, 'rgba(195, 205, 80, 0.13)');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W(), H() * 0.45);

      // Ground haze accumulating over time
      groundFog = Math.min(0.32, groundFog + 0.00008);
      const haze = ctx.createLinearGradient(0, H() * 0.45, 0, H());
      haze.addColorStop(0, 'rgba(180, 200, 80, 0)');
      haze.addColorStop(0.5, 'rgba(180, 200, 80, ' + (groundFog * 0.4) + ')');
      haze.addColorStop(1, 'rgba(190, 210, 60, ' + groundFog + ')');
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, W(), H());

      // Planes
      for (let i = planes.length - 1; i >= 0; i--) {
        const p = planes[i];
        p.x += p.vx;
        drawPlane(p);
        if (!p.dropped && Math.abs(p.x - W() / 2) < W() * 0.25) {
          dropCarpet(p);
          p.dropped = true;
        }
        if ((p.vx > 0 && p.x > W() + 120) || (p.vx < 0 && p.x < -120)) {
          planes.splice(i, 1);
        }
      }
      planeTimer--;
      if (planeTimer <= 0 && planes.length === 0) {
        spawnPlane();
        planeTimer = 220 + Math.random() * 220;
      }

      // Bombs
      for (let i = bombs.length - 1; i >= 0; i--) {
        const b = bombs[i];
        if (b.delay > 0) { b.delay--; continue; }
        if (!b.exploded) {
          b.y += b.vy;
          b.vy += 0.06;
          drawBomb(b);
          if (b.y >= b.explodeAt) {
            b.exploded = true;
            // spawn a persistent cloud
            clouds.push({
              x: b.x, y: b.y,
              r: 8, maxR: 70 + Math.random() * 60,
              a: 0.65, age: 0,
              seed: Math.random() * 100,
            });
            // initial flash burst
            for (let k = 0; k < 6; k++) {
              clouds.push({
                x: b.x + (Math.random() - 0.5) * 50,
                y: b.y + (Math.random() - 0.5) * 30,
                r: 4, maxR: 30 + Math.random() * 30,
                a: 0.4, age: 0, seed: Math.random() * 100,
              });
            }
          }
        } else {
          bombs.splice(i, 1);
        }
      }

      // Clouds — grow, drift, and slowly fade
      for (let i = clouds.length - 1; i >= 0; i--) {
        const c = clouds[i];
        c.age++;
        if (c.r < c.maxR) c.r += 0.9;
        c.y += 0.18; // sinks toward ground
        c.x += Math.sin(c.seed + c.age * 0.01) * 0.3; // gentle drift
        if (c.age > 240) c.a -= 0.0014;
        if (c.a <= 0) { clouds.splice(i, 1); continue; }
        drawCloud(c);
        // wilt nearby flowers
        for (const f of flowers) {
          const dx = f.x - c.x;
          const dy = f.y - c.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < c.r + 35 && f.wilted < 1) {
            f.wilted = Math.min(1, f.wilted + 0.0055);
          }
        }
        // chance to drop a bird from inside the cloud
        if (c.age > 25 && c.age < 100 && Math.random() < 0.005 && birds.length < 8) {
          birds.push({
            x: c.x + (Math.random() - 0.5) * 50,
            y: c.y - 20 - Math.random() * 50,
            vx: (Math.random() - 0.5) * 1.6,
            vy: 0.7,
            rotation: 0,
            vrot: (Math.random() - 0.5) * 0.16,
            fadeOut: 0,
            onGround: false,
          });
        }
      }

      // Birds
      for (let i = birds.length - 1; i >= 0; i--) {
        const b = birds[i];
        if (!b.onGround) {
          b.x += b.vx;
          b.y += b.vy;
          b.vy += 0.05;
          b.rotation += b.vrot;
          if (b.y >= H() * 0.92) {
            b.y = H() * 0.92;
            b.onGround = true;
            b.rotation = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
          }
        } else {
          b.fadeOut += 0.0012;
          if (b.fadeOut >= 1) { birds.splice(i, 1); continue; }
        }
        drawBird(b);
      }

      // Flowers
      for (const f of flowers) drawWiltingFlower(f);

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const EFFECTS = {
    embers, ash, flagStripes, alphabet, candles, sunRiseSet, flagRaise, snowFlowers, parchment,
    anfalBoots, halabjaChemical,
  };
  if (EFFECTS[effect]) EFFECTS[effect]();
})();
