/* Графика дела №3: Зсасз, Пыг, сцены, фото для сравнения, отпечатки, досье беглецов. */
(function () {
  const A = window.Art;
  const { svg, rng, range, rainLines, marker, batShadow } = A;
  const RED = A.RED;
  const F = 'font-family="Russo One, Arial Black, sans-serif"';

  /* ---------- отпечатки пальцев ---------- */
  function fingerprint(kind, seed, col) {
    const r = rng(seed * 7 + 3);
    const tilt = (r() - 0.5) * 24;
    const brk = len => `stroke-dasharray="${(20 + r() * len).toFixed(0)} ${(3 + r() * 5).toFixed(0)} 600"`;
    let p = '';
    if (kind === 'whorl') {
      for (let k = 1; k <= 14; k++) { const rx = k * 4.4 + r() * 1.2, ry = k * 4 + r() * 1.2; p += `<ellipse cx="${(r() * 2 - 1).toFixed(1)}" cy="${(r() * 2 - 1).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" ${brk(k * 18)}/>`; }
    } else if (kind === 'arch') {
      for (let k = -10; k <= 10; k++) { const y = k * 6.2; p += `<path d="M-70 ${(y + 14).toFixed(1)} Q0 ${(y - 22 - r() * 6).toFixed(1)} 70 ${(y + 14).toFixed(1)}" ${brk(90)}/>`; }
    } else {
      for (let k = 0; k < 12; k++) {
        const a = 6 + k * 4.4 + r() * 1.5, top = -a * 1.15 - 6;
        p += `<path d="M${(-a).toFixed(1)} 70 C${(-a).toFixed(1)} ${(top).toFixed(1)} ${a.toFixed(1)} ${(top).toFixed(1)} ${a.toFixed(1)} 70" ${brk(140)}/>`;
      }
      for (let k = 0; k < 5; k++) { const y = -62 - k * 5; p += `<path d="M-72 ${y + 18} Q0 ${y - 16} 72 ${y + 18}" ${brk(80)}/>`; }
      // развилки — свои у каждого пальца
      for (let k = 0; k < 4; k++) { const x = (r() * 2 - 1) * 30, y = (r() * 2 - 1) * 30; p += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} l${(6 + r() * 6).toFixed(1)} ${(-4 - r() * 6).toFixed(1)}"/>`; }
    }
    return `<g transform="rotate(${tilt.toFixed(1)})" fill="none" stroke="${col}" stroke-width="2.1" stroke-linecap="round">${p}</g>`;
  }

  /* ---------- фото беглецов ---------- */
  function mug(id) {
    const lines = range(6).map(i => `<line x1="0" y1="${14 + i * 14}" x2="80" y2="${14 + i * 14}" stroke="#999" stroke-width=".6"/><text x="2" y="${12 + i * 14}" font-family="monospace" font-size="5" fill="#777">${190 - i * 10}</text>`).join('');
    const bust = (fill) => `<path d="M8 96 Q10 72 40 68 Q70 72 72 96Z" fill="${fill || '#111'}"/>`;
    const head = (extra) => `<ellipse cx="40" cy="44" rx="15" ry="19" fill="#fff" stroke="#000" stroke-width="1.6"/>${extra || ''}`;
    const eyes = '<path d="M32 42h5M43 42h5" stroke="#000" stroke-width="2"/>';
    const P = {
      zsasz: bust() + head('<path d="M30 36q4 -4 8 0M42 36q4 -4 8 0" stroke="#000" stroke-width="1.4" fill="none"/><ellipse cx="34" cy="42" rx="4" ry="3" fill="#333"/><ellipse cx="46" cy="42" rx="4" ry="3" fill="#333"/><circle cx="34" cy="42" r="1" fill="#fff"/><circle cx="46" cy="42" r="1" fill="#fff"/><path d="M33 54q7 4 14 0" stroke="#000" stroke-width="1.4" fill="none"/>') + '<g stroke="#fff" stroke-width="1.2">' + range(6).map(i => `<line x1="${30 + i * 4}" y1="66" x2="${30 + i * 4}" y2="72"/>`).join('') + '</g>',
      pyg: bust('#f1ecdf') + '<path d="M28 96v-28M52 96v-28" stroke="#000" stroke-width="3"/><ellipse cx="40" cy="42" rx="19" ry="21" fill="#fff" stroke="#000" stroke-width="1.6"/><path d="M24 26l-4 -10l10 6zM56 26l4 -10l-10 6z" fill="#fff" stroke="#000" stroke-width="1.4"/><ellipse cx="40" cy="50" rx="9" ry="7" fill="#fff" stroke="#000" stroke-width="1.6"/><ellipse cx="37" cy="50" rx="1.6" ry="2.4" fill="#000"/><ellipse cx="43" cy="50" rx="1.6" ry="2.4" fill="#000"/><circle cx="33" cy="38" r="2.5" fill="#000"/><circle cx="47" cy="38" r="2.5" fill="#000"/><path d="M30 35l-3 -2M50 35l3 -2" stroke="#000" stroke-width="1"/><path d="M34 59q6 3 12 0" stroke="' + RED + '" stroke-width="1.6" fill="none"/>',
      dent: bust() + head('<path d="M40 25 Q55 26 55 44 Q55 62 40 63Z" fill="#555"/><path d="M42 30l8 4M44 48l9 2M43 56l6 -2" stroke="#000" stroke-width="1"/><circle cx="34" cy="42" r="2" fill="#000"/><circle cx="47" cy="42" r="3.6" fill="#fff" stroke="#000" stroke-width="1"/><circle cx="47" cy="42" r="1.4" fill="#000"/><path d="M34 54h6M41 53l6 3" stroke="#000" stroke-width="1.4"/>'),
      freeze: bust('#333') + head(eyes + '<rect x="29" y="38" width="22" height="7" rx="3" fill="' + RED + '"/><path d="M34 54h12" stroke="#000" stroke-width="1.4"/>') + '<circle cx="40" cy="44" r="25" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3 2"/>',
      croc: bust('#333') + '<path d="M20 50 Q22 22 40 22 Q58 22 60 50 Q58 66 40 66 Q22 66 20 50Z" fill="#333" stroke="#fff" stroke-width="1.6"/><g stroke="#888" stroke-width=".8" fill="none">' + range(5).map(i => `<path d="M${24 + i * 7} ${30 + (i % 2) * 4}l4 4l4 -4"/>`).join('') + '</g><circle cx="33" cy="40" r="2.2" fill="#ffd400"/><circle cx="47" cy="40" r="2.2" fill="#ffd400"/><path d="M26 56 Q40 62 54 56" stroke="#fff" stroke-width="1.6" fill="none"/><path d="M30 57l2 3l2 -3l2 3l2 -3l2 3l2 -3l2 3l2 -3l2 3" stroke="#fff" stroke-width="1" fill="none"/>',
      crane: bust('#5a4a2a') + '<path d="M24 46 Q22 22 40 22 Q58 22 56 46 Q56 64 40 66 Q24 64 24 46Z" fill="#c8b88a" stroke="#000" stroke-width="1.6"/><path d="M26 64 Q40 70 54 64" stroke="#000" stroke-width="2.5"/><circle cx="33" cy="42" r="3.4" fill="#000"/><circle cx="47" cy="42" r="3.4" fill="#000"/><path d="M32 54h16" stroke="#000" stroke-width="1.4"/><path d="M33 51v6M37 51v6M41 51v6M45 51v6" stroke="#000" stroke-width="1"/>',
      day: bust() + head(eyes + '<path d="M34 54q6 3 12 0" stroke="#000" stroke-width="1.3" fill="none"/>') + '<g stroke="#000" stroke-width=".7">' + range(4).map(i => `<line x1="${28 + i * 8}" y1="26" x2="${28 + i * 8}" y2="36"/>`).join('') + '<line x1="26" y1="30" x2="54" y2="30"/><line x1="26" y1="35" x2="54" y2="35"/></g>',
      ivy: '<path d="M18 96 Q12 50 26 30 Q40 16 54 30 Q68 50 62 96Z" fill="' + RED + '"/>' + bust('#1f5a32') + head(eyes + '<path d="M35 54q5 3 10 0" stroke="' + RED + '" stroke-width="1.8" fill="none"/>') + '<path d="M26 32 Q40 20 54 32 Q48 26 40 27 Q32 26 26 32Z" fill="' + RED + '"/><path d="M60 70q6 -4 8 2q-6 2 -8 -2zM16 74q-6 -4 -8 2q6 2 8 -2z" fill="#5fe08a"/>'
    };
    return `<svg viewBox="0 0 80 96"><rect width="80" height="96" fill="#d9d4c4"/>${lines}${P[id] || bust() + head(eyes)}</svg>`;
  }

  /* ---------- засечки на скамье ---------- */
  function tallyCard() {
    const r = rng(43);
    let m = '';
    for (let g = 0; g < 8; g++) {
      const x0 = 24 + g * 58, y0 = 30 + (g % 2) * 6;
      for (let k = 0; k < 4; k++) { const x = x0 + k * 9 + (r() - 0.5) * 2; m += `<line x1="${x}" y1="${y0 + (r() - 0.5) * 3}" x2="${x + (r() - 0.5) * 4}" y2="${y0 + 52 + (r() - 0.5) * 4}"/>`; }
      m += `<line x1="${x0 - 6}" y1="${y0 + 40}" x2="${x0 + 34}" y2="${y0 + 10}"/>`;
    }
    for (let k = 0; k < 3; k++) m += `<line x1="${490 + k * 9}" y1="${92 + (r() - 0.5) * 3}" x2="${490 + k * 9 + (r() - 0.5) * 4}" y2="${140}"/>`;
    return `<svg viewBox="0 0 540 160"><rect width="540" height="160" fill="#2a2116"/>${range(4).map(i => `<path d="M0 ${20 + i * 38}q270 ${(i % 2 ? 6 : -6)} 540 0" stroke="#3b3020" stroke-width="2" fill="none"/>`).join('')}<g stroke="#f1ecdf" stroke-width="2.6" stroke-linecap="round">${m}</g></svg>`;
  }

  /* ---------- фото витрины: до и после ---------- */
  function vitrineShot(after) {
    const dress = (x, extra) => `<g><path d="M${x - 16} 186 L${x - 10} 96 Q${x} 86 ${x + 10} 96 L${x + 16} 186Z" fill="#fff" stroke="#000" stroke-width="1.5"/><circle cx="${x}" cy="72" r="13" fill="#fff" stroke="#000" stroke-width="1.5"/><path d="M${x} 186v10M${x - 12} 198h24" stroke="#fff" stroke-width="3"/>${extra || ''}</g>`;
    const curtain = range(14).map(i => `<line x1="${24 + i * 26}" y1="18" x2="${24 + i * 26}" y2="182" stroke="#444" stroke-width="2"/>`).join('');
    let h = `<rect width="400" height="260" fill="#0b0b0b"/><rect x="14" y="12" width="372" height="236" fill="#1a1a1a" stroke="#fff" stroke-width="3"/>${curtain}
      <path d="M14 182h372v20h-372z" fill="#fff"/><path d="M60 12l40 170h-80zM200 12l40 170h-80zM330 12l40 170h-80z" fill="#fff" opacity=".07"/>`;
    h += dress(62, `<path d="M44 64h36l-6 -10h-24z" fill="#000" stroke="#fff" stroke-width="1.2"/>`);
    if (after) {
      h += `<g><path d="M110 186 L116 96 Q130 86 144 96 L150 186Z" fill="#000" stroke="#fff" stroke-width="2"/><path d="M116 100 L98 54M144 100 L162 54" stroke="#000" stroke-width="8" stroke-linecap="round"/><path d="M116 100 L98 54M144 100 L162 54" stroke="#fff" stroke-width="1.4"/><path d="M98 54V12M162 54V12" stroke="#fff" stroke-width="1"/>
        <circle cx="130" cy="64" r="13" fill="#fff" stroke="#000" stroke-width="1.5"/><circle cx="124" cy="68" r="3" fill="${RED}" opacity=".7"/><circle cx="136" cy="68" r="3" fill="${RED}" opacity=".7"/><path d="M123 61h4M133 61h4M122 59l-1 -2M138 59l1 -2" stroke="#000" stroke-width="1.2"/><path d="M127 72q3 2 6 0" stroke="${RED}" stroke-width="1.5" fill="none"/>
        <path d="M118 54h24v-6h-24z" fill="#000" stroke="#fff" stroke-width="1"/><path d="M122 110h16" stroke="#fff" stroke-width="1"/><rect x="124" y="114" width="12" height="6" fill="#fff"/></g>`;
      h += `<g><path d="M206 186v10M194 198h24" stroke="#fff" stroke-width="3"/><path d="M196 194h20" stroke="#fff" stroke-width="2" stroke-dasharray="3 3"/><text x="206" y="150" ${F} font-size="20" text-anchor="middle" fill="#555">?</text></g>`;
      h += `<path d="M330 30 l14 14 l-12 12 l16 16 l-14 14 l16 18 l-12 14" stroke="#000" stroke-width="7" fill="none"/>`;
      h += `<g stroke="#fff" stroke-width="1.6">${range(5).map(i => `<line x1="${334 + i * 5}" y1="186" x2="${334 + i * 5}" y2="206"/>`).join('')}<line x1="330" y1="202" x2="358" y2="190"/></g>`;
    } else {
      h += dress(130, `<path d="M118 100l12 14l12 -14" fill="#000"/><rect x="127" y="100" width="6" height="22" fill="#000"/>`);
      h += dress(206, `<path d="M190 66 Q206 50 222 66 L230 150 Q206 140 182 150Z" fill="#fff" opacity=".55" stroke="#000" stroke-width="1"/>`);
    }
    h += dress(290, `<path d="M276 62h28l-4 -8h-20z" fill="#000"/><path d="M272 110l18 70l18 -70" fill="none" stroke="#000" stroke-width="1.5"/>`);
    h += `<path d="M20 40l30 -24M300 230l60 -50" stroke="#fff" stroke-width="1" opacity=".35"/><text x="378" y="242" font-family="monospace" font-size="10" text-anchor="end" fill="#ffd400">${after ? '07:40' : '21:00'}</text>`;
    return svg(h, '0 0 400 260');
  }

  /* ---------- прожектор: до и после ---------- */
  function signalShot(after) {
    let h = `<rect width="400" height="260" fill="#0b0b0b"/>`;
    h += after ? '' : `<path d="M20 20h360v220h-360z" fill="none" stroke="#2a4a8a" stroke-width="1"/>${range(9).map(i => `<line x1="${20 + i * 45}" y1="20" x2="${20 + i * 45}" y2="240" stroke="#1a2a4a" stroke-width="1"/>`).join('')}`;
    h += `<path d="M150 236h100l-14 -40h-72z" fill="#000" stroke="#fff" stroke-width="3"/><path d="M200 196v-20" stroke="#fff" stroke-width="8"/>
      <path d="M108 112 Q108 186 200 190 Q292 186 292 112" fill="none" stroke="#fff" stroke-width="7"/>
      <circle cx="200" cy="112" r="84" fill="#000" stroke="#fff" stroke-width="5"/><circle cx="200" cy="112" r="72" fill="#fff4c8"/>
      <path d="M200 112m-70 0a70 70 0 0 1 140 0" fill="none" stroke="#fff" stroke-width="1" opacity=".6"/>
      ${batShadow(150, 84, 0.25, '#000')}
      <circle cx="108" cy="112" r="8" fill="#fff"/><circle cx="292" cy="112" r="8" fill="#fff"/>`;
    if (after) {
      h += `<ellipse cx="200" cy="112" rx="26" ry="20" fill="#f6c9cf" stroke="#000" stroke-width="2.5"/><ellipse cx="191" cy="112" rx="4" ry="7" fill="#000"/><ellipse cx="209" cy="112" rx="4" ry="7" fill="#000"/>`;
      h += `<g stroke="#000" stroke-width="2">${range(5).map(i => `<line x1="${142 + i * 5}" y1="58" x2="${142 + i * 5}" y2="80"/>`).join('')}<line x1="138" y1="76" x2="168" y2="62"/></g>`;
      h += `<g transform="rotate(30 300 150)"><rect x="296" y="122" width="8" height="34" fill="#fff"/><rect x="295" y="150" width="10" height="22" fill="#000" stroke="#fff" stroke-width="1.5"/></g>`;
      h += `<path d="M60 236 Q74 214 94 214M104 214 Q118 214 130 230" stroke="#fff" stroke-width="5" fill="none"/><path d="M94 210l10 8" stroke="${RED}" stroke-width="3"/>`;
      h += `<g transform="translate(248 226)"><path d="M-22 0 Q-20 -18 0 -18 Q8 -18 6 -6 L14 -12 L22 2 Q10 10 -22 0Z" fill="#fff" stroke="#000" stroke-width="1.5"/><circle cx="-8" cy="-8" r="2.4" fill="${RED}"/><path d="M-4 -12l-3 -3M-12 -12l-1 -4" stroke="#000" stroke-width="1"/></g>`;
    } else {
      h += `<path d="M60 236 Q80 214 130 230" stroke="#fff" stroke-width="5" fill="none"/>`;
      h += `<text x="370" y="34" font-family="monospace" font-size="10" text-anchor="end" fill="#6f86c7">ЧЕРТЁЖ · G.C.P.D.</text>`;
    }
    return svg(h, '0 0 400 260');
  }

  /* ---------- персонажи ---------- */
  // Виктор Зсасз: лысый, бледный, руки в шрамах-засечках, нож
  function zsaszFig(x, y, k, opts) {
    opts = opts || {};
    const scars = (x0, y0, n, len, rot) => `<g transform="rotate(${rot} ${x0} ${y0})" stroke="#000" stroke-width="1.6">${range(n).map(i => `<line x1="${x0 + i * 5}" y1="${y0}" x2="${x0 + i * 5}" y2="${y0 + len}"/>`).join('')}${range(Math.floor(n / 5)).map(g => `<line x1="${x0 + g * 25 - 3}" y1="${y0 + len - 2}" x2="${x0 + g * 25 + 22}" y2="${y0 + 2}"/>`).join('')}</g>`;
    return `<g transform="translate(${x} ${y}) scale(${k})">
      <path d="M-80 200 Q-76 96 -30 82 L30 82 Q76 96 80 200Z" fill="#000" stroke="#fff" stroke-width="3"/>
      <path d="M-30 82 Q0 104 30 82" fill="#f4f1ea" stroke="#000" stroke-width="2"/>
      <!-- руки -->
      <path d="M-62 110 Q-96 150 -88 200" stroke="#000" stroke-width="30" fill="none" stroke-linecap="round"/><path d="M-62 110 Q-96 150 -88 200" stroke="#f4f1ea" stroke-width="24" fill="none" stroke-linecap="round"/>
      <path d="M62 110 Q110 92 128 40" stroke="#000" stroke-width="30" fill="none" stroke-linecap="round"/><path d="M62 110 Q110 92 128 40" stroke="#f4f1ea" stroke-width="24" fill="none" stroke-linecap="round"/>
      ${scars(-92, 140, 10, 12, -60)}${scars(80, 80, 10, 12, -64)}
      <ellipse cx="130" cy="34" rx="13" ry="11" fill="#f4f1ea" stroke="#000" stroke-width="2"/>
      <g transform="rotate(-18 132 30)"><rect x="128" y="-34" width="8" height="58" fill="#fff" stroke="#000" stroke-width="1.5"/><path d="M128 -34l4 -10l4 10" fill="#fff" stroke="#000" stroke-width="1.5"/><rect x="125" y="22" width="14" height="22" fill="#000" stroke="#fff" stroke-width="1.5"/>${range(5).map(i => `<path d="M136 ${-28 + i * 9}l3 3l-3 3" fill="none" stroke="#000" stroke-width="1"/>`).join('')}</g>
      <!-- голова -->
      <path d="M-14 60 h28 v26 h-28z" fill="#f4f1ea" stroke="#000" stroke-width="2"/>${scars(-10, 66, 5, 10, 0)}
      <ellipse cx="-44" cy="6" rx="8" ry="13" fill="#f4f1ea" stroke="#000" stroke-width="2"/><ellipse cx="44" cy="6" rx="8" ry="13" fill="#f4f1ea" stroke="#000" stroke-width="2"/>
      <path d="M-42 -6 Q-44 -62 0 -64 Q44 -62 42 -6 Q42 44 18 62 Q0 72 -18 62 Q-42 44 -42 -6Z" fill="#f4f1ea" stroke="#000" stroke-width="3"/>
      <path d="M8 -63 Q44 -60 42 -6 Q42 44 18 62 Q12 66 6 68 Q30 30 26 -20 Q22 -50 8 -63Z" fill="url(#htk)" opacity=".5"/>
      <path d="M-34 -46 Q-20 -60 0 -60" stroke="#fff" stroke-width="3" fill="none" opacity=".9"/>
      <ellipse cx="-17" cy="0" rx="13" ry="10" fill="#333"/><ellipse cx="17" cy="0" rx="13" ry="10" fill="#333"/>
      <ellipse cx="-17" cy="1" rx="6" ry="4.5" fill="#fff"/><ellipse cx="17" cy="1" rx="6" ry="4.5" fill="#fff"/><circle cx="-16" cy="1" r="2" fill="#000"/><circle cx="18" cy="1" r="2" fill="#000"/>
      <path d="M-30 -16 Q-18 -22 -6 -14M6 -14 Q18 -22 30 -16" stroke="#000" stroke-width="2.4" fill="none"/>
      <path d="M2 4 L-4 26 Q2 30 8 26" stroke="#000" stroke-width="2.2" fill="none"/>
      <path d="M-30 22 q-2 18 8 30M30 22 q2 18 -8 30" stroke="#000" stroke-width="1.6" fill="none"/>
      <path d="M-20 40 Q0 50 22 38" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M22 38l5 -4" stroke="#000" stroke-width="2"/>
      ${opts.noShirtMarks ? '' : ''}
    </g>`;
  }

  // Профессор Пыг: великан в фартуке мясника и свиной маске из папье-маше
  function pygFig(x, y, k) {
    return `<g transform="translate(${x} ${y}) scale(${k})">
      <path d="M-120 230 Q-118 100 -50 82 L50 82 Q118 100 120 230Z" fill="#000" stroke="#fff" stroke-width="3"/>
      <path d="M-52 96 L-70 230 L70 230 L52 96 Q0 84 -52 96Z" fill="#f1ecdf" stroke="#000" stroke-width="2.5"/>
      <path d="M-40 92 L-60 60M40 92 L60 60" stroke="#f1ecdf" stroke-width="7"/>
      <g fill="${RED}" opacity=".75"><ellipse cx="-20" cy="150" rx="12" ry="7"/><ellipse cx="26" cy="182" rx="8" ry="12"/><circle cx="6" cy="128" r="4"/><path d="M-30 200q6 14 0 26q-4 -12 0 -26z"/></g>
      <path d="M-46 110 L46 110" stroke="#000" stroke-width="1" opacity=".4"/>
      <path d="M-14 82 L0 98 L14 82" fill="#fff" stroke="#000" stroke-width="2"/><path d="M0 92 L-22 80 L-22 104Z M0 92 L22 80 L22 104Z" fill="#000" stroke="#fff" stroke-width="1.5"/>
      <!-- руки в перчатках -->
      <path d="M-100 120 Q-130 170 -110 214" stroke="#000" stroke-width="40" fill="none" stroke-linecap="round"/><path d="M-100 120 Q-130 170 -110 214" stroke="#fff" stroke-width="2" fill="none"/>
      <path d="M100 120 Q140 112 150 64" stroke="#000" stroke-width="40" fill="none" stroke-linecap="round"/><path d="M100 120 Q140 112 150 64" stroke="#fff" stroke-width="2" fill="none"/>
      <ellipse cx="-110" cy="220" rx="18" ry="15" fill="#222" stroke="#fff" stroke-width="2"/><ellipse cx="152" cy="56" rx="18" ry="15" fill="#222" stroke="#fff" stroke-width="2"/>
      <path d="M160 46 L196 -16" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <!-- маска свиньи -->
      <path d="M-58 -50 L-74 -96 L-30 -70Z M58 -50 L74 -96 L30 -70Z" fill="#f6c9cf" stroke="#000" stroke-width="3"/>
      <path d="M-62 -10 Q-66 -84 0 -86 Q66 -84 62 -10 Q60 66 0 72 Q-60 66 -62 -10Z" fill="#f6c9cf" stroke="#000" stroke-width="3"/>
      <path d="M10 -85 Q66 -84 62 -10 Q60 66 0 72 Q40 30 36 -20 Q32 -64 10 -85Z" fill="url(#htk)" opacity=".4"/>
      <g stroke="#000" stroke-width="1" opacity=".35" fill="none"><path d="M-50 -40q10 4 20 0M30 -46q10 -4 20 2M-40 40q8 6 18 2"/></g>
      <ellipse cx="0" cy="18" rx="30" ry="22" fill="#f6c9cf" stroke="#000" stroke-width="3"/><ellipse cx="0" cy="14" rx="26" ry="16" fill="#fbdde1" stroke="#000" stroke-width="1"/>
      <ellipse cx="-10" cy="16" rx="5" ry="9" fill="#000"/><ellipse cx="10" cy="16" rx="5" ry="9" fill="#000"/>
      <circle cx="-26" cy="-24" r="8" fill="#000"/><circle cx="26" cy="-24" r="8" fill="#000"/><circle cx="-24" cy="-26" r="2.4" fill="#fff"/><circle cx="28" cy="-26" r="2.4" fill="#fff"/>
      <path d="M-36 -32l-6 -6M-30 -34l-3 -8M36 -32l6 -6M30 -34l3 -8" stroke="#000" stroke-width="2"/>
      <path d="M-24 50 Q0 62 24 50" stroke="${RED}" stroke-width="3" fill="none"/><g stroke="#000" stroke-width="1.4">${range(7).map(i => `<line x1="${-21 + i * 7}" y1="${52 + Math.abs(i - 3) * -1.5}" x2="${-21 + i * 7}" y2="${58 + Math.abs(i - 3) * -1.5}"/>`).join('')}</g>
      <path d="M-62 -10 Q-70 20 -56 40" stroke="#000" stroke-width="2" fill="none" stroke-dasharray="4 3"/>
    </g>`;
  }

  /* ---------- сцены ---------- */
  function c3s1() {
    const form = (x, extra) => `<g><path d="M${x - 28} 296 L${x - 18} 150 Q${x} 132 ${x + 18} 150 L${x + 28} 296Z" fill="#fff" stroke="#000" stroke-width="2"/><circle cx="${x}" cy="118" r="21" fill="#fff" stroke="#000" stroke-width="2"/><path d="M${x} 296v14M${x - 20} 312h40" stroke="#fff" stroke-width="5"/>${extra || ''}</g>`;
    return svg(`
    <rect width="800" height="500" fill="#000"/>
    <rect width="800" height="360" fill="url(#hatch)" opacity=".12"/>
    <g stroke="#333" stroke-width="2">${range(9).map(i => `<line x1="0" y1="${i * 42}" x2="150" y2="${i * 42}"/><line x1="650" y1="${i * 42}" x2="800" y2="${i * 42}"/>`).join('')}</g>
    <text x="400" y="34" ${F} font-size="30" text-anchor="middle" fill="#fff" letter-spacing="10">ВАНИТИ</text>
    <!-- витрина -->
    <rect x="150" y="44" width="500" height="316" fill="#141414" stroke="#fff" stroke-width="7"/>
    <g>${range(19).map(i => `<path d="M${164 + i * 25} 52 Q${170 + i * 25} 170 ${162 + i * 25} 296" stroke="${i % 2 ? '#2a2a2a' : '#3a3a3a'}" stroke-width="13" fill="none"/>`).join('')}</g>
    <path d="M572 80 l18 16 l-14 14 l20 20 l-16 18 l20 22 l-14 18" stroke="#000" stroke-width="12" fill="none"/>
    <path d="M230 44l70 252h-150zM400 44l70 252h-150zM560 44l60 252h-130z" fill="#fff" opacity=".07"/>
    <rect x="156" y="296" width="488" height="56" fill="#000" stroke="#fff" stroke-width="3"/><rect x="156" y="296" width="488" height="56" fill="url(#hatch)" opacity=".2"/>
    ${form(222, `<path d="M196 110h52l-10 -16h-32z" fill="#000" stroke="#fff" stroke-width="2"/><path d="M200 180 Q222 196 244 180" stroke="#000" stroke-width="2" fill="none"/>`)}
    <!-- охранник в позе жениха -->
    <g>
      <path d="M300 300 L310 160 Q328 144 346 160 L356 300Z" fill="#000" stroke="#fff" stroke-width="3"/>
      <path d="M314 170 L288 104M342 170 L368 104" stroke="#000" stroke-width="18" stroke-linecap="round"/><path d="M314 170 L288 104M342 170 L368 104" stroke="#fff" stroke-width="2" fill="none"/>
      <path d="M288 100V48M368 100V48" stroke="#fff" stroke-width="1.5"/>
      <ellipse cx="288" cy="100" rx="8" ry="7" fill="#fff" stroke="#000" stroke-width="1.5"/><ellipse cx="368" cy="100" rx="8" ry="7" fill="#fff" stroke="#000" stroke-width="1.5"/>
      <path d="M284 108l8 -2M364 108l8 -2" stroke="${RED}" stroke-width="1.5"/>
      <path d="M318 180h20v8h-20z" fill="#fff"/><rect x="322" y="196" width="12" height="7" fill="#fff"/><path d="M328 300v-90" stroke="#fff" stroke-width="1" opacity=".5"/>
      <circle cx="328" cy="128" r="20" fill="#fff" stroke="#000" stroke-width="2"/>
      <circle cx="319" cy="134" r="4.5" fill="${RED}" opacity=".7"/><circle cx="337" cy="134" r="4.5" fill="${RED}" opacity=".7"/>
      <path d="M318 124h6M332 124h6M317 121l-2 -3M321 120l-1 -3M339 121l2 -3M335 120l1 -3" stroke="#000" stroke-width="1.6"/>
      <path d="M323 140q5 3 10 0" stroke="${RED}" stroke-width="2" fill="none"/>
      <path d="M310 110h36v-10h-36z" fill="#000" stroke="#fff" stroke-width="1.5"/><path d="M306 112h44" stroke="#fff" stroke-width="2"/>
      <path d="M318 300v14M338 300v14" stroke="#fff" stroke-width="4"/>
    </g>
    <!-- пустой подиум невесты -->
    <path d="M430 296v14M410 312h40" stroke="#fff" stroke-width="5"/><g transform="rotate(-14 432 290)"><rect x="412" y="282" width="44" height="14" fill="#fff"/><text x="434" y="293" ${F} font-size="8" text-anchor="middle" fill="#000">НЕВЕСТА</text></g>
    ${form(540, `<path d="M512 108h56l-8 -14h-40z" fill="#000" stroke="#fff" stroke-width="2"/><path d="M516 170l24 120l24 -120" fill="none" stroke="#000" stroke-width="2"/>`)}
    <!-- пластинка и латекс -->
    <ellipse cx="478" cy="334" rx="22" ry="7" fill="#000" stroke="#fff" stroke-width="2"/><ellipse cx="478" cy="334" rx="6" ry="2" fill="${RED}"/>
    <path d="M386 336q8 -8 16 -2q8 6 16 -2l-4 12q-14 6 -28 -2z" fill="#f1ecdf" stroke="#000" stroke-width="1"/><path d="M394 334l2 -3M398 333l1 -3M402 334l1 -3" stroke="#000" stroke-width="1"/>
    <!-- надпись изнутри (с улицы — задом наперёд) -->
    <g transform="translate(980 0) scale(-1 1)" fill="${RED}" ${F} font-size="13" letter-spacing="1">
      <text x="368" y="66">ЛЕТУЧАЯ МЫШЬ.</text><text x="368" y="82">ЗАСЕЧКА ЗА ЗАСЕЧКОЙ.</text><text x="368" y="98">ЕЩЁ ТРИ — И ТЫ САМ…</text></g>
    <!-- засечки на стекле -->
    <g stroke="#fff" stroke-width="2.4">${range(5).map(i => `<line x1="${566 + i * 8}" y1="252" x2="${568 + i * 8}" y2="288"/>`).join('')}<line x1="560" y1="282" x2="604" y2="256"/><line x1="616" y1="252" x2="617" y2="288"/><line x1="624" y1="252" x2="625" y2="288"/></g>
    <g stroke="#fff" stroke-width="1.2" opacity=".35"><line x1="160" y1="340" x2="260" y2="60"/><line x1="180" y1="352" x2="290" y2="52"/><line x1="560" y1="350" x2="640" y2="130"/></g>
    <!-- улица -->
    <rect y="360" width="800" height="140" fill="#0a0a0a"/><line x1="0" y1="362" x2="800" y2="362" stroke="#fff" stroke-width="3"/>
    <g fill="#fff" opacity=".12"><ellipse cx="300" cy="440" rx="120" ry="10"/><ellipse cx="560" cy="470" rx="90" ry="8"/></g>
    <!-- афиша с фото -->
    <path d="M28 330 L50 140 h62 l22 190" fill="#000" stroke="#fff" stroke-width="4"/>
    <rect x="44" y="160" width="76" height="110" fill="#fff"/><rect x="50" y="166" width="64" height="62" fill="#1a1a1a"/>
    <g fill="#fff"><circle cx="64" cy="186" r="5"/><path d="M58 224l3 -30h6l3 30z"/><circle cx="84" cy="186" r="5"/><path d="M78 224l3 -30h6l3 30z"/><circle cx="102" cy="186" r="5"/><path d="M96 224l3 -30h6l3 30z"/></g>
    <text x="82" y="246" ${F} font-size="8" text-anchor="middle" fill="#000">СВАДЕБНЫЙ</text><text x="82" y="258" ${F} font-size="8" text-anchor="middle" fill="#000">СЕЗОН</text>
    <!-- урна -->
    <path d="M692 340h70l-8 100h-54z" fill="#000" stroke="#fff" stroke-width="4"/><path d="M686 332h82v10h-82z" fill="#fff"/>
    <g stroke="#fff" stroke-width="1.5">${range(4).map(i => `<line x1="${704 + i * 14}" y1="350" x2="${706 + i * 13}" y2="432"/>`).join('')}</g>
    <g transform="rotate(12 744 390)"><rect x="730" y="378" width="30" height="20" fill="#fff" stroke="${RED}" stroke-width="2"/><text x="745" y="392" ${F} font-size="9" text-anchor="middle" fill="${RED}">№3</text></g>
    <!-- лента -->
    <g transform="rotate(-6 400 470)"><rect x="-20" y="456" width="840" height="20" fill="#fff"/>${range(7).map(i => `<text x="${20 + i * 120}" y="471" ${F} font-size="11" fill="#000">НЕ ПЕРЕСЕКАТЬ</text>`).join('')}</g>
    `);
  }

  function c3s2() {
    const fig = (x, head, body, extra) => `<g><path d="M${x - 34} 300h68v40h-68z" fill="#000" stroke="#fff" stroke-width="3"/><path d="M${x - 40} 300h80" stroke="#fff" stroke-width="3"/>${body}${head}${extra || ''}</g>`;
    return svg(`
    <rect width="800" height="500" fill="#000"/>
    <rect width="800" height="340" fill="url(#ht)" opacity=".08"/>
    <rect x="250" y="16" width="300" height="40" fill="#000" stroke="#fff" stroke-width="3"/><text x="400" y="44" ${F} font-size="20" text-anchor="middle" fill="#fff" letter-spacing="3">ВЕЛИКИЕ ЗЛОДЕИ</text>
    ${[120, 260, 400, 540, 680].map(x => `<path d="M${x} 60 l-60 240 h120z" fill="#fff" opacity=".07"/><path d="M${x - 8} 56h16v10h-16z" fill="#fff"/>`).join('')}
    <line x1="0" y1="340" x2="800" y2="340" stroke="#fff" stroke-width="3"/>
    <!-- Наполеон -->
    ${fig(120, `<circle cx="120" cy="148" r="18" fill="#e9e2cf" stroke="#000" stroke-width="2"/><path d="M92 136 Q120 108 148 136 Q120 128 92 136Z" fill="#000" stroke="#fff" stroke-width="2"/>`, `<path d="M96 300 L100 170 Q120 158 140 170 L144 300Z" fill="#000" stroke="#fff" stroke-width="2.5"/><path d="M110 180 L120 200 L130 180" fill="#e9e2cf"/><path d="M112 220h16" stroke="#fff" stroke-width="2"/>`)}
    <!-- Палач -->
    ${fig(260, `<path d="M240 168 Q240 124 260 124 Q280 124 280 168Z" fill="#000" stroke="#fff" stroke-width="2"/><path d="M252 148h6M262 148h6" stroke="#fff" stroke-width="2"/>`, `<path d="M234 300 L240 166 Q260 158 280 166 L286 300Z" fill="#000" stroke="#fff" stroke-width="2.5"/><path d="M284 210l30 -60" stroke="#fff" stroke-width="4"/><path d="M304 140l24 8l-8 22z" fill="#fff"/>`)}
    <!-- экскурсовод -->
    ${fig(400, `<circle cx="400" cy="150" r="19" fill="#fff" stroke="#000" stroke-width="2"/><path d="M381 146 Q384 128 400 128 Q418 128 419 146 Q410 136 400 138 Q390 136 381 146Z" fill="#000"/><path d="M392 152h5M404 152h5" stroke="#000" stroke-width="2"/><path d="M394 162q6 2 12 0" stroke="#000" stroke-width="1.6" fill="none"/>`,
      `<path d="M376 300 L380 172 Q400 160 420 172 L424 300Z" fill="#000" stroke="#fff" stroke-width="2.5"/><path d="M392 172 L400 196 L408 172" fill="#fff"/><path d="M420 180 Q446 196 440 224" stroke="#000" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M420 180 Q446 196 440 224" stroke="#fff" stroke-width="1.5" fill="none"/>
       <path d="M434 226h14v20h-14z" fill="#000" stroke="#fff" stroke-width="2"/><rect x="437" y="230" width="8" height="12" fill="#ffd400" opacity=".8"/><path d="M441 220v6" stroke="#fff" stroke-width="2"/>`,
      `<g transform="rotate(-6 404 218)"><rect x="386" y="204" width="34" height="26" fill="#fff" stroke="#000" stroke-width="1.5"/><path d="M390 212h26M390 218h20M390 224h24" stroke="#000" stroke-width="1"/><circle cx="414" cy="208" r="2" fill="${RED}"/></g>`)}
    <!-- Мадам Баттерфляй без лица -->
    ${fig(540, `<circle cx="540" cy="148" r="18" fill="#000" stroke="#fff" stroke-width="2" stroke-dasharray="4 3"/><path d="M520 136 Q540 112 560 136 Q560 120 540 118 Q520 120 520 136Z" fill="#000" stroke="#fff" stroke-width="2"/><path d="M528 122l-6 -10M552 122l6 -10" stroke="#fff" stroke-width="2"/><circle cx="522" cy="112" r="3" fill="${RED}"/>`,
      `<path d="M510 300 L520 168 Q540 158 560 168 L570 300Z" fill="#fff" stroke="#000" stroke-width="2"/><path d="M520 220h40v14h-40z" fill="${RED}"/><path d="M516 250 Q540 262 564 250" stroke="#000" stroke-width="1.5" fill="none"/>`)}
    <!-- Рыцарь -->
    ${fig(680, `<path d="M664 166 Q662 128 680 126 Q698 128 696 166Z" fill="#000" stroke="#fff" stroke-width="2.5"/><path d="M668 146h24" stroke="#fff" stroke-width="3"/>`, `<path d="M654 300 L660 168 Q680 160 700 168 L706 300Z" fill="#000" stroke="#fff" stroke-width="2.5"/><path d="M704 180v110" stroke="#fff" stroke-width="5"/><path d="M696 190h16" stroke="#fff" stroke-width="4"/>`)}
    <!-- бархатные ограждения -->
    ${[60, 200, 330, 470, 610, 750].map(x => `<path d="M${x} 380v-34" stroke="#fff" stroke-width="5"/><circle cx="${x}" cy="344" r="6" fill="#fff"/>`).join('')}
    <path d="M60 352 Q130 372 200 352 Q265 372 330 352 Q400 372 470 352 Q540 372 610 352 Q680 372 750 352" stroke="${RED}" stroke-width="5" fill="none"/>
    <!-- стойка кассы с автоответчиком -->
    <path d="M10 330h110v100h-110z" fill="#000" stroke="#fff" stroke-width="3"/><path d="M4 322h122v10h-122z" fill="#fff"/>
    <rect x="30" y="306" width="54" height="18" fill="#000" stroke="#fff" stroke-width="2"/><circle cx="44" cy="315" r="5" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="62" cy="315" r="5" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="78" cy="312" r="2.5" fill="${RED}"/>
    <!-- пол: следы -->
    <g fill="#fff" opacity=".85">${[[90, 420], [140, 412], [190, 420], [240, 412], [290, 420], [340, 412]].map(p => `<ellipse cx="${p[0]}" cy="${p[1]}" rx="9" ry="4"/>`).join('')}</g>
    <g fill="#fff">${[[470, 380], [478, 404], [470, 428], [478, 452], [470, 476]].map(p => `<rect x="${p[0] - 6}" y="${p[1] - 9}" width="12" height="18" rx="4" transform="rotate(4 ${p[0]} ${p[1]})"/>`).join('')}</g>
    <g fill="#fff" stroke="#000" stroke-width="1"><rect x="556" y="360" width="16" height="24" rx="5" transform="rotate(-8 564 372)"/><rect x="580" y="368" width="16" height="24" rx="5" transform="rotate(6 588 380)"/></g>
    <!-- газета, номерок -->
    <g transform="rotate(-8 240 450)"><rect x="196" y="430" width="92" height="44" fill="#f1ecdf" stroke="#000" stroke-width="1.5"/><path d="M202 440h50M202 448h76M202 456h70M202 464h60" stroke="#000" stroke-width="1.5"/><text x="248" y="441" ${F} font-size="8" fill="#000">GAZETTE</text></g>
    ${marker(456, 368, 4)}
    `);
  }

  function c3s3() {
    return svg(`
    <rect width="800" height="500" fill="#000"/>
    <g stroke="#262626" stroke-width="2">${range(14).map(i => `<line x1="0" y1="${i * 22}" x2="640" y2="${i * 22}"/>`).join('')}${range(26).map(i => `<line x1="${i * 26}" y1="0" x2="${i * 26}" y2="300"/>`).join('')}</g>
    <rect x="0" y="0" width="640" height="300" fill="url(#ht)" opacity=".06"/>
    <path d="M0 150h640" stroke="${RED}" stroke-width="8"/>
    <rect x="250" y="40" width="240" height="44" fill="#fff" stroke="#000" stroke-width="3"/><text x="370" y="70" ${F} font-size="20" text-anchor="middle" fill="#000">РОБИНСОН-ПАРК</text>
    <!-- тоннель -->
    <path d="M640 300V120 Q720 40 800 120V300Z" fill="#000" stroke="#fff" stroke-width="5"/><path d="M660 300V130 Q720 70 790 130" stroke="#fff" stroke-width="1.5" fill="none" opacity=".4"/>
    <circle cx="690" cy="180" r="5" fill="${RED}"/>
    <!-- разбитые часы -->
    <path d="M120 0v40" stroke="#fff" stroke-width="3"/>${A.wallClock(120, 72, 32, 12, 33)}<path d="M100 56l20 18l-8 14l18 6" stroke="#000" stroke-width="2.5" fill="none"/><path d="M100 56l20 18l-8 14l18 6" stroke="#fff" stroke-width="1" fill="none"/>
    <!-- платформа -->
    <rect x="0" y="300" width="800" height="130" fill="#0d0d0d"/><line x1="0" y1="300" x2="800" y2="300" stroke="#fff" stroke-width="3"/>
    <path d="M0 424h800" stroke="#fff" stroke-width="5"/><path d="M0 416h800" stroke="#fff" stroke-width="3" stroke-dasharray="20 12"/>
    <!-- рельсы -->
    <rect y="430" width="800" height="70" fill="#050505"/>${range(20).map(i => `<rect x="${i * 44}" y="452" width="26" height="40" fill="#1a1a1a"/>`).join('')}<path d="M0 462h800M0 486h800" stroke="#fff" stroke-width="4"/>
    <!-- скамья с машинисткой -->
    <path d="M170 300v-46h200v46" fill="#000" stroke="#fff" stroke-width="4"/><path d="M160 338h220v10h-220z" fill="#fff"/><path d="M176 348v34M364 348v34" stroke="#fff" stroke-width="6"/>
    <g stroke="#fff" stroke-width="1.6">${range(4).map(g => range(5).map(i => i < 4 ? `<line x1="${186 + g * 20 + i * 3}" y1="264" x2="${186 + g * 20 + i * 3}" y2="282"/>` : `<line x1="${184 + g * 20}" y1="278" x2="${198 + g * 20}" y2="268"/>`).join('')).join('')}</g>
    <g>
      <path d="M266 338 Q262 270 300 262 Q340 270 336 338Z" fill="#000" stroke="#fff" stroke-width="3"/>
      <path d="M290 266 L300 286 L310 266" fill="#fff"/><path d="M280 300h40" stroke="#fff" stroke-width="2" stroke-dasharray="3 3"/>
      <path d="M276 338 Q270 370 278 400M326 338 Q332 370 324 400" stroke="#000" stroke-width="16" stroke-linecap="round" fill="none"/><path d="M276 338 Q270 370 278 400M326 338 Q332 370 324 400" stroke="#fff" stroke-width="1.5" fill="none"/>
      <path d="M268 404h22M318 404h20" stroke="#fff" stroke-width="6"/>
      <circle cx="304" cy="236" r="19" fill="#fff" stroke="#000" stroke-width="2" transform="rotate(14 304 250)"/>
      <path d="M284 230 Q286 214 304 214 Q322 216 324 232 L284 230Z" fill="#000" stroke="#fff" stroke-width="1.5"/><path d="M282 230h46" stroke="#fff" stroke-width="3"/>
      <path d="M296 240q4 3 8 0M308 241q4 3 8 0" stroke="#000" stroke-width="1.8" fill="none"/><path d="M302 252q5 2 10 0" stroke="#000" stroke-width="1.5" fill="none"/>
      <path d="M266 300 Q252 320 262 336" stroke="#000" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M266 300 Q252 320 262 336" stroke="#fff" stroke-width="1.5" fill="none"/>
    </g>
    <!-- каталка -->
    <g stroke="#fff" stroke-width="4" fill="none"><path d="M440 330h150"/><path d="M450 330v40M580 330v40"/><path d="M590 330l14 -20"/></g>
    <path d="M436 312h158v18h-158z" fill="#fff" stroke="#000" stroke-width="2"/><path d="M444 314 Q470 304 500 312 Q540 302 586 314" stroke="#000" stroke-width="1.5" fill="none"/>
    <g fill="#000" stroke="#fff" stroke-width="2"><rect x="476" y="310" width="8" height="24"/><rect x="540" y="310" width="8" height="24"/></g><path d="M548 334l12 14" stroke="#fff" stroke-width="3"/>
    <circle cx="450" cy="376" r="7" fill="#000" stroke="#fff" stroke-width="3"/><circle cx="580" cy="376" r="7" fill="#000" stroke="#fff" stroke-width="3"/>
    <g fill="${RED}"><circle cx="596" cy="318" r="3"/><circle cx="604" cy="326" r="2"/><circle cx="586" cy="306" r="2.5"/></g>
    <!-- скрипичный футляр, граммофон -->
    <path d="M380 404 Q376 378 400 374 Q416 362 434 372 Q456 374 452 404 Z" fill="#000" stroke="#fff" stroke-width="3"/>
    <g transform="translate(626 372)"><rect x="-20" y="0" width="40" height="26" fill="#000" stroke="#fff" stroke-width="3"/><path d="M0 0 L16 -34 Q40 -60 54 -40 Q40 -30 22 -2Z" fill="#fff" stroke="#000" stroke-width="2"/><path d="M30 -46l10 10M42 -48l4 14" stroke="#000" stroke-width="2"/></g>
    <!-- мелочи на платформе -->
    <g fill="#fff" stroke="#000" stroke-width="1"><rect x="370" y="396" width="14" height="5" transform="rotate(20 377 398)"/><circle cx="400" cy="408" r="4"/><rect x="420" y="398" width="18" height="6"/><path d="M350 410l12 -6l4 8z"/></g>
    <rect x="474" y="396" width="8" height="14" rx="2" fill="#fff" stroke="#000" stroke-width="1.5"/><rect x="475" y="392" width="6" height="5" fill="${RED}"/>
    <!-- бинт на рельсах -->
    <path d="M524 470 q20 -10 34 2 q12 8 30 -4" stroke="#fff" stroke-width="7" fill="none"/><path d="M534 466 q6 -3 12 0" stroke="${RED}" stroke-width="4" fill="none"/>
    `);
  }

  function c3s4() {
    return svg(`
    <rect width="800" height="500" fill="#000"/>
    <path d="M0 330V250h50v-60h40v90h60v-120h40v70h70v-40h50v100h90v-150h30v-20h10v20h30v170h70v-90h50v60h60v-130h40v120h60v-50h50v120z" fill="#fff" opacity=".1"/>
    ${rainLines(0, 0, 800, 500, 120, 91, '#fff')}
    <!-- луч и свиная голова в небе -->
    <path d="M500 150 L360 0 H640Z" fill="#fff4c8" opacity=".14"/>
    <ellipse cx="500" cy="40" rx="120" ry="38" fill="#fff4c8" opacity=".35"/>
    <g opacity=".85"><ellipse cx="500" cy="40" rx="36" ry="26" fill="#000"/><path d="M470 22l-12 -18l22 8zM530 22l12 -18l-22 8z" fill="#000"/><ellipse cx="500" cy="50" rx="14" ry="10" fill="#fff4c8"/><ellipse cx="495" cy="50" rx="3" ry="5" fill="#000"/><ellipse cx="505" cy="50" rx="3" ry="5" fill="#000"/></g>
    <!-- крыша -->
    <rect y="330" width="800" height="170" fill="#0b0b0b"/><path d="M0 400h800v40h-800z" fill="#000" stroke="#fff" stroke-width="3"/><path d="M0 400h800" stroke="#fff" stroke-width="3"/>
    <g fill="#fff">${range(16).map(i => `<rect x="${i * 52}" y="392" width="40" height="8"/>`).join('')}</g>
    <!-- надстройка с дверью и пожарная лестница -->
    <path d="M40 330V230h120v100" fill="#000" stroke="#fff" stroke-width="4"/><rect x="74" y="262" width="46" height="68" fill="#000" stroke="#fff" stroke-width="3"/><circle cx="112" cy="298" r="3" fill="#fff"/>
    <g stroke="#fff" stroke-width="3"><path d="M730 500V300M772 500V300"/>${range(8).map(i => `<path d="M730 ${310 + i * 24}h42"/>`).join('')}</g>
    <!-- прожектор -->
    <path d="M460 400h100l-14 -50h-72z" fill="#000" stroke="#fff" stroke-width="4"/><path d="M510 350v-28" stroke="#fff" stroke-width="10"/>
    <path d="M432 220 Q432 320 510 324 Q588 320 588 220" fill="none" stroke="#fff" stroke-width="8"/>
    <g transform="rotate(-24 510 220)"><rect x="440" y="150" width="140" height="140" rx="70" fill="#000" stroke="#fff" stroke-width="6"/><ellipse cx="510" cy="220" rx="58" ry="58" fill="#fff4c8"/>
      ${batShadow(470, 196, 0.2, '#000')}<ellipse cx="510" cy="220" rx="20" ry="15" fill="#f6c9cf" stroke="#000" stroke-width="2"/><ellipse cx="503" cy="220" rx="3" ry="6" fill="#000"/><ellipse cx="517" cy="220" rx="3" ry="6" fill="#000"/>
      <g stroke="#000" stroke-width="2">${range(5).map(i => `<line x1="${468 + i * 5}" y1="180" x2="${468 + i * 5}" y2="198"/>`).join('')}</g></g>
    <g transform="rotate(30 590 240)"><rect x="586" y="214" width="7" height="30" fill="#fff"/><rect x="585" y="240" width="9" height="18" fill="#000" stroke="#fff" stroke-width="1.5"/></g>
    <path d="M420 440 Q440 410 460 400" stroke="#fff" stroke-width="5" fill="none"/>
    <!-- офицер у стойки -->
    <g>
      <path d="M482 400 Q480 340 512 332 Q546 340 544 400Z" fill="#000" stroke="#fff" stroke-width="3"/>
      <path d="M496 336h32l-4 10h-24z" fill="#fff"/><circle cx="512" cy="318" r="17" fill="#fff" stroke="#000" stroke-width="2"/><path d="M496 312 Q498 298 512 298 Q526 298 528 312 L496 312Z" fill="#000"/><path d="M492 312h40" stroke="#000" stroke-width="3"/>
      <path d="M504 320q3 2 6 0M514 320q3 2 6 0" stroke="#000" stroke-width="1.6" fill="none"/><path d="M508 330q4 1 8 0" stroke="#000" stroke-width="1.4" fill="none"/>
      <path d="M484 366h56M484 380h56" stroke="#fff" stroke-width="3" stroke-dasharray="6 3"/>
      <path d="M540 360l12 -4" stroke="${RED}" stroke-width="3"/><rect x="532" y="346" width="8" height="6" fill="#fff"/>
    </g>
    <!-- раздавленная маска, обломок пятачка, блокнот, папка -->
    <g transform="translate(450 410)"><path d="M-22 0 Q-20 -18 0 -18 Q8 -18 6 -6 L14 -12 L22 2 Q10 10 -22 0Z" fill="#fff" stroke="#000" stroke-width="1.5"/><circle cx="-8" cy="-8" r="2.4" fill="${RED}"/></g>
    <g transform="translate(395 450)"><ellipse cx="0" cy="0" rx="12" ry="9" fill="#f6c9cf" stroke="#000" stroke-width="2"/><ellipse cx="-4" cy="0" rx="2" ry="4" fill="#000"/><ellipse cx="4" cy="0" rx="2" ry="4" fill="#000"/><path d="M-12 4l-6 4" stroke="#000" stroke-width="2"/></g>
    <g transform="rotate(-6 150 404)"><rect x="118" y="388" width="62" height="30" fill="#f1ecdf" stroke="#000" stroke-width="2"/><path d="M118 392h62" stroke="${RED}" stroke-width="3"/><path d="M124 398h50M124 404h50M124 410h40" stroke="#bbb" stroke-width="1"/></g>
    <g transform="rotate(8 296 452)"><rect x="262" y="434" width="70" height="40" fill="#000" stroke="#fff" stroke-width="3"/><rect x="268" y="440" width="58" height="28" fill="#f1ecdf"/><path d="M274 448h46M274 456h40" stroke="#000" stroke-width="1.5"/><circle cx="314" cy="462" r="4" fill="${RED}"/></g>
    <!-- засечки и след на парапете -->
    <g stroke="#fff" stroke-width="2.2">${range(5).map(i => `<line x1="${664 + i * 6}" y1="404" x2="${664 + i * 6}" y2="426"/>`).join('')}<line x1="660" y1="422" x2="694" y2="408"/></g>
    <rect x="652" y="440" width="18" height="28" rx="6" fill="#fff" opacity=".6" transform="rotate(12 661 454)"/>
    `);
  }

  /* ---------- сюжетные панели ---------- */
  function splash3() {
    return svg(`
    <rect width="800" height="420" fill="#f1ecdf"/>
    <path d="M430 0H800V420H300Z" fill="${RED}"/><path d="M430 0H800V420H300Z" fill="url(#htk)" opacity=".3"/>
    <path d="M430 0L300 420" stroke="#000" stroke-width="10"/>
    <g transform="translate(-30 40)">${zsaszFig(230, 150, 1.25)}</g>
    <g transform="translate(40 20)">${pygFig(560, 210, 1)}</g>
    `, '0 0 800 420');
  }

  function opera() {
    const doll = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 40 Q-20 10 0 8 Q20 10 22 40Z" fill="#000" stroke="#fff" stroke-width="2"/><circle cx="0" cy="-8" r="15" fill="#fff" stroke="#000" stroke-width="1.5"/><circle cx="-6" cy="-6" r="2" fill="#000"/><circle cx="6" cy="-6" r="2" fill="#000"/><circle cx="-8" cy="0" r="3" fill="${RED}" opacity=".6"/><circle cx="8" cy="0" r="3" fill="${RED}" opacity=".6"/><path d="M-3 3q3 2 6 0" stroke="${RED}" stroke-width="1.5" fill="none"/></g>`;
    return svg(`
    <rect width="800" height="420" fill="#000"/>
    <path d="M0 0h800v40q-400 40 -800 0z" fill="${RED}"/><path d="M0 0v420h90q-20 -200 30 -420zM800 0v420h-90q20 -200 -30 -420z" fill="${RED}"/>
    <g stroke="#000" stroke-width="3" opacity=".5">${range(6).map(i => `<path d="M${10 + i * 14} 0 Q${-10 + i * 16} 200 ${10 + i * 14} 420"/><path d="M${790 - i * 14} 0 Q${810 - i * 16} 200 ${790 - i * 14} 420"/>`).join('')}</g>
    <path d="M140 260h520v20h-520z" fill="#fff"/><path d="M140 40 L400 0 L660 40 L620 260 H180Z" fill="#fff" opacity=".08"/>
    ${pygFig(330, 140, 0.55)}
    <g transform="translate(480 170)"><path d="M-30 90 Q-28 30 0 24 Q28 30 30 90Z" fill="#fff" stroke="#000" stroke-width="2"/><circle cx="0" cy="8" r="16" fill="#fff" stroke="#000" stroke-width="2"/><path d="M-16 4 Q-16 -14 0 -14 Q16 -14 16 4 Q8 -6 0 -6 Q-8 -6 -16 4Z" fill="#000"/><path d="M-6 10h4M2 10h4" stroke="#000" stroke-width="1.5"/><path d="M20 50 l40 -30" stroke="#000" stroke-width="3"/><path d="M14 56 q10 -8 20 0 q-10 8 -20 0z" fill="#000"/></g>
    <!-- ложа слева с блеском лезвия -->
    <path d="M90 90h90v60h-90z" fill="#000" stroke="#fff" stroke-width="3"/><path d="M90 150 Q135 170 180 150" stroke="${RED}" stroke-width="4" fill="none"/>
    <circle cx="140" cy="118" r="12" fill="#f4f1ea"/><path d="M132 116h5M143 116h5" stroke="#000" stroke-width="2"/><path d="M160 104l14 -20" stroke="#fff" stroke-width="3"/><path d="M174 84l4 -4" stroke="#fff" stroke-width="6" opacity=".6"/>
    <!-- «зрители» -->
    ${range(9).map(i => doll(150 + i * 62, 340 + (i % 2) * 6, 0.9)).join('')}
    ${range(8).map(i => doll(180 + i * 62, 392, 0.8)).join('')}
    `, '0 0 800 420');
  }

  function clash() {
    return svg(`
    <rect width="800" height="420" fill="${RED}"/>
    <rect width="800" height="420" fill="url(#htk)" opacity=".3"/>
    <g stroke="#000" stroke-width="3" opacity=".5">${range(14).map(i => `<line x1="${400 + Math.cos(i * 0.45) * 60}" y1="${210 + Math.sin(i * 0.45) * 60}" x2="${400 + Math.cos(i * 0.45) * 460}" y2="${210 + Math.sin(i * 0.45) * 460}"/>`).join('')}</g>
    <g transform="rotate(-22 220 200)">${zsaszFig(220, 170, 0.72)}</g>
    ${pygFig(620, 170, 0.62)}
    ${batShadow(220, 110, 0.9, '#000')}
    `, '0 0 800 420');
  }

  Object.assign(window.Art, { fingerprint, mug, tallyCard, vitrineShot, signalShot, zsaszFig, pygFig, c3s1, c3s2, c3s3, c3s4, splash3, opera, clash });
})();
