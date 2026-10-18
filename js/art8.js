/* Графика кампании, глава I, дело 5 «Омега»: восточное крыло Аркхема, подземная лаборатория Стренджа,
   сектор испытаний, зал Омеги, кабинет главного психиатра. Омега — оригинальный персонаж игры. */
(function () {
  const A = window.Art;
  const { svg, range, rng, rainLines, marker } = A;
  const RED = A.RED;
  const F = 'font-family="Russo One, Arial Black, sans-serif"';
  const MONO = 'font-family="monospace"';
  const PAPER = '#f1ecdf', TEAL = '#3fe0c5', SUIT = '#2b3138', SUITD = '#1d2227', PLATE = '#4a5662', SKIN = '#d9b79a';
  const f1 = n => (+n).toFixed(1);
  const DEFS = `<defs><linearGradient id="cone8" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4c8" stop-opacity=".42"/><stop offset="1" stop-color="#fff4c8" stop-opacity="0"/></linearGradient>
    <linearGradient id="coneC8" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcfff5" stop-opacity=".32"/><stop offset="1" stop-color="#dcfff5" stop-opacity="0"/></linearGradient>
    <radialGradient id="red8"><stop offset="0" stop-color="#ff2a2a" stop-opacity=".5"/><stop offset="1" stop-color="#ff2a2a" stop-opacity="0"/></radialGradient>
    <radialGradient id="teal8"><stop offset="0" stop-color="${TEAL}" stop-opacity=".55"/><stop offset="1" stop-color="${TEAL}" stop-opacity="0"/></radialGradient>
    <linearGradient id="tank8" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0c2a24"/><stop offset=".35" stop-color="#2f7a62"/><stop offset=".6" stop-color="#1c5a48"/><stop offset="1" stop-color="#0a201b"/></linearGradient>
    <linearGradient id="sky8" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0b10"/><stop offset=".6" stop-color="#2a1416"/><stop offset="1" stop-color="#6a2018"/></linearGradient>
    <linearGradient id="dawn8" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2f44"/><stop offset=".55" stop-color="#8a5a6a"/><stop offset="1" stop-color="#e8a070"/></linearGradient></defs>`;
  const S = (inner, vb) => svg(DEFS + inner, vb);
  const lamp = (x, y, len, spread, cold) => `<path d="M${x} 0V${y}" stroke="#333" stroke-width="2"/><path d="M${x - 14} ${y + 12}L${x - 9} ${y}H${x + 9}L${x + 14} ${y + 12}Z" fill="#2a2a2a" stroke="#888" stroke-width="1.5"/><ellipse cx="${x}" cy="${y + 13}" rx="6" ry="3" fill="${cold ? '#e8fff8' : '#fff4c8'}"/><path d="M${x - 12} ${y + 14}L${x - spread} ${y + len}H${x + spread}L${x + 12} ${y + 14}Z" fill="url(#${cold ? 'coneC8' : 'cone8'})"/>`;
  const speaker = (x, y, k, on) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-4 -30V-6" stroke="#555" stroke-width="4"/><rect x="-10" y="-8" width="20" height="16" fill="#2a2a2a" stroke="#999" stroke-width="2"/><path d="M8 -6L44 -24V24L8 6Z" fill="#d8d4c8" stroke="#000" stroke-width="2.5"/><ellipse cx="44" cy="0" rx="6" ry="24" fill="#3a3a3a" stroke="#000" stroke-width="2"/><circle cx="-2" cy="0" r="3" fill="${on ? '#ff2a2a' : '#5a1010'}"/>${on ? `<g fill="none" stroke="${TEAL}" stroke-width="2.5" opacity=".8"><path d="M56 -16q10 16 0 32"/><path d="M66 -24q16 24 0 48"/><path d="M76 -32q22 32 0 64"/></g>` : ''}</g>`;

  /* ---------- Омега: двухметровый человек в сенсорном костюме ---------- */
  function omegaFig(x, y, k, o) {
    o = o || {};
    const bp = !!o.blueprint, ln = bp ? '#e8f4ff' : '#000';
    const fill = c => bp ? 'none' : c;
    const sw = bp ? 2 : 3;
    const glow = bp ? '' : 'filter="url(#glowS)"';
    const seamC = bp ? ln : TEAL;
    // половина фигуры (левая), вторая — зеркалом
    const legs = o.noLegs ? '' : `
      <path d="M-40 -180C-50 -158 -50 -128 -40 -98L-14 -96C-10 -124 -6 -150 -6 -172Z" fill="${fill(SUIT)}" stroke="${ln}" stroke-width="${sw}"/>
      <path d="M-42 -150C-44 -132 -42 -116 -38 -104" stroke="${bp ? ln : '#3a444e'}" stroke-width="2" fill="none"/>
      <path d="M-36 -98C-30 -94 -20 -94 -14 -98L-12 -84C-20 -80 -30 -80 -38 -84Z" fill="${fill(PLATE)}" stroke="${ln}" stroke-width="2.5"/>
      <path d="M-38 -84C-46 -66 -44 -44 -34 -24L-18 -24C-14 -44 -12 -64 -12 -84Z" fill="${fill(SUIT)}" stroke="${ln}" stroke-width="${sw}"/>
      <path d="M-33 -78L-15 -78L-17 -40L-30 -40Z" fill="${fill(PLATE)}" stroke="${ln}" stroke-width="1.5"/>
      <path d="M-38 -26L-14 -26L-6 -4L-8 0H-48L-46 -8Z" fill="${fill('#0d0f12')}" stroke="${ln}" stroke-width="${sw}"/>
      <path d="M-44 -8H-8" stroke="${seamC}" stroke-width="1.5"/>
      <path d="M-44 -160C-46 -140 -44 -120 -38 -102M-40 -70C-42 -54 -38 -40 -33 -28" stroke="${seamC}" stroke-width="1.4" fill="none" opacity=".9" ${glow}/>`;
    const half = `
      <path d="M-66 -312C-82 -304 -92 -284 -92 -262C-94 -246 -90 -236 -84 -230L-66 -234C-66 -252 -62 -276 -56 -296Z" fill="${fill(SUIT)}" stroke="${ln}" stroke-width="${sw}"/>
      <path d="M-86 -282C-90 -266 -88 -252 -84 -244" stroke="${bp ? ln : '#3e4852'}" stroke-width="2" fill="none"/>
      <path d="M-86 -232C-96 -214 -94 -190 -86 -162L-70 -160C-66 -186 -64 -210 -66 -234Z" fill="${fill(SUITD)}" stroke="${ln}" stroke-width="${sw}"/>
      <path d="M-90 -214L-68 -216L-69 -178L-87 -176Z" fill="${fill(PLATE)}" stroke="${ln}" stroke-width="${bp ? 1.2 : 2}"/>
      ${range(3).map(i => `<circle cx="-79" cy="${-206 + i * 11}" r="2.2" fill="${bp ? 'none' : TEAL}" stroke="${bp ? ln : 'none'}" ${glow}/>`).join('')}
      <path d="M-92 -162C-96 -146 -90 -130 -78 -128C-66 -128 -62 -142 -66 -160Z" fill="${fill('#20262c')}" stroke="${ln}" stroke-width="${sw}"/><path d="M-90 -150h22M-89 -142h21" stroke="${bp ? ln : '#3a444e'}" stroke-width="1.5"/>
      <path d="M-50 -326C-66 -326 -80 -316 -84 -298C-78 -290 -66 -290 -56 -296C-54 -306 -52 -318 -50 -326Z" fill="${fill(PLATE)}" stroke="${ln}" stroke-width="${sw}"/>
      <circle cx="-70" cy="-308" r="3" fill="${bp ? 'none' : TEAL}" stroke="${bp ? ln : 'none'}" ${glow}/>
      ${legs}
      <path d="M-8 -318C-28 -318 -46 -312 -54 -298C-56 -286 -50 -270 -38 -266C-26 -264 -14 -268 -6 -276Z" fill="${fill('#323a42')}" stroke="${ln}" stroke-width="2"/>
      <path d="M-50 -294C-44 -280 -30 -274 -10 -278" stroke="${seamC}" stroke-width="1.4" fill="none" ${glow}/>
      <path d="M-30 -256C-34 -248 -36 -232 -34 -214M-24 -252H-6M-24 -234H-6M-22 -216H-6" stroke="${bp ? ln : '#1a1f24'}" stroke-width="2" fill="none"/>
      <path d="M-56 -292C-58 -262 -50 -232 -36 -206" stroke="${seamC}" stroke-width="1.4" fill="none" opacity=".8" ${glow}/>
      <path d="M-86 -284C-92 -262 -90 -244 -84 -232" stroke="${seamC}" stroke-width="1.2" fill="none" opacity=".7"/>
      <path d="M-22 -376L-35 -384L-25 -364Z" fill="${fill(PLATE)}" stroke="${ln}" stroke-width="2"/>`;
    return `<g transform="translate(${x} ${y}) scale(${k})">
      ${bp || o.noLegs ? '' : `<ellipse cx="0" cy="4" rx="70" ry="10" fill="#000" opacity=".5"/><ellipse cx="0" cy="-260" rx="120" ry="160" fill="url(#teal8)" opacity=".25"/>`}
      <path d="M-14 -330C-34 -328 -54 -326 -64 -314C-74 -300 -70 -278 -62 -262C-56 -240 -44 -218 -36 -198L-40 -180H40L36 -198C44 -218 56 -240 62 -262C70 -278 74 -300 64 -314C54 -326 34 -328 14 -330Z" fill="${fill(SUIT)}" stroke="${ln}" stroke-width="${sw}"/>
      <path d="M-40 -182H40L32 -152C20 -142 -20 -142 -32 -152Z" fill="${fill(SUITD)}" stroke="${ln}" stroke-width="${sw}"/>
      ${half}<g transform="scale(-1 1)">${half}</g>
      <path d="M0 -278V-196" stroke="${bp ? ln : '#1a1f24'}" stroke-width="2"/>
      <rect x="-40" y="-198" width="80" height="13" rx="2" fill="${fill('#111')}" stroke="${ln}" stroke-width="2"/><path d="M-40 -191H40" stroke="${seamC}" stroke-width="2" ${glow}/><rect x="-9" y="-200" width="18" height="17" rx="3" fill="${fill(PLATE)}" stroke="${ln}" stroke-width="2"/>
      <path d="M-26 -322C-10 -312 10 -312 26 -322L22 -306C8 -300 -8 -300 -22 -306Z" fill="${fill(PLATE)}" stroke="${ln}" stroke-width="2"/>
      <text x="0" y="-284" ${F} font-size="26" text-anchor="middle" fill="${bp ? 'none' : TEAL}" stroke="${bp ? ln : 'none'}" ${glow}>Ω</text>
      <path d="M-11 -340H11L13 -322H-13Z" fill="${fill(SUITD)}" stroke="${ln}" stroke-width="2"/><path d="M-12 -334h24M-12 -328h24" stroke="${bp ? ln : '#3a444e'}" stroke-width="1.5"/>
      <path d="M-21 -352C-21 -338 -16 -328 -8 -324C-4 -322 4 -322 8 -324C16 -328 21 -338 21 -352Z" fill="${fill(SKIN)}" stroke="${ln}" stroke-width="${sw}"/>
      ${bp ? '' : '<path d="M-8 -333q8 3 16 0" stroke="#5a3a2a" stroke-width="2" fill="none"/><path d="M-15 -346q-1 9 5 16M15 -346q1 9 -5 16" stroke="#b08a6a" stroke-width="1.5" fill="none"/><path d="M-2 -344l2 6h3" stroke="#a07a5a" stroke-width="1.5" fill="none"/><g fill="#6a4a34" opacity=".45">' + range(18).map(i => `<circle cx="${-14 + (i * 7) % 28}" cy="${-336 + (i % 4) * 3}" r=".9"/>`).join('') + '</g>'}
      <path d="M-24 -350C-28 -372 -22 -396 0 -400C22 -396 28 -372 24 -350L20 -348C14 -352 -14 -352 -20 -348Z" fill="${fill(SUIT)}" stroke="${ln}" stroke-width="${sw}"/>
      <path d="M0 -400C-4 -390 -4 -380 0 -372C4 -380 4 -390 0 -400Z" fill="${fill(PLATE)}" stroke="${ln}" stroke-width="1.5"/>
      <path d="M-25 -368H25L23 -356C10 -352 -10 -352 -23 -356Z" fill="${bp ? 'none' : (o.cracked ? '#2a6a60' : TEAL)}" stroke="${ln}" stroke-width="2" ${o.cracked ? '' : glow}/>
      ${[-15, -8, 8, 15].map(cx => `<circle cx="${cx}" cy="-362" r="2.4" fill="${bp ? 'none' : '#062a26'}" stroke="${bp ? ln : 'none'}"/>`).join('')}
      ${o.cracked ? '<path d="M-6 -368l6 6l-3 4l5 3" stroke="#fff" stroke-width="1.5" fill="none"/>' : ''}
      ${[-25, 25].map(cx => `<circle cx="${cx}" cy="-356" r="5" fill="${fill(SUITD)}" stroke="${bp ? ln : TEAL}" stroke-width="2"/>`).join('')}
      ${bp ? '' : `<path d="M14 -330C34 -328 54 -326 64 -314C74 -300 70 -278 62 -262C56 -240 44 -218 36 -198L40 -180H10Z" fill="url(#htk)" opacity=".16"/>`}
    </g>`;
  }
  // Омега на колене (поражение)
  function omegaKneel(x, y, k) {
    return `<g transform="translate(${x} ${y}) scale(${k})">
      <ellipse cx="0" cy="4" rx="90" ry="12" fill="#000" opacity=".55"/>
      <!-- колено на полу и колено вверх -->
      <path d="M-40 -96L-12 -92L-20 -20L-44 -24Z" fill="${SUIT}" stroke="#000" stroke-width="3"/><ellipse cx="-32" cy="-12" rx="15" ry="11" fill="${PLATE}" stroke="#000" stroke-width="3"/><path d="M-50 -6L-14 -6L-18 4H-52Z" fill="#0d0f12" stroke="#000" stroke-width="2"/>
      <path d="M12 -92L44 -96L62 -62L36 -54Z" fill="${SUIT}" stroke="#000" stroke-width="3"/><ellipse cx="52" cy="-60" rx="15" ry="12" fill="${PLATE}" stroke="#000" stroke-width="3"/>
      <path d="M40 -52L64 -52L62 -20L42 -20Z" fill="${SUITD}" stroke="#000" stroke-width="3"/><path d="M36 -22L66 -22L72 0L30 0Z" fill="#0d0f12" stroke="#000" stroke-width="3"/>
      <path d="M-30 -90L-34 -26M40 -90L56 -64" stroke="${TEAL}" stroke-width="1.5" opacity=".5"/>
      <g transform="translate(0 92)">${omegaFig(0, 0, 1, { cracked: true, noLegs: true })}</g>
      ${[[-62, -232], [64, -226], [-18, -268], [30, -262]].map(([x, y], i) => `<path d="M${x} ${y}l${i % 2 ? 6 : -6} -8l4 6l6 -10" stroke="${TEAL}" stroke-width="2" fill="none" filter="url(#glowS)"/>`).join('')}
    </g>`;
  }

  /* ---------- место 1: восточное крыло Аркхема ---------- */
  function c8s1() {
    const cell = (x, open) => `<rect x="${x}" y="96" width="92" height="236" fill="#0a0c0e" stroke="#9aa4ae" stroke-width="3"/>
      ${open ? `<path d="M${x + 92} 96L${x + 140} 110V318L${x + 92} 332" fill="none" stroke="#cfd8e0" stroke-width="3"/><g stroke="#cfd8e0" stroke-width="3">${range(5).map(i => `<path d="M${x + 100 + i * 8} ${104 + i * 2}V${324 - i * 2}"/>`).join('')}</g>` : `<g stroke="#cfd8e0" stroke-width="3">${range(8).map(i => `<path d="M${x + 8 + i * 11} 96V332"/>`).join('')}</g>`}
      <rect x="${x + 10}" y="80" width="72" height="14" fill="#1a1e22" stroke="#555"/><text x="${x + 46}" y="91" ${MONO} font-size="9" text-anchor="middle" fill="#cfd8e0">Б-${(x / 10) | 0}</text>
      <path d="M${x + 20} 300q20 -24 50 -10l-6 30h-40z" fill="#e8e2d0" stroke="#000" stroke-width="1" opacity=".85"/>`;
    return S(`
    <rect width="800" height="500" fill="#0e0f11"/>
    <rect y="40" width="800" height="292" fill="#1a1c1e"/><g stroke="#24272a" stroke-width="2">${range(14).map(i => `<path d="M0 ${48 + i * 22}H800"/>`).join('')}</g>
    <rect y="200" width="800" height="132" fill="#202426"/><path d="M0 200H800" stroke="#3a4248" stroke-width="4"/>
    <rect width="800" height="40" fill="#08090a"/><path d="M0 40H800" stroke="#3a3a3a" stroke-width="5"/>
    <!-- аварийные мигалки -->
    ${[150, 520].map(x => `<rect x="${x - 10}" y="40" width="20" height="12" fill="#5a1010" stroke="#999"/><circle cx="${x}" cy="56" r="7" fill="#ff2a2a" filter="url(#glowS)"/><circle cx="${x}" cy="60" r="150" fill="url(#red8)"/>`).join('')}
    <rect x="300" y="56" width="200" height="20" fill="#ffd400"/><text x="400" y="71" ${F} font-size="11" text-anchor="middle" fill="#000">ВОСТОЧНОЕ КРЫЛО · ОТДЕЛЕНИЕ Б</text>
    ${cell(10, true)}${cell(310, true)}
    <!-- табличка на двери кабинета -->
    <rect x="412" y="96" width="92" height="236" fill="#2a2420" stroke="#9aa4ae" stroke-width="3"/><circle cx="494" cy="220" r="4" fill="#c8a64a"/>
    <rect x="420" y="118" width="76" height="34" fill="#c8a64a" stroke="#000" stroke-width="1.5"/><text x="458" y="132" ${MONO} font-size="7.5" text-anchor="middle" fill="#000">Д-Р Х. КВИНЗЕЛЬ</text><text x="458" y="144" ${MONO} font-size="6.5" text-anchor="middle" fill="#000">ПСИХИАТР</text>
    <g transform="rotate(-10 458 172)"><rect x="426" y="162" width="64" height="16" fill="none" stroke="${RED}" stroke-width="2"/><text x="458" y="174" ${F} font-size="10" text-anchor="middle" fill="${RED}">УВОЛЕНА</text></g>
    <rect x="438" y="190" width="40" height="26" fill="#e8d0e0" stroke="#000" stroke-width="1" transform="rotate(6 458 203)"/><path d="M444 198h26M444 204h18" stroke="#a04060" stroke-width="1.2" transform="rotate(6 458 203)"/>
    <!-- бронированная дверь с замком -->
    <rect x="590" y="70" width="190" height="262" fill="#2a3036" stroke="#cfd8e0" stroke-width="4"/>
    <rect x="606" y="86" width="158" height="230" fill="#3a424a" stroke="#1a1e22" stroke-width="3"/>
    ${range(4).map(i => `<path d="M606 ${120 + i * 50}H764" stroke="#2a3036" stroke-width="4"/>`).join('')}${range(6).map(i => `<circle cx="${616 + i * 28}" cy="96" r="3" fill="#666"/><circle cx="${616 + i * 28}" cy="306" r="3" fill="#666"/>`).join('')}
    <path d="M590 70l-14 10v262l14 -10" fill="#1a1e22"/>
    <rect x="672" y="170" width="48" height="66" rx="4" fill="#0b1418" stroke="#9fd" stroke-width="2"/><rect x="678" y="178" width="36" height="26" fill="#05110f"/>
    <g stroke="${TEAL}" stroke-width="1.2" fill="none">${range(4).map(i => `<path d="M${680 + i * 8} 180v${8 + (i % 2) * 10}h6"/>`).join('')}</g>
    ${range(6).map(i => `<rect x="${680 + (i % 3) * 11}" y="${210 + Math.floor(i / 3) * 11}" width="8" height="8" fill="#1a2a30" stroke="#9fd" stroke-width=".8"/>`).join('')}<circle cx="712" cy="174" r="3" fill="#ff2a2a" filter="url(#glowS)"/>
    <text x="685" y="60" ${F} font-size="10" text-anchor="middle" fill="#888">НЕТ НА ПЛАНЕ</text>
    <!-- пост охраны -->
    <path d="M110 300H330V314H110Z" fill="#3a3530" stroke="#cfd8e0" stroke-width="2.5"/><path d="M120 314V400M320 314V400" stroke="#cfd8e0" stroke-width="5"/>
    ${[[130, 240], [196, 236]].map(([x, y]) => `<rect x="${x}" y="${y}" width="58" height="50" rx="4" fill="#1a1a1a" stroke="#cfd8e0" stroke-width="2"/><rect x="${x + 5}" y="${y + 5}" width="48" height="36" fill="#0e1214"/><g fill="#cfd8e0" opacity=".25">${range(22).map(i => `<rect x="${x + 6 + (i * 17) % 46}" y="${y + 6 + (i * 11) % 34}" width="${2 + (i % 3)}" height="1.5"/>`).join('')}</g>`).join('')}
    <rect x="262" y="270" width="58" height="30" rx="3" fill="#20262a" stroke="#cfd8e0" stroke-width="2"/><circle cx="276" cy="285" r="7" fill="#111" stroke="#aaa"/><rect x="290" y="276" width="24" height="8" fill="#0b1a10"/><circle cx="306" cy="292" r="3" fill="${TEAL}" filter="url(#glowS)"/>
    <path d="M300 270v-26" stroke="#555" stroke-width="3"/><path d="M262 290q-20 20 -10 40" stroke="#222" stroke-width="3" fill="none"/>
    <rect x="140" y="288" width="40" height="10" fill="#555" transform="rotate(-6 160 293)"/>
    <!-- пол: шахматная плитка, вода, мусор -->
    <rect y="332" width="800" height="168" fill="#141618"/><path d="M0 334H800" stroke="#cfd8e0" stroke-width="3"/>
    ${range(4).map(r => range(20).map(c => (r + c) % 2 ? `<path d="M${c * 44 - r * 10} ${334 + r * 42}h44l-10 42h-44z" fill="#1d2023"/>` : '').join('')).join('')}
    <ellipse cx="520" cy="440" rx="120" ry="14" fill="#2a3a44" opacity=".6"/><ellipse cx="150" cy="80" rx="0" ry="0"/>
    ${rainLines(470, 60, 120, 260, 14, 4, '#5a7a8a')}
    <path d="M60 420q20 -14 60 -6q30 8 20 20q-40 10 -80 -14z" fill="#e8e2d0" stroke="#000" stroke-width="1.5"/><path d="M70 420l-30 20M120 428l30 18" stroke="#e8e2d0" stroke-width="6"/>
    <ellipse cx="380" cy="470" rx="34" ry="8" fill="#999" stroke="#000" stroke-width="1.5"/><ellipse cx="370" cy="466" rx="10" ry="4" fill="#5a4a2a"/>
    ${range(6).map(i => `<rect x="${200 + i * 70}" y="${360 + (i % 3) * 30}" width="20" height="14" fill="${PAPER}" opacity=".7" transform="rotate(${i * 23} ${210 + i * 70} ${367 + (i % 3) * 30})"/>`).join('')}
    ${marker(560, 492, 1)}
    `);
  }

  /* ---------- место 2: генетический сектор ---------- */
  function c8s2() {
    const tank = (x, lbl, empty) => `<g><rect x="${x}" y="300" width="74" height="30" fill="#2a3036" stroke="#cfd8e0" stroke-width="2"/><rect x="${x}" y="70" width="74" height="22" fill="#2a3036" stroke="#cfd8e0" stroke-width="2"/>
      <rect x="${x + 6}" y="92" width="62" height="208" fill="${empty ? '#0c1416' : 'url(#tank8)'}" stroke="#9fd" stroke-width="2" opacity=".95"/>
      ${empty ? `<path d="M${x + 14} 140l14 30l-10 20l18 30M${x + 50} 110l-8 40" stroke="#cfd8e0" stroke-width="1.5" fill="none"/><path d="M${x + 6} 300l10 -14l12 14l14 -10l12 10l14 -6" fill="#9fd" opacity=".3"/>`
        : `${range(6).map(i => `<circle cx="${x + 18 + (i * 17) % 40}" cy="${120 + (i * 37) % 170}" r="${2 + (i % 3)}" fill="#bff" opacity=".6"/>`).join('')}<path d="M${x + 37} 130q-14 20 0 40t0 40q14 20 0 40" stroke="#dfffee" stroke-width="2" fill="none" opacity=".7"/><path d="M${x + 37} 130q14 20 0 40t0 40q-14 20 0 40" stroke="#ffd400" stroke-width="2" fill="none" opacity=".6"/>`}
      <rect x="${x + 8}" y="306" width="58" height="18" fill="${PAPER}" stroke="#000"/><text x="${x + 37}" y="319" ${MONO} font-size="${lbl.length > 9 ? 7 : 9}" text-anchor="middle" fill="${empty ? RED : '#000'}">${lbl}</text>
      <path d="M${x + 37} 70V40" stroke="#555" stroke-width="5"/></g>`;
    return S(`
    <rect width="800" height="500" fill="#0b0f11"/>
    <g stroke="#131a1d" stroke-width="2">${range(14).map(i => `<path d="M0 ${i * 24}H800"/>`).join('')}${range(34).map(i => `<path d="M${i * 24} 0V332"/>`).join('')}</g>
    <rect width="800" height="34" fill="#070a0b"/>
    ${lamp(130, 18, 314, 120, true)}${lamp(560, 18, 314, 120, true)}
    <rect x="436" y="124" width="168" height="22" fill="#0e1416" stroke="#3a4a50" stroke-width="2"/><text x="520" y="139" ${F} font-size="9" text-anchor="middle" fill="#9ab" letter-spacing="1">ГЕНЕТИЧЕСКИЙ СЕКТОР · −2</text>
    ${tank(26, 'Э. НИГМА')}${tank(110, 'С. ГРАНДИ')}${tank(194, 'ВЕНОМ')}${tank(278, '«Б»: ПУСТО', true)}
    <!-- криоконтейнер с отказом -->
    <rect x="368" y="262" width="44" height="68" rx="6" fill="#cfefff" stroke="#fff" stroke-width="2" opacity=".85"/><rect x="368" y="262" width="44" height="68" rx="6" fill="url(#frostGlow)" opacity=".5"/>
    <path d="M374 274h32M374 286h32" stroke="#9fd" stroke-width="2"/><rect x="372" y="300" width="36" height="16" fill="${PAPER}" stroke="#000"/><text x="390" y="312" ${MONO} font-size="8" text-anchor="middle" fill="${RED}">Ф-1</text>
    <g transform="rotate(8 396 244)"><rect x="378" y="226" width="34" height="30" fill="${PAPER}" stroke="#000"/><path d="M382 234h26M382 240h22M382 246h24" stroke="#666" stroke-width="1"/><rect x="386" y="222" width="18" height="6" fill="#555"/></g>
    <!-- громкоговорители -->
    ${speaker(250, 60, .9, true)}${speaker(640, 56, .9, true)}
    <!-- секвенатор -->
    <path d="M436 330V240H604V330" fill="#1a1e22" stroke="#cfd8e0" stroke-width="3"/><rect x="448" y="174" width="144" height="66" rx="4" fill="#111" stroke="#cfd8e0" stroke-width="3"/><rect x="456" y="182" width="128" height="50" fill="#06201c"/>
    <path d="M466 188q30 20 0 40M486 188q-30 20 0 40" stroke="${TEAL}" stroke-width="2" fill="none" transform="translate(10 0)"/>${range(5).map(i => `<path d="M${470 + 0} ${192 + i * 8}h22" stroke="${['#2fae5a', '#d0142c', '#ffd400', '#2f6bff', '#2fae5a'][i]}" stroke-width="2" transform="translate(4 0)"/>`).join('')}
    <text x="548" y="200" ${MONO} font-size="8" text-anchor="middle" fill="${TEAL}">ДОНОР: ?</text><text x="548" y="214" ${MONO} font-size="8" text-anchor="middle" fill="${TEAL}">Ω-41</text>
    ${range(8).map(i => `<rect x="${446 + i * 19}" y="256" width="14" height="40" rx="2" fill="#0e1214" stroke="#555"/><rect x="${448 + i * 19}" y="${264 + (i % 3) * 6}" width="10" height="${24 - (i % 3) * 6}" fill="${['#2fae5a', '#d0142c', '#ffd400', '#2f6bff'][i % 4]}" opacity=".7"/>`).join('')}
    <rect x="452" y="304" width="136" height="10" fill="#333"/>
    <!-- звуковая камера -->
    <rect x="620" y="110" width="160" height="220" fill="#101418" stroke="#cfd8e0" stroke-width="3"/>
    <g fill="#1d2329">${range(8).map(r => range(6).map(c => `<path d="M${628 + c * 25} ${120 + r * 26}l12 -10l12 10l-12 10z"/>`).join('')).join('')}</g>
    <rect x="620" y="110" width="160" height="220" fill="#9fd" opacity=".05"/><path d="M630 120l40 80M700 116l-20 60" stroke="#fff" stroke-width="1.5" opacity=".2"/>
    ${['#3fe0c5', '#d0142c', '#ffd400', '#e8e8e8'].map((c, i) => `<circle cx="${648 + i * 35}" cy="296" r="11" fill="${c}" stroke="#000" stroke-width="2" opacity=".85"/>`).join('')}
    <rect x="660" y="98" width="80" height="14" fill="#ffd400"/><text x="700" y="109" ${F} font-size="8" text-anchor="middle" fill="#000">ЗВУКОВАЯ КАМЕРА</text>
    <!-- пол -->
    <path d="M0 330H800" stroke="#cfd8e0" stroke-width="3"/><rect y="332" width="800" height="168" fill="#0d1113"/>
    <g stroke="#162024" stroke-width="2">${range(14).map(i => `<path d="M${i * 60} 332L${i * 60 - 40} 500"/>`).join('')}<path d="M0 400H800"/></g>
    <path d="M20 420H360" stroke="#ffd400" stroke-width="3" stroke-dasharray="14 10" opacity=".6"/>
    <path d="M300 334q30 40 120 50t160 -10" stroke="#222" stroke-width="5" fill="none"/>
    ${marker(160, 492, 2)}
    `);
  }

  /* ---------- место 3: сектор испытаний ---------- */
  function c8s3() {
    return S(`
    <rect width="800" height="500" fill="#0c0d10"/>
    <g stroke="#15171c" stroke-width="2">${range(26).map(i => `<path d="M${i * 32} 30V332"/>`).join('')}</g>
    <rect width="800" height="30" fill="#07080a"/>
    ${lamp(380, 10, 322, 120)}${lamp(700, 10, 322, 90, true)}
    <!-- табло результатов: 41 провал -->
    <rect x="22" y="56" width="250" height="150" fill="#0a0a0a" stroke="#cfd8e0" stroke-width="3"/><text x="147" y="76" ${F} font-size="11" text-anchor="middle" fill="#cfd8e0">ОБЪЕКТ Ω · ИСПЫТАНИЯ</text>
    ${range(41).map(i => `<g><rect x="${32 + (i % 10) * 23}" y="${84 + Math.floor(i / 10) * 23}" width="20" height="18" fill="#2a0a0e" stroke="${RED}" stroke-width="1"/><text x="${42 + (i % 10) * 23}" y="${97 + Math.floor(i / 10) * 23}" ${MONO} font-size="8" text-anchor="middle" fill="${RED}">${i + 1}</text></g>`).join('')}
    <text x="147" y="198" ${MONO} font-size="9" text-anchor="middle" fill="${RED}">ПРОВАЛ · ПРОВАЛ · ПРОВАЛ</text>
    <!-- разрезанный чертёж в рамке -->
    <rect x="300" y="70" width="150" height="150" fill="#0b2a4a" stroke="#c8a64a" stroke-width="5"/>
    <g transform="translate(375 214) scale(.33)">${omegaFig(0, 0, 1, { blueprint: true })}</g>
    <g stroke="#c8a64a" stroke-width="2.5">${[350, 400].map(x => `<path d="M${x} 72V218"/>`).join('')}${[120, 170].map(y => `<path d="M302 ${y}H448"/>`).join('')}</g>
    <path d="M300 220l20 14h110l20 -14" stroke="#555" stroke-width="2" fill="none"/>
    <!-- вырезка про цирк -->
    <g transform="rotate(5 545 150)"><rect x="508" y="112" width="74" height="80" fill="#e0d6b8" stroke="#000" stroke-width="1.5"/><rect x="514" y="118" width="62" height="10" fill="#222"/><text x="545" y="126" ${F} font-size="6.5" text-anchor="middle" fill="#fff">ЦИРК ХЕЙЛИ</text>
      <path d="M520 160q25 -30 50 0" stroke="#555" stroke-width="2" fill="none"/><path d="M545 130v14" stroke="#555"/><circle cx="545" cy="148" r="4" fill="#555"/><path d="M514 170h62M514 176h56M514 182h40" stroke="#666" stroke-width="1"/><circle cx="545" cy="114" r="3" fill="${RED}"/></g>
    <!-- полоса препятствий -->
    <path d="M80 332V240H96V332M180 332V250H196V332M80 248H196" stroke="#5a6470" stroke-width="5" fill="none"/>
    <rect x="216" y="272" width="60" height="60" fill="#1a1e22" stroke="#5a6470" stroke-width="3"/><path d="M216 300h60" stroke="#ffd400" stroke-width="4" stroke-dasharray="8 6"/>
    <!-- камера без света и звука -->
    <ellipse cx="470" cy="300" rx="70" ry="34" fill="#050505" stroke="#5a6470" stroke-width="3"/><path d="M400 300a70 34 0 0 1 140 0" fill="#141619"/><rect x="452" y="262" width="36" height="10" fill="#0b2a33"/><text x="470" y="270" ${MONO} font-size="6" text-anchor="middle" fill="#9fd">ДЕПРИВАЦИЯ</text>
    <!-- картотека -->
    <rect x="600" y="196" width="168" height="136" fill="#4a4a42" stroke="#cfd8e0" stroke-width="3"/>
    ${range(3).map(r => range(2).map(c => `<rect x="${610 + c * 80}" y="${206 + r * 42}" width="70" height="34" fill="#5a5a50" stroke="#222" stroke-width="2"/><rect x="${635 + c * 80}" y="${218 + r * 42}" width="20" height="6" fill="#ccc"/>`).join('')).join('')}
    <path d="M690 248H770V290H690Z" fill="#3a3a32" stroke="#cfd8e0" stroke-width="2"/>${range(6).map(i => `<rect x="${696 + i * 11}" y="${236 - (i % 2) * 4}" width="9" height="16" fill="${PAPER}" stroke="#555" stroke-width=".7"/>`).join('')}
    ${range(5).map(i => `<g transform="rotate(${-20 + i * 11} ${640 + i * 26} 360)"><rect x="${626 + i * 26}" y="350" width="28" height="18" fill="${PAPER}" stroke="#555" stroke-width=".8"/><path d="M${630 + i * 26} 356h18M${630 + i * 26} 361h12" stroke="#777" stroke-width=".8"/></g>`).join('')}
    <!-- пол -->
    <path d="M0 330H800" stroke="#cfd8e0" stroke-width="3"/><rect y="332" width="800" height="168" fill="#0e0f12"/>
    <g stroke="#17191d" stroke-width="2">${range(10).map(i => `<path d="M${i * 90} 332L${i * 90 - 60} 500"/>`).join('')}</g>
    <path d="M60 470q100 -30 260 -10" stroke="${RED}" stroke-width="2" fill="none" opacity=".4" stroke-dasharray="6 6"/>
    ${marker(330, 492, 3)}
    `);
  }

  /* ---------- место 4: вход в зал Омеги ---------- */
  function c8s4() {
    return S(`
    <rect width="800" height="500" fill="#0c0f12"/>
    ${range(16).map(x => `<rect x="${x * 50}" y="30" width="50" height="302" fill="${x % 2 ? '#12171c' : '#10141a'}"/><rect x="${x * 50 + 10}" y="190" width="30" height="130" fill="none" stroke="#1b222a" stroke-width="2"/>`).join('')}
    <rect width="800" height="30" fill="#07080a"/>
    <!-- окно наблюдения с монитором -->
    <rect x="380" y="20" width="200" height="94" fill="#05080a" stroke="#cfd8e0" stroke-width="3"/><rect x="430" y="30" width="100" height="62" fill="#111" stroke="#888" stroke-width="2"/><rect x="434" y="34" width="92" height="54" fill="#ece6d6"/>
    <g fill="#140d0d">${(() => { const q = rng(9); let h = ''; for (let i = 0; i < 10; i++) { const dx = 3 + q() * 26, y = 40 + q() * 42, rx = 2 + q() * 7, ry = 2 + q() * 5; h += `<ellipse cx="${f1(480 - dx)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}"/><ellipse cx="${f1(480 + dx)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}"/>`; } return h; })()}</g>
    <circle cx="520" cy="40" r="2.5" fill="${RED}"/><text x="480" y="106" ${MONO} font-size="7" text-anchor="middle" fill="#cfd8e0">НАБЛЮДЕНИЕ</text>
    <!-- огромная дверь в зал с кодовым цилиндром -->
    <rect x="200" y="120" width="250" height="212" fill="#2a3036" stroke="#cfd8e0" stroke-width="4"/><path d="M325 120V332" stroke="#1a1e22" stroke-width="5"/>
    ${range(5).map(i => `<path d="M200 ${150 + i * 38}H450" stroke="#222930" stroke-width="3"/>`).join('')}
    <rect x="200" y="326" width="250" height="6" fill="${TEAL}" opacity=".5" filter="url(#glowS)"/>
    <circle cx="325" cy="214" r="46" fill="#1b1f24" stroke="#c8a64a" stroke-width="5"/>${[36, 26, 16].map((r, i) => `<circle cx="325" cy="214" r="${r}" fill="${i % 2 ? '#2a2f36' : '#20252b'}" stroke="#555" stroke-width="2"/>`).join('')}
    <text x="325" y="221" ${F} font-size="16" text-anchor="middle" fill="${TEAL}">Ω</text><rect x="319" y="168" width="12" height="40" fill="#ffd400" opacity=".2" stroke="#ffd400"/>
    <text x="325" y="144" ${F} font-size="10" text-anchor="middle" fill="#cfd8e0">ЗАЛ ИСПЫТАНИЙ</text>
    <!-- в щели под дверью — два огня на высоте двух метров -->
    <circle cx="300" cy="300" r="18" fill="url(#teal8)"/>
    <!-- щит турелей -->
    <rect x="560" y="196" width="140" height="136" fill="#1a1e22" stroke="#cfd8e0" stroke-width="3"/><rect x="572" y="208" width="116" height="62" fill="#071016" stroke="#2c4753"/>
    <g stroke="#3a4650" stroke-width="2" fill="none"><path d="M580 222h20v14h20M580 248h30v-12M620 236h24v10h20"/></g>${[[600, 222], [620, 236], [644, 240]].map(([x, y]) => `<rect x="${x}" y="${y - 6}" width="18" height="12" fill="#13232c" stroke="#9fd"/>`).join('')}
    <circle cx="676" cy="232" r="6" fill="#ffd400" filter="url(#glowS)"/><circle cx="676" cy="254" r="6" fill="#1a1a1a" stroke="${RED}" stroke-width="2"/>
    ${range(4).map(i => `<rect x="${578 + i * 28}" y="286" width="18" height="30" rx="3" fill="#0d1a22" stroke="#9fd"/><rect x="${582 + i * 28}" y="${i % 2 ? 300 : 290}" width="10" height="12" fill="#555"/>`).join('')}
    <!-- турели под потолком -->
    ${[120, 680].map(x => `<rect x="${x - 20}" y="30" width="40" height="18" fill="#222" stroke="#888"/><circle cx="${x}" cy="56" r="12" fill="#2a2a2a" stroke="#888" stroke-width="2"/><path d="M${x} 56l${x < 400 ? 26 : -26} 24" stroke="#444" stroke-width="7"/><circle cx="${x}" cy="56" r="3" fill="${RED}"/>`).join('')}
    <!-- столик с папкой -->
    <path d="M40 300H170V312H40Z" fill="#3a2a1c" stroke="#cfd8e0" stroke-width="2"/><path d="M50 312V390M160 312V390" stroke="#cfd8e0" stroke-width="4"/>
    <g transform="rotate(-6 104 288)"><rect x="74" y="272" width="64" height="28" fill="#d9b25a" stroke="#000" stroke-width="1.5"/><text x="106" y="290" ${F} font-size="8" text-anchor="middle" fill="#000">ЛИГА · Р.</text></g>
    <rect x="58" y="286" width="12" height="14" rx="2" fill="#fff" stroke="#000"/>
    <!-- мягкий пол с разметкой -->
    <path d="M0 330H800" stroke="#cfd8e0" stroke-width="3"/><rect y="332" width="800" height="168" fill="#121518"/>
    <g stroke="#1e2329" stroke-width="2">${range(10).map(i => `<path d="M${i * 90} 332L${i * 90 - 50} 500"/>`).join('')}</g>
    <path d="M40 380H760" stroke="${RED}" stroke-width="3" opacity=".45"/>
    ${marker(480, 492, 4)}
    `);
  }

  /* ---------- сюжетные панели ---------- */
  function splash8() {
    const q = rng(81);
    return S(`
    <rect width="800" height="420" fill="url(#sky8)"/>
    ${range(14).map(i => `<ellipse cx="${f1(560 + q() * 240)}" cy="${f1(80 + q() * 160)}" rx="${f1(40 + q() * 60)}" ry="${f1(14 + q() * 20)}" fill="#3a2e30" opacity=".7"/>`).join('')}
    <g fill="#140c0c">${range(12).map(i => `<rect x="${560 + i * 22}" y="${300 - 40 - (i * 37) % 90}" width="18" height="160"/>`).join('')}</g>
    ${[600, 690, 760].map(x => `<path d="M${x} ${250 - (x % 7) * 6}q6 -24 12 0q6 -18 12 0" fill="#ff8a2a"/><circle cx="${x + 12}" cy="${240 - (x % 7) * 6}" r="40" fill="url(#fireGlow)"/>`).join('')}
    <!-- залив и остров -->
    <rect y="300" width="800" height="120" fill="#06080a"/>${range(16).map(i => `<path d="M${i * 50} ${320 + (i % 4) * 22}h${20 + (i % 3) * 10}" stroke="#3a2a2a" stroke-width="2"/>`).join('')}
    <path d="M40 310Q160 270 330 280Q460 290 520 312Z" fill="#0a0b0c"/>
    <!-- силуэт лечебницы -->
    <g fill="#050506">
      <path d="M110 300V200L150 170L190 200V300Z"/><path d="M190 300V150H240V300Z"/><path d="M215 150V100L230 84L245 100V150Z"/><path d="M240 300V190H380V300Z"/>
      ${range(6).map(i => `<path d="M${250 + i * 22} 190l11 -18l11 18z"/>`).join('')}
      <path d="M380 300V214H460V300Z"/><path d="M420 214V160h12v54z"/>
    </g>
    ${range(24).map(i => `<rect x="${200 + (i * 37) % 250}" y="${210 + (i * 13) % 70}" width="5" height="8" fill="${i % 5 ? '#3a3a30' : '#ffd77a'}"/>`).join('')}
    <!-- прожекторы мечутся: побег -->
    <path d="M232 92L60 0H120Z" fill="#fff4c8" opacity=".1"/><path d="M426 160L560 0H600Z" fill="#fff4c8" opacity=".08"/>
    <circle cx="232" cy="92" r="6" fill="#fff4c8"/><circle cx="426" cy="160" r="5" fill="#ff2a2a"/>
    <path d="M150 0l-30 90l20 -6l-36 80" stroke="#e8f0ff" stroke-width="3" fill="none" opacity=".75"/>
    <!-- мост -->
    <path d="M460 300L800 260" stroke="#111" stroke-width="10"/>${range(10).map(i => `<path d="M${470 + i * 34} ${299 - i * 4}v-26" stroke="#111" stroke-width="3"/>`).join('')}
    <rect x="0" y="0" width="800" height="420" fill="url(#ht)" opacity=".04"/>
    `, '0 0 800 420');
  }
  function rescueNight() {
    const q = rng(23);
    return S(`
    <rect width="800" height="420" fill="url(#sky8)"/>
    ${range(10).map(i => `<ellipse cx="${f1(100 + i * 70 + q() * 40)}" cy="${f1(60 + q() * 80)}" rx="${f1(60 + q() * 50)}" ry="${f1(20 + q() * 18)}" fill="#3a3034" opacity=".75"/>`).join('')}
    <path d="M520 420V120H640V420Z" fill="#0a0707"/>${range(10).map(r => range(4).map(c => `<rect x="${530 + c * 28}" y="${130 + r * 28}" width="14" height="16" fill="${r < 4 ? '#ff8a2a' : '#2a120e'}" opacity=".85"/>`).join('')).join('')}
    <path d="M512 124q10 -40 20 -6q10 -50 22 -4q12 -40 22 0q10 -30 22 -6q10 -30 22 6Z" fill="${RED}"/><path d="M526 124q8 -22 16 -4q8 -26 16 0q8 -20 16 0q8 -16 16 4Z" fill="#ffd23f"/>
    <circle cx="580" cy="160" r="140" fill="url(#fireGlow)"/>
    <!-- лестница пожарной машины и струя -->
    <path d="M200 380L470 200" stroke="#cfcfcf" stroke-width="10"/><path d="M200 380L470 200" stroke="#888" stroke-width="2" stroke-dasharray="4 10"/>
    <path d="M470 200Q520 160 540 190" stroke="#bfe9ff" stroke-width="6" fill="none" opacity=".8"/><path d="M470 200Q512 150 548 176" stroke="#e6fbff" stroke-width="2" fill="none"/>
    <rect x="80" y="350" width="220" height="50" fill="#a01822" stroke="#000" stroke-width="3"/><rect x="250" y="330" width="60" height="40" fill="#a01822" stroke="#000" stroke-width="3"/><rect x="258" y="338" width="40" height="18" fill="#9fc0d8"/>${[110, 170, 270].map(x => `<circle cx="${x}" cy="404" r="16" fill="#111" stroke="#555" stroke-width="3"/>`).join('')}<rect x="80" y="372" width="230" height="5" fill="#eee"/>
    <!-- полицейская лента и люди, которых выводят -->
    <path d="M0 360L800 340" stroke="#ffd400" stroke-width="6"/>${range(16).map(i => `<path d="M${i * 50 + 10} ${360 - i * 1.25}l14 0" stroke="#000" stroke-width="4"/>`).join('')}
    ${range(6).map(i => { const x = 360 + i * 36, h = 60 + (i % 3) * 8; return `<path d="M${x} 420V${420 - h + 18}Q${x} ${420 - h} ${x + 9} ${420 - h}Q${x + 18} ${420 - h} ${x + 18} ${420 - h + 18}V420Z" fill="#050505"/><circle cx="${x + 9}" cy="${420 - h - 8}" r="8" fill="#050505"/>`; }).join('')}
    <path d="M370 360q20 -10 40 0" stroke="#e8e2d0" stroke-width="10" fill="none" opacity=".8"/>
    <!-- тросы в небе: город держат не только пожарные -->
    <path d="M0 40L300 160" stroke="#cfd8e0" stroke-width="1.5"/><path d="M800 70L660 200" stroke="#cfd8e0" stroke-width="1.5"/><path d="M60 0L180 150" stroke="#cfd8e0" stroke-width="1.5" opacity=".6"/>
    <g fill="#8a7a74" opacity=".7">${range(50).map(() => `<rect x="${f1(q() * 800)}" y="${f1(q() * 420)}" width="2" height="2"/>`).join('')}</g>
    `, '0 0 800 420');
  }
  function arkhamGate() {
    return S(`
    <rect width="800" height="420" fill="#08090c"/>
    ${rainLines(0, 0, 800, 420, 90, 12, '#3a4a5a')}
    <path d="M90 420L400 40L710 420" fill="#fff4c8" opacity=".04"/>
    <!-- ворота распахнуты -->
    <path d="M150 420V120H190V420Z" fill="#141414" stroke="#555" stroke-width="2"/><path d="M610 420V120H650V420Z" fill="#141414" stroke="#555" stroke-width="2"/>
    <circle cx="170" cy="112" r="16" fill="#141414" stroke="#555" stroke-width="2"/><circle cx="630" cy="112" r="16" fill="#141414" stroke="#555" stroke-width="2"/>
    <g stroke="#2a2a2a" stroke-width="5">${range(8).map(i => `<path d="M${200 + i * 14} ${160 + i * 6}V${400 + i * 2}"/>`).join('')}${range(8).map(i => `<path d="M${600 - i * 14} ${160 + i * 6}V${400 + i * 2}"/>`).join('')}</g>
    <path d="M190 150Q400 60 610 150" stroke="#2a2a2a" stroke-width="8" fill="none"/>
    <text x="400" y="128" ${F} font-size="20" text-anchor="middle" fill="#3a3a3a" letter-spacing="6">ЛЕЧЕБНИЦА</text>
    <!-- двор: тени дерущихся вдалеке -->
    <path d="M250 300H560V330H250Z" fill="#0d0f12"/><path d="M300 300V230H500V300Z" fill="#0b0c0e"/>${range(10).map(i => `<rect x="${310 + i * 18}" y="${244 + (i % 2) * 20}" width="8" height="12" fill="${i % 3 ? '#2a2a20' : '#ffd77a'}"/>`).join('')}
    ${range(7).map(i => { const x = 300 + i * 34, y = 330; return `<path d="M${x} ${y}l6 -30l6 30M${x + 6} ${y - 30}v-14M${x - 4} ${y - 38}l10 -2l10 6" stroke="#000" stroke-width="5" stroke-linecap="round"/><circle cx="${x + 6}" cy="${y - 50}" r="5" fill="#000"/>`; }).join('')}
    <circle cx="420" cy="200" r="4" fill="#ff2a2a"/><circle cx="420" cy="200" r="120" fill="url(#red8)"/>
    <!-- мотоцикл Робина у ворот -->
    <g transform="translate(690 360)"><circle cx="-40" cy="30" r="22" fill="#111" stroke="#666" stroke-width="4"/><circle cx="40" cy="30" r="22" fill="#111" stroke="#666" stroke-width="4"/><path d="M-40 30L-10 0H24L40 30M-6 0L6 -16H30" stroke="#a01822" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M28 -16l10 -8" stroke="#888" stroke-width="4"/><circle cx="36" cy="-6" r="4" fill="#fff4c8"/></g>
    <rect y="400" width="800" height="20" fill="#050505"/>
    `, '0 0 800 420');
  }
  function speakerPanel() {
    return S(`
    <rect width="800" height="420" fill="#0b0f11"/>
    <g stroke="#131a1d" stroke-width="2">${range(18).map(i => `<path d="M0 ${i * 24}H800"/>`).join('')}${range(34).map(i => `<path d="M${i * 24} 0V420"/>`).join('')}</g>
    ${speaker(230, 190, 3.2, true)}
    <path d="M0 360H800" stroke="#1a2226" stroke-width="6"/>
    <text x="620" y="120" ${F} font-size="68" text-anchor="middle" fill="${TEAL}" opacity=".2">Ω</text>
    <g fill="${TEAL}" opacity=".7">${range(30).map(i => `<rect x="${470 + i * 10}" y="${300 - Math.abs(Math.sin(i * 0.9)) * (20 + (i * 13) % 40)}" width="6" height="${(Math.abs(Math.sin(i * 0.9)) * (20 + (i * 13) % 40)) * 2}"/>`).join('')}</g>
    `, '0 0 800 420');
  }
  function omegaReveal() {
    return S(`
    <rect width="800" height="420" fill="#0a0c0f"/>
    ${range(16).map(x => `<rect x="${x * 50}" y="0" width="50" height="360" fill="${x % 2 ? '#10151a' : '#0d1116'}"/>`).join('')}
    <path d="M400 0L250 360H550Z" fill="#dcfff5" opacity=".06"/>
    <rect x="300" y="12" width="200" height="70" fill="#05080a" stroke="#cfd8e0" stroke-width="3"/><rect x="350" y="20" width="100" height="54" fill="#ece6d6"/>
    <g fill="#140d0d"><ellipse cx="388" cy="46" rx="10" ry="8"/><ellipse cx="412" cy="46" rx="10" ry="8"/><ellipse cx="400" cy="56" rx="4" ry="14"/><ellipse cx="380" cy="62" rx="6" ry="4"/><ellipse cx="420" cy="62" rx="6" ry="4"/></g>
    <path d="M0 360H800" stroke="#cfd8e0" stroke-width="3"/><rect y="362" width="800" height="58" fill="#121518"/>
    ${omegaFig(400, 360, .7)}
    `, '0 0 800 420');
  }
  function omegaDown() {
    return S(`
    <rect width="800" height="420" fill="#0a0c0f"/>
    ${range(16).map(x => `<rect x="${x * 50}" y="0" width="50" height="360" fill="${x % 2 ? '#10151a' : '#0d1116'}"/>`).join('')}
    <rect x="300" y="12" width="200" height="70" fill="#05080a" stroke="#cfd8e0" stroke-width="3"/><rect x="350" y="20" width="100" height="54" fill="#0a0a0a"/><text x="400" y="52" ${MONO} font-size="9" text-anchor="middle" fill="#555">НЕТ СИГНАЛА</text>
    <path d="M0 360H800" stroke="#cfd8e0" stroke-width="3"/><rect y="362" width="800" height="58" fill="#121518"/>
    ${omegaKneel(420, 360, .82)}
    ${range(6).map(i => `<circle cx="${300 + i * 40}" cy="${380 + (i % 2) * 10}" r="2" fill="${TEAL}"/>`).join('')}
    <path d="M120 420L150 360" stroke="#c9b48a" stroke-width="8"/>
    `, '0 0 800 420');
  }
  function strangeOffice() {
    return S(`
    <rect width="800" height="420" fill="#0d0b09"/>
    <rect y="0" width="800" height="300" fill="#1f1a15"/><g stroke="#2a231c" stroke-width="2">${range(20).map(i => `<path d="M${i * 40} 0V300"/>`).join('')}</g>
    <!-- рамки с кляксами и дипломы -->
    ${[[80, 50], [180, 40], [600, 46], [690, 56]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="70" height="86" fill="#c8a64a" stroke="#000" stroke-width="2"/><rect x="${x + 6}" y="${y + 6}" width="58" height="74" fill="${i % 2 ? PAPER : '#ece6d6'}"/>${i % 2 ? `<path d="M${x + 14} ${y + 24}h42M${x + 14} ${y + 34}h36M${x + 14} ${y + 44}h40" stroke="#555" stroke-width="1.5"/><circle cx="${x + 35}" cy="${y + 62}" r="8" fill="none" stroke="${RED}" stroke-width="2"/>` : `<g fill="#140d0d"><ellipse cx="${x + 27}" cy="${y + 40}" rx="8" ry="12"/><ellipse cx="${x + 43}" cy="${y + 40}" rx="8" ry="12"/><ellipse cx="${x + 35}" cy="${y + 56}" rx="3" ry="12"/></g>`}`).join('')}
    <!-- картотечные шкафы и мониторы -->
    <rect x="20" y="170" width="110" height="150" fill="#3a3a32" stroke="#cfd8e0" stroke-width="2"/>${range(3).map(i => `<rect x="30" y="${180 + i * 46}" width="90" height="38" fill="#4a4a42" stroke="#222"/><rect x="66" y="${194 + i * 46}" width="18" height="6" fill="#ccc"/>`).join('')}
    ${[[540, 150], [620, 150], [700, 150]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="72" height="52" rx="3" fill="#111" stroke="#cfd8e0" stroke-width="2"/><rect x="${x + 5}" y="${y + 5}" width="62" height="40" fill="${['#0b2a33', '#1a0a0a', '#0b2a33'][i]}"/>${i === 1 ? `<text x="${x + 36}" y="${y + 30}" ${F} font-size="16" text-anchor="middle" fill="${TEAL}">Ω</text>` : `<path d="M${x + 10} ${y + 32}l12 -10l10 6l14 -14l12 8" stroke="#9fd" stroke-width="1.5" fill="none"/>`}`).join('')}
    <!-- стол, лампа, кресло спинкой к нам -->
    <path d="M160 300H640V318H160Z" fill="#4a2e1c" stroke="#cfd8e0" stroke-width="2.5"/><path d="M180 318V400M620 318V400" stroke="#cfd8e0" stroke-width="5"/>
    <path d="M520 300V250Q520 230 500 226" stroke="#c8a64a" stroke-width="4" fill="none"/><path d="M478 216l36 4l-6 16l-36 -4z" fill="#2a4a3a" stroke="#c8a64a" stroke-width="1.5"/><path d="M474 232L400 300H520L506 236Z" fill="#fff4c8" opacity=".14"/>
    <g transform="rotate(-4 300 290)"><rect x="260" y="280" width="80" height="18" fill="#d9b25a" stroke="#000"/><text x="300" y="293" ${F} font-size="8" text-anchor="middle" fill="#000">«ОБЪЕКТ Б»</text></g>
    <rect x="420" y="288" width="40" height="10" fill="#111"/><path d="M380 296l26 -6" stroke="#111" stroke-width="3"/>
    <path d="M300 420V250Q300 196 400 196Q500 196 500 250V420Z" fill="#2a0e0e" stroke="#000" stroke-width="4"/><path d="M320 420V260Q320 214 400 214Q480 214 480 260V420" fill="none" stroke="#4a1a1a" stroke-width="3"/>${range(5).map(i => `<circle cx="${330 + i * 35}" cy="${236 + Math.abs(2 - i) * 6}" r="3" fill="#c8a64a"/>`).join('')}
    <rect y="400" width="800" height="20" fill="#0a0806"/>
    `, '0 0 800 420');
  }
  function cuffs() {
    return S(`
    <rect width="800" height="420" fill="#2a1d14"/><g stroke="#3a2a1c" stroke-width="2">${range(10).map(i => `<path d="M0 ${i * 44}H800"/>`).join('')}</g>
    <rect width="800" height="420" fill="url(#lampGlow)" opacity=".3"/>
    <!-- карточка с кляксой и перьевая ручка -->
    <g transform="rotate(-8 640 120)"><rect x="580" y="60" width="120" height="120" fill="#ece6d6" stroke="#000" stroke-width="2"/><g fill="#140d0d"><ellipse cx="622" cy="112" rx="18" ry="24"/><ellipse cx="658" cy="112" rx="18" ry="24"/><ellipse cx="640" cy="138" rx="6" ry="20"/><circle cx="604" cy="92" r="4"/><circle cx="676" cy="92" r="4"/></g></g>
    <path d="M90 360L250 300" stroke="#111" stroke-width="10" stroke-linecap="round"/><path d="M240 304l16 -6" stroke="#c8a64a" stroke-width="10" stroke-linecap="round"/>
    <!-- рукава белого халата, запястья в наручниках -->
    <path d="M0 250L250 200L270 290L0 340Z" fill="#f1ecdf" stroke="#000" stroke-width="3"/><path d="M0 330L800 330" stroke="none"/>
    <path d="M800 230L560 196L540 288L800 330Z" fill="#f1ecdf" stroke="#000" stroke-width="3"/>
    <path d="M240 210L262 286M548 200L540 284" stroke="#bbb" stroke-width="5"/>
    <path d="M262 214Q320 206 330 236Q338 268 300 286Q270 292 262 270Z" fill="#e2c3a4" stroke="#000" stroke-width="3"/>
    <path d="M538 206Q480 198 470 228Q462 262 500 282Q530 288 540 266Z" fill="#e2c3a4" stroke="#000" stroke-width="3"/>
    <g fill="none" stroke="#cfd8e0" stroke-width="9"><ellipse cx="300" cy="250" rx="26" ry="34"/><ellipse cx="500" cy="244" rx="26" ry="34"/></g>
    <g fill="none" stroke="#7a8590" stroke-width="3"><ellipse cx="300" cy="250" rx="26" ry="34"/><ellipse cx="500" cy="244" rx="26" ry="34"/></g>
    <path d="M326 246Q400 270 474 240" stroke="#cfd8e0" stroke-width="5" fill="none" stroke-dasharray="8 3"/>
    <rect x="316" y="230" width="18" height="28" rx="3" fill="#9aa4ae" stroke="#000" stroke-width="2"/><rect x="466" y="226" width="18" height="28" rx="3" fill="#9aa4ae" stroke="#000" stroke-width="2"/>
    `, '0 0 800 420');
  }
  function officeDoor() {
    return S(`
    <rect width="800" height="420" fill="#0d0b09"/><rect y="0" width="800" height="330" fill="#1f1a15"/>
    <g stroke="#2a231c" stroke-width="2">${range(20).map(i => `<path d="M${i * 40} 0V330"/>`).join('')}</g>
    <path d="M300 330V40H500V330Z" fill="#dcd6c6"/><path d="M300 330V40H500V330" fill="url(#lampGlow)" opacity=".6"/>
    <path d="M300 40L230 60V350L300 330Z" fill="#3a2a1c" stroke="#000" stroke-width="3"/><circle cx="246" cy="200" r="5" fill="#c8a64a"/>
    <path d="M300 330L120 420H680L500 330Z" fill="#fff4c8" opacity=".12"/>
    ${range(30).map(i => `<circle cx="${310 + (i * 37) % 180}" cy="${60 + (i * 53) % 260}" r="${1 + (i % 3)}" fill="#fff" opacity=".35"/>`).join('')}
    <path d="M296 120l-30 -10M296 200l-26 4M296 280l-30 8" stroke="#8a7a64" stroke-width="2"/>
    <rect y="330" width="800" height="90" fill="#0a0806"/><path d="M0 330H800" stroke="#5a4a3a" stroke-width="3"/>
    `, '0 0 800 420');
  }
  function arkhamGates() {
    return S(`
    <rect width="800" height="420" fill="#0a0b0e"/>${rainLines(0, 0, 800, 420, 80, 31, '#3a4a5a')}
    <path d="M60 420V140H90V420ZM710 420V140H740V420Z" fill="#141414"/>
    <path d="M90 170Q400 90 710 170" stroke="#2a2a2a" stroke-width="8" fill="none"/>
    <!-- полицейская машина -->
    <g transform="translate(260 300)"><path d="M0 60V30L40 0H200L250 30H300V60Z" fill="#111" stroke="#cfd8e0" stroke-width="3"/><path d="M50 8H190L230 30H40Z" fill="#9fc0d8" opacity=".5"/><rect x="0" y="34" width="300" height="10" fill="#e8e8e8"/><text x="150" y="58" ${F} font-size="14" text-anchor="middle" fill="#e8e8e8">ПОЛИЦИЯ</text>
      <circle cx="60" cy="64" r="22" fill="#111" stroke="#555" stroke-width="4"/><circle cx="240" cy="64" r="22" fill="#111" stroke="#555" stroke-width="4"/><rect x="100" y="-10" width="30" height="10" fill="#ff2a2a"/><rect x="130" y="-10" width="30" height="10" fill="#3a6bff"/></g>
    <circle cx="375" cy="292" r="120" fill="url(#red8)"/><circle cx="405" cy="292" r="90" fill="#3a6bff" opacity=".08"/>
    <path d="M560 200L800 0V60Z" fill="#fff4c8" opacity=".05"/>
    <rect y="384" width="800" height="36" fill="#050505"/><ellipse cx="400" cy="400" rx="300" ry="8" fill="#ff2a2a" opacity=".12"/>
    `, '0 0 800 420');
  }
  function cityDawn() {
    const q = rng(55);
    return S(`
    <rect width="800" height="420" fill="url(#dawn8)"/>
    <circle cx="620" cy="330" r="60" fill="#ffd8a0" opacity=".8"/><circle cx="620" cy="330" r="140" fill="#ffd8a0" opacity=".15"/>
    ${range(5).map(k => { const x = 80 + k * 160; return range(6).map(i => `<ellipse cx="${f1(x + i * 18 + q() * 16)}" cy="${f1(220 - i * 30)}" rx="${f1(24 + i * 12)}" ry="${f1(12 + i * 6)}" fill="#4a4448" opacity="${f1(.55 - i * .06)}"/>`).join(''); }).join('')}
    <g fill="#1a1418">${range(30).map(i => { const h = 50 + q() * 120; return `<rect x="${i * 28 - 6}" y="${340 - h}" width="${20 + q() * 12}" height="${h + 80}"/>`; }).join('')}</g>
    ${range(30).map(i => `<rect x="${f1(q() * 800)}" y="${f1(240 + q() * 90)}" width="3" height="4" fill="#ffd77a" opacity=".6"/>`).join('')}
    <path d="M0 340H800V420H0Z" fill="#100c0e"/>
    <path d="M0 330L800 300" stroke="#0a0808" stroke-width="2"/>
    <path d="M140 0L330 210" stroke="#1a1418" stroke-width="2"/><path d="M180 0L350 214" stroke="#1a1418" stroke-width="1.5"/>
    `, '0 0 800 420');
  }
  function strangePC() {
    return S(`
    <rect width="800" height="420" fill="#050505"/>
    <rect x="80" y="20" width="640" height="360" rx="10" fill="#111" stroke="#cfd8e0" stroke-width="4"/><rect x="96" y="36" width="608" height="328" fill="#04110f"/>
    <g stroke="#0c2a26" stroke-width="1">${range(16).map(i => `<path d="M${96 + i * 38} 36V364"/>`).join('')}${range(9).map(i => `<path d="M96 ${36 + i * 41}H704"/>`).join('')}</g>
    <text x="110" y="58" ${MONO} font-size="12" fill="${TEAL}">ПРОЕКТ «ЗАРЯ» · ЗАРЯДЫ</text>
    <path d="M120 300Q260 250 360 280T560 250T690 290" stroke="#1d4a6a" stroke-width="10" fill="none"/>
    <g stroke="#1a5a50" stroke-width="2" fill="none"><path d="M140 120H660M200 80V340M330 80V340M470 80V340M600 80V340M140 220H660"/></g>
    ${[[230, 150], [360, 190], [440, 130], [520, 210], [610, 170]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="10" fill="none" stroke="${RED}" stroke-width="3"/><path d="M${x - 9} ${y - 9}L${x + 9} ${y + 9}M${x + 9} ${y - 9}L${x - 9} ${y + 9}" stroke="${RED}" stroke-width="3"/><text x="${x}" y="${y + 24}" ${MONO} font-size="8" text-anchor="middle" fill="${RED}">${i + 1} · ВЗОРВАН</text>`).join('')}
    <circle cx="170" cy="270" r="40" fill="#ff2a2a" opacity=".15"/><circle cx="170" cy="270" r="13" fill="#ff2a2a" filter="url(#glowS)"/><circle cx="170" cy="270" r="24" fill="none" stroke="#ff2a2a" stroke-width="2" stroke-dasharray="4 4"/>
    <rect x="200" y="248" width="230" height="46" fill="#000" stroke="#ff2a2a" stroke-width="2"/><text x="212" y="266" ${MONO} font-size="11" fill="#ff8a96">ЗАРЯД №6 · ОСОБНЯК УЭЙНОВ</text><text x="212" y="284" ${MONO} font-size="11" fill="#ff2a2a">СТАТУС: ВЗВЕДЁН</text>
    <text x="690" y="352" ${MONO} font-size="9" text-anchor="end" fill="${TEAL}">Д-Р Х. СТРЕНДЖ · СЕАНС НЕ ОКОНЧЕН</text>
    <path d="M370 380v20h60v-20" stroke="#cfd8e0" stroke-width="4" fill="none"/>
    `, '0 0 800 420');
  }
  // чертёж Омеги для пятнашек (без внешних ссылок — рисуется в data-URL)
  function omegaPlan() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="#0b2a4a"/>
      <g stroke="#13406a" stroke-width="1">${range(31).map(i => `<path d="M${i * 20} 0V600M0 ${i * 20}H600"/>`).join('')}</g>
      <rect x="10" y="10" width="580" height="580" fill="none" stroke="#e8f4ff" stroke-width="3"/>
      <text x="24" y="40" ${F} font-size="20" fill="#e8f4ff">ОБЪЕКТ Ω · ЛИСТ 1</text><text x="24" y="60" ${MONO} font-size="11" fill="#9fd0ff">РОСТ 203 СМ · МАССА 118 КГ</text>
      ${omegaFig(300, 570, 1.25, { blueprint: true })}
      <g ${MONO} font-size="12" fill="#e8f4ff" stroke="none">
        <text x="400" y="104">КОРА МОЗГА</text><text x="400" y="118" fill="#9fd0ff">ДНК Э. НИГМЫ</text>
        <text x="420" y="250">МЫШЦЫ</text><text x="420" y="264" fill="#9fd0ff">СЫВОРОТКА «ВЕНОМ»</text>
        <text x="30" y="300">РЕГЕНЕРАЦИЯ</text><text x="30" y="314" fill="#9fd0ff">ДНК С. ГРАНДИ</text>
        <text x="30" y="130">СЕНСОРЫ ×20</text><text x="30" y="144" fill="#9fd0ff">КОСТЮМ V.7</text>
        <text x="380" y="470" fill="#ff8a96">СЛАБОЕ МЕСТО:</text><text x="380" y="486" fill="#ff8a96">ВСПЫШКА —</text><text x="380" y="502" fill="#ff8a96">БОЛЕВОЙ ШОК</text>
      </g>
      <g stroke="#e8f4ff" stroke-width="1.5" fill="none"><path d="M396 108H340L320 82"/><path d="M416 254H360L340 230"/><path d="M130 304H190L215 280"/><path d="M130 134H230L262 112"/><path d="M376 474H330L300 116" stroke="#ff8a96" stroke-dasharray="5 4"/></g>
    </svg>`;
  }

  Object.assign(window.Art, { omegaFig, c8s1, c8s2, c8s3, c8s4, splash8, rescueNight, arkhamGate, speakerPanel, omegaReveal, omegaDown, strangeOffice, cuffs, officeDoor, arkhamGates, cityDawn, strangePC, omegaPlan });
})();
