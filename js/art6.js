/* Графика кампании, глава I, дело 3 «Двойная роль»: Глиноликий, хранилище улик, «Айсберг Лаунж», киностудия, лаборатория Аркхем-Ист, Хьюго Стрендж. */
(function () {
  const A = window.Art;
  const { svg, range, rng, rainLines, batShadow, marker } = A;
  const RED = A.RED;
  const F = 'font-family="Russo One, Arial Black, sans-serif"';
  const MONO = 'font-family="monospace"';
  const PAPER = '#f1ecdf', CLAY = '#8a7860', CLAYD = '#5f5140', CLAYL = '#a8967a';
  const f1 = n => (+n).toFixed(1);
  const D6 = `<defs><linearGradient id="cone6" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4c8" stop-opacity=".42"/><stop offset="1" stop-color="#fff4c8" stop-opacity="0"/></linearGradient>
    <linearGradient id="coneC6" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcfff5" stop-opacity=".3"/><stop offset="1" stop-color="#dcfff5" stop-opacity="0"/></linearGradient></defs>`;
  const motes = (x, y, w, h, n, seed) => { const q = rng(seed); return range(n).map(() => `<circle cx="${f1(x + q() * w)}" cy="${f1(y + q() * h)}" r="${f1(.6 + q())}" fill="#fff4c8" opacity="${f1(.15 + q() * .3)}"/>`).join(''); };
  // лампа-«клетка» над проходом
  const cageLamp = (x, y, len, spread) => `<path d="M${x} 30V${y}" stroke="#444" stroke-width="2"/><path d="M${x - 12} ${y + 12}L${x - 8} ${y}H${x + 8}L${x + 12} ${y + 12}Z" fill="#2a2a2a" stroke="#888" stroke-width="1.5"/><path d="M${x - 10} ${y + 12}v7M${x} ${y + 12}v9M${x + 10} ${y + 12}v7M${x - 12} ${y + 17}H${x + 12}" stroke="#777" stroke-width="1.2"/><ellipse cx="${x}" cy="${y + 14}" rx="5" ry="3" fill="#fff4c8"/><path d="M${x - 10} ${y + 16}L${x - spread} ${y + len}H${x + spread}L${x + 10} ${y + 16}Z" fill="url(#cone6)"/>`;

  /* ---------- фоторобот ---------- */
  function facekit(s) {
    const smooth = s.skin === 1;
    let h = `<rect width="200" height="220" fill="#ebe5d2"/><g stroke="#d8d0b8" stroke-width="1">${range(11).map(i => `<line x1="0" y1="${i * 20}" x2="200" y2="${i * 20}"/>`).join('')}</g>
      <text x="8" y="16" ${MONO} font-size="9" fill="#8a8270">ФОТОРОБОТ · GCPD</text>`;
    h += `<path d="M34 220Q42 178 100 170Q158 178 166 220Z" fill="#1a1a1a" stroke="#000" stroke-width="2"/><path d="M80 172L100 210L120 172" fill="#fff" stroke="#000" stroke-width="1.5"/><path d="M96 176h8l-1 6l4 26l-7 8l-7 -8l4 -26z" fill="#333"/>`;
    if (s.ears === 0) h += `<ellipse cx="52" cy="106" rx="8" ry="15" fill="#fff" stroke="#000" stroke-width="2.4"/><ellipse cx="148" cy="106" rx="8" ry="15" fill="#fff" stroke="#000" stroke-width="2.4"/><path d="M50 100q4 -4 4 6M150 100q-4 -4 -4 6" stroke="#000" stroke-width="1.2" fill="none"/>`;
    h += `<path d="M54 96Q52 42 100 40Q148 42 146 96Q146 140 124 160Q100 172 76 160Q54 140 54 96Z" fill="#fff" stroke="#000" stroke-width="3"/>`;
    if (!smooth) h += `<path d="M118 42Q148 46 146 96Q146 140 124 160Q112 166 104 168Q132 136 130 96Q128 60 118 42Z" fill="url(#htk)" opacity=".45"/>
      <g stroke="#000" stroke-width="1.3" fill="none" opacity=".7"><path d="M74 66q26 -6 52 0M78 74q22 -5 44 0"/><path d="M64 102l-6 -3M64 106l-7 1M136 102l6 -3M136 106l7 1"/><path d="M82 122q-6 16 0 28M118 122q6 16 0 28"/></g>`;
    else h += `<ellipse cx="80" cy="74" rx="16" ry="9" fill="#fff" stroke="#ddd" stroke-width="1"/><path d="M60 88q0 -30 20 -38" stroke="#eee" stroke-width="5" fill="none" opacity=".9"/>`;
    if (s.hair === 0) h += `<path d="M52 92Q46 34 100 28Q156 32 150 92Q146 64 128 56Q106 48 84 54Q62 62 52 92Z" fill="#e3e3e3" stroke="#000" stroke-width="2.6"/><g stroke="#000" stroke-width="1.4" fill="none"><path d="M58 78Q66 48 100 38"/><path d="M70 62Q86 44 120 40"/><path d="M90 52Q112 42 140 56"/><path d="M110 50Q132 48 146 72"/></g>`;
    else if (s.hair === 1) h += `<path d="M54 84V60Q56 40 100 38Q144 40 146 60V84Q140 60 100 58Q60 60 54 84Z" fill="#cfcfcf" stroke="#000" stroke-width="2.6"/><g fill="#555">${range(30).map(i => `<circle cx="${62 + (i * 29) % 78}" cy="${46 + (i * 11) % 16}" r="1"/>`).join('')}</g>`;
    else h += `<path d="M70 56q14 -10 30 -10" stroke="#ddd" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    h += `<path d="M66 88Q78 80 92 86M108 86Q122 80 134 88" stroke="#000" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    h += s.eyes === 0
      ? `<path d="M70 100Q80 93 90 100Q80 106 70 100ZM110 100Q120 93 130 100Q120 106 110 100Z" fill="#fff" stroke="#000" stroke-width="1.8"/><circle cx="80" cy="100" r="3.6"/><circle cx="120" cy="100" r="3.6"/><circle cx="81.2" cy="98.8" r="1.2" fill="#fff"/><circle cx="121.2" cy="98.8" r="1.2" fill="#fff"/>`
      : `<ellipse cx="80" cy="100" rx="9" ry="5" fill="#0a0a0a"/><ellipse cx="120" cy="100" rx="9" ry="5" fill="#0a0a0a"/>`;
    if (s.glasses === 0) h += `<rect x="64" y="90" width="32" height="21" rx="3" fill="none" stroke="#000" stroke-width="3.6"/><rect x="104" y="90" width="32" height="21" rx="3" fill="none" stroke="#000" stroke-width="3.6"/><path d="M96 98h8M64 96l-10 -3M136 96l10 -3" stroke="#000" stroke-width="3"/>`;
    else if (s.glasses === 1) h += `<circle cx="80" cy="100" r="15" fill="none" stroke="#000" stroke-width="3.4"/><circle cx="120" cy="100" r="15" fill="none" stroke="#000" stroke-width="3.4"/><path d="M95 99h10M65 98l-11 -3M135 98l11 -3" stroke="#000" stroke-width="3"/>`;
    h += `<path d="M102 104L94 128Q101 133 109 128" stroke="#000" stroke-width="2.6" fill="none" stroke-linejoin="round"/>`;
    if (s.mous === 0) h += `<path d="M74 142Q86 128 100 134Q114 128 126 142Q126 152 112 148Q104 154 100 150Q96 154 88 148Q74 152 74 142Z" fill="#e3e3e3" stroke="#000" stroke-width="2.6"/><g stroke="#000" stroke-width="1.2"><path d="M82 140l-2 6M90 138l-1 8M98 138v9M106 138l1 8M114 138l2 6M120 140l2 5"/></g>`;
    else if (s.mous === 1) h += `<path d="M84 140Q100 134 116 140" stroke="#000" stroke-width="2" fill="none"/>`;
    h += `<path d="M88 154Q100 158 112 154" stroke="#000" stroke-width="2.2" fill="none"/>`;
    return svg(h, '0 0 200 220');
  }

  /* ---------- стеллаж «Б» в ультрафиолете ---------- */
  function uvShelf(lit) {
    const box = (x, y, w, hh, t, sm) => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#b8a27a" stroke="#000" stroke-width="2"/><path d="M${x} ${y + 8}h${w}" stroke="#8a7650" stroke-width="2"/><rect x="${x + w / 2 - 16}" y="${y + 14}" width="32" height="13" fill="#fff" stroke="#000" stroke-width="1"/><text x="${x + w / 2}" y="${y + 24}" ${MONO} font-size="9" text-anchor="middle" fill="#000">${t}</text>${sm ? `<ellipse cx="${x + w / 2}" cy="${y + hh - 10}" rx="16" ry="6" fill="#777" opacity=".5"/>` : ''}`;
    let h = `<rect width="600" height="360" fill="#14161a"/><g stroke="#1d2026" stroke-width="2">${range(19).map(i => `<line x1="0" y1="${i * 20}" x2="600" y2="${i * 20}"/>`).join('')}</g>
      <g stroke="#ddd" stroke-width="5"><path d="M20 340V30M260 340V30M20 100H260M20 190H260M20 280H260"/></g>
      ${box(34, 54, 70, 44, 'Б-14')}${box(118, 54, 70, 44, 'Б-15')}${box(130, 136, 84, 52, 'Б-17', true)}${box(36, 144, 74, 44, 'Б-16')}${box(40, 234, 84, 44, 'Б-18')}${box(146, 234, 92, 44, 'Б-19')}
      <rect x="380" y="40" width="190" height="300" fill="none" stroke="#bbb" stroke-width="4"/><g stroke="#666" stroke-width="1.4">${range(16).map(i => `<line x1="380" y1="${46 + i * 18}" x2="570" y2="${70 + i * 18}"/><line x1="570" y1="${46 + i * 18}" x2="380" y2="${70 + i * 18}"/>`).join('')}</g>
      <rect x="456" y="200" width="30" height="28" rx="4" fill="#333" stroke="#fff" stroke-width="2.5"/><path d="M462 214h18" stroke="#fff" stroke-width="3"/>
      <g stroke="#ccc" stroke-width="5" fill="none"><path d="M296 340L316 220M346 340L326 220"/><path d="M300 314H342M304 284H338M308 254H334"/></g>
      <path d="M30 330h110v-14H30z" fill="#333" stroke="#fff" stroke-width="2"/><g transform="rotate(-6 74 300)"><rect x="46" y="282" width="56" height="34" fill="${PAPER}" stroke="#000" stroke-width="1.5"/><path d="M52 292h44M52 300h40M52 308h30" stroke="#777" stroke-width="1.2"/></g>
      <rect y="340" width="600" height="20" fill="#0d0d0d"/>`;
    const marks = [
      `<g transform="translate(172 150) rotate(-12)"><ellipse cx="0" cy="4" rx="13" ry="11"/>${[[-10, -12, -14], [-4, -16, -4], [3, -16, 4], [9, -12, 12]].map(([x, y, a]) => `<rect x="${x - 3}" y="${y - 6}" width="6" height="14" rx="3" transform="rotate(${a} ${x} ${y})"/>`).join('')}<rect x="-20" y="0" width="6" height="12" rx="3" transform="rotate(-50 -17 6)"/></g>`,
      `<path d="M460 206q12 -4 20 6q4 12 -8 14q-14 -2 -12 -20z"/>`,
      `<path d="M304 294q14 -8 28 0q2 8 -14 9q-14 0 -14 -9z"/>`,
      `<g transform="translate(74 290)"><circle r="7"/><circle r="4.5" fill="none" stroke-width="1.2"/><circle r="2" fill="none" stroke-width="1"/></g>`
    ];
    if (lit) h += `<rect width="600" height="360" fill="#2a0f5a" opacity=".55"/>` + marks.map((m, i) => `<g data-mark="${i}" fill="#d6ff9a" stroke="#d6ff9a" filter="url(#glowS)">${m}</g>`).join('');
    return svg(h, '0 0 600 360');
  }

  /* ---------- неоновый пингвин ---------- */
  function neonPenguin() {
    return svg(`<rect width="300" height="170" fill="#0b1622"/><rect x="10" y="10" width="280" height="150" rx="10" fill="#0f1e2c" stroke="#2a4a5a" stroke-width="2"/>
      <g class="neon" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M90 140Q60 130 62 96Q64 60 92 46Q102 30 118 36Q132 40 130 56Q146 70 146 100Q148 134 118 142Z"/>
        <path d="M112 50l-12 6l12 4M122 46a2 2 0 1 0 0.1 0M84 92q-14 10 -12 28M140 94q12 12 8 28M96 142l-6 10h18M116 142l4 10h14"/>
      </g>
      <g class="neon neon2" fill="none" stroke-width="3"><text x="216" y="84" ${F} font-size="22" text-anchor="middle" stroke-width="1.6">ICEBERG</text><text x="216" y="112" ${F} font-size="16" text-anchor="middle" stroke-width="1.2">LOUNGE</text></g>`, '0 0 300 170');
  }

  /* ---------- Глиноликий (для панелей) ---------- */
  function clayFig(x, y, k, o) {
    o = o || {};
    const base = o.hard ? '#9c9c98' : CLAY, dark = o.hard ? '#6e6e6a' : CLAYD;
    return `<g transform="translate(${x} ${y}) scale(${k})">
      <path d="M-90 0C-100 -70 -96 -150 -56 -186C-30 -216 30 -216 56 -186C96 -150 102 -70 90 0Q70 10 50 0Q30 12 10 0Q-10 12 -30 0Q-50 12 -70 0Z" fill="${base}" stroke="#000" stroke-width="3"/>
      <path d="M40 -196C70 -170 92 -120 90 0Q70 10 50 0Q66 -80 30 -190Z" fill="${dark}" opacity=".8"/>
      <ellipse cx="-44" cy="-140" rx="16" ry="38" fill="${o.hard ? '#c4c4c0' : CLAYL}" opacity=".45" transform="rotate(18 -44 -140)"/>
      <path d="M-60 -130Q-110 -100 -112 -40Q-112 -20 -96 -18Q-84 -40 -70 -70Z" fill="${base}" stroke="#000" stroke-width="3"/>
      <path d="M60 -130Q112 -96 110 -40Q110 -20 94 -18Q82 -40 70 -70Z" fill="${dark}" stroke="#000" stroke-width="3"/>
      ${o.hard ? '<path d="M-30 -180L-12 -140L-26 -100L-4 -60M30 -170L18 -130L40 -90M-70 -40L-50 -20" stroke="#222" stroke-width="3" fill="none"/>' : `<g fill="${base}">${range(5).map(i => `<ellipse cx="${-64 + i * 32}" cy="${8 + (i % 2) * 8}" rx="5" ry="9"/>`).join('')}</g>`}
      <ellipse cx="-24" cy="-150" rx="15" ry="11" fill="#1a120a"/><ellipse cx="18" cy="-148" rx="15" ry="11" fill="#1a120a"/>
      ${o.hard ? '' : `<g filter="url(#glowS)"><circle cx="-24" cy="-150" r="5" fill="#ffd400"/><circle cx="18" cy="-148" r="5" fill="#ffd400"/></g>`}
      <ellipse cx="-4" cy="-112" rx="26" ry="${o.hard ? 6 : 12}" fill="#1a120a"/>
    </g>`;
  }
  /* лица, вылепленные из глины */
  const castFace = (x, y, k, who) => {
    const feat = {
      gordon: '<rect x="-15" y="-6" width="12" height="8" rx="1" fill="none" stroke="#000" stroke-width="2"/><rect x="3" y="-6" width="12" height="8" rx="1" fill="none" stroke="#000" stroke-width="2"/><path d="M-12 12q12 -6 24 0q-4 5 -12 3q-8 2 -12 -3z" fill="#999" stroke="#000" stroke-width="1"/>',
      waiter: '<path d="M-12 -2h8M4 -2h8" stroke="#000" stroke-width="2"/><path d="M-6 16q6 3 12 0" stroke="#000" stroke-width="1.5" fill="none"/><path d="M-26 -8q26 -20 52 0" stroke="#000" stroke-width="2" fill="none"/>',
      bruce: '<path d="M-14 -4q6 -4 10 0M4 -4q6 -4 10 0" stroke="#000" stroke-width="2" fill="none"/><path d="M-8 15q8 4 16 -1" stroke="#000" stroke-width="1.8" fill="none"/><path d="M-22 -16q18 -16 44 -6" stroke="#000" stroke-width="3" fill="none"/>'
    }[who];
    return `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-22 -16Q-24 -34 0 -36Q24 -34 22 -16L20 14Q14 30 0 32Q-14 30 -20 14Z" fill="#e8e2d0" stroke="#000" stroke-width="2"/><path d="M0 -2l-4 10q4 3 8 0" stroke="#000" stroke-width="1.4" fill="none"/>${feat}<path d="M12 -34Q24 -30 22 -16L20 14Q16 24 8 30Q18 6 16 -10Q14 -26 12 -34Z" fill="url(#htk)" opacity=".4"/></g>`;
  };

  /* ---------- место 1: хранилище улик G.C.P.D. ---------- */
  function c6s1() {
    const box = (x, y, w, hh, t, mark) => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#b8a27a" stroke="#000" stroke-width="2"/><path d="M${x} ${y + 9}h${w}" stroke="#8a7650" stroke-width="2"/><rect x="${x + w / 2 - 18}" y="${y + 15}" width="36" height="14" fill="#fff" stroke="#000" stroke-width="1"/><text x="${x + w / 2}" y="${y + 26}" ${MONO} font-size="9" text-anchor="middle" fill="#000">${t}</text>${mark ? `<ellipse cx="${x + w / 2}" cy="${y + hh - 8}" rx="18" ry="5" fill="#6a6a6a" opacity=".7"/>` : ''}`;
    const unit = (x, w, top) => `<g stroke="#ddd" stroke-width="5"><path d="M${x} 330V${top}M${x + w} 330V${top}"/>${[top, 160, 240, 326].filter(y => y >= top).map(y => `<path d="M${x} ${y}H${x + w}"/>`).join('')}</g>`;
    return svg(`${D6}
    <rect width="800" height="500" fill="#101215"/>
    <g stroke="#181b20" stroke-width="2">${range(17).map(i => `<line x1="0" y1="${i * 20}" x2="800" y2="${i * 20}"/>`).join('')}</g>
    <path d="M0 18H800" stroke="#555" stroke-width="10"/><path d="M0 30H800" stroke="#333" stroke-width="5"/>
    <text x="20" y="48" ${F} font-size="13" fill="#888" letter-spacing="2">G.C.P.D. · ВЕЩЕСТВЕННЫЕ ДОКАЗАТЕЛЬСТВА</text>
    <!-- стеллажи -->
    ${unit(16, 130, 80)}${box(26, 104, 52, 52, 'А-02')}${box(84, 110, 54, 46, 'А-03')}${box(28, 184, 100, 52, 'А-07')}${box(30, 270, 50, 52, 'А-11')}${box(86, 262, 54, 60, 'А-12')}
    ${unit(164, 176, 80)}<text x="252" y="76" ${F} font-size="20" text-anchor="middle" fill="#fff">Б</text>
    ${box(172, 104, 70, 52, 'Б-16')}${box(250, 100, 82, 56, 'Б-17', true)}${box(174, 184, 74, 52, 'Б-18')}${box(256, 190, 76, 46, 'Б-19')}${box(180, 268, 150, 54, 'Б-20')}
    ${unit(356, 170, 56)}${box(374, 60, 94, 46, '88-417')}<path d="M380 66l20 -6" stroke="${RED}" stroke-width="2"/>
    ${box(366, 112, 72, 44, 'В-03')}${box(444, 108, 76, 48, 'В-04')}${box(368, 186, 150, 50, 'В-09')}${box(370, 270, 64, 52, 'В-12')}${box(440, 264, 80, 58, 'В-13')}
    <!-- свет над проходами, бирки на коробках, огнетушитель -->
    ${cageLamp(155, 40, 290, 46)}${cageLamp(348, 40, 290, 40)}${cageLamp(537, 40, 290, 40)}
    ${motes(120, 80, 70, 240, 14, 3)}${motes(318, 80, 60, 240, 12, 5)}
    <rect x="14" y="35" width="382" height="18" fill="#101215"/><text x="20" y="48" ${F} font-size="13" fill="#888" letter-spacing="2">G.C.P.D. · ВЕЩЕСТВЕННЫЕ ДОКАЗАТЕЛЬСТВА</text>
    ${[[122, 206], [512, 206], [304, 120]].map(([x, y]) => `<path d="M${x} ${y}l6 -8" stroke="#ccc" stroke-width="1"/><rect x="${x + 4}" y="${y - 2}" width="12" height="16" fill="${RED}" stroke="#000" stroke-width="1" transform="rotate(12 ${x} ${y})"/>`).join('')}
    <rect x="530" y="262" width="16" height="10" fill="${RED}"/><rect x="532" y="276" width="12" height="38" rx="5" fill="${RED}" stroke="#000" stroke-width="1.5"/><path d="M536 276v-5h6l4 -3" stroke="#222" stroke-width="2" fill="none"/><rect x="532" y="288" width="12" height="7" fill="#fff"/>
    <!-- клетка выдачи -->
    <rect x="548" y="56" width="240" height="274" fill="#0c0d10" stroke="#ccc" stroke-width="4"/>
    <g stroke="#555" stroke-width="1.4">${range(15).map(i => `<line x1="548" y1="${62 + i * 18}" x2="788" y2="${86 + i * 18}"/><line x1="788" y1="${62 + i * 18}" x2="548" y2="${86 + i * 18}"/>`).join('')}</g>
    <rect x="570" y="150" width="130" height="110" fill="#14161a" stroke="#fff" stroke-width="3"/><path d="M630 150v-30h10v30" stroke="#888" stroke-width="2" fill="none"/><path d="M590 160l-20 40h120l-20 -40z" fill="#fff4c8" opacity=".12"/>
    <path d="M560 262H700V276H560Z" fill="#555" stroke="#fff" stroke-width="2"/>
    <g transform="rotate(-4 628 288)"><path d="M582 302L586 270H626L628 302Z" fill="${PAPER}" stroke="#000" stroke-width="2"/><path d="M628 302L630 270H670L674 302Z" fill="${PAPER}" stroke="#000" stroke-width="2"/><path d="M590 280h32M589 288h32M588 296h22M634 280h32M635 288h30" stroke="#777" stroke-width="1.2"/><path d="M640 296h24" stroke="${RED}" stroke-width="1.5"/></g>
    <circle cx="756" cy="200" r="10" fill="#333" stroke="#fff" stroke-width="2"/><path d="M750 200h12M756 194v12" stroke="#777" stroke-width="2"/><rect x="748" y="214" width="16" height="14" rx="2" fill="#c8a64a" stroke="#000"/><path d="M751 214v-6q5 -8 10 0v6" stroke="#aaa" stroke-width="2.5" fill="none"/>
    <rect x="566" y="66" width="168" height="18" fill="#ffd400" stroke="#000" stroke-width="1.5"/><text x="650" y="79" ${F} font-size="9" text-anchor="middle" fill="#000">ВЫДАЧА · ТОЛЬКО ПО ПОДПИСИ</text>
    <g transform="translate(694 254)"><ellipse cx="0" cy="8" rx="11" ry="3" fill="#555"/><path d="M-9 8q0 -14 9 -14q9 0 9 14Z" fill="#c8a64a" stroke="#000" stroke-width="1.2"/><circle cx="0" cy="-8" r="2.5" fill="#c8a64a" stroke="#000"/></g>
    <path d="M714 120h56v40h-56z" fill="#ebe5d2" stroke="#000" stroke-width="1.2"/><text x="742" y="134" ${MONO} font-size="7" text-anchor="middle" fill="#000">ДЕЖУРНЫЙ</text><text x="742" y="148" ${F} font-size="9" text-anchor="middle" fill="#000">Х. БУЛЛОК</text>
    <!-- пол -->
    <rect y="330" width="800" height="170" fill="#0c0d0f"/><line x1="0" y1="332" x2="800" y2="332" stroke="#fff" stroke-width="3"/>
    <g stroke="#1b1d21" stroke-width="2">${range(9).map(i => `<line x1="${i * 100}" y1="332" x2="${i * 100 - 60}" y2="500"/>`).join('')}</g>
    <!-- линия у клетки, ведро со шваброй -->
    <path d="M540 350H800" stroke="#ffd400" stroke-width="6" opacity=".85"/><g fill="#000" opacity=".55">${range(14).map(i => `<path d="M${548 + i * 18} 347l8 0l-6 6h-8z"/>`).join('')}</g>
    <text x="670" y="372" ${F} font-size="10" text-anchor="middle" fill="#ffd400" opacity=".8">ЗА ЛИНИЮ — НЕ ЗАХОДИТЬ</text>
    <g transform="translate(500 418)"><path d="M-22 0L-18 40H18L22 0Z" fill="#c8a020" stroke="#000" stroke-width="2"/><ellipse cx="0" cy="0" rx="22" ry="6" fill="#3a3a2a" stroke="#000" stroke-width="2"/><path d="M-20 4Q0 -18 20 4" stroke="#999" stroke-width="2" fill="none"/><path d="M8 -2L40 -90" stroke="#8a6a3a" stroke-width="4"/><path d="M0 -2q8 -14 18 0" stroke="#ddd" stroke-width="5" fill="none"/></g>
    <!-- стол дежурного: фоторобот, пончик, кофе -->
    <path d="M110 380H350V394H110Z" fill="#3a2a1c" stroke="#fff" stroke-width="2.5"/><path d="M122 394V470M338 394V470" stroke="#fff" stroke-width="5"/>
    <g transform="rotate(-5 236 366)"><rect x="186" y="336" width="100" height="70" fill="#ebe5d2" stroke="#000" stroke-width="2"/><rect x="188" y="330" width="96" height="8" fill="#555"/>
      <path d="M220 354Q218 344 236 342Q254 344 252 354Q252 372 236 378Q220 372 220 354Z" fill="none" stroke="#000" stroke-width="1.6"/><rect x="224" y="352" width="10" height="7" fill="none" stroke="#000" stroke-width="1.4"/><rect x="238" y="352" width="10" height="7" fill="none" stroke="#000" stroke-width="1.4"/><path d="M228 368q8 -4 16 0" stroke="#000" stroke-width="1.4"/><text x="236" y="398" ${MONO} font-size="7" text-anchor="middle" fill="#8a8270">не закончен</text></g>
    <ellipse cx="148" cy="372" rx="22" ry="7" fill="#fff" stroke="#000" stroke-width="1.5"/><ellipse cx="148" cy="366" rx="14" ry="7" fill="#c9883a" stroke="#000" stroke-width="1.5"/><ellipse cx="148" cy="364" rx="10" ry="4" fill="#ff8fb0"/><ellipse cx="148" cy="364" rx="3" ry="1.6" fill="#3a2a1c"/><path d="M152 359a12 7 0 0 1 10 6" stroke="#3a2a1c" stroke-width="3" fill="none"/>
    <rect x="304" y="354" width="18" height="24" rx="2" fill="#fff" stroke="#000" stroke-width="1.5"/><path d="M322 360q8 2 0 10" stroke="#fff" stroke-width="2" fill="none"/><path d="M308 350q2 -6 0 -10M316 350q2 -6 0 -10" stroke="#888" stroke-width="1.2" fill="none"/>
    <!-- настольная лампа дежурного -->
    <path d="M336 378h20" stroke="#ccc" stroke-width="4"/><path d="M346 378V346Q346 326 324 326" stroke="#ccc" stroke-width="3" fill="none"/><path d="M314 320l22 2l-4 12l-22 -2z" fill="#2a4a3a" stroke="#ccc" stroke-width="1.5"/><path d="M312 330L250 378H340L330 334Z" fill="url(#cone6)"/>
    ${marker(440, 470, 1)}
    `);
  }

  /* ---------- место 2: «Айсберг Лаунж» ---------- */
  function c6s2() {
    const table = (x, y, w, n, missing) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * .22}" fill="#fff" stroke="#000" stroke-width="2"/><path d="M${x - w} ${y}Q${x - w + 6} ${y + 46} ${x - w + 14} ${y + 52}H${x + w - 14}Q${x + w - 6} ${y + 46} ${x + w} ${y}" fill="#e8eef2" stroke="#000" stroke-width="2"/>
      ${range(4).map(i => { const gx = x - w * .6 + i * w * .4, gy = y - 4; return missing && i === 1 ? `<ellipse cx="${gx}" cy="${gy + 2}" rx="7" ry="2.4" fill="none" stroke="#c8a64a" stroke-width="1.5" stroke-dasharray="2 2"/>` : `<path d="M${gx - 5} ${gy - 22}h10l-2 12q-3 4 -6 0z" fill="#fff8d8" stroke="#000" stroke-width="1.2"/><path d="M${gx} ${gy - 10}v8M${gx - 5} ${gy}h10" stroke="#000" stroke-width="1.2"/>`; }).join('')}
      <rect x="${x - 10}" y="${y - 20}" width="20" height="14" fill="#fff" stroke="#000" stroke-width="1"/><text x="${x}" y="${y - 9}" ${F} font-size="10" text-anchor="middle" fill="#000">${n}</text>`;
    return svg(`${D6}
    <rect width="800" height="500" fill="#0b1622"/>
    <g stroke="#16304a" stroke-width="2" fill="none">${range(9).map(r => range(14).map(c => `<rect x="${c * 60 + (r % 2) * 30 - 30}" y="${r * 38}" width="60" height="38"/>`).join('')).join('')}</g>
    <path d="M0 0H800V30H0Z" fill="#07101a"/>
    <!-- ледяная люстра -->
    <path d="M330 30L470 30L440 60H360Z" fill="#cfefff" opacity=".35" stroke="#9fd" stroke-width="2"/>${range(7).map(i => `<path d="M${364 + i * 12} 60l4 ${16 + (i % 3) * 8}l4 -${16 + (i % 3) * 8}" fill="#e6fbff" opacity=".7"/>`).join('')}
    <!-- портрет хозяина над камином -->
    <rect x="28" y="54" width="112" height="124" fill="#c8a64a" stroke="#fff" stroke-width="3"/><rect x="38" y="64" width="92" height="104" fill="#1a1a1a"/>
    <path d="M52 168Q54 130 84 124Q114 130 116 168Z" fill="#111" stroke="#fff" stroke-width="1.5"/><path d="M76 124l8 16l8 -16" fill="#fff"/>
    <ellipse cx="84" cy="106" rx="18" ry="20" fill="#e8dcc8" stroke="#000" stroke-width="1.5"/><path d="M80 110q-6 8 4 12q10 -2 6 -12z" fill="#e8dcc8" stroke="#000" stroke-width="1.2"/>
    <rect x="68" y="70" width="32" height="20" fill="#000"/><rect x="62" y="88" width="44" height="5" fill="#000"/><circle cx="91" cy="102" r="5" fill="none" stroke="#c8a64a" stroke-width="1.5"/><path d="M96 104l6 14" stroke="#c8a64a" stroke-width="1"/>
    <path d="M40 210H128V330H40Z" fill="#141414" stroke="#fff" stroke-width="2"/><path d="M54 330V250Q84 224 114 250V330" fill="#000" stroke="#555" stroke-width="2"/>
    <circle cx="84" cy="300" r="56" fill="url(#fireGlow)"/>
    <path d="M62 326q4 -26 12 -14q4 -26 12 -6q6 -24 12 0q6 -14 8 20Z" fill="#ff8a2a"/><path d="M70 326q4 -16 8 -8q4 -18 8 -2q4 -14 8 2q2 2 4 8Z" fill="#ffd23f"/>
    <path d="M58 328h52M62 322l44 8" stroke="#5a3a1a" stroke-width="6" stroke-linecap="round"/>
    <path d="M30 200H138V210H30Z" fill="#c8a64a" stroke="#fff" stroke-width="1.5"/>${[44, 124].map(x => `<rect x="${x - 3}" y="186" width="6" height="14" fill="#f4ecd8" stroke="#000" stroke-width=".8"/><path d="M${x} 186q-3 -5 0 -9q3 4 0 9" fill="#ffd23f"/><circle cx="${x}" cy="180" r="10" fill="url(#lampGlow)"/>`).join('')}
    <rect x="72" y="188" width="24" height="12" rx="2" fill="#2a1d14" stroke="#c8a64a" stroke-width="1"/><circle cx="84" cy="194" r="4" fill="#f4ecd8"/>
    <!-- стойка с зонтами -->
    <path d="M142 296H168L166 332H144Z" fill="#2a2a2a" stroke="#ccc" stroke-width="1.5"/><path d="M148 296V250q0 -8 -6 -8M156 296V244q0 -8 6 -8M162 296V258" stroke="#111" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M148 296V250q0 -8 -6 -8M156 296V244q0 -8 6 -8" stroke="#c8a64a" stroke-width="1.5" fill="none"/>
    <!-- ледяной пингвин на постаменте, подтаявший с одного бока -->
    <g><ellipse cx="214" cy="250" rx="70" ry="100" fill="url(#frostGlow)" opacity=".22"/>
      <path d="M180 312H248L244 334H184Z" fill="#1c2a36" stroke="#9fd" stroke-width="1.5"/><path d="M176 306H252V314H176Z" fill="#2a3e4c" stroke="#cfefff" stroke-width="1.5"/>
      <path d="M214 204C190 206 182 236 184 262C186 288 192 302 200 306H230C238 302 246 286 244 262C244 236 236 206 214 204Z" fill="#cfefff" opacity=".55" stroke="#e6fbff" stroke-width="2"/>
      <ellipse cx="214" cy="270" rx="17" ry="28" fill="#fff" opacity=".32"/>
      <circle cx="214" cy="196" r="17" fill="#cfefff" opacity=".6" stroke="#e6fbff" stroke-width="2"/><path d="M229 192l17 5l-17 5Z" fill="#e6fbff" stroke="#9fd" stroke-width="1"/><circle cx="220" cy="191" r="2.5" fill="#5ab"/>
      <path d="M188 240q-14 28 -6 54q8 -20 10 -42Z" fill="#cfefff" opacity=".6" stroke="#e6fbff" stroke-width="1.5"/><path d="M240 240q16 26 8 54q-8 -20 -12 -42Z" fill="#9fd" opacity=".5" stroke="#e6fbff" stroke-width="1.5"/>
      <ellipse cx="204" cy="306" rx="9" ry="3" fill="#e6fbff" opacity=".8"/><ellipse cx="225" cy="306" rx="9" ry="3" fill="#e6fbff" opacity=".8"/>
      <path d="M200 214l6 26M226 220l-4 34M196 266l8 18M232 262l-6 22M210 186l6 8" stroke="#fff" stroke-width="1.4" opacity=".75"/>
      <path d="M246 268q5 18 0 36M250 296q2 8 -1 14" stroke="#9fd" stroke-width="2.5" fill="none"/><circle cx="249" cy="318" r="2" fill="#9fd"/><circle cx="246" cy="326" r="1.5" fill="#9fd"/>
      <ellipse cx="226" cy="336" rx="40" ry="5" fill="#9fd" opacity=".25"/>
      <path d="M204 334l-6 8h32l-6 -8" fill="#333" stroke="#777" stroke-width="1"/><path d="M214 334L190 210H238Z" fill="#cfefff" opacity=".06"/></g>
    <!-- бар и неоновый пингвин -->
    <rect x="488" y="28" width="192" height="104" rx="8" fill="#0f1e2c" stroke="#2a4a5a" stroke-width="2"/>
    <g fill="none" stroke="#7ff" stroke-width="3" opacity=".9" filter="url(#glowS)"><path d="M530 120Q508 112 510 88Q512 62 532 52Q540 40 552 44Q562 48 560 60Q572 70 572 92Q574 116 552 122Z"/><path d="M546 56l-9 4l9 3"/></g>
    <text x="626" y="80" ${F} font-size="16" text-anchor="middle" fill="none" stroke="#7ff" stroke-width="1" filter="url(#glowS)">ICEBERG</text><text x="626" y="100" ${F} font-size="11" text-anchor="middle" fill="none" stroke="#7ff" stroke-width=".8">LOUNGE</text>
    <path d="M460 160H690" stroke="#fff" stroke-width="3"/>${range(9).map(i => `<rect x="${470 + i * 24}" y="${136 - (i % 3) * 6}" width="12" height="${24 + (i % 3) * 6}" rx="3" fill="${['#2a4a3a', '#4a2a2a', '#2a3a4a'][i % 3]}" stroke="#ccc" stroke-width="1"/>`).join('')}
    <g stroke="#9fd" stroke-width="1" fill="none" opacity=".7">${range(8).map(i => `<path d="M${476 + i * 26} 162v6l-5 10h10l-5 -10"/>`).join('')}</g><path d="M466 162H690" stroke="#777" stroke-width="2"/>
    <path d="M440 252H680V332H440Z" fill="#111" stroke="#fff" stroke-width="3"/><path d="M430 246H690V258H430Z" fill="#cfefff" stroke="#fff" stroke-width="2"/>
    <g stroke="#ccc" stroke-width="1.5">${range(3).map(i => `<rect x="${598 + i * 16}" y="226" width="6" height="20" rx="2" fill="#c8a64a"/><path d="M${601 + i * 16} 226v-6h6"/>`).join('')}</g>
    <path d="M470 246v-16l4 -8h8l4 8v16Z" fill="#cfd8e0" stroke="#000" stroke-width="1.2"/><path d="M520 246l-6 -16h20l-6 16Z" fill="#fff8d8" opacity=".8" stroke="#000" stroke-width="1"/>
    ${[476, 548, 620].map(x => `<ellipse cx="${x}" cy="282" rx="18" ry="5" fill="#7a1a24" stroke="#fff" stroke-width="1.5"/><path d="M${x} 286V330M${x - 12} 330H${x + 12}" stroke="#ccc" stroke-width="3"/><ellipse cx="${x}" cy="312" rx="10" ry="3" fill="none" stroke="#ccc" stroke-width="1.5"/>`).join('')}
    <!-- холодильная камера и щиток -->
    <rect x="692" y="92" width="100" height="240" fill="#1a2630" stroke="#fff" stroke-width="3"/><text x="742" y="112" ${F} font-size="9" text-anchor="middle" fill="#9fd">ХОЛОДИЛЬНАЯ</text>
    <rect x="702" y="172" width="74" height="96" fill="#111" stroke="#fff" stroke-width="2.5"/><path d="M702 172l-18 -14v96l18 14" fill="#222" stroke="#fff" stroke-width="2"/>
    ${range(3).map(r => range(3).map(c => `<rect x="${710 + c * 22}" y="${180 + r * 28}" width="16" height="16" fill="#2a2a2a" stroke="#777" stroke-width="1"/>`).join('')).join('')}
    <path d="M718 196q10 14 20 0t20 10M716 224q14 -10 26 6t14 -4" stroke="${RED}" stroke-width="2.5" fill="none"/><path d="M714 250q20 10 44 -4" stroke="#ffd400" stroke-width="2.5" fill="none"/>
    <!-- пол -->
    <rect y="330" width="800" height="170" fill="#0a121a"/><line x1="0" y1="332" x2="800" y2="332" stroke="#fff" stroke-width="3"/>
    <g stroke="#13202c" stroke-width="2">${range(9).map(i => `<line x1="${i * 100}" y1="332" x2="${i * 100 - 60}" y2="500"/>`).join('')}</g>
    <path d="M520 336q60 10 160 -2" stroke="#7ff" stroke-width="8" opacity=".06"/><path d="M500 352q90 8 200 0" stroke="#7ff" stroke-width="4" opacity=".05"/>
    <!-- рояль -->
    <g transform="translate(14 372)"><path d="M0 26H118Q132 26 132 12Q132 0 114 0Q80 -6 50 -2Q16 0 0 0Z" fill="#050505" stroke="#ccc" stroke-width="2"/><path d="M4 26H118V36H4Z" fill="#111" stroke="#ccc" stroke-width="1.5"/><g fill="#fff">${range(14).map(i => `<rect x="${8 + i * 8}" y="27" width="6" height="8"/>`).join('')}</g><g fill="#000">${range(10).map(i => `<rect x="${13 + i * 11}" y="27" width="4" height="5"/>`).join('')}</g><path d="M12 36v50M110 36v50M60 36v50" stroke="#ccc" stroke-width="4"/><path d="M40 0L96 -30" stroke="#ccc" stroke-width="2"/></g>
    ${table(332, 334, 84, '1', true)}${table(560, 420, 70, '4')}
    <g transform="rotate(14 420 384)"><ellipse cx="420" cy="384" rx="24" ry="6" fill="#ccc" stroke="#000" stroke-width="1.5"/></g>
    ${marker(150, 470, 2)}
    `);
  }

  /* ---------- место 3: киностудия ---------- */
  function c6s3() {
    const statue = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-10 0h20l-4 -10h-12z" fill="#8a6a2a" stroke="#000" stroke-width="1.5"/><path d="M-6 -10V-30h12V-10" fill="#c8a64a" stroke="#000" stroke-width="1.5"/><ellipse cx="0" cy="-38" rx="10" ry="11" fill="#d8b85a" stroke="#000" stroke-width="1.5"/><path d="M-5 -40h3M2 -40h3" stroke="#000" stroke-width="1.5"/><path d="M-4 -33q4 3 8 0" stroke="#000" stroke-width="1" fill="none"/></g>`;
    return svg(`${D6}
    <rect width="800" height="500" fill="#09090a"/>
    <g stroke="#141416" stroke-width="2">${range(26).map(i => `<line x1="${i * 32}" y1="0" x2="${i * 32}" y2="330"/>`).join('')}</g>
    <rect y="330" width="800" height="62" fill="#0b0b0c"/><line x1="0" y1="332" x2="800" y2="332" stroke="#333" stroke-width="2"/>
    <rect y="390" width="800" height="110" fill="#0d0d0e"/><line x1="0" y1="392" x2="800" y2="392" stroke="#fff" stroke-width="3"/>
    <!-- осветительная ферма с прожекторами -->
    <path d="M0 14H560M0 26H560" stroke="#555" stroke-width="3"/><path d="${range(28).map(i => `M${i * 20} 14L${i * 20 + 10} 26L${i * 20 + 20} 14`).join('')}" stroke="#444" stroke-width="1.5" fill="none"/>
    ${[90, 300, 470].map(x => `<path d="M${x} 26v8" stroke="#666" stroke-width="3"/><rect x="${x - 11}" y="34" width="22" height="18" rx="3" fill="#1a1a1a" stroke="#999" stroke-width="1.5"/><path d="M${x - 14} 52h28" stroke="#777" stroke-width="2"/><path d="M${x - 10} 54L${x - 60} 330H${x + 60}L${x + 10} 54Z" fill="url(#cone6)" opacity=".7"/>`).join('')}
    <!-- экран и луч проектора -->
    <rect x="566" y="40" width="214" height="150" fill="#d8d4c4" stroke="#fff" stroke-width="3"/><rect x="566" y="40" width="214" height="150" fill="url(#htk)" opacity=".15"/>
    <text x="673" y="112" ${F} font-size="14" text-anchor="middle" fill="#555" opacity=".7" transform="skewX(-8)">ЬШ ЮЕОО ДИ</text>
    <path d="M150 220L566 40V190Z" fill="#fff4c8" opacity=".07"/>
    <!-- полка со статуэтками -->
    <path d="M232 186H488V196H232Z" fill="#3a2a1c" stroke="#fff" stroke-width="2"/><path d="M244 196v14M476 196v14" stroke="#fff" stroke-width="3"/>
    ${range(8).map(i => statue(254 + i * 30, 186)).join('')}${range(8).map(i => `<text x="${254 + i * 30}" y="206" ${MONO} font-size="8" text-anchor="middle" fill="#fff">${i + 1}</text>`).join('')}
    <text x="360" y="120" ${F} font-size="10" text-anchor="middle" fill="#c8a64a" letter-spacing="2">«ЗОЛОТАЯ МАСКА»</text>
    <!-- афиша -->
    <g transform="rotate(-3 350 270)"><rect x="300" y="214" width="100" height="112" fill="#2a1a10" stroke="#fff" stroke-width="2"/><text x="350" y="232" ${F} font-size="8" text-anchor="middle" fill="${RED}">УЖАС</text><text x="350" y="242" ${F} font-size="6" text-anchor="middle" fill="#fff">ГЛИНЯНОГО ЧЕЛОВЕКА</text>
      <path d="M326 316Q322 270 350 256Q378 270 374 316Z" fill="${CLAY}"/><circle cx="342" cy="276" r="3" fill="#ffd400"/><circle cx="358" cy="276" r="3" fill="#ffd400"/><text x="350" y="324" ${F} font-size="6" text-anchor="middle" fill="#c8a64a">БЭЗИЛ КАРЛО</text></g>
    <!-- кинопроектор на штативе -->
    <path d="M110 330L84 230M110 330L136 230M110 330V230" stroke="#ccc" stroke-width="4"/>
    <rect x="62" y="204" width="96" height="40" rx="6" fill="#1c1c1c" stroke="#fff" stroke-width="3"/><path d="M158 214L178 208V240L158 234Z" fill="#333" stroke="#fff" stroke-width="2"/>
    <circle cx="82" cy="186" r="26" fill="#111" stroke="#fff" stroke-width="3"/><circle cx="132" cy="186" r="26" fill="#111" stroke="#fff" stroke-width="3"/>
    ${[82, 132].map(cx => range(5).map(i => `<circle cx="${f1(cx + Math.cos(i * 1.256) * 14)}" cy="${f1(186 + Math.sin(i * 1.256) * 14)}" r="4" fill="#333"/>`).join('') + `<circle cx="${cx}" cy="186" r="4" fill="#fff"/>`).join('')}
    <path d="M82 212L100 230L132 212" stroke="#555" stroke-width="3" fill="none"/>
    <!-- гримёрное зеркало, вырезка, слепки лиц -->
    <rect x="512" y="240" width="140" height="110" fill="#26323a" stroke="#c8a64a" stroke-width="5"/>
    ${range(5).map(i => `<circle cx="${520 + i * 31}" cy="236" r="6" fill="#fff4c8"/><circle cx="${520 + i * 31}" cy="354" r="6" fill="#fff4c8"/>`).join('')}${range(3).map(i => `<circle cx="508" cy="${262 + i * 34}" r="6" fill="#fff4c8"/><circle cx="656" cy="${262 + i * 34}" r="6" fill="#fff4c8"/>`).join('')}
    <g transform="rotate(5 600 290)"><rect x="574" y="256" width="56" height="46" fill="#e2d8bc" stroke="#000" stroke-width="1"/><path d="M580 266h44M580 272h30" stroke="#000" stroke-width="2"/><path d="M580 280h40M580 286h36M580 292h30" stroke="#777" stroke-width="1"/><rect x="606" y="274" width="18" height="16" fill="#444"/><path d="M610 290l6 -14l6 14" stroke="${RED}" stroke-width="1.5" fill="none"/></g>
    <path d="M500 358H664V370H500Z" fill="#3a2a1c" stroke="#fff" stroke-width="2"/>
    ${castFace(530, 342, .55, 'gordon')}${castFace(582, 340, .55, 'waiter')}${castFace(634, 342, .55, 'bruce')}
    <!-- вешалка с костюмами: полицейский плащ, куртка официанта, костюм -->
    <path d="M410 214H504M414 214V326M500 214V326M406 326h16M492 326h16" stroke="#aaa" stroke-width="3"/><circle cx="410" cy="330" r="4" fill="#333" stroke="#aaa"/><circle cx="504" cy="330" r="4" fill="#333" stroke="#aaa"/>
    ${[[430, '#1a2a4a', 1], [458, '#f1ecdf', 2], [484, '#111', 3]].map(([x, c, k]) => `<path d="M${x} 214v6M${x - 12} 226l12 -6l12 6" stroke="#ccc" stroke-width="1.5" fill="none"/><path d="M${x - 13} 226H${x + 13}L${x + 15} ${k === 1 ? 300 : 280}H${x - 15}Z" fill="${c}" stroke="#000" stroke-width="1.5"/><path d="M${x} 226V${k === 1 ? 300 : 280}" stroke="${k === 2 ? '#bbb' : '#333'}" stroke-width="1"/>${k === 1 ? `<path d="M${x - 8} 240l3 -4l3 4l-3 4z" fill="#c8a64a"/>` : k === 2 ? `<path d="M${x - 4} 226l4 8l4 -8" fill="#000"/>` : `<path d="M${x - 4} 226l4 10l4 -10" fill="#fff"/><path d="M${x - 1} 234l1 8l1 -8" fill="${RED}"/>`}`).join('')}
    <!-- прожектор на стойке, кабели, мешок с песком -->
    <path d="M232 390L214 330M232 390L250 330M232 390V250" stroke="#bbb" stroke-width="3"/><path d="M206 392h52" stroke="#555" stroke-width="2"/>
    <g transform="translate(232 246) rotate(-14)"><rect x="-18" y="-16" width="36" height="32" rx="4" fill="#1a1a1a" stroke="#ddd" stroke-width="2"/><circle cx="18" cy="0" r="12" fill="#fff4c8" stroke="#ddd" stroke-width="2"/><path d="M18 -14l12 -8M18 14l12 8" stroke="#999" stroke-width="3"/></g>
    <path d="M246 236L520 140V330L246 262Z" fill="#fff4c8" opacity=".05"/>
    <ellipse cx="232" cy="392" rx="16" ry="5" fill="#5a4a3a" stroke="#000"/>
    <path d="M214 392q40 8 70 -2t90 6t140 -4" stroke="#222" stroke-width="3" fill="none"/>
    <!-- коробки с плёнкой -->
    ${range(4).map(i => `<ellipse cx="${300 + (i % 2) * 6}" cy="${386 - i * 7}" rx="24" ry="6" fill="#3a3a3a" stroke="#999" stroke-width="1.5"/>`).join('')}<text x="304" y="366" ${MONO} font-size="6" text-anchor="middle" fill="#ccc">ДУБЛИ</text>
    <!-- режиссёрское кресло -->
    <path d="M700 300h70l-6 40h-58z" fill="#2a1d14" stroke="#fff" stroke-width="2"/><rect x="704" y="274" width="62" height="20" fill="#000" stroke="#fff" stroke-width="2"/><text x="735" y="288" ${F} font-size="9" text-anchor="middle" fill="#fff">КАРЛО</text><path d="M706 340l60 50M766 340l-60 50" stroke="#fff" stroke-width="3"/>
    <path d="M200 420q40 -10 80 6q30 12 70 0" stroke="${CLAY}" stroke-width="6" fill="none" opacity=".8"/>
    <g stroke="#ffd400" stroke-width="4" opacity=".7"><path d="M560 430l16 12M576 430l-16 12"/><path d="M120 440l16 12M136 440l-16 12"/></g>
    <g transform="translate(690 404) rotate(-8)"><rect x="0" y="0" width="56" height="34" fill="#111" stroke="#fff" stroke-width="2"/><path d="M0 -10H56V0H0Z" fill="#fff" stroke="#000"/>${range(5).map(i => `<path d="M${4 + i * 11} -10l7 10h5l-7 -10z" fill="#000"/>`).join('')}<text x="6" y="14" ${MONO} font-size="7" fill="#fff">СЦЕНА 12</text><text x="6" y="26" ${MONO} font-size="7" fill="#fff">ДУБЛЬ 2</text></g>
    ${marker(430, 470, 3)}
    `);
  }

  /* ---------- место 4: лаборатория Аркхем-Ист ---------- */
  function c6s4() {
    return svg(`${D6}
    <rect width="800" height="500" fill="#0a0d10"/>
    <g stroke="#141a1f" stroke-width="2">${range(14).map(i => `<line x1="0" y1="${i * 24}" x2="800" y2="${i * 24}"/>`).join('')}${range(34).map(i => `<line x1="${i * 24}" y1="0" x2="${i * 24}" y2="330"/>`).join('')}</g>
    <text x="24" y="36" ${F} font-size="13" fill="#9ab" letter-spacing="2">АРКХЕМ-ИСТ · ЛАБОРАТОРИЯ 3</text>
    <!-- лампы дневного света -->
    ${[160, 440].map(x => `<rect x="${x - 60}" y="4" width="120" height="7" fill="#e8fff8" stroke="#555"/><path d="M${x - 60} 11L${x - 130} 420H${x + 130}L${x + 60} 11Z" fill="url(#coneC6)"/>`).join('')}
    <!-- вытяжной шкаф -->
    <path d="M196 0V52" stroke="#555" stroke-width="12"/><path d="M188 20h16" stroke="#777" stroke-width="3"/><rect x="40" y="52" width="176" height="146" fill="#14191d" stroke="#cfd8e0" stroke-width="3"/>
    <rect x="52" y="64" width="152" height="96" fill="#1d3440" opacity=".7" stroke="#9ab" stroke-width="2"/><path d="M52 110H204" stroke="#9ab" stroke-width="2"/><path d="M60 70l30 36M120 70l20 22" stroke="#fff" stroke-width="1.5" opacity=".25"/>
    ${[[78, '#2fae5a'], [104, '#c4a0b4'], [150, '#e8e8e8']].map(([x, c]) => `<path d="M${x - 6} 158V138H${x + 6}V158Z" fill="${c}" opacity=".7" stroke="#ccc"/>`).join('')}<path d="M170 158l8 -24l8 24Z" fill="none" stroke="#ccc" stroke-width="1.5"/>
    <rect x="52" y="168" width="152" height="20" fill="#0d1013" stroke="#555"/><text x="128" y="182" ${F} font-size="9" text-anchor="middle" fill="#9ab">ВЫТЯЖНОЙ ШКАФ</text>
    <!-- халат на крючке, знак биоопасности -->
    <path d="M528 108l8 -6" stroke="#aaa" stroke-width="3"/><path d="M536 110l-16 12l-6 92h46l-6 -92z" fill="#f1ecdf" stroke="#000" stroke-width="2"/><path d="M536 112v100M528 150h6" stroke="#bbb" stroke-width="1.5"/><path d="M526 124l10 18l10 -18" fill="none" stroke="#bbb" stroke-width="1.5"/>
    <g transform="translate(716 212)"><path d="M0 -26L26 20H-26Z" fill="#ffd400" stroke="#000" stroke-width="2.5"/><circle cx="0" cy="4" r="5" fill="none" stroke="#000" stroke-width="2"/>${[0, 120, 240].map(a => `<circle cx="${f1(Math.sin(a * Math.PI / 180) * 8)}" cy="${f1(4 - Math.cos(a * Math.PI / 180) * 8)}" r="5" fill="none" stroke="#000" stroke-width="2"/>`).join('')}</g>
    <!-- вентиляция с глиной -->
    <rect x="660" y="20" width="110" height="56" fill="#111" stroke="#fff" stroke-width="3"/>${range(6).map(i => `<path d="M668 ${28 + i * 8}H762" stroke="#555" stroke-width="3"/>`).join('')}
    <path d="M690 76q-4 30 4 60q4 14 -2 24" stroke="${CLAY}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M736 76q4 20 0 36" stroke="${CLAY}" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="692" cy="168" rx="6" ry="9" fill="${CLAY}"/>
    <ellipse cx="700" cy="330" rx="40" ry="8" fill="${CLAY}" opacity=".9"/>
    <!-- монитор сравнения -->
    <rect x="300" y="60" width="200" height="120" rx="6" fill="#111" stroke="#fff" stroke-width="3"/><rect x="310" y="70" width="180" height="92" fill="#0b2a33"/>
    <text x="400" y="92" ${MONO} font-size="10" text-anchor="middle" fill="#9fd">СРАВНЕНИЕ ОБРАЗЦОВ</text><text x="400" y="110" ${MONO} font-size="9" text-anchor="middle" fill="#9fd">«У» ⟷ «Б»</text>
    <rect x="324" y="120" width="152" height="12" fill="none" stroke="#9fd" stroke-width="1.5"/><rect x="326" y="122" width="138" height="8" fill="#9fd"/><text x="400" y="152" ${F} font-size="13" text-anchor="middle" fill="${RED}">92%</text>
    <path d="M390 180v20h20v-20" stroke="#fff" stroke-width="3" fill="none"/>
    <!-- полка реактивов -->
    <path d="M44 300H212V310H44Z" fill="#fff"/><path d="M44 230H212V238H44Z" fill="#fff"/>
    ${[['#d6283c', 64], ['#2850dc', 104], ['#e8e8e8', 144]].map(([c, x]) => `<path d="M${x - 10} 228V200H${x + 10}V228" fill="none" stroke="#fff" stroke-width="2"/><path d="M${x - 16} 300L${x - 10} 254V236H${x + 10}V254L${x + 16} 300Z" fill="${c}" opacity=".85" stroke="#fff" stroke-width="2"/>`).join('')}
    <path d="M176 300l-12 -50h28z" fill="none" stroke="#fff" stroke-width="2"/><path d="M168 284h20l4 16h-28z" fill="#c4a0b4" opacity=".8"/>
    <rect x="52" y="244" width="40" height="22" fill="${PAPER}" stroke="#000" stroke-width="1" transform="rotate(-8 72 255)"/>
    <!-- лабораторный стол, гель-камера -->
    <path d="M238 310H520V322H238Z" fill="#ddd" stroke="#000" stroke-width="2"/><path d="M250 322V420M508 322V420" stroke="#fff" stroke-width="5"/>
    <rect x="318" y="246" width="164" height="62" rx="6" fill="#1a2a5a" stroke="#fff" stroke-width="3"/><rect x="330" y="256" width="140" height="42" fill="#4a7aff" opacity=".55" filter="url(#glowS)"/>
    ${range(6).map(i => `<rect x="${336 + i * 22}" y="258" width="14" height="38" fill="#2a3a8a" opacity=".7"/>${range(4).map(k => `<rect x="${337 + i * 22}" y="${262 + ((i * 7 + k * 9) % 30)}" width="12" height="2.5" fill="#e8f4ff"/>`).join('')}`).join('')}
    <path d="M300 300l10 -14h22" stroke="${RED}" stroke-width="2" fill="none"/><rect x="430" y="226" width="34" height="20" fill="#333" stroke="#fff" stroke-width="2"/>
    <!-- микроскоп -->
    <g transform="translate(500 310)"><path d="M-14 0H16V-6H-14Z" fill="#ddd" stroke="#000" stroke-width="1.5"/><path d="M6 -6V-40Q6 -50 -4 -54" stroke="#ddd" stroke-width="6" fill="none"/><path d="M-12 -62l14 10l-4 8l-14 -10z" fill="#222" stroke="#ddd" stroke-width="1.5"/><path d="M-8 -30H10" stroke="#ddd" stroke-width="3"/><path d="M-6 -44v12" stroke="#555" stroke-width="4"/><circle cx="10" cy="-22" r="4" fill="#555" stroke="#ddd"/></g>
    <!-- штатив с пробирками на полке -->
    <path d="M160 228H212V222H160Z" fill="#ddd"/>${range(5).map(i => `<rect x="${164 + i * 9}" y="202" width="5" height="22" rx="2.5" fill="${['#d6283c', '#2850dc', '#c4a0b4', '#2fae5a', '#e8e8e8'][i]}" opacity=".85" stroke="#fff" stroke-width=".8"/>`).join('')}
    <!-- центрифуга -->
    <rect x="248" y="262" width="56" height="48" rx="6" fill="#222" stroke="#fff" stroke-width="2.5"/><ellipse cx="276" cy="270" rx="20" ry="6" fill="#111" stroke="#fff" stroke-width="2"/>
    <!-- стол с бланком -->
    <path d="M520 360H668V372H520Z" fill="#3a2a1c" stroke="#fff" stroke-width="2.5"/><path d="M530 372V440M658 372V440" stroke="#fff" stroke-width="5"/>
    <g transform="rotate(-6 590 334)"><path d="M548 352L552 302H620L628 352Z" fill="#fff" stroke="#000" stroke-width="2"/><path d="M552 302Q560 296 570 304Q578 296 588 304L586 312H552Z" fill="#222"/>
      <text x="588" y="322" ${MONO} font-size="7" text-anchor="middle" fill="#000">Д-р Х***о Стр***дж</text><path d="M560 330h50M560 338h44" stroke="#777" stroke-width="1.2"/><rect x="590" y="340" width="30" height="10" fill="none" stroke="${RED}" stroke-width="1.5"/></g>
    <!-- коммуникатор -->
    <path d="M680 372H770V384H680Z" fill="#555" stroke="#fff" stroke-width="2"/><path d="M690 384V440M760 384V440" stroke="#fff" stroke-width="4"/>
    <rect x="698" y="330" width="56" height="40" rx="5" fill="#111" stroke="#fff" stroke-width="2.5"/><rect x="704" y="336" width="44" height="22" fill="#0b2a33"/>${batShadow(712, 340, .06, '#ffd400')}<circle cx="740" cy="364" r="2.5" fill="${RED}"/>
    <!-- окно -->
    <rect x="560" y="80" width="80" height="140" fill="#121c26" stroke="#fff" stroke-width="3"/>${rainLines(560, 80, 80, 140, 10, 9, '#789')}<path d="M600 80v140" stroke="#fff" stroke-width="3"/>
    <!-- пол -->
    <rect y="330" width="800" height="170" fill="#0c0e10" opacity=".0"/><path d="M0 420H800" stroke="#fff" stroke-width="3"/><rect y="422" width="800" height="78" fill="#0d0f11"/>
    <ellipse cx="400" cy="462" rx="26" ry="6" fill="#111" stroke="#333" stroke-width="2"/><path d="M380 462h40M386 458h28M386 466h28" stroke="#333" stroke-width="1.5"/>
    <path d="M482 300q30 -40 80 -40t70 60" stroke="#222" stroke-width="3" fill="none"/>
    ${marker(160, 470, 4)}
    `);
  }

  /* ---------- сюжетные панели ---------- */
  function splash6() {
    return svg(`
    <rect width="800" height="420" fill="#0b0b0b"/><rect width="800" height="420" fill="url(#ht)" opacity=".05"/>
    <path d="M200 420L400 60L600 420Z" fill="#fff4c8" opacity=".05"/>
    ${clayFig(400, 420, 1.85)}
    ${castFace(320, 250, .9, 'gordon')}${castFace(404, 300, .9, 'waiter')}${castFace(480, 248, .9, 'bruce')}
    <g fill="${CLAY}">${range(8).map(i => `<ellipse cx="${300 + i * 28}" cy="${300 + (i % 3) * 22}" rx="5" ry="10"/>`).join('')}</g>
    `, '0 0 800 420');
  }
  function robinStand(x, y, k) {
    return `<g transform="translate(${x} ${y}) scale(${k})">
      <path d="M-14 -150Q-50 -90 -40 -10L-6 -16Z" fill="#050505" stroke="#fff" stroke-width="2"/><path d="M-12 -142Q-40 -90 -32 -18L-8 -22Z" fill="#ffd400"/>
      <path d="M-8 -66L-12 0M8 -66L14 0" stroke="#0f2a18" stroke-width="13" stroke-linecap="round"/><path d="M-22 0h18M6 0h20" stroke="#000" stroke-width="9"/>
      <path d="M-22 -126H22L18 -64H-18Z" fill="${RED}" stroke="#fff" stroke-width="2"/><rect x="-18" y="-74" width="36" height="8" fill="#ffd400"/><circle cx="-8" cy="-110" r="8" fill="#fff"/><text x="-8" y="-106" font-family="Arial" font-weight="bold" font-size="10" text-anchor="middle">R</text>
      <path d="M18 -120L40 -84" stroke="#0f2a18" stroke-width="11" stroke-linecap="round"/><path d="M-18 -120L-34 -86" stroke="#0f2a18" stroke-width="11" stroke-linecap="round"/>
      <path d="M46 -150L30 10" stroke="#c9b48a" stroke-width="6"/>
      <circle cx="0" cy="-146" r="18" fill="#f1ecdf" stroke="#000" stroke-width="2"/>
      <path d="M-18 -148L-22 -164L-10 -160L-6 -172L2 -162L10 -170L12 -160L20 -154Q4 -160 -18 -148Z" fill="#0a0a0a"/>
      <path d="M-14 -148H16V-140H-14Z" fill="#000"/><path d="M-10 -146h8v3h-8zM4 -146h8v3h-8z" fill="#fff"/>
    </g>`;
  }
  function clayDown() {
    return svg(`
    <rect width="800" height="420" fill="#0a0d10"/>
    <g stroke="#141a1f" stroke-width="2">${range(18).map(i => `<line x1="0" y1="${i * 24}" x2="800" y2="${i * 24}"/>`).join('')}</g>
    <rect x="560" y="30" width="180" height="180" fill="#121c26" stroke="#fff" stroke-width="4"/><path d="M650 30v180M560 120h180" stroke="#fff" stroke-width="3"/><path d="M580 40l40 70l-30 20zM700 60l30 90" stroke="#9ab" stroke-width="2"/>
    ${batShadow(560, 50, .55, '#000')}
    <path d="M0 360H800" stroke="#fff" stroke-width="3"/>
    ${clayFig(420, 360, 1.1, { hard: true })}
    <g fill="#9c9c98" stroke="#000" stroke-width="2">${[[300, 352, 18], [520, 350, 14], [560, 356, 10], [340, 356, 9], [480, 356, 11]].map(([x, y, r]) => `<path d="M${x - r} ${y}l${r * .6} -${r}l${r} ${r * .3}l${r * .5} ${r * .7}z"/>`).join('')}</g>
    ${robinStand(190, 360, 1.25)}
    `, '0 0 800 420');
  }
  function labPaper() {
    return svg(`
    <rect width="800" height="420" fill="#0b0b0b"/><rect width="800" height="420" fill="url(#ht)" opacity=".05"/>
    <g transform="rotate(-4 400 210)">
      <rect x="200" y="30" width="400" height="360" fill="#fbf8ef" stroke="#000" stroke-width="3"/>
      <path d="M200 30Q240 18 280 34Q330 16 380 30L380 46H200Z" fill="#222"/>
      <rect x="222" y="62" width="40" height="40" fill="none" stroke="#000" stroke-width="2"/><path d="M228 96Q242 66 256 96" stroke="#000" stroke-width="2" fill="none"/>
      <text x="276" y="80" ${F} font-size="18" fill="#000">Д-р ХЬЮГО СТРЕНДЖ</text>
      <text x="276" y="98" ${MONO} font-size="11" fill="#444">Главный психиатр · Лечебница Аркхем</text>
      <path d="M222 114H578" stroke="#000" stroke-width="2"/>
      <text x="222" y="146" ${MONO} font-size="13" fill="#000">ПРОЕКТ «ОБЪЕКТ У»</text>
      <text x="222" y="174" ${MONO} font-size="11" fill="#000">Сравнение образцов:</text>
      <text x="236" y="196" ${MONO} font-size="11" fill="#000">«У» — бокал, Б. Уэйн</text>
      <text x="236" y="216" ${MONO} font-size="11" fill="#000">«Б» — кровь, летучая мышь</text>
      <text x="222" y="246" ${MONO} font-size="11" fill="#000">Совпадение: ____%</text>
      ${range(4).map(i => `<path d="M222 ${276 + i * 20}H${560 - i * 40}" stroke="#bbb" stroke-width="2"/>`).join('')}
      <g transform="rotate(-14 470 330)"><rect x="400" y="300" width="150" height="50" fill="none" stroke="${RED}" stroke-width="4"/><text x="475" y="333" ${F} font-size="18" text-anchor="middle" fill="${RED}">СЕКРЕТНО</text></g>
    </g>
    `, '0 0 800 420');
  }
  function strangeReveal() {
    return svg(`
    <rect width="800" height="420" fill="#070707"/>
    <rect x="460" y="40" width="300" height="200" rx="8" fill="#111" stroke="#fff" stroke-width="3"/><rect x="472" y="52" width="276" height="160" fill="#16222a"/>
    <path d="M472 212L560 120H660L748 212Z" fill="#0e1a20"/><rect x="620" y="70" width="60" height="90" fill="#22323a" stroke="#556" stroke-width="2"/>
    ${robinStand(560, 200, .5)}<path d="M640 200Q644 150 660 140L666 120L672 140Q688 150 690 200Z" fill="#000"/>
    <text x="480" y="66" ${MONO} font-size="9" fill="${RED}">● ЛАБ-3 · 04:03</text>
    <path d="M600 240v30h20v-30" stroke="#fff" stroke-width="3" fill="none"/>
    <circle cx="300" cy="220" r="240" fill="url(#lampGlow)" opacity=".35"/>
    ${A.strangeFig(250, 190, 1.05)}
    <path d="M0 360H800" stroke="#fff" stroke-width="3"/><path d="M60 350H560V362H60Z" fill="#3a2a1c" stroke="#fff" stroke-width="2"/>
    <g transform="rotate(-4 120 330)"><rect x="80" y="300" width="80" height="54" fill="#d9b25a" stroke="#000" stroke-width="2"/><text x="120" y="334" ${F} font-size="12" text-anchor="middle" fill="#000">№3</text></g>
    <g transform="rotate(5 420 330)"><rect x="380" y="300" width="80" height="54" fill="#d9b25a" stroke="#000" stroke-width="2"/><text x="420" y="334" ${F} font-size="12" text-anchor="middle" fill="#000">№4</text></g>
    <rect x="180" y="330" width="34" height="20" rx="3" fill="#222" stroke="#fff" stroke-width="2"/><circle cx="190" cy="340" r="4" fill="${RED}"/>
    `, '0 0 800 420');
  }

  Object.assign(window.Art, { facekit, uvShelf, neonPenguin, clayFig, castFace, c6s1, c6s2, c6s3, c6s4, splash6, clayDown, labPaper, strangeReveal });
})();
