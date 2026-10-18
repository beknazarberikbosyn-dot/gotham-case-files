/* Бой с Омегой: Робин против двухметрового «идеального человека» Стренджа в зале испытаний.
   Омега ловит бэтаранги и блокирует удары, пока не откроется; его атаки не сбиваются — от них нужно уходить.
   Окно для удара: после серии, после подсечки, после приземления, после удара о стену и после вспышки.
   Omega.start(root, { diff, capsules, title, intro, cfg, onWin }) */
(function () {
  const W = 800, H = 420, G = 362, GRAV = 1500;
  const RED = '#d0142c', YEL = '#ffd400', TEAL = '#3fe0c5', SUIT = '#2b3138', SUITD = '#1d2227', PLATE = '#4a5662', SKIN = '#d9b79a';
  const VULN = ['recover', 'land', 'wall', 'blind'];
  const ATTACK = ['comboT', 'combo', 'kickT', 'kick', 'dashT', 'dash', 'leapT', 'leap', 'jabT', 'jab', 'throwT'];

  /* ---------- зал испытаний ---------- */
  function background() {
    const b = document.createElement('canvas'); b.width = W; b.height = H;
    const g = b.getContext('2d');
    g.fillStyle = '#0c0f12'; g.fillRect(0, 0, W, H);
    // мягкие панели стен
    for (let x = 0; x < W; x += 50) { g.fillStyle = (x / 50) % 2 ? '#12171c' : '#10141a'; g.fillRect(x, 0, 50, G); g.strokeStyle = '#1b222a'; g.lineWidth = 2; g.strokeRect(x + 1, 180, 48, G - 180); for (let y = 196; y < G; y += 28) { g.fillStyle = '#1a2129'; g.fillRect(x + 10, y, 30, 3); } }
    g.fillStyle = '#0a0d10'; g.fillRect(0, 0, W, 24);
    // ферма и прожекторы
    g.strokeStyle = '#2a323a'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 24); g.lineTo(W, 24); g.stroke();
    [120, 680].forEach(x => {
      g.fillStyle = '#1a1a1a'; g.fillRect(x - 14, 24, 28, 18); g.fillStyle = '#e8fff8'; g.fillRect(x - 10, 40, 20, 4);
      const gr = g.createLinearGradient(0, 44, 0, G); gr.addColorStop(0, 'rgba(220,255,245,.16)'); gr.addColorStop(1, 'rgba(220,255,245,0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(x - 10, 44); g.lineTo(x + 10, 44); g.lineTo(x + 130, G); g.lineTo(x - 130, G); g.closePath(); g.fill();
    });
    // турели опущены
    [40, 760].forEach(x => { g.fillStyle = '#222'; g.fillRect(x - 16, 24, 32, 14); g.save(); g.translate(x, 38); g.rotate(x < 400 ? 0.9 : -0.9); g.fillStyle = '#333'; g.fillRect(-4, 0, 8, 26); g.restore(); });
    // окно наблюдения и монитор Стренджа
    g.fillStyle = '#05080a'; g.fillRect(270, 34, 260, 150); g.strokeStyle = '#cfd8e0'; g.lineWidth = 4; g.strokeRect(270, 34, 260, 150);
    g.fillStyle = 'rgba(160,200,220,.06)'; g.beginPath(); g.moveTo(274, 38); g.lineTo(340, 38); g.lineTo(280, 180); g.lineTo(274, 180); g.closePath(); g.fill();
    g.fillStyle = '#111'; g.fillRect(320, 46, 160, 96); g.strokeStyle = '#888'; g.lineWidth = 2; g.strokeRect(320, 46, 160, 96);
    g.fillStyle = '#ece6d6'; g.fillRect(326, 52, 148, 84);
    // клякса Роршаха (симметричная)
    let seed = 17; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    g.fillStyle = '#140d0d';
    for (let i = 0; i < 16; i++) { const dx = 4 + rnd() * 42, y = 60 + rnd() * 68, rx = 3 + rnd() * 11, ry = 3 + rnd() * 8; [400 - dx, 400 + dx].forEach(x => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); }); }
    g.beginPath(); g.ellipse(400, 92, 5, 26, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = RED; g.beginPath(); g.arc(470, 58, 3, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#cfd8e0'; g.font = '9px monospace'; g.textAlign = 'center'; g.fillText('Д-Р Х. СТРЕНДЖ · НАБЛЮДЕНИЕ', 400, 160);
    // знак Ω на стене
    g.fillStyle = 'rgba(63,224,197,.14)'; g.font = '70px "Russo One", Arial Black, sans-serif'; g.fillText('Ω', 160, 150); g.fillText('Ω', 640, 150);
    // стойка с гирями и сенсор на треноге
    g.strokeStyle = '#555'; g.lineWidth = 4; g.beginPath(); g.moveTo(40, G); g.lineTo(40, 270); g.moveTo(90, G); g.lineTo(90, 270); g.moveTo(36, 300); g.lineTo(94, 300); g.moveTo(36, 336); g.lineTo(94, 336); g.stroke();
    [52, 78].forEach(x => { g.fillStyle = '#2a2a2a'; g.beginPath(); g.arc(x, 292, 8, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(x, 328, 8, 0, Math.PI * 2); g.fill(); });
    g.strokeStyle = '#777'; g.lineWidth = 2; g.beginPath(); g.moveTo(740, G); g.lineTo(752, 290); g.lineTo(764, G); g.moveTo(752, 290); g.lineTo(752, 276); g.stroke();
    g.fillStyle = '#222'; g.fillRect(742, 262, 22, 14); g.fillStyle = TEAL; g.fillRect(746, 266, 6, 6);
    // пол: маты с разметкой
    g.fillStyle = '#121518'; g.fillRect(0, G, W, H - G);
    g.strokeStyle = '#cfd8e0'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, G); g.lineTo(W, G); g.stroke();
    g.strokeStyle = '#1e2329'; g.lineWidth = 2; for (let i = 0; i < 10; i++) { g.beginPath(); g.moveTo(i * 90, G); g.lineTo(i * 90 - 50, H); g.stroke(); }
    g.strokeStyle = 'rgba(208,20,44,.45)'; g.lineWidth = 3; g.beginPath(); g.moveTo(60, G + 22); g.lineTo(740, G + 22); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.03)'; for (let y = 0; y < H; y += 7) for (let x = (y / 7) % 2 ? 3 : 0; x < W; x += 7) g.fillRect(x, y, 1.5, 1.5);
    return b;
  }

  /* ---------- позы Омеги (смотрит вправо, ноги на нуле) ---------- */
  const POSES = {
    idle: t => { const b = Math.sin(t * 4) * 1.5; return { hip: [0, -96 + b], sh: [6, -160 + b], head: [9, -182 + b], fE: [30, -136 + b], fH: [36, -162 + b], bE: [0, -130 + b], bH: [18, -156 + b], fK: [18, -50], fF: [28, 0], bK: [-14, -48], bF: [-28, 0] }; },
    walk: t => { const p = Math.sin(t * 10), q = Math.cos(t * 10); return { hip: [0, -97 + Math.abs(q) * 2], sh: [8, -161], head: [11, -183], fE: [28, -136], fH: [34, -160], bE: [0, -130], bH: [16, -154], fK: [10 + p * 12, -50], fF: [14 + p * 24, -Math.max(0, p) * 10], bK: [-6 - p * 12, -50], bF: [-12 - p * 24, -Math.max(0, -p) * 10] }; },
    comboT: () => ({ hip: [-4, -94], sh: [-8, -158], head: [-6, -179], fE: [-8, -132], fH: [-26, -148], bE: [8, -140], bH: [10, -162], fK: [16, -50], fF: [26, 0], bK: [-18, -48], bF: [-32, 0] }),
    punchF: () => ({ hip: [4, -95], sh: [16, -158], head: [20, -179], fE: [50, -154], fH: [86, -156], bE: [4, -132], bH: [20, -152], fK: [22, -50], fF: [32, 0], bK: [-14, -48], bF: [-30, 0] }),
    punchB: () => ({ hip: [4, -95], sh: [16, -158], head: [20, -179], fE: [20, -134], fH: [30, -156], bE: [50, -150], bH: [84, -150], fK: [22, -50], fF: [32, 0], bK: [-14, -48], bF: [-30, 0] }),
    kickT: () => ({ hip: [-6, -82], sh: [-14, -146], head: [-16, -167], fE: [10, -124], fH: [22, -146], bE: [-18, -120], bH: [-6, -140], fK: [12, -66], fF: [-6, -40], bK: [-16, -40], bF: [-24, 0] }),
    kick: () => ({ hip: [-10, -78], sh: [-34, -138], head: [-40, -158], fE: [-6, -118], fH: [10, -138], bE: [-50, -116], bH: [-62, -100], fK: [44, -38], fF: [100, -24], bK: [-16, -40], bF: [-22, 0] }),
    dashT: () => ({ hip: [0, -78], sh: [20, -136], head: [28, -154], fE: [-6, -116], fH: [-28, -104], bE: [-4, -118], bH: [-22, -100], fK: [24, -40], fF: [22, 0], bK: [-20, -38], bF: [-36, 0] }),
    dash: t => { const p = Math.sin(t * 18); return { hip: [0, -66], sh: [40, -104], head: [58, -110], fE: [56, -86], fH: [74, -70], bE: [20, -84], bH: [10, -66], fK: [16 + p * 18, -34], fF: [24 + p * 30, -Math.max(0, p) * 8], bK: [-10 - p * 18, -34], bF: [-28 - p * 30, -Math.max(0, -p) * 8] }; },
    leapT: () => ({ hip: [0, -58], sh: [10, -120], head: [14, -142], fE: [-12, -90], fH: [-30, -70], bE: [-8, -92], bH: [-24, -72], fK: [24, -30], fF: [20, 0], bK: [-18, -28], bF: [-26, 0] }),
    leap: () => ({ hip: [0, -96], sh: [6, -152], head: [10, -174], fE: [22, -178], fH: [30, -198], bE: [-4, -176], bH: [6, -198], fK: [26, -112], fF: [10, -80], bK: [8, -104], bF: [-8, -76] }),
    land: () => ({ hip: [0, -50], sh: [16, -112], head: [22, -134], fE: [40, -72], fH: [46, -10], bE: [0, -84], bH: [10, -62], fK: [28, -40], fF: [40, 0], bK: [-12, -6], bF: [-42, 0] }),
    recover: t => { const b = Math.sin(t * 6) * 2; return { hip: [0, -88], sh: [20, -144 + b], head: [30, -158 + b], fE: [30, -110], fH: [24, -72], bE: [14, -108], bH: [8, -70], fK: [22, -46], fF: [30, 0], bK: [-16, -46], bF: [-28, 0] }; },
    blind: t => { const w = Math.sin(t * 9) * 5; return { hip: [-4 + w, -92], sh: [-8 + w, -156], head: [-6 + w, -176], fE: [16 + w, -150], fH: [6 + w, -176], bE: [-20 + w, -148], bH: [-4 + w, -178], fK: [14, -48], fF: [26, 0], bK: [-20, -46], bF: [-32, 0] }; },
    wall: () => ({ hip: [0, -30], sh: [-8, -92], head: [-6, -112], fE: [10, -60], fH: [18, -30], bE: [-16, -60], bH: [-12, -28], fK: [30, -24], fF: [56, 0], bK: [20, -30], bF: [46, 0] }),
    block: () => ({ hip: [-2, -95], sh: [2, -159], head: [4, -180], fE: [28, -142], fH: [16, -172], bE: [24, -150], bH: [36, -168], fK: [18, -50], fF: [28, 0], bK: [-16, -48], bF: [-30, 0] }),
    throwT: () => ({ hip: [-2, -95], sh: [-4, -159], head: [-2, -180], fE: [-14, -176], fH: [-28, -198], bE: [20, -140], bH: [32, -150], fK: [18, -50], fF: [28, 0], bK: [-16, -48], bF: [-30, 0] }),
    down: () => ({ hip: [0, -46], sh: [10, -104], head: [18, -122], fE: [26, -70], fH: [30, -20], bE: [0, -74], bH: [4, -30], fK: [30, -36], fF: [44, 0], bK: [-8, -4], bF: [-40, 0] })
  };
  POSES.jabT = POSES.comboT; POSES.jab = POSES.punchF;
  const lerpPose = (cur, tgt, k) => { for (const j in tgt) { if (!cur[j]) { cur[j] = tgt[j].slice(); continue; } cur[j][0] += (tgt[j][0] - cur[j][0]) * k; cur[j][1] += (tgt[j][1] - cur[j][1]) * k; } };

  function seg(g, a, b, w, col) {
    g.lineCap = 'round';
    g.strokeStyle = '#000'; g.lineWidth = w + 5; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  }
  function seam(g, a, b) { g.strokeStyle = TEAL; g.lineWidth = 1.4; g.globalAlpha = 0.85; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.globalAlpha = 1; }
  function plate(g, a, b, w) { const mx = a[0] + (b[0] - a[0]) * 0.55, my = a[1] + (b[1] - a[1]) * 0.55; g.strokeStyle = PLATE; g.lineWidth = w; g.lineCap = 'butt'; g.beginPath(); g.moveTo(a[0] + (b[0] - a[0]) * 0.2, a[1] + (b[1] - a[1]) * 0.2); g.lineTo(mx, my); g.stroke(); g.lineCap = 'round'; }
  function arm(g, sh, e, h, dark) {
    const col = dark ? SUITD : SUIT;
    seg(g, sh, e, 19, col); seg(g, e, h, 15, col);
    plate(g, e, h, 11); seam(g, sh, e);
    g.fillStyle = '#000'; g.beginPath(); g.arc(h[0], h[1], 9, 0, Math.PI * 2); g.fill();
    g.fillStyle = dark ? '#262b30' : '#363e46'; g.beginPath(); g.arc(h[0], h[1], 7, 0, Math.PI * 2); g.fill();
    g.fillStyle = TEAL; g.fillRect(h[0] - 3, h[1] - 1, 6, 2);
    g.fillStyle = TEAL; g.beginPath(); g.arc(e[0], e[1], 2.4, 0, Math.PI * 2); g.fill();
  }
  function leg(g, hip, k, f, dark) {
    const col = dark ? SUITD : SUIT;
    seg(g, hip, k, 24, col); seg(g, k, f, 18, col); plate(g, k, f, 13); seam(g, hip, k);
    g.fillStyle = PLATE; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.arc(k[0], k[1], 7, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = '#0d0f12'; g.beginPath(); g.moveTo(f[0] - 8, f[1] - 9); g.lineTo(f[0] + 16, f[1] - 6); g.lineTo(f[0] + 18, f[1] + 1); g.lineTo(f[0] - 9, f[1] + 1); g.closePath(); g.fill();
    g.strokeStyle = TEAL; g.lineWidth = 1.2; g.beginPath(); g.moveTo(f[0] - 6, f[1] - 2); g.lineTo(f[0] + 14, f[1] - 2); g.stroke();
  }
  function drawOmega(g, c, t) {
    const P = c.pose;
    g.save(); g.translate(c.x + (c.shake > 0 ? Math.sin(t * 90) * 3 : 0), c.y); g.scale(c.face, 1);
    g.fillStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.ellipse(0, G - c.y + 3, 46, 7, 0, 0, Math.PI * 2); g.fill();
    if (c.flash > 0) g.filter = 'brightness(2.2)';
    const shB = [P.sh[0] - 4, P.sh[1] + 4];
    arm(g, shB, P.bE, P.bH, true);
    leg(g, [P.hip[0] - 4, P.hip[1]], P.bK, P.bF, true);
    // туловище по оси позвоночника
    const dx = P.sh[0] - P.hip[0], dy = P.sh[1] - P.hip[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    const pt = (o, k, d) => [o[0] + nx * k + dx / L * d, o[1] + ny * k + dy / L * d];
    const tor = [pt(P.sh, 34, 6), pt(P.sh, -28, 6), pt(P.sh, -24, -34), pt(P.hip, -17, 0), pt(P.hip, 19, 0), pt(P.sh, 32, -34)];
    g.fillStyle = SUIT; g.strokeStyle = '#000'; g.lineWidth = 3; g.beginPath(); tor.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); g.stroke();
    // грудная пластина и Ω
    const cp = [pt(P.sh, 30, -4), pt(P.sh, -12, -4), pt(P.sh, -10, -38), pt(P.sh, 28, -40)];
    g.fillStyle = PLATE; g.beginPath(); cp.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
    const ch = pt(P.sh, 9, -24);
    g.save(); g.translate(ch[0], ch[1]); g.rotate(Math.atan2(dy, dx) + Math.PI / 2); g.fillStyle = TEAL; g.shadowColor = TEAL; g.shadowBlur = 8; g.font = '15px "Russo One", Arial Black, sans-serif'; g.textAlign = 'center'; g.fillText('Ω', 0, 5); g.restore(); g.shadowBlur = 0;
    // пресс и пояс
    g.strokeStyle = '#1a1f24'; g.lineWidth = 1.5; for (let k = 0; k < 3; k++) { const a = pt(P.hip, -6, 14 + k * 9), b = pt(P.hip, 10, 14 + k * 9); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    const b1 = pt(P.hip, -14, 4), b2 = pt(P.hip, 16, 4); g.strokeStyle = '#111'; g.lineWidth = 7; g.beginPath(); g.moveTo(b1[0], b1[1]); g.lineTo(b2[0], b2[1]); g.stroke();
    g.strokeStyle = TEAL; g.lineWidth = 1.5; g.beginPath(); g.moveTo(b1[0], b1[1]); g.lineTo(b2[0], b2[1]); g.stroke();
    // позвоночный модуль светится со спины
    g.fillStyle = TEAL; g.shadowColor = TEAL; g.shadowBlur = 10;
    for (let k = 0; k < 4; k++) { const p = [P.sh[0] + (P.hip[0] - P.sh[0]) * (0.1 + k * 0.22) + nx * -18, P.sh[1] + (P.hip[1] - P.sh[1]) * (0.1 + k * 0.22) + ny * -18]; g.beginPath(); g.arc(p[0], p[1], 3, 0, Math.PI * 2); g.fill(); }
    g.shadowBlur = 0;
    // наплечник
    const sp = pt(P.sh, 6, 2); g.fillStyle = PLATE; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.ellipse(sp[0], sp[1], 19, 12, Math.atan2(dy, dx) + Math.PI / 2, 0, Math.PI * 2); g.fill(); g.stroke();
    leg(g, [P.hip[0] + 4, P.hip[1]], P.fK, P.fF, false);
    // шея и голова
    seg(g, pt(P.sh, 4, 2), P.head, 11, SUITD);
    g.save(); g.translate(P.head[0], P.head[1]); g.rotate((Math.atan2(dy, dx) + Math.PI / 2) * 0.5);
    g.fillStyle = SKIN; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(14, -1); g.lineTo(13, 9); g.lineTo(5, 14); g.lineTo(-4, 10); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = '#8a6a50'; g.lineWidth = 1; g.beginPath(); g.moveTo(6, 6); g.lineTo(12, 6); g.stroke();
    g.fillStyle = SUIT; g.beginPath(); g.moveTo(-12, 6); g.quadraticCurveTo(-16, -14, 0, -16); g.quadraticCurveTo(15, -15, 16, -4); g.lineTo(16, 0); g.lineTo(-2, 2); g.lineTo(-6, 10); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = PLATE; g.beginPath(); g.moveTo(-6, -15); g.lineTo(-26, -24); g.lineTo(-12, -8); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-10, -6); g.lineTo(-28, -10); g.lineTo(-12, 0); g.closePath(); g.fill(); g.stroke();
    const vis = c.st === 'blind' ? (Math.floor(t * 20) % 2 ? '#fff' : TEAL) : c.st === 'down' || c.st === 'wall' ? '#2a6a60' : TEAL;
    g.fillStyle = vis; g.shadowColor = TEAL; g.shadowBlur = c.st === 'down' ? 0 : 10; g.fillRect(0, -9, 17, 6); g.shadowBlur = 0;
    g.fillStyle = '#062a26'; [3, 8, 13].forEach(x => { g.beginPath(); g.arc(x, -6, 1.6, 0, Math.PI * 2); g.fill(); });
    g.strokeStyle = TEAL; g.lineWidth = 1.5; g.beginPath(); g.arc(-4, -3, 4, 0, Math.PI * 2); g.stroke();
    if (c.st === 'down') { g.strokeStyle = '#fff'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(4, -9); g.lineTo(8, -4); g.lineTo(6, -3); g.stroke(); }
    g.restore();
    arm(g, pt(P.sh, 6, 0), P.fE, P.fH, false);
    if (c.catchT > 0) { g.fillStyle = '#000'; g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.save(); g.translate(P.fH[0], P.fH[1] - 4); g.beginPath(); g.moveTo(-12, 0); g.lineTo(-5, -4); g.lineTo(0, -1); g.lineTo(5, -4); g.lineTo(12, 0); g.lineTo(5, 3); g.lineTo(0, 1); g.lineTo(-5, 3); g.closePath(); g.fill(); g.stroke(); g.restore(); }
    g.filter = 'none';
    g.restore();
  }

  const SAY = {
    start: ['«Наблюдение начато. Объект Ω против мальчика без суперсил. Ваши ставки, юноша?»'],
    robinHit: ['«Типичная ошибка: смотреть на руки, а не на плечи».', '«Минус одно ребро? Записываю».', '«Он слышит, как вы дышите перед прыжком. Дышите тише».', '«Больно? Это данные. Продолжайте».'],
    omegaHit: ['«Любопытно. Мальчик бьёт туда, где Омега только что ошибся».', '«Омега, не замирай после серии. Мы это обсуждали».', '«Мальчик учится быстрее образца. Неприятно».'],
    caught: ['«Бросать в него бэтаранги — всё равно что кидать в меня диагнозом. Он всё слышит».', '«Он поймает и сотый. Вопрос — когда вы это поймёте».'],
    block: ['«Блок. Бить в закрытую стойку — это не смелость, это статистика».'],
    blind: ['«Вспышка? Его датчики видят в двадцать раз лучше, юноша. И болят в двадцать раз сильнее».'],
    wall: ['«Омега, стена — не враг. Враг маленький и красный».'],
    phase2: ['«Половина ресурса. Хватит играть, Омега. Покажи ему, зачем я тебя создал».'],
    low: ['«Нет… нет-нет. Встань. Ты лучше него. Ты лучше их всех».']
  };

  function start(root, o) {
    o = o || {};
    const cfg = o.cfg || {};
    const P = { easy: { hp: 7, boss: 100, sp: 0.8 }, medium: { hp: 6, boss: 130, sp: 1 }, hard: { hp: 5, boss: 160, sp: 1.15 } }[o.diff] || { hp: 6, boss: 130, sp: 1 };
    let losses = 0, s = null, raf = 0, last = 0, playing = false, ended = false;
    root.innerHTML = `<div class="fg-wrap">
      <div class="fg-top"><div class="fg-hp" aria-label="Здоровье Робина"></div><div class="fg-boss omega"><span>ОМЕГА</span><i><b></b></i></div></div>
      <div class="fg-stage"><canvas width="${W}" height="${H}" aria-label="Бой Робина с Омегой"></canvas><div class="fg-msg"></div></div>
      <div class="fg-pad">
        <div class="fg-move"><button data-k="left" aria-label="Влево">◀</button><button data-k="jump" aria-label="Прыжок">▲</button><button data-k="duck" aria-label="Присесть">▼</button><button data-k="right" aria-label="Вправо">▶</button></div>
        <div class="fg-act"><button data-k="staff">ШЕСТ <small>Z</small></button><button data-k="bat">БЭТАРАНГ <small>X</small></button><button data-k="cap">ВСПЫШКА <small>C</small> <b class="fg-caps"></b></button></div>
      </div>
      <p class="fg-rotate">↻ Поверни телефон горизонтально — так удобнее драться</p>
      <p class="fg-keys">← → идти · ↑ прыжок · ↓ присесть · Z шест · X бэтаранг · C светошумовая капсула</p></div>`;
    const cv = root.querySelector('canvas'), g = cv.getContext('2d'), msg = root.querySelector('.fg-msg');
    const hpEl = root.querySelector('.fg-hp'), bossEl = root.querySelector('.fg-boss b'), capsEl = root.querySelector('.fg-caps');
    const bg = background();
    const held = { left: false, right: false, duck: false };
    const press = { jump: false, staff: false, bat: false, cap: false };
    const sfx = n => { if (window.Sound) Sound.sfx(n); };
    const calm = () => document.body.classList.contains('calm');
    const pick = a => a[Math.floor(Math.random() * a.length)];

    function reset() {
      const easier = losses >= 2;
      const max = P.boss * (easier ? 0.75 : 1);
      s = {
        t: 0, shakeT: 0, say: null, said: {}, flashFx: [],
        r: { x: 140, y: G, vy: 0, vx: 0, ground: true, face: 1, hp: P.hp + (easier ? 2 : 0), inv: 0, atk: 0, cd: 0, rcd: 0, ccd: 0, duck: false, run: 0 },
        c: { x: 620, y: G, vy: 0, face: -1, hp: max, max, st: 'idle', t: 1.6, tMax: 1.6, flash: 0, shake: 0, caught: 0, caughtT: 0, catchT: 0, pose: {}, x0: 0, tx: 0, hits: 0, phase: 1, chain: 0 },
        caps: o.capsules || 3, shots: [], bats: [], waves: [], picks: [], parts: [], pickT: 10, tags: []
      };
      lerpPose(s.c.pose, POSES.idle(0), 1);
      hud(); comment('start');
    }
    function hud() {
      hpEl.innerHTML = Array.from({ length: Math.max(s.r.hp, 0) }, () => '<i>♥</i>').join('') || '<em>—</em>';
      bossEl.style.width = Math.max(0, s.c.hp / s.c.max * 100) + '%';
      capsEl.textContent = '×' + s.caps;
      root.querySelector('[data-k="cap"]').disabled = s.caps <= 0;
    }
    function comment(k, force) {
      const lines = (cfg.say && cfg.say[k]) || SAY[k]; if (!lines) return;
      if (!force && s.say && s.say.t > 2.2) return;
      s.say = { text: pick(lines), t: 4.5 };
    }
    const burst = (x, y, col, n, sp) => { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = (sp || 200) * (0.4 + Math.random()); s.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, life: 0.6 + Math.random() * 0.4, col, r: 2 + Math.random() * 4 }); } };
    const shake = d => { if (!calm()) s.shakeT = Math.max(s.shakeT, d); };
    const tag = (txt, x, y, col) => s.tags.push({ txt, x, y, col: col || '#fff', life: 0.9 });

    function hurtRobin(why) {
      const r = s.r;
      if (r.inv > 0 || ended) return;
      (s.log = s.log || []).push(why + '@' + s.c.st);
      r.hp -= 1; r.inv = 1.2; r.vx = (r.x < s.c.x ? -1 : 1) * 280; sfx('punch'); shake(0.25);
      burst(r.x, r.y - 50, RED, 10, 160); hud();
      if (Math.random() < 0.6) comment('robinHit');
      if (r.hp <= 0) lose();
    }
    function hitOmega(dmg, x, y) {
      const c = s.c;
      if (c.hp <= 0 || ended) return;
      c.hp -= dmg; c.flash = 0.1; c.hits++; burst(x, y, TEAL, 7, 220); sfx('clunk'); hud();
      if (c.hits % 3 === 1) comment('omegaHit');
      if (c.phase === 1 && c.hp < c.max * 0.5) { c.phase = 2; comment('phase2', true); }
      if (c.hp < c.max * 0.18 && !s.said.low) { s.said.low = 1; comment('low', true); }
      if (c.hp <= 0) win();
    }
    const vuln = () => VULN.includes(s.c.st);
    const spd = () => P.sp * (s.c.phase === 2 ? 1.15 : 1);
    function setSt(st, t) { const c = s.c; c.st = st; c.t = c.tMax = t; }
    function chooseAttack() {
      const c = s.c, r = s.r, d = Math.abs(c.x - r.x), roll = Math.random(), sp = spd();
      if (c.caught >= 2) { c.caught = 0; setSt('throwT', 0.5 / sp); return; }
      if (d < 175) { if (roll < 0.5) setSt('comboT', 0.6 / sp); else setSt('kickT', 0.55 / sp); }
      else if (roll < 0.45) setSt('dashT', 0.65 / sp);
      else if (roll < 0.85) { setSt('leapT', 0.55 / sp); c.tx = Math.max(70, Math.min(730, r.x)); c.x0 = c.x; }
      else setSt('walkIn', 1.2);
    }
    function afterAttack(base) { const c = s.c, sp = spd(); setSt('recover', base * (c.phase === 2 ? 0.8 : 1) / Math.sqrt(sp)); }
    function toIdle(t) { setSt('idle', t / spd() * (s.c.phase === 2 ? 0.7 : 1)); }

    function update(dt) {
      s.t += dt;
      const r = s.r, c = s.c, sp = spd();
      // --- Робин ---
      r.duck = held.duck && r.ground;
      const dir = (held.right ? 1 : 0) - (held.left ? 1 : 0);
      if (dir) r.face = dir; else if (r.ground && r.atk <= 0) r.face = c.x > r.x ? 1 : -1;
      r.x += (dir * (r.duck ? 0 : 230) + r.vx) * dt; r.vx *= Math.pow(0.02, dt);
      if (dir && r.ground && !r.duck) r.run += dt; else r.run = 0;
      if (press.jump && r.ground && !r.duck) { r.vy = -580; r.ground = false; sfx('whoosh'); }
      r.vy += GRAV * dt; r.y += r.vy * dt;
      if (r.y >= G) { r.y = G; r.vy = 0; r.ground = true; }
      r.x = Math.max(24, Math.min(W - 24, r.x));
      // не проходить сквозь Омегу, пока он на земле и не в рывке
      if (c.y >= G - 1 && c.st !== 'dash' && c.st !== 'down' && r.y > G - 150 && Math.abs(r.x - c.x) < 46) r.x = c.x + (r.x < c.x ? -46 : 46);
      r.inv = Math.max(0, r.inv - dt); r.cd -= dt; r.rcd -= dt; r.ccd -= dt;
      if (r.atk > 0) {
        const before = r.atk; r.atk -= dt;
        const rel = (c.x - r.x) * r.face;
        if (before > 0.12 && r.atk <= 0.12 && rel > 0 && rel < 135 && r.y > c.y - 210) {
          if (vuln()) hitOmega(['blind', 'wall'].includes(c.st) ? 10 : 7, c.x - 30 * r.face, r.y - 70);
          else if (c.st === 'idle' || c.st === 'walkIn') { setSt('block', 0.22); sfx('clunk'); tag('БЛОК', c.x, c.y - 210, '#cfd8e0'); r.vx = -r.face * 200; comment('block'); }
          else { sfx('clunk'); tag('БЛОК', c.x, c.y - 210, '#cfd8e0'); burst(c.x - 20 * r.face, r.y - 70, '#cfd8e0', 4, 120); }
        }
      }
      if (press.staff && r.cd <= 0) { r.atk = 0.22; r.cd = 0.38; sfx('whoosh'); }
      if (press.bat && r.rcd <= 0) { s.shots.push({ k: 'bat', x: r.x + 24 * r.face, y: r.y - (r.duck ? 44 : 76), vx: 640 * r.face, vy: 0, a: 0 }); r.rcd = 0.6; sfx('click'); }
      if (press.cap && r.ccd <= 0 && s.caps > 0) { s.shots.push({ k: 'cap', x: r.x + 20 * r.face, y: r.y - 80, vx: 400 * r.face, vy: -330, a: 0 }); s.caps--; r.ccd = 0.6; hud(); sfx('click'); }
      press.jump = press.staff = press.bat = press.cap = false;
      // --- снаряды Робина ---
      const flashAt = (x, y) => {
        s.flashFx.push({ x, y, r: 10, life: 0.5 }); sfx('flash');
        if (Math.abs(x - c.x) < 135 && c.st !== 'leap' && c.st !== 'down') {
          if (c.st === 'dash') { setSt('wall', 1.8); c.shake = 0.3; comment('wall', true); }
          else { setSt('blind', 2.6); comment('blind', true); }
        }
      };
      s.shots = s.shots.filter(b => {
        b.x += b.vx * dt; b.a += dt * 20;
        if (b.k === 'cap') { b.vy += GRAV * 0.8 * dt; b.y += b.vy * dt; }
        const inO = Math.abs(b.x - c.x) < 30 && b.y > c.y - 200 && b.y < c.y + 4 && c.st !== 'down';
        if (inO) {
          if (b.k === 'bat') {
            if (vuln()) hitOmega(3, b.x, b.y);
            else { c.catchT = 0.4; c.caught++; c.caughtT = 5; sfx('click'); tag('ПОЙМАЛ', c.x, c.y - 210, '#cfd8e0'); if (c.caught === 2) comment('caught', true); }
          } else flashAt(b.x, b.y);
          return false;
        }
        if (b.k === 'cap' && b.y >= G) { flashAt(b.x, G - 10); return false; }
        return b.x > -20 && b.x < W + 20;
      });
      // --- подбор капсул ---
      s.pickT -= dt;
      if (s.pickT <= 0 && s.caps < 2 && !s.picks.length) { s.picks.push({ x: 60 + Math.random() * 680, t: 0 }); s.pickT = 10; }
      s.picks = s.picks.filter(p => { p.t += dt; if (Math.abs(p.x - r.x) < 26 && r.y > G - 40) { s.caps++; hud(); sfx('hint'); return false; } return true; });
      // --- Омега ---
      c.flash -= dt; c.shake = Math.max(0, c.shake - dt); c.catchT -= dt; c.caughtT -= dt; if (c.caughtT <= 0) c.caught = 0;
      c.t -= dt;
      const p = c.tMax ? 1 - c.t / c.tMax : 0;
      const faceR = () => { c.face = r.x < c.x ? -1 : 1; };
      const front = (lo, hi) => { const rel = (r.x - c.x) * c.face; return rel > lo && rel < hi; };
      let pose = 'idle';
      switch (c.st) {
        case 'idle': {
          faceR();
          const d = Math.abs(r.x - c.x);
          if (d > 230) { c.x += c.face * 120 * sp * dt; pose = 'walk'; }
          else if (d < 95) { c.x -= c.face * 90 * sp * dt; pose = 'walk'; }
          if (c.t <= 0) chooseAttack();
          break;
        }
        case 'walkIn': faceR(); pose = 'walk'; c.x += c.face * 170 * sp * dt; if (Math.abs(r.x - c.x) < 150 || c.t <= 0) { setSt(Math.random() < 0.5 ? 'comboT' : 'kickT', (c.st === 'kickT' ? 0.55 : 0.6) / sp); } break;
        case 'comboT': pose = 'comboT'; if (c.t <= 0) { setSt('combo', 0.6); c.hitMask = 0; sfx('whoosh'); } break;
        case 'combo': {
          const k = Math.min(2, Math.floor(p * 3)), mid = (p * 3) % 1;
          pose = k % 2 ? 'punchB' : 'punchF';
          c.x += c.face * 40 * dt;
          if (mid > 0.35 && !(c.hitMask & (1 << k))) { c.hitMask |= 1 << k; sfx('punch'); if (front(10, 128) && !r.duck && r.y > G - 175) hurtRobin('combo'); }
          if (c.t <= 0) afterAttack(0.95);
          break;
        }
        case 'kickT': pose = 'kickT'; if (c.t <= 0) { setSt('kick', 0.3); c.hitMask = 0; sfx('whoosh'); } break;
        case 'kick': pose = 'kick'; if (!c.hitMask && p > 0.3) { c.hitMask = 1; if (front(0, 152) && r.y > G - 38) hurtRobin('kick'); } if (c.t <= 0) afterAttack(0.85); break;
        case 'dashT': faceR(); pose = 'dashT'; if (c.t <= 0) { setSt('dash', 2); sfx('whoosh'); } break;
        case 'dash':
          pose = 'dash'; c.x += c.face * 640 * sp * dt;
          if (Math.abs(r.x - c.x) < 40 && r.y > G - 80 && r.inv <= 0) { hurtRobin('dash'); toIdle(0.7); }
          else if (c.x < 44 || c.x > W - 44) { c.x = Math.max(44, Math.min(W - 44, c.x)); setSt('wall', 1.6); c.shake = 0.35; shake(0.3); sfx('punch'); burst(c.x + c.face * 20, G - 110, '#cfd8e0', 14, 240); comment('wall'); }
          break;
        case 'leapT': pose = 'leapT'; faceR(); if (c.t <= 0) { setSt('leap', 0.8); c.x0 = c.x; sfx('whoosh'); } break;
        case 'leap': {
          pose = 'leap';
          c.x = c.x0 + (c.tx - c.x0) * p; c.y = G - Math.sin(p * Math.PI) * 175;
          if (c.t <= 0) {
            c.y = G; c.x = c.tx; shake(0.35); sfx('punch'); burst(c.x, G - 4, '#cfd8e0', 16, 220);
            if (Math.abs(r.x - c.x) < 66 && r.y > G - 70) hurtRobin('land');
            s.waves.push({ x: c.x - 40, vx: -360 * sp, h: 22 }, { x: c.x + 40, vx: 360 * sp, h: 22 });
            setSt('land', 1.25 / Math.sqrt(sp));
          }
          break;
        }
        case 'block': pose = 'block'; if (c.t <= 0) { faceR(); setSt('jabT', 0.32 / sp); } break;
        case 'jabT': pose = 'jabT'; if (c.t <= 0) { setSt('jab', 0.16); sfx('punch'); if (front(10, 118) && !r.duck && r.y > G - 175) hurtRobin('jab'); } break;
        case 'jab': pose = 'jab'; if (c.t <= 0) toIdle(0.7); break;
        case 'throwT': pose = 'throwT'; faceR(); if (c.t <= 0) {
          for (let k = 0; k < 2; k++) s.bats.push({ x: c.x + c.face * 30, y: G - 112, vx: c.face * 500 * sp, delay: k * 0.28, a: 0 });
          sfx('whoosh'); toIdle(0.9);
        } break;
        case 'recover': pose = 'recover'; if (c.t <= 0) toIdle(0.55); break;
        case 'land': pose = 'land'; if (c.t <= 0) toIdle(0.5); break;
        case 'wall': pose = 'wall'; if (c.t <= 0) toIdle(0.5); break;
        case 'blind': pose = 'blind'; if (c.t <= 0) toIdle(0.5); break;
        case 'down': pose = 'down'; break;
      }
      c.x = Math.max(40, Math.min(W - 40, c.x));
      lerpPose(c.pose, POSES[pose](s.t), Math.min(1, dt * (c.st === 'combo' || c.st === 'kick' || c.st === 'jab' ? 30 : 16)));
      // волны по полу
      s.waves = s.waves.filter(w => { w.x += w.vx * dt; if (Math.abs(w.x - r.x) < 22 && r.y > G - w.h) hurtRobin('wave'); return w.x > -40 && w.x < W + 40; });
      // бэтаранги, брошенные обратно
      s.bats = s.bats.filter(b => {
        if (b.delay > 0) { b.delay -= dt; return true; }
        b.x += b.vx * dt; b.a += dt * 22;
        if (Math.abs(b.x - r.x) < 20 && b.y > r.y - (r.duck ? 71 : 115) && b.y < r.y) { hurtRobin('bat'); return false; }
        return b.x > -20 && b.x < W + 20;
      });
      s.parts = s.parts.filter(q => { q.life -= dt; q.vy += 900 * dt; q.x += q.vx * dt; q.y += q.vy * dt; return q.life > 0; });
      s.flashFx = s.flashFx.filter(f => { f.life -= dt; f.r += 520 * dt; return f.life > 0; });
      s.tags = s.tags.filter(tg => { tg.life -= dt; tg.y -= 30 * dt; return tg.life > 0; });
      if (s.say) { s.say.t -= dt; if (s.say.t <= 0) s.say = null; }
      s.shakeT = Math.max(0, s.shakeT - dt);
    }

    function wrapText(txt, maxW) {
      const words = txt.split(' '), lines = []; let cur = '';
      words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
      if (cur) lines.push(cur); return lines;
    }
    function draw() {
      const sx = s.shakeT > 0 ? (Math.random() - 0.5) * 10 : 0, sy = s.shakeT > 0 ? (Math.random() - 0.5) * 8 : 0;
      g.setTransform(1, 0, 0, 1, sx, sy);
      g.drawImage(bg, 0, 0);
      // реплика Стренджа под монитором
      if (s.say) {
        g.font = '13px Arial, sans-serif'; const lines = wrapText(s.say.text, 480).slice(0, 2);
        const a = Math.min(1, s.say.t * 2); g.globalAlpha = a;
        g.fillStyle = 'rgba(0,0,0,.8)'; g.fillRect(150, 374, 500, 8 + lines.length * 16);
        g.fillStyle = '#ece6d6'; g.textAlign = 'center'; lines.forEach((l, i) => g.fillText(l, 400, 388 + i * 16));
        g.globalAlpha = 1;
      }
      s.picks.forEach(pk => { const y = G - 14 - Math.abs(Math.sin(pk.t * 3)) * 6; g.fillStyle = '#f4f0e6'; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.arc(pk.x, y - 4, 9, 0, Math.PI * 2); g.fill(); g.stroke(); g.fillStyle = YEL; g.fillRect(pk.x - 3, y - 7, 6, 6); });
      s.waves.forEach(w => { g.fillStyle = 'rgba(207,216,224,.85)'; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.moveTo(w.x - 24, G); g.quadraticCurveTo(w.x - 8, G - w.h * 1.3, w.x, G - w.h); g.quadraticCurveTo(w.x + 12, G - w.h * 0.6, w.x + 26, G); g.closePath(); g.fill(); g.stroke(); });
      if (s.c.st === 'leapT' || s.c.st === 'leap') { g.strokeStyle = RED; g.lineWidth = 3; g.setLineDash([6, 5]); g.beginPath(); g.ellipse(s.c.tx, G + 4, 60, 8, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); }
      drawOmega(g, s.c, s.t);
      Fight.drawRobin(g, s.r, s.t);
      warn();
      const batShape = () => { g.fillStyle = '#000'; g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-14, 0); g.lineTo(-6, -5); g.lineTo(0, -2); g.lineTo(6, -5); g.lineTo(14, 0); g.lineTo(6, 4); g.lineTo(0, 1); g.lineTo(-6, 4); g.closePath(); g.fill(); g.stroke(); };
      s.bats.forEach(b => { if (b.delay > 0) return; g.save(); g.translate(b.x, b.y); g.rotate(b.a); g.strokeStyle = RED; batShape(); g.restore(); });
      s.shots.forEach(b => {
        g.save(); g.translate(b.x, b.y); g.rotate(b.a);
        if (b.k === 'bat') batShape();
        else { g.fillStyle = '#f4f0e6'; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 8, 0, Math.PI * 2); g.fill(); g.stroke(); g.fillStyle = YEL; g.fillRect(-3, -3, 6, 6); }
        g.restore();
      });
      s.flashFx.forEach(f => { g.globalAlpha = Math.max(0, f.life * 1.6); const gr = g.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(f.x, f.y, f.r, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; });
      s.parts.forEach(q => { g.globalAlpha = Math.max(0, q.life); g.fillStyle = q.col; g.fillRect(q.x, q.y, q.r, q.r); });
      g.globalAlpha = 1;
      g.font = '13px "Russo One", Arial Black, sans-serif'; g.textAlign = 'center';
      s.tags.forEach(tg => { g.globalAlpha = Math.min(1, tg.life * 2); g.fillStyle = tg.col; g.fillText(tg.txt, tg.x, tg.y); }); g.globalAlpha = 1;
      const c = s.c, ty = c.y - 232;
      if (vuln()) label({ recover: 'ОТКРЫЛСЯ — БЕЙ!', land: 'ПРИЗЕМЛИЛСЯ — БЕЙ!', wall: 'ОГЛУШЁН — БЕЙ!', blind: 'ОСЛЕПЛЁН — БЕЙ!' }[c.st], c.x, c.y - 214, YEL, 14);
    }
    function label(txt, x, y, col, size) {
      g.font = (size || 14) + 'px "Russo One", Arial Black, sans-serif'; g.textAlign = 'center';
      const w = g.measureText(txt).width + 14; x = Math.max(w / 2 + 4, Math.min(W - w / 2 - 4, x));
      g.fillStyle = 'rgba(0,0,0,.75)'; g.fillRect(x - w / 2, y - (size || 14) - 2, w, (size || 14) + 9);
      g.fillStyle = col; g.fillText(txt, x, y);
    }
    function warn() {
      const c = s.c, txt = { comboT: '↓ ПРИГНИСЬ', jabT: '↓ ПРИГНИСЬ', throwT: '↓ ПРИГНИСЬ', kickT: '↑ ПРЫГАЙ', dashT: '↑ ПРЫГАЙ', leapT: '← → УХОДИ' }[c.st];
      if (!txt) return;
      if (Math.floor(s.t * 8) % 2) label(txt, c.x, c.y - 214, RED, 16);
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
      ended = true; setSt('down', 99); s.c.y = G; s.c.hp = 0; hud(); sfx('ok');
      s.say = { text: (cfg.say && cfg.say.end && cfg.say.end[0]) || '«…Запишем. Объект Ω: поражение. Причина: мальчик». Монитор гаснет.', t: 99 };
      let k = 0;
      const sparks = setInterval(() => { burst(s.c.x + (Math.random() - 0.5) * 40, G - 60 - Math.random() * 80, TEAL, 6, 180); k++; if (k > 14) { clearInterval(sparks); stop(); draw(); show(`<h3>${cfg.winTitle || 'ОМЕГА ПОВЕРЖЕН'}</h3><p>${cfg.winText || 'Омега опускается на колено. Швы костюма гаснут один за другим, визор трескается.'}</p>`, [['ДАЛЬШЕ →', () => { cleanup(); o.onWin && o.onWin({ help: false }); }]]); } }, 110);
    }
    function lose() {
      ended = true; losses++;
      setTimeout(() => {
        stop();
        const b = [['ЕЩЁ РАЗ', () => { ended = false; reset(); run(); }]];
        if (losses >= 3) b.push([cfg.assistLabel || 'ОРАКУЛ: ОТКЛЮЧИТЬ КОСТЮМ', () => { cleanup(); o.onWin && o.onWin({ help: true }); }, 'ghost']);
        show(`<h3>РОБИН РАНЕН</h3><p>${losses >= 2 ? 'Оракул взломала часть сенсоров костюма: в следующей попытке Омега слабее, а у тебя больше сил.' : 'Красная надпись над Омегой подсказывает, как уйти от удара. Бить нужно только тогда, когда загорится жёлтая.'}</p><p class="dim">Бэтаранги он ловит, а удар в стойку блокирует и отвечает. Вспышка ослепляет его сенсоры, а если он в рывке — он врежется в стену.</p>`, b);
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
    show(`<h3>${o.title || 'ОМЕГА'}</h3><p>${o.intro || ''}</p>
      <ul class="fg-help"><li><b>Омега блокирует и ловит.</b> Шест в стойку он отобьёт и ответит ударом, бэтаранги поймает — а поймав два, бросит обратно.</li>
      <li><b>Бей, когда над ним жёлтая надпись:</b> после серии ударов, после подсечки, после приземления, после удара о стену.</li>
      <li><b>Вспышка</b> ослепляет его сенсоры на пару секунд. Брось её, когда он несётся в рывке, — он врежется в стену.</li>
      <li><b>Красная надпись</b> — как уйти: <b>пригнись</b> от серии в голову, <b>прыгай</b> от подсечки и рывка, <b>уходи</b> от прыжка сверху.</li></ul>`, [['В БОЙ', run]]);
    const api = { stop: cleanup, win: () => { if (!playing) run(); win(); }, state: () => s, set: f => f(s) };
    window.__fight = api;
    return api;
  }

  window.Omega = { start, drawOmega, POSES };
})();
