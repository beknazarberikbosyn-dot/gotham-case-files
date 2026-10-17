/* Графика кампании, глава I, дело 2 «Лицо друга»: Брюс Уэйн, Хаш, больница, хранилище, особняк Эллиотов, кладбище, карусель. */
(function () {
  const A = window.Art;
  const { svg, range, rng, rainLines, batShadow, marker } = A;
  const RED = A.RED;
  const F = 'font-family="Russo One, Arial Black, sans-serif"';
  const MONO = 'font-family="monospace"';
  const PAPER = '#f1ecdf', BAND = '#f2eee2';
  const f1 = n => (+n).toFixed(1);
  let UID = 0;
  const uid = p => p + (++UID);

  /* ---------- лицо Брюса Уэйна (и его копия) ---------- */
  const FACE = 'M-36 -20Q-38 -58 0 -60Q38 -58 36 -20L35 4Q34 24 24 38Q12 52 0 52Q-12 52 -24 38Q-34 24 -35 4Z';
  const SKIN = '#fff';
  /* Брюс Уэйн: зачёсанные назад чёрные волосы с прядью, тяжёлые брови, квадратный подбородок с ямкой */
  function bruceFace(o) {
    o = o || {};
    const p = o.part === 'right' ? -1 : 1; // зеркалим пробор и прядь
    const skin = o.skin || SKIN;
    return `<ellipse cx="-39" cy="-6" rx="7" ry="13" fill="${skin}" stroke="#000" stroke-width="2.4"/><ellipse cx="39" cy="-6" rx="7" ry="13" fill="${skin}" stroke="#000" stroke-width="2.4"/>
      <path d="M-41 -8q4 -4 4 4M41 -8q-4 -4 -4 4" stroke="#000" stroke-width="1.4" fill="none"/>
      <path d="${FACE}" fill="${skin}" stroke="#000" stroke-width="2.8"/>
      ${o.flat ? '' : `<path d="M12 -59Q38 -56 36 -20L35 4Q34 24 24 38Q16 46 8 50Q22 30 24 4Q26 -36 12 -59Z" fill="url(#htk)" opacity=".5"/>`}
      <path d="M22 6Q28 18 24 32M-22 6Q-27 16 -24 28" stroke="#000" stroke-width="1.4" fill="none" opacity=".55"/>
      <g transform="scale(${p} 1)">
        <path d="M-42 -16Q-48 -72 -6 -78Q34 -82 44 -50Q48 -34 41 -16Q40 -38 31 -46Q20 -56 2 -55Q-18 -54 -28 -46Q-38 -36 -42 -16Z" fill="#0d0d0d" stroke="#000" stroke-width="2"/>
        <path d="M-6 -55Q-18 -48 -14 -34Q-8 -44 2 -50Z" fill="#0d0d0d"/>
        <path d="M-20 -70Q-19 -63 -17 -56" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <g stroke="#fff" stroke-width="1.6" fill="none" opacity=".55"><path d="M-14 -72Q10 -78 34 -58"/><path d="M-10 -66Q12 -70 30 -52"/><path d="M-36 -40Q-36 -58 -26 -66"/></g>
      </g>
      <path d="M-31 -27Q-20 -34 -6 -27M31 -27Q20 -34 6 -27" stroke="#000" stroke-width="5.5" fill="none" stroke-linecap="round"/>
      <path d="M-28 -15Q-18 -22 -8 -15Q-18 -10 -28 -15ZM28 -15Q18 -22 8 -15Q18 -10 28 -15Z" fill="#fff" stroke="#000" stroke-width="1.8"/>
      <circle cx="-17" cy="-15.5" r="3.2"/><circle cx="17" cy="-15.5" r="3.2"/><circle cx="-16" cy="-16.5" r="1" fill="#fff"/><circle cx="18" cy="-16.5" r="1" fill="#fff"/>
      <path d="M-29 -15Q-18 -24 -7 -16M29 -15Q18 -24 7 -16" stroke="#000" stroke-width="2.6" fill="none"/>
      <path d="M-25 -8Q-18 -6 -11 -8M25 -8Q18 -6 11 -8" stroke="#000" stroke-width="1" fill="none" opacity=".5"/>
      <path d="M2 -14L-4 9Q2 14 9 9" stroke="#000" stroke-width="2.6" fill="none" stroke-linejoin="round"/><path d="M8 -6Q12 2 9 8" stroke="#000" stroke-width="1" fill="none" opacity=".5"/>
      <path d="M-15 22Q0 28 15 21" stroke="#000" stroke-width="2.8" fill="none" stroke-linecap="round"/><path d="M15 21l3 -3" stroke="#000" stroke-width="2" stroke-linecap="round"/>
      <path d="M-6 30Q0 32 6 30" stroke="#000" stroke-width="1.4" fill="none" opacity=".6"/>
      <path d="M-2 42Q0 47 2 42" stroke="#000" stroke-width="1.6" fill="none"/>
      ${o.scar ? `<path d="M-10 40Q0 44 10 39" stroke="${RED}" stroke-width="1.8" fill="none"/><path d="M-7 37v6M-3 38v6M1 38v6M5 37v6M9 36v6" stroke="#000" stroke-width="1.2"/>` : ''}`;
  }
  /* голова в бинтах: широкие витки поверх лица; reveal — бинт размотан со щеки и подбородка */
  const HEADP = 'M-38 -20Q-41 -66 0 -70Q41 -66 38 -20L37 4Q36 26 25 40Q12 54 0 54Q-12 54 -25 40Q-36 26 -37 4Z';
  function hushHead(o) {
    o = o || {};
    const cid = uid('hb'), sid = uid('hs');
    // область бинтов: при reveal правый низ размотан ступеньками по виткам
    const area = o.reveal
      ? 'M-60 -90H60V0H40L30 4L22 2V14H12L6 12V26H0L-2 30V70H-60Z'
      : 'M-60 -90H60V70H-60Z';
    const bands = [-70, -58, -46, -34, -22, -10, 2, 14, 26, 38, 50].map((y, i) => {
      const t = (i % 2 ? 1 : -1) * 4;
      const d = `M-50 ${y + t}Q0 ${y - t - 2} 50 ${y + t + 3}`;
      return `<path d="${d}" stroke="#000" stroke-width="14" fill="none"/><path d="${d}" stroke="${BAND}" stroke-width="11.5" fill="none"/><path d="M-50 ${y + t + 3}Q0 ${y - t + 1} 50 ${y + t + 6}" stroke="#cfc7b2" stroke-width="2" fill="none"/>`;
    }).join('');
    return `<defs><clipPath id="${cid}"><path d="${HEADP}"/></clipPath><clipPath id="${sid}"><path d="${area}"/></clipPath></defs>
      ${o.reveal ? `<g clip-path="url(#${cid})">${bruceFace({ part: 'right', scar: true, flat: true, skin: '#ecd4bf' })}</g><path d="${HEADP}" fill="none" stroke="#000" stroke-width="2.8"/>` : ''}
      <g clip-path="url(#${sid})">
        <path d="${HEADP}" fill="${BAND}"/>
        <g clip-path="url(#${cid})">${bands}
          <path d="M14 -68Q42 -62 38 -20L37 4Q36 26 25 40Q18 48 10 52Q26 26 26 -6Q26 -48 14 -68Z" fill="url(#htk)" opacity=".4"/>
          <path d="M-40 -24H40V-4H-40Z" fill="#141414"/>
          <path d="M-30 -14Q-18 -24 -6 -14Q-18 -6 -30 -14ZM30 -14Q18 -24 6 -14Q18 -6 30 -14Z" fill="#fff" stroke="#000" stroke-width="1.6"/>
          <circle cx="-18" cy="-14.5" r="3"/><circle cx="18" cy="-14.5" r="3"/>
          <path d="M-31 -21L-6 -17M31 -21L6 -17" stroke="#000" stroke-width="3.5" stroke-linecap="round"/>
        </g>
        <path d="${HEADP}" fill="none" stroke="#000" stroke-width="2.8"/>
      </g>
      ${o.reveal ? `<path d="M40 0L30 4L22 2V14H12L6 12V26H0L-2 30" stroke="#8a8270" stroke-width="1.4" fill="none" stroke-dasharray="2 2"/>
        <path d="M38 2Q52 16 46 40Q42 56 52 70Q56 80 50 92L40 88Q46 78 42 70Q32 54 36 36Q40 18 30 8Z" fill="${BAND}" stroke="#000" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M40 22Q44 30 41 42M44 60Q47 70 45 82" stroke="#cfc7b2" stroke-width="2" fill="none"/>` : ''}`;
  }
  /* Хаш на карусели: длинный тёмный плащ с поднятым воротником, ремень, перчатки; 0,0 — где сидит */
  function hushFig(x, y, k, o) {
    o = o || {};
    const sleeve = d => `<path d="${d}" stroke="#fff" stroke-width="27" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="#171717" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    const glove = (gx, gy, r) => `<g transform="translate(${gx} ${gy}) rotate(${r})"><path d="M-10 -8Q-12 8 -4 12H8Q14 8 12 -2L14 -10Q14 -14 10 -12L8 -6V-12Q6 -16 2 -12V-8Q0 -14 -4 -10Z" fill="#050505" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><path d="M-10 -2Q-18 -6 -16 -12Q-12 -14 -8 -8" fill="#050505" stroke="#fff" stroke-width="1.8"/></g>`;
    return `<g transform="translate(${x} ${y}) scale(${k})">
      ${sleeve('M-44 -130Q-62 -86 -56 -40Q-54 -22 -40 -14')}${sleeve('M44 -130Q62 -86 56 -40Q54 -22 40 -14')}
      <path d="M-46 -134Q-52 -70 -42 0H42Q52 -70 46 -134Q26 -148 0 -148Q-26 -148 -46 -134Z" fill="#171717" stroke="#fff" stroke-width="3"/>
      <path d="M-46 -134Q-52 -70 -42 0H-24Q-32 -70 -28 -140Z" fill="url(#hatch)" opacity=".08"/>
      <path d="M-30 -146L-6 -96L0 -128L6 -96L30 -146L38 -170L14 -150H-14L-38 -170Z" fill="#0b0b0b" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M-14 -148Q0 -138 14 -148L12 -128Q0 -122 -12 -128Z" fill="#5a0e16" stroke="#000" stroke-width="1.5"/>
      <path d="M-6 -96L-14 -60M6 -96L14 -60" stroke="#fff" stroke-width="1.6" opacity=".6"/>
      ${[-80, -60].map(yy => `<circle cx="-12" cy="${yy}" r="3" fill="#777"/><circle cx="12" cy="${yy}" r="3" fill="#777"/>`).join('')}
      <path d="M-46 -40H46" stroke="#fff" stroke-width="2"/><path d="M-46 -40H46V-30H-46Z" fill="#0b0b0b" stroke="#fff" stroke-width="2"/><rect x="-8" y="-42" width="16" height="14" fill="none" stroke="#c8c8c8" stroke-width="2.4"/>
      ${glove(-40, -14, 10)}${glove(40, -14, -10)}
      <g transform="translate(0 -196) scale(.78)">${hushHead({ reveal: o.reveal })}</g>
    </g>`;
  }

  /* ---------- кадры камеры: Уэйн и «Уэйн» ---------- */
  function bruceShot(after) {
    let h = `<rect width="400" height="260" fill="#16191b"/>
      <g stroke="#22272a" stroke-width="2">${range(14).map(i => `<line x1="0" y1="${i * 20}" x2="400" y2="${i * 20}"/>`).join('')}${range(21).map(i => `<line x1="${i * 20}" y1="0" x2="${i * 20}" y2="260"/>`).join('')}</g>
      <rect x="20" y="20" width="70" height="200" fill="#0d0f10" stroke="#555" stroke-width="2"/><rect x="310" y="20" width="70" height="200" fill="#0d0f10" stroke="#555" stroke-width="2"/>
      <text x="200" y="14" ${MONO} font-size="9" text-anchor="middle" fill="#888">ГОТЭМ-МЕРСИ · ВХОД В ОПЕРАЦИОННЫЙ БЛОК</text>`;
    // костюм
    h += `<path d="M110 260Q112 160 160 140L200 136L240 140Q288 160 290 260Z" fill="#111" stroke="#fff" stroke-width="2.5"/>
      <path d="M176 138L200 200L224 138Z" fill="#fff" stroke="#000" stroke-width="1.5"/>
      <path d="M176 138L190 186L168 160ZM224 138L210 186L232 160Z" fill="#000" stroke="#fff" stroke-width="1.5"/>
      <path d="M140 150Q112 166 106 232L132 234Q134 196 150 170Z" fill="#111" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/><path d="M260 150Q288 166 294 232L268 234Q266 196 250 170Z" fill="#111" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M106 230H132V238H106ZM268 230H294V238H268Z" fill="#fff" stroke="#000" stroke-width="1.5"/>
      <path d="M108 238Q102 254 110 262Q120 268 128 260Q134 250 130 238Z" fill="#fff" stroke="#000" stroke-width="2"/><path d="M114 250v8M120 250v9" stroke="#000" stroke-width="1"/>
      <path d="M292 238Q298 254 290 262Q280 268 272 260Q266 250 270 238Z" fill="#fff" stroke="#000" stroke-width="2"/><path d="M286 250v8M280 250v9" stroke="#000" stroke-width="1"/>
      <path d="M184 116h32v22h-32z" fill="#fff" stroke="#000" stroke-width="2"/>`;
    h += after
      ? `<path d="M194 140h12l-2 6l6 34l-10 10l-10 -10l6 -34z" fill="#333" stroke="#fff" stroke-width="1.2"/>`
      : `<path d="M186 140l14 7l14 -7v14l-14 -7l-14 7z" fill="#000" stroke="#fff" stroke-width="1.5"/><circle cx="200" cy="147" r="3" fill="#000" stroke="#fff" stroke-width="1"/>`;
    if (!after) h += `<circle cx="232" cy="176" r="5" fill="${RED}" stroke="#fff" stroke-width="1.5"/><path d="M232 171v10M227 176h10" stroke="#fff" stroke-width="1"/>`;
    if (!after) h += `<rect x="269" y="236" width="24" height="9" rx="2" fill="#bbb" stroke="#000" stroke-width="1.5"/><circle cx="281" cy="240.5" r="3.2" fill="#fff" stroke="#000" stroke-width="1"/>`;
    h += `<g transform="translate(200 82) scale(.98)">${bruceFace({ part: after ? 'right' : 'left', scar: after })}</g>`;
    h += `<rect width="400" height="260" fill="url(#ht)" opacity=".05"/>`;
    return svg(h, '0 0 400 260');
  }

  /* ---------- общие мелочи ---------- */
  const polaroid = (x, y, r, s) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s || 1})"><rect x="-14" y="-16" width="28" height="34" fill="${PAPER}" stroke="#000" stroke-width="1.2"/><rect x="-11" y="-13" width="22" height="22" fill="#2a2a2a"/><g transform="translate(0 -1) scale(.2)">${bruceFace({})}</g><path d="M-6 -20v6" stroke="#ddd" stroke-width="3"/></g>`;
  const cutPhoto = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-16" y="-20" width="32" height="40" fill="#e9e3d0" stroke="#000" stroke-width="1"/><path d="M-12 -14h24M-12 10h18M-12 14h14" stroke="#888" stroke-width="1"/><ellipse cx="0" cy="-2" rx="8" ry="10" fill="#0a0a0a"/><path d="M-10 18q10 -10 20 0" fill="#555"/></g>`;
  const gloveDrop = (x, y, r) => `<g transform="translate(${x} ${y}) scale(1 .7) rotate(${r})">
    <path d="M-12 18L-14 2Q-16 -4 -22 -10Q-26 -15 -21 -17Q-16 -18 -10 -8L-9 -24Q-9 -29 -5 -29Q-1 -29 -1 -24L-1 -30Q-1 -35 3 -35Q7 -35 7 -30L7 -26Q7 -31 11 -31Q15 -31 15 -26L15 -20Q15 -24 19 -24Q22 -24 22 -19L21 4Q20 14 14 18Z" fill="#d6eaef" stroke="#2a4048" stroke-width="2" stroke-linejoin="round"/>
    <path d="M-13 18H15L16 24H-14Z" fill="#c3dde4" stroke="#2a4048" stroke-width="2"/>
    <path d="M-1 -24V-6M7 -26V-6M15 -20V-4" stroke="#8fb3bd" stroke-width="1.4"/><path d="M-8 4Q4 0 18 4" stroke="#8fb3bd" stroke-width="1.2" fill="none"/>
    <g fill="${RED}"><circle cx="3" cy="-31" r="2.4"/><circle cx="11" cy="-27" r="2"/><circle cx="-5" cy="-25" r="1.8"/><ellipse cx="6" cy="8" rx="5" ry="3" opacity=".8"/></g></g>`;
  const shoe41 = (x, y, r, s) => `<g transform="translate(${x} ${y}) scale(1 .55)"><g transform="rotate(${r}) scale(${s || 1})"><path d="M0 -30C9 -30 12 -20 11 -10C10 -2 6 4 6 10C6 18 8 24 0 26C-8 24 -6 18 -6 10C-6 4 -11 -2 -11 -10C-12 -20 -9 -30 0 -30Z" fill="#3a3a3a" stroke="#777" stroke-width="1.5"/><path d="M-6 14h12M-7 18h14M-6 22h12" stroke="#222" stroke-width="1.5"/></g></g>`;
  const coverPrint = (x, y, s, rot) => `<g transform="translate(${x} ${y}) scale(1 .55)"><g transform="rotate(${rot}) scale(${s})"><path d="M0 -30C9 -30 12 -20 11 -10C10 -2 6 4 6 10C6 18 8 24 0 26C-8 24 -6 18 -6 10C-6 4 -11 -2 -11 -10C-12 -20 -9 -30 0 -30Z" fill="#4f7fc0" opacity=".8"/><g stroke="#24497a" stroke-width="1.6" fill="none">${range(7).map(i => `<path d="M-8 ${-24 + i * 7}q8 ${i % 2 ? 3 : -3} 16 0"/>`).join('')}</g></g></g>`;
  const mirrorText = (x, y, lines, size) => `<g transform="translate(${x} ${y}) scale(-1 1)">${lines.map((t, i) => `<text x="0" y="${i * (size + 4)}" ${MONO} font-size="${size}" text-anchor="middle" fill="${RED}">${t}</text>`).join('')}</g>`;
  const tvSet = (x, y, w, h) => `<path d="M${x + w / 2} 0V${y}" stroke="#777" stroke-width="4"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#1a1a1a" stroke="#fff" stroke-width="2.5"/>
    <rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 18}" fill="#1d2c33"/><circle cx="${x + w * .35}" cy="${y + h * .38}" r="${h * .13}" fill="#d8d0c0"/><path d="M${x + w * .2} ${y + h - 12}Q${x + w * .35} ${y + h * .5} ${x + w * .5} ${y + h - 12}Z" fill="#333"/>
    <rect x="${x + 6}" y="${y + h - 24}" width="${w - 12}" height="8" fill="${RED}"/><text x="${x + 9}" y="${y + h - 17.5}" ${MONO} font-size="6" fill="#fff">GCN · ГОРДОН-МЛ. ВИНОВЕН</text>
    <rect x="${x + w * .58}" y="${y + 12}" width="${w * .32}" height="${h * .34}" fill="#d8d0c0"/><circle cx="${x + w * .74}" cy="${y + 22}" r="5" fill="#333"/>`;

  /* ---------- место 1: операционная ---------- */
  function c5s1() {
    return svg(`
    <rect width="800" height="500" fill="#0c0e0f"/>
    <g stroke="#1a1f21" stroke-width="2">${range(17).map(i => `<line x1="0" y1="${i * 20}" x2="800" y2="${i * 20}"/>`).join('')}${range(41).map(i => `<line x1="${i * 20}" y1="0" x2="${i * 20}" y2="330"/>`).join('')}</g>
    ${tvSet(26, 44, 86, 62)}
    <!-- операционная лампа с фото Уэйна -->
    <path d="M400 0V40" stroke="#bbb" stroke-width="8"/><path d="M400 40L360 64" stroke="#bbb" stroke-width="6"/>
    <ellipse cx="340" cy="88" rx="90" ry="26" fill="#ddd" stroke="#000" stroke-width="3"/><ellipse cx="340" cy="94" rx="76" ry="16" fill="#fff8d8"/>
    ${range(5).map(i => `<circle cx="${296 + i * 22}" cy="94" r="7" fill="#fff" stroke="#e8d890" stroke-width="2"/>`).join('')}
    <path d="M264 108 L200 330 H480 L416 108Z" fill="#fff8d8" opacity=".08"/>
    ${polaroid(262, 112, -12, .9)}${polaroid(300, 124, 6, .9)}${polaroid(420, 112, 14, .9)}
    <!-- зеркало на стойке -->
    <rect x="66" y="120" width="100" height="186" rx="6" fill="#2a3a42" stroke="#fff" stroke-width="4"/>
    <path d="M76 132L156 132L156 296L76 296Z" fill="url(#ht)" opacity=".08"/><path d="M84 140L120 140L84 200Z" fill="#fff" opacity=".12"/>
    ${mirrorText(116, 176, ['НОС — ✓', 'СКУЛЫ — ✓', 'ШОВ — ГРИМ', 'ГОЛОС?'], 10)}
    <path d="M116 306V336M90 346L116 336L142 346" stroke="#fff" stroke-width="4" fill="none"/>
    ${polaroid(160, 140, 10, .75)}
    <!-- операционный стол -->
    <path d="M230 286H540V300H230Z" fill="#fff" stroke="#000" stroke-width="2"/><path d="M236 276H530Q540 276 540 286H230Q230 276 236 276Z" fill="#e8f0f2" stroke="#000" stroke-width="2"/>
    <path d="M240 276Q300 266 360 276" stroke="#bcc" stroke-width="2" fill="none"/>
    <g fill="${RED}">${[[282, 280, 9], [300, 283, 5], [318, 279, 4], [270, 284, 3]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r * 1.6}" ry="${r * .6}"/>`).join('')}</g>
    <rect x="232" y="262" width="34" height="16" rx="6" fill="#ccd" stroke="#000" stroke-width="2"/>
    <path d="M376 300V360M336 372H416" stroke="#fff" stroke-width="10"/>
    <!-- наркозный аппарат и журнал -->
    <rect x="580" y="150" width="104" height="180" fill="#1a1a1a" stroke="#fff" stroke-width="3"/>
    <rect x="592" y="162" width="80" height="44" fill="#0b2a33" stroke="#fff" stroke-width="2"/><path d="M596 186l8 0l4 -10l6 20l5 -10h18l4 -6l4 6h22" stroke="#9fd" stroke-width="2" fill="none"/>
    ${range(3).map(i => `<circle cx="${604 + i * 28}" cy="300" r="9" fill="#000" stroke="#fff" stroke-width="2"/><path d="M${604 + i * 28} 300l5 -5" stroke="${RED}" stroke-width="2"/>`).join('')}
    <rect x="690" y="200" width="18" height="120" rx="8" fill="#ddd" stroke="#000" stroke-width="2"/><rect x="694" y="190" width="10" height="12" fill="#888"/>
    <g transform="rotate(-4 628 256)"><rect x="600" y="220" width="56" height="74" fill="${PAPER}" stroke="#000" stroke-width="2"/><rect x="618" y="214" width="20" height="10" rx="2" fill="#888" stroke="#000" stroke-width="1"/>
      <path d="M606 236h44M606 244h44M606 252h30M606 262h44M606 270h36" stroke="#555" stroke-width="1.2"/><text x="628" y="286" ${MONO} font-size="8" text-anchor="middle" fill="${RED}">190 мг</text></g>
    <!-- монитор камеры -->
    <rect x="690" y="30" width="100" height="78" rx="4" fill="#111" stroke="#fff" stroke-width="3"/><rect x="698" y="38" width="84" height="58" fill="#2a3238"/>
    <g transform="translate(740 60) scale(.24)">${bruceFace({ part: 'right', scar: true })}</g><path d="M716 96q24 -18 48 0" fill="#111"/>
    <text x="702" y="47" ${MONO} font-size="7" fill="${RED}">● 01:12</text><path d="M740 30V0" stroke="#777" stroke-width="3"/>
    <!-- двери -->
    <path d="M708 140H790V330H708Z" fill="#141414" stroke="#fff" stroke-width="3"/><path d="M749 140V330" stroke="#fff" stroke-width="2"/><circle cx="728" cy="196" r="10" fill="#2a3a42" stroke="#fff" stroke-width="2"/><circle cx="770" cy="196" r="10" fill="#2a3a42" stroke="#fff" stroke-width="2"/>
    <!-- пол -->
    <rect y="330" width="800" height="170" fill="#0b0c0d"/><line x1="0" y1="332" x2="800" y2="332" stroke="#fff" stroke-width="3"/>
    <g stroke="#1b1f21" stroke-width="2">${range(9).map(i => `<line x1="${i * 100}" y1="332" x2="${i * 100 - 60}" y2="500"/>`).join('')}<line x1="0" y1="400" x2="800" y2="400"/></g>
    <!-- инструментальный столик -->
    <path d="M252 378H384V390H252Z" fill="#ccc" stroke="#000" stroke-width="2"/><path d="M262 390V452M374 390V452" stroke="#fff" stroke-width="4"/><circle cx="262" cy="458" r="5" fill="none" stroke="#fff" stroke-width="2"/><circle cx="374" cy="458" r="5" fill="none" stroke="#fff" stroke-width="2"/>
    <g transform="rotate(-8 290 372)"><rect x="262" y="360" width="36" height="22" fill="${PAPER}" stroke="#000" stroke-width="1"/><path d="M266 366h28M266 371h22" stroke="#666" stroke-width="1"/></g>
    <g transform="rotate(10 330 372)"><rect x="306" y="358" width="36" height="22" fill="${PAPER}" stroke="#000" stroke-width="1"/><path d="M310 364h28M310 369h20" stroke="#666" stroke-width="1"/><ellipse cx="330" cy="374" rx="8" ry="4" fill="#c9b47a" opacity=".7"/></g>
    <path d="M348 372l30 -4M352 378l26 2" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><path d="M372 366l8 1" stroke="${RED}" stroke-width="2"/>
    <!-- перчатка, бахилы -->
    ${gloveDrop(420, 450, 24)}
    ${coverPrint(700, 452, 1, -64)}${coverPrint(740, 434, .9, -60)}${coverPrint(770, 424, .82, -64)}
    <path d="M640 470 Q700 446 790 420M646 482 Q706 458 790 432" stroke="#2a2f33" stroke-width="3" fill="none"/>
    ${marker(200, 470, 1)}${marker(560, 470, 2)}
    `);
  }

  /* ---------- место 2: хранилище ---------- */
  function c5s2() {
    return svg(`
    <rect width="800" height="500" fill="#0b0b0b"/>
    <g fill="#141414" stroke="#222" stroke-width="2">${range(8).map(i => `<rect x="${i * 100}" y="20" width="100" height="310"/>`).join('')}</g>
    <path d="M0 20H800" stroke="#fff" stroke-width="3"/>
    <!-- открытое хранилище -->
    <circle cx="250" cy="190" r="128" fill="#1a1a1a" stroke="#fff" stroke-width="5"/><circle cx="250" cy="190" r="112" fill="#060606" stroke="#555" stroke-width="3"/>
    <g fill="#1c1c1c" stroke="#555" stroke-width="1.5">${range(6).map(r => range(7).map(c => { const x = 172 + c * 23, y = 116 + r * 25; return Math.hypot(x + 11 - 250, y + 12 - 190) < 100 ? `<rect x="${x}" y="${y}" width="21" height="23"/><circle cx="${x + 10.5}" cy="${y + 15}" r="1.6" fill="#777"/>` : ''; }).join('')).join('')}</g>
    <!-- ячейка Уэйнов: замок с барабанами -->
    <rect x="240" y="178" width="76" height="46" fill="#2a2a2a" stroke="${RED}" stroke-width="3"/><rect x="246" y="184" width="64" height="12" fill="${PAPER}"/><text x="278" y="193" ${F} font-size="8" text-anchor="middle" fill="#000">УЭЙН</text>
    ${range(4).map(i => `<rect x="${250 + i * 15}" y="202" width="11" height="16" rx="2" fill="#fff" stroke="#000" stroke-width="1"/><text x="${255.5 + i * 15}" y="214" ${MONO} font-size="9" text-anchor="middle">?</text>`).join('')}
    <!-- дверь хранилища, отвёрнутая -->
    <ellipse cx="96" cy="190" rx="44" ry="132" fill="#222" stroke="#fff" stroke-width="4"/><ellipse cx="90" cy="190" rx="30" ry="100" fill="#2a2a2a" stroke="#666" stroke-width="2"/>
    <g stroke="#fff" stroke-width="4">${range(3).map(i => `<path d="M90 190L${f1(90 + Math.cos(i * 2.09) * 26)} ${f1(190 + Math.sin(i * 2.09) * 86)}"/>`).join('')}</g><circle cx="90" cy="190" r="8" fill="#fff"/>
    <!-- терминал: сканер лица и голосовой замок -->
    <rect x="420" y="128" width="64" height="200" fill="#151515" stroke="#fff" stroke-width="3"/>
    <rect x="428" y="138" width="48" height="56" fill="#0b2a33" stroke="#fff" stroke-width="1.5"/><ellipse cx="452" cy="162" rx="12" ry="16" fill="none" stroke="#9fd" stroke-width="1.5" stroke-dasharray="3 2"/><path d="M440 186q12 -8 24 0" stroke="#9fd" stroke-width="1.5" fill="none"/>
    <rect x="430" y="200" width="44" height="30" fill="#000" stroke="#fff" stroke-width="1.5"/><path d="M434 215q5 -12 10 0t10 0t10 0t6 0" stroke="${RED}" stroke-width="2" fill="none"/>
    <g fill="#555">${range(12).map(i => `<circle cx="${436 + (i % 4) * 10}" cy="${238 + Math.floor(i / 4) * 6}" r="1.6"/>`).join('')}</g>
    <path d="M430 262H474V270H430Z" fill="#888"/><path d="M436 270q2 8 0 16M446 270q-2 10 1 18M458 270q3 6 0 14" stroke="${BAND}" stroke-width="1.5" fill="none"/>
    <!-- табличка о землетрясении -->
    <rect x="666" y="64" width="116" height="74" fill="#b8962e" stroke="#fff" stroke-width="3"/><rect x="672" y="70" width="104" height="62" fill="none" stroke="#6b5414" stroke-width="1.5"/>
    <text x="724" y="88" ${F} font-size="7" text-anchor="middle" fill="#2a1f05">ВОССТАНОВЛЕНО</text><text x="724" y="99" ${F} font-size="7" text-anchor="middle" fill="#2a1f05">ПОСЛЕ ЗЕМЛЕТРЯСЕНИЯ</text><path d="M688 110h72M694 118h60M700 126h48" stroke="#2a1f05" stroke-width="1.5"/>
    <!-- камера, служебная дверь -->
    <g transform="translate(560 44) rotate(150)"><rect x="-16" y="-7" width="32" height="14" fill="#ddd"/><rect x="14" y="-5" width="8" height="10" fill="#888"/></g>
    <path d="M700 170H780V330H700Z" fill="#101010" stroke="#fff" stroke-width="3"/><text x="740" y="190" ${F} font-size="8" text-anchor="middle" fill="#fff">СЛУЖЕБНЫЙ</text><rect x="764" y="250" width="10" height="4" fill="#fff"/>
    <!-- пол -->
    <rect y="330" width="800" height="170" fill="#0e0e0e"/><line x1="0" y1="332" x2="800" y2="332" stroke="#fff" stroke-width="3"/>
    <g stroke="#1f1f1f" stroke-width="2">${range(9).map(i => `<line x1="${i * 100}" y1="332" x2="${i * 100 - 60}" y2="500"/>`).join('')}</g>
    <!-- стол с бархатным лотком -->
    <path d="M262 382H430V392H262Z" fill="#fff"/><path d="M272 392V450M420 392V450" stroke="#fff" stroke-width="4"/>
    <path d="M270 344H422L430 382H262Z" fill="#3a0a12" stroke="#fff" stroke-width="2.5"/>
    <g fill="none" stroke="#fff" stroke-width="2">${range(9).map(i => `<circle cx="${290 + i * 5}" cy="${360 + Math.sin(i * .7) * 4}" r="2.5"/>`).join('')}</g>
    <circle cx="340" cy="362" r="9" fill="#d8c060" stroke="#000" stroke-width="1.5"/><path d="M340 362v-5M340 362l4 2" stroke="#000" stroke-width="1.2"/>
    <rect x="356" y="352" width="22" height="16" fill="${PAPER}" stroke="#000" stroke-width="1"/><path d="M359 357h16M359 362h12" stroke="#777" stroke-width="1"/>
    <rect x="384" y="350" width="28" height="22" fill="none" stroke="#c9a" stroke-width="1.5" stroke-dasharray="3 2"/><rect x="292" y="368" width="12" height="10" fill="none" stroke="#c9a" stroke-width="1.5" stroke-dasharray="2 2"/>
    <!-- книга посетителей -->
    <path d="M540 340H604L612 430H532Z" fill="#111" stroke="#fff" stroke-width="3"/>
    <g transform="rotate(-3 572 322)"><path d="M526 330L530 306H572L574 330Z" fill="${PAPER}" stroke="#000" stroke-width="2"/><path d="M574 330L576 306H618L622 330Z" fill="${PAPER}" stroke="#000" stroke-width="2"/>
      <path d="M534 312h34M533 318h34M532 324h34" stroke="#c8c0aa" stroke-width="1.2"/><path d="M590 300l26 14" stroke="#111" stroke-width="3" stroke-linecap="round"/></g>
    <!-- следы 41-го -->
    ${shoe41(690, 452, -70, .9)}${shoe41(726, 440, -66, .85)}${shoe41(760, 428, -70, .8)}
    ${marker(160, 470, 3)}${marker(500, 470, 4)}
    `);
  }

  /* ---------- место 3: особняк Эллиотов ---------- */
  function c5s3() {
    const r = rng(77);
    return svg(`
    <rect width="800" height="500" fill="#090808"/>
    <g fill="#1a1512">${range(26).map(i => `<rect x="${i * 32}" y="20" width="16" height="320" opacity=".7"/>`).join('')}</g>
    <g fill="#000" opacity=".55">${range(10).map(() => `<path d="M${f1(r() * 800)} ${f1(20 + r() * 300)}q${f1(10 + r() * 30)} ${f1(-20 - r() * 40)} ${f1(30 + r() * 50)} 0q${f1(-10)} ${f1(30 + r() * 40)} ${f1(-30 - r() * 40)} ${f1(10)}z"/>`).join('')}</g>
    <path d="M0 20H800" stroke="#fff" stroke-width="3"/><path d="M120 20L260 70L250 76L110 28Z" fill="#2a2018" stroke="#fff" stroke-width="2"/>
    <!-- окно с луной -->
    <rect x="600" y="34" width="150" height="120" fill="#16202a" stroke="#fff" stroke-width="4"/><circle cx="700" cy="76" r="20" fill="#f4f0dc"/><path d="M675 34v120M600 94h150" stroke="#fff" stroke-width="4"/><path d="M620 60l20 30l-8 4zM720 110l14 30" stroke="#000" stroke-width="3"/>
    <!-- высокие часы -->
    <path d="M56 104H124V330H56Z" fill="#1f1610" stroke="#fff" stroke-width="3"/><path d="M50 96H130L124 112H56Z" fill="#2a1d14" stroke="#fff" stroke-width="2"/>
    <circle cx="90" cy="146" r="24" fill="${PAPER}" stroke="#000" stroke-width="3"/>${range(12).map(i => `<line x1="${f1(90 + Math.cos(i * .524) * 18)}" y1="${f1(146 + Math.sin(i * .524) * 18)}" x2="${f1(90 + Math.cos(i * .524) * 22)}" y2="${f1(146 + Math.sin(i * .524) * 22)}" stroke="#000" stroke-width="1.5"/>`).join('')}<circle cx="90" cy="146" r="2.5"/>
    <path d="M66 190H114V300H66Z" fill="#0d0907" stroke="#888" stroke-width="2"/><path d="M90 194V270" stroke="#c8a64a" stroke-width="2"/><circle cx="90" cy="276" r="10" fill="#c8a64a"/>
    <path d="M100 312l12 8M104 306l10 2" stroke="#000" stroke-width="3"/><g transform="rotate(30 118 322)"><path d="M108 322h22" stroke="#000" stroke-width="2.5"/></g>
    <!-- зеркало со «стеной лиц» -->
    ${range(14).map(i => cutPhoto(250 + (i % 7) * 52 + (i > 6 ? 26 : 0) - (i % 7 > 2 && i % 7 < 5 ? 0 : 0), 70 + Math.floor(i / 7) * 160 + (i % 2) * 8, (i * 17) % 18 - 9)).join('')}
    <path d="M328 80H452V236H328Z" fill="#26323a" stroke="#c8a64a" stroke-width="6"/>
    <path d="M330 82L380 82L330 150Z" fill="#fff" opacity=".1"/><path d="M398 90L384 140L410 180L392 230M384 140L360 150" stroke="#cfd8dc" stroke-width="1.5" fill="none"/>
    <ellipse cx="420" cy="196" rx="7" ry="9" fill="#d8b896" opacity=".7"/><path d="M415 190q5 -3 10 0M414 195q6 -3 12 0M415 200q5 -3 10 0" stroke="#7a5a3a" stroke-width=".8" fill="none"/>
    <path d="M344 236q-6 24 4 40M436 236q8 30 -2 50" stroke="${BAND}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <!-- картина и сейф -->
    <rect x="626" y="190" width="86" height="64" fill="#333" stroke="#fff" stroke-width="2"/><circle cx="669" cy="222" r="18" fill="#000" stroke="#fff" stroke-width="3"/><path d="M669 222v-13" stroke="${RED}" stroke-width="3"/>
    <g transform="rotate(-24 630 186)"><rect x="560" y="180" width="72" height="56" fill="#2a1d14" stroke="#c8a64a" stroke-width="4"/><path d="M572 226q14 -30 26 -10q10 -16 22 6" stroke="#6a5a3a" stroke-width="3" fill="none"/></g>
    <!-- пол и стол -->
    <rect y="330" width="800" height="170" fill="#0c0a09"/><line x1="0" y1="332" x2="800" y2="332" stroke="#fff" stroke-width="3"/>
    <g stroke="#1a1512" stroke-width="3">${range(12).map(i => `<line x1="0" y1="${346 + i * 14}" x2="800" y2="${346 + i * 14}"/>`).join('')}</g>
    <path d="M196 344H452V356H196Z" fill="#3a2a1c" stroke="#fff" stroke-width="2.5"/><path d="M210 356V450M440 356V450" stroke="#fff" stroke-width="5"/>
    <g transform="rotate(-6 250 334)"><rect x="226" y="320" width="46" height="26" fill="#e9e3d0" stroke="#000" stroke-width="1"/><circle cx="240" cy="330" r="5" fill="#555"/><ellipse cx="258" cy="330" rx="5" ry="6" fill="#0a0a0a"/><path d="M234 344q6 -8 12 0M252 344q6 -8 12 0" fill="#555"/></g>
    <g transform="rotate(8 300 336)"><rect x="278" y="322" width="46" height="26" fill="#e9e3d0" stroke="#000" stroke-width="1"/><path d="M282 336h38" stroke="#ccc" stroke-width="2"/><path d="M276 324l50 22" stroke="#d8c88a" stroke-width="5" opacity=".7"/></g>
    <rect x="384" y="318" width="20" height="28" rx="3" fill="#e6862a" stroke="#000" stroke-width="1.5" opacity=".9"/><rect x="382" y="312" width="24" height="8" rx="2" fill="#fff" stroke="#000" stroke-width="1.5"/><rect x="386" y="326" width="16" height="12" fill="#fff"/><text x="394" y="335" ${MONO} font-size="6" text-anchor="middle">№2</text>
    <!-- газеты на полу -->
    ${range(5).map(i => `<g transform="rotate(${i * 4 - 8} 510 ${440 - i * 6})"><rect x="474" y="${420 - i * 7}" width="74" height="40" fill="${i === 4 ? '#e6dcc0' : '#cfc4a6'}" stroke="#000" stroke-width="1.2"/></g>`).join('')}
    <g transform="rotate(8 510 412)"><text x="482" y="402" ${F} font-size="7" fill="#000">GOTHAM GAZETTE</text><path d="M480 408h60M480 414h44M480 420h56" stroke="#555" stroke-width="1.5"/><rect x="522" y="414" width="18" height="14" fill="#555"/></g>
    <!-- ключ-карта -->
    <g transform="rotate(-18 668 440)"><rect x="652" y="430" width="34" height="20" rx="3" fill="#fff" stroke="#000" stroke-width="1.5"/><rect x="656" y="434" width="10" height="12" fill="#555"/><path d="M670 436h12M670 441h10" stroke="${RED}" stroke-width="1.5"/><path d="M650 438q-8 -6 -2 -12q8 -4 10 4" stroke="#fff" stroke-width="1.2" fill="none"/></g>
    ${marker(160, 470, 5)}${marker(600, 470, 6)}
    `);
  }

  /* ---------- место 4: кладбище ---------- */
  function c5s4() {
    const stone = (x, y, w, h, name) => `<path d="M${x} ${y + h}V${y + 20}Q${x} ${y} ${x + w / 2} ${y}Q${x + w} ${y} ${x + w} ${y + 20}V${y + h}Z" fill="#8c8c86" stroke="#fff" stroke-width="3"/><path d="M${x + w * .6} ${y + 2}Q${x + w} ${y} ${x + w} ${y + 20}V${y + h}H${x + w * .7}Z" fill="url(#htk)" opacity=".4"/><text x="${x + w / 2}" y="${y + 30}" ${F} font-size="9" text-anchor="middle" fill="#111">${name}</text>`;
    return svg(`
    <rect width="800" height="500" fill="#0a0d12"/>
    <circle cx="660" cy="60" r="26" fill="#e8e6d6"/><circle cx="650" cy="54" r="26" fill="#0a0d12" opacity=".0"/>
    <g fill="#05070a">${[[40, 230, 70], [130, 210, 90], [560, 220, 80], [730, 200, 100]].map(([x, y, s]) => `<path d="M${x} 330V${y}" stroke="#05070a" stroke-width="10"/><circle cx="${x}" cy="${y - s * .3}" r="${s * .5}"/><circle cx="${x - s * .3}" cy="${y}" r="${s * .38}"/><circle cx="${x + s * .32}" cy="${y + 4}" r="${s * .4}"/>`).join('')}</g>
    ${rainLines(0, 0, 800, 500, 110, 41, '#9ab')}
    <!-- склеп Уэйнов -->
    <path d="M300 330V130H500V330Z" fill="#2a2a2a" stroke="#fff" stroke-width="4"/><path d="M286 132L400 66L514 132Z" fill="#333" stroke="#fff" stroke-width="4"/>
    <text x="400" y="122" ${F} font-size="16" text-anchor="middle" fill="#fff" letter-spacing="4">WAYNE</text>
    ${[314, 474].map(x => `<rect x="${x}" y="134" width="14" height="196" fill="#3a3a3a" stroke="#fff" stroke-width="2"/>`).join('')}
    <rect x="340" y="150" width="120" height="180" fill="#050505"/>
    <g stroke="#bbb" stroke-width="4">${range(8).map(i => `<line x1="${346 + i * 15}" y1="150" x2="${346 + i * 15}" y2="330"/>`).join('')}<line x1="340" y1="172" x2="460" y2="172"/><line x1="340" y1="300" x2="460" y2="300"/></g>
    <rect x="374" y="226" width="52" height="40" fill="#1a1a1a" stroke="#fff" stroke-width="2.5"/><circle cx="388" cy="246" r="9" fill="none" stroke="${RED}" stroke-width="2" stroke-dasharray="3 2"/><circle cx="412" cy="246" r="9" fill="none" stroke="${RED}" stroke-width="2" stroke-dasharray="3 2"/>
    <path d="M444 156q6 10 2 22q-4 10 2 22" stroke="${BAND}" stroke-width="5" fill="none"/><path d="M440 160h10" stroke="${BAND}" stroke-width="4"/>
    <path d="M292 330H508V344H292Z" fill="#444" stroke="#fff" stroke-width="2"/>
    <!-- чёрные розы -->
    ${range(7).map(i => `<path d="M${492 + i * 4} 344L${476 + i * 9} 316" stroke="#4a6a4a" stroke-width="2.5"/>`).join('')}${range(7).map(i => `<circle cx="${476 + i * 9}" cy="${314 - (i % 2) * 6}" r="7" fill="#1a0306" stroke="${RED}" stroke-width="1.6"/><path d="M${473 + i * 9} ${314 - (i % 2) * 6}q3 -4 6 0" stroke="${RED}" stroke-width="1" fill="none"/>`).join('')}
    <rect x="512" y="326" width="16" height="12" fill="${PAPER}" stroke="#000" stroke-width="1" transform="rotate(12 520 332)"/>
    <!-- надгробия Уэйнов -->
    ${stone(112, 252, 80, 104, 'ТОМАС')}${stone(208, 258, 80, 98, 'МАРТА')}
    <g stroke="#fff" stroke-width="1.4" opacity=".9">${range(5).map(i => `<path d="M${124 + i * 12} 296l6 -8M${222 + i * 12} 300l5 6"/>`).join('')}<path d="M124 314h56M220 318h56M128 322h40"/></g>
    <rect x="160" y="336" width="22" height="16" fill="${PAPER}" stroke="#000" stroke-width="1" transform="rotate(-10 171 344)"/>
    <!-- соседняя могила -->
    ${stone(606, 238, 80, 92, 'САРА')}<text x="646" y="282" ${F} font-size="6.5" text-anchor="middle" fill="#111">ЭССЕН-ГОРДОН</text><text x="646" y="294" font-family="Georgia, serif" font-style="italic" font-size="7" text-anchor="middle" fill="#111">любимой жене</text>
    <g>${range(4).map(i => `<path d="M${622 + i * 8} 330L${618 + i * 9} 314" stroke="#2a4a2a" stroke-width="2"/><circle cx="${618 + i * 9}" cy="${312}" r="4" fill="#fff"/>`).join('')}</g><path d="M664 318l7 -3.5l7 3.5v7l-7 3.5l-7 -3.5z" fill="#c8a64a" stroke="#000" stroke-width="1"/>
    <!-- трава и следы -->
    <path d="M0 330H800V500H0Z" fill="#0d1410"/><path d="M0 330H800" stroke="#fff" stroke-width="2"/>
    <g stroke="#1d2a20" stroke-width="2">${range(40).map(i => `<path d="M${(i * 41) % 800} ${350 + (i * 29) % 140}l3 -8l3 8"/>`).join('')}</g>
    <path d="M330 470Q390 400 470 410Q520 416 560 400" stroke="#2a3a30" stroke-width="22" fill="none" opacity=".7"/>
    ${range(6).map(i => `<g transform="translate(${340 + i * 28} ${458 - i * 9}) scale(1 .5) rotate(${70 + (i % 2) * 8})"><path d="M0 -14C5 -14 6 -9 6 -4C5 0 3 3 3 6C3 10 4 12 0 13C-4 12 -3 10 -3 6C-3 3 -6 0 -6 -4C-6 -9 -5 -14 0 -14Z" fill="#4a5a50"/></g>`).join('')}
    <!-- тренога за дальним склепом -->
    <path d="M716 324V262H792V324Z" fill="#1c1c1c" stroke="#888" stroke-width="2"/><path d="M708 264L754 232L800 264Z" fill="#242424" stroke="#888" stroke-width="2"/><path d="M742 324V286H766V324" fill="#050505" stroke="#888" stroke-width="1.5"/>
    <g fill="#000">${[[730, 352], [758, 346], [748, 364]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="2"/>`).join('')}</g>
    ${shoe41(714, 356, -20, .55)}${shoe41(774, 360, 10, .55)}
    ${marker(60, 470, 7)}${marker(600, 470, 8)}
    `);
  }

  /* ---------- сюжетные панели ---------- */
  function splash5() {
    return svg(`
    <rect width="800" height="420" fill="#0b0b0b"/><rect width="800" height="420" fill="url(#ht)" opacity=".05"/>
    <rect x="120" y="50" width="220" height="270" fill="#c8a64a" stroke="#fff" stroke-width="4"/><rect x="136" y="66" width="188" height="238" fill="#2a2a2a"/>
    <path d="M150 304Q152 222 200 206H260Q308 222 310 304Z" fill="#111" stroke="#fff" stroke-width="2"/><path d="M216 206L230 250L244 206Z" fill="#fff" stroke="#000" stroke-width="1.5"/>
    <g transform="translate(230 142) scale(1.15)">${bruceFace({ part: 'left' })}</g>
    <rect x="180" y="318" width="100" height="18" fill="#fff"/><text x="230" y="331" ${F} font-size="10" text-anchor="middle" fill="#000">БРЮС УЭЙН</text>
    <path d="M440 420Q446 300 520 280H640Q714 300 720 420Z" fill="#161616" stroke="#fff" stroke-width="3"/><path d="M548 280L580 330L612 280" fill="#0c0c0c" stroke="#fff" stroke-width="2"/>
    <path d="M560 286Q580 300 600 286L598 304Q580 310 562 304Z" fill="#5a0e16" stroke="#000" stroke-width="1.5"/>
    <g transform="translate(580 180) scale(1.55)">${hushHead({ reveal: true })}</g>
    <path d="M700 240L760 150" stroke="#ddd" stroke-width="4" stroke-linecap="round"/><path d="M752 162L770 136L766 160Z" fill="#fff" stroke="#000" stroke-width="1"/>
    <ellipse cx="700" cy="250" rx="18" ry="14" fill="#000" stroke="#fff" stroke-width="2"/>
    `, '0 0 800 420');
  }

  const pole = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M0 -230V150" stroke="#d8c060" stroke-width="7"/><path d="M0 -230V150" stroke="#000" stroke-width="1.5" stroke-dasharray="6 10"/></g>`;
  function horse(x, y, k, dark, flip, noPole) {
    const fill = dark ? '#111' : PAPER, line = dark ? '#fff' : '#000';
    return `<g transform="translate(${x} ${y}) scale(${flip ? -k : k} ${k})">
      ${noPole ? '' : pole(0, 0, 1)}
      <path d="M-58 -2Q-84 4 -80 40" stroke="${line}" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M-58 -2Q-84 4 -80 40" stroke="${fill}" stroke-width="7" fill="none" stroke-linecap="round"/>
      ${[['M38 12L56 34L46 58', 0], ['M28 16L36 50L30 64', 0], ['M-40 14L-48 40L-44 62', 0], ['M-28 16L-20 46L-26 62', 0]].map(([d]) => `<path d="${d}" stroke="${line}" stroke-width="13" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="${fill}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
      <ellipse cx="0" cy="0" rx="62" ry="26" fill="${fill}" stroke="${line}" stroke-width="2.5"/>
      <path d="M34 -12Q46 -52 62 -68L82 -60Q68 -36 56 -2Z" fill="${fill}" stroke="${line}" stroke-width="2.5"/>
      <path d="M62 -68Q78 -82 98 -66Q104 -56 94 -50Q82 -52 76 -46L70 -56Z" fill="${fill}" stroke="${line}" stroke-width="2.5"/><circle cx="84" cy="-64" r="2.5" fill="${line}"/>
      <path d="M44 -30l-8 -4l10 -6l-8 -6l12 -4l-6 -8l12 -2" stroke="${RED}" stroke-width="3" fill="none"/>
      <path d="M-18 -26Q0 -34 20 -26L18 -14H-16Z" fill="${RED}" stroke="#000" stroke-width="1.5"/><path d="M-12 -14V20" stroke="#d8c060" stroke-width="2"/>
    </g>`;
  }
  function carousel() {
    return svg(`
    <rect width="800" height="420" fill="#07090c"/>
    <g fill="#030405">${[[60, 120], [160, 90], [700, 100], [770, 140]].map(([x, s]) => `<circle cx="${x}" cy="${130 - s * .2}" r="${s * .5}"/><circle cx="${x + 30}" cy="140" r="${s * .4}"/><path d="M${x} 330V150" stroke="#030405" stroke-width="10"/>`).join('')}</g>
    <path d="M140 64L400 0L660 64Z" fill="#1d1d1d" stroke="#fff" stroke-width="3"/>
    ${range(10).map(i => `<path d="M400 0L${140 + i * 52} 64" stroke="${i % 2 ? '#3a0a12' : '#333'}" stroke-width="10"/>`).join('')}
    ${range(10).map(i => `<path d="M${140 + i * 52} 64Q${166 + i * 52} 82 ${192 + i * 52} 64" fill="${i % 2 ? RED : PAPER}" stroke="#000" stroke-width="1.5"/>`).join('')}
    <path d="M380 70H420V370H380Z" fill="#222" stroke="#fff" stroke-width="2"/>${range(8).map(i => `<circle cx="400" cy="${90 + i * 34}" r="4" fill="#d8c060"/>`).join('')}
    <ellipse cx="400" cy="384" rx="340" ry="30" fill="#141414" stroke="#fff" stroke-width="3"/>
    ${horse(700, 306, 1, false, true)}
    ${pole(500, 296, 1.3)}
    ${hushFig(494, 268, .62)}
    ${horse(500, 296, 1.3, true, false, true)}
    <path d="M0 420Q20 250 110 222Q150 212 160 176L172 120L182 162L196 162L206 120L218 176Q228 212 200 236Q240 300 250 420Z" fill="#000" stroke="#fff" stroke-width="2"/>
    `, '0 0 800 420');
  }
  function hushTalk() {
    return svg(`
    <rect width="800" height="420" fill="${RED}"/><rect width="800" height="420" fill="url(#htk)" opacity=".3"/>
    <path d="M200 420Q206 330 300 304H500Q594 330 600 420Z" fill="#161616" stroke="#fff" stroke-width="3"/><path d="M330 304L400 380L470 304" fill="#0c0c0c" stroke="#fff" stroke-width="2"/>
    <path d="M350 310Q400 336 450 310L446 340Q400 352 354 340Z" fill="#5a0e16" stroke="#000" stroke-width="2"/>
    <g transform="translate(400 176) scale(2.25)">${hushHead({ reveal: true })}</g>
    `, '0 0 800 420');
  }
  function hushList() {
    return svg(`
    <rect width="800" height="420" fill="#0b0b0b"/><rect width="800" height="420" fill="url(#ht)" opacity=".05"/>
    <g transform="rotate(-6 420 210)">
      <rect x="270" y="60" width="300" height="300" fill="${PAPER}" stroke="#000" stroke-width="3"/>
      <text x="290" y="96" ${MONO} font-size="16" fill="#000">ПАЛАТА №2</text><text x="290" y="120" ${MONO} font-size="12" fill="#444">ЗАДАНИЕ</text>
      <g transform="rotate(-12 500 100)"><rect x="440" y="76" width="110" height="34" fill="none" stroke="${RED}" stroke-width="3"/><text x="495" y="99" ${F} font-size="14" text-anchor="middle" fill="${RED}">ИЗОЛЯТОР</text></g>
      <text x="290" y="190" ${MONO} font-size="26" fill="#000">1. БРЮС УЭЙН</text><path d="M290 200H546" stroke="${RED}" stroke-width="4"/>
      <path d="M290 236H520M290 256H500M290 276H540" stroke="#bbb" stroke-width="2"/>
      <rect x="470" y="226" width="70" height="86" fill="#fff" stroke="#000" stroke-width="2"/><rect x="476" y="232" width="58" height="62" fill="#2a2a2a"/><g transform="translate(505 262) scale(.5)">${bruceFace({})}</g>
    </g>
    <path d="M560 420L676 420L560 318L512 340Z" fill="#171717" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M520 336L566 318" stroke="#5a0e16" stroke-width="12"/>
    <g transform="translate(528 302) rotate(-25)">
      <rect x="-8" y="-84" width="16" height="78" rx="8" fill="#050505" stroke="#fff" stroke-width="2.6"/><path d="M-6 -54h12M-6 -30h12" stroke="#fff" stroke-width="1.2" opacity=".5"/>
      <rect x="-28" y="-18" width="56" height="50" rx="16" fill="#050505" stroke="#fff" stroke-width="2.8"/>
      <path d="M-20 -2h40M-20 10h40M-18 21h34" stroke="#fff" stroke-width="1.4" opacity=".55"/>
      <path d="M-28 4Q-40 -6 -34 -20Q-28 -26 -18 -14" fill="#050505" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/>
    </g>

    `, '0 0 800 420');
  }
  function flashbang() {
    return svg(`
    <rect width="800" height="420" fill="#fff"/>
    ${range(20).map(i => { const a = i * .314; return `<path d="M480 200L${f1(480 + Math.cos(a - .04) * 700)} ${f1(200 + Math.sin(a - .04) * 700)}L${f1(480 + Math.cos(a + .04) * 700)} ${f1(200 + Math.sin(a + .04) * 700)}Z" fill="#e8e8e8"/>`; }).join('')}
    <g opacity=".22"><path d="M220 108L480 24L740 108Z" fill="#888"/><path d="M460 108H500V340H460Z" fill="#888"/><ellipse cx="480" cy="352" rx="300" ry="30" fill="#999"/></g>
    <circle cx="480" cy="200" r="60" fill="#fff"/>
    <path d="M520 160Q560 130 600 150Q620 170 590 190Q560 200 580 230Q600 260 640 250" stroke="${BAND}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M520 160Q560 130 600 150Q620 170 590 190Q560 200 580 230Q600 260 640 250" stroke="#bbb" stroke-width="1.5" fill="none"/>
    <path d="M0 420Q20 260 100 230Q140 220 150 186L162 130L172 172L186 172L196 130L208 186Q216 214 196 236Q240 296 250 420Z" fill="#000"/>
    <path d="M150 230Q220 150 320 110L300 150L330 160L290 190L316 214L250 236Q220 250 196 240Z" fill="#000"/>
    `, '0 0 800 420');
  }

  /* ---------- портрет в архив ---------- */
  const prevMug = A.mug;
  function mug(id) {
    if (id !== 'elliot') return prevMug(id);
    const lines = range(6).map(i => `<line x1="0" y1="${14 + i * 14}" x2="80" y2="${14 + i * 14}" stroke="#999" stroke-width=".6"/><text x="2" y="${12 + i * 14}" ${MONO} font-size="5" fill="#777">${190 - i * 10}</text>`).join('');
    return `<svg viewBox="0 0 80 96"><rect width="80" height="96" fill="#d9d4c4"/>${lines}
      <path d="M6 96Q8 70 40 66Q72 70 74 96Z" fill="#161616" stroke="#000" stroke-width="1.4"/><path d="M28 68L40 82L52 68" fill="#0c0c0c" stroke="#fff" stroke-width="1"/><path d="M33 68Q40 74 47 68L46 74Q40 77 34 74Z" fill="#5a0e16"/>
      <g transform="translate(40 40) scale(.42)">${hushHead({})}</g>
      <rect x="20" y="82" width="40" height="11" fill="#111"/><text x="40" y="90" ${MONO} font-size="6" text-anchor="middle" fill="#fff">А-0002</text></svg>`;
  }

  Object.assign(window.Art, { bruceFace, hushHead, hushFig, bruceShot, c5s1, c5s2, c5s3, c5s4, splash5, carousel, hushTalk, hushList, flashbang, mug });
})();
