/* Движок: заставка → выбор дела и сложности → расследование → финал → пещера с очками. */
(function () {
  const $ = id => document.getElementById(id);
  const CASES = [window.CASE1, window.CASE2, window.CASE3].filter(Boolean);
  const CAMPAIGN = window.CAMPAIGN || [];
  const ALL_CASES = CASES.concat(...CAMPAIGN.map(ch => ch.cases));
  const DIFFS = {
    easy: { name: 'ЛЁГКАЯ', note: 'Справочник под рукой, часть ответов — на выбор' },
    medium: { name: 'СРЕДНЯЯ', note: 'Справочник под рукой, отвечаешь сам' },
    hard: { name: 'СЛОЖНАЯ', note: 'Только улики и твоя голова' }
  };
  const DIFF_RANK = { easy: 0, medium: 1, hard: 2 };
  let C, TOTAL, st, diff = 'medium', roadCtl, caveCtl, current = null, diffFrom = 'files';
  const sfx = n => { if (window.Sound) Sound.sfx(n); };

  /* ---------- настройки ---------- */
  const SET_KEY = 'gcf_settings';
  const settings = Object.assign({ music: 60, sfx: 70, bright: 100, contrast: 100, text: 'normal', rain: true, big: false, calm: false },
    (() => { try { return JSON.parse(localStorage.getItem(SET_KEY)) || {}; } catch (e) { return {}; } })());
  const TEXT_SPEED = { instant: 0, fast: 0.4, normal: 1, slow: 1.9 };
  function applySettings() {
    const r = document.documentElement.style;
    r.setProperty('--bright', settings.bright / 100);
    r.setProperty('--contrast', settings.contrast / 100);
    document.body.classList.toggle('no-rain', !settings.rain);
    document.body.classList.toggle('big-text', settings.big);
    document.body.classList.toggle('calm', settings.calm);
    if (window.Sound) { Sound.setVolume('music', settings.music / 100); Sound.setVolume('sfx', settings.sfx / 100); }
    try { localStorage.setItem(SET_KEY, JSON.stringify(settings)); } catch (e) { /* не страшно */ }
  }

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
    if (settings.text === 'instant' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { node.textContent = text; node._full = text; return; }
    let i = 0;
    node.textContent = '';
    node._full = text;
    node._t = setInterval(() => {
      i += 2;
      node.textContent = text.slice(0, i);
      if (i >= text.length) { clearInterval(node._t); node._t = null; }
    }, (speed || 16) * TEXT_SPEED[settings.text]);
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
      sfx('page');
      i++;
      if (i >= pages.length) { box.hidden = true; onEnd(); } else render();
    };
    box.hidden = false;
    render();
  }

  /* ---------- сцена ---------- */
  const sceneDone = i => C.scenes[i].clues.every(c => st.solved[c.id]);
  const scenesDone = () => C.scenes.every((_, i) => sceneDone(i));
  const allDone = () => scenesDone() && (!C.archive || !!st.solved.archive);
  const finalAction = () => { if (C.interrogation && !st.solved.interrogation) openClue(interroClue()); else toFinale(); };
  const interroClue = () => Object.assign({ id: 'interrogation', type: 'interrogate', checkLabel: '', exhibit: () => '' }, C.interrogation);
  const allTraces = () => C.scenes.flatMap(sc => sc.clues.filter(c => c.type === 'trace'));
  const ALL_COUNT = () => C.scenes.reduce((n, sc) => n + sc.clues.length, 0) + (C.archive ? 1 : 0) + (C.interrogation ? 1 : 0);
  // загадка архива — «виртуальная» улика без места на сцене
  const archiveClue = () => ({ id: 'archive', name: C.archive.name, type: 'archive', q: C.archive.q, hints: C.archive.hints, done: C.archive.done, checkLabel: 'ОТПРАВИТЬ В БЭТ-КОМПЬЮТЕР', exhibit: () => `<p class="note">Нажми на след слева, потом на досье беглеца, к которому он подходит, — запись появится в досье и в блокноте. Нажми на запись в досье, чтобы её стереть. Когда все следы будут записаны, отправь архив на проверку: бэт-компьютер скажет только, сколько записей верны.</p>` });
  const openArchive = () => openClue(archiveClue());
  const shortName = sc => sc.loc.split(' · ')[1] || sc.loc;

  function hud() {
    const solved = Object.keys(st.solved).length;
    $('hudClues').textContent = solved + '/' + ALL_COUNT();
    $('hudHints').textContent = st.hintsUsed;
    $('hudDiff').textContent = DIFFS[diff].name;
    renderPlaces();
    updateNext();
  }

  // карта дела: места можно осматривать в любом порядке
  function renderPlaces() {
    const box = $('places');
    box.innerHTML = '';
    C.scenes.forEach((sc, i) => {
      const done = sc.clues.filter(c => st.solved[c.id]).length, all = sc.clues.length;
      const b = btn('place' + (i === st.scene ? ' cur' : '') + (done === all ? ' done' : ''), '', () => goScene(i));
      b.innerHTML = `<b>${i + 1}</b><span>${shortName(sc)}</span><i>${done === all ? '✓' : done + '/' + all}</i>`;
      b.setAttribute('aria-label', `Место ${i + 1}: ${shortName(sc)}, улик найдено ${done} из ${all}`);
      if (i === st.scene) b.setAttribute('aria-current', 'true');
      box.appendChild(b);
    });
    if (C.archive) {
      const tr = allTraces(), got = tr.filter(t => st.solved[t.id]).length, ok = !!st.solved.archive;
      const a = btn('place arch' + (ok ? ' done' : ''), '', openArchive);
      a.innerHTML = `<b>А</b><span>АРХИВ АРКХЕМА</span><i>${ok ? '✓' : got + '/' + tr.length}</i>`;
      a.setAttribute('aria-label', `Архив Аркхема: следов найдено ${got} из ${tr.length}`);
      box.appendChild(a);
    }
    const fin = allDone();
    const f = btn('place final' + (fin ? ' open' : ''), '', () => { if (fin) finalAction(); });
    f.innerHTML = `<b>★</b><span>${C.finalLabel || 'ЛОГОВО'}</span><i>${fin ? 'открыто' : '🔒'}</i>`;
    f.disabled = !fin;
    f.title = fin ? 'Все улики собраны' : (C.archive ? 'Откроется, когда соберёшь все улики и проверишь архив' : 'Откроется, когда соберёшь все улики во всех местах');
    box.appendChild(f);
  }

  function nextTarget() {
    if (allDone()) return { label: (C.finalLabel ? 'НА ' + C.finalLabel : 'К ЛОГОВУ') + ' →', fn: finalAction };
    if (scenesDone() && C.archive) return { label: 'В АРХИВ →', fn: openArchive };
    const n = C.scenes.length;
    for (let k = 1; k <= n; k++) { const i = (st.scene + k) % n; if (!sceneDone(i)) return { label: `МЕСТО ${i + 1} →`, fn: () => goScene(i) }; }
    return null;
  }

  function updateNext() {
    const b = $('nextBtn');
    const t = sceneDone(st.scene) ? nextTarget() : null;
    b.hidden = !t;
    if (t) { b.textContent = t.label; b.onclick = () => { batHide(); t.fn(); }; }
  }

  function goScene(i) {
    if (i === st.scene || st.moving) return;
    st.moving = true;
    batHide();
    sfx('whoosh');
    Pixel.wipe($('wipe'), () => { loadScene(i); st.moving = false; });
  }

  function toFinale() {
    if (st.finished) return;
    st.finished = true;
    batHide();
    finale();
  }

  function renderNotes() {
    const ol = $('notes');
    ol.innerHTML = '';
    C.scenes.forEach(sc => {
      const got = sc.clues.filter(c => st.solved[c.id]);
      if (!got.length) return;
      const h = el('li', 'place');
      h.textContent = sc.loc.split(' · ').slice(0, 2).join(' · ');
      ol.appendChild(h);
      got.forEach(c => {
        const li = el('li', (st.helped[c.id] ? 'helped' : '') + (c.type === 'trace' ? ' trace' : ''));
        li.innerHTML = `<b>${c.name}</b>`;
        li.appendChild(document.createTextNode(c.done));
        ol.appendChild(li);
      });
    });
    if (C.archive && st.links && Object.keys(st.links).length) {
      const h = el('li', 'place'); h.textContent = 'АРХИВ АРКХЕМА · ЗАПИСИ'; ol.appendChild(h);
      allTraces().filter(t => st.links[t.id]).forEach(t => {
        const f = C.archive.fugitives.find(x => x.id === st.links[t.id]);
        const li = el('li', 'link'); li.innerHTML = `<b>${t.name}</b>`; li.appendChild(document.createTextNode('Возможно: ' + f.name + (f.alias ? ' («' + f.alias + '»)' : '') + '.'));
        ol.appendChild(li);
      });
      if (st.solved.archive) { const li = el('li'); li.innerHTML = '<b>Архив проверен</b>'; li.appendChild(document.createTextNode(C.archive.done)); ol.appendChild(li); }
    }
    if (C.interrogation && st.solved.interrogation) { const h = el('li', 'place'); h.textContent = 'ДОПРОС'; ol.appendChild(h); const li = el('li'); li.innerHTML = '<b>Показания</b>'; li.appendChild(document.createTextNode(C.interrogation.done)); ol.appendChild(li); }
    $('notesEmpty').hidden = !!ol.children.length;
  }

  function loadScene(i) {
    st.scene = i;
    const sc = C.scenes[i];
    $('loc').textContent = sc.loc;
    type($('narr'), sc.narr, 12);
    $('scene').innerHTML = Art[sc.art]() + sc.clues.map(c =>
      `<button class="hot${st.solved[c.id] ? ' solved' : ''}${c.type === 'trace' ? ' trace' : ''}" data-id="${c.id}" aria-label="${c.type === 'trace' ? 'След: ' : ''}${c.name}" style="left:${c.hot.x}%;top:${c.hot.y}%;width:${c.hot.w}%;height:${c.hot.h}%"><span class="hot-label">${c.name}</span></button>`).join('');
    $('scene').querySelectorAll('.hot').forEach(b => b.onclick = () => openClue(sc.clues.find(c => c.id === b.dataset.id)));
    $('case').scrollTop = 0;
    hud();
  }

  function sceneComplete() {
    const sc = C.scenes[st.scene];
    st.announced[st.scene] = true;
    const t = nextTarget();
    batSay(sc.outro, 'БЭТМЕН', t ? { label: t.label, fn: () => { batHide(); t.fn(); } } : null);
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
        const set = d => { pos[i] = mod(pos[i] + d, syms.length); face.textContent = syms[pos[i]]; face.classList.remove('tick'); void face.offsetWidth; face.classList.add('tick'); sfx('tick'); };
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
        sfx('tick');
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
        hold(l, () => { sh[i] = mod(sh[i] - 1, 33); sfx('tick'); draw(); });
        hold(r, () => { sh[i] = mod(sh[i] + 1, 33); sfx('tick'); draw(); });
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
        if (moves % 5 === 0) sfx('scrape');
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
          sfx('clunk');
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
      const g = el('div', 'grid' + (v.chess ? ' chess' : '') + (v.plain ? ' plan' : ''));
      g.style.gridTemplateColumns = `${v.labels ? 'auto ' : ''}repeat(${v.rows[0].length}, 1fr)`;
      v.rows.forEach((row, r) => {
        if (v.labels) g.appendChild(el('span', 'grid-l', v.labels.rows[r]));
        row.forEach((cell, c) => {
          const b = btn('cell' + (!v.plain && (r + c) % 2 ? ' dark' : '') + (v.plain ? ' plain' : ''), cell || '', () => { g.querySelectorAll('.cell').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sel = [r, c]; sfx('click'); });
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
      [['−1 ч', -60], ['−5 мин', -5], ['−1 мин', -1], ['+1 мин', 1], ['+5 мин', 5], ['+1 ч', 60]].forEach(([t, d]) => { const b = btn('btn ghost', t); row.appendChild(b); hold(b, () => { m += d; sfx('tick'); draw(); }); });
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
            if (pick != null) { place[s.id] = pick; pick = null; sfx('click'); } else if (it) delete place[s.id];
            render();
          });
          b.setAttribute('aria-label', (s.name || s.label || 'место') + ': ' + (it ? it.label : 'пусто'));
          if (s.x != null) { b.style.left = s.x + '%'; b.style.top = s.y + '%'; }
          board.appendChild(b);
        });
        tray.replaceChildren(...v.items.filter(i => !used().includes(i.id)).map(i => {
          const b = btn('chip' + (pick === i.id ? ' sel' : ''), i.label, () => { pick = pick === i.id ? null : i.id; sfx('click'); render(); });
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

  Object.assign(TYPES, {
    /* --- найди отличия --- */
    spot(v, A, ctx) {
      const found = new Set();
      const box = el('div', 'spot', `<figure><figcaption>ДО</figcaption>${v.refArt()}</figure><figure class="after"><figcaption>ПОСЛЕ — нажимай здесь</figcaption>${v.imgArt()}</figure>`);
      const cnt = el('p', 'spot-count');
      A.append(box, cnt);
      const svgEl = box.querySelector('.after svg');
      const NS = 'http://www.w3.org/2000/svg';
      const upd = () => { cnt.textContent = `Найдено: ${found.size} из ${v.diffs.length}`; };
      upd();
      svgEl.style.cursor = 'crosshair';
      svgEl.addEventListener('click', e => {
        const pt = svgEl.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        const p = pt.matrixTransform(svgEl.getScreenCTM().inverse());
        const i = v.diffs.findIndex((d, k) => !found.has(k) && Math.hypot(d.x - p.x, d.y - p.y) <= d.r + 6);
        if (i >= 0) {
          found.add(i); sfx('tick');
          const d = v.diffs[i], c = document.createElementNS(NS, 'circle');
          c.setAttribute('cx', d.x); c.setAttribute('cy', d.y); c.setAttribute('r', d.r); c.setAttribute('class', 'spot-ring');
          svgEl.appendChild(c); upd();
          if (found.size === v.diffs.length) setTimeout(() => ctx.solve(), 450);
        } else {
          const x = document.createElementNS(NS, 'path');
          x.setAttribute('d', `M${p.x - 7} ${p.y - 7}l14 14m0 -14l-14 14`); x.setAttribute('class', 'spot-miss');
          svgEl.appendChild(x); setTimeout(() => x.remove(), 700);
        }
      });
      return { noCheck: true, empty: () => true, check: () => found.size === v.diffs.length };
    },
    /* --- сравнить отпечаток --- */
    print(v, A) {
      let rot = 0, sel = null;
      const ref = v.refs.find(r => r.id === v.answer);
      const ang = () => ((v.start + rot) % 12) * 30;
      const fragSvg = () => `<svg viewBox="-40 -40 80 80"><defs><clipPath id="fragc"><circle r="36"/></clipPath></defs><circle r="38" fill="#ece5d3"/><g clip-path="url(#fragc)"><g transform="rotate(${ang()}) translate(-10 6)">${Art.fingerprint(ref.kind, ref.seed, '#111')}</g></g><circle r="37" fill="none" stroke="#000" stroke-width="2"/></svg>`;
      const wrap = el('div', 'print');
      const left = el('div', 'print-frag');
      const cards = el('div', 'print-cards');
      const cmp = el('div', 'print-cmp');
      const draw = () => {
        left.querySelector('.fr').innerHTML = fragSvg();
        cards.querySelectorAll('.pcard').forEach(c => c.classList.toggle('sel', c.dataset.id === sel));
        if (!sel) { cmp.innerHTML = '<span class="dim">Выбери карточку, чтобы наложить на неё фрагмент.</span>'; return; }
        const r = v.refs.find(x => x.id === sel);
        cmp.innerHTML = `<svg viewBox="-70 -70 140 140"><rect x="-70" y="-70" width="140" height="140" fill="#ece5d3"/>${Art.fingerprint(r.kind, r.seed, '#222')}
          <g transform="translate(10 -6)"><circle r="36" fill="rgba(208,20,44,.08)" stroke="#d0142c" stroke-width="1.5" stroke-dasharray="4 3"/><g clip-path="url(#fragc)"><g opacity=".75" transform="rotate(${ang()}) translate(-10 6)">${Art.fingerprint(ref.kind, ref.seed, '#d0142c')}</g></g></g></svg>`;
      };
      left.innerHTML = `<div class="fr"></div><div class="order-h">${v.fragLabel || 'ФРАГМЕНТ С НОЖА'}</div>`;
      const row = el('div', 'mech-row');
      const l = btn('btn ghost', '↺'), r = btn('btn ghost', '↻');
      l.setAttribute('aria-label', 'Повернуть фрагмент влево'); r.setAttribute('aria-label', 'Повернуть фрагмент вправо');
      row.append(l, r); left.appendChild(row);
      hold(l, () => { rot = (rot + 11) % 12; sfx('tick'); draw(); });
      hold(r, () => { rot = (rot + 1) % 12; sfx('tick'); draw(); });
      v.refs.forEach(rf => {
        const c = btn('pcard', '', () => { sel = rf.id; sfx('click'); draw(); });
        c.dataset.id = rf.id;
        c.innerHTML = `<svg viewBox="-70 -70 140 140"><rect x="-70" y="-70" width="140" height="140" fill="#ece5d3"/>${Art.fingerprint(rf.kind, rf.seed, '#222')}</svg><span>${rf.label}</span>`;
        cards.appendChild(c);
      });
      wrap.append(left, cards);
      A.append(wrap, el('div', 'order-h', 'НАЛОЖЕНИЕ'), cmp);
      draw();
      return { empty: () => !sel, emptyMsg: 'Сначала выбери карточку.', check: () => sel === v.answer && (v.start + rot) % 12 === 0 ? true : (sel === v.answer ? 'Карточка та. Но линии не легли — поверни фрагмент точнее.' : false) };
    },
    /* --- разложить по двум коробкам --- */
    sort(v, A) {
      const where = {};
      let pick = null;
      const bins = el('div', 'bins'), tray = el('div', 'tray');
      const render = () => {
        bins.innerHTML = '';
        v.bins.forEach(b => {
          const box = el('div', 'bin');
          const head = btn('bin-h', b.label, () => { if (pick) { where[pick] = b.id; pick = null; sfx('click'); render(); } });
          box.appendChild(head);
          v.items.filter(i => where[i.id] === b.id).forEach(i => box.appendChild(btn('chip in', i.label, () => { delete where[i.id]; render(); })));
          box.onclick = e => { if (e.target === box && pick) { where[pick] = b.id; pick = null; sfx('click'); render(); } };
          bins.appendChild(box);
        });
        tray.replaceChildren(...v.items.filter(i => !where[i.id]).map(i => btn('chip' + (pick === i.id ? ' sel' : ''), i.label, () => { pick = pick === i.id ? null : i.id; sfx('click'); render(); })));
        if (!tray.children.length) tray.appendChild(el('span', 'dim', 'Всё разложено. Нажми на вещь в коробке, чтобы вернуть её.'));
      };
      A.append(el('div', 'order-h', 'ВЕЩИ: НАЖМИ НА ВЕЩЬ, ПОТОМ НА ЗАГОЛОВОК КОРОБКИ'), tray, bins);
      render();
      return { empty: () => !Object.keys(where).length, check: () => v.items.every(i => where[i.id] === i.bin) };
    },
    /* --- допрос: предъяви улику, когда он лжёт --- */
    interrogate(v, A, ctx) {
      let r = 0;
      const box = el('div', 'interro');
      box.innerHTML = `<div class="i-face">${Art[v.portrait || 'phosPortrait']()}</div><div class="i-talk"><div class="i-log"></div><div class="i-now"></div><div class="order-h">ПРЕДЪЯВИТЬ УЛИКУ ИЗ БЛОКНОТА</div><div class="i-opts opts"></div><div class="i-step"></div></div>`;
      const log = box.querySelector('.i-log'), now = box.querySelector('.i-now'), opts = box.querySelector('.i-opts'), step = box.querySelector('.i-step');
      const render = () => {
        const R = v.rounds[r];
        now.innerHTML = `<p class="i-line">${R.line}</p>`;
        step.textContent = `Ложь ${r + 1} из ${v.rounds.length}`;
        opts.replaceChildren(...R.options.map((o, i) => btn('opt', o, () => {
          if (R.answer.includes(i)) {
            sfx('ok');
            log.insertAdjacentHTML('beforeend', `<p class="i-old">${R.line}</p><p class="i-ev">Робин: «${o}».</p><p class="i-rep">${R.reply}</p>`);
            r++;
            if (r >= v.rounds.length) { now.innerHTML = ''; opts.innerHTML = ''; step.textContent = ''; setTimeout(() => ctx.solve(), 300); }
            else render();
          } else wrong(v.mock ? v.mock[i % v.mock.length] : '«Ха. Это ничего не доказывает». — Улика не опровергает его слова. Найди ту, что говорит обратное.');
        })));
      };
      A.appendChild(box);
      render();
      return { noCheck: true, empty: () => true, check: () => false };
    },
    /* --- архив беглецов --- */
    archive(v, A) {
      const AR = C.archive, traces = allTraces();
      let pick = null;
      const wrap = el('div', 'arch');
      const render = () => {
        const found = traces.filter(t => st.solved[t.id]);
        wrap.innerHTML = '';
        const left = el('div', 'arch-traces');
        left.appendChild(el('div', 'order-h', `СЛЕДЫ: НАЙДЕНО ${found.length} ИЗ ${traces.length}`));
        if (!found.length) left.appendChild(el('p', 'dim', 'Пока ни одного. Следы — это предметы на местах преступлений без загадки: их достаточно осмотреть.'));
        found.forEach(t => {
          const f = AR.fugitives.find(x => x.id === st.links[t.id]);
          const b = btn('tchip' + (pick === t.id ? ' sel' : '') + (f ? ' linked' : ''), '', () => { pick = pick === t.id ? null : t.id; sfx('click'); render(); });
          b.innerHTML = `<b>${t.name}</b><span>${t.done}</span>${f ? `<em>→ ${f.name}</em>` : ''}`;
          left.appendChild(b);
        });
        const grid = el('div', 'arch-dossiers');
        AR.fugitives.forEach(f => {
          const linked = found.filter(t => st.links[t.id] === f.id);
          const card = el('div', 'dossier' + (pick ? ' target' : '') + (f.id === 'unknown' ? ' blank' : ''));
          card.innerHTML = `<div class="mug">${Art.mug(f.id)}</div><div class="dos-body"><b>${f.name}</b>${f.alias ? `<i>«${f.alias}»</i>` : ''}
            <table><tr><td>Рост</td><td>${f.h}${typeof f.h === 'number' ? ' см' : ''}</td><td>Вес</td><td>${f.w}${typeof f.w === 'number' ? ' кг' : ''}</td></tr><tr><td>Обувь</td><td>${f.shoe}</td><td>Кровь</td><td>${f.blood}</td></tr><tr><td>Волосы</td><td colspan="3">${f.hair}</td></tr><tr><td>Рука</td><td colspan="3">${f.hand}</td></tr></table>
            <p>${f.habit}</p></div>`;
          const notes = el('div', 'dos-notes');
          linked.forEach(t => notes.appendChild(btn('note-chip', '✎ ' + t.name + ' ×', e => { e.stopPropagation(); delete st.links[t.id]; sfx('scrape'); renderNotes(); render(); })));
          card.appendChild(notes);
          card.addEventListener('click', () => { if (!pick) return; st.links[pick] = f.id; pick = null; sfx('click'); renderNotes(); render(); });
          grid.appendChild(card);
        });
        wrap.append(left, grid);
      };
      A.appendChild(wrap);
      render();
      return {
        empty: () => false,
        check() {
          const found = traces.filter(t => st.solved[t.id]);
          if (found.length < traces.length) return `Рано. Найдено следов: ${found.length} из ${traces.length}. Осмотри все места.`;
          const miss = traces.filter(t => !st.links[t.id]).length;
          if (miss) return `Не все следы записаны: осталось ${miss}.`;
          const ok = traces.filter(t => st.links[t.id] === t.owner).length;
          return ok === traces.length ? true : `Бэт-компьютер: совпало ${ok} из ${traces.length}. Где-то ошибка.`;
        }
      };
    }
  });

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
    if (v.type === 'trace') {
      $('mQuestion').textContent = '';
      $('mConclusion').hidden = true;
      $('mCheck').hidden = true; $('mHint').hidden = true;
      $('modal').hidden = false; document.body.classList.add('modal-open');
      A.innerHTML = `<p class="trace-ok">${solved ? 'След уже в архиве.' : 'След добавлен в архив Аркхема.'} Открой архив на карте дела, чтобы записать, на кого он указывает.</p>`;
      if (!solved) { st.solved[clue.id] = true; const h = document.querySelector(`.hot[data-id="${clue.id}"]`); if (h) h.classList.add('solved'); renderNotes(); sfx('page'); hud(); }
      return;
    }
    if (!solved) current.api = TYPES[v.type](v, A, { solve: () => solve() });
    $('mConclusion').hidden = !solved;
    $('mConclusion').textContent = clue.done;
    $('mCheck').hidden = solved || !!(current.api && current.api.noCheck);
    $('mCheck').textContent = v.checkLabel || 'ПРОВЕРИТЬ';
    $('mCheck').disabled = false;
    $('mHint').hidden = solved;
    hintLabel();
    $('modal').hidden = false;
    document.body.classList.add('modal-open');
    $('modal').scrollTop = 0;
    document.querySelector('.m-body').scrollTop = 0;
    const inp = A.querySelector('input[type=text]');
    if (inp && window.innerWidth > 900) inp.focus();
  }

  function wrong(msg) {
    sfx('wrong');
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
    const hotEl = document.querySelector(`.hot[data-id="${clue.id}"]`);
    if (hotEl) hotEl.classList.add('solved');
    renderNotes();
    sfx('ok');
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
    sfx('hint');
    batSay(hints[lv - 1], `ПОДСКАЗКА ${lv}/3`);
    hintLabel(); hud();
  }

  function closeModal() {
    $('modal').hidden = true;
    document.body.classList.remove('modal-open');
    if (current) { current.cleanup.forEach(f => f()); current.cleanup = []; }
    batHide();
    const sc = C.scenes[st.scene];
    if (current && current.clue.id === 'interrogation' && st.solved.interrogation) { toFinale(); return; }
    if (sceneDone(st.scene) && !st.announced[st.scene]) sceneComplete();
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
        if (window.Sound) Sound.play('cave');
        caveCtl = Pixel.cave($('caveCanvas'));
        const pts = score(), h = Object.keys(st.helped).length;
        const info = {
          100: ['ДЕТЕКТИВ', '«Ни одного вопроса. Я в твои годы спрашивал чаще. Завтра в шесть — тренировка».'],
          75: ['НАПАРНИК', '«Пару раз ты упёрся. Но спросил вовремя и дальше шёл сам. Так и работают вдвоём».'],
          50: ['СТАЖЁР', '«Половину дела ты раскрыл сам. Вторую половину — запомни. Следующее дело покажет, запомнил ли».'],
          25: ['НОВИЧОК', '«Ты дошёл до конца, и все живы. Это главное. А думать самому — научишься. Начнём с начала».']
        }[pts];
        $('scoreRank').textContent = 'ЗВАНИЕ: ' + info[0];
        const easiest = Object.keys(st.diffs).sort((a, b) => DIFF_RANK[a] - DIFF_RANK[b])[0] || diff;
        $('scoreDetail').textContent = `СЛОЖНОСТЬ: ${DIFFS[easiest].name}${Object.keys(st.diffs).length > 1 ? ' (менялась)' : ''} · С ПОДСКАЗКОЙ: ${h} ИЗ ${TOTAL}`;
        $('scoreQuote').textContent = info[1];
        let n = 0;
        const t = setInterval(() => { n = Math.min(pts, n + 5); $('scoreNum').textContent = n; if (n >= pts) clearInterval(t); }, 40);
        const best = store.get(C.id);
        if (!best || pts > best.pts || (pts === best.pts && DIFF_RANK[easiest] > DIFF_RANK[best.diff])) store.set(C.id, { pts, diff: easiest });
      });
    }, 'В ПЕЩЕРУ →');
  }

  /* ---------- запуск ---------- */
  function startCase() {
    st = { scene: 0, solved: {}, helped: {}, hintLevel: {}, hintsUsed: 0, announced: {}, diffs: { [diff]: true }, links: {} };
    TOTAL = C.scenes.reduce((n, s) => n + s.clues.filter(c => c.type !== 'trace').length, 0) + (C.archive ? 1 : 0) + (C.interrogation ? 1 : 0);
    $('hudNo').textContent = C.campaign ? 'ГЛ. ' + 'I'.repeat(C.chapter) + ' · ДЕЛО ' + C.no : 'ДЕЛО №' + C.no;
    $('hudName').textContent = C.title;
    $('notes').innerHTML = '';
    $('notesEmpty').hidden = false;
    $('detBtn').setAttribute('aria-pressed', 'false');
    $('case').classList.remove('det');
    show('case');
    document.body.classList.add('in-case');
    if (window.Sound) Sound.play(C.music || 'noir');
    playStory(C.briefing, () => loadScene(0), 'НАЧАТЬ ОСМОТР →');
  }

  /* ---------- окно настроек ---------- */
  function initSettings() {
    const box = $('setBody');
    const slider = (key, name, min, max, unit) => {
      const row = el('label', 'slider', `<span>${name}</span><input type="range" min="${min}" max="${max}" step="1" value="${settings[key]}"><b>${settings[key]}${unit}</b>`);
      const inp = row.querySelector('input');
      inp.oninput = () => { settings[key] = +inp.value; row.querySelector('b').textContent = inp.value + unit; applySettings(); };
      return row;
    };
    const seg = (name, opts, get, set, id) => {
      const row = el('div', 'seg-row', `<span>${name}</span><div class="seg"></div>`);
      if (id) row.id = id;
      const s = row.querySelector('.seg');
      opts.forEach(([v, label]) => {
        const b = btn('seg-b', label, () => { set(v); s.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === String(get())))); });
        b.dataset.v = v; b.setAttribute('aria-pressed', String(String(get()) === String(v)));
        s.appendChild(b);
      });
      return row;
    };
    const onoff = [[true, 'ВКЛ'], [false, 'ВЫКЛ']];
    box.append(
      el('h4', 'set-h', 'ЗВУК'),
      slider('music', 'МУЗЫКА', 0, 100, '%'),
      slider('sfx', 'ЗВУКИ', 0, 100, '%'),
      el('h4', 'set-h', 'ИЗОБРАЖЕНИЕ'),
      slider('bright', 'ЯРКОСТЬ', 50, 160, '%'),
      slider('contrast', 'КОНТРАСТ', 60, 150, '%'),
      seg('ДОЖДЬ НА СЦЕНАХ', onoff, () => settings.rain, v => { settings.rain = v; applySettings(); }),
      seg('СПОКОЙНЫЙ РЕЖИМ', [[false, 'ВЫКЛ'], [true, 'ВКЛ']], () => settings.calm, v => { settings.calm = v; applySettings(); }),
      el('h4', 'set-h', 'ТЕКСТ'),
      seg('СКОРОСТЬ ТЕКСТА', [['slow', 'МЕДЛ.'], ['normal', 'ОБЫЧН.'], ['fast', 'БЫСТР.'], ['instant', 'СРАЗУ']], () => settings.text, v => { settings.text = v; applySettings(); }),
      seg('КРУПНЫЙ ТЕКСТ', [[false, 'ВЫКЛ'], [true, 'ВКЛ']], () => settings.big, v => { settings.big = v; applySettings(); }),
      el('h4', 'set-h in-case-only', 'ИГРА'),
      seg('СЛОЖНОСТЬ', Object.entries(DIFFS).map(([k, d]) => [k, d.name]), () => diff, v => {
        diff = v; if (st) { st.diffs[v] = true; hud(); }
      }, 'setDiff')
    );
    const acts = el('div', 'set-acts in-case-only');
    acts.append(
      btn('btn ghost', 'НАЧАТЬ ДЕЛО ЗАНОВО', () => { if (confirmBox('Начать дело заново? Найденные улики пропадут.')) { closeSettings(); $('modal').hidden = true; document.body.classList.remove('modal-open'); batHide(); startCase(); } }),
      btn('btn ghost', 'К ВЫБОРУ ДЕЛ', () => { if (confirmBox('Выйти к выбору дел? Прогресс по делу не сохранится.')) location.reload(); })
    );
    box.appendChild(acts);
    box.appendChild(el('p', 'note', 'В спокойном режиме выключаются тряска, мигание и лишняя анимация. Сложность можно менять на ходу: в итоге засчитается самая лёгкая из выбранных.'));
    $('setBtn').onclick = e => { e.stopPropagation(); openSettings(); };
    $('setClose').onclick = closeSettings;
    $('settings').addEventListener('click', e => { if (e.target === $('settings')) closeSettings(); });
  }
  function confirmBox(text) { return window.confirm(text); }
  function openSettings() {
    document.querySelectorAll('#setDiff .seg-b').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === diff)));
    $('settings').hidden = false; sfx('click');
  }
  function closeSettings() { $('settings').hidden = true; }

  function init() {
    applySettings();
    initSettings();
    const unlock = () => { if (window.Sound) { Sound.unlock(); applySettings(); } };
    document.addEventListener('pointerdown', unlock, { capture: true });
    document.addEventListener('keydown', unlock, { capture: true });
    if (window.Sound) Sound.play('intro');
    roadCtl = Pixel.road($('road'));
    // папки дел: учебные дела и сюжетная кампания
    const stack = $('stack');
    const chooseCase = cs => { C = cs; $('files').hidden = true; $('chapter').hidden = true; $('diffCase').textContent = (cs.campaign ? 'ГЛАВА ' + 'I'.repeat(cs.chapter) + ' · ДЕЛО ' + cs.no : 'ДЕЛО №' + cs.no) + ' · ' + cs.title; $('diff').hidden = false; diffFrom = cs.campaign ? 'chapter' : 'files'; };
    stack.appendChild(el('p', 'stack-h', 'СТАЖИРОВКА · УЧЕБНЫЕ ДЕЛА'));
    CASES.forEach(cs => {
      const best = store.get(cs.id);
      const b = el('button', 'folder open', `<span class="tab">ДЕЛО №${cs.no}</span><b>${cs.title}</b><i>${cs.teaser}</i><em>${best && best.pts ? 'ЛУЧШЕЕ: ' + best.pts + ' · ' + DIFFS[best.diff || 'hard'].name : ''}</em>`);
      b.type = 'button';
      b.dataset.case = cs.id;
      b.onclick = e => { e.stopPropagation(); chooseCase(cs); };
      stack.appendChild(b);
    });
    // кампания открывается после всех учебных дел (?unlock — открыть сразу)
    const doneT = CASES.filter(cs => store.get(cs.id)).length;
    const open = doneT >= CASES.length || /[?&]unlock\b/.test(location.search);
    const skipped = () => { try { return localStorage.getItem('gcf_skip_training') === '1'; } catch (_) { return false; } };
    stack.appendChild(el('p', 'stack-h', 'СЮЖЕТНАЯ КАМПАНИЯ'));
    CAMPAIGN.forEach(ch => {
      const b = el('button', 'folder chapter' + (open || skipped() ? ' open' : ' locked'), `<span class="tab">ГЛАВА ${'I'.repeat(ch.no)}</span><b>${ch.title}</b><i>${open ? ch.cases.length + ' из ' + (ch.cases.length + ch.soon.length) + ' дел открыто' : 'Учебных дел пройдено: ' + doneT + ' из ' + CASES.length + (skipped() ? ' · стажировка пропущена' : ' · можно начать сразу')}</i>`);
      b.type = 'button'; b.dataset.chapter = ch.no;
      const openChapter = () => {
        $('chTitle').textContent = 'ГЛАВА ' + 'I'.repeat(ch.no) + ' · ' + ch.title;
        $('chIntro').textContent = ch.intro;
        const list = $('chList'); list.innerHTML = '';
        ch.cases.forEach(cs => {
          const best = store.get(cs.id);
          const c = el('button', 'diff-b', `<b>ДЕЛО ${cs.no} · ${cs.title}</b><i>${cs.teaser}${best ? ' · ЛУЧШЕЕ: ' + best.pts : ''}</i>`);
          c.type = 'button'; c.dataset.case = cs.id;
          c.onclick = ev => { ev.stopPropagation(); chooseCase(cs); };
          list.appendChild(c);
        });
        ch.soon.forEach(t => { const c = el('button', 'diff-b locked', `<b>${t}</b><i>засекречено · скоро</i>`); c.type = 'button'; c.disabled = true; list.appendChild(c); });
        $('files').hidden = true; $('skipAsk').hidden = true; $('chapter').hidden = false;
      };
      b.onclick = e => {
        e.stopPropagation(); sfx('click');
        if (open || skipped()) { openChapter(); return; }
        // учебные дела не пройдены — спрашиваем, точно ли начать без них
        const left = CASES.filter(cs => !store.get(cs.id)).map(cs => '«' + cs.title.charAt(0) + cs.title.slice(1).toLowerCase() + '»');
        $('skipText').textContent = `Стажировка ещё не закончена: не пройдено ${left.length} из ${CASES.length} учебных дел (${left.join(', ')}). В них Бэтмен учит всем приёмам, которые понадобятся в кампании: шифрам, отпечаткам, архиву беглецов. Начать кампанию прямо сейчас?`;
        $('skipYes').onclick = ev => { ev.stopPropagation(); sfx('ok'); try { localStorage.setItem('gcf_skip_training', '1'); } catch (_) {} b.classList.replace('locked', 'open'); b.querySelector('i').textContent = 'Учебных дел пройдено: ' + doneT + ' из ' + CASES.length + ' · стажировка пропущена'; openChapter(); };
        $('files').hidden = true; $('skipAsk').hidden = false;
      };
      stack.appendChild(b);
    });
    $('skipNo').onclick = e => { e.stopPropagation(); sfx('click'); $('skipAsk').hidden = true; $('files').hidden = false; };
    $('chBack').onclick = e => { e.stopPropagation(); $('chapter').hidden = true; $('files').hidden = false; };
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
        sfx('boost');
        roadCtl.boost(() => { roadCtl.stop(); startCase(); });
      };
      dl.appendChild(b);
    });
    $('diffBack').onclick = e => { e.stopPropagation(); $('diff').hidden = true; $(diffFrom).hidden = false; };

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
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (!$('settings').hidden) closeSettings(); else if (!$('modal').hidden) closeModal();
    });
  }

  init();
})();
