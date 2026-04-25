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
        ctx.moveTo(0, -sunR * 0.55);
        ctx.lineTo(-sunR * 0.07, -sunR * 1.45);
        ctx.lineTo(sunR * 0.07, -sunR * 1.45);
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

  const EFFECTS = {
    embers, ash, flagStripes, alphabet, candles, sunRiseSet, flagRaise, snowFlowers,
  };
  if (EFFECTS[effect]) EFFECTS[effect]();
})();
