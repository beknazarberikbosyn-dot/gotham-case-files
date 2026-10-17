/* Взлом под таймер: монолог на экране, Оракул на связи, бесконечные слои защиты.
   Выиграть нельзя: в конце — взрыв и экстренный выпуск новостей на том же экране.
   Hack.start(root, { duration, lines:[{t,text}], oracle:[{t|layer,text}], news:{cap,text,ticker,art}, onEnd }) */
(function () {
  const HEXD = '0123456789ABCDEF';
  function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const sfx = n => { if (window.Sound) Sound.sfx(n); };
  const mmss = s => { s = Math.max(0, Math.ceil(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };

  // клякса Роршаха: симметричные капли, слипшиеся через «липкий» фильтр
  function blot(seed, id) {
    const r = rng(seed * 97 + 13);
    let h = '';
    const n = 12 + Math.floor(r() * 6);
    for (let i = 0; i < n; i++) {
      const x = 100 - 4 - Math.pow(r(), 0.8) * 70, y = 26 + r() * 148, rx = 5 + r() * 20, ry = 5 + r() * 17, a = Math.round(r() * 180);
      h += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" transform="rotate(${a} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    }
    for (let i = 0; i < 4; i++) h += `<ellipse cx="100" cy="${(40 + r() * 120).toFixed(1)}" rx="${(4 + r() * 10).toFixed(1)}" ry="${(8 + r() * 22).toFixed(1)}"/>`;
    for (let i = 0; i < 10; i++) { const x = 100 - 20 - r() * 70, y = 14 + r() * 172; h += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1 + r() * 3).toFixed(1)}"/>`; }
    return `<svg viewBox="0 0 200 200" class="hk-blot-svg"><defs><filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3.2"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 26 -11"/></filter></defs>
      <g filter="url(#${id})" fill="#120d0d"><g>${h}</g><g transform="translate(200 0) scale(-1 1)">${h}</g></g></svg>`;
  }

  function start(root, o) {
    const D = o.duration || 180;
    let t = 0, last = performance.now(), raf = 0, layer = 1, total = 3, stage = null, stageKind = '', over = false, typing = null, lineI = 0, orI = 0, ended = false;
    const R = rng(Date.now() & 0xffff);
    root.innerHTML = `<div class="hk">
      <div class="hk-top"><span class="hk-tag">${o.title || 'СЕТЬ «ЗАРЯ» · ДЕТОНАТОРОВ: 5'}</span><b class="hk-timer">${mmss(D)}</b><span class="hk-layer">СЛОЙ 1 / 3</span></div>
      <div class="hk-main">
        <div class="hk-screen"><div class="hk-noise"></div>
          <div class="hk-card"><div class="hk-blot a"></div><div class="hk-blot b"></div><span class="hk-cardno">КАРТОЧКА I</span></div>
          <div class="hk-who"><i class="hk-vu"><b></b><b></b><b></b><b></b><b></b></i><span>НЕИЗВЕСТНЫЙ АБОНЕНТ</span></div>
          <div class="hk-sub"></div></div>
        <div class="hk-term"><div class="hk-th"><span>ТЕРМИНАЛ АНАРХИИ</span><i>ВЗЛОМ ЗАЩИТЫ</i></div><div class="hk-stage"></div><div class="hk-flash"></div>
          <div class="hk-dump"></div>
          <div class="hk-bombs">${(o.targets || ['БАШНЯ', 'НАУКИ', 'ФОНД', 'КЕМИКАЛ', 'ПОРТ']).map(n => `<span><i></i>${n}<small>ВЗВЕДЁН</small></span>`).join('')}</div></div>
      </div>
      <div class="hk-oracle"><i class="hk-wave"><b></b><b></b><b></b><b></b><b></b><b></b><b></b></i><span>ОРАКУЛ</span><p>…</p></div>
    </div>`;
    const $ = s => root.querySelector(s);
    const hk = $('.hk'), timer = $('.hk-timer'), lay = $('.hk-layer'), sub = $('.hk-sub'), stageBox = $('.hk-stage'), flash = $('.hk-flash'), orP = $('.hk-oracle p'), orBox = $('.hk-oracle');
    let blotFlip = false, blotN = 0;
    const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV'];
    const nextBlot = () => {
      const a = $('.hk-blot.a'), b = $('.hk-blot.b'), show = blotFlip ? a : b, hide = blotFlip ? b : a;
      show.innerHTML = blot(blotN + 3, 'hkg' + blotN); show.classList.add('on'); hide.classList.remove('on');
      $('.hk-cardno').textContent = 'КАРТОЧКА ' + (ROMAN[blotN] || blotN + 1);
      blotFlip = !blotFlip; blotN++;
    };
    $('.hk-blot.a').innerHTML = blot(1, 'hkg0'); $('.hk-blot.a').classList.add('on');

    function typeIn(p, text, speed, done) {
      if (typing) typing.finish();
      let i = 0;
      const iv = setInterval(() => { i += 1; p.textContent = text.slice(0, i); if (i % 3 === 0) sub.scrollTop = sub.scrollHeight; if (i >= text.length) fin(); }, speed);
      const fin = () => { clearInterval(iv); p.textContent = text; sub.scrollTop = sub.scrollHeight; if (typing && typing.p === p) typing = null; hk.classList.remove('talking'); if (done) done(); };
      typing = { p, finish: fin };
      hk.classList.add('talking');
    }
    function say(text) {
      sub.querySelectorAll('p').forEach(p => p.classList.add('old'));
      const p = el('p'); sub.appendChild(p);
      if (lineI === 1 && o.revealName) $('.hk-who span').textContent = o.revealName;
      nextBlot();
      typeIn(p, text, 26);
    }
    let orT = 0;
    function oracle(text) {
      orP.textContent = text; orBox.classList.remove('ping'); void orBox.offsetWidth; orBox.classList.add('ping'); sfx('beep');
      clearTimeout(orT); orT = setTimeout(() => orBox.classList.remove('ping'), 4000);
    }
    function flashMsg(text, cls) { flash.textContent = text; flash.className = 'hk-flash on ' + (cls || ''); setTimeout(() => { flash.className = 'hk-flash'; }, 1300); }

    /* ---------- слои защиты ---------- */
    const KINDS = ['hex', 'sync', 'ports', 'seq', 'bits'];
    let bag = [];
    const nextKind = () => { if (!bag.length) { bag = KINDS.slice().sort(() => R() - 0.5); if (bag[0] === stageKind) bag.push(bag.shift()); } return bag.shift(); };
    function cleared() {
      if (over) return;
      sfx('ok');
      layer++;
      if (layer > total) { const add = 2 + Math.floor(layer / 4); total += add; flashMsg(`ЗАЩИТА ПЕРЕСТРОЕНА · +${add} СЛОЯ`, 'warn'); sfx('alarm'); }
      else flashMsg('СЛОЙ ВЗЛОМАН', 'ok');
      lay.textContent = `СЛОЙ ${layer} / ${total}`;
      lay.classList.remove('bump'); void lay.offsetWidth; lay.classList.add('bump');
      (o.oracle || []).forEach(x => { if (x.layer === layer) oracle(x.text); });
      setTimeout(newStage, 650);
    }
    function miss() { sfx('wrong'); stageBox.classList.remove('shake'); void stageBox.offsetWidth; stageBox.classList.add('shake'); }
    function newStage() {
      if (over) return;
      if (stage && stage.stop) stage.stop();
      stageKind = nextKind();
      stageBox.innerHTML = '';
      stage = STAGES[stageKind]();
    }
    const btnE = (cls, txt, fn) => { const b = el('button', cls, txt); b.type = 'button'; b.onclick = fn; return b; };
    const STAGES = {
      hex() {
        const len = layer > 5 ? 4 : 3, cells = new Set();
        while (cells.size < 12) cells.add(HEXD[Math.floor(R() * 16)] + HEXD[Math.floor(R() * 16)]);
        const arr = [...cells], tgt = arr.slice().sort(() => R() - 0.5).slice(0, len);
        let pos = 0;
        stageBox.innerHTML = `<p class="hk-q">Найди в дампе ключ по порядку: ${tgt.map(x => `<b>${x}</b>`).join(' ')}</p><div class="hk-grid"></div>`;
        const g = stageBox.querySelector('.hk-grid');
        arr.forEach(x => g.appendChild(btnE('hk-cell', x, e => {
          if (over) return;
          if (x === tgt[pos]) { e.currentTarget.classList.add('ok'); pos++; sfx('key'); stageBox.querySelectorAll('.hk-q b')[pos - 1].classList.add('ok'); if (pos === len) cleared(); }
          else { pos = 0; g.querySelectorAll('.ok').forEach(c => c.classList.remove('ok')); stageBox.querySelectorAll('.hk-q b').forEach(c => c.classList.remove('ok')); miss(); }
        })));
        return {};
      },
      sync() {
        const need = 3, w = Math.max(0.1, 0.2 - layer * 0.01);
        let hits = 0, z = 0.2 + R() * (0.7 - w), ph = R() * 6, sp = 2.4 + layer * 0.12 + (o.diff === 'hard' ? 0.5 : o.diff === 'easy' ? -0.4 : 0), raf2 = 0, lt = performance.now(), p = 0;
        stageBox.innerHTML = `<p class="hk-q">Поймай окно синхронизации: <b class="hk-hits">0 / ${need}</b></p><div class="hk-bar"><i></i><b></b></div>`;
        const zone = stageBox.querySelector('.hk-bar i'), mark = stageBox.querySelector('.hk-bar b'), hitsEl = stageBox.querySelector('.hk-hits');
        const place = () => { zone.style.left = (z * 100) + '%'; zone.style.width = (w * 100) + '%'; };
        place();
        const loop = now => { ph += (now - lt) / 1000 * sp; lt = now; p = (Math.sin(ph) + 1) / 2; mark.style.left = (p * 100) + '%'; raf2 = requestAnimationFrame(loop); };
        raf2 = requestAnimationFrame(loop);
        const press = () => {
          if (over) return;
          if (p >= z - 0.01 && p <= z + w + 0.01) { hits++; sfx('key'); hitsEl.textContent = `${hits} / ${need}`; if (hits >= need) { cancelAnimationFrame(raf2); cleared(); return; } z = 0.05 + R() * (0.9 - w); place(); }
          else miss();
        };
        const b = btnE('btn hk-enter', 'ВВОД', press); stageBox.appendChild(b);
        const key = e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); press(); } };
        document.addEventListener('keydown', key);
        return { stop() { cancelAnimationFrame(raf2); document.removeEventListener('keydown', key); } };
      },
      ports() {
        const n = Math.min(9, 6 + Math.floor(layer / 2));
        const slots = Array.from({ length: 12 }, (_, i) => i).sort(() => R() - 0.5).slice(0, n);
        let next = 1;
        stageBox.innerHTML = `<p class="hk-q">Перезапусти порты по порядку: от 1 до ${n}.</p><div class="hk-ports"></div>`;
        const box = stageBox.querySelector('.hk-ports');
        slots.forEach((s, k) => {
          const b = btnE('hk-port', String(k + 1), e => {
            if (over) return;
            if (k + 1 === next) { e.currentTarget.classList.add('ok'); next++; sfx('key'); if (next > n) cleared(); }
            else { next = 1; box.querySelectorAll('.ok').forEach(c => c.classList.remove('ok')); miss(); }
          });
          b.style.gridArea = `${Math.floor(s / 4) + 1} / ${(s % 4) + 1}`;
          b.style.transform = `translate(${Math.round(R() * 16 - 8)}px, ${Math.round(R() * 10 - 5)}px)`;
          box.appendChild(b);
        });
        return {};
      },
      seq() {
        const kind = Math.floor(R() * 4);
        let a = 2 + Math.floor(R() * 7), d = 3 + Math.floor(R() * 7), s = [];
        if (kind === 0) for (let i = 0; i < 6; i++) s.push(a + d * i);
        else if (kind === 1) for (let i = 0; i < 6; i++) s.push(a * Math.pow(2, i));
        else if (kind === 2) { s = [a, a + 1 + Math.floor(R() * 3)]; while (s.length < 6) s.push(s[s.length - 1] + s[s.length - 2]); }
        else { const e = 1 + Math.floor(R() * 4); s = [a + 10]; for (let i = 1; i < 6; i++) s.push(s[i - 1] + (i % 2 ? d : -e)); }
        const ans = s[5], opts = new Set([ans]);
        while (opts.size < 4) { const v = ans + (Math.floor(R() * 9) - 4) * (kind === 1 ? a : 1) || ans + opts.size * 2; if (v > 0) opts.add(v); }
        stageBox.innerHTML = `<p class="hk-q">Контрольная сумма. Продолжи ряд:</p><div class="hk-seq">${s.slice(0, 5).map(x => `<b>${x}</b>`).join('')}<b class="q">?</b></div><div class="hk-opts"></div>`;
        const box = stageBox.querySelector('.hk-opts');
        [...opts].sort(() => R() - 0.5).forEach(x => box.appendChild(btnE('hk-cell', String(x), () => { if (over) return; if (x === ans) cleared(); else miss(); })));
        return {};
      },
      bits() {
        const tgt = 5 + Math.floor(R() * 58), on = [0, 0, 0, 0, 0, 0], W = [32, 16, 8, 4, 2, 1];
        stageBox.innerHTML = `<p class="hk-q">Пароль шлюза — число <b>${tgt}</b>. Выставь его переключателями.</p><div class="hk-bits"></div><p class="hk-sum">СУММА: 0</p>`;
        const box = stageBox.querySelector('.hk-bits'), sum = stageBox.querySelector('.hk-sum');
        W.forEach((w, i) => {
          const b = btnE('hk-bit', `<i></i><span>${w}</span>`, () => {
            if (over) return;
            on[i] ^= 1; b.classList.toggle('on', !!on[i]); sfx('click');
            const v = on.reduce((s, x, k) => s + x * W[k], 0); sum.textContent = 'СУММА: ' + v;
            if (v === tgt) cleared();
          });
          box.appendChild(b);
        });
        return {};
      }
    };

    /* ---------- взрыв и новости ---------- */
    function boom() {
      over = true;
      if (stage && stage.stop) stage.stop();
      if (lineI < lines.length) { lineI = lines.length; say(lines[lines.length - 1].text); }
      if (typing) typing.finish();
      if (window.Sound) Sound.play('none');
      timer.textContent = '00:00';
      hk.classList.add('det');
      stageBox.innerHTML = '<p class="hk-q big">ДЕТОНАЦИЯ</p>';
      [0, 650, 1150, 1550, 1850].forEach((d, i) => setTimeout(() => { sfx('boom'); hk.classList.remove('shake'); void hk.offsetWidth; hk.classList.add('shake'); lay.textContent = `ВЗРЫВ ${i + 1} / 5`; const sp = root.querySelectorAll('.hk-bombs span')[i]; if (sp) { sp.classList.add('gone'); sp.querySelector('small').textContent = 'ВЗРЫВ'; } }, d));
      setTimeout(() => { hk.classList.add('white'); }, 300);
      setTimeout(() => { hk.classList.remove('white'); hk.classList.add('static'); }, 2600);
      setTimeout(news, 5200);
    }
    function news() {
      const N = o.news || {};
      if (window.Sound) Sound.play('ashes');
      hk.classList.remove('static', 'det');
      hk.classList.add('news-mode');
      hk.innerHTML = `<div class="hk-news"><div class="hk-tv">${N.art ? Art[N.art]() : ''}<div class="hk-live">● ПРЯМОЙ ЭФИР</div><div class="hk-lower"><b>${N.cap || ''}</b><span>${N.who || ''}</span></div><div class="hk-ticker"><span>${(N.ticker || '') + ' · ' + (N.ticker || '')}</span></div></div>
        <div class="hk-ntext"><p></p></div><div class="hk-nbtn"></div></div>`;
      const p = hk.querySelector('.hk-ntext p');
      let i = 0;
      const txt = N.text || '';
      const b = el('button', 'btn hk-end', o.endLabel || 'ДАЛЬШЕ →'); b.type = 'button';
      const showBtn = () => { if (!b.isConnected) hk.querySelector('.hk-nbtn').appendChild(b); };
      const iv = setInterval(() => { i += 1; p.textContent = txt.slice(0, i); if (i >= txt.length) { clearInterval(iv); showBtn(); } }, 22);
      hk.querySelector('.hk-ntext').onclick = () => { clearInterval(iv); p.textContent = txt; showBtn(); };
      setTimeout(showBtn, 6000);
      b.onclick = () => { if (ended) return; ended = true; clearInterval(iv); stop(); o.onEnd && o.onEnd(); };
      api.newsShown = true;
    }

    /* ---------- главный цикл ---------- */
    const lines = o.lines || [], ors = (o.oracle || []).filter(x => x.t != null).sort((a, b) => a.t - b.t);
    let lastBeep = -1, dumpT = -1;
    const dumpLines = [], dump = $('.hk-dump');
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (over) return;
      t += Math.min(0.1, (now - last) / 1000); last = now;
      const left = D - t;
      timer.textContent = mmss(left);
      timer.classList.toggle('red', left <= 30);
      if (left <= 10 && Math.ceil(left) !== lastBeep) { lastBeep = Math.ceil(left); sfx('beep'); }
      while (lineI < lines.length && t >= lines[lineI].t) { const L = lines[lineI]; lineI++; say(L.text); }
      while (orI < ors.length && t >= ors[orI].t) { oracle(ors[orI].text); orI++; }
      if (!stage && t >= (o.termAt || 4)) { stageBox.innerHTML = ''; newStage(); }
      if (Math.floor(t * 6) !== dumpT) { dumpT = Math.floor(t * 6); dumpLines.push(Array.from({ length: 8 }, () => HEXD[Math.floor(R() * 16)] + HEXD[Math.floor(R() * 16)]).join(' ') + (R() < 0.15 ? '  ДОСТУП ЗАПРЕЩЁН' : R() < 0.1 ? '  СЛОЙ ПЕРЕСОБРАН' : '')); if (dumpLines.length > 3) dumpLines.shift(); dump.textContent = dumpLines.join('\n'); }
      if (left <= 0) boom();
    }
    stageBox.innerHTML = '<p class="hk-q">Подключение к сети… <span class="hk-dots">▮▮▮</span></p>';
    raf = requestAnimationFrame(loop);
    function stop() { cancelAnimationFrame(raf); if (stage && stage.stop) stage.stop(); if (typing) typing.finish(); clearTimeout(orT); }
    const api = {
      end() { if (!over) { t = D; boom(); } },
      skip(sec) { t += sec; },
      state() { return { t, layer, total, over, kind: stageKind, line: lineI, news: !!api.newsShown }; },
      stop
    };
    window.__hack = api;
    return api;
  }
  window.Hack = { start };
})();
