/* Музыка и звуки. Всё синтезируется в браузере через Web Audio — файлов нет.
   Темы: intro (погоня под дождём), noir (дело №1), tea (дело №2, механический вальс), cave (победа). */
(function () {
  let ctx = null, master, musicBus, sfxBus, reverb, rainGain, timer = null;
  let track = null, trackGain = null, step = 0, nextTime = 0, wanted = null, thunderAt = 0;
  const vol = { music: 0.6, sfx: 0.7 };

  const NOTE = n => 440 * Math.pow(2, (n - 69) / 12); // MIDI → Гц
  const N = { C2: 36, D2: 38, E2: 40, F2: 41, G2: 43, A2: 45, Bb2: 46, C3: 48, D3: 50, E3: 52, F3: 53, G3: 55, A3: 57, Bb3: 58, Cs4: 61, C4: 60, D4: 62, E4: 64, F4: 65, G4: 67, Gs4: 68, A4: 69, Bb4: 70, B4: 71, C5: 72, Cs5: 73, D5: 74, E5: 76, F5: 77, Fs5: 78, G5: 79, Gs5: 80, A5: 81, B5: 83, D6: 86, B3: 59, B2: 47, Ds4: 63, Fs4: 66 };

  function init() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ctx.destination);
    musicBus = ctx.createGain(); sfxBus = ctx.createGain();
    musicBus.connect(master); sfxBus.connect(master);
    // реверберация: синтетический импульс
    reverb = ctx.createConvolver();
    const len = ctx.sampleRate * 2.8, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    reverb.buffer = ir;
    const wet = ctx.createGain(); wet.gain.value = 0.32;
    reverb.connect(wet); wet.connect(musicBus);
    // дождь: шум через полосовой фильтр
    const nb = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = nb; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1600; bp.Q.value = 0.4;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 500;
    rainGain = ctx.createGain(); rainGain.gain.value = 0;
    src.connect(bp); bp.connect(hp); hp.connect(rainGain); rainGain.connect(musicBus);
    src.start();
    apply();
    timer = setInterval(tick, 50);
    return true;
  }

  function apply() {
    if (!ctx) return;
    musicBus.gain.setTargetAtTime(vol.music * 0.9, ctx.currentTime, 0.1);
    sfxBus.gain.setTargetAtTime(vol.sfx, ctx.currentTime, 0.05);
  }

  /* ---------- инструменты ---------- */
  function env(g, t, a, peak, d, sustain, rel) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    if (sustain != null) { g.gain.setValueAtTime(peak, t + a + sustain); g.gain.exponentialRampToValueAtTime(0.0001, t + a + sustain + rel); }
    else g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function out(node, send) { node.connect(trackGain); if (send) { const s = ctx.createGain(); s.gain.value = send; node.connect(s); s.connect(reverb); } }

  function pad(notes, t, dur, level) {
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(380, t); f.frequency.linearRampToValueAtTime(820, t + dur * 0.5); f.frequency.linearRampToValueAtTime(420, t + dur);
    const g = ctx.createGain(); env(g, t, 1.6, level || 0.05, 0, Math.max(0.1, dur - 1.6), 2.2);
    f.connect(g); out(g, 0.6);
    notes.forEach(n => [-7, 7].forEach(det => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = NOTE(n); o.detune.value = det; o.connect(f); o.start(t); o.stop(t + dur + 2.5); }));
  }
  function bass(n, t, dur, level) {
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = NOTE(n);
    const g = ctx.createGain(); env(g, t, 0.02, level || 0.16, 0, Math.max(0.05, dur - 0.1), 0.25);
    o.connect(g); out(g, 0.1); o.start(t); o.stop(t + dur + 0.4);
  }
  function piano(n, t, level) {
    const g = ctx.createGain(); env(g, t, 0.008, level || 0.07, 2.6);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2400;
    f.connect(g); out(g, 0.8);
    [[1, 'sine', 1], [2, 'triangle', 0.35], [3, 'sine', 0.12]].forEach(([m, ty, a]) => {
      const o = ctx.createOscillator(); o.type = ty; o.frequency.value = NOTE(n) * m;
      const og = ctx.createGain(); og.gain.value = a; o.connect(og); og.connect(f); o.start(t); o.stop(t + 3);
    });
  }
  function celesta(n, t, level) {
    const g = ctx.createGain(); env(g, t, 0.004, level || 0.06, 1.3);
    g.connect(trackGain); const s = ctx.createGain(); s.gain.value = 0.7; g.connect(s); s.connect(reverb);
    [[1, 1], [4, 0.25], [6.8, 0.06]].forEach(([m, a]) => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = NOTE(n) * m; const og = ctx.createGain(); og.gain.value = a; o.connect(og); og.connect(g); o.start(t); o.stop(t + 1.5); });
  }
  function pluck(n, t, level) {
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = NOTE(n);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(1800, t); f.frequency.exponentialRampToValueAtTime(300, t + 0.25);
    const g = ctx.createGain(); env(g, t, 0.005, level || 0.12, 0.35);
    o.connect(f); f.connect(g); out(g, 0.2); o.start(t); o.stop(t + 0.5);
  }
  function square(n, t, dur, level, cut) {
    const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = NOTE(n);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cut || 1800;
    const g = ctx.createGain(); env(g, t, 0.005, level || 0.03, 0, Math.max(0.02, dur - 0.04), 0.06);
    o.connect(f); f.connect(g); out(g, 0.25); o.start(t); o.stop(t + dur + 0.15);
  }
  // «голос»: треугольник с вибрато через форманту — оперная ария Пыга
  function voice(n, t, dur, level) {
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = NOTE(n);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 5.4;
    const lg = ctx.createGain(); lg.gain.value = NOTE(n) * 0.012; lfo.connect(lg); lg.connect(o.frequency);
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 1.1;
    const g = ctx.createGain(); env(g, t, 0.22, level || 0.1, 0, Math.max(0.1, dur - 0.3), 0.5);
    o.connect(f); f.connect(g); out(g, 0.75); o.start(t); lfo.start(t); o.stop(t + dur + 0.9); lfo.stop(t + dur + 0.9);
  }
  function kick(t, level) {
    const o = ctx.createOscillator(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    const g = ctx.createGain(); env(g, t, 0.003, level || 0.35, 0.28); o.connect(g); out(g); o.start(t); o.stop(t + 0.35);
  }
  function noiseHit(t, dur, freq, level, type) {
    const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(); s.buffer = b;
    const f = ctx.createBiquadFilter(); f.type = type || 'highpass'; f.frequency.value = freq;
    const g = ctx.createGain(); env(g, t, 0.002, level, dur);
    s.connect(f); f.connect(g); return { s, g };
  }
  function hat(t, level) { const h = noiseHit(t, 0.05, 7000, level || 0.04); out(h.g); h.s.start(t); }
  function thunder(t) {
    const h = noiseHit(t, 4.5, 140, 0.0001, 'lowpass');
    h.g.gain.cancelScheduledValues(t);
    h.g.gain.setValueAtTime(0.0001, t); h.g.gain.exponentialRampToValueAtTime(0.5, t + 0.08); h.g.gain.exponentialRampToValueAtTime(0.12, t + 0.9); h.g.gain.exponentialRampToValueAtTime(0.0001, t + 4.4);
    out(h.g, 0.5); h.s.start(t);
  }

  /* ---------- темы ---------- */
  const TRACKS = {
    // погоня под дождём: остинато баса, арпеджио, глухая бочка
    intro: {
      bpm: 112, div: 4, len: 64, rain: 0.05,
      play(i, t, s) {
        const bar = Math.floor(i / 16) % 4, k = i % 16;
        const ch = [[N.D3, N.F3, N.A3, N.D4], [N.Bb2, N.D3, N.F3, N.Bb3], [N.C3, N.E3, N.G3, N.C4], [N.A2, N.Cs4 - 12, N.E3, N.A3]][bar];
        if (k % 2 === 0) bass(ch[0] - 12, t, s * 1.6, 0.13);
        square(ch[(k * 3) % 4] + 12, t, s * 0.8, 0.024, 1400);
        if (k % 8 === 0) kick(t, 0.3);
        if (k % 4 === 2) hat(t, 0.025);
        if (i % 64 === 0) [[N.D5, 0], [N.F5, 3], [N.E5, 6], [N.A4, 8]].forEach(([n, d]) => square(n, t + d * s, s * 2.6, 0.03, 2600));
        if (i % 64 === 32) [[N.D5, 0], [N.F5, 3], [N.G5, 6], [N.Cs5, 8]].forEach(([n, d]) => square(n, t + d * s, s * 2.6, 0.03, 2600));
      }
    },
    // нуар: медленные аккорды, бас, редкое пианино, дождь и гром
    noir: {
      bpm: 60, div: 1, len: 32, rain: 0.07, storm: true,
      play(i, t, s) {
        const bar2 = Math.floor(i / 8) % 4;
        const chords = [[N.D3, N.A3, N.E4, N.F4], [N.Bb2, N.F3, N.A3, N.D4], [N.G2, N.D3, N.F3, N.Bb3], [N.A2, N.E3, N.G3, N.Cs4]];
        if (i % 8 === 0) { pad(chords[bar2], t, s * 8, 0.035); bass(chords[bar2][0] - 12, t, s * 7.5, 0.12); }
        const scale = [N.D4, N.E4, N.F4, N.G4, N.A4, N.Bb4, N.Cs5, N.D5, N.F5, N.A5];
        if (Math.random() < 0.32) piano(scale[Math.floor(Math.random() * scale.length)], t + (Math.random() < 0.5 ? 0 : s / 2), 0.05);
        if (i % 16 === 12 && Math.random() < 0.5) [N.A4, N.Bb4, N.A4, N.F4].forEach((n, d) => piano(n, t + d * s * 0.5, 0.045));
      }
    },
    // механический вальс: музыкальная шкатулка в ля миноре
    tea: {
      bpm: 92, div: 1, len: 48, rain: 0.035,
      mel: [[N.E5, 2], [N.A5, 1], [N.Gs5, 2], [N.E5, 1], [N.F5, 1], [N.E5, 1], [N.D5, 1], [N.E5, 3], [N.C5, 2], [N.E5, 1], [N.B4, 2], [N.Gs4, 1], [N.A4, 1], [N.B4, 1], [N.C5, 1], [N.B4, 3],
        [N.E5, 2], [N.A5, 1], [N.B5, 2], [N.Gs5, 1], [N.A5, 1], [N.F5, 1], [N.D5, 1], [N.E5, 3], [N.F5, 1], [N.E5, 1], [N.D5, 1], [N.C5, 1], [N.B4, 1], [N.Gs4, 1], [N.A4, 3], [N.A4, 3]],
      play(i, t, s) {
        const bar = Math.floor(i / 3) % 8, beat = i % 3;
        const roots = [N.A2, N.E2, N.D3, N.E2, N.A2, N.E2, N.F2, N.E2];
        const chord = [[N.C4, N.E4], [N.Gs4 - 12, N.B4 - 12], [N.F4, N.A4], [N.Gs4 - 12, N.D4], [N.C4, N.E4], [N.Gs4 - 12, N.B4 - 12], [N.A3, N.C4], [N.Gs4 - 12, N.B4 - 12]][bar];
        if (beat === 0) pluck(roots[bar], t, 0.2); else chord.forEach(n => pluck(n, t, 0.065));
        // мелодия: проигрываем по долям
        if (!this._m || i % this.len === 0) { this._m = []; let p = 0; this.mel.forEach(([n, d]) => { this._m[p] = n; p += d; }); }
        const n = this._m[i % this.len];
        if (n) celesta(n + (Math.floor(i / this.len) % 2 && Math.random() < 0.15 ? -1 : 0), t, 0.085);
      }
    },
    // два мотива: скрежет ножа Зсасза и ария Пыга, по очереди
    duo: {
      bpm: 72, div: 2, len: 64, rain: 0.05, storm: true,
      mel: [[N.B4, 2], [N.C5, 1], [N.B4, 1], [N.A4, 2], [N.Gs4, 2], [N.A4, 1], [N.B4, 1], [N.C5, 1], [N.D5, 1], [N.E5, 4], [N.D5, 2], [N.C5, 1], [N.B4, 1], [N.A4, 2], [N.B4, 2], [N.Gs4, 2], [N.E4, 6]],
      play(i, t, s) {
        const bar = Math.floor(i / 8) % 4, k = i % 8, part = Math.floor(i / 32) % 2;
        const chords = [[N.E3, N.G3, N.B3], [N.C3, N.E3, N.G3], [N.A2, N.C4 - 12, N.E3], [N.B2, N.Ds4 - 12, N.Fs4 - 12]];
        if (k === 0) pad(chords[bar], t, s * 8, 0.024);
        if (part === 0) {
          bass(chords[bar][0] - 12, t, s * 0.8, k % 3 === 0 ? 0.17 : 0.08);
          if (k % 4 === 2) { const h = noiseHit(t, 0.09, 2600, 0.035, 'bandpass'); out(h.g, 0.3); h.s.start(t); }
          if (k === 7 && bar % 2) square(N.Fs5 + 12, t, s * 0.3, 0.008, 4000);
        } else {
          if (k % 4 === 0) bass(chords[bar][0] - 12, t, s * 3.6, 0.1);
          if (!this._m) { this._m = []; let p = 0; this.mel.forEach(([n, d]) => { this._m[p] = [n, d]; p += d; }); }
          const m = this._m[i % 32];
          if (m) voice(m[0], t, m[1] * s, 0.11);
        }
      }
    },
    // победа: бодрая восьмибитная фанфара
    cave: {
      bpm: 132, div: 2, len: 32, rain: 0,
      play(i, t, s) {
        const bar = Math.floor(i / 8) % 4, k = i % 8;
        const ch = [[N.D3, N.Fs5 - 24, N.A3], [N.G2 + 12, N.B4 - 12, N.D4], [N.A2 + 12, N.Cs4, N.E4], [N.D3, N.Fs5 - 24, N.A3]][bar];
        if (k % 2 === 0) bass(ch[0] - 12, t, s * 0.9, 0.14);
        square(ch[k % 3] + 12, t, s * 0.7, 0.016, 2200);
        if (k === 0 || k === 4) kick(t, 0.25);
        if (k % 2 === 1) hat(t, 0.02);
        const lead = [[N.D5, N.Fs5, N.A5, N.D6, N.A5, 0, N.Fs5, 0], [N.G5, 0, N.B5, 0, N.G5, N.E5, N.D5, 0], [N.E5, N.Fs5, N.G5, N.A5, N.G5, N.Fs5, N.E5, 0], [N.D5, 0, N.A4, 0, N.D5, 0, 0, 0]][bar][k];
        if (lead) square(lead, t, s * 0.9, 0.028, 3200);
      }
    }
  };

  function tick() {
    if (!ctx || !track) return;
    const s = 60 / track.bpm / track.div;
    while (nextTime < ctx.currentTime + 0.25) {
      try { track.play(step, nextTime, s); } catch (e) { if (!track._warned) { track._warned = true; console.warn('music:', e); } }
      step = (step + 1) % (track.len * 8);
      nextTime += s;
    }
    if (track.storm && ctx.currentTime > thunderAt) { thunder(ctx.currentTime + 0.1); thunderAt = ctx.currentTime + 35 + Math.random() * 40; }
  }

  function play(name) {
    wanted = name;
    if (!ctx || ctx.state !== 'running') return;
    if (track === TRACKS[name]) return;
    const old = trackGain;
    if (old) { old.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.5); setTimeout(() => old.disconnect(), 3500); }
    track = TRACKS[name] || null;
    if (!track) { rainGain.gain.setTargetAtTime(0, ctx.currentTime, 0.6); return; }
    trackGain = ctx.createGain(); trackGain.gain.value = 0.0001; trackGain.connect(musicBus);
    trackGain.gain.setTargetAtTime(1, ctx.currentTime + 0.1, 0.6);
    rainGain.gain.setTargetAtTime(track.rain, ctx.currentTime, 0.8);
    step = 0; nextTime = ctx.currentTime + 0.15; thunderAt = ctx.currentTime + 12;
    track._m = null;
  }

  /* ---------- звуки интерфейса ---------- */
  function sfx(name) {
    if (!ctx || ctx.state !== 'running' || vol.sfx <= 0) return;
    const t = ctx.currentTime + 0.01;
    const tone = (f, at, dur, type, lvl) => { const o = ctx.createOscillator(); o.type = type || 'sine'; o.frequency.value = f; const g = ctx.createGain(); env(g, at, 0.005, lvl || 0.12, dur); o.connect(g); g.connect(sfxBus); o.start(at); o.stop(at + dur + 0.05); };
    const nz = (at, dur, freq, lvl, type) => { const h = noiseHit(at, dur, freq, lvl, type); h.g.connect(sfxBus); h.s.start(at); };
    switch (name) {
      case 'click': tone(900, t, 0.04, 'square', 0.03); break;
      case 'tick': nz(t, 0.03, 3000, 0.12); tone(2200, t, 0.02, 'square', 0.02); break;
      case 'clunk': tone(90, t, 0.18, 'triangle', 0.25); nz(t, 0.08, 600, 0.12, 'lowpass'); break;
      case 'ok': [NOTE(74), NOTE(78), NOTE(81)].forEach((f, k) => tone(f, t + k * 0.09, 0.5, 'sine', 0.1)); break;
      case 'wrong': tone(110, t, 0.3, 'sawtooth', 0.06); tone(104, t + 0.05, 0.3, 'sawtooth', 0.05); break;
      case 'hint': tone(NOTE(69), t, 0.8, 'sine', 0.07); tone(NOTE(76), t + 0.12, 0.9, 'sine', 0.05); break;
      case 'page': nz(t, 0.18, 2500, 0.06, 'bandpass'); break;
      case 'scrape': nz(t, 0.06, 1200, 0.05, 'bandpass'); break;
      case 'boost': { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(60, t); o.frequency.exponentialRampToValueAtTime(420, t + 1.6); const g = ctx.createGain(); env(g, t, 0.1, 0.08, 0, 1.3, 0.4); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; o.connect(f); f.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 2); break; }
      case 'whoosh': nz(t, 0.5, 900, 0.08, 'bandpass'); break;
    }
  }

  window.Sound = {
    unlock() {
      if (!init()) return;
      const go = () => { if (wanted && !track) play(wanted); };
      if (ctx.state === 'suspended') ctx.resume().then(go); else go();
    },
    play,
    sfx,
    setVolume(kind, v) { vol[kind] = Math.max(0, Math.min(1, v)); apply(); },
    get ready() { return !!ctx && ctx.state === 'running'; }
  };
})();
