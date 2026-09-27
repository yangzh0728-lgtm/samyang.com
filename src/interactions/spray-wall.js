import { icon } from '../icons.mjs';
import '../motion/spray.css';
import { createPaintHistory } from './paint-history.mjs';

// Off Duty spray wall: free spray, stencils, splats, rain, melt, sounds and a lo-fi loop.
// Painting stays available when motion is paused; drips land instantly, the wash is a
// plain wipe, and rain and melt are switched off.
export function createSprayWall({ paused = false } = {}) {
  const section = document.querySelector('.spray-section');
  if (!section) return { setPaused() {} };
  const wall = section.querySelector('.spray-wall');
  const cv = section.querySelector('.spray-paint');
  const pv = section.querySelector('.spray-overlay');
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const pctx = pv.getContext('2d');
  if (!ctx || !pctx) return { setPaused() {} };
  const sq = section.querySelector('.spray-squeegee');
  const toastEl = section.querySelector('.spray-toast');
  const tools = section.querySelector('.spray-tools');
  const nozzle = section.querySelector('.spray-nozzle');
  const action = name => section.querySelector(`[data-action="${name}"]`);
  tools.hidden = false;

  let W = 0, H = 0, dpr = 1;
  let chosen = '#b36bff', hue = 270, stencil = 'none';
  let down = false, pos = null, last = null, stillSince = 0, washing = false, melting = false, raining = false, hover = null;
  let pressure = 1;
  let visible = true;
  const drips = [], drops = [];
  const undoStack = createPaintHistory();
  let washFrame = null;
  const tmp = document.createElement('canvas'), tctx = tmp.getContext('2d');

  /* ---------- sound, all synthesized ---------- */
  let ac = null, soundOn = false, hissGain = null, rainGain = null, master = null, noiseBuf = null;
  function audio() {
    if (ac) return ac;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) { toast('Sound is unavailable in this browser'); return null; }
    try { ac = new Audio(); } catch { toast('Sound is unavailable in this browser'); return null; }
    master = ac.createGain(); master.gain.value = .8; master.connect(ac.destination);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const loopNoise = (type, freq, q) => {
      const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = ac.createGain(); g.gain.value = 0;
      src.connect(f).connect(g).connect(master); src.start();
      return g;
    };
    hissGain = loopNoise('highpass', 3200, .4);
    rainGain = loopNoise('lowpass', 1400, .3);
    return ac;
  }
  function burst(freq, dur, vol, type = 'lowpass', sweepTo) {
    if (!soundOn) return;
    const src = ac.createBufferSource(); src.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq;
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, ac.currentTime + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, ac.currentTime); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + dur);
    src.connect(f).connect(g).connect(master); src.start(); src.stop(ac.currentTime + dur);
  }
  function thunk() {
    if (!soundOn) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.setValueAtTime(140, ac.currentTime); o.frequency.exponentialRampToValueAtTime(50, ac.currentTime + .15);
    g.gain.setValueAtTime(.5, ac.currentTime); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + .2);
    o.connect(g).connect(master); o.start(); o.stop(ac.currentTime + .22);
    burst(2500, .06, .25, 'highpass');
  }
  const splatSound = () => { thunk(); burst(900, .35, .6, 'lowpass', 200); };
  const waterSound = dur => burst(1800, dur, .35, 'lowpass', 300);
  function rattle() {
    if (!soundOn) return;
    for (let i = 0; i < 5; i++) setTimeout(() => burst(4200, .05, .35, 'bandpass'), i * 90);
  }
  const setLevel = (g, v) => g && g.gain.setTargetAtTime(soundOn ? v : 0, ac.currentTime, .04);

  /* ---------- lo-fi loop ---------- */
  let musicOn = false, musicTimer = null, nextBeat = 0, beat = 0, musicGain = null;
  const chords = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]]; // Am7 Fmaj7 Cmaj7 G7
  const hz = m => 440 * 2 ** ((m - 69) / 12);
  function scheduleMusic() {
    const spb = 60 / 76 / 2; // eighth notes at 76 bpm
    while (nextBeat < ac.currentTime + .2) {
      const t = nextBeat, step = beat % 16;
      if (step === 0) {
        chords[Math.floor(beat / 16) % 4].forEach(n => {
          const o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
          o.type = 'triangle'; o.frequency.value = hz(n); o.detune.value = Math.random() * 10 - 5;
          f.type = 'lowpass'; f.frequency.value = 900;
          g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .3); g.gain.linearRampToValueAtTime(0, t + spb * 16);
          o.connect(f).connect(g).connect(musicGain); o.start(t); o.stop(t + spb * 16 + .05);
        });
      }
      if (step === 0 || step === 7 || step === 10) {
        const o = ac.createOscillator(), g = ac.createGain();
        o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(40, t + .12);
        g.gain.setValueAtTime(.35, t); g.gain.exponentialRampToValueAtTime(.001, t + .25);
        o.connect(g).connect(musicGain); o.start(t); o.stop(t + .3);
      }
      if (step === 4 || step === 12 || step % 2 === 1) {
        const snare = step % 2 === 0;
        const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
        s.buffer = noiseBuf; f.type = snare ? 'bandpass' : 'highpass'; f.frequency.value = snare ? 1800 : 7000;
        g.gain.setValueAtTime(snare ? .12 : .04, t); g.gain.exponentialRampToValueAtTime(.001, t + (snare ? .18 : .05));
        s.connect(f).connect(g).connect(musicGain); s.start(t, Math.random()); s.stop(t + .2);
      }
      nextBeat += spb * (step % 2 ? .9 : 1.1); // a little swing
      beat++;
    }
  }
  function toggleMusic() {
    if (!audio()) return false;
    ac.resume().catch(() => {});
    musicOn = !musicOn;
    if (!musicGain) { musicGain = ac.createGain(); musicGain.connect(ac.destination); }
    musicGain.gain.setTargetAtTime(musicOn ? .9 : 0, ac.currentTime, .3);
    clearInterval(musicTimer);
    if (musicOn) { nextBeat = ac.currentTime + .1; beat = 0; musicTimer = setInterval(scheduleMusic, 50); }
    return musicOn;
  }

  /* ---------- canvas basics ---------- */
  function paint() {
    if (chosen !== 'mix') return chosen;
    hue = (hue + .6) % 360;
    return `hsl(${hue} 95% 62%)`;
  }
  function resize() {
    const r = wall.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const density = Math.min(devicePixelRatio || 1, 2, Math.sqrt(2000000 / (r.width * r.height)));
    if (W === r.width && H === r.height && dpr === density) return;
    const had = W > 0;
    drips.length = 0;
    tmp.width = cv.width; tmp.height = cv.height;
    if (had) tctx.drawImage(cv, 0, 0);
    dpr = density;
    W = r.width; H = r.height;
    for (const c of [cv, pv]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (had) ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, 0, 0, W, H);
    undoStack.clear();
  }
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

  function spray(x, y, radius, amount, col) {
    ctx.fillStyle = col || paint();
    for (let i = 0; i < amount; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.abs(gauss()) * radius;
      const s = Math.random() < .9 ? Math.random() * 1.4 + .4 : Math.random() * 2.6 + 1;
      ctx.globalAlpha = d < radius * .45 ? .55 : .3;
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, s, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function addDrip(x, y, radius, col) {
    if (drips.length > 60) return;
    drips.push({ x: x + gauss() * radius * .4, y: y + radius * .2, w: Math.random() * 2.5 + 2,
      left: Math.random() * 90 + 30, v: Math.random() * .8 + .6, c: col || paint() });
  }
  function toast(msg) {
    toastEl.textContent = msg; toastEl.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => { toastEl.hidden = true; }, 1200);
  }

  /* ---------- undo ---------- */
  function snapshot() {
    try {
      undoStack.push(ctx.getImageData(0, 0, cv.width, cv.height));
    } catch { /* A tainted or zero-size canvas simply skips undo. */ }
  }
  function undo() {
    const img = undoStack.pop();
    if (!img) { toast('Nothing to undo'); return; }
    stopWash(); endHold(); setRain(false); down = false; pos = last = null;
    drips.length = 0;
    ctx.putImageData(img, 0, 0);
    toast('Undone');
  }

  /* ---------- stencils ---------- */
  function drawStencil(o, kind, s) {
    o.fillStyle = '#fff'; o.strokeStyle = '#fff'; o.lineCap = 'round'; o.lineJoin = 'round';
    const cut = draw => { o.globalCompositeOperation = 'destination-out'; draw(); o.globalCompositeOperation = 'source-over'; };
    const text = (t, k) => { o.font = `${s * k}px 'Black Ops One', Impact, sans-serif`; o.textAlign = 'center'; o.textBaseline = 'middle'; o.fillText(t, 0, 0); };
    if (kind === 'SY') text('SY', .9);
    else if (kind === 'sun_rain') text('sun_rain', .38);
    else if (kind === 'brick') {
      const w = s * 1.1, h = s * .5;
      o.fillRect(-w / 2, -h / 2 + s * .08, w, h);
      for (let i = 0; i < 4; i++) o.fillRect(-w / 2 + w * (i * .25 + .04), -h / 2 - s * .06, w * .17, s * .16);
      cut(() => o.fillRect(-w / 2 + 6, -h / 2 + s * .08 + h * .45, w - 12, 3));
    } else if (kind === 'ball') {
      o.beginPath(); o.arc(0, 0, s * .45, 0, 7); o.fill();
      cut(() => {
        for (let ring = 0; ring < 2; ring++) {
          const n = ring ? 10 : 4, r = ring ? s * .3 : s * .11;
          for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + ring * .3; o.beginPath(); o.arc(Math.cos(a) * r, Math.sin(a) * r, s * .055, 0, 7); o.fill(); }
        }
      });
    } else if (kind === 'shuttle') {
      o.beginPath(); o.arc(0, s * .3, s * .14, 0, Math.PI); o.fill();
      o.beginPath(); o.moveTo(-s * .14, s * .3); o.lineTo(-s * .34, -s * .42); o.lineTo(s * .34, -s * .42); o.lineTo(s * .14, s * .3); o.closePath(); o.fill();
      cut(() => { o.lineWidth = 3; for (const k of [-.5, 0, .5]) { o.beginPath(); o.moveTo(k * s * .2, s * .28); o.lineTo(k * s * .6, -s * .42); o.stroke(); } });
    } else if (kind === 'play') {
      o.beginPath(); o.arc(0, 0, s * .46, 0, 7); o.fill();
      cut(() => { o.beginPath(); o.moveTo(-s * .12, -s * .2); o.lineTo(s * .22, 0); o.lineTo(-s * .12, s * .2); o.closePath(); o.fill(); });
    } else if (kind === 'star') {
      o.lineWidth = s * .12;
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; o.beginPath(); o.moveTo(Math.cos(a) * s * .42, Math.sin(a) * s * .42); o.lineTo(-Math.cos(a) * s * .42, -Math.sin(a) * s * .42); o.stroke(); }
    }
  }
  const stencilSize = () => Math.max(80, Math.min(W, H) * .32) * (+nozzle.value / 24) ** .35;

  function stamp(x, y, kind, col, rot) {
    const s = stencilSize(), box = Math.ceil(s * 2.4);
    const off = document.createElement('canvas'); off.width = off.height = box;
    const o = off.getContext('2d');
    o.translate(box / 2, box / 2); o.rotate(rot ?? gauss() * .12);
    drawStencil(o, kind, s);
    const data = o.getImageData(0, 0, box, box).data;
    const gap = Math.max(2, Math.round(s / 55));
    const c = col || paint();
    for (let py = 0; py < box; py += gap) for (let px = 0; px < box; px += gap)
      if (data[(py * box + px) * 4 + 3] > 128) spray(x - box / 2 + px, y - box / 2 + py, gap * 1.3, 3, c);
    for (let i = 0; i < 40; i++) spray(x + gauss() * s * .7, y + gauss() * s * .5, 10, 2, c); // overspray
    if (Math.random() < .6) addDrip(x + gauss() * s * .3, y + s * .2, s * .2, c);
  }

  /* ---------- splat ---------- */
  function splat(x, y) {
    const c = paint(), r = 26 + +nozzle.value * .9;
    ctx.fillStyle = c; ctx.strokeStyle = c; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) {
      const a = i / 24 * Math.PI * 2, rr = r * (.75 + Math.random() * .45);
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2, d = r * (1.1 + Math.random() * 2.2), s = Math.random() * 7 + 2;
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, s, 0, 7); ctx.fill();
      if (Math.random() < .4) {
        ctx.lineWidth = s * .8;
        ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8); ctx.lineTo(x + Math.cos(a) * d * .9, y + Math.sin(a) * d * .9); ctx.stroke();
      }
    }
    for (let i = 0; i < 4; i++) addDrip(x + gauss() * r, y + r * .4, r * .5, c);
    splatSound();
  }

  /* ---------- wash and melt ---------- */
  function stopWash() {
    cancelAnimationFrame(washFrame);
    washFrame = null; washing = false; sq.hidden = true; sq.style.top = '-20px';
  }
  function wash() {
    if (washing) return;
    snapshot(); setRain(false); down = false; pos = last = null; drips.length = 0; waterSound(.9);
    if (paused) { ctx.clearRect(0, 0, W, H); return; }
    washing = true; sq.hidden = false;
    const start = performance.now(), dur = 900;
    let prevY = 0;
    (function step(now) {
      const k = Math.min(1, (now - start) / dur);
      const y = (1 - (1 - k) ** 2) * (H + 20);
      ctx.clearRect(0, prevY - 2, W, y - prevY + 2);
      ctx.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < 6; i++) ctx.fillRect(Math.random() * W, y, 2, Math.random() * 18);
      ctx.globalCompositeOperation = 'source-over';
      prevY = y; sq.style.top = `${y - 7}px`;
      if (k < 1) washFrame = requestAnimationFrame(step);
      else { ctx.clearRect(0, 0, W, H); sq.hidden = true; sq.style.top = '-20px'; washing = false; }
    })(start);
  }
  function meltStep() { // the wall slides down a little each frame and fades, leaving long runs
    tmp.width = cv.width; tmp.height = cv.height; tctx.drawImage(cv, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = .985; ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, 0, 1.2, W, H);
    ctx.globalAlpha = .5; ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, 0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  /* ---------- rain ---------- */
  function rainStep() {
    for (let i = 0; i < 3; i++) drops.push({ x: Math.random() * W, y: -20, v: 9 + Math.random() * 6, l: 10 + Math.random() * 14 });
    for (let i = 0; i < 5; i++) { // thin columns of paint get pulled down and thinned out
      const x = Math.random() * W, y = Math.random() * H, w = 2 + Math.random() * 3, h = 40 + Math.random() * 80;
      ctx.globalAlpha = .9; ctx.drawImage(cv, x * dpr, y * dpr, w * dpr, h * dpr, x, y + 2, w, h); ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(x, y, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,.004)'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawOverlay() {
    pctx.clearRect(0, 0, W, H);
    if (raining) {
      pctx.strokeStyle = 'rgba(200,190,255,.35)'; pctx.lineWidth = 1.2;
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        pctx.beginPath(); pctx.moveTo(d.x, d.y); pctx.lineTo(d.x - 2, d.y + d.l); pctx.stroke();
        d.y += d.v; if (d.y > H) drops.splice(i, 1);
      }
    }
    if (stencil === 'none' && hover && document.activeElement === wall) {
      pctx.strokeStyle = '#d5ff43'; pctx.lineWidth = 1; pctx.beginPath(); pctx.arc(hover.x, hover.y, +nozzle.value, 0, Math.PI * 2); pctx.stroke();
    }
    if (stencil !== 'none' && hover && !washing) {
      pctx.save(); pctx.translate(hover.x, hover.y); pctx.globalAlpha = .35;
      drawStencil(pctx, stencil, stencilSize()); pctx.restore();
    }
  }

  /* ---------- input ---------- */
  const point = e => { const r = wall.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const touches = new Set();
  let lastTap = { t: 0, x: 0, y: 0 };

  wall.addEventListener('pointerdown', e => {
    if (ac) ac.resume().catch(() => {});
    if (e.button !== 0) return;
    wall.focus({ preventScroll: true });
    wall.setPointerCapture(e.pointerId);
    touches.add(e.pointerId);
    if (touches.size === 2) { down = false; pos = last = null; undo(); return; } // two-finger tap
    if (washing) return;
    const p = point(e), now = performance.now();
    const dbl = now - lastTap.t < 300 && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 40;
    lastTap = { t: now, x: p.x, y: p.y };
    if (dbl) { // the splat replaces whatever the first tap left behind
      const before = undoStack.pop(); if (before) ctx.putImageData(before, 0, 0);
      snapshot(); splat(p.x, p.y); down = false; return;
    }
    snapshot();
    if (stencil !== 'none') { stamp(p.x, p.y, stencil); thunk(); return; }
    down = true; wall.setPointerCapture(e.pointerId);
    pos = last = p; stillSince = now;
    spray(p.x, p.y, +nozzle.value, +nozzle.value * 2);
  });
  wall.addEventListener('pointermove', e => {
    const p = point(e); hover = p;
    start();
    if (!down || !pos) return;
    if (Math.hypot(p.x - pos.x, p.y - pos.y) > 4) stillSince = performance.now();
    pos = p;
  });
  wall.addEventListener('pointerleave', () => { hover = null; start(); });
  const up = e => { touches.delete(e.pointerId); down = false; pos = last = null; };
  wall.addEventListener('pointerup', up);
  wall.addEventListener('pointercancel', up);
  wall.addEventListener('lostpointercapture', up);
  section.addEventListener('keydown', e => {
    if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z' || e.shiftKey) return;
    if (e.target.closest?.('input, textarea, [contenteditable]')) return;
    e.preventDefault(); undo();
  });

  wall.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (!directions[e.key] && e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    if (washing) return;
    hover ||= { x: W / 2, y: H / 2 };
    if (directions[e.key]) {
      const [x, y] = directions[e.key], step = e.shiftKey ? 40 : 12;
      hover = { x: Math.max(0, Math.min(W, hover.x + x * step)), y: Math.max(0, Math.min(H, hover.y + y * step)) };
    } else if (!e.repeat) {
      snapshot();
      if (e.shiftKey) splat(hover.x, hover.y);
      else if (stencil !== 'none') stamp(hover.x, hover.y, stencil);
      else spray(hover.x, hover.y, +nozzle.value, +nozzle.value * 8);
      toast(stencil === 'none' ? 'Paint added' : 'Stencil stamped');
    }
    start();
  });
  wall.addEventListener('focus', () => { hover ||= { x: W / 2, y: H / 2 }; start(); });
  wall.addEventListener('blur', () => { hover = null; down = false; start(); });

  /* ---------- main loop, only while the wall is on screen ---------- */
  let frameN = 0, running = false;
  function frame(t) {
    if (document.hidden || !visible) { running = false; hissGainOff(); return; }
    frameN++;
    const radius = +nozzle.value;
    if (down && pos && !washing) {
      const dist = Math.hypot(pos.x - last.x, pos.y - last.y);
      const steps = Math.max(1, Math.ceil(dist / (radius * .35)));
      for (let i = 1; i <= steps; i++) {
        const k = i / steps;
        spray(last.x + (pos.x - last.x) * k, last.y + (pos.y - last.y) * k, radius, Math.round(radius * 1.6 * pressure / steps) + 6);
      }
      last = { ...pos };
      if (t - stillSince > 450 && Math.random() < .12) addDrip(pos.x, pos.y, radius);
    }
    pressure = Math.max(1, pressure - .004);
    if (ac) { setLevel(hissGain, down ? .22 : 0); setLevel(rainGain, raining ? .18 : 0); }
    if (melting) { meltStep(); if (frameN % 6 === 0) addDrip(Math.random() * W, Math.random() * H * .7, 30, paint()); }
    if (raining && frameN % 2 === 0) rainStep();
    for (let i = drips.length - 1; i >= 0; i--) {
      const d = drips[i];
      const step = paused ? d.left : d.v;
      ctx.fillStyle = d.c; ctx.globalAlpha = .8;
      ctx.fillRect(d.x - d.w / 2, d.y, d.w, step + .5);
      d.y += step; d.left -= step; d.v *= .995;
      if (d.left <= 0) { ctx.beginPath(); ctx.arc(d.x, d.y, d.w * .85, 0, 7); ctx.fill(); drips.splice(i, 1); }
      ctx.globalAlpha = 1;
    }
    drawOverlay();
    if (down || drips.length || raining || melting) requestAnimationFrame(frame);
    else running = false;
  }
  function hissGainOff() { if (ac) { setLevel(hissGain, 0); setLevel(rainGain, 0); } }
  function start() { if (!running) { running = true; requestAnimationFrame(frame); } }

  /* ---------- controls ---------- */
  const cans = [...section.querySelectorAll('.spray-can')];
  const pickCan = el => { cans.forEach(x => { x.classList.toggle('is-selected', x === el); if (x.tagName === 'BUTTON') x.setAttribute('aria-pressed', String(x === el)); }); };
  cans.forEach(b => { if (b.dataset.color) b.addEventListener('click', () => { pickCan(b); chosen = b.dataset.color; }); });
  const custom = section.querySelector('.spray-custom');
  custom.addEventListener('input', () => { const l = custom.parentElement; l.style.background = custom.value; pickCan(l); chosen = custom.value; });

  const stencils = [...section.querySelectorAll('[data-stencil]')];
  function setStencil(kind) {
    stencil = kind;
    stencils.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.stencil === kind)));
    wall.classList.toggle('is-stamping', kind !== 'none');
    start();
  }
  stencils.forEach(b => b.addEventListener('click', () => setStencil(b.dataset.stencil)));

  const toggle = (btn, on) => btn.setAttribute('aria-pressed', String(on));
  action('sound').addEventListener('click', e => {
    if (!audio()) return false;
    ac.resume().catch(() => {}); soundOn = !soundOn; toggle(e.currentTarget, soundOn);
    if (!soundOn) hissGainOff();
  });
  action('music').addEventListener('click', e => toggle(e.currentTarget, toggleMusic()));
  const rainBtn = action('rain');
  function setRain(on) {
    raining = on; toggle(rainBtn, on);
    if (on) { snapshot(); start(); } else drops.length = 0;
  }
  rainBtn.addEventListener('click', () => setRain(!raining));

  function shake() {
    if (ac) ac.resume().catch(() => {});
    const can = section.querySelector('.spray-can[aria-pressed="true"]');
    if (can) { can.classList.remove('is-shaking'); void can.offsetWidth; can.classList.add('is-shaking'); }
    rattle(); pressure = 2.2; toast('Fresh can!');
  }
  action('shake').addEventListener('click', shake);
  let lastShake = 0;
  addEventListener('devicemotion', e => { // a real shake on phones, when the browser allows motion events
    if (!visible) return;
    const a = e.accelerationIncludingGravity; if (!a) return;
    const f = Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0);
    if (f > 35 && performance.now() - lastShake > 1200) { lastShake = performance.now(); shake(); }
  });

  action('dice').addEventListener('click', () => {
    const list = cans.filter(c => c.dataset.color);
    const c = list[Math.floor(Math.random() * list.length)];
    pickCan(c); chosen = c.dataset.color;
    const s = stencils[Math.floor(Math.random() * stencils.length)];
    setStencil(s.dataset.stencil);
    nozzle.value = 10 + Math.floor(Math.random() * 45);
    toast(s.dataset.stencil === 'none' ? 'Free spray' : s.getAttribute('aria-label') || s.textContent);
  });
  action('undo').addEventListener('click', undo);

  // A native click supports touch, mouse, Enter and Space. Holding is optional.
  const washBtn = action('wash');
  let holdTimer = null, didHold = false;
  washBtn.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    didHold = false;
    washBtn.setPointerCapture(e.pointerId);
    if (paused) return;
    holdTimer = setTimeout(() => {
      holdTimer = null; didHold = true;
      if (paused || washing) return;
      snapshot(); setRain(false); melting = true; waterSound(2.5); washBtn.textContent = 'Melting…'; start();
    }, 350);
  });
  function endHold() {
    clearTimeout(holdTimer); holdTimer = null;
    melting = false; washBtn.innerHTML = `Wash ${icon('arrow-down')}`;
  }
  washBtn.addEventListener('pointerup', endHold);
  washBtn.addEventListener('pointercancel', () => { didHold = true; endHold(); });
  washBtn.addEventListener('lostpointercapture', endHold);
  washBtn.addEventListener('click', () => { if (!didHold) { wash(); start(); } didHold = false; });

  function tag() {
    if (washing) return;
    snapshot();
    stamp(W * .5, H * .42, 'sun_rain', '#b36bff', -.07);
    for (let x = W * .28; x < W * .72; x += 5) spray(x, H * .42 + stencilSize() * .28 + Math.sin(x / 40) * 4, 8, 5, '#d5ff43');
    stamp(W * .16, H * .78, 'ball', '#d5ff43', .1);
    stamp(W * .82, H * .6, 'brick', '#ff4fa3', -.15);
    start();
  }
  action('tag').addEventListener('click', tag);

  nozzle.addEventListener('input', start);
  wall.addEventListener('pointerdown', start);
  resize();
  new ResizeObserver(resize).observe(wall);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); }).observe(wall);
  }
  start();
  tag(); undoStack.clear();

  function setPaused(value) {
    paused = value;
    rainBtn.disabled = value;
    if (value) {
      setRain(false); endHold();
      if (washing) { stopWash(); ctx.clearRect(0, 0, W, H); }
      start();
    }
  }
  function suspend() {
    down = false; pos = last = null; touches.clear(); endHold();
    clearInterval(musicTimer); musicTimer = null;
    if (ac) ac.suspend().catch(() => {});
  }
  function resume() {
    if (ac && (soundOn || musicOn)) ac.resume().catch(() => {});
    if (musicOn) { clearInterval(musicTimer); nextBeat = ac.currentTime + .1; musicTimer = setInterval(scheduleMusic, 50); }
    start();
  }
  document.addEventListener('visibilitychange', () => document.hidden ? suspend() : resume());
  window.addEventListener('pagehide', suspend);
  window.addEventListener('pageshow', e => { if (e.persisted) resume(); });
  setPaused(paused);
  return { setPaused };
}
