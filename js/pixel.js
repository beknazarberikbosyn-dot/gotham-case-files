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
    // плавники
    R('#07080d', 0, -24, 3, 14); R('#07080d', 3, -21, 4, 11); R('#07080d', 7, -18, 5, 8); R('#07080d', 12, -15, 6, 5);
    R('#27345c', 0, -24, 1, 14);
    // корпус
    R('#07080d', 2, -13, 88, 8); R('#07080d', 84, -12, 10, 6); R('#07080d', 92, -10, 5, 4);
    R('#11141f', 4, -6, 90, 3);
    R('#27345c', 14, -13, 66, 1); R('#3d4f85', 20, -13, 26, 1);
    R('#1a1d2b', 2, -9, 5, 3); // сопло
    // эмблема на борту
    R('#f4c430', 58, -10, 7, 3); R('#07080d', 60, -10, 1, 1); R('#07080d', 62, -10, 1, 1); R('#07080d', 61, -8, 1, 1);
    // кабина
    R('#0e1626', 32, -18, 30, 5); R('#27345c', 60, -18, 3, 5); R('#3d4f85', 62, -17, 2, 4);
    if (crew) {
      // Робин (сзади)
      R('#15110f', 36, -24, 6, 3); R('#e2ab84', 37, -21, 5, 3); R('#0c3b22', 38, -21, 4, 1);
      R('#c81e2b', 36, -18, 7, 2); R('#f4c430', 35, -18, 1, 2);
      // Бэтмен (за рулём)
      R('#07080d', 47, -27, 1, 3); R('#07080d', 52, -27, 1, 3);
      R('#07080d', 47, -25, 6, 5); R('#fff', 51, -23, 2, 1); R('#e2ab84', 49, -21, 4, 2);
      R('#07080d', 45, -19, 9, 3);
    }
    // колёса
    [18, 74].forEach(wx => {
      R('#000', wx - 5, -8, 10, 8); R('#000', wx - 6, -6, 12, 4); R('#000', wx - 3, -9, 6, 10);
      R('#565c6e', wx - 2, -6, 4, 4);
      c.fillStyle = '#c9ccd6';
      const ph = Math.floor(t / 2) % 4;
      const sp = [[-2, -6], [1, -6], [1, -3], [-2, -3]][ph];
      c.fillRect(x + wx + sp[0], y + sp[1], 1, 1);
    });
    // фара
    R('#fff2a8', 95, -9, 2, 2);
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
    let off = 0, speed = 2.2, target = 2.2, frame = 0, raf = 0, carX = 92, flash = 0, white = 0, boostT = -1, done = null;
    let last = performance.now(), acc = 0;

    function layer(sk, par, base, col, wcol) {
      const o = (off * par) % sk.total;
      sk.b.forEach(b => {
        let x = b.x - o; if (x < -40) x += sk.total;
        if (x > W) return;
        x = Math.round(x);
        c.fillStyle = col; c.fillRect(x, base - b.h, b.w, b.h);
        if (b.spire) { c.fillRect(x + (b.w >> 1), base - b.h - 7, 1, 7); c.fillRect(x + (b.w >> 1) - 1, base - b.h - 3, 3, 3); }
        c.fillStyle = wcol;
        b.wins.forEach(w => c.fillRect(x + w[0], base - b.h + w[1], 1, 2));
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
      else if (Math.random() < 0.006 && boostT < 0) flash = 1;
    }

    function draw() {
      // небо
      const bands = ['#05060f', '#070917', '#0a0d20', '#0d1129', '#111633'];
      bands.forEach((b, i) => { c.fillStyle = b; c.fillRect(0, i * 25, W, 26); });
      // тучи
      c.fillStyle = '#161b3a';
      for (let i = 0; i < 6; i++) { const cx = ((i * 71 - off * 0.03) % 400 + 400) % 400 - 50; c.fillRect(cx, 14 + (i % 3) * 9, 54, 5); c.fillRect(cx + 8, 11 + (i % 3) * 9, 34, 4); }
      // бэт-сигнал
      c.fillStyle = 'rgba(255,240,170,.07)';
      c.beginPath(); c.moveTo(214, 112); c.lineTo(226, 26); c.lineTo(250, 30); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,240,170,.55)'; c.fillRect(228, 22, 20, 11); c.fillRect(226, 24, 24, 7);
      glyph(c, 234, 25, '#0a0d20');
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
      if (flash > 0) { c.fillStyle = 'rgba(210,225,255,' + flash * 0.35 + ')'; c.fillRect(0, 0, W, H); }
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
