/* База сохранённых игр. Всё хранится в браузере (localStorage), сервер не нужен.
   «Живой» прогресс игры лежит в обычных ключах gcf_* (лучшие результаты дел, пропуск стажировки, флаги сюжета).
   Каждая игра — снимок этих ключей плюс журнал пройденных дел. Переключение игры = сохранить снимок текущей,
   очистить живые ключи, развернуть снимок выбранной, перезагрузить страницу. */
(function () {
  const DB_KEY = 'gcf_db';
  const KEEP = ['gcf_settings', DB_KEY]; // настройки общие для всех игр
  const isProgress = k => k && k.indexOf('gcf_') === 0 && KEEP.indexOf(k) < 0;
  let ok = true;
  try { localStorage.setItem('gcf__t', '1'); localStorage.removeItem('gcf__t'); } catch (_) { ok = false; }

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const liveKeys = () => { const a = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (isProgress(k)) a.push(k); } return a; };
  const snapshot = () => { const o = {}; liveKeys().forEach(k => { o[k] = localStorage.getItem(k); }); return o; };
  const clearLive = () => liveKeys().forEach(k => localStorage.removeItem(k));
  const restore = data => Object.keys(data || {}).forEach(k => { if (isProgress(k)) localStorage.setItem(k, data[k]); });

  function read() {
    let db = null;
    try { db = JSON.parse(localStorage.getItem(DB_KEY)); } catch (_) { db = null; }
    if (!db || !Array.isArray(db.saves)) db = { v: 1, active: null, n: 0, saves: [] };
    return db;
  }
  function write(db) { try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (_) { /* переполнено — не страшно */ } }
  function blank(db, name) {
    db.n = (db.n || db.saves.length) + 1;
    const now = Date.now();
    return { id: uid(), name: name || 'Игра ' + db.n, created: now, updated: now, data: {}, runs: [] };
  }

  // первый запуск: всё, что игрок уже прошёл, становится «Игрой 1»
  function ensure() {
    const db = read();
    if (!db.saves.length) { const s = blank(db, 'Игра 1'); s.data = snapshot(); db.saves.push(s); db.active = s.id; write(db); }
    else if (!db.saves.some(s => s.id === db.active)) { db.active = db.saves[0].id; write(db); }
    return db;
  }
  const activeOf = db => db.saves.find(s => s.id === db.active);

  // текущий живой прогресс → в снимок активной игры
  function sync() {
    if (!ok) return;
    const db = ensure(), s = activeOf(db);
    s.data = snapshot(); s.updated = Date.now();
    write(db);
  }
  function switchTo(id) {
    if (!ok) return false;
    sync();
    const db = read(), t = db.saves.find(s => s.id === id);
    if (!t) return false;
    clearLive(); restore(t.data);
    db.active = t.id; t.opened = Date.now();
    write(db);
    return true;
  }
  function newGame(name) {
    if (!ok) return null;
    sync();
    const db = read(), s = blank(db, (name || '').trim().slice(0, 40) || null);
    db.saves.unshift(s); db.active = s.id;
    clearLive();
    write(db);
    return s;
  }
  function remove(id) {
    const db = read();
    if (id === db.active) return false;
    db.saves = db.saves.filter(s => s.id !== id);
    write(db); return true;
  }
  function rename(id, name) {
    const db = read(), s = db.saves.find(x => x.id === id);
    if (!s || !(name || '').trim()) return false;
    s.name = name.trim().slice(0, 40); write(db); return true;
  }
  // запись в журнал игры: какое дело, сложность, очки, подсказки
  function logRun(run) {
    if (!ok) return;
    sync();
    const db = read(), s = activeOf(db);
    s.runs = s.runs || [];
    s.runs.push(Object.assign({ date: Date.now() }, run));
    if (s.runs.length > 200) s.runs = s.runs.slice(-200);
    s.updated = Date.now();
    write(db);
  }
  function list() { const db = ensure(); if (ok) sync(); return read().saves.map(s => Object.assign({ active: s.id === db.active }, s)); }

  if (ok) ensure();
  window.addEventListener('pagehide', () => { try { sync(); } catch (_) {} });

  window.Saves = { ok, list, active: () => activeOf(ensure()), sync, newGame, switchTo, remove, rename, logRun, isProgress };
})();
