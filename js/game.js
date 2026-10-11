/* Движок: заставка → выбор дела и сложности → расследование → финал → пещера с очками. */
(function () {
  const $ = id => document.getElementById(id);
  const CASES = [window.CASE1, window.CASE2].filter(Boolean);
  const DIFFS = {
    easy: { name: 'ЛЁГКАЯ', note: 'Справочник под рукой, часть ответов — на выбор' },
    medium: { name: 'СРЕДНЯЯ', note: 'Справочник под рукой, отвечаешь сам' },
    hard: { name: 'СЛОЖНАЯ', note: 'Только улики и твоя голова' }
  };
  const DIFF_RANK = { easy: 0, medium: 1, hard: 2 };
  let C, TOTAL, st, diff = 'medium', roadCtl, caveCtl, current = null;

  const store = {
    get(id) { try { return JSON.parse(localStorage.getItem('gcf_best_' + id)) || null; } catch (e) { return null; } },
    set(id, v) { try { localStorage.setItem('gcf_best_' + id, JSON.stringify(v)); } catch (e) { /* не страшно */ } }
  };

  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const btn = (cls, text, fn) => { const b = el('button', cls); b.type = 'button'; b.textContent = text; if (fn) b.onclick = fn; return b; };

  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  }

  /* ---------- печатная машинка ---------- */
  function type(node, text, speed) {
    if (node._t) clearInterval(node._t);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { node.textContent = text; return; }
    let i = 0;
    node.textContent = '';
    node._full = text;
    node._t = setInterval(() => {
      i += 2;
      node.textContent = text.slice(0, i);
      if (i >= text.length) { clearInterval(node._t); node._t = null; }
    }, speed || 16);
  }
  function finishType(node) { if (node._t) { clearInterval(node._t); node._t = null; node.textContent = node._full; return true; } return false; }

  /* ---------- Бэтмен ---------- */
  function batSay(text, tag, act) {
    const a = $('batAct');
    a.hidden = !act;
    if (act) { a.textContent = act.label; a.onclick = act.fn; }
    $('batFace').innerHTML = $('batFace').innerHTML || Art.batman();
    $('batTag').textContent = tag || 'БЭТМЕН';
    const b = $('bat');
    b.hidden = false;
    b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
    $('case').classList.add('with-bat');
    type($('batText'), text, 14);
  }
  function batHide() { $('bat').hidden = true; $('case').classList.remove('with-bat'); }

  /* ---------- сюжетные страницы ---------- */
  function playStory(pages, onEnd, lastLabel) {
    let i = 0;
    const box = $('story');
    batHide();
    function render() {
      const p = pages[i];
      const art = $('storyArt');
      art.className = 'story-art' + (p.bat ? ' bat-art' : '');
      art.innerHTML = (p.bat ? Art.batman() : Art[p.art]()) + (p.title ? `<h1>${p.title}</h1>` : '');
      $('storyCap').textContent = p.cap || '';
      type($('storyText'), p.text, 14);
      $('storyNext').textContent = i === pages.length - 1 ? (lastLabel || 'ДАЛЬШЕ →') : 'ДАЛЬШЕ →';
      box.scrollTop = 0;
    }
    $('storyNext').onclick = () => {
      if (finishType($('storyText'))) return;
      i++;
      if (i >= pages.length) { box.hidden = true; onEnd(); } else render();
    };
    box.hidden = false;
    render();
  }

  /* ---------- сцена ---------- */
  function hud() {
    const sc = C.scenes[st.scene];
    const done = sc.clues.filter(c => st.solved[c.id]).length;
    $('hudPlace').textContent = (st.scene + 1) + '/' + C.scenes.length;
    $('hudClues').textContent = done + '/' + sc.clues.length;
    $('hudHints').textContent = st.hintsUsed;
  }

  function loadScene(i) {
    st.scene = i;
    const sc = C.scenes[i];
    $('loc').textContent = sc.loc;
    type($('narr'), sc.narr, 12);
    $('scene').innerHTML = Art[sc.art]() + sc.clues.map(c =>
      `<button class="hot" data-id="${c.id}" aria-label="${c.name}" style="left:${c.hot.x}%;top:${c.hot.y}%;width:${c.hot.w}%;height:${c.hot.h}%"><span class="hot-label">${c.name}</span></button>`).join('');
    $('scene').querySelectorAll('.hot').forEach(b => b.onclick = () => openClue(sc.clues.find(c => c.id === b.dataset.id)));
    const li = el('li', 'place');
    li.textContent = sc.loc.split(' · ').slice(0, 2).join(' · ');
    $('notes').appendChild(li);
    $('nextBtn').hidden = true;
    $('case').scrollTop = 0;
    hud();
  }

  function sceneComplete() {
    const sc = C.scenes[st.scene];
    const last = st.scene === C.scenes.length - 1;
    const b = $('nextBtn');
    b.textContent = last ? 'К ЛОГОВУ →' : 'СЛЕДУЮЩЕЕ МЕСТО →';
    b.hidden = false;
    let gone = false;
    b.onclick = () => {
      if (gone) return;
      gone = true;
      batHide();
      if (last) return finale();
      Pixel.wipe($('wipe'), () => loadScene(st.scene + 1));
    };
    batSay(sc.outro, 'БЭТМЕН', { label: b.textContent, fn: b.onclick });
  }

  /* ================= ТИПЫ ЗАГАДОК ================= */
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const ABC = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
  const mod = (n, m) => ((n % m) + m) % m;
  // удержание кнопки = повтор
  function hold(b, fn) {
    let t = null, i = null;
    const stop = () => { clearTimeout(t); clearInterval(i); t = i = null; };
    b.addEventListener('pointerdown', e => { if (e.button) return; stop(); t = setTimeout(() => { i = setInterval(fn, 80); }, 350); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, stop));
    b.addEventListener('click', fn);
    current.cleanup.push(stop);
  }

  const TYPES = {
    /* --- текстовый ответ --- */
    input(v, A) {
      A.innerHTML = `<input type="text" id="ansIn" autocomplete="off" spellcheck="false" placeholder="${v.placeholder || ''}" aria-label="Ответ">`;
      const inp = A.firstChild;
      inp.onkeydown = e => { if (e.key === 'Enter') check(); };
      return { empty: () => !inp.value.trim(), check: () => v.check(inp.value) };
    },
    /* --- выбор одного / нескольких --- */
    choice(v, A) { return options(v, A, false); },
    multi(v, A) { return options(v, A, true); },
    /* --- собрать по порядку --- */
    order(v, A) {
      let pool = shuffle(v.items.concat(v.decoys || [])), built = [];
      A.innerHTML = `<div class="order-h">${v.poolLabel || 'ВОЗЬМИ'}</div><div class="pool"></div><div class="order-h">${v.builtLabel || 'ТВОЙ ПОРЯДОК'} (нажми, чтобы убрать)</div><div class="built"></div>`;
      const P = A.querySelector('.pool'), B = A.querySelector('.built');
      const render = () => {
        const mk = (t, from) => btn('strip', t, () => {
          if (from === 'pool') { pool.splice(pool.indexOf(t), 1); built.push(t); } else { built.splice(built.indexOf(t), 1); pool.push(t); }
          render();
        });
        P.replaceChildren(...pool.map(t => mk(t, 'pool')));
        B.replaceChildren(...built.map(t => mk(t, 'built')));
      };
      render();
      return { empty: () => !built.length, check: () => built.length === v.items.length && v.items.every((t, i) => built[i] === t) };
    },
    /* --- кодовые барабаны --- */
    wheels(v, A) {
      const reels = v.reels, pos = reels.map(() => 0);
      const box = el('div', 'wheels');
      reels.forEach((syms, i) => {
        const r = el('div', 'reel'), face = el('div', 'reel-face');
        const set = d => { pos[i] = mod(pos[i] + d, syms.length); face.textContent = syms[pos[i]]; face.classList.remove('tick'); void face.offsetWidth; face.classList.add('tick'); };
        const up = btn('reel-b', '▲', () => set(-1)), dn = btn('reel-b', '▼', () => set(1));
        up.setAttribute('aria-label', 'Барабан ' + (i + 1) + ' вверх'); dn.setAttribute('aria-label', 'Барабан ' + (i + 1) + ' вниз');
        face.textContent = syms[0];
        r.append(up, face, dn); box.appendChild(r);
      });
      A.appendChild(box);
      return { empty: () => false, check: () => v.code.every((s, i) => reels[i][pos[i]] === s) };
    },
    /* --- сейфовый лимб --- */
    dial(v, A) {
      const N = v.max || 40;
      let pos = 0, runs = [];
      let ticks = '';
      for (let i = 0; i < N; i++) {
        const big = i % 5 === 0;
        ticks += `<line x1="100" y1="${big ? 18 : 22}" x2="100" y2="30" stroke="#fff" stroke-width="${big ? 2.5 : 1}" transform="rotate(${i * 360 / N} 100 100)"/>`;
        if (big) ticks += `<text x="100" y="44" text-anchor="middle" font-size="11" font-family="Russo One, Arial Black, sans-serif" fill="#fff" transform="rotate(${i * 360 / N} 100 100)">${i}</text>`;
      }
      const w = el('div', 'dial', `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="96" fill="#1a1a1a" stroke="#888" stroke-width="4"/>
        <g class="dial-face"><circle cx="100" cy="100" r="86" fill="#0a0a0a" stroke="#fff" stroke-width="3"/>${ticks}<circle cx="100" cy="100" r="34" fill="#222" stroke="#fff" stroke-width="3"/><rect x="96" y="70" width="8" height="60" fill="#888"/></g>
        <path d="M100 2l-9 16h18z" fill="#d0142c"/></svg>
        <div class="dial-side"><div class="dial-num" aria-live="polite">0</div><div class="dial-runs"></div></div>`);
      const face = w.querySelector('.dial-face'), num = w.querySelector('.dial-num'), R = w.querySelector('.dial-runs');
      const draw = () => {
        face.style.transform = `rotate(${-pos * 360 / N}deg)`;
        num.textContent = mod(pos, N);
        R.innerHTML = runs.length ? runs.map(r => `<span>${r.dir === 'R' ? '↻ вправо' : '↺ влево'} до <b>${r.n}</b></span>`).join('') : '<span class="dim">Крути лимб. Смена направления запоминает число.</span>';
      };
      const step = d => {
        pos += d;
        const dir = d > 0 ? 'R' : 'L', n = mod(pos, N), last = runs[runs.length - 1];
        if (last && last.dir === dir) last.n = n; else runs.push({ dir, n });
        draw();
      };
      const row = el('div', 'mech-row');
      const l = btn('btn ghost', '↺ ВЛЕВО'), r = btn('btn ghost', 'ВПРАВО ↻');
      row.append(l, btn('btn ghost', 'СБРОС', () => { pos = 0; runs = []; draw(); }), r);
      A.append(w, row);
      hold(l, () => step(-1)); hold(r, () => step(1));
      draw();
      return { empty: () => !runs.length, check: () => runs.length === v.seq.length && v.seq.every((s, i) => runs[i].dir === s.dir && runs[i].n === s.n), reset: () => { pos = 0; runs = []; draw(); } };
    },
    /* --- шифровальный диск --- */
    cipher(v, A) {
      const keys = v.keys, sh = keys.map(() => 0);
      const enc = v.plain.toUpperCase().split('');
      let li = 0;
      const ct = enc.map(ch => { const p = ABC.indexOf(ch); if (p < 0) return { ch }; const k = li++ % keys.length; return { ch: ABC[mod(p + keys[k], 33)], k }; });
      const ring = (r, fs, cls) => ABC.split('').map((c, i) => `<text class="${cls}" x="110" y="${110 - r}" text-anchor="middle" font-size="${fs}" transform="rotate(${i * 360 / 33} 110 110)">${c}</text>`).join('');
      const out = el('div', 'cipher-out');
      const wrap = el('div', 'cipher');
      const names = keys.length > 1 ? ['БЛЮДЦЕ: 1-я, 3-я, 5-я… буквы', 'ЧАШКА: 2-я, 4-я, 6-я… буквы'] : ['БЛЮДЦЕ'];
      const draw = () => {
        out.textContent = ct.map(o => o.k == null ? o.ch : ABC[mod(ABC.indexOf(o.ch) - sh[o.k], 33)]).join('');
        wrap.querySelectorAll('.ring-in').forEach((g, i) => { g.style.transform = `rotate(${-sh[i] * 360 / 33}deg)`; });
      };
      keys.forEach((_, i) => {
        const d = el('div', 'disk', `<svg viewBox="0 0 220 220"><circle cx="110" cy="110" r="106" fill="#f1ecdf" stroke="#000" stroke-width="3"/>${ring(90, 12, 'ro')}
          <circle cx="110" cy="110" r="80" fill="#fff" stroke="#d0142c" stroke-width="3"/><g class="ring-in">${ring(64, 11, 'ri')}</g>
          <circle cx="110" cy="110" r="52" fill="#f1ecdf" stroke="#000" stroke-width="2"/><path d="M110 2v20" stroke="#d0142c" stroke-width="3"/></svg><div class="disk-name">${names[i]}</div>`);
        const row = el('div', 'mech-row');
        const l = btn('btn ghost', '↺'), r = btn('btn ghost', '↻');
        l.setAttribute('aria-label', names[i] + ' влево'); r.setAttribute('aria-label', names[i] + ' вправо');
        row.append(l, r); d.appendChild(row); wrap.appendChild(d);
        hold(l, () => { sh[i] = mod(sh[i] - 1, 33); draw(); });
        hold(r, () => { sh[i] = mod(sh[i] + 1, 33); draw(); });
      });
      A.append(wrap, el('div', 'order-h', 'ЧТО ЧИТАЕТСЯ СЕЙЧАС'), out);
      draw();
      return { empty: () => false, check: () => keys.every((k, i) => sh[i] === k) };
    },
    /* --- штриховка карандашом --- */
    rub(v, A, ctx) {
      const box = el('div', 'rub', `<div class="rub-under">${v.reveal}</div><canvas></canvas>`);
      A.append(box, el('p', 'note', 'Води по карточке с нажатой кнопкой мыши (или пальцем) — грифель покажет продавленные буквы.'));
      const cv = box.querySelector('canvas'), g = cv.getContext('2d', { willReadFrequently: true });
      let done = false, moves = 0;
      const init = () => {
        cv.width = box.clientWidth; cv.height = box.clientHeight;
        g.fillStyle = '#ece5d3'; g.fillRect(0, 0, cv.width, cv.height);
        g.fillStyle = 'rgba(0,0,0,.05)';
        for (let i = 0; i < 400; i++) g.fillRect(Math.random() * cv.width, Math.random() * cv.height, 2, 1);
      };
      requestAnimationFrame(init);
      const rubAt = e => {
        if (done) return;
        if (e.pointerType === 'mouse' && !(e.buttons & 1)) return;
        const r = cv.getBoundingClientRect();
        g.globalCompositeOperation = 'destination-out';
        g.fillStyle = 'rgba(0,0,0,.55)';
        g.beginPath(); g.arc((e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height, 20, 0, 7); g.fill();
        if (++moves % 12 === 0) {
          const d = g.getImageData(0, 0, cv.width, cv.height).data;
          let clear = 0, n = 0;
          for (let i = 3; i < d.length; i += 4 * 97) { n++; if (d[i] < 130) clear++; }
          if (clear / n > (v.need || 0.45)) { done = true; cv.style.opacity = 0; setTimeout(() => ctx.solve(), 500); }
        }
      };
      cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); rubAt(e); });
      cv.addEventListener('pointermove', rubAt);
      return { noCheck: true, empty: () => true, check: () => done };
    },
    /* --- зеркальце-лупа --- */
    lens(v, A) {
      const R = v.radius || 62;
      const box = el('div', 'lens', `<div class="lens-m">${v.text}</div><div class="lens-n" aria-hidden="true">${v.text}</div>`);
      A.append(box, el('p', 'note', 'Веди зеркальцем по записке.'));
      const top = box.querySelector('.lens-n');
      const move = (x, y) => {
        const W = box.clientWidth;
        top.style.transform = `translateX(${2 * x - W}px)`;
        top.style.clipPath = `circle(${R}px at ${W - x}px ${y}px)`;
      };
      const on = e => { const r = box.getBoundingClientRect(); move(e.clientX - r.left, e.clientY - r.top); };
      box.addEventListener('pointermove', on); box.addEventListener('pointerdown', on);
      requestAnimationFrame(() => move(R + 10, R));
      const inner = el('div');
      A.appendChild(inner);
      return TYPES[v.answerType || 'input'](v, inner);
    },
    /* --- шестерни --- */
    gears(v, A) {
      const K = 2, GOLD = '#d8b25a', RED = '#d0142c';
      const slotVal = {};
      v.train.forEach(g => { if (g.slot) slotVal[g.id] = null; });
      let keyTurns = 0, busy = false, shown = 0;
      const box = el('div', 'gears'), info = el('div', 'gear-info');
      const teethOf = g => g.slot ? slotVal[g.id] : g.teeth;
      function speeds() {
        const s = [];
        v.train.forEach((g, i) => { s.push(i === 0 ? 1 : g.link === 'axle' ? s[i - 1] : -s[i - 1] * teethOf(v.train[i - 1]) / teethOf(g)); });
        return s;
      }
      function layout() {
        let x = 0; const L = [];
        v.train.forEach((g, i) => {
          const t = teethOf(g), r = (t || 14) * K;
          if (i === 0) x = r + 14; else x += L[i - 1].r + r + (g.link === 'axle' ? 44 : 6);
          L.push({ x, r, t });
        });
        return L;
      }
      function draw() {
        const L = layout(), cy = 104, last = L[L.length - 1];
        const W = last.x + last.r + (v.indicator === 'needle' ? 120 : 20);
        let h = `<svg viewBox="0 0 ${W} 208"><rect width="${W}" height="208" fill="#0a0a0a"/>`;
        v.train.forEach((g, i) => {
          if (g.link === 'axle') h += `<rect x="${L[i - 1].x}" y="${cy - 7}" width="${L[i].x - L[i - 1].x}" height="14" fill="${GOLD}"/><text x="${(L[i - 1].x + L[i].x) / 2}" y="${Math.min(202, cy + Math.max(L[i].r, L[i - 1].r) + 18)}" text-anchor="middle" font-family="monospace" font-size="11" fill="#fff">одна ось</text>`;
        });
        v.train.forEach((g, i) => {
          const { x, r, t } = L[i], col = g.role === 'out' ? RED : GOLD;
          if (g.slot && !t) {
            h += `<g class="gslot" data-slot="${g.id}"><circle cx="${x}" cy="${cy}" r="${r}" fill="#111" stroke="#fff" stroke-width="2" stroke-dasharray="6 5"/><text x="${x}" y="${cy + 5}" text-anchor="middle" font-family="Russo One, Arial Black, sans-serif" font-size="14" fill="#fff">${g.label}?</text></g>`;
            return;
          }
          const n = Math.max(8, Math.round(t * 0.75));
          h += `<g class="${g.slot ? 'gslot' : ''}" data-slot="${g.slot ? g.id : ''}"><g class="grot" data-i="${i}"><circle cx="${x}" cy="${cy}" r="${r}" fill="#111" stroke="${col}" stroke-width="4"/>` +
            Array.from({ length: n }, (_, k) => `<rect x="${x - 3}" y="${cy - r - 6}" width="6" height="7" fill="${col}" transform="rotate(${k * 360 / n} ${x} ${cy})"/>`).join('') +
            (g.role === 'out' && v.indicator === 'hand' ? `<path d="M${x} ${cy}V${cy - r + 8}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>` : `<circle cx="${x}" cy="${cy - r + 9}" r="3" fill="${col}"/>`) +
            `</g><text x="${x}" y="${cy + 1}" text-anchor="middle" font-family="Russo One, Arial Black, sans-serif" font-size="${Math.max(8, Math.min(16, r * 2.6 / g.label.length)).toFixed(1)}" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">${g.label}</text>` +
            `<text x="${x}" y="${cy + 14}" text-anchor="middle" font-family="monospace" font-size="10" fill="#ddd" stroke="#000" stroke-width="3" paint-order="stroke">${t}</text></g>`;
        });
        if (v.indicator === 'needle') {
          const nx = last.x + last.r + 4;
          h += `<g class="needle"><path d="M${nx} ${cy}h60" stroke="${RED}" stroke-width="4"/><path d="M${nx + 60} ${cy}h22" stroke="#fff" stroke-width="2"/></g><text x="${nx + 40}" y="${cy - 12}" text-anchor="middle" font-family="monospace" font-size="11" fill="${RED}">игла</text><path d="M${nx + 96} ${cy - 30}v60" stroke="#fff" stroke-width="3"/><text x="${nx + 96}" y="${cy + 46}" text-anchor="middle" font-family="monospace" font-size="10" fill="#fff">шея</text>`;
        }
        if (v.indicator === 'hand') h += `<text x="${last.x}" y="${cy - last.r - 10}" text-anchor="middle" font-family="monospace" font-size="11" fill="#fff">12</text><text x="${last.x}" y="${cy + last.r + 18}" text-anchor="middle" font-family="monospace" font-size="11" fill="${RED}">6</text>`;
        h += `<text x="${L[0].x}" y="${cy - L[0].r - 12}" text-anchor="middle" font-family="monospace" font-size="11" fill="#fff">${v.keyLabel || 'ключ'}</text></svg>`;
        box.innerHTML = h;
        box._L = L; box._cy = cy;
        box.querySelectorAll('.gslot').forEach(g => g.onclick = () => { if (busy) return; cycle(g.dataset.slot); });
        pose(shown);
      }
      function pose(turns) {
        shown = turns;
        const s = Object.values(slotVal).some(x => x == null) ? null : speeds();
        const L = box._L, cy = box._cy;
        box.querySelectorAll('.grot').forEach(g => { const i = +g.dataset.i; g.setAttribute('transform', `rotate(${s ? turns * s[i] * 360 : 0} ${L[i].x} ${cy})`); });
        const nd = box.querySelector('.needle');
        if (nd && s) nd.setAttribute('transform', `translate(${Math.max(-30, Math.min(14, turns * s[s.length - 1] * (v.needleK || 2.2)))} 0)`);
        if (v.liveInfo && s) { const o = turns * s[s.length - 1]; info.textContent = `Ключ: ${fmt(turns)} · ${v.train[v.train.length - 1].label}: ${fmt(o)}`; }
      }
      const fmt = t => { const a = Math.abs(Math.round(t * 100) / 100); return a === 0 ? '0 оборотов' : `${a} об. ${t > 0 ? 'по часовой' : 'против часовой'}`; };
      function cycle(id) {
        const g = v.train.find(x => x.id === id), used = Object.entries(slotVal).filter(([k]) => k !== id).map(([, x]) => x);
        const opts = g.slot.filter(o => !used.includes(o));
        const cur = opts.indexOf(slotVal[id]);
        slotVal[id] = cur === opts.length - 1 ? null : opts[cur + 1];
        keyTurns = 0; shown = 0; draw();
      }
      function spin(to) {
        return new Promise(res => {
          busy = true;
          const from = shown, t0 = performance.now(), dur = 650 * Math.max(1, Math.abs(to - from));
          const f = now => {
            const p = Math.min(1, (now - t0) / dur), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
            pose(from + (to - from) * e);
            if (p < 1 && document.body.contains(box)) requestAnimationFrame(f); else { busy = false; res(); }
          };
          requestAnimationFrame(f);
        });
      }
      const reset = () => { keyTurns = 0; pose(0); };
      A.append(box);
      if (v.liveInfo) A.append(info);
      const row = el('div', 'mech-row');
      A.append(row);
      draw();
      if (v.mode === 'once') {
        if (v.slotHint) A.append(el('p', 'note', v.slotHint));
        return {
          empty: () => Object.values(slotVal).some(x => x == null),
          emptyMsg: 'Сначала поставь обе шестерни: нажимай на пустые места.',
          async check() {
            if (busy) return null;
            await spin(1);
            const s = speeds(), ok = v.goal(s[s.length - 1], slotVal);
            if (!ok) { await new Promise(r => setTimeout(r, 500)); reset(); }
            return ok;
          }
        };
      }
      const turn = async d => {
        if (busy) return;
        const s = speeds(), next = keyTurns + d;
        await spin(next); keyTurns = next;
        if (v.failIf && v.failIf(next * s[s.length - 1])) { await new Promise(r => setTimeout(r, 250)); reset(); wrong(v.failMsg); }
      };
      row.append(btn('btn ghost', '↺ ПРОТИВ ЧАСОВОЙ', () => turn(-1)), btn('btn ghost', 'СБРОС', () => { if (!busy) reset(); }), btn('btn ghost', 'ПО ЧАСОВОЙ ↻', () => turn(1)));
      return {
        empty: () => keyTurns === 0, emptyMsg: 'Сначала поверни ключ.',
        check() { const s = speeds(); const ok = v.goal(keyTurns * s[s.length - 1], keyTurns); if (!ok) reset(); return ok; }
      };
    },
    /* --- поле с клетками --- */
    grid(v, A) {
      let sel = null;
      const g = el('div', 'grid' + (v.chess ? ' chess' : ''));
      g.style.gridTemplateColumns = `${v.labels ? 'auto ' : ''}repeat(${v.rows[0].length}, 1fr)`;
      v.rows.forEach((row, r) => {
        if (v.labels) g.appendChild(el('span', 'grid-l', v.labels.rows[r]));
        row.forEach((cell, c) => {
          const b = btn('cell' + ((r + c) % 2 ? ' dark' : ''), cell || '', () => { g.querySelectorAll('.cell').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sel = [r, c]; });
          b.setAttribute('aria-label', v.labels ? v.labels.cols[c] + v.labels.rows[r] + (cell ? ' ' + cell : ' пусто') : `ряд ${r + 1}, место ${c + 1}`);
          if (v.black && v.black.includes(cell)) b.classList.add('bk');
          g.appendChild(b);
        });
      });
      if (v.labels) { g.appendChild(el('span')); v.labels.cols.forEach(c => g.appendChild(el('span', 'grid-l', c))); }
      A.appendChild(g);
      return { empty: () => !sel, check: () => sel[0] === v.target[0] && sel[1] === v.target[1] };
    },
    /* --- поставить стрелки --- */
    clockset(v, A) {
      let m = v.start || 0;
      const ticks = Array.from({ length: 12 }, (_, i) => `<line x1="100" y1="${i % 3 ? 20 : 16}" x2="100" y2="30" stroke="#fff" stroke-width="${i % 3 ? 2 : 4}" transform="rotate(${i * 30} 100 100)"/>`).join('');
      const nums = v.numbers === false ? '' : [12, 3, 6, 9].map((n, i) => `<text x="${100 + [0, 58, 0, -58][i]}" y="${106 + [-58, 0, 58, 0][i]}" text-anchor="middle" font-size="16" font-family="Russo One, Arial Black, sans-serif" fill="#fff">${n}</text>`).join('');
      const w = el('div', 'clockset', `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="92" fill="#0a0a0a" stroke="#fff" stroke-width="5"/>${ticks}${nums}
        <line class="hh" x1="100" y1="100" x2="100" y2="56" stroke="#fff" stroke-width="7" stroke-linecap="round"/><line class="mh" x1="100" y1="100" x2="100" y2="30" stroke="#d0142c" stroke-width="4" stroke-linecap="round"/><circle cx="100" cy="100" r="6" fill="#fff"/></svg><div class="clock-read" aria-live="polite"></div>`);
      const draw = () => {
        const mm = mod(m, 720);
        w.querySelector('.hh').setAttribute('transform', `rotate(${mm * 0.5} 100 100)`);
        w.querySelector('.mh').setAttribute('transform', `rotate(${(mm % 60) * 6} 100 100)`);
        const h = Math.floor(mm / 60);
        w.querySelector('.clock-read').textContent = (h === 0 ? 12 : h) + ':' + String(mm % 60).padStart(2, '0');
      };
      const row = el('div', 'mech-row');
      [['−1 ч', -60], ['−5 мин', -5], ['−1 мин', -1], ['+1 мин', 1], ['+5 мин', 5], ['+1 ч', 60]].forEach(([t, d]) => { const b = btn('btn ghost', t); row.appendChild(b); hold(b, () => { m += d; draw(); }); });
      A.append(w, row);
      draw();
      return { empty: () => false, check: () => mod(m, 720) === mod(v.target, 720) };
    },
    /* --- расставить по местам --- */
    arrange(v, A) {
      const place = Object.assign({}, v.fixed || {});
      const fixed = Object.keys(v.fixed || {});
      let pick = null;
      const board = el('div', 'arr ' + (v.layout || 'row')), tray = el('div', 'tray');
      if (v.boardHtml) board.innerHTML = v.boardHtml;
      const used = () => Object.values(place);
      const render = () => {
        board.querySelectorAll('.slot').forEach(x => x.remove());
        v.slots.forEach(s => {
          const it = place[s.id] != null ? v.items.find(i => i.id === place[s.id]) : null;
          const b = btn('slot' + (it ? ' full' : '') + (fixed.includes(s.id) ? ' fixed' : ''), it ? it.label : (s.label || ''), () => {
            if (fixed.includes(s.id)) return;
            if (pick != null) { place[s.id] = pick; pick = null; } else if (it) delete place[s.id];
            render();
          });
          b.setAttribute('aria-label', (s.name || s.label || 'место') + ': ' + (it ? it.label : 'пусто'));
          if (s.x != null) { b.style.left = s.x + '%'; b.style.top = s.y + '%'; }
          board.appendChild(b);
        });
        tray.replaceChildren(...v.items.filter(i => !used().includes(i.id)).map(i => {
          const b = btn('chip' + (pick === i.id ? ' sel' : ''), i.label, () => { pick = pick === i.id ? null : i.id; render(); });
          return b;
        }));
        if (!tray.children.length) tray.appendChild(el('span', 'dim', 'Всё расставлено. Нажми на занятое место, чтобы снять.'));
      };
      A.append(board, el('div', 'order-h', v.trayLabel || 'НАЖМИ НА ПРЕДМЕТ, ПОТОМ НА МЕСТО'), tray);
      render();
      const lab = id => (v.items.find(i => i.id === id) || {}).label;
      return { empty: () => Object.keys(place).length <= fixed.length, check: () => v.slots.every(s => lab(place[s.id]) === v.solution[s.id]) };
    },
    /* --- подобрать волну --- */
    wave(v, A) {
      const val = { a: v.start ? v.start.a : 3, f: v.start ? v.start.f : 2 };
      const box = el('div', 'wave', '<canvas width="560" height="180"></canvas>');
      const cv = box.querySelector('canvas'), g = cv.getContext('2d');
      let raf = 0, t = 0;
      const line = (a, f, col, w, ph) => {
        g.strokeStyle = col; g.lineWidth = w; g.beginPath();
        for (let x = 0; x <= 560; x += 2) { const y = 90 - a * 6.6 * Math.sin((x / 560) * Math.PI * 2 * f + ph); x ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.stroke();
      };
      const draw = () => {
        t += 0.03;
        g.fillStyle = '#04100e'; g.fillRect(0, 0, 560, 180);
        g.strokeStyle = 'rgba(120,255,220,.13)'; g.lineWidth = 1;
        for (let x = 0; x <= 560; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 180); g.stroke(); }
        for (let y = 10; y <= 170; y += 20) { g.beginPath(); g.moveTo(0, y); g.lineTo(560, y); g.stroke(); }
        if (v.showTarget) line(v.target.a, v.target.f, '#d0142c', 3, t);
        line(val.a, val.f, '#fff', 2, t);
        raf = requestAnimationFrame(draw);
      };
      draw();
      current.cleanup.push(() => cancelAnimationFrame(raf));
      A.appendChild(box);
      [['a', 'РАЗМАХ'], ['f', 'ЧАСТОТА']].forEach(([k, name]) => {
        const row = el('label', 'slider', `<span>${name}</span><input type="range" min="1" max="12" step="1" value="${val[k]}" data-k="${k}"><b>${val[k]}</b>`);
        const inp = row.querySelector('input');
        inp.oninput = () => { val[k] = +inp.value; row.querySelector('b').textContent = inp.value; };
        A.appendChild(row);
      });
      A.appendChild(el('p', 'note', v.showTarget ? 'Красная волна — сигнал Шляпника. Белая — твоя. Наложи одну на другую.' : 'Сигнала на экране нет: передатчик молчит до шести. Волну придётся выставить по тому, что ты уже знаешь о карточках.'));
      return { empty: () => false, check: () => val.a === v.target.a && val.f === v.target.f };
    }
  };

  function options(v, A, many) {
    const sel = new Set();
    const box = el('div', 'opts');
    v.options.forEach((o, i) => {
      const b = btn('opt', o, () => {
        if (!many) { sel.clear(); box.querySelectorAll('.opt').forEach(x => { x.classList.remove('sel'); x.setAttribute('aria-pressed', 'false'); }); }
        if (sel.has(i)) sel.delete(i); else sel.add(i);
        b.classList.toggle('sel', sel.has(i));
        b.setAttribute('aria-pressed', String(sel.has(i)));
      });
      b.setAttribute('aria-pressed', 'false');
      box.appendChild(b);
    });
    A.appendChild(box);
    const ans = many ? v.answer : [v.answer];
    return { empty: () => !sel.size, check: () => sel.size === ans.length && ans.every(a => sel.has(a)) };
  }

  /* ================= ОКНО УЛИКИ ================= */
  // вариант улики под выбранную сложность
  function variant(clue) { return Object.assign({}, clue, clue[diff] || {}); }

  function openClue(clue) {
    if (current) current.cleanup.forEach(f => f());
    const v = variant(clue);
    current = { clue, v, cleanup: [] };
    const solved = !!st.solved[clue.id];
    $('mTitle').textContent = clue.name;
    let ex = v.exhibit ? v.exhibit(diff) : '';
    const aids = [];
    if (diff !== 'hard' && v.aid) aids.push(v.aid);
    if (diff === 'easy' && v.aidEasy) aids.push(v.aidEasy);
    if (aids.length) ex += `<div class="aid"><b>СПРАВОЧНИК СТАЖЁРА</b>${aids.map(a => `<p>${a}</p>`).join('')}</div>`;
    $('mExhibit').innerHTML = ex;
    $('mExhibit').querySelectorAll('[data-flip]').forEach(b => b.onclick = () => $('mExhibit').querySelector(b.dataset.flip).classList.toggle('flipped'));
    $('mQuestion').textContent = v.q;
    $('mFeedback').textContent = '';
    const A = $('mAnswer');
    A.innerHTML = '';
    if (!solved) current.api = TYPES[v.type](v, A, { solve: () => solve() });
    $('mConclusion').hidden = !solved;
    $('mConclusion').textContent = clue.done;
    $('mCheck').hidden = solved || !!(current.api && current.api.noCheck);
    $('mCheck').textContent = v.checkLabel || 'ПРОВЕРИТЬ';
    $('mCheck').disabled = false;
    $('mHint').hidden = solved;
    hintLabel();
    $('modal').hidden = false;
    $('modal').scrollTop = 0;
    document.querySelector('.m-body').scrollTop = 0;
    const inp = A.querySelector('input[type=text]');
    if (inp && window.innerWidth > 900) inp.focus();
  }

  function wrong(msg) {
    st.wrongN = (st.wrongN || 0) + 1;
    $('mFeedback').textContent = 'Неверно.';
    batSay(msg || C.wrong[st.wrongN % C.wrong.length], 'БЭТМЕН');
    document.querySelector('.modal-card').animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-9px)' }, { transform: 'translateX(9px)' }, { transform: 'translateX(0)' }], { duration: 220 });
  }

  async function check() {
    const clue = current.clue, api = current.api;
    if (st.solved[clue.id] || !api) return;
    if (api.empty()) { $('mFeedback').textContent = api.emptyMsg || 'Сначала дай ответ.'; return; }
    $('mCheck').disabled = true;
    const ok = await api.check();
    $('mCheck').disabled = false;
    if (ok === null) return;
    if (ok !== true) return wrong(typeof ok === 'string' ? ok : null);
    solve();
  }

  function solve() {
    const clue = current.clue;
    if (st.solved[clue.id]) return;
    st.solved[clue.id] = true;
    current.cleanup.forEach(f => f()); current.cleanup = [];
    $('mFeedback').textContent = '';
    if (!current.v.keepOnSolve) $('mAnswer').innerHTML = '';
    $('mConclusion').hidden = false;
    $('mCheck').hidden = true; $('mHint').hidden = true;
    batHide();
    document.querySelector(`.hot[data-id="${clue.id}"]`).classList.add('solved');
    $('notesEmpty').hidden = true;
    const li = el('li', st.helped[clue.id] ? 'helped' : '');
    li.innerHTML = `<b>${clue.name}</b>`;
    li.appendChild(document.createTextNode(clue.done));
    $('notes').appendChild(li);
    hud();
    $('mConclusion').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function hintLabel() {
    const lv = st.hintLevel[current.clue.id] || 0;
    $('mHint').textContent = lv === 0 ? 'СПРОСИТЬ БЭТМЕНА (−очки)' : lv < 3 ? `ЕЩЁ ПОДСКАЗКА (${lv}/3)` : 'ПОВТОРИТЬ ПОДСКАЗКУ (3/3)';
  }

  function hint() {
    const clue = current.clue, hints = current.v.hints;
    let lv = st.hintLevel[clue.id] || 0;
    if (lv < hints.length) { lv++; st.hintLevel[clue.id] = lv; st.hintsUsed++; }
    st.helped[clue.id] = true;
    batSay(hints[lv - 1], `ПОДСКАЗКА ${lv}/3`);
    hintLabel(); hud();
  }

  function closeModal() {
    $('modal').hidden = true;
    if (current) { current.cleanup.forEach(f => f()); current.cleanup = []; }
    batHide();
    const sc = C.scenes[st.scene];
    if (sc.clues.every(c => st.solved[c.id]) && $('nextBtn').hidden) sceneComplete();
  }

  /* ---------- финал и очки ---------- */
  function score() {
    const h = Object.keys(st.helped).length;
    if (h === 0) return 100;
    if (h <= 3) return 75;
    if (h <= Math.ceil(TOTAL * 0.6)) return 50;
    return 25;
  }

  function finale() {
    playStory(C.finale, () => {
      Pixel.wipe($('wipe'), () => {
        show('cave');
        caveCtl = Pixel.cave($('caveCanvas'));
        const pts = score(), h = Object.keys(st.helped).length;
        const info = {
          100: ['ДЕТЕКТИВ', '«Ни одного вопроса. Я в твои годы спрашивал чаще. Завтра в шесть — тренировка».'],
          75: ['НАПАРНИК', '«Пару раз ты упёрся. Но спросил вовремя и дальше шёл сам. Так и работают вдвоём».'],
          50: ['СТАЖЁР', '«Половину дела ты раскрыл сам. Вторую половину — запомни. Следующее дело покажет, запомнил ли».'],
          25: ['НОВИЧОК', '«Ты дошёл до конца, и все живы. Это главное. А думать самому — научишься. Начнём с начала».']
        }[pts];
        $('scoreRank').textContent = 'ЗВАНИЕ: ' + info[0];
        $('scoreDetail').textContent = `СЛОЖНОСТЬ: ${DIFFS[diff].name} · С ПОДСКАЗКОЙ: ${h} ИЗ ${TOTAL}`;
        $('scoreQuote').textContent = info[1];
        let n = 0;
        const t = setInterval(() => { n = Math.min(pts, n + 5); $('scoreNum').textContent = n; if (n >= pts) clearInterval(t); }, 40);
        const best = store.get(C.id);
        if (!best || pts > best.pts || (pts === best.pts && DIFF_RANK[diff] > DIFF_RANK[best.diff])) store.set(C.id, { pts, diff });
      });
    }, 'В ПЕЩЕРУ →');
  }

  /* ---------- запуск ---------- */
  function startCase() {
    st = { scene: 0, solved: {}, helped: {}, hintLevel: {}, hintsUsed: 0 };
    TOTAL = C.scenes.reduce((n, s) => n + s.clues.length, 0);
    $('hudNo').textContent = 'ДЕЛО №' + C.no;
    $('hudName').textContent = C.title;
    $('hudDiff').textContent = DIFFS[diff].name;
    $('notes').innerHTML = '';
    $('notesEmpty').hidden = false;
    show('case');
    playStory(C.briefing, () => loadScene(0), 'НАЧАТЬ ОСМОТР →');
  }

  function init() {
    roadCtl = Pixel.road($('road'));
    // папки дел
    const stack = $('stack');
    CASES.forEach(cs => {
      const best = store.get(cs.id);
      const b = el('button', 'folder open', `<span class="tab">ДЕЛО №${cs.no}</span><b>${cs.title}</b><i>${cs.teaser}</i><em>${best && best.pts ? 'ЛУЧШЕЕ: ' + best.pts + ' · ' + DIFFS[best.diff || 'hard'].name : ''}</em>`);
      b.type = 'button';
      b.dataset.case = cs.id;
      b.onclick = e => { e.stopPropagation(); C = cs; $('files').hidden = true; $('diffCase').textContent = 'ДЕЛО №' + cs.no + ' · ' + cs.title; $('diff').hidden = false; };
      stack.appendChild(b);
    });
    stack.appendChild(el('div', 'folder locked', `<span class="tab">ДЕЛО №${CASES.length + 1}</span><b>ЗАСЕКРЕЧЕНО</b><i>скоро</i>`));
    // сложность
    const dl = $('diffList');
    Object.entries(DIFFS).forEach(([k, d]) => {
      const b = el('button', 'diff-b', `<b>${d.name}</b><i>${d.note}</i>`);
      b.type = 'button'; b.dataset.diff = k;
      b.onclick = e => {
        e.stopPropagation();
        diff = k;
        dl.querySelectorAll('button').forEach(x => x.disabled = true);
        $('diff').classList.add('go');
        $('pxSub').textContent = 'Полный газ!';
        roadCtl.boost(() => { roadCtl.stop(); startCase(); });
      };
      dl.appendChild(b);
    });
    $('diffBack').onclick = e => { e.stopPropagation(); $('diff').hidden = true; $('files').hidden = false; };

    let shown = false;
    const reveal = () => { if (shown) return; shown = true; $('files').hidden = false; $('pxSub').textContent = 'Капитан Гордон передал папки. Стажировка продолжается.'; };
    setTimeout(reveal, 2600);
    $('intro').addEventListener('click', reveal);

    $('mClose').onclick = closeModal;
    $('modal').addEventListener('click', e => { if (e.target === $('modal')) closeModal(); });
    $('mCheck').onclick = check;
    $('mHint').onclick = hint;
    $('batClose').onclick = batHide;
    $('detBtn').onclick = () => {
      const on = $('case').classList.toggle('det');
      $('detBtn').setAttribute('aria-pressed', String(on));
    };
    $('againBtn').onclick = () => location.reload();
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('modal').hidden) closeModal(); });
  }

  init();
})();
