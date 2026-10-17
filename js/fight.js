/* Бой с Глиноликим: Робин против глиняного великана в лаборатории.
   Canvas 800×420, клавиатура и кнопки на экране. Fight.start(root, {diff, capsules, onWin}). */
(function () {
  const W = 800, H = 420, G = 362;
  const RED = '#d0142c', YEL = '#ffd400';
  const GRAV = 1500;

  /* ---------- фон лаборатории, рисуется один раз ---------- */
  function background() {
    const b = document.createElement('canvas'); b.width = W; b.height = H;
    const g = b.getContext('2d');
    g.fillStyle = '#0a0d10'; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#141a1f'; g.lineWidth = 2;
    for (let y = 0; y < G; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    for (let x = 0; x < W; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, G); g.stroke(); }
    // окно с дождём
    g.fillStyle = '#121c26'; g.fillRect(300, 40, 200, 120); g.strokeStyle = '#fff'; g.lineWidth = 4; g.strokeRect(300, 40, 200, 120);
    g.beginPath(); g.moveTo(400, 40); g.lineTo(400, 160); g.stroke();
    g.strokeStyle = 'rgba(160,190,210,.35)'; g.lineWidth = 1.5;
    for (let i = 0; i < 26; i++) { const x = 304 + (i * 37) % 192, y = 44 + (i * 53) % 110; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 4, y + 14); g.stroke(); }
    // полки с колбами
    const shelf = (x, y, w) => { g.fillStyle = '#fff'; g.fillRect(x, y, w, 5); for (let i = 0; i < w / 26; i++) { const cx = x + 12 + i * 26; g.fillStyle = ['#2a4a3a', '#3a2a4a', '#4a2a2a', '#2a3a4a'][i % 4]; g.beginPath(); g.moveTo(cx - 7, y); g.lineTo(cx - 7, y - 22); g.lineTo(cx - 3, y - 26); g.lineTo(cx + 3, y - 26); g.lineTo(cx + 7, y - 22); g.lineTo(cx + 7, y); g.fill(); g.strokeStyle = '#ccc'; g.lineWidth = 1.2; g.stroke(); } };
    shelf(40, 110, 200); shelf(40, 180, 200); shelf(560, 110, 200);
    // центрифуга и пульт
    g.fillStyle = '#161616'; g.strokeStyle = '#fff'; g.lineWidth = 3;
    g.fillRect(600, 220, 150, 142); g.strokeRect(600, 220, 150, 142);
    g.beginPath(); g.arc(675, 270, 30, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#0b2a33'; g.fillRect(612, 316, 70, 30); g.strokeRect(612, 316, 70, 30);
    g.fillStyle = RED; g.fillRect(700, 320, 30, 8);
    // надпись на стене
    g.fillStyle = '#fff'; g.font = '14px "Russo One", Arial Black, sans-serif'; g.textAlign = 'left';
    g.fillText('АРКХЕМ-ИСТ · ЛАБОРАТОРИЯ', 40, 32);
    // трубы под потолком и лампы дневного света с конусами
    g.fillStyle = '#1c242b'; g.fillRect(0, 46, W, 9); g.fillStyle = '#2c3842'; g.fillRect(0, 46, W, 3);
    for (let x = 20; x < W; x += 110) { g.fillStyle = '#3a4650'; g.fillRect(x, 43, 8, 15); }
    [150, 650].forEach(x => {
      g.fillStyle = '#e8fff8'; g.fillRect(x - 60, 62, 120, 6);
      const gr = g.createLinearGradient(0, 68, 0, G); gr.addColorStop(0, 'rgba(220,255,245,.15)'); gr.addColorStop(1, 'rgba(220,255,245,0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(x - 60, 68); g.lineTo(x + 60, 68); g.lineTo(x + 150, G); g.lineTo(x - 150, G); g.closePath(); g.fill();
    });
    // вентиляция, из которой вытекла глина
    g.fillStyle = '#111'; g.fillRect(248, 66, 44, 28); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(248, 66, 44, 28);
    g.strokeStyle = '#555'; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(252, 72 + i * 6); g.lineTo(288, 72 + i * 6); g.stroke(); }
    g.strokeStyle = '#8a7860'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(262, 94); g.quadraticCurveTo(258, 130, 266, 160); g.stroke(); g.lineWidth = 5; g.beginPath(); g.moveTo(280, 94); g.lineTo(280, 116); g.stroke(); g.lineCap = 'butt';
    // знак биоопасности
    g.save(); g.translate(530, 190); g.fillStyle = YEL; g.strokeStyle = '#000'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, -22); g.lineTo(22, 16); g.lineTo(-22, 16); g.closePath(); g.fill(); g.stroke();
    g.lineWidth = 2; [0, 2.094, 4.189].forEach(a => { g.beginPath(); g.arc(Math.sin(a) * 6, 4 - Math.cos(a) * 6, 4, 0, Math.PI * 2); g.stroke(); }); g.restore();
    // лабораторный стол с микроскопом и пробирками
    g.fillStyle = '#ddd'; g.fillRect(250, 300, 230, 8); g.strokeStyle = '#fff'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(262, 308); g.lineTo(262, G); g.moveTo(468, 308); g.lineTo(468, G); g.stroke();
    g.strokeStyle = '#ddd'; g.lineWidth = 5; g.beginPath(); g.moveTo(290, 298); g.lineTo(290, 262); g.quadraticCurveTo(290, 254, 280, 250); g.stroke();
    g.fillStyle = '#222'; g.fillRect(270, 244, 18, 10); g.fillStyle = '#ddd'; g.fillRect(278, 294, 30, 6);
    ['#d6283c', '#2850dc', '#c4a0b4', '#2fae5a', '#e8e8e8'].forEach((c, i) => { g.fillStyle = c; g.fillRect(340 + i * 10, 276, 6, 22); g.strokeStyle = '#fff'; g.lineWidth = 1; g.strokeRect(340 + i * 10, 276, 6, 22); });
    g.fillStyle = '#ccc'; g.fillRect(336, 290, 54, 4);
    g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(420, 298); g.lineTo(426, 270); g.lineTo(440, 270); g.lineTo(446, 298); g.closePath(); g.stroke();
    g.fillStyle = 'rgba(196,160,180,.75)'; g.beginPath(); g.moveTo(422, 296); g.lineTo(425, 284); g.lineTo(441, 284); g.lineTo(444, 296); g.closePath(); g.fill();
    // пол
    g.fillStyle = '#0e0e0e'; g.fillRect(0, G, W, H - G);
    g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, G); g.lineTo(W, G); g.stroke();
    g.strokeStyle = '#1c1c1c'; g.lineWidth = 2;
    for (let i = 0; i < 10; i++) { g.beginPath(); g.moveTo(i * 90, G); g.lineTo(i * 90 - 50, H); g.stroke(); }
    // лужи глины и отблески ламп на полу
    g.fillStyle = 'rgba(138,120,96,.55)'; g.beginPath(); g.ellipse(270, G + 20, 40, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(220,255,245,.06)'; [150, 650].forEach(x => { g.beginPath(); g.ellipse(x, G + 30, 110, 10, 0, 0, Math.PI * 2); g.fill(); });
    // точечный растр
    g.fillStyle = 'rgba(255,255,255,.035)';
    for (let y = 0; y < H; y += 7) for (let x = (y / 7) % 2 ? 3 : 0; x < W; x += 7) g.fillRect(x, y, 1.6, 1.6);
    return b;
  }

  /* ---------- Робин ---------- */
  function drawRobin(g, r, t) {
    const duck = r.duck && r.ground, hgt = duck ? 0.62 : 1, f = r.face;
    if (r.inv > 0 && Math.floor(t * 20) % 2) g.globalAlpha = 0.35;
    g.save(); g.translate(r.x, r.y); g.scale(f * 1.25, 1.25);
    // тень
    g.fillStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.ellipse(0, (G - r.y) / 1.25 + 3, 22, 4, 0, 0, Math.PI * 2); g.fill();
    const run = r.ground && !duck ? Math.sin(r.run * 14) : 0;
    const hip = -40 * hgt, sh = -76 * hgt, head = -92 * hgt;
    // плащ
    const flap = Math.sin(t * 6) * 4 + Math.abs(r.vx) * 0.04;
    g.fillStyle = '#050505'; g.strokeStyle = '#fff'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(-6, sh); g.quadraticCurveTo(-34 - flap, hip, -26 - flap * 1.5, -4 * hgt); g.lineTo(-4, -10 * hgt); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = YEL; g.beginPath(); g.moveTo(-8, sh + 6); g.quadraticCurveTo(-28 - flap, hip + 4, -22 - flap * 1.4, -8 * hgt); g.lineTo(-10, -12 * hgt); g.closePath(); g.fill();
    // ноги
    g.lineCap = 'round'; g.lineWidth = 11; g.strokeStyle = '#000';
    const leg = (dx, sw) => { g.beginPath(); g.moveTo(dx, hip); g.lineTo(dx + sw * 10, duck ? -14 : -20); g.lineTo(dx + sw * 6, 0); g.stroke(); };
    g.strokeStyle = '#0f2a18'; leg(-6, run); leg(6, -run);
    g.fillStyle = '#000'; g.fillRect(-14 + run * 6, -6, 14, 7); g.fillRect(2 - run * 6, -6, 14, 7);
    // туловище
    g.fillStyle = RED; g.strokeStyle = '#fff'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(-14, sh); g.lineTo(14, sh); g.lineTo(11, hip); g.lineTo(-11, hip); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = YEL; g.fillRect(-12, hip - 6, 24, 6);
    g.fillStyle = '#fff'; g.beginPath(); g.arc(-5, sh + 10, 5.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#000'; g.font = 'bold 8px Arial'; g.textAlign = 'center'; g.fillText('R', -5, sh + 13);
    // шест
    g.strokeStyle = '#c9b48a'; g.lineWidth = 4;
    if (r.atk > 0) {
      const p = 1 - r.atk / 0.22, a = -1.6 + p * 2.6;
      g.beginPath(); g.moveTo(6 + Math.cos(a) * -20, sh + 14 + Math.sin(a) * -20); g.lineTo(6 + Math.cos(a) * 92, sh + 14 + Math.sin(a) * 92); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2; g.beginPath(); g.arc(6, sh + 14, 92, a - 0.6, a); g.stroke();
    } else { g.beginPath(); g.moveTo(-16, sh - 10); g.lineTo(12, hip + 6); g.stroke(); }
    // рука
    g.strokeStyle = '#0f2a18'; g.lineWidth = 8;
    g.beginPath(); g.moveTo(8, sh + 6); g.lineTo(r.atk > 0 ? 22 : 16 + run * 4, r.atk > 0 ? sh + 12 : hip - 2); g.stroke();
    // голова
    g.fillStyle = '#f1ecdf'; g.strokeStyle = '#000'; g.lineWidth = 2;
    g.beginPath(); g.arc(2, head, 12, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = '#0a0a0a'; g.beginPath(); g.moveTo(-12, head - 2); g.lineTo(-14, head - 12); g.lineTo(-6, head - 10); g.lineTo(-4, head - 18); g.lineTo(2, head - 12); g.lineTo(8, head - 17); g.lineTo(10, head - 10); g.lineTo(14, head - 6); g.quadraticCurveTo(4, head - 10, -12, head - 2); g.fill();
    g.fillStyle = '#000'; g.fillRect(-2, head - 4, 15, 6);
    g.fillStyle = '#fff'; g.fillRect(6, head - 3, 6, 3);
    g.restore(); g.globalAlpha = 1;
  }

  /* ---------- Глиноликий ---------- */
  function drawClay(g, c, t) {
    const hard = c.hard > 0, base = hard ? '#9c9c98' : '#8a7860', dark = hard ? '#6e6e6a' : '#5f5140', lite = hard ? '#c4c4c0' : '#a8967a';
    const wob = k => Math.sin(t * 3 + k) * (hard ? 0.6 : 4);
    g.save(); g.translate(c.x + (c.shake ? Math.sin(t * 90) * 3 : 0), G);
    g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.ellipse(0, 4, 100, 12, 0, 0, Math.PI * 2); g.fill();
    // тело
    const body = () => {
      g.beginPath(); g.moveTo(-86, 0);
      g.bezierCurveTo(-96 + wob(1), -70, -92, -150 + wob(2), -54, -184);
      g.bezierCurveTo(-30, -214 + wob(3), 30, -214 + wob(4), 54, -184);
      g.bezierCurveTo(92, -150 + wob(5), 98 + wob(6), -70, 86, 0);
      for (let i = 4; i >= -4; i--) g.quadraticCurveTo(i * 20 + 10, 10 + (i % 2) * 6, i * 20, 0);
      g.closePath();
    };
    g.fillStyle = c.flash > 0 ? '#fff' : base; g.strokeStyle = '#000'; g.lineWidth = 3; body(); g.fill(); g.stroke();
    g.save(); body(); g.clip();
    g.fillStyle = dark; g.beginPath(); g.ellipse(60, -90, 50, 120, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = lite; g.globalAlpha = 0.5; g.beginPath(); g.ellipse(-46, -130, 18, 40, 0.3, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    g.restore();
    // потёки
    g.fillStyle = base;
    for (let i = 0; i < 4; i++) { const x = -60 + i * 38, d = 10 + ((t * 30 + i * 13) % 30); g.beginPath(); g.ellipse(x, -40 + d, 5, 9, 0, 0, Math.PI * 2); g.fill(); }
    if (hard) { g.strokeStyle = '#222'; g.lineWidth = 2; g.beginPath(); g.moveTo(-30, -170); g.lineTo(-10, -130); g.lineTo(-24, -90); g.lineTo(-2, -50); g.moveTo(30, -160); g.lineTo(18, -120); g.lineTo(40, -80); g.stroke(); }
    // лицо
    const ey = -150;
    g.fillStyle = '#1a120a'; g.beginPath(); g.ellipse(-24, ey, 14, 10, 0.2, 0, Math.PI * 2); g.ellipse(18, ey + 2, 14, 10, -0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = c.st === 'stagger' ? '#fff' : YEL; g.shadowColor = YEL; g.shadowBlur = hard ? 0 : 12;
    g.beginPath(); g.arc(-24, ey, 5, 0, Math.PI * 2); g.arc(18, ey + 2, 5, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0;
    g.fillStyle = '#1a120a'; g.beginPath(); g.ellipse(-4, -112, 26, c.st === 'slamT' || c.st === 'throwT' ? 16 : 8, 0, 0, Math.PI * 2); g.fill();
    // руки по состоянию
    g.fillStyle = c.flash > 0 ? '#fff' : base; g.strokeStyle = '#000'; g.lineWidth = 3;
    const arm = (x1, y1, x2, y2, w, fist) => {
      g.lineCap = 'round'; g.strokeStyle = '#000'; g.lineWidth = w + 6; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      g.strokeStyle = c.flash > 0 ? '#fff' : base; g.lineWidth = w; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      g.beginPath(); g.arc(x2, y2, fist, 0, Math.PI * 2); g.fillStyle = c.flash > 0 ? '#fff' : base; g.fill(); g.strokeStyle = '#000'; g.lineWidth = 3; g.stroke();
    };
    const p = c.tMax ? 1 - c.t / c.tMax : 0;
    switch (c.st) {
      case 'slamT': arm(-60, -150, -70, -230 - p * 30, 30, 30); arm(60, -150, 40, -236 - p * 30, 30, 30); break;
      case 'stuck': arm(-60, -140, -110, -6, 30, 32); arm(60, -140, 10, -6, 30, 32); break;
      case 'sweepT': arm(-60, -110, -20 + p * 60, -150, 30, 28); arm(60, -120, 90, -50, 28, 24); break;
      case 'sweep': arm(-60, -110, -60 - c.reach, -95, 28, 30); arm(60, -120, 90, -50, 28, 24); break;
      case 'throwT': arm(-60, -150, -40, -230, 28, 22); g.fillStyle = dark; g.beginPath(); g.arc(-40, -250, 20, 0, Math.PI * 2); g.fill(); g.stroke(); arm(60, -120, 90, -50, 28, 24); break;
      case 'advance': arm(-60, -130, -120 + Math.sin(t * 8) * 10, -120, 28, 26); arm(60, -130, -60 - Math.sin(t * 8) * 10, -110, 28, 26); break;
      default: arm(-60, -130, -90 + wob(7), -40, 28, 26); arm(60, -130, 92 + wob(8), -40, 28, 26);
    }
    g.restore();
  }

  function start(root, o) {
    o = o || {};
    const P = { easy: { hp: 7, boss: 90, sp: 0.75 }, medium: { hp: 6, boss: 110, sp: 0.95 }, hard: { hp: 5, boss: 135, sp: 1.15 } }[o.diff] || { hp: 6, boss: 110, sp: 0.95 };
    let losses = 0, s = null, raf = 0, last = 0, playing = false, ended = false;
    root.innerHTML = `<div class="fg-wrap">
      <div class="fg-top"><div class="fg-hp" aria-label="Здоровье Робина"></div><div class="fg-boss"><span>ГЛИНОЛИКИЙ</span><i><b></b></i></div></div>
      <div class="fg-stage"><canvas width="${W}" height="${H}" aria-label="Бой Робина с Глиноликим"></canvas><div class="fg-msg"></div></div>
      <div class="fg-pad">
        <div class="fg-move"><button data-k="left" aria-label="Влево">◀</button><button data-k="jump" aria-label="Прыжок">▲</button><button data-k="duck" aria-label="Присесть">▼</button><button data-k="right" aria-label="Вправо">▶</button></div>
        <div class="fg-act"><button data-k="staff">ШЕСТ <small>Z</small></button><button data-k="bat">БЭТАРАНГ <small>X</small></button><button data-k="cap">ОТВЕРДИТЕЛЬ <small>C</small> <b class="fg-caps"></b></button></div>
      </div>
      <p class="fg-rotate">↻ Поверни телефон горизонтально — так удобнее драться</p>
      <p class="fg-keys">← → идти · ↑ прыжок · ↓ присесть · Z шест · X бэтаранг · C капсула с отвердителем</p></div>`;
    const cv = root.querySelector('canvas'), g = cv.getContext('2d'), msg = root.querySelector('.fg-msg');
    const hpEl = root.querySelector('.fg-hp'), bossEl = root.querySelector('.fg-boss b'), capsEl = root.querySelector('.fg-caps');
    const bg = background();
    const held = { left: false, right: false, duck: false };
    const press = { jump: false, staff: false, bat: false, cap: false };
    const sfx = n => { if (window.Sound) Sound.sfx(n); };
    const calm = () => document.body.classList.contains('calm');

    function reset() {
      const easier = losses >= 2;
      s = {
        t: 0, shakeT: 0,
        r: { x: 150, y: G, vy: 0, vx: 0, ground: true, face: 1, hp: P.hp + (easier ? 2 : 0), inv: 0, atk: 0, cd: 0, rcd: 0, ccd: 0, duck: false, run: 0, hit: false },
        c: { x: 610, hp: P.boss * (easier ? 0.7 : 1), max: P.boss * (easier ? 0.7 : 1), st: 'idle', t: 1.4, tMax: 1.4, hard: 0, flash: 0, reach: 0, shake: 0 },
        caps: o.capsules || 3, shots: [], waves: [], blobs: [], picks: [], parts: [], pickT: 9
      };
      hud();
    }
    function hud() {
      hpEl.innerHTML = Array.from({ length: Math.max(s.r.hp, 0) }, () => '<i>♥</i>').join('') || '<em>—</em>';
      bossEl.style.width = Math.max(0, s.c.hp / s.c.max * 100) + '%';
      capsEl.textContent = '×' + s.caps;
      root.querySelector('[data-k="cap"]').disabled = s.caps <= 0;
    }
    const burst = (x, y, col, n, sp) => { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = (sp || 200) * (0.4 + Math.random()); s.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, life: 0.6 + Math.random() * 0.4, col, r: 2 + Math.random() * 4 }); } };
    const shake = d => { if (!calm()) s.shakeT = Math.max(s.shakeT, d); };

    function hurtRobin(why) {
      const r = s.r;
      if (r.inv > 0 || ended) return;
      (s.log = s.log || []).push(why + '@' + s.c.st);
      r.hp -= 1; r.inv = 1.2; r.vx = -260; sfx('wrong'); shake(0.25);
      burst(r.x, r.y - 50, RED, 10, 160); hud();
      if (r.hp <= 0) lose();
    }
    function hitClay(dmg, x, y) {
      const c = s.c;
      if (c.hp <= 0) return;
      c.hp -= dmg; c.flash = 0.1; burst(x, y, c.hard > 0 ? '#bbb' : '#8a7860', 6, 220); sfx('clunk'); hud();
      if (c.hp <= 0) win();
    }
    function chooseAttack() {
      const c = s.c, d = c.x - s.r.x, roll = Math.random();
      const sp = P.sp * (c.hard > 0 ? 0.45 : 1);
      let st;
      if (d < 240) st = roll < 0.45 ? 'slamT' : roll < 0.8 ? 'sweepT' : 'throwT';
      else st = roll < 0.4 ? 'throwT' : roll < 0.75 ? 'advance' : 'slamT';
      c.st = st;
      c.tMax = c.t = { slamT: 0.8, sweepT: 0.65, throwT: 0.55, advance: 1.4 }[st] / sp;
    }
    function update(dt) {
      s.t += dt;
      const r = s.r, c = s.c;
      // --- Робин ---
      r.duck = held.duck && r.ground;
      const dir = (held.right ? 1 : 0) - (held.left ? 1 : 0);
      if (dir) r.face = dir;
      const speed = r.duck ? 0 : 230;
      r.x += (dir * speed + r.vx) * dt; r.vx *= Math.pow(0.02, dt);
      if (dir && r.ground && !r.duck) r.run += dt; else r.run = 0;
      if (press.jump && r.ground && !r.duck) { r.vy = -560; r.ground = false; sfx('whoosh'); }
      r.vy += GRAV * dt; r.y += r.vy * dt;
      if (r.y >= G) { r.y = G; r.vy = 0; r.ground = true; }
      r.x = Math.max(30, Math.min(r.x, c.x - 82));
      r.inv = Math.max(0, r.inv - dt); r.cd -= dt; r.rcd -= dt; r.ccd -= dt;
      if (r.atk > 0) {
        const before = r.atk; r.atk -= dt;
        if (before > 0.12 && r.atk <= 0.12 && r.face === 1 && c.x - r.x < 145 && r.y > G - 200) hitClay(5 * (c.hard > 0 ? 3 : 1) * (c.st === 'stuck' ? 1.5 : 1), c.x - 70, r.y - 60);
      }
      if (press.staff && r.cd <= 0) { r.atk = 0.22; r.cd = 0.38; sfx('whoosh'); }
      if (press.bat && r.rcd <= 0) { s.shots.push({ k: 'bat', x: r.x + 24 * r.face, y: r.y - (r.duck ? 44 : 76), vx: 640 * r.face, vy: 0, a: 0 }); r.rcd = 0.7; sfx('click'); }
      if (press.cap && r.ccd <= 0 && s.caps > 0) { s.shots.push({ k: 'cap', x: r.x + 20 * r.face, y: r.y - 80, vx: 420 * r.face, vy: -330, a: 0 }); s.caps--; r.ccd = 0.6; hud(); sfx('click'); }
      press.jump = press.staff = press.bat = press.cap = false;
      // --- снаряды Робина ---
      s.shots = s.shots.filter(b => {
        b.x += b.vx * dt; b.a += dt * 20;
        if (b.k === 'cap') { b.vy += GRAV * 0.8 * dt; b.y += b.vy * dt; }
        const inClay = b.x > c.x - 80 && b.x < c.x + 80 && b.y > G - 220 && b.y < G;
        if (inClay) {
          if (b.k === 'bat') { hitClay(2, b.x, b.y); if (/T$/.test(c.st)) { c.st = 'stagger'; c.tMax = c.t = 0.8; } }
          else { c.hard = 5.5; hitClay(3, b.x, b.y); burst(b.x, b.y, '#e6fbff', 18, 260); sfx('ok'); }
          return false;
        }
        if (b.k === 'cap' && b.y >= G) { burst(b.x, G - 4, '#e6fbff', 10, 140); return false; }
        return b.x > -20 && b.x < W + 20;
      });
      // --- подбор капсул ---
      s.pickT -= dt;
      if (s.pickT <= 0 && s.caps < 2 && !s.picks.length) { s.picks.push({ x: 60 + Math.random() * Math.max(60, c.x - 220), t: 0 }); s.pickT = 8; }
      s.picks = s.picks.filter(p => { p.t += dt; if (Math.abs(p.x - r.x) < 26 && r.y > G - 40) { s.caps++; hud(); sfx('hint'); return false; } return true; });
      // --- Глиноликий ---
      c.flash -= dt; c.hard = Math.max(0, c.hard - dt); c.shake = Math.max(0, c.shake - dt);
      const sp = P.sp * (c.hard > 0 ? 0.45 : 1);
      c.t -= dt;
      switch (c.st) {
        case 'idle': if (c.x - r.x > 300) c.x -= 30 * sp * dt; if (c.t <= 0) chooseAttack(); break;
        case 'slamT': if (c.t <= 0) { c.st = 'stuck'; c.tMax = c.t = 1.6; c.shake = 0.3; shake(0.35); sfx('clunk'); s.waves.push({ x: c.x - 90, vx: -340 * P.sp, h: 28 }); burst(c.x - 80, G, '#8a7860', 12, 200); } break;
        case 'stuck': if (c.t <= 0) { c.st = 'idle'; c.tMax = c.t = 0.8 / sp; } break;
        case 'sweepT': if (c.t <= 0) { c.st = 'sweep'; c.tMax = c.t = 0.35; c.reach = 0; sfx('whoosh'); } break;
        case 'sweep': c.reach = Math.min(330, c.reach + 2400 * dt);
          if (!r.inv && r.x > c.x - 60 - c.reach - 20 && r.y > G - 110 && r.y - (r.duck ? 71 : 115) < G - 80) hurtRobin('sweep');
          if (c.t <= 0) { c.st = 'idle'; c.tMax = c.t = 0.9 / sp; c.reach = 0; } break;
        case 'throwT': if (c.t <= 0) {
          const n = P.sp > 1 ? 2 : 1;
          for (let k = 0; k < n; k++) { const T = 0.9 + k * 0.25, x0 = c.x - 40, y0 = G - 250, tx = r.x + (k ? -60 : 0); s.blobs.push({ x: x0, y: y0, vx: (tx - x0) / T, vy: (G - y0 - 0.5 * GRAV * T * T) / T }); }
          c.st = 'idle'; c.tMax = c.t = 0.9 / sp; sfx('whoosh'); } break;
        case 'advance': c.x = Math.max(r.x + 90, c.x - 95 * sp * dt); if (c.t <= 0) { c.st = 'idle'; c.tMax = c.t = 0.7 / sp; } break;
        case 'stagger': if (c.t <= 0) { c.st = 'idle'; c.tMax = c.t = 0.6; } break;
      }
      if (c.st !== 'advance' && c.x < 560 && c.st === 'idle') c.x += 20 * dt;
      if (c.st === 'advance' && c.x - r.x < 96 && r.y > G - 150) hurtRobin('touch');
      // ударная волна по полу
      s.waves = s.waves.filter(w => { w.x += w.vx * dt; if (Math.abs(w.x - r.x) < 26 && r.y > G - w.h) hurtRobin('wave'); return w.x > -40; });
      // комья глины
      s.blobs = s.blobs.filter(b => {
        b.vy += GRAV * dt; b.x += b.vx * dt; b.y += b.vy * dt;
        if (Math.abs(b.x - r.x) < 24 && b.y > r.y - (r.duck ? 71 : 115) && b.y < r.y) { hurtRobin('blob'); burst(b.x, b.y, '#8a7860', 8, 160); return false; }
        if (b.y >= G) { burst(b.x, G - 4, '#8a7860', 8, 150); return false; }
        return true;
      });
      s.parts = s.parts.filter(p => { p.life -= dt; p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; return p.life > 0; });
      s.shakeT = Math.max(0, s.shakeT - dt);
    }
    function draw() {
      const sx = s.shakeT > 0 ? (Math.random() - 0.5) * 10 : 0, sy = s.shakeT > 0 ? (Math.random() - 0.5) * 8 : 0;
      g.setTransform(1, 0, 0, 1, sx, sy);
      g.drawImage(bg, 0, 0);
      s.picks.forEach(p => { const y = G - 14 - Math.abs(Math.sin(p.t * 3)) * 6; g.fillStyle = '#e6fbff'; g.strokeStyle = '#000'; g.lineWidth = 2; g.fillRect(p.x - 7, y - 12, 14, 22); g.strokeRect(p.x - 7, y - 12, 14, 22); g.fillStyle = '#2a6a80'; g.fillRect(p.x - 7, y - 4, 14, 5); });
      s.waves.forEach(w => { g.fillStyle = '#8a7860'; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.moveTo(w.x - 26, G); g.quadraticCurveTo(w.x - 10, G - w.h * 1.3, w.x, G - w.h); g.quadraticCurveTo(w.x + 14, G - w.h * 0.6, w.x + 30, G); g.closePath(); g.fill(); g.stroke(); });
      drawClay(g, s.c, s.t);
      drawRobin(g, s.r, s.t);
      s.c.st === 'sweepT' || s.c.st === 'slamT' || s.c.st === 'throwT' ? warn() : 0;
      s.blobs.forEach(b => { g.fillStyle = '#7a6850'; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.arc(b.x, b.y, 13, 0, Math.PI * 2); g.fill(); g.stroke(); });
      s.shots.forEach(b => {
        g.save(); g.translate(b.x, b.y); g.rotate(b.a);
        if (b.k === 'bat') { g.fillStyle = '#000'; g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-14, 0); g.lineTo(-6, -5); g.lineTo(0, -2); g.lineTo(6, -5); g.lineTo(14, 0); g.lineTo(6, 4); g.lineTo(0, 1); g.lineTo(-6, 4); g.closePath(); g.fill(); g.stroke(); }
        else { g.fillStyle = '#e6fbff'; g.strokeStyle = '#000'; g.lineWidth = 2; g.fillRect(-6, -10, 12, 20); g.strokeRect(-6, -10, 12, 20); g.fillStyle = '#2a6a80'; g.fillRect(-6, -2, 12, 4); }
        g.restore();
      });
      s.parts.forEach(p => { g.globalAlpha = Math.max(0, p.life); g.fillStyle = p.col; g.fillRect(p.x, p.y, p.r, p.r); });
      g.globalAlpha = 1;
      if (s.c.hard > 0) { g.fillStyle = '#e6fbff'; g.font = '13px "Russo One", Arial Black, sans-serif'; g.textAlign = 'center'; g.fillText('ОТВЕРДЕЛ! БЕЙ ШЕСТОМ', s.c.x, G - 236); }
      if (s.c.st === 'stuck') { g.fillStyle = YEL; g.font = '13px "Russo One", Arial Black, sans-serif'; g.textAlign = 'center'; g.fillText('ЗАСТРЯЛ — БЕЙ!', s.c.x, G - 236); }
    }
    function warn() {
      const c = s.c, txt = { slamT: '↑ ПРЫГАЙ', sweepT: '↓ ПРИГНИСЬ', throwT: '← → УХОДИ' }[c.st];
      g.fillStyle = RED; g.font = '16px "Russo One", Arial Black, sans-serif'; g.textAlign = 'center';
      if (Math.floor(s.t * 8) % 2) g.fillText(txt, c.x - 40, G - 250);
    }
    function frame(ts) {
      if (!playing) return;
      const dt = Math.min(0.033, (ts - (last || ts)) / 1000); last = ts;
      update(dt); if (s) draw();
      raf = requestAnimationFrame(frame);
    }
    function run() { playing = true; last = 0; msg.hidden = true; raf = requestAnimationFrame(frame); }
    function stop() { playing = false; cancelAnimationFrame(raf); }
    function show(html, buttons) {
      msg.innerHTML = `<div class="fg-card">${html}<div class="fg-btns"></div></div>`;
      const box = msg.querySelector('.fg-btns');
      buttons.forEach(([label, fn, cls]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (cls ? ' ' + cls : ''); b.textContent = label; b.onclick = fn; box.appendChild(b); });
      msg.hidden = false;
      const f = box.querySelector('button'); if (f && window.innerWidth > 900) f.focus();
    }
    function win() {
      if (ended) return;
      ended = true; s.c.st = 'stuck'; sfx('ok');
      let k = 0;
      const crumble = setInterval(() => { burst(s.c.x + (Math.random() - 0.5) * 140, G - Math.random() * 200, '#9c9c98', 10, 240); s.c.hp = 0; k++; if (k > 12) { clearInterval(crumble); stop(); draw(); show('<h3>ГЛИНОЛИКИЙ ПОВЕРЖЕН</h3><p>Застывшая глина трескается и осыпается на пол лаборатории грудой серых осколков.</p>', [['ДАЛЬШЕ →', () => { cleanup(); o.onWin && o.onWin({ help: false }); }]]); } }, 110);
    }
    function lose() {
      ended = true; losses++;
      setTimeout(() => {
        stop();
        const b = [['ЕЩЁ РАЗ', () => { ended = false; reset(); run(); }]];
        if (losses >= 3) b.push(['ПОЗВАТЬ БЭТМЕНА', () => { cleanup(); o.onWin && o.onWin({ help: true }); }, 'ghost']);
        show(`<h3>РОБИН РАНЕН</h3><p>${losses >= 2 ? 'Глиноликий тоже устал: в следующей попытке у него меньше сил, а у тебя больше.' : 'Следи за подсказками над ним: красная надпись показывает, как увернуться.'}</p><p class="dim">Отвердитель делает глину хрупкой — тогда шест бьёт втрое сильнее. А после удара об пол он застревает: самое время бить.</p>`, b);
      }, 500);
    }
    // --- управление ---
    const KEY = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'jump', KeyW: 'jump', Space: 'jump', ArrowDown: 'duck', KeyS: 'duck', KeyZ: 'staff', KeyJ: 'staff', KeyX: 'bat', KeyK: 'bat', KeyC: 'cap', KeyL: 'cap' };
    const down = e => { const k = KEY[e.code]; if (!k || !playing) return; e.preventDefault(); if (k in held) held[k] = true; else if (!e.repeat) press[k] = true; };
    const up = e => { const k = KEY[e.code]; if (!k) return; if (k in held) held[k] = false; };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    root.querySelectorAll('.fg-pad button').forEach(b => {
      const k = b.dataset.k;
      const on = e => { e.preventDefault(); if (k in held) held[k] = true; else press[k] = true; b.classList.add('on'); };
      const off = e => { e.preventDefault(); if (k in held) held[k] = false; b.classList.remove('on'); };
      b.addEventListener('pointerdown', on); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, off));
      b.addEventListener('contextmenu', e => e.preventDefault());
    });
    const vis = () => { if (document.hidden && playing) { stop(); show('<h3>ПАУЗА</h3>', [['ПРОДОЛЖИТЬ', run]]); } };
    document.addEventListener('visibilitychange', vis);
    function cleanup() { stop(); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); document.removeEventListener('visibilitychange', vis); }

    reset(); draw();
    show(`<h3>${o.title || 'ГЛИНОЛИКИЙ'}</h3><p>${o.intro || ''}</p>
      <ul class="fg-help"><li><b>Шест</b> — главный удар вблизи.</li><li><b>Бэтаранг</b> — слабый, но сбивает замах.</li><li><b>Отвердитель</b> — делает глину хрупкой на несколько секунд: тогда шест бьёт втрое сильнее. Капсул мало, новые иногда падают с полок.</li>
      <li>Красная надпись над ним подсказывает, как увернуться: <b>прыгай</b> от удара по полу, <b>пригнись</b> от размаха рукой, <b>уходи</b> от летящей глины.</li></ul>`, [['В БОЙ', run]]);
    const api = { stop: cleanup, win: () => { if (!playing) run(); win(); }, state: () => s };
    window.__fight = api;
    return api;
  }

  window.Fight = { start };
})();
