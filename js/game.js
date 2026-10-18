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
    $('batFace').innerHTML = $('batFace').innerHTML || helperArt();
    $('batTag').textContent = (!tag || tag === 'БЭТМЕН') && C && C.helper ? C.helper.name : (tag || 'БЭТМЕН');
    const b = $('bat');
    b.hidden = false;
    b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
    $('case').classList.add('with-bat');
    type($('batText'), text, 14);
  }
  function helperArt() { return C && C.helper ? Art[C.helper.art]() : Art.batman(); }
  function batHide() { $('bat').hidden = true; $('case').classList.remove('with-bat'); }

  /* ---------- сюжетные страницы ---------- */
  function playStory(pages, onEnd, lastLabel) {
    let i = 0;
    const box = $('story');
    batHide();
    function render() {
      const p = pages[i];
      const art = $('storyArt');
      art.className = 'story-art' + (p.bat || p.oracle ? ' bat-art' : '') + (p.oracle ? ' oracle-art' : '');
      art.innerHTML = (p.bat ? Art.batman() : p.oracle ? Art.oracle() : Art[p.art]()) + (p.title ? `<h1>${p.title}</h1>` : '');
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
  const sceneDone = i => C.scenes[i].hack ? !!st.solved.hack : C.scenes[i].clues.every(c => st.solved[c.id]);
  const sceneLocked = i => (C.scenes[i].requires || []).some(j => !sceneDone(j));
  const scenesDone = () => C.scenes.every((_, i) => sceneDone(i));
  const allDone = () => scenesDone() && (!C.archive || !!st.solved.archive);
  const finalAction = () => { if (C.fight && !st.solved.fight) startFight(); else if (C.interrogation && !st.solved.interrogation) openClue(interroClue()); else toFinale(); };
  // взлом под таймер: проиграть нельзя и выиграть нельзя — дело кончается взрывом
  function startHack() {
    const box = $('hack'), H = C.scenes[st.scene].hack;
    batHide(); box.hidden = false; document.body.classList.add('fighting');
    if (window.Sound) Sound.play(H.music || 'duo');
    Hack.start(box, Object.assign({ diff }, H, { onEnd: () => { st.solved.hack = true; box.hidden = true; box.innerHTML = ''; document.body.classList.remove('fighting'); endQuiet(); } }));
  }
  // конец дела без пещеры и без очков на экране: результат сохраняется молча
  function endQuiet() {
    const pts = score(), easiest = Object.keys(st.diffs).sort((a, b) => DIFF_RANK[a] - DIFF_RANK[b])[0] || diff;
    const best = store.get(C.id);
    if (!best || pts > best.pts) store.set(C.id, { pts, diff: easiest });
    if (C.after && C.after.flag) { try { localStorage.setItem(C.after.flag, '1'); } catch (_) {} }
    const go = () => Pixel.wipe($('wipe'), () => location.reload());
    if (C.finale && C.finale.length) playStory(C.finale, go, C.finaleCta || 'ДАЛЬШЕ →'); else go();
  }
  // бой в конце дела: отдельный экран с анимацией
  function startFight() {
    const box = $('fight');
    batHide(); box.hidden = false; document.body.classList.add('fighting');
    if (window.Sound) Sound.play(C.fight.music || 'duo');
    (C.fight.engine ? window[C.fight.engine] : Fight).start(box, {
      diff, capsules: C.fight.capsules || 3, title: C.fight.title, intro: C.fight.intro, cfg: C.fight,
      onWin: r => { box.hidden = true; box.innerHTML = ''; document.body.classList.remove('fighting'); st.solved.fight = true; st.fightHelp = !!(r && r.help); if (window.Sound) Sound.play(C.music); toFinale(); }
    });
  }
  const interroClue = () => Object.assign({ id: 'interrogation', type: 'interrogate', checkLabel: '', exhibit: () => '' }, C.interrogation);
  const allTraces = () => C.scenes.flatMap(sc => sc.clues.filter(c => c.type === 'trace'));
  const ALL_COUNT = () => C.scenes.reduce((n, sc) => n + sc.clues.length, 0) + (C.archive ? 1 : 0) + (C.interrogation ? 1 : 0);
  // загадка архива — «виртуальная» улика без места на сцене
  const archiveClue = () => ({ id: 'archive', name: C.archive.name, type: 'archive', q: C.archive.q, hints: C.archive.hints, done: C.archive.done, checkLabel: 'ОТПРАВИТЬ В БЭТ-КОМПЬЮТЕР', exhibit: () => `<p class="note">Нажми на след слева, потом на досье беглеца, к которому он подходит, — запись появится в досье и в блокноте. Нажми на запись в досье, чтобы её стереть. Когда все следы будут записаны, отправь архив на проверку: бэт-компьютер скажет только, сколько записей верны.</p>` });
  const openArchive = () => openClue(archiveClue());
  const shortName = sc => sc.loc.split(' · ')[1] || sc.loc;

  function hud() {
    const solved = Object.keys(st.solved).filter(k => k !== 'fight' && k !== 'hack').length;
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
      const done = sc.hack ? (st.solved.hack ? 1 : 0) : sc.clues.filter(c => st.solved[c.id]).length, all = sc.hack ? 1 : sc.clues.length, lock = sceneLocked(i);
      const b = btn('place' + (i === st.scene ? ' cur' : '') + (done === all ? ' done' : '') + (lock ? ' locked' : ''), '', () => { if (!lock) goScene(i); });
      b.innerHTML = `<b>${i + 1}</b><span>${lock ? (sc.lockName || '? ? ?') : shortName(sc)}</span><i>${lock ? '🔒' : done === all ? '✓' : sc.hack ? '!' : done + '/' + all}</i>`;
      if (lock) { b.disabled = true; b.title = 'Откроется позже'; }
      b.setAttribute('aria-label', lock ? `Место ${i + 1}: закрыто` : `Место ${i + 1}: ${shortName(sc)}, улик найдено ${done} из ${all}`);
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
    if (C.noFinal) return;
    const fin = allDone();
    const f = btn('place final' + (fin ? ' open' : ''), '', () => { if (fin) finalAction(); });
    f.innerHTML = `<b>★</b><span>${C.finalLabel || 'ЛОГОВО'}</span><i>${fin ? 'открыто' : '🔒'}</i>`;
    f.disabled = !fin;
    f.title = fin ? 'Все улики собраны' : (C.archive ? 'Откроется, когда соберёшь все улики и проверишь архив' : 'Откроется, когда соберёшь все улики во всех местах');
    box.appendChild(f);
  }

  function nextTarget() {
    if (allDone()) return { label: C.finalCta || (C.finalLabel ? 'НА ' + C.finalLabel : 'К ЛОГОВУ') + ' →', fn: finalAction };
    if (scenesDone() && C.archive) return { label: 'В АРХИВ →', fn: openArchive };
    const n = C.scenes.length;
    for (let k = 1; k <= n; k++) { const i = (st.scene + k) % n; if (!sceneDone(i) && !sceneLocked(i)) return { label: `МЕСТО ${i + 1} →`, fn: () => goScene(i) }; }
    return null;
  }

  function updateNext() {
    const b = $('nextBtn');
    const t = sceneDone(st.scene) ? nextTarget() : null;
    b.hidden = !t;
    if (t) { b.textContent = t.label; b.onclick = () => { batHide(); t.fn(); }; }
  }

  function goScene(i) {
    if (i === st.scene || st.moving || sceneLocked(i)) return;
    st.moving = true;
    batHide();
    sfx('whoosh');
    Pixel.wipe($('wipe'), () => { loadScene(i); st.moving = false; });
  }

  function toFinale() {
    if (st.finished) return;
    st.finished = true;
    batHide();
    if (C.quietEnd) { endQuiet(); return; }
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
    $('scene').insertAdjacentHTML('beforeend', (sc.lore || []).map(l =>
      `<button class="hot lore${st.lore && st.lore[l.id] ? ' seen' : ''}" data-lore="${l.id}" aria-label="Деталь: ${l.name}" style="left:${l.hot.x}%;top:${l.hot.y}%;width:${l.hot.w}%;height:${l.hot.h}%"><span class="hot-label">${l.name}</span></button>`).join(''));
    $('scene').querySelectorAll('.hot[data-id]').forEach(b => b.onclick = () => openClue(sc.clues.find(c => c.id === b.dataset.id)));
    $('scene').querySelectorAll('.hot[data-lore]').forEach(b => b.onclick = () => openLore(sc.lore.find(l => l.id === b.dataset.lore), b));
    $('case').scrollTop = 0;
    hud();
    if (sc.hack && !st.solved.hack) setTimeout(startHack, 400);
    // сюжетная вставка при первом входе на место
    if (sc.introStory && !(st.intro || (st.intro = {}))[i]) { st.intro[i] = true; setTimeout(() => playStory(sc.introStory, () => {}, sc.introCta || 'К ДЕЛУ →'), 450); }
  }

  function sceneComplete() {
    const sc = C.scenes[st.scene];
    st.announced[st.scene] = true;
    const t = nextTarget();
    if (sc.outroStory) { const nx = C.scenes.findIndex((_, k) => !sceneDone(k)); batSay(sc.outro, 'БЭТМЕН', { label: sc.outroCta || 'ДАЛЬШЕ →', fn: () => { batHide(); playStory(sc.outroStory, () => { if (nx >= 0) goScene(nx); else if (allDone() && !C.noFinal) finalAction(); }, sc.outroStoryCta || 'ДАЛЬШЕ →'); } }); return; }
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
      A.appendChild(el('p', 'note', v.waveNote ? v.waveNote(!!v.showTarget) : v.showTarget ? 'Красная волна — сигнал Шляпника. Белая — твоя. Наложи одну на другую.' : 'Сигнала на экране нет: передатчик молчит до шести. Волну придётся выставить по тому, что ты уже знаешь о карточках.'));
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
      box.innerHTML = `<div class="i-face">${Art[v.portrait || 'phosPortrait']()}</div><div class="i-talk"><div class="i-log"></div><div class="i-now"></div><div class="order-h">${v.optsLabel || 'ПРЕДЪЯВИТЬ УЛИКУ ИЗ БЛОКНОТА'}</div><div class="i-opts opts"></div><div class="i-step"></div></div>`;
      const log = box.querySelector('.i-log'), now = box.querySelector('.i-now'), opts = box.querySelector('.i-opts'), step = box.querySelector('.i-step');
      const render = () => {
        const R = v.rounds[r];
        now.innerHTML = `<p class="i-line">${R.line}</p>`;
        step.textContent = `${v.stepWord || 'Ложь'} ${r + 1} из ${v.rounds.length}`;
        opts.replaceChildren(...R.options.map((o, i) => btn('opt', o, () => {
          if (R.answer.includes(i)) {
            sfx('ok');
            log.insertAdjacentHTML('beforeend', `<p class="i-old">${R.line}</p><p class="i-ev">Робин: ${/^«/.test(o) ? o : '«' + o + '».'}</p><p class="i-rep">${R.reply}</p>`);
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

  /* ================= НОВЫЕ МЕХАНИКИ (глава I, дело 3) ================= */
  const norm2 = s => String(s).toLowerCase().replace(/ё/g, 'е').replace(/[^а-яa-z0-9]/g, '');
  const NSVG = 'http://www.w3.org/2000/svg';
  const svgPoint = (svgEl, e) => { const pt = svgEl.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svgEl.getScreenCTM().inverse()); };
  Object.assign(TYPES, {
    /* --- фоторобот: собрать лицо по словам свидетеля --- */
    facekit(v, A) {
      const sel = Object.assign({}, v.start);
      const wrap = el('div', 'facekit'), face = el('div', 'fk-face'), rows = el('div', 'fk-rows');
      const draw = () => {
        face.innerHTML = Art.facekit(sel);
        v.features.forEach(f => { rows.querySelector(`[data-f="${f.id}"] b`).textContent = f.opts[sel[f.id]]; });
      };
      v.features.forEach(f => {
        const r = el('div', 'fk-row'); r.dataset.f = f.id;
        const step = d => () => { sel[f.id] = (sel[f.id] + d + f.opts.length) % f.opts.length; sfx('tick'); draw(); };
        const l = btn('btn ghost', '◀', step(-1)), rr = btn('btn ghost', '▶', step(1));
        l.setAttribute('aria-label', f.name + ': предыдущий вариант'); rr.setAttribute('aria-label', f.name + ': следующий вариант');
        r.append(el('span', 'fk-name', f.name), l, el('b'), rr);
        rows.appendChild(r);
      });
      wrap.append(face, rows); A.appendChild(wrap); draw();
      return { empty: () => false, check: () => { const ok = v.features.filter(f => sel[f.id] === v.target[f.id]).length; return ok === v.features.length ? true : `${v.who || 'Свидетель'} качает головой: «Похоже, но не он». Совпадает примет: ${ok} из ${v.features.length}.`; } };
    },
    /* --- ультрафиолетовый фонарь: найти светящиеся следы --- */
    uv(v, A, ctx) {
      const found = new Set();
      const box = el('div', 'uv', `<div class="uv-base">${v.art(false)}</div><div class="uv-lit">${v.art(true)}</div><div class="uv-beam"></div>`);
      const cnt = el('p', 'spot-count');
      A.append(box, cnt, el('p', 'note', v.uvNote || 'Води фонарём по картинке. Нажимай на то, что светится.'));
      const base = box.querySelector('.uv-base svg'), lit = box.querySelector('.uv-lit svg');
      const upd = () => { cnt.textContent = `Следов найдено: ${found.size} из ${v.marks.length}`; };
      upd();
      const aim = e => { const r = box.getBoundingClientRect(); box.style.setProperty('--x', (e.clientX - r.left) + 'px'); box.style.setProperty('--y', (e.clientY - r.top) + 'px'); box.classList.add('on'); };
      box.addEventListener('pointermove', aim); box.addEventListener('pointerdown', aim);
      box.addEventListener('pointerleave', () => box.classList.remove('on'));
      box.addEventListener('click', e => {
        aim(e);
        const p = svgPoint(lit, e);
        const i = v.marks.findIndex((d, k) => !found.has(k) && Math.hypot(d.x - p.x, d.y - p.y) <= d.r + 8);
        if (i < 0) { sfx('scrape'); return; }
        found.add(i); sfx('tick');
        const d = v.marks[i];
        const g = lit.querySelector(`[data-mark="${i}"]`); if (g) base.appendChild(g.cloneNode(true));
        [base, lit].forEach(s => { const c = document.createElementNS(NSVG, 'circle'); c.setAttribute('cx', d.x); c.setAttribute('cy', d.y); c.setAttribute('r', d.r + 6); c.setAttribute('class', 'spot-ring'); s.appendChild(c); });
        upd();
        if (found.size === v.marks.length) setTimeout(() => ctx.solve(), 450);
      });
      return { noCheck: true, empty: () => true, check: () => found.size === v.marks.length };
    },
    /* --- мигающая лампа: азбука Морзе --- */
    morse(v, A) {
      const M = { А: '.-', Б: '-...', В: '.--', Г: '--.', Д: '-..', Е: '.', Ж: '...-', З: '--..', И: '..', Й: '.---', К: '-.-', Л: '.-..', М: '--', Н: '-.', О: '---', П: '.--.', Р: '.-.', С: '...', Т: '-', У: '..-', Ф: '..-.', Х: '....', Ц: '-.-.', Ч: '---.', Ш: '----', Щ: '--.-', Ы: '-.--', Ь: '-..-', Э: '..-..', Ю: '..--', Я: '.-.-' };
      const seq = [];
      v.word.split('').forEach(ch => { const c = M[ch]; c.split('').forEach((s, k) => { seq.push([1, s === '.' ? 1 : 3, s]); seq.push([0, k === c.length - 1 ? 3 : 1, k === c.length - 1 ? ' ' : '']); }); });
      seq[seq.length - 1] = [0, 9, '|'];
      let unit = v.unit || 260, i = 0, tm = 0, log = '';
      const box = el('div', 'morse', `<div class="m-lamp">${v.lampArt ? Art[v.lampArt]() : ''}</div>${v.showLog ? '<div class="m-log">…</div>' : ''}`);
      const lamp = box.querySelector('.m-lamp'), logEl = box.querySelector('.m-log');
      const stepFn = () => {
        const [on, d, s] = seq[i];
        lamp.classList.toggle('on', !!on);
        if (on) log += s === '.' ? '·' : '—'; else if (s === ' ') log += '   '; else if (s === '|') log = '';
        if (logEl) logEl.textContent = log || '…';
        i = (i + 1) % seq.length;
        tm = setTimeout(stepFn, d * unit);
      };
      tm = setTimeout(stepFn, 700);
      current.cleanup.push(() => clearTimeout(tm));
      const row = el('div', 'mech-row');
      row.append(btn('btn ghost', 'МЕДЛЕННЕЕ', () => { unit = Math.min(640, unit + 90); sfx('click'); }), btn('btn ghost', 'БЫСТРЕЕ', () => { unit = Math.max(150, unit - 90); sfx('click'); }));
      A.append(box, row);
      const inner = el('div');
      A.appendChild(inner);
      return TYPES[v.answerType || 'input'](v, inner);
    },
    /* --- кабели: повернуть плитки, чтобы ток дошёл до замка --- */
    pipes(v, A, ctx) {
      const R = v.rows.length, Cn = v.rows[0].length, S = 64;
      const OPEN = { I: [0, 2], L: [0, 1], T: [0, 1, 3], X: [0, 1, 2, 3], S: [1], D: [3], '.': [] };
      const rot = v.start.map(r => r.split('').map(Number));
      let done = false;
      const fixed = ch => /[SD.]/.test(ch);
      const opens = (r, c) => { const ch = v.rows[r][c]; return OPEN[ch].map(d => (d + (fixed(ch) ? 0 : rot[r][c])) % 4); };
      const DR = [[-1, 0], [0, 1], [1, 0], [0, -1]];
      const power = () => {
        const on = new Set(); let st0 = null;
        for (let r = 0; r < R; r++) for (let c = 0; c < Cn; c++) if (v.rows[r][c] === 'S') st0 = [r, c];
        const q = [st0]; on.add(st0.join());
        while (q.length) {
          const [r, c] = q.shift();
          opens(r, c).forEach(d => { const nr = r + DR[d][0], nc = c + DR[d][1]; if (nr < 0 || nc < 0 || nr >= R || nc >= Cn) return; const k = nr + ',' + nc; if (on.has(k)) return; if (opens(nr, nc).includes((d + 2) % 4)) { on.add(k); q.push([nr, nc]); } });
        }
        return on;
      };
      const wrap = el('div', 'pipes');
      const draw = () => {
        const on = power();
        let h = '';
        for (let r = 0; r < R; r++) for (let c = 0; c < Cn; c++) {
          const ch = v.rows[r][c], x = c * S, y = r * S, lit = on.has(r + ',' + c), col = lit ? '#ffd400' : '#6a6a6a';
          h += `<g class="pt${fixed(ch) ? ' fixed' : ''}" data-r="${r}" data-c="${c}"><rect x="${x + 2}" y="${y + 2}" width="${S - 4}" height="${S - 4}" rx="6" fill="${lit ? '#1d1a08' : '#141414'}" stroke="#333" stroke-width="2"/>`;
          opens(r, c).forEach(d => { const ex = x + S / 2 + DR[d][1] * S / 2, ey = y + S / 2 + DR[d][0] * S / 2; h += `<path d="M${x + S / 2} ${y + S / 2}L${ex} ${ey}" stroke="#000" stroke-width="14" stroke-linecap="square"/><path d="M${x + S / 2} ${y + S / 2}L${ex} ${ey}" stroke="${col}" stroke-width="8" stroke-linecap="square"/>`; });
          if (ch === 'S') h += `<rect x="${x + 12}" y="${y + 14}" width="${S - 24}" height="${S - 28}" rx="4" fill="#d0142c" stroke="#fff" stroke-width="2"/><path d="M${x + 34} ${y + 18}l-8 14h8l-6 12" stroke="#fff" stroke-width="3" fill="none"/>`;
          else if (ch === 'D') h += `<rect x="${x + 16}" y="${y + 26}" width="${S - 32}" height="${S - 38}" rx="4" fill="${lit ? '#ffd400' : '#333'}" stroke="#fff" stroke-width="2"/><path d="M${x + 22} ${y + 26}v-6q10 -12 20 0v6" stroke="#fff" stroke-width="3" fill="none"/>`;
          else if (ch !== '.') h += `<circle cx="${x + S / 2}" cy="${y + S / 2}" r="7" fill="${col}" stroke="#000" stroke-width="2"/>`;
          h += '</g>';
        }
        wrap.innerHTML = `<svg viewBox="0 0 ${Cn * S} ${R * S}">${h}</svg>`;
        return on;
      };
      wrap.addEventListener('click', e => {
        if (done) return;
        const g = e.target.closest('.pt'); if (!g || g.classList.contains('fixed')) return;
        const r = +g.dataset.r, c = +g.dataset.c;
        rot[r][c] = (rot[r][c] + 1) % 4; sfx('tick');
        const on = draw();
        for (let rr = 0; rr < R; rr++) for (let cc = 0; cc < Cn; cc++) if (v.rows[rr][cc] === 'D' && on.has(rr + ',' + cc)) { done = true; sfx('clunk'); setTimeout(() => ctx.solve(), 600); }
      });
      A.append(wrap, el('p', 'note', v.pipeNote || 'Нажимай на плитку, чтобы повернуть её. Ток должен дойти от генератора до замка.'));
      draw();
      return { noCheck: true, empty: () => true, check: () => done };
    },
    /* --- весы: найти тяжёлую подделку за ограниченное число взвешиваний --- */
    scale(v, A) {
      const n = v.count || 8, max = v.max || 2, ids = Array.from({ length: n }, (_, k) => k + 1);
      let pos = {}, log = [], pick = null, tilt = 0;
      const wrap = el('div', 'scale');
      const cand = () => {
        let c = new Set(ids);
        log.forEach(w => { const L = new Set(w.L), Rr = new Set(w.R); if (w.res === 0) c = new Set([...c].filter(x => !L.has(x) && !Rr.has(x))); else c = new Set([...c].filter(x => (w.res < 0 ? L : Rr).has(x))); });
        return c;
      };
      const render = () => {
        const L = ids.filter(i => pos[i] === 'L'), Rr = ids.filter(i => pos[i] === 'R');
        const stat = (x, y, i) => `<g transform="translate(${x} ${y})"><path d="M-8 0h16l-3 -8h-10z" fill="#c8a64a" stroke="#000" stroke-width="1.2"/><rect x="-4" y="-22" width="8" height="14" fill="#d8b85a" stroke="#000" stroke-width="1.2"/><circle cx="0" cy="-27" r="6" fill="#e6c76a" stroke="#000" stroke-width="1.2"/><text x="0" y="12" font-family="Russo One, Arial Black, sans-serif" font-size="10" text-anchor="middle" fill="#fff">${i}</text></g>`;
        const pan = (arr, sx) => arr.map((i, k) => stat(sx - (arr.length - 1) * 10 + k * 20, 0, i)).join('');
        wrap.innerHTML = `<svg viewBox="0 0 420 200" class="sc-svg"><path d="M210 180V60" stroke="#fff" stroke-width="6"/><path d="M170 186h80" stroke="#fff" stroke-width="6"/>
          <g transform="rotate(${tilt} 210 60)" class="sc-beam"><path d="M70 60H350" stroke="#fff" stroke-width="6"/><circle cx="210" cy="60" r="8" fill="#d0142c" stroke="#fff" stroke-width="2"/>
            <g transform="translate(90 60) rotate(${-tilt})"><path d="M0 0L-50 70M0 0L50 70" stroke="#999" stroke-width="2"/><path d="M-60 70h120q-10 18 -60 18q-50 0 -60 -18z" fill="#333" stroke="#fff" stroke-width="2"/><g transform="translate(0 68)">${pan(L, 0)}</g></g>
            <g transform="translate(330 60) rotate(${-tilt})"><path d="M0 0L-50 70M0 0L50 70" stroke="#999" stroke-width="2"/><path d="M-60 70h120q-10 18 -60 18q-50 0 -60 -18z" fill="#333" stroke="#fff" stroke-width="2"/><g transform="translate(0 68)">${pan(Rr, 0)}</g></g></g></svg>`;
        const tray = el('div', 'sc-tray');
        ids.forEach(i => { const b = btn('chip sc-chip' + (pos[i] ? ' ' + pos[i].toLowerCase() : ''), `№${i}${pos[i] === 'L' ? ' ←' : pos[i] === 'R' ? ' →' : ''}`, () => { pos[i] = !pos[i] ? 'L' : pos[i] === 'L' ? 'R' : undefined; sfx('click'); render(); }); b.dataset.i = i; tray.appendChild(b); });
        const row = el('div', 'mech-row');
        const left = max - log.length;
        const wb = btn('btn', `ВЗВЕСИТЬ (осталось ${left})`, () => {
          if (left <= 0) return;
          if (!L.length || L.length !== Rr.length) { $('mFeedback').textContent = 'Ставь на чаши поровну, иначе весы ничего не скажут.'; return; }
          $('mFeedback').textContent = '';
          const wL = L.length + (L.includes(v.fake) ? 0.3 : 0), wR = Rr.length + (Rr.includes(v.fake) ? 0.3 : 0);
          const res = wL > wR ? -1 : wL < wR ? 1 : 0;
          log.push({ L: L.slice(), R: Rr.slice(), res }); tilt = res * -12; sfx('clunk'); render();
        });
        wb.classList.add('sc-weigh'); if (left <= 0) wb.disabled = true;
        row.append(wb, btn('btn ghost', 'СНЯТЬ ВСЁ', () => { pos = {}; tilt = 0; render(); }), btn('btn ghost', 'НАЧАТЬ ЗАНОВО', () => { pos = {}; log = []; tilt = 0; pick = null; render(); }));
        const lg = el('ol', 'sc-log');
        log.forEach(w => lg.appendChild(el('li', '', `${w.L.join(' ')} ⟷ ${w.R.join(' ')}: ${w.res < 0 ? 'левая чаша тяжелее' : w.res > 0 ? 'правая чаша тяжелее' : 'равновесие'}`)));
        const choose = el('div', 'sc-pick');
        choose.appendChild(el('span', 'order-h', 'ПОДДЕЛКА:'));
        ids.forEach(i => { const b = btn('chip sc-p' + (pick === i ? ' sel' : ''), '№' + i, () => { pick = pick === i ? null : i; sfx('click'); render(); }); b.dataset.p = i; choose.appendChild(b); });
        const box = el('div', 'sc-ui');
        box.append(el('div', 'order-h', 'НАЖМИ НА СТАТУЭТКУ: ЛЕВАЯ ЧАША → ПРАВАЯ → СНЯТЬ'), tray, row, lg, choose);
        wrap.appendChild(box);
      };
      A.appendChild(wrap); render();
      return {
        empty: () => !pick, emptyMsg: 'Сначала укажи подделку.',
        check: () => { const c = cand(); if (c.size === 1 && c.has(pick)) return true; if (pick === v.fake) return 'Может, и она. Но весы этого ещё не доказали: так ты угадываешь. Начни заново и докажи взвешиванием.'; return false; }
      };
    },
    /* --- кинопроектор: подобрать скорость и направление плёнки --- */
    projector(v, A) {
      let fps = v.startFps || 12, rev = false, raf = 0, fr = 0;
      const box = el('div', 'proj', `<div class="pj-screen"><div class="pj-text"></div><div class="pj-grain"></div></div>`);
      const txt = box.querySelector('.pj-text'), scr = box.querySelector('.pj-screen');
      const scramble = (s, k) => s.split(' ').map((w, wi) => { if (k <= 0 || w.length < 3) return w; const a = w.split(''); for (let j = 0; j < k; j++) { const x = (wi * 5 + j * 3) % (a.length - 1); [a[x], a[x + 1]] = [a[x + 1], a[x]]; } return a.join(''); }).join(' ');
      const render = () => {
        const off = Math.abs(fps - v.fps) / 4;
        let t = v.text; if (rev !== !!v.reverse) t = t.split('').reverse().join('');
        txt.textContent = scramble(t, Math.round(off * 2));
        box.dataset.off = off;
      };
      const loop = () => {
        fr++;
        const off = +box.dataset.off || 0;
        const j = off ? (Math.sin(fr * 1.7) * 3 + ((fr * 37) % 11) - 5) * off : 0;
        txt.style.transform = `translate(${off ? Math.sin(fr * .9) * off : 0}px, ${j}px)`;
        scr.style.opacity = off ? (0.75 + ((fr * 13) % 7) / 28) : 1;
        raf = requestAnimationFrame(loop);
      };
      loop(); current.cleanup.push(() => cancelAnimationFrame(raf));
      const sl = el('label', 'slider', `<span>КАДРЫ/С</span><input type="range" min="8" max="32" step="4" value="${fps}" data-k="fps"><b>${fps}</b>`);
      const inp = sl.querySelector('input');
      inp.oninput = () => { fps = +inp.value; sl.querySelector('b').textContent = fps; sfx('tick'); render(); };
      const dir = btn('btn ghost pj-dir', 'ПЛЁНКА: ВПЕРЁД ▶', () => { rev = !rev; dir.textContent = rev ? '◀ ПЛЁНКА: НАЗАД' : 'ПЛЁНКА: ВПЕРЁД ▶'; sfx('click'); render(); });
      const row = el('div', 'mech-row'); row.appendChild(dir);
      A.append(box, sl, row);
      render();
      const inner = el('div'); A.appendChild(inner);
      return TYPES[v.answerType || 'input'](v, inner);
    },
    /* --- смешать реактивы по цвету --- */
    mix(v, A) {
      const d = v.reagents.map(() => 0), MAX = v.max || 5;
      const col = () => { const n = d.reduce((a, b) => a + b, 0); if (!n) return null; return [0, 1, 2].map(k => Math.round(v.reagents.reduce((s, r, i) => s + r.color[k] * d[i], 0) / n)); };
      const rgb = c => c ? `rgb(${c.join(',')})` : 'transparent';
      const wrap = el('div', 'mix');
      const render = () => {
        const c = col(), n = d.reduce((a, b) => a + b, 0);
        wrap.innerHTML = '';
        const rs = el('div', 'mx-rows');
        v.reagents.forEach((r, i) => {
          const row = el('div', 'mx-row');
          row.innerHTML = `<i style="background:${rgb(r.color)}"></i><span>${r.name}</span>`;
          const m = btn('btn ghost', '−', () => { d[i] = Math.max(0, d[i] - 1); sfx('tick'); render(); }), p = btn('btn ghost', '+', () => { d[i] = Math.min(MAX, d[i] + 1); sfx('tick'); render(); });
          m.dataset.r = i; p.dataset.r = i; p.classList.add('mx-plus'); m.setAttribute('aria-label', r.name + ': меньше'); p.setAttribute('aria-label', r.name + ': больше');
          row.append(m, el('b', '', d[i]), p);
          rs.appendChild(row);
        });
        const lvl = Math.min(1, n / (MAX * 2));
        const beaker = el('div', 'mx-beaker', `<svg viewBox="0 0 120 150"><path d="M30 10V60L8 130Q6 142 18 142H102Q114 142 112 130L90 60V10" fill="#0d1416" stroke="#fff" stroke-width="3"/><clipPath id="mxc"><path d="M30 10V60L8 130Q6 142 18 142H102Q114 142 112 130L90 60V10Z"/></clipPath><rect x="0" y="${142 - 132 * lvl}" width="120" height="${132 * lvl}" fill="${rgb(c)}" clip-path="url(#mxc)"/><path d="M24 10H96" stroke="#fff" stroke-width="4"/></svg>`);
        const read = el('div', 'mx-read', `<div><span>ЭТАЛОН</span><i style="background:${rgb(v.target)}"></i><b>R ${v.target[0]} · G ${v.target[1]} · B ${v.target[2]}</b></div><div><span>В КОЛБЕ</span><i style="background:${rgb(c) || '#000'}"></i><b>${c ? `R ${c[0]} · G ${c[1]} · B ${c[2]}` : 'пусто'}</b></div>`);
        const right = el('div', 'mx-right'); right.append(beaker, read);
        wrap.append(rs, right);
      };
      A.appendChild(wrap); render();
      return { empty: () => !d.some(Boolean), emptyMsg: 'Колба пуста.', check: () => d.every((x, i) => x === v.answer[i]) ? true : 'Цвет не тот. Сравни показания колориметра с эталоном.' };
    },
    /* --- гель с ДНК: найти совпадающие дорожки --- */
    gel(v, A) {
      let links = [], pick = null;
      const COLS = ['#ffd400', '#5fd0ff', '#ff7ab0'];
      const wrap = el('div', 'gel');
      const W = 64, H = 240;
      const render = () => {
        let h = `<rect width="${v.lanes.length * W + 20}" height="${H + 40}" fill="#0a0f1a"/><rect x="6" y="6" width="${v.lanes.length * W + 8}" height="${H}" fill="#141c30" stroke="#3a4a6a" stroke-width="2"/>`;
        v.lanes.forEach((ln, i) => {
          const x = 14 + i * W, li = links.findIndex(p => p.includes(i));
          h += `<g class="gl${ln.marker ? ' mk' : ''}${pick === i ? ' sel' : ''}" data-i="${i}"><rect x="${x}" y="10" width="${W - 12}" height="${H - 8}" fill="${pick === i ? '#26365a' : '#10182a'}" stroke="${li >= 0 ? COLS[li] : '#2a3a5a'}" stroke-width="${li >= 0 ? 3 : 1.5}"/>`;
          ln.bands.forEach(b => { const y = 20 + b * (H - 30); h += `<rect x="${x + 6}" y="${y}" width="${W - 24}" height="5" rx="2" fill="#e8f4ff" opacity=".9"/><rect x="${x + 4}" y="${y - 2}" width="${W - 20}" height="9" rx="4" fill="#9fd8ff" opacity=".18"/>`; });
          h += `<text x="${x + (W - 12) / 2}" y="${H + 26}" font-family="Russo One, Arial Black, sans-serif" font-size="13" text-anchor="middle" fill="${ln.marker ? '#777' : '#fff'}">${ln.short}</text></g>`;
        });
        wrap.innerHTML = `<svg viewBox="0 0 ${v.lanes.length * W + 20} ${H + 40}">${h}</svg>`;
        const lg = el('div', 'gel-legend');
        v.lanes.forEach(ln => { if (!ln.marker) lg.appendChild(el('span', '', `<b>${ln.short}</b> ${ln.label}`)); });
        const ls = el('div', 'gel-links');
        links.forEach((p, k) => ls.appendChild(btn('note-chip', `${v.lanes[p[0]].short} = ${v.lanes[p[1]].short} ×`, () => { links.splice(k, 1); sfx('scrape'); render(); })));
        if (!links.length) ls.appendChild(el('span', 'dim', 'Пар пока нет. Нажми на одну дорожку, потом на другую.'));
        ls.querySelectorAll('.note-chip').forEach((b, k) => { b.style.borderColor = COLS[k]; });
        wrap.append(lg, ls);
      };
      wrap.addEventListener('click', e => {
        const g = e.target.closest('.gl'); if (!g || g.classList.contains('mk')) return;
        const i = +g.dataset.i;
        if (pick === null) pick = i;
        else if (pick === i) pick = null;
        else { links = links.filter(p => !p.includes(i) && !p.includes(pick)); if (links.length < 3) links.push([pick, i]); pick = null; }
        sfx('click'); render();
      });
      A.appendChild(wrap); render();
      const same = (a, b) => (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);
      return { empty: () => !links.length, emptyMsg: 'Сначала соедини дорожки в пары.', check: () => links.length === v.pairs.length && v.pairs.every(p => links.some(l => same(l, p))) ? true : (links.filter(l => v.pairs.some(p => same(l, p))).length ? 'Часть пар верна, но не все. Сравни полосы точнее.' : false) };
    }
  });

  /* ================= НОВЫЕ МЕХАНИКИ (глава I, дело 4) ================= */
  const A_RED = '#d0142c';
  const FONT35 = {
    '0': ['111', '101', '101', '101', '111'], '1': ['010', '110', '010', '010', '111'], '2': ['111', '001', '111', '100', '111'],
    '3': ['111', '001', '111', '001', '111'], '4': ['101', '101', '111', '001', '001'], '5': ['111', '100', '111', '001', '111'],
    '6': ['111', '100', '111', '101', '111'], '7': ['111', '001', '010', '010', '010'], '8': ['111', '101', '111', '101', '111'],
    '9': ['111', '101', '111', '001', '111'], ':': ['0', '1', '0', '1', '0'], '×': ['000', '101', '010', '101', '000'], ' ': ['0', '0', '0', '0', '0']
  };
  const WIRE = { 'белый': '#efefef', 'красный': '#d0142c', 'синий': '#2f6bff', 'жёлтый': '#ffd400', 'чёрный': '#151515', 'зелёный': '#2fae5a' };
  // пигпен-глифы: 9 клеток «решётки» с точкой и без + 4 «галочки» с точкой и без
  function pigGlyph(k, col) {
    col = col || '#fff';
    const S = 'stroke="' + col + '" stroke-width="3" fill="none" stroke-linecap="square"';
    let h = '';
    if (k < 18) {
      const c = k % 9, r = Math.floor(c / 3), q = c % 3, dot = k >= 9;
      const e = [];
      if (r > 0) e.push('M4 4H28'); if (r < 2) e.push('M4 28H28'); if (q > 0) e.push('M4 4V28'); if (q < 2) e.push('M28 4V28');
      h = `<path d="${e.join('')}" ${S}/>` + (dot ? `<circle cx="16" cy="16" r="3" fill="${col}"/>` : '');
    } else {
      const v = (k - 18) % 4, dot = k >= 22;
      const d = ['M4 4L16 28L28 4', 'M4 28L16 4L28 28', 'M4 4L28 16L4 28', 'M28 4L4 16L28 28'][v];
      const dp = [[16, 12], [16, 20], [12, 16], [20, 16]][v];
      h = `<path d="${d}" ${S} stroke-linejoin="miter"/>` + (dot ? `<circle cx="${dp[0]}" cy="${dp[1]}" r="3" fill="${col}"/>` : '');
    }
    return `<svg viewBox="0 0 32 32" class="pg">${h}</svg>`;
  }
  Object.assign(TYPES, {
    /* --- прозрачные трафареты: повернуть листы, чтобы прорези сложились в надпись --- */
    layers(v, A, ctx) {
      const N = v.size || 19, CS = 12, n = v.sheets || 3;
      const px = [];
      v.lines.forEach((line, li) => {
        const chars = line.split(''), w = chars.reduce((s, ch) => s + FONT35[ch][0].length, 0) + chars.length - 1;
        let x = Math.floor((N - w) / 2);
        const y0 = v.rowsAt ? v.rowsAt[li] : 3 + li * 8;
        chars.forEach(ch => { const g = FONT35[ch]; g.forEach((row, ry) => row.split('').forEach((b, rx) => { if (b === '1') px.push([x + rx, y0 + ry]); })); x += g[0].length + 1; });
      });
      const own = px.map(([x, y], i) => (x * 7 + y * 13 + i * 5 + (v.seed || 0)) % n);
      const rot = (v.start || [1, 2, 3, 1]).slice(0, n);
      const COLS = ['#5fd0ff', '#ff7ab0', '#ffd400', '#9fff8a'];
      let done = false;
      const wrap = el('div', 'layers');
      const draw = () => {
        const ok = rot.every(r => r % 4 === 0);
        let h = `<rect width="${N * CS}" height="${N * CS}" fill="#05070a"/><g stroke="#10161c" stroke-width="1">${Array.from({ length: N + 1 }, (_, i) => `<path d="M${i * CS} 0V${N * CS}M0 ${i * CS}H${N * CS}"/>`).join('')}</g>`;
        for (let k = 0; k < n; k++) {
          h += `<g class="ly" data-k="${k}" transform="rotate(${rot[k] * 90} ${N * CS / 2} ${N * CS / 2})">`;
          h += `<rect x="3" y="3" width="${N * CS - 6}" height="${N * CS - 6}" fill="${COLS[k]}" opacity=".05" stroke="${COLS[k]}" stroke-opacity=".35" stroke-width="2" stroke-dasharray="6 4"/><circle cx="${8 + k * 8}" cy="8" r="3" fill="${COLS[k]}" opacity=".8"/>`;
          px.forEach(([x, y], i) => { if (own[i] === k) h += `<rect x="${x * CS + 1}" y="${y * CS + 1}" width="${CS - 2}" height="${CS - 2}" fill="${ok ? '#fffbe6' : COLS[k]}" opacity="${ok ? 1 : .85}"/>`; });
          h += '</g>';
        }
        wrap.innerHTML = `<svg viewBox="0 0 ${N * CS} ${N * CS}" class="ly-svg${ok ? ' ok' : ''}">${h}</svg>`;
        const row = el('div', 'ly-btns');
        for (let k = 0; k < n; k++) {
          const b = btn('btn ghost ly-b', `ЛИСТ ${k + 1} ↻`, () => { if (done) return; rot[k] = (rot[k] + 1) % 4; sfx('scrape'); draw(); });
          b.dataset.k = k; b.style.borderColor = COLS[k]; b.style.color = COLS[k];
          row.appendChild(b);
        }
        wrap.appendChild(row);
        if (ok && !done) { done = true; sfx('clunk'); setTimeout(() => ctx.solve(), 700); }
      };
      A.append(wrap, el('p', 'note', v.layNote || 'Три прозрачных листа лежат на световом столе. Поворачивай листы, пока прорези не сложатся в надпись.'));
      draw();
      return { noCheck: true, empty: () => true, check: () => done };
    },
    /* --- провода детонатора: перерезать нужный по правилам схемы --- */
    wires(v, A) {
      let pick = null;
      const n = v.wires.length, H = 40 + n * 44;
      const wrap = el('div', 'wires');
      const draw = () => {
        let h = `<rect width="520" height="${H}" rx="10" fill="#15181c" stroke="#555" stroke-width="3"/>
          <rect x="16" y="16" width="56" height="${H - 32}" rx="6" fill="#222" stroke="#888" stroke-width="2"/><rect x="448" y="16" width="56" height="${H - 32}" rx="6" fill="#222" stroke="#888" stroke-width="2"/>
          <circle cx="476" cy="30" r="6" fill="${v.cut ? '#2a2a2a' : '#ff2a2a'}" class="wr-led"/><text x="44" y="${H - 22}" font-family="monospace" font-size="10" text-anchor="middle" fill="#888">ЯЧЕЙКА</text><text x="476" y="${H - 22}" font-family="monospace" font-size="10" text-anchor="middle" fill="#888">КАПСЮЛЬ</text>`;
        v.wires.forEach((w, i) => {
          const y = 36 + i * 44, c = WIRE[w] || '#999', sel = pick === i;
          const d = `M72 ${y}C160 ${y + (i % 2 ? 18 : -18)} 240 ${y + (i % 3 - 1) * 16} 300 ${y}S400 ${y + (i % 2 ? -14 : 14)} 448 ${y}`;
          h += `<g class="wr${sel ? ' sel' : ''}" data-i="${i}"><path d="${d}" stroke="transparent" stroke-width="30" fill="none"/>
            <path d="${d}" stroke="#000" stroke-width="12" fill="none"/><path d="${d}" stroke="${c}" stroke-width="8" fill="none"/>${w === 'чёрный' ? `<path d="${d}" stroke="#444" stroke-width="1.5" fill="none" stroke-dasharray="2 6"/>` : ''}
            <rect x="64" y="${y - 6}" width="12" height="12" fill="#999" stroke="#000"/><rect x="444" y="${y - 6}" width="12" height="12" fill="#999" stroke="#000"/>
            <text x="92" y="${y - 10}" font-family="Russo One, Arial Black, sans-serif" font-size="11" fill="#aaa">${i + 1}</text>
            ${sel ? `<g transform="translate(300 ${y})"><circle r="15" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 3"/><path d="M-8 -10L6 6M8 -10L-6 6" stroke="#fff" stroke-width="3"/><circle cx="-8" cy="9" r="4" fill="none" stroke="#fff" stroke-width="2"/><circle cx="8" cy="9" r="4" fill="none" stroke="#fff" stroke-width="2"/></g>` : ''}</g>`;
        });
        wrap.innerHTML = `<svg viewBox="0 0 520 ${H}" class="wr-svg">${h}</svg><p class="spot-count">${pick === null ? 'Нажми на провод, который будешь резать.' : `Выбран провод №${pick + 1}: ${v.wires[pick]}.`}</p>`;
      };
      wrap.addEventListener('click', e => { const g = e.target.closest('.wr'); if (!g) return; pick = +g.dataset.i; sfx('click'); draw(); });
      A.appendChild(wrap); draw();
      return { empty: () => pick === null, emptyMsg: 'Сначала выбери провод.', check: () => pick === v.answer ? true : (v.wrongCut || 'Искра! Таймер на капсюле дёрнулся и пошёл быстрее. Не тот провод.') };
    },
    /* --- замена символов: расшифровать передачу по неполному ключу --- */
    subst(v, A) {
      const text = v.text, letters = [...new Set(text.replace(/\s/g, '').split(''))];
      const perm = letters.map((_, i) => (i * 7 + (v.seed || 3)) % 26);
      const gi = ch => perm[letters.indexOf(ch)];
      const given = new Set((v.given || '').split(''));
      const val = {}; letters.forEach(l => { if (given.has(l)) val[l] = l; });
      const wrap = el('div', 'subst');
      const msg = el('div', 'sb-msg'), key = el('div', 'sb-key');
      const drawMsg = () => {
        msg.innerHTML = text.split(' ').map(w => `<span class="sb-word">${w.split('').map(ch => `<span class="sb-c${given.has(ch) ? ' given' : ''}">${pigGlyph(gi(ch))}<b>${val[ch] || '·'}</b></span>`).join('')}</span>`).join('');
      };
      letters.forEach(l => {
        const cell = el('label', 'sb-k' + (given.has(l) ? ' given' : ''));
        cell.innerHTML = pigGlyph(gi(l));
        const inp = el('input'); inp.type = 'text'; inp.maxLength = 1; inp.autocomplete = 'off'; inp.spellcheck = false;
        inp.dataset.g = gi(l); inp.setAttribute('aria-label', 'Буква для символа');
        if (given.has(l)) { inp.value = l; inp.disabled = true; }
        inp.oninput = () => { const c = inp.value.toUpperCase().replace(/Ё/g, 'Е').replace(/[^А-Я]/g, '').slice(-1); inp.value = c; if (c) val[l] = c; else delete val[l]; sfx('key'); drawMsg(); };
        cell.appendChild(inp); key.appendChild(cell);
      });
      wrap.append(el('div', 'order-h', 'ПЕРЕДАЧА'), msg, el('div', 'order-h', 'КЛЮЧ: ВПИШИ БУКВЫ ПОД НЕИЗВЕСТНЫМИ ЗНАКАМИ'), key);
      A.appendChild(wrap); drawMsg();
      return {
        empty: () => letters.every(l => given.has(l) || !val[l]), emptyMsg: 'Впиши хотя бы одну букву в ключ.',
        check: () => { const ok = letters.filter(l => val[l] === l).length; return ok === letters.length ? true : `Текст не складывается. Верных знаков в ключе: ${ok} из ${letters.length}.`; }
      };
    },
    /* --- карта подземки: проложить маршрут курьера --- */
    route(v, A) {
      const N = {}; v.nodes.forEach(n => { N[n.id] = n; });
      const open = (a, b) => v.edges.some(e => !e[2] && ((e[0] === a && e[1] === b) || (e[0] === b && e[1] === a)));
      let path = [v.start];
      const wrap = el('div', 'route');
      const draw = () => {
        let h = `<rect width="${v.w || 600}" height="${v.h || 380}" fill="#0d1014"/><g stroke="#161b22" stroke-width="1">${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 40} 0V400M0 ${i * 40}H640"/>`).join('')}</g>`;
        v.edges.forEach(e => {
          const a = N[e[0]], b = N[e[1]];
          h += e[2] ? `<path d="M${a.x} ${a.y}L${b.x} ${b.y}" stroke="#4a4a4a" stroke-width="6" stroke-dasharray="8 8"/><g transform="translate(${(a.x + b.x) / 2} ${(a.y + b.y) / 2})"><circle r="11" fill="#0d1014" stroke="${A_RED}" stroke-width="2"/><path d="M-5 -5L5 5M5 -5L-5 5" stroke="${A_RED}" stroke-width="3"/></g>`
            : `<path d="M${a.x} ${a.y}L${b.x} ${b.y}" stroke="${e[3] || '#6a7a8a'}" stroke-width="7" stroke-linecap="round"/>`;
        });
        for (let i = 1; i < path.length; i++) { const a = N[path[i - 1]], b = N[path[i]]; h += `<path d="M${a.x} ${a.y}L${b.x} ${b.y}" stroke="#ffd400" stroke-width="5" stroke-linecap="round" class="rt-path"/>`; }
        v.nodes.forEach(n => {
          const inP = path.includes(n.id), last = path[path.length - 1] === n.id, can = !inP && open(path[path.length - 1], n.id);
          h += `<g class="rt-n${can ? ' can' : ''}${inP ? ' in' : ''}" data-id="${n.id}"><circle cx="${n.x}" cy="${n.y}" r="22" fill="transparent"/>
            <circle cx="${n.x}" cy="${n.y}" r="${last ? 12 : 10}" fill="${inP ? '#ffd400' : '#0d1014'}" stroke="${n.id === v.start || n.id === v.end ? '#fff' : '#cfd6de'}" stroke-width="${n.id === v.end ? 5 : 3}"/>
            ${n.mark ? `<g transform="translate(${n.x + 16} ${n.y - 16})"><circle r="9" fill="#0d1014" stroke="${A_RED}" stroke-width="2.5"/><path d="M-5 6L0 -6L5 6M-3 2H3" stroke="${A_RED}" stroke-width="2.2" fill="none"/></g>` : ''}
            <text x="${n.x + (n.lx || 0)}" y="${n.y + (n.ly || 30)}" font-family="Russo One, Arial Black, sans-serif" font-size="12" text-anchor="middle" fill="${inP ? '#ffd400' : '#ddd'}" paint-order="stroke" stroke="#0d1014" stroke-width="4">${n.name}</text></g>`;
        });
        wrap.innerHTML = `<svg viewBox="0 0 ${v.w || 600} ${v.h || 380}" class="rt-svg">${h}</svg>`;
        const row = el('div', 'mech-row');
        row.append(btn('btn ghost', '↶ НАЗАД', () => { if (path.length > 1) { path.pop(); sfx('scrape'); draw(); } }), btn('btn ghost', 'СБРОС', () => { path = [v.start]; sfx('scrape'); draw(); }));
        wrap.append(row, el('p', 'spot-count', 'Маршрут: ' + path.map(id => N[id].name).join(' → ')));
      };
      wrap.addEventListener('click', e => {
        const g = e.target.closest('.rt-n'); if (!g) return;
        const id = g.dataset.id, last = path[path.length - 1];
        if (id === last && path.length > 1) { path.pop(); sfx('scrape'); draw(); return; }
        if (path.includes(id)) return;
        if (!open(last, id)) { $('mFeedback').textContent = v.edges.some(x => x[2] && ((x[0] === last && x[1] === id) || (x[1] === last && x[0] === id))) ? 'Перегон закрыт: завал.' : 'Между этими станциями нет пути.'; sfx('wrong'); return; }
        $('mFeedback').textContent = '';
        path.push(id); sfx('tick'); draw();
      });
      A.appendChild(wrap); draw();
      return {
        empty: () => path.length < 2, emptyMsg: 'Проложи маршрут: нажимай на соседние станции.',
        check: () => {
          if (path[path.length - 1] !== v.end) return `Маршрут должен кончаться на станции «${N[v.end].name}».`;
          const miss = v.nodes.filter(n => n.mark && !path.includes(n.id));
          if (miss.length) return `Курьер проходил все тайники. Пропущено: ${miss.map(n => '«' + n.name + '»').join(', ')}.`;
          return true;
        }
      };
    },
    /* --- логическая таблица: кто к какому фидеру подключён --- */
    logic(v, A) {
      const R = v.rows.length, Cn = v.cols.length, m = v.rows.map(() => v.cols.map(() => 0));
      const wrap = el('div', 'logic');
      const draw = () => {
        let h = `<table class="lg-t"><tr><th></th>${v.cols.map(c => `<th>${c}</th>`).join('')}</tr>`;
        v.rows.forEach((r, i) => { h += `<tr><th>${r}</th>${v.cols.map((_, j) => `<td><button type="button" class="lg-c s${m[i][j]}" data-i="${i}" data-j="${j}" aria-label="${r} — ${v.cols[j]}">${['', '✗', '✓'][m[i][j]]}</button></td>`).join('')}</tr>`; });
        wrap.innerHTML = h + '</table><p class="note">Нажимай на клетку: пусто → ✗ (точно нет) → ✓ (точно да).</p>';
      };
      wrap.addEventListener('click', e => { const b = e.target.closest('.lg-c'); if (!b) return; const i = +b.dataset.i, j = +b.dataset.j; m[i][j] = (m[i][j] + 1) % 3; sfx('tick'); draw(); });
      A.appendChild(wrap); draw();
      return {
        empty: () => !m.some(r => r.includes(2)), emptyMsg: 'Поставь хотя бы одну галочку ✓.',
        check: () => {
          const rows = m.map(r => r.indexOf(2)), many = m.some(r => r.filter(x => x === 2).length > 1);
          if (many) return 'В каждой строке может быть только одна галочка: одно здание — один фидер.';
          if (rows.some(x => x < 0)) return 'Не у всех зданий отмечен фидер.';
          const ok = rows.filter((x, i) => x === v.solution[i]).length;
          return ok === R ? true : `Схема не сходится. Верных строк: ${ok} из ${R}.`;
        }
      };
    },
    /* --- щит рубильников: каждый тянет за собой соседей --- */
    lights(v, A, ctx) {
      const n = v.n || 4;
      const g0 = Array.from({ length: n }, () => Array(n).fill(1));
      const press = (g, r, c) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => { const rr = r + dr, cc = c + dc; if (rr >= 0 && cc >= 0 && rr < n && cc < n) g[rr][cc] ^= 1; });
      v.presses.forEach(([r, c]) => press(g0, r, c));
      let g = g0.map(r => r.slice()), moves = 0, done = false;
      const wrap = el('div', 'lights');
      const draw = () => {
        const on = g.flat().filter(Boolean).length;
        let h = '';
        g.forEach((row, r) => row.forEach((x, c) => {
          const X = c * 70, Y = r * 80;
          h += `<g class="lt${x ? ' on' : ''}" data-r="${r}" data-c="${c}"><rect x="${X + 6}" y="${Y + 6}" width="58" height="68" rx="6" fill="#1b1e22" stroke="#555" stroke-width="2"/>
            <rect x="${X + 26}" y="${Y + 16}" width="18" height="48" rx="4" fill="#0b0c0e" stroke="#333"/>
            <rect x="${X + 22}" y="${x ? Y + 14 : Y + 44}" width="26" height="22" rx="4" fill="${x ? '#2fae5a' : '#d0142c'}" stroke="#000" stroke-width="2"/>
            <circle cx="${X + 56}" cy="${Y + 14}" r="4" fill="${x ? '#9fff8a' : '#3a1010'}"/></g>`;
        }));
        wrap.innerHTML = `<svg viewBox="0 0 ${n * 70} ${n * 80}" class="lt-svg">${h}</svg><p class="spot-count">Линий в норме: ${on} из ${n * n} · ходов: ${moves}</p>`;
        const row = el('div', 'mech-row'); row.appendChild(btn('btn ghost', 'ВЕРНУТЬ КАК БЫЛО', () => { if (done) return; g = g0.map(r => r.slice()); moves = 0; sfx('scrape'); draw(); }));
        wrap.appendChild(row);
      };
      wrap.addEventListener('click', e => {
        if (done) return;
        const t = e.target.closest('.lt'); if (!t) return;
        press(g, +t.dataset.r, +t.dataset.c); moves++; sfx('clunk'); draw();
        if (g.every(r => r.every(Boolean))) { done = true; sfx('ok'); setTimeout(() => ctx.solve(), 600); }
      });
      A.append(wrap, el('p', 'note', v.ltNote || 'Каждый рубильник перекидывает себя и соседей сверху, снизу, слева и справа. Подними все в зелёное.'));
      draw();
      return { noCheck: true, empty: () => true, check: () => done };
    },
    /* --- графический ключ 3×3 --- */
    pattern(v, A) {
      let seq = [];
      const P = i => [40 + ((i - 1) % 3) * 80, 40 + Math.floor((i - 1) / 3) * 80];
      const wrap = el('div', 'pattern');
      const draw = () => {
        let h = `<rect width="240" height="240" rx="16" fill="#0c1116" stroke="#3a4a5a" stroke-width="3"/>`;
        (v.smudge || []).forEach(i => { const [x, y] = P(i); h += `<ellipse cx="${x + 3}" cy="${y + 2}" rx="20" ry="15" fill="#c8d4e0" opacity=".09" transform="rotate(${i * 37} ${x} ${y})"/>`; });
        (v.streaks || []).forEach(([a, b]) => { const [x1, y1] = P(a), [x2, y2] = P(b); h += `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#c8d4e0" stroke-width="10" opacity=".06" stroke-linecap="round"/>`; });
        for (let i = 1; i < seq.length; i++) { const [x1, y1] = P(seq[i - 1]), [x2, y2] = P(seq[i]); h += `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#ffd400" stroke-width="6" stroke-linecap="round"/>`; }
        for (let i = 1; i <= 9; i++) { const [x, y] = P(i), on = seq.includes(i); h += `<g class="pd" data-i="${i}"><circle cx="${x}" cy="${y}" r="30" fill="transparent"/><circle cx="${x}" cy="${y}" r="${on ? 12 : 8}" fill="${on ? '#ffd400' : '#cfd6de'}"/>${on ? `<text x="${x + 16}" y="${y - 12}" font-family="Russo One, Arial Black, sans-serif" font-size="11" fill="#ffd400">${seq.indexOf(i) + 1}</text>` : ''}</g>`; }
        wrap.innerHTML = `<svg viewBox="0 0 240 240" class="pd-svg">${h}</svg>`;
        const row = el('div', 'mech-row'); row.appendChild(btn('btn ghost', 'СБРОС', () => { seq = []; sfx('scrape'); draw(); }));
        wrap.appendChild(row);
      };
      wrap.addEventListener('click', e => { const g = e.target.closest('.pd'); if (!g) return; const i = +g.dataset.i; if (seq.includes(i)) return; seq.push(i); sfx('beep'); draw(); });
      A.appendChild(wrap); draw();
      return { empty: () => seq.length < 2, emptyMsg: 'Проведи узор: нажимай на точки по порядку.', check: () => seq.join() === v.answer.join() ? true : (seq.slice().sort().join() === v.answer.slice().sort().join() ? 'Точки те, но порядок не тот. Экран мигнул красным.' : false) };
    },
    /* --- захват: решения на время --- */
    qte(v, A, ctx) {
      const T = v.time || 6;
      let k = 0, tm = 0, raf = 0, t0 = 0, live = false;
      const wrap = el('div', 'qte');
      const stop = () => { clearTimeout(tm); cancelAnimationFrame(raf); live = false; };
      current.cleanup.push(stop);
      const fail = msg => { stop(); sfx('wrong'); wrap.innerHTML = `<div class="qt-fail"><p>${msg}</p></div>`; const b = btn('btn', 'ЕЩЁ РАЗ', () => { k = 0; step(); }); b.classList.add('qt-retry'); wrap.appendChild(b); wrong(v.failSay || null); };
      const step = () => {
        stop();
        if (k >= v.steps.length) { wrap.innerHTML = `<div class="qt-win">${v.winText || 'Попался.'}</div>`; sfx('ok'); setTimeout(() => ctx.solve(), 700); return; }
        const s = v.steps[k];
        const order = s.options.map((_, i) => i).sort((a, b) => ((a * 7 + k * 3) % 5) - ((b * 7 + k * 3) % 5));
        wrap.innerHTML = `<div class="qt-top"><span>${k + 1} / ${v.steps.length}</span><i class="qt-bar"><b></b></i></div><p class="qt-text">${s.text}</p><div class="qt-opts"></div>`;
        const box = wrap.querySelector('.qt-opts'), bar = wrap.querySelector('.qt-bar b');
        order.forEach(i => { const b = btn('opt qt-o', s.options[i], () => { if (!live) return; if (i === s.answer) { sfx('tick'); k++; step(); } else fail(s.fail || 'Не то. Он ушёл в темноту.'); }); b.dataset.i = i; box.appendChild(b); });
        live = true; t0 = performance.now();
        const tick = now => { const p = Math.min(1, (now - t0) / (T * 1000)); bar.style.width = (100 - p * 100) + '%'; if (p < 1) raf = requestAnimationFrame(tick); };
        raf = requestAnimationFrame(tick);
        tm = setTimeout(() => fail(s.late || 'Слишком долго. Он ушёл в темноту.'), T * 1000);
      };
      wrap.innerHTML = `<p class="qt-text">${v.intro || ''}</p>`;
      const go = btn('btn', v.startLabel || 'НАЧАТЬ', () => step()); go.classList.add('qt-go');
      wrap.appendChild(go);
      A.appendChild(wrap);
      return { noCheck: true, empty: () => true, check: () => false };
    }
  });

  /* ================= НОВЫЕ МЕХАНИКИ (глава I, дело 5) ================= */
  const BASE_COL = { A: '#2fae5a', T: '#d0142c', G: '#ffd400', C: '#2f6bff' };
  const PAIR = { A: 'T', T: 'A', G: 'C', C: 'G' };
  Object.assign(TYPES, {
    /* --- лабиринт замка вслепую: Оракул диктует, Робин ведёт импульс --- */
    navi(v, A, ctx) {
      const rows = v.rows, R = rows.length, Cn = rows[0].length, CS = 34;
      let S0 = [0, 0], E0 = [0, 0];
      rows.forEach((row, r) => row.split('').forEach((ch, c) => { if (ch === 'S') S0 = [r, c]; if (ch === 'E') E0 = [r, c]; }));
      const DR = [[-1, 0], [0, 1], [1, 0], [0, -1]], ARW = ['↑', '→', '↓', '←'];
      let pos = S0.slice(), dir = v.startDir == null ? 1 : v.startDir, trail = [S0.join()], walls = new Set(), done = false, resets = 0, bump = null;
      const wrap = el('div', 'navi');
      const draw = () => {
        let h = `<rect width="${Cn * CS}" height="${R * CS}" fill="#05080a"/>`;
        for (let r = 0; r < R; r++) for (let c = 0; c < Cn; c++) {
          const k = r + ',' + c, x = c * CS, y = r * CS;
          h += `<rect x="${x + 1}" y="${y + 1}" width="${CS - 2}" height="${CS - 2}" fill="${walls.has(k) ? (bump === k ? '#d0142c' : '#3a0d12') : trail.includes(k) ? '#0f3a33' : '#0b1216'}" stroke="#13202a"/>`;
        }
        for (let i = 1; i < trail.length; i++) { const [r1, c1] = trail[i - 1].split(',').map(Number), [r2, c2] = trail[i].split(',').map(Number); h += `<path d="M${c1 * CS + CS / 2} ${r1 * CS + CS / 2}L${c2 * CS + CS / 2} ${r2 * CS + CS / 2}" stroke="#3fe0c5" stroke-width="4" stroke-linecap="round"/>`; }
        h += `<g><rect x="${E0[1] * CS + 4}" y="${E0[0] * CS + 4}" width="${CS - 8}" height="${CS - 8}" fill="none" stroke="#ffd400" stroke-width="2.5" stroke-dasharray="4 3"/><text x="${E0[1] * CS + CS / 2}" y="${E0[0] * CS + CS / 2 + 5}" font-family="Russo One, Arial Black, sans-serif" font-size="13" text-anchor="middle" fill="#ffd400">⏻</text></g>`;
        h += `<g transform="translate(${pos[1] * CS + CS / 2} ${pos[0] * CS + CS / 2})"><circle r="11" fill="#3fe0c5" filter="url(#glowS)"/>${v.relative ? `<path d="M0 -9L6 3H-6Z" fill="#000" transform="rotate(${dir * 90})"/>` : '<circle r="4" fill="#000"/>'}</g>`;
        wrap.querySelector('.nv-svg').innerHTML = h;
        wrap.querySelector('.nv-stat').textContent = `Шагов: ${trail.length - 1} · сбросов защиты: ${resets}${v.relative ? ' · импульс смотрит ' + ['вверх', 'вправо', 'вниз', 'влево'][dir] : ''}`;
      };
      const step = d => {
        if (done) return;
        const nr = pos[0] + DR[d][0], nc = pos[1] + DR[d][1];
        const ch = (rows[nr] || '')[nc];
        if (!ch || ch === '#') {
          const k = nr + ',' + nc; walls.add(k); bump = k; resets++;
          sfx('wrong'); $('mFeedback').textContent = 'Контакт замкнулся на стенку: защита сбросила импульс к началу.';
          wrap.classList.remove('nv-shake'); void wrap.offsetWidth; wrap.classList.add('nv-shake');
          pos = S0.slice(); dir = v.startDir == null ? 1 : v.startDir; trail = [S0.join()]; draw(); setTimeout(() => { bump = null; if (!done) draw(); }, 500); return;
        }
        $('mFeedback').textContent = '';
        pos = [nr, nc]; trail.push(pos.join()); sfx('tick'); draw();
        if (ch === 'E') { done = true; sfx('clunk'); setTimeout(() => ctx.solve(), 600); }
      };
      wrap.innerHTML = `<svg viewBox="0 0 ${Cn * CS} ${R * CS}" class="nv-svg"></svg><p class="spot-count nv-stat"></p><div class="nv-pad"></div>`;
      const pad = wrap.querySelector('.nv-pad');
      if (v.relative) {
        pad.classList.add('rel');
        pad.append(btn('btn ghost nv-b', '↶ НАЛЕВО', () => { dir = (dir + 3) % 4; sfx('click'); draw(); }), btn('btn nv-b', 'ВПЕРЁД ↑', () => step(dir)), btn('btn ghost nv-b', 'НАПРАВО ↷', () => { dir = (dir + 1) % 4; sfx('click'); draw(); }));
        pad.children[0].dataset.k = 'L'; pad.children[1].dataset.k = 'F'; pad.children[2].dataset.k = 'R';
      } else {
        [0, 3, 1, 2].forEach(d => { const b = btn('btn ghost nv-b nv-' + d, ARW[d], () => step(d)); b.dataset.k = d; b.setAttribute('aria-label', ['Вверх', 'Вправо', 'Вниз', 'Влево'][d]); pad.appendChild(b); });
      }
      const key = e => {
        const m = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[e.key];
        if (m == null) return; e.preventDefault();
        if (!v.relative) step(m); else if (m === 0) step(dir); else if (m === 1) { dir = (dir + 1) % 4; draw(); } else if (m === 3) { dir = (dir + 3) % 4; draw(); }
      };
      document.addEventListener('keydown', key); current.cleanup.push(() => document.removeEventListener('keydown', key));
      A.append(wrap, el('p', 'note', v.naviNote || 'Стены замка не видны. Веди импульс по командам Оракула. Задел стенку — защита вернёт импульс к началу, но стенка останется подсвеченной.'));
      draw();
      return { noCheck: true, empty: () => true, check: () => done };
    },
    /* --- секвенатор: собрать вторую нить ДНК --- */
    dna(v, A, ctx) {
      const top = v.top.split(''), n = top.length, sol = top.map(b => PAIR[b]);
      const bot = top.map((_, i) => (v.given || []).includes(i) ? sol[i] : '');
      const CYC = ['A', 'T', 'G', 'C'];
      let done = false;
      const wrap = el('div', 'dna');
      const draw = () => {
        let h = '<div class="dn-strands">';
        for (let t = 0; t < n / 3; t++) {
          const tri = bot.slice(t * 3, t * 3 + 3).join(''), ok = tri.length === 3 && tri === sol.slice(t * 3, t * 3 + 3).join('');
          h += `<div class="dn-tri${ok ? ' ok' : ''}">`;
          for (let k = 0; k < 3; k++) {
            const i = t * 3 + k;
            h += `<div class="dn-col"><b style="background:${BASE_COL[top[i]]}">${top[i]}</b><i></i><button type="button" class="dn-b${(v.given || []).includes(i) ? ' given' : ''}" data-i="${i}" style="${bot[i] ? 'background:' + BASE_COL[bot[i]] : ''}" aria-label="Основание ${i + 1}">${bot[i] || '·'}</button></div>`;
          }
          h += `<span class="dn-l">${ok ? (v.codons[tri] || '?') : tri.length === 3 ? '?' : ''}</span></div>`;
        }
        wrap.innerHTML = h + '</div><div class="dn-screen">ДОНОР: <b>' + (done ? v.word : bot.every(Boolean) ? '— ОШИБКА СБОРКИ —' : '…') + '</b></div>';
      };
      wrap.addEventListener('click', e => {
        const b = e.target.closest('.dn-b'); if (!b || done || b.classList.contains('given')) return;
        const i = +b.dataset.i; bot[i] = CYC[(CYC.indexOf(bot[i]) + 1) % 4]; sfx('tick');
        if (bot.every((x, k) => x === sol[k])) { done = true; sfx('ok'); setTimeout(() => ctx.solve(), 900); }
        draw();
      });
      A.append(wrap, el('p', 'note', 'Нажимай на нижнюю клетку, чтобы сменить основание. Под каждой тройкой секвенатор пишет букву, если тройка собрана верно.'));
      draw();
      return { noCheck: true, keep: true, empty: () => true, check: () => done };
    },
    /* --- звуковая камера: повтори сигналы --- */
    simon(v, A, ctx) {
      const COLS = ['#3fe0c5', '#d0142c', '#ffd400', '#e8e8e8'], NAMES = ['ВЫСОКИЙ', 'НИЗКИЙ', 'ДВОЙНОЙ', 'ШУМ'];
      let k = 0, idx = 0, mode = 'wait', tms = [];
      const wrap = el('div', 'simon');
      wrap.innerHTML = `<p class="spot-count sm-stat"></p><div class="sm-pads">${COLS.map((c, i) => `<button type="button" class="sm-p" data-i="${i}" style="--c:${c}"><span>${NAMES[i]}</span></button>`).join('')}</div><div class="mech-row"><button type="button" class="btn sm-go">СЛУШАТЬ</button></div>`;
      const stat = wrap.querySelector('.sm-stat'), pads = [...wrap.querySelectorAll('.sm-p')], go = wrap.querySelector('.sm-go');
      const clear = () => { tms.forEach(clearTimeout); tms = []; };
      current.cleanup.push(clear);
      const flash = i => { pads[i].classList.add('on'); sfx('n' + i); tms.push(setTimeout(() => pads[i].classList.remove('on'), Math.min(380, v.speed * 0.7))); };
      const upd = () => { stat.textContent = `Серия ${Math.min(k + 1, v.rounds.length)} из ${v.rounds.length} · ${mode === 'play' ? 'слушай…' : mode === 'input' ? 'повтори: ' + idx + ' из ' + v.rounds[k] : 'нажми «Слушать»'}`; wrap.dataset.mode = mode; };
      const play = () => {
        clear(); mode = 'play'; idx = 0; upd(); go.disabled = true;
        const L = v.rounds[k];
        for (let j = 0; j < L; j++) tms.push(setTimeout(() => flash(v.seq[j]), 500 + j * v.speed));
        tms.push(setTimeout(() => { mode = 'input'; go.disabled = false; go.textContent = 'ПОВТОРИТЬ СЕРИЮ'; upd(); }, 500 + L * v.speed));
      };
      pads.forEach((p, i) => p.addEventListener('click', () => {
        if (mode !== 'input') return;
        flash(i);
        if (i !== v.seq[idx]) { sfx('wrong'); $('mFeedback').textContent = 'Не тот сигнал. Серия заново.'; mode = 'wait'; upd(); tms.push(setTimeout(play, 900)); return; }
        idx++; $('mFeedback').textContent = '';
        if (idx >= v.rounds[k]) {
          k++;
          if (k >= v.rounds.length) { mode = 'done'; stat.textContent = 'Все серии повторены.'; sfx('ok'); setTimeout(() => ctx.solve(), 700); return; }
          mode = 'wait'; upd(); tms.push(setTimeout(play, 900));
        } else upd();
      }));
      go.onclick = () => play();
      A.append(wrap); upd();
      return { noCheck: true, empty: () => true, check: () => mode === 'done' };
    },
    /* --- разрезанный чертёж: пятнашки 3×3 --- */
    slide(v, A, ctx) {
      const n = 3;
      const board = Array.from({ length: n * n }, (_, i) => i < n * n - 1 ? i : null);
      let empty = n * n - 1;
      v.path.slice(1).forEach(p => { board[empty] = board[p]; board[p] = null; empty = p; });
      const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(Art[v.art]());
      let done = false, moves = 0;
      const wrap = el('div', 'slide');
      const draw = () => {
        wrap.innerHTML = `<div class="sl-board${done ? ' ok' : ''}">${board.map((t, p) => t == null ? `<div class="sl-e"></div>` : `<button type="button" class="sl-t" data-pos="${p}" style="background-image:url(&quot;${url}&quot;);background-position:${(t % n) * 50}% ${Math.floor(t / n) * 50}%"><i>${t + 1}</i></button>`).join('')}</div><p class="spot-count">Ходов: ${moves}</p>`;
      };
      wrap.addEventListener('click', e => {
        const b = e.target.closest('.sl-t'); if (!b || done) return;
        const p = +b.dataset.pos, pr = Math.floor(p / n), pc = p % n, er = Math.floor(empty / n), ec = empty % n;
        if (Math.abs(pr - er) + Math.abs(pc - ec) !== 1) { sfx('scrape'); return; }
        board[empty] = board[p]; board[p] = null; empty = p; moves++; sfx('tick');
        if (board.every((t, i) => i === n * n - 1 ? t == null : t === i)) { done = true; sfx('ok'); setTimeout(() => ctx.solve(), 900); }
        draw();
      });
      A.append(wrap, el('p', 'note', 'Нажимай на кусок рядом с пустой клеткой, чтобы сдвинуть его. Номера в углу — подсказка порядка.'));
      draw();
      return { noCheck: true, empty: () => true, check: () => done };
    },
    /* --- картотека: найти пары «причина — следствие» --- */
    memory(v, A, ctx) {
      const cards = shuffle(v.pairs.flatMap(([a, b], k) => [{ t: a, k, s: 'a' }, { t: b, k, s: 'b' }]));
      const matched = new Set();
      let open = [], lock = false;
      const wrap = el('div', 'memo');
      const draw = () => {
        wrap.innerHTML = `<div class="mm-grid">${cards.map((c, i) => { const up = matched.has(c.k) || open.includes(i); return `<button type="button" class="mm-c${up ? ' up' : ''}${matched.has(c.k) ? ' ok' : ''} ${c.s}" data-i="${i}" data-k="${c.k}">${up ? `<span>${c.t}</span>` : '<b>?</b>'}</button>`; }).join('')}</div><p class="spot-count">Пар найдено: ${matched.size} из ${v.pairs.length}</p>`;
      };
      wrap.addEventListener('click', e => {
        const b = e.target.closest('.mm-c'); if (!b || lock) return;
        const i = +b.dataset.i, c = cards[i];
        if (matched.has(c.k) || open.includes(i)) return;
        open.push(i); sfx('page'); draw();
        if (open.length === 2) {
          const [x, y] = open.map(j => cards[j]);
          if (x.k === y.k) { matched.add(x.k); open = []; sfx('ok'); draw(); if (matched.size === v.pairs.length) setTimeout(() => ctx.solve(), 800); }
          else { lock = true; setTimeout(() => { open = []; lock = false; sfx('scrape'); draw(); }, 1100); }
        }
      });
      A.append(wrap, el('p', 'note', 'Открывай по две карточки. Пара — это причина и то, к чему она привела. Не пара — карточки перевернутся обратно.'));
      draw();
      return { noCheck: true, empty: () => true, check: () => matched.size === v.pairs.length };
    },
    /* --- кодовый цилиндр: повернуть кольца, чтобы в окне сложилось слово --- */
    rings(v, A, ctx) {
      const rot = v.start.slice(), N = 8;
      let done = false;
      const wrap = el('div', 'rings');
      const draw = () => {
        const word = v.rings.map((r, i) => r[((rot[i] % N) + N) % N]).join('');
        let h = `<rect width="300" height="300" fill="#0b0d10"/><circle cx="150" cy="150" r="148" fill="#1b1f24" stroke="#c8a64a" stroke-width="3"/>`;
        v.rings.forEach((ring, i) => {
          const rr = 142 - i * 29;
          h += `<circle cx="150" cy="150" r="${rr}" fill="${i % 2 ? '#2a2f36' : '#20252b'}" stroke="#555" stroke-width="2"/>`;
          ring.split('').forEach((ch, j) => {
            const a = ((j - rot[i]) * 360 / N) * Math.PI / 180, x = 150 + Math.sin(a) * (rr - 14), y = 150 - Math.cos(a) * (rr - 14);
            h += `<text x="${x.toFixed(1)}" y="${(y + 6).toFixed(1)}" font-family="Russo One, Arial Black, sans-serif" font-size="16" text-anchor="middle" fill="${j === ((rot[i] % N) + N) % N ? '#ffd400' : '#cfd8e0'}">${ch}</text>`;
          });
        });
        h += `<circle cx="150" cy="150" r="24" fill="#111" stroke="#c8a64a" stroke-width="3"/><text x="150" y="157" font-family="Russo One, Arial Black, sans-serif" font-size="18" text-anchor="middle" fill="#3fe0c5">Ω</text>
          <rect x="136" y="4" width="28" height="124" rx="6" fill="#ffd400" opacity=".12" stroke="#ffd400" stroke-width="2"/>`;
        wrap.innerHTML = `<svg viewBox="0 0 300 300" class="rg-svg${done ? ' ok' : ''}">${h}</svg><p class="spot-count">В окне сверху вниз: <b>${word}</b></p><div class="rg-ctl">${v.rings.map((_, i) => `<div class="rg-row"><span>${['ВНЕШНЕЕ', 'ВТОРОЕ', 'ТРЕТЬЕ', 'ВНУТРЕННЕЕ'][i] || 'КОЛЬЦО ' + (i + 1)}</span><button type="button" class="btn ghost rg-b" data-r="${i}" data-d="-1" aria-label="Повернуть назад">◀</button><button type="button" class="btn ghost rg-b" data-r="${i}" data-d="1" aria-label="Повернуть вперёд">▶</button></div>`).join('')}</div>`;
        return word;
      };
      wrap.addEventListener('click', e => {
        const b = e.target.closest('.rg-b'); if (!b || done) return;
        rot[+b.dataset.r] += +b.dataset.d; sfx('tick');
        if (draw() === v.word) { done = true; sfx('clunk'); draw(); setTimeout(() => ctx.solve(), 800); }
      });
      A.appendChild(wrap); draw();
      return { noCheck: true, empty: () => true, check: () => done };
    },
    /* --- логическая схема: тумблеры на входе, лампы на выходе --- */
    gates(v, A, ctx) {
      const val = {}; v.inputs.forEach(x => { val[x.id] = 0; });
      const OPS = { AND: ['И', a => a.every(Boolean)], OR: ['ИЛИ', a => a.some(Boolean)], NOT: ['НЕ', a => !a[0]], XOR: ['ИСКЛ. ИЛИ', a => a.filter(Boolean).length === 1] };
      let done = false;
      const wrap = el('div', 'gates');
      const calc = () => { v.gates.forEach(g => { val[g.id] = OPS[g.op][1](g.in.map(i => val[i])) ? 1 : 0; }); v.outs.forEach(o => { val[o.id] = val[o.from]; }); };
      const src = id => { const i = v.inputs.find(x => x.id === id); if (i) return [70, i.y]; const g = v.gates.find(x => x.id === id); return [g.x + 74, g.y]; };
      const draw = () => {
        calc();
        let h = `<rect width="560" height="300" fill="#071016"/><g stroke="#0e1d26" stroke-width="1">${Array.from({ length: 29 }, (_, i) => `<path d="M${i * 20} 0V300"/>`).join('')}${Array.from({ length: 16 }, (_, i) => `<path d="M0 ${i * 20}H560"/>`).join('')}</g>`;
        const wire = (from, tx, ty, k) => { const [sx, sy] = src(from), mx = tx - 12 - k * 8; return `<path d="M${sx} ${sy}H${mx}V${ty}H${tx}" fill="none" stroke="${val[from] ? '#ffd400' : '#3a4650'}" stroke-width="${val[from] ? 3.5 : 2.5}"/>`; };
        v.gates.forEach(g => g.in.forEach((id, k) => { h += wire(id, g.x, g.y - 20 + (k + 1) * 40 / (g.in.length + 1), k); }));
        v.outs.forEach(o => { h += wire(o.from, 470, o.y, 0); });
        v.inputs.forEach(x => { h += `<g class="gt-sw" data-id="${x.id}"><rect x="14" y="${x.y - 18}" width="56" height="36" rx="6" fill="#0d1a22" stroke="#9fd" stroke-width="2"/><rect x="${val[x.id] ? 44 : 20}" y="${x.y - 12}" width="20" height="24" rx="4" fill="${val[x.id] ? '#ffd400' : '#555'}"/><text x="11" y="${x.y + 5}" font-family="Russo One, Arial Black, sans-serif" font-size="12" text-anchor="end" fill="#cfd8e0">${x.id}</text><text x="42" y="${x.y + 32}" font-family="monospace" font-size="9" text-anchor="middle" fill="#9fd">${val[x.id] ? 'ВКЛ' : 'ВЫКЛ'}</text></g>`; });
        v.gates.forEach(g => { h += `<rect x="${g.x}" y="${g.y - 20}" width="74" height="40" rx="8" fill="#13232c" stroke="${val[g.id] ? '#ffd400' : '#6a7a8a'}" stroke-width="2.5"/><text x="${g.x + 37}" y="${g.y + 5}" font-family="Russo One, Arial Black, sans-serif" font-size="${OPS[g.op][0].length > 4 ? 10 : 13}" text-anchor="middle" fill="#fff">${OPS[g.op][0]}</text>`; });
        v.outs.forEach(o => { const on = !!val[o.id], ok = +on === o.want; h += `<circle cx="490" cy="${o.y}" r="16" fill="${on ? '#ffd400' : '#1a1a1a'}" stroke="${ok ? '#2fae5a' : '#d0142c'}" stroke-width="3" ${on ? 'filter="url(#glowS)"' : ''}/><text x="490" y="${o.y + 34}" font-family="Russo One, Arial Black, sans-serif" font-size="10" text-anchor="middle" fill="#fff">${o.label}</text><text x="490" y="${o.y - 24}" font-family="monospace" font-size="9" text-anchor="middle" fill="${ok ? '#2fae5a' : '#ff8a96'}">${o.want ? 'ДОЛЖНА ГОРЕТЬ' : 'ДОЛЖНА ПОГАСНУТЬ'}</text>`; });
        wrap.innerHTML = `<svg viewBox="0 0 560 300" class="gt-svg">${h}</svg>`;
        return v.outs.every(o => +!!val[o.id] === o.want);
      };
      wrap.addEventListener('click', e => {
        const g = e.target.closest('.gt-sw'); if (!g || done) return;
        val[g.dataset.id] ^= 1; sfx('click');
        if (draw()) { done = true; sfx('clunk'); setTimeout(() => ctx.solve(), 800); }
      });
      A.append(wrap, el('p', 'note', 'Нажимай на тумблеры слева. Жёлтый провод — ток есть, серый — нет. Рамка лампы зелёная, когда лампа в нужном положении.'));
      draw();
      return { noCheck: true, empty: () => true, check: () => done };
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
    // улика, которая открывается только после другой
    if (clue.needs && !st.solved[clue.needs]) { batSay(clue.needsSay || 'Сначала разберись с другой уликой на этом месте.', clue.needsTag || 'РОБИН'); return; }
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

  // деталь мира: просто карточка, без загадки и очков
  function openLore(l, b) {
    if (current) current.cleanup.forEach(f => f());
    current = { clue: { id: 'lore:' + l.id }, v: {}, cleanup: [] };
    st.lore = st.lore || {}; st.lore[l.id] = true; if (b) b.classList.add('seen');
    $('mTitle').textContent = l.name;
    $('mExhibit').innerHTML = l.card;
    $('mQuestion').textContent = '';
    $('mFeedback').textContent = '';
    $('mAnswer').innerHTML = '<p class="lore-ok">Это не улика по делу. Но в Готэме всё рано или поздно оказывается связано.</p>';
    $('mConclusion').hidden = true; $('mCheck').hidden = true; $('mHint').hidden = true;
    $('modal').hidden = false; $('modal').classList.add('lore-open'); document.body.classList.add('modal-open');
    document.querySelector('.m-body').scrollTop = 0;
    sfx('page');
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
    $('mHint').textContent = lv === 0 ? `СПРОСИТЬ ${C.helper ? C.helper.ask : 'БЭТМЕНА'} (−очки)` : lv < 3 ? `ЕЩЁ ПОДСКАЗКА (${lv}/3)` : 'ПОВТОРИТЬ ПОДСКАЗКУ (3/3)';
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
    $('modal').hidden = true; $('modal').classList.remove('lore-open');
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
    $('batFace').innerHTML = helperArt();
    document.body.classList.toggle('helper-oracle', !!C.helper);
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
    const burning = (() => { try { return localStorage.getItem('gcf_burning') === '1'; } catch (_) { return false; } })();
    document.body.classList.toggle('burning', burning);
    if (window.Sound) Sound.play(burning ? 'ashes' : 'intro');
    if (burning) $('pxSub').textContent = 'Ночь после полуночи. Сирены.';
    roadCtl = burning && Pixel.burning ? Pixel.burning($('road')) : Pixel.road($('road'));
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
        ch.cases.forEach((cs, k) => {
          const best = store.get(cs.id);
          const prev = ch.cases[k - 1], shut = prev && !store.get(prev.id) && !/[?&]unlock\b/.test(location.search);
          const c = el('button', 'diff-b' + (shut ? ' locked' : ''), `<b>ДЕЛО ${cs.no} · ${cs.title}</b><i>${shut ? 'откроется после дела ' + prev.no : cs.teaser + (best ? ' · ЛУЧШЕЕ: ' + best.pts : '')}</i>`);
          c.type = 'button'; c.dataset.case = cs.id;
          if (shut) c.disabled = true;
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
        $('pxSub').textContent = document.body.classList.contains('burning') ? 'Сквозь дым — к следующему делу.' : 'Полный газ!';
        sfx('boost');
        roadCtl.boost(() => { roadCtl.stop(); startCase(); });
      };
      dl.appendChild(b);
    });
    $('diffBack').onclick = e => { e.stopPropagation(); $('diff').hidden = true; $(diffFrom).hidden = false; };

    let shown = false;
    const reveal = () => { if (shown) return; shown = true; $('files').hidden = false; $('pxSub').textContent = burning ? 'Готэм горит. Пять башен «Уэйн Энтерпрайзес» в огне. Бэт-сигнал сегодня не зажгут.' : 'Капитан Гордон передал папки. Стажировка продолжается.'; };
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
