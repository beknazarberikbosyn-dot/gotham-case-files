/* Пиксельные сцены: дорога Готэма, Бэт-пещера, пиксельный переход. Всё рисуется кодом. */
(function () {
  const W = 320, H = 180;

  function rng(seed) {
    return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  /* ---------- спрайты ---------- */
  const PAL = {
    K: '#07080d', G: '#565c6e', S: '#e2ab84', Y: '#f4c430', W: '#ffffff',
    H: '#15110f', M: '#0c3b22', R: '#c81e2b', N: '#1f8a4c', B: '#27345c'
  };
  const BATMAN = [
    '..K......K....',
    '..K......K....',
    '..KK....KK....',
    '..KKKKKKKK....',
    '..KKKKKKKK....',
    '..KWWKKWWK....',
    '..KKKKKKKK....',
    '..KSSSSSSK....',
    '...SSSSSS.....',
    '.KKGGGGGGKK...',
    'KKGGGKKGGGKK..',
    'KKGGKKKKGGKK..',
    'KKGGGKKGGGKK..',
    'KKGGGGGGGGKK..',
    'KK.YYYYYY.KK..',
    'KK.GGGGGG.KK..',
    'KK.GG..GG.KK..',
    'KK.GG..GG.KK..',
    'K..GG..GG..K..',
    '...KK..KK.....',
    '...KK..KK.....',
    '..KKK..KKK....'
  ];
  const ROBIN = [
    '...HHHHHH...',
    '..HHHHHHHH..',
    '..HHSSSSHH..',
    '..SMMSSMMS..',
    '..SSSSSSSS..',
    '...SSSSSS...',
    '.YYRRRRRRYY.',
    'YYRRRRYRRRYY',
    'YYRRRRRRRRYY',
    'YY.RRRRRR.YY',
    'YY.YYYYYY.YY',
    'Y..NNNNNN..Y',
    '...NN..NN...',
    '...NN..NN...',
    '...NN..NN...',
    '...KK..KK...',
    '...KK..KK...'
  ];
  const ROBIN_UP = ROBIN.slice();
  ROBIN_UP[4] = 'S.SSSSSSSS.S';
  ROBIN_UP[5] = 'R..SSSSSS..R';
  ROBIN_UP[6] = 'RR.RRRRRR.RR';
  ROBIN_UP[7] = '.RRRRRYRRRR.';
  ROBIN_UP[8] = '..RRRRRRRR..';
  ROBIN_UP[9] = '..YRRRRRRY..';
  ROBIN_UP[10] = '..YYYYYYYY..';
  ROBIN_UP[11] = '..YNNNNNNY..';

  function sprite(c, map, x, y, s) {
    s = s || 1;
    for (let r = 0; r < map.length; r++) {
      const row = map[r];
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch === '.') continue;
        c.fillStyle = PAL[ch];
        c.fillRect(x + i * s, y + r * s, s, s);
      }
    }
  }

  const BATGLYPH = ['X..X.X..X', 'XXXXXXXXX', '.XXXXXXX.', '..X.X.X..'];
  const BATBIG = [
    '.........X.X.........',
    'XX.......XXX.......XX',
    '.XXXX...XXXXX...XXXX.',
    '..XXXXXXXXXXXXXXXXX..',
    '..XXXXXXXXXXXXXXXXX..',
    '...XXX.XXXXXXX.XXX...',
    '....X...XXXXX...X....',
    '.........XXX.........',
    '..........X..........'];
  function ellipse(c, cx, cy, rx, ry, col) {
    c.fillStyle = col;
    for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(1 - (y * y) / (ry * ry))); c.fillRect(cx - w, cy + y, w * 2 + 1, 1); }
  }
  function glyph(c, x, y, col, s) {
    c.fillStyle = col; s = s || 1;
    BATGLYPH.forEach((row, r) => { for (let i = 0; i < row.length; i++) if (row[i] === 'X') c.fillRect(x + i * s, y + r * s, s, s); });
  }

  /* ---------- бэтмобиль ---------- */
  function car(c, x, y, t, crew, flame) {
    x = Math.round(x); y = Math.round(y);
    const R = (col, a, b, w, h) => { c.fillStyle = col; c.fillRect(x + a, y + b, w, h); };
    // выхлоп турбины
    if (flame > 0) {
      const f = Math.round(flame * (6 + (t % 3) * 2));
      R('#ff6a00', -f, -11, f, 4); R('#ffd23f', -Math.round(f * 0.6), -10, Math.round(f * 0.6), 2);
      R('#fff', -Math.min(3, f), -10, Math.min(3, f), 2);
    }
    const K = '#07080d', D = '#11141f', B1 = '#27345c', B2 = '#3d4f85', B3 = '#6f86c7';
    // плавники-крылья с подсветкой кромки и красными стоп-огнями
    R(K, 0, -25, 3, 15); R(K, 3, -22, 4, 12); R(K, 7, -19, 6, 9); R(K, 13, -16, 7, 6);
    R(B1, 0, -25, 1, 15); R(B2, 1, -25, 2, 1); R(B1, 3, -22, 4, 1); R(B1, 7, -19, 6, 1);
    R('#c81e2b', 1, -12, 2, 3); R('#ff5a66', 1, -12, 1, 1);
    // корпус: длинный капот, сужение к носу
    R(K, 2, -14, 86, 9); R(K, 84, -13, 10, 7); R(K, 92, -11, 6, 5); R(K, 97, -9, 3, 3);
    R(D, 4, -6, 92, 3); R('#05060a', 6, -3, 88, 1);
    R(B1, 14, -14, 70, 1); R(B2, 22, -14, 24, 1); R(B3, 28, -14, 8, 1);
    R(B1, 84, -13, 10, 1); R(B2, 92, -11, 5, 1);
    // воздухозаборник и панели
    R('#1a1d2b', 66, -11, 12, 3); R('#2d3247', 67, -10, 10, 1);
    R(B1, 26, -9, 1, 4); R(B1, 82, -9, 1, 4);
    R('#1a1d2b', 2, -10, 5, 4); R('#3a2a1a', 3, -9, 3, 2); // сопло
    // эмблема на борту
    R('#f4c430', 40, -10, 9, 4); R(K, 41, -10, 1, 1); R(K, 44, -10, 1, 1); R(K, 47, -10, 1, 1); R(K, 43, -8, 3, 1); R(K, 44, -7, 1, 1);
    // кабина: стекло с бликом
    R('#0e1626', 32, -19, 30, 6); R(B1, 33, -19, 28, 1); R(B3, 56, -18, 2, 1); R(B2, 58, -17, 2, 1); R(B2, 60, -16, 2, 1);
    R(B1, 62, -19, 2, 6); R(B2, 63, -18, 1, 4);
    if (crew) {
      // Робин (сзади)
      R('#15110f', 36, -25, 6, 3); R('#15110f', 35, -24, 1, 2); R('#e2ab84', 37, -22, 5, 3); R('#0c3b22', 37, -22, 5, 1);
      R('#c81e2b', 36, -19, 7, 2); R('#f4c430', 35, -19, 1, 2);
      // Бэтмен (за рулём)
      R(K, 47, -28, 1, 3); R(K, 52, -28, 1, 3);
      R(K, 47, -26, 6, 6); R('#fff', 49, -24, 1, 1); R('#fff', 51, -24, 1, 1); R('#e2ab84', 48, -21, 5, 2); R(K, 49, -20, 3, 1);
      R(K, 45, -20, 10, 3); R(B1, 45, -20, 1, 2);
    }
    // колёса: шины, диски со спицами
    [18, 74].forEach(wx => {
      R('#000', wx - 5, -9, 10, 9); R('#000', wx - 6, -7, 12, 5); R('#000', wx - 3, -10, 6, 11);
      R('#2d3247', wx - 3, -7, 6, 5); R('#565c6e', wx - 2, -6, 4, 3);
      c.fillStyle = '#c9ccd6';
      const ph = Math.floor(t / 2) % 4;
      const sp = [[-2, -7], [1, -7], [1, -3], [-2, -3]][ph];
      c.fillRect(x + wx + sp[0], y + sp[1], 1, 1); c.fillRect(x + wx - sp[0] - 1, y - 10 - sp[1], 1, 1);
      R('#f4c430', wx, -5, 1, 1);
    });
    // фара и подсветка днища
    R('#fff2a8', 95, -9, 3, 2); R('#fff', 97, -9, 1, 1);
    R('rgba(90,120,255,.35)', 8, -1, 84, 1);
  }

  /* ---------- дорога ---------- */
  function makeSkyline(seed, minH, maxH, total) {
    const r = rng(seed), b = [];
    let x = 0;
    while (x < total) {
      const w = 10 + Math.floor(r() * 18), h = minH + Math.floor(r() * (maxH - minH));
      const wins = [];
      for (let wy = 3; wy < h - 4; wy += 4) for (let wx = 2; wx < w - 2; wx += 3) if (r() < 0.2) wins.push([wx, wy]);
      b.push({ x, w, h, wins, spire: r() < 0.28 });
      x += w + (r() < 0.3 ? 2 : 0);
    }
    return { b, total: x };
  }

  function road(canvas) {
    const c = canvas.getContext('2d');
    c.imageSmoothingEnabled = false;
    const far = makeSkyline(7, 34, 74, 520), near = makeSkyline(21, 22, 52, 560);
    const r = rng(99);
    const drops = Array.from({ length: 110 }, () => ({ x: r() * (W + 80), y: r() * H, v: 3 + r() * 3 }));
    const streaks = Array.from({ length: 26 }, () => ({ x: r() * W, y: 131 + r() * 46, w: 4 + r() * 16, a: 0.04 + r() * 0.1 }));
    let boltX = 80, off = 0, speed = 2.2, target = 2.2, frame = 0, raf = 0, carX = 92, flash = 0, white = 0, boostT = -1, done = null;
    let last = performance.now(), acc = 0;

    function layer(sk, par, base, col, wcol) {
      const o = (off * par) % sk.total;
      sk.b.forEach(b => {
        let x = b.x - o; if (x < -40) x += sk.total;
        if (x > W) return;
        x = Math.round(x);
        c.fillStyle = col; c.fillRect(x, base - b.h, b.w, b.h);
        const top = base - b.h;
        if (b.spire) { c.fillRect(x + (b.w >> 1), top - 7, 1, 7); c.fillRect(x + (b.w >> 1) - 1, top - 3, 3, 3); if (par > 0.2 && (frame >> 4) % 3 === (b.x % 3)) { c.fillStyle = '#ff3b4a'; c.fillRect(x + (b.w >> 1), top - 8, 1, 1); c.fillStyle = col; } }
        else if (par > 0.2 && b.w > 16 && b.x % 3 === 0) { c.fillRect(x + 3, top - 7, 7, 5); c.fillRect(x + 4, top - 2, 1, 2); c.fillRect(x + 8, top - 2, 1, 2); c.fillRect(x + 2, top - 8, 9, 1); }
        else if (par > 0.2 && b.x % 3 === 1) { c.fillRect(x + 1, top - 2, b.w - 2, 2); c.fillRect(x + b.w - 4, top - 4, 2, 2); }
        c.fillStyle = col === '#0b0e22' ? '#1b2045' : '#262d5c'; c.fillRect(x, top, b.w, 1);
        c.fillStyle = wcol;
        b.wins.forEach((w, k) => { if (par > 0.2 && (k * 7 + b.x) % 23 === (frame >> 5) % 23) return; c.fillRect(x + w[0], top + w[1], 1, 2); });
        if (par > 0.2 && b.x % 5 === 2 && b.h > 34) { const on = (frame >> 3) % 9 !== 0; c.fillStyle = on ? '#d0142c' : '#4a0c16'; c.fillRect(x + 2, top + 10, b.w - 4, 3); c.fillStyle = on ? '#ff8a96' : '#4a0c16'; c.fillRect(x + 3, top + 11, b.w - 6, 1); }
      });
    }

    function step() {
      frame++;
      speed += (target - speed) * 0.045;
      off += speed;
      if (boostT >= 0) {
        boostT++;
        carX += (150 - carX) * 0.03;
        if (boostT > 70) white = Math.min(1, white + 0.035);
        if (boostT > 105 && done) { const d = done; done = null; d(); }
      }
      if (flash > 0) flash -= 0.08;
      else if (Math.random() < 0.006 && boostT < 0) { flash = 1; boostT < 0 && (boltX = 30 + Math.floor(Math.random() * 140)); }
    }

    function draw() {
      // небо
      const bands = ['#05060f', '#070917', '#0a0d20', '#0d1129', '#111633'];
      bands.forEach((b, i) => { c.fillStyle = b; c.fillRect(0, i * 25, W, 26); });
      // луна за тучами
      ellipse(c, 46, 30, 13, 13, '#c9cbe0'); ellipse(c, 49, 27, 11, 11, '#dfe0ee');
      c.fillStyle = '#a9abc4'; c.fillRect(42, 26, 3, 2); c.fillRect(50, 33, 4, 3); c.fillRect(46, 37, 2, 2);
      // тучи: три слоя, подсвечены сигналом
      const sigX = 236, sigY = 30;
      [[0.015, '#131833', 5, 8], [0.03, '#181e3e', 4, 18], [0.05, '#1d2448', 3, 30]].forEach(([par, col, n, y0], L) => {
        for (let i = 0; i < n + 3; i++) {
          const cx = ((i * 97 + L * 41 - off * par) % 440 + 440) % 440 - 60, cy = y0 + ((i * 13) % 3) * 6;
          const near = Math.max(0, 1 - Math.hypot(cx + 30 - sigX, cy - sigY) / 90);
          c.fillStyle = col; c.fillRect(cx, cy, 64, 6); c.fillRect(cx + 10, cy - 4, 40, 5); c.fillRect(cx + 22, cy - 7, 18, 4);
          if (near > 0) { c.fillStyle = 'rgba(255,236,160,' + (near * 0.35).toFixed(2) + ')'; c.fillRect(cx + 10, cy - 4, 40, 1); c.fillRect(cx + 22, cy - 7, 18, 1); c.fillRect(cx, cy, 64, 1); }
        }
      });
      // штаб полиции с прожектором — очень далеко, не движется
      c.fillStyle = '#151a38'; c.fillRect(196, 70, 22, 52); c.fillRect(200, 62, 14, 8); c.fillRect(205, 56, 4, 6);
      c.fillStyle = '#3d4677'; for (let wy = 74; wy < 118; wy += 5) { c.fillRect(199, wy, 2, 2); c.fillRect(205, wy, 2, 2); c.fillRect(211, wy, 2, 2); }
      c.fillStyle = '#c9cbe0'; c.fillRect(204, 54, 6, 3);
      // луч: мерцающий конус от прожектора к тучам
      const fl = 0.85 + Math.sin(frame * 0.21) * 0.08 + (Math.random() < 0.04 ? -0.25 : 0);
      const gr = c.createLinearGradient(207, 55, sigX, sigY);
      gr.addColorStop(0, 'rgba(255,244,190,' + (0.42 * fl).toFixed(2) + ')'); gr.addColorStop(1, 'rgba(255,240,170,' + (0.1 * fl).toFixed(2) + ')');
      c.fillStyle = gr;
      c.beginPath(); c.moveTo(205, 55); c.lineTo(210, 55); c.lineTo(sigX + 22, sigY + 6); c.lineTo(sigX - 22, sigY + 6); c.closePath(); c.fill();
      // пятно на тучах
      ellipse(c, sigX, sigY, 42, 19, 'rgba(255,240,170,' + (0.07 * fl).toFixed(2) + ')');
      ellipse(c, sigX, sigY, 33, 15, 'rgba(255,240,170,' + (0.16 * fl).toFixed(2) + ')');
      ellipse(c, sigX, sigY, 26, 12, 'rgba(255,246,196,' + (0.82 * fl).toFixed(2) + ')');
      ellipse(c, sigX, sigY, 24, 11, 'rgba(255,250,222,' + (0.9 * fl).toFixed(2) + ')');
      c.fillStyle = '#0a0d20';
      BATBIG.forEach((row, r) => { for (let i = 0; i < row.length; i++) if (row[i] === 'X') c.fillRect(sigX - 10 + i, sigY - 4 + r, 1, 1); });
      // пылинки и капли в луче
      c.fillStyle = 'rgba(255,250,220,.6)';
      for (let i = 0; i < 6; i++) { const t = ((frame * 0.7 + i * 23) % 60) / 60; c.fillRect(Math.round(207 + (sigX - 207) * t + Math.sin(i * 3 + frame * 0.05) * 6 * t), Math.round(55 + (sigY - 55) * t), 1, 1); }
      layer(far, 0.1, 122, '#1b2147', '#57608f');
      layer(near, 0.28, 122, '#0b0e22', '#f0c33c');
      // тротуар и дорога
      c.fillStyle = '#1d2030'; c.fillRect(0, 122, W, 6);
      c.fillStyle = '#2b2f45'; c.fillRect(0, 122, W, 1);
      c.fillStyle = '#0c0d13'; c.fillRect(0, 128, W, 52);
      // блики на мокром асфальте
      streaks.forEach(s => {
        s.x -= speed; if (s.x < -20) s.x += W + 30;
        c.fillStyle = 'rgba(150,170,255,' + s.a + ')'; c.fillRect(Math.round(s.x), Math.round(s.y), Math.round(s.w + speed * 2), 1);
      });
      // разметка
      c.fillStyle = '#9a9670';
      const d = off % 32;
      for (let x = -d; x < W; x += 32) c.fillRect(Math.round(x), 163, 16, 2);
      // фонари
      const lo = off % 150;
      for (let x = 150 - lo - 150; x < W + 20; x += 150) {
        const lx = Math.round(x);
        c.fillStyle = 'rgba(255,220,120,.08)';
        c.beginPath(); c.moveTo(lx + 8, 86); c.lineTo(lx - 12, 128); c.lineTo(lx + 30, 128); c.closePath(); c.fill();
        c.fillStyle = '#05060a'; c.fillRect(lx, 84, 2, 42); c.fillRect(lx, 84, 9, 2);
        c.fillStyle = '#ffe9a0'; c.fillRect(lx + 7, 86, 3, 2);
      }
      // свет фар
      const bob = Math.sin(frame * 0.35) > 0.6 ? 1 : 0;
      c.fillStyle = 'rgba(255,240,160,.13)';
      c.beginPath(); c.moveTo(carX + 96, 141 + bob); c.lineTo(W, 128); c.lineTo(W, 170); c.closePath(); c.fill();
      // отражение машины
      c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(Math.round(carX) + 4, 151, 90, 3);
      car(c, carX, 150 + bob, frame, true, Math.min(1.6, 0.35 + (speed - 2.2) / 6));
      // брызги
      c.fillStyle = 'rgba(190,205,255,.55)';
      for (let i = 0; i < 4 + speed; i++) c.fillRect(Math.round(carX + 10 - Math.random() * (10 + speed * 3)), 147 + Math.round(Math.random() * 4), 1, 1);
      // линии скорости
      if (speed > 4) {
        c.fillStyle = 'rgba(255,255,255,' + Math.min(0.5, (speed - 4) / 16) + ')';
        for (let i = 0; i < 16; i++) { const y = (i * 37 + frame * 13) % H; c.fillRect((i * 97 + frame * 31) % (W + 60) - 60, y, 30 + speed * 3, 1); }
      }
      // дождь
      c.fillStyle = 'rgba(165,190,255,.5)';
      drops.forEach(p => {
        p.y += p.v; p.x -= 1.2 + speed * 0.5;
        if (p.y > H) { p.y = -4; p.x = Math.random() * (W + 80); }
        if (p.x < -4) p.x += W + 80;
        c.fillRect(Math.round(p.x), Math.round(p.y), 1, 3);
      });
      if (flash > 0) {
        c.fillStyle = 'rgba(210,225,255,' + flash * 0.35 + ')'; c.fillRect(0, 0, W, H);
        if (flash > 0.5) { c.fillStyle = '#eef2ff'; let bx = boltX, by = 0; while (by < 70) { const nx = bx + ((by * 7 + boltX) % 5) - 2; c.fillRect(nx, by, 1, 4); bx = nx; by += 4; if (by === 28) c.fillRect(bx, by, 6, 1); } }
      }
      if (white > 0) { c.fillStyle = 'rgba(255,255,255,' + white + ')'; c.fillRect(0, 0, W, H); }
    }

    function loop(now) {
      raf = requestAnimationFrame(loop);
      acc += Math.min(100, now - last); last = now;
      let n = 0;
      while (acc >= 33 && n < 3) { step(); acc -= 33; n++; }
      if (n) draw();
    }
    step(); draw();
    raf = requestAnimationFrame(loop);
    return {
      boost(cb) { target = 16; boostT = 0; done = cb; },
      stop() { cancelAnimationFrame(raf); }
    };
  }

  /* ---------- пещера ---------- */
  function cave(canvas) {
    const c = canvas.getContext('2d');
    c.imageSmoothingEnabled = false;
    const r = rng(5);
    const stal = Array.from({ length: 26 }, (_, i) => ({ x: i * 13 + Math.floor(r() * 6), h: 8 + Math.floor(r() * 26), w: 5 + Math.floor(r() * 6) }));
    const bats = Array.from({ length: 7 }, () => ({ x: r() * W, y: 12 + r() * 50, v: 0.5 + r() * 1.2, p: Math.floor(r() * 10) }));
    const colors = ['#f4c430', '#c81e2b', '#1f8a4c', '#ffffff', '#39d0d8'];
    const conf = Array.from({ length: 70 }, () => ({ x: r() * W, y: -r() * H, v: 0.6 + r() * 1.2, c: colors[Math.floor(r() * 5)], s: r() * 6 }));
    let frame = 0, raf = 0, last = performance.now(), acc = 0;

    function draw() {
      frame++;
      c.fillStyle = '#05060b'; c.fillRect(0, 0, W, H);
      // дальняя стена
      c.fillStyle = '#0d1020';
      for (let i = 0; i < 20; i++) c.fillRect(i * 17, 30 + ((i * 53) % 22), 18, 120);
      // водопад
      c.fillStyle = '#16233f'; c.fillRect(292, 30, 20, 120);
      c.fillStyle = '#2b4a7a';
      for (let i = 0; i < 12; i++) c.fillRect(293 + (i * 7) % 18, (i * 23 + frame * 3) % 120 + 30, 1, 7);
      // сталактиты
      c.fillStyle = '#090b15'; c.fillRect(0, 0, W, 12);
      stal.forEach(s => { for (let k = 0; k < s.h; k++) { const w = Math.max(1, Math.round(s.w * (1 - k / s.h))); c.fillRect(s.x + ((s.w - w) >> 1), 12 + k, w, 1); } });
      // гигантский пенни
      c.fillStyle = '#7a4a1e'; c.beginPath(); c.arc(258, 66, 22, 0, 7); c.fill();
      c.fillStyle = '#b87333'; c.beginPath(); c.arc(256, 64, 20, 0, 7); c.fill();
      c.fillStyle = '#7a4a1e'; c.fillRect(249, 54, 10, 12); c.fillRect(247, 66, 16, 10); c.fillRect(251, 50, 6, 4);
      c.fillStyle = '#3a2a1a'; c.fillRect(254, 86, 6, 54);
      // бэт-компьютер
      c.fillStyle = '#10131f'; c.fillRect(14, 44, 112, 74); c.fillRect(30, 118, 80, 22);
      const fl = (frame % 40 < 2) ? '#7ff3f8' : '#39d0d8';
      [[18, 48, 50, 30], [72, 48, 50, 30], [18, 82, 104, 30]].forEach(s => { c.fillStyle = '#0a2a33'; c.fillRect(s[0], s[1], s[2], s[3]); });
      c.fillStyle = fl;
      // экран 1: галочка
      [[30, 64], [32, 66], [34, 68], [36, 66], [38, 64], [40, 62], [42, 60], [44, 58], [46, 56]].forEach(p => c.fillRect(p[0], p[1], 3, 3));
      // экран 2: эмблема
      glyph(c, 79, 55, fl, 4);
      // экран 3: листок календаря
      c.fillStyle = '#39d0d8'; c.fillRect(24, 88, 22, 18); c.fillStyle = '#0a2a33'; c.fillRect(26, 93, 18, 11);
      c.fillStyle = '#c81e2b'; c.fillRect(33, 95, 2, 7); c.fillRect(31, 96, 2, 2); c.fillRect(31, 102, 6, 1);
      c.fillStyle = fl;
      for (let i = 0; i < 5; i++) c.fillRect(54, 88 + i * 4, 20 + ((i * 29 + (frame >> 3)) % 40), 2);
      c.fillStyle = 'rgba(57,208,216,.06)'; c.fillRect(0, 40, 150, 110);
      // платформа
      c.fillStyle = '#1a1e2e'; c.fillRect(0, 150, W, 30);
      c.fillStyle = '#2b3048'; c.fillRect(0, 150, W, 2);
      c.fillStyle = '#11141f';
      for (let i = 0; i < 9; i++) c.fillRect(i * 40 - 6, 158, 26, 2);
      // машина
      car(c, 196, 150, 0, false, 0);
      // герои
      sprite(c, BATMAN, 126, 150 - 44, 2);
      const jump = Math.abs(Math.sin(frame * 0.16));
      const jy = Math.round(jump * 9);
      c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(164, 150, 20 - jy, 2);
      sprite(c, jy > 3 ? ROBIN_UP : ROBIN, 162, 150 - 34 - jy, 2);
      // летучие мыши
      c.fillStyle = '#000';
      bats.forEach(b => {
        b.x += b.v; if (b.x > W + 6) b.x = -6;
        const up = ((frame + b.p) >> 2) % 2, x = Math.round(b.x), y = Math.round(b.y + Math.sin((frame + b.p * 9) * 0.1) * 3);
        c.fillRect(x, y, 2, 1);
        if (up) { c.fillRect(x - 2, y - 1, 2, 1); c.fillRect(x + 2, y - 1, 2, 1); } else { c.fillRect(x - 2, y + 1, 2, 1); c.fillRect(x + 2, y + 1, 2, 1); }
      });
      // конфетти
      conf.forEach(p => {
        p.y += p.v; if (p.y > 150) { p.y = -4; p.x = Math.random() * W; }
        c.fillStyle = p.c; c.fillRect(Math.round(p.x + Math.sin((frame + p.s * 20) * 0.1) * 3), Math.round(p.y), 2, 1 + ((frame >> 2) % 2));
      });
    }
    function loop(now) {
      raf = requestAnimationFrame(loop);
      acc += Math.min(100, now - last); last = now;
      if (acc >= 33) { acc %= 33; draw(); }
    }
    draw();
    raf = requestAnimationFrame(loop);
    return { stop() { cancelAnimationFrame(raf); } };
  }

  /* ---------- пиксельный переход ---------- */
  function wipe(canvas, mid, end) {
    const c = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
    const cells = [];
    for (let i = 0; i < w * h; i++) cells.push(i);
    for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
    canvas.classList.add('on');
    c.clearRect(0, 0, w, h);
    let k = 0, phase = 0;
    const per = Math.ceil(cells.length / 22);
    const timer = setInterval(() => {
      for (let n = 0; n < per && k < cells.length; n++, k++) {
        const x = cells[k] % w, y = Math.floor(cells[k] / w);
        if (phase === 0) { c.fillStyle = '#000'; c.fillRect(x, y, 1, 1); } else c.clearRect(x, y, 1, 1);
      }
      if (k >= cells.length) {
        if (phase === 0) { phase = 1; k = 0; mid && mid(); }
        else { clearInterval(timer); canvas.classList.remove('on'); end && end(); }
      }
    }, 34);
  }

  window.Pixel = { road, cave, wipe };
})();
