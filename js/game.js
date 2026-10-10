/* Движок: заставка → расследование → финал → пещера с очками. */
(function () {
  const $ = id => document.getElementById(id);
  const C = window.CASE1;
  const TOTAL = C.scenes.reduce((n, s) => n + s.clues.length, 0);
  const BEST_KEY = 'gcf_best_' + C.id;
  let st, roadCtl, caveCtl, current = null;

  const store = {
    get() { try { return parseInt(localStorage.getItem(BEST_KEY), 10) || 0; } catch (e) { return 0; } },
    set(v) { try { localStorage.setItem(BEST_KEY, String(v)); } catch (e) { /* не страшно */ } }
  };

  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
    document.body.style.overflow = 'hidden';
  }

  /* ---------- печатная машинка ---------- */
  function type(el, text, speed) {
    if (el._t) clearInterval(el._t);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = text; return; }
    let i = 0;
    el.textContent = '';
    el._full = text;
    el._t = setInterval(() => {
      i += 2;
      el.textContent = text.slice(0, i);
      if (i >= text.length) { clearInterval(el._t); el._t = null; }
    }, speed || 16);
  }
  function finishType(el) { if (el._t) { clearInterval(el._t); el._t = null; el.textContent = el._full; return true; } return false; }

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
    const el = $('story');
    batHide();
    function render() {
      const p = pages[i];
      const art = $('storyArt');
      art.className = 'story-art' + (p.bat ? ' bat-art' : '');
      art.innerHTML = (p.bat ? Art.batman() : Art[p.art]()) + (p.title ? `<h1>${p.title}</h1>` : '');
      $('storyCap').textContent = p.cap || '';
      type($('storyText'), p.text, 14);
      $('storyNext').textContent = i === pages.length - 1 ? (lastLabel || 'ДАЛЬШЕ →') : 'ДАЛЬШЕ →';
      el.scrollTop = 0;
    }
    $('storyNext').onclick = () => {
      if (finishType($('storyText'))) return;
      i++;
      if (i >= pages.length) { el.hidden = true; onEnd(); } else render();
    };
    el.hidden = false;
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
    const li = document.createElement('li');
    li.className = 'place'; li.textContent = sc.loc.split(' · ').slice(0, 2).join(' · ');
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

  /* ---------- загадка ---------- */
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function openClue(clue) {
    current = { clue, sel: new Set(), built: [] };
    const solved = !!st.solved[clue.id];
    $('mTitle').textContent = clue.name;
    $('mExhibit').innerHTML = clue.exhibit();
    $('mQuestion').textContent = clue.q;
    $('mFeedback').textContent = '';
    const A = $('mAnswer');
    A.innerHTML = '';
    if (!solved) buildAnswer(clue, A);
    $('mConclusion').hidden = !solved;
    $('mConclusion').textContent = clue.done;
    $('mCheck').hidden = solved; $('mHint').hidden = solved;
    hintLabel();
    $('modal').hidden = false;
    $('modal').scrollTop = 0;
    const inp = A.querySelector('input');
    if (inp && window.innerWidth > 900) inp.focus();
  }

  function buildAnswer(clue, A) {
    if (clue.type === 'input') {
      A.innerHTML = `<input type="text" id="ansIn" autocomplete="off" spellcheck="false" placeholder="${clue.placeholder || ''}" aria-label="Ответ">`;
      A.firstChild.onkeydown = e => { if (e.key === 'Enter') check(); };
    } else if (clue.type === 'choice' || clue.type === 'multi') {
      const box = document.createElement('div');
      box.className = 'opts';
      clue.options.forEach((o, i) => {
        const b = document.createElement('button');
        b.className = 'opt'; b.type = 'button'; b.textContent = o;
        b.setAttribute('aria-pressed', 'false');
        b.onclick = () => {
          if (clue.type === 'choice') { current.sel.clear(); box.querySelectorAll('.opt').forEach(x => { x.classList.remove('sel'); x.setAttribute('aria-pressed', 'false'); }); }
          if (current.sel.has(i)) current.sel.delete(i); else current.sel.add(i);
          b.classList.toggle('sel', current.sel.has(i));
          b.setAttribute('aria-pressed', String(current.sel.has(i)));
        };
        box.appendChild(b);
      });
      A.appendChild(box);
    } else if (clue.type === 'order') {
      current.pool = shuffle(clue.items.concat(clue.decoys || []));
      A.innerHTML = '<div class="order-h">ЛЕНТЫ ИЗ КОРЗИНЫ</div><div class="pool" id="pool"></div><div class="order-h">СОБРАННЫЙ ДОКУМЕНТ (нажми на ленту, чтобы убрать)</div><div class="built" id="built"></div>';
      renderOrder();
    }
  }

  function renderOrder() {
    const mk = (t, from) => {
      const b = document.createElement('button');
      b.className = 'strip'; b.type = 'button'; b.textContent = t;
      b.onclick = () => {
        if (from === 'pool') { current.pool.splice(current.pool.indexOf(t), 1); current.built.push(t); }
        else { current.built.splice(current.built.indexOf(t), 1); current.pool.push(t); }
        renderOrder();
      };
      return b;
    };
    $('pool').replaceChildren(...current.pool.map(t => mk(t, 'pool')));
    $('built').replaceChildren(...current.built.map(t => mk(t, 'built')));
  }

  function isRight(clue) {
    if (clue.type === 'input') return clue.check($('ansIn').value);
    if (clue.type === 'choice') return current.sel.size === 1 && current.sel.has(clue.answer);
    if (clue.type === 'multi') return current.sel.size === clue.answer.length && clue.answer.every(a => current.sel.has(a));
    if (clue.type === 'order') return current.built.length === clue.items.length && clue.items.every((t, i) => current.built[i] === t);
    return false;
  }

  function isEmpty(clue) {
    if (clue.type === 'input') return !$('ansIn').value.trim();
    if (clue.type === 'order') return !current.built.length;
    return !current.sel.size;
  }

  function check() {
    const clue = current.clue;
    if (st.solved[clue.id]) return;
    if (isEmpty(clue)) { $('mFeedback').textContent = 'Сначала дай ответ.'; return; }
    if (!isRight(clue)) {
      st.wrongN = (st.wrongN || 0) + 1;
      $('mFeedback').textContent = 'Неверно.';
      batSay(C.wrong[st.wrongN % C.wrong.length], 'БЭТМЕН');
      const card = document.querySelector('.modal-card');
      card.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-9px)' }, { transform: 'translateX(9px)' }, { transform: 'translateX(0)' }], { duration: 220 });
      return;
    }
    st.solved[clue.id] = true;
    $('mFeedback').textContent = '';
    $('mAnswer').innerHTML = '';
    $('mConclusion').hidden = false;
    $('mCheck').hidden = true; $('mHint').hidden = true;
    batHide();
    document.querySelector(`.hot[data-id="${clue.id}"]`).classList.add('solved');
    $('notesEmpty').hidden = true;
    const li = document.createElement('li');
    if (st.helped[clue.id]) li.className = 'helped';
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
    const clue = current.clue;
    let lv = st.hintLevel[clue.id] || 0;
    if (lv < clue.hints.length) { lv++; st.hintLevel[clue.id] = lv; st.hintsUsed++; }
    st.helped[clue.id] = true;
    batSay(clue.hints[lv - 1], `ПОДСКАЗКА ${lv}/3`);
    hintLabel(); hud();
  }

  function closeModal() {
    $('modal').hidden = true;
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
          25: ['НОВИЧОК', '«Ты дошёл до конца, и судья жива. Это главное. А думать самому — научишься. Начнём с начала».']
        }[pts];
        $('scoreRank').textContent = 'ЗВАНИЕ: ' + info[0];
        $('scoreDetail').textContent = `ЗАГАДОК С ПОДСКАЗКОЙ: ${h} ИЗ ${TOTAL}`;
        $('scoreQuote').textContent = info[1];
        let n = 0;
        const t = setInterval(() => { n = Math.min(pts, n + 5); $('scoreNum').textContent = n; if (n >= pts) clearInterval(t); }, 40);
        if (pts > store.get()) store.set(pts);
      });
    }, 'В ПЕЩЕРУ →');
  }

  /* ---------- запуск ---------- */
  function startCase() {
    st = { scene: 0, solved: {}, helped: {}, hintLevel: {}, hintsUsed: 0 };
    $('notes').innerHTML = '';
    $('notesEmpty').hidden = false;
    show('case');
    playStory(C.briefing, () => loadScene(0), 'НАЧАТЬ ОСМОТР →');
  }

  function init() {
    roadCtl = Pixel.road($('road'));
    const best = store.get();
    if (best) $('bestBadge').textContent = 'ЛУЧШИЙ РЕЗУЛЬТАТ: ' + best;
    let shown = false;
    const reveal = () => { if (shown) return; shown = true; $('files').hidden = false; $('pxSub').textContent = 'Капитан Гордон передал папки. Стажировка начинается.'; };
    setTimeout(reveal, 2600);
    $('intro').addEventListener('click', reveal);
    $('case1Btn').onclick = e => {
      e.stopPropagation();
      $('case1Btn').disabled = true;
      $('files').classList.add('go');
      $('pxSub').textContent = 'Полный газ!';
      roadCtl.boost(() => { roadCtl.stop(); startCase(); });
    };
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
