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

  // ---------- effect: sunRiseSet (sun arcing across with warm sky) ----------
  function sunRiseSet() {
    let t = 0;
    function tick() {
      ctx.clearRect(0, 0, overlay.width, overlay.height);
      // 0..1..0 cycle: sunrise → noon → sunset
      const cycle = (Math.sin(t * 0.004) + 1) / 2;
      const arcT = (Math.cos(t * 0.004 - Math.PI) + 1) / 2; // 0 at edges, 1 at top
      const sunX = W() * 0.15 + cycle * W() * 0.7;
      const sunY = H() * 0.78 - arcT * H() * 0.55;
      // sky band
      const grad = ctx.createLinearGradient(0, 0, 0, H());
      grad.addColorStop(0, 'rgba(' + (240 - 80 * arcT) + ',' + (140 + 60 * arcT) + ',' + (90 + 100 * arcT) + ',0.10)');
      grad.addColorStop(1, 'rgba(255,140,60,0.18)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W(), H());
      // glow
      const glow = ctx.createRadialGradient(sunX, sunY, 30, sunX, sunY, 220);
      glow.addColorStop(0, 'rgba(255, 200, 100, 0.45)');
      glow.addColorStop(1, 'rgba(255, 200, 100, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 220, 0, Math.PI * 2);
      ctx.fill();
      // sun core
      ctx.fillStyle = 'rgba(255, ' + (200 - 60 * (1 - arcT)) + ', ' + (90 - 60 * (1 - arcT)) + ', 0.85)';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 42, 0, Math.PI * 2);
      ctx.fill();
      // horizon line
      ctx.fillStyle = 'rgba(60, 30, 20, 0.18)';
      ctx.fillRect(0, H() * 0.78, W(), 2);
      t++;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const EFFECTS = {
    embers, ash, flagStripes, alphabet, candles, sunRiseSet,
  };
  if (EFFECTS[effect]) EFFECTS[effect]();
})();
