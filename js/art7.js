/* Графика кампании, глава I, дело 4 «Пятьдесят свечей»: склад «Прикладных наук», пиратская радиостанция в подземке,
   диспетчерская энергосети, станция пневмопочты под мэрией, экран, новости, горящий Готэм. */
(function () {
  const A = window.Art;
  const { svg, range, rng, rainLines, marker } = A;
  const RED = A.RED;
  const F = 'font-family="Russo One, Arial Black, sans-serif"';
  const MONO = 'font-family="monospace"';
  const PAPER = '#f1ecdf', BRASS = '#b88a3a', BRASSD = '#6e4f1c', BRASSL = '#e2bd6a', ZARYA = '#bfe9ff';
  const f1 = n => (+n).toFixed(1);

  /* ---------- общие детали ---------- */
  // подвесная лампа с конусом света
  const lamp = (x, y, len, w, col) => `<path d="M${x} 0V${y}" stroke="#333" stroke-width="2"/>
    <path d="M${x - w} ${y + len}L${x - 12} ${y + 10}H${x + 12}L${x + w} ${y + len}Z" fill="url(#cone7)" opacity="${col || .55}"/>
    <path d="M${x - 14} ${y + 12}Q${x} ${y - 4} ${x + 14} ${y + 12}Z" fill="#2a2a2a" stroke="#888" stroke-width="1.5"/><ellipse cx="${x}" cy="${y + 12}" rx="6" ry="2.5" fill="#fff4c8"/>`;
  // круг с буквой А, нанесённый баллончиком: неровный, с потёками
  const circleA = (x, y, r, col, drips, sw) => {
    const q = rng(Math.round(x * 3 + y));
    col = col || RED; sw = sw || r * .16;
    let h = `<g stroke="${col}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".92"><circle cx="${x}" cy="${y}" r="${r}" stroke-width="${f1(sw)}"/><path d="M${f1(x - r * .62)} ${f1(y + r * .72)}L${x} ${f1(y - r * .9)}L${f1(x + r * .62)} ${f1(y + r * .72)}M${f1(x - r * .4)} ${f1(y + r * .12)}H${f1(x + r * .46)}" stroke-width="${f1(sw * 1.05)}"/></g>`;
    if (drips) range(drips).forEach(i => { const dx = x - r + q() * r * 2, dy = y + r * (0.2 + q() * .7), l = 8 + q() * r * .9; h += `<path d="M${f1(dx)} ${f1(dy)}v${f1(l)}" stroke="${col}" stroke-width="${f1(1.2 + q() * 1.6)}" stroke-linecap="round" opacity=".85"/><circle cx="${f1(dx)}" cy="${f1(dy + l)}" r="${f1(1.4 + q())}" fill="${col}" opacity=".85"/>`; });
    return h;
  };
  // эмблема «Зари»: восходящее солнце над чертой
  const sunLogo = (x, y, s, col) => `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${col || '#fff'}" stroke-width="3"><path d="M-22 0A22 22 0 0 1 22 0"/><path d="M-34 0H34"/>${range(7).map(i => { const a = Math.PI + (i + .5) * Math.PI / 7, c = Math.cos(a), sn = Math.sin(a); return `<path d="M${f1(c * 27)} ${f1(sn * 27)}L${f1(c * 34)} ${f1(sn * 34)}"/>`; }).join('')}<path d="M-14 6H14M-8 11H8" stroke-width="2.4"/></g>`;
  // ящик-контейнер ячейки
  const crate = (x, y, w, h, label, empty) => empty
    ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#3a3f46" stroke-width="2" stroke-dasharray="5 4"/><text x="${x + w / 2}" y="${y + h / 2 + 3}" ${MONO} font-size="8" text-anchor="middle" fill="#4a5058">ОТГРУЖЕНО</text>`
    : `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#20262c" stroke="#7a8590" stroke-width="2"/><path d="M${x} ${y + 7}h${w}M${x} ${y + h - 6}h${w}" stroke="#3a434c" stroke-width="2"/>${sunLogo(x + w / 2, y + h / 2 + 4, .38, ZARYA)}<text x="${x + 5}" y="${y + h - 9}" ${MONO} font-size="7" fill="#8a96a2">${label || ''}</text>`;
  const bolts = (x, y, n, dx, dy) => range(n).map(i => `<circle cx="${x + i * dx}" cy="${y + i * dy}" r="1.6" fill="#777"/>`).join('');
  // лёгкая «пыль» в свете
  const dust = (x, y, w, h, n, seed) => { const q = rng(seed); return range(n).map(() => `<circle cx="${f1(x + q() * w)}" cy="${f1(y + q() * h)}" r="${f1(.6 + q() * 1.1)}" fill="#fff4c8" opacity="${f1(.15 + q() * .35)}"/>`).join(''); };
  const DEFS = `<defs><linearGradient id="cone7" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4c8" stop-opacity=".55"/><stop offset="1" stop-color="#fff4c8" stop-opacity="0"/></linearGradient>
    <radialGradient id="zg7"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".35" stop-color="${ZARYA}" stop-opacity=".55"/><stop offset="1" stop-color="${ZARYA}" stop-opacity="0"/></radialGradient>
    <radialGradient id="rg7"><stop offset="0" stop-color="#ff3a3a" stop-opacity=".55"/><stop offset="1" stop-color="#ff3a3a" stop-opacity="0"/></radialGradient>
    <radialGradient id="scr7"><stop offset="0" stop-color="#f4f0e6" stop-opacity=".5"/><stop offset="1" stop-color="#f4f0e6" stop-opacity="0"/></radialGradient>
    <linearGradient id="sky7" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#151012"/><stop offset=".55" stop-color="#3a1a1a"/><stop offset="1" stop-color="#8a2a1a"/></linearGradient>
    <linearGradient id="brass7" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BRASSL}"/><stop offset=".45" stop-color="${BRASS}"/><stop offset="1" stop-color="${BRASSD}"/></linearGradient>
    <linearGradient id="brassH7" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${BRASSD}"/><stop offset=".4" stop-color="${BRASSL}"/><stop offset="1" stop-color="${BRASSD}"/></linearGradient></defs>`;
  const S = (inner, vb) => svg(DEFS + inner, vb);

  // ячейка «Зари»: шестигранный цилиндр со светящимися кольцами
  function cellBody(x, y, k, open) {
    return `<g transform="translate(${x} ${y}) scale(${k})">
      <ellipse cx="0" cy="170" rx="58" ry="12" fill="#000" opacity=".5"/>
      <circle cx="0" cy="80" r="90" fill="url(#zg7)" opacity=".35"/>
      <path d="M-46 0H46V160H-46Z" fill="#1c232a" stroke="#cfd8e0" stroke-width="3"/>
      <path d="M-46 0L-34 -14H34L46 0Z" fill="#2c353e" stroke="#cfd8e0" stroke-width="3"/><path d="M-46 160L-34 172H34L46 160" fill="#11161a" stroke="#cfd8e0" stroke-width="3"/>
      <path d="M-30 0V160M30 0V160" stroke="#3a4650" stroke-width="2"/>
      ${range(5).map(i => `<rect x="-44" y="${18 + i * 28}" width="88" height="6" fill="${ZARYA}" opacity=".85" filter="url(#glowS)"/>`).join('')}
      ${open ? `<path d="M-24 22H24V140H-24Z" fill="#0b0f12" stroke="#7a8a96" stroke-width="2"/>
        <path d="M24 22L70 10V128L24 140" fill="#262e36" stroke="#cfd8e0" stroke-width="2.5"/>${bolts(30, 30, 4, 10, -2.6)}
        <rect x="-18" y="34" width="36" height="26" fill="#13361f" stroke="#2fae5a" stroke-width="1.5"/>${range(5).map(i => `<rect x="${-15 + i * 7}" y="40" width="4" height="4" fill="#9a9"/>`).join('')}
        <rect x="-14" y="70" width="28" height="22" rx="3" fill="#222" stroke="#999" stroke-width="1.5"/><circle cx="8" cy="76" r="3" fill="#ff2a2a" filter="url(#glowS)"/>
        <path d="M-10 92q-4 20 6 30M-4 92q2 18 -8 34M2 92q8 16 2 32M8 92q10 12 12 34" stroke-width="3" fill="none" stroke-linecap="round" stroke="#d0142c"/><path d="M-4 92q2 18 -8 34" stroke="#2f6bff" stroke-width="3" fill="none"/><path d="M8 92q10 12 12 34" stroke="#ffd400" stroke-width="3" fill="none"/>
        <g transform="translate(-6 108) scale(.25)">${circleA(0, 0, 24, '#aaa', 0, 4)}</g>`
        : sunLogo(0, 88, .8, ZARYA)}
      <text x="0" y="152" ${F} font-size="10" text-anchor="middle" fill="#cfd8e0" letter-spacing="2">ЗАРЯ</text>
    </g>`;
  }

  /* ---------- место 1: склад «Прикладных наук» ---------- */
  function c7s1() {
    return S(`
    <rect width="800" height="500" fill="#0d0f12"/>
    <g stroke="#14181c" stroke-width="3">${range(54).map(i => `<path d="M${i * 15} 40V330"/>`).join('')}</g>
    <g stroke="#1b2026" stroke-width="1">${range(54).map(i => `<path d="M${i * 15 + 7} 40V330"/>`).join('')}</g>
    <!-- фермы под крышей -->
    <rect width="800" height="40" fill="#090a0c"/><path d="M0 40H800M0 8H800" stroke="#2b3036" stroke-width="5"/>
    <path d="${range(20).map(i => `M${i * 40} 40L${i * 40 + 20} 8L${i * 40 + 40} 40`).join('')}" stroke="#2b3036" stroke-width="2.5" fill="none"/>
    <!-- рулонные ворота, приоткрыты: снаружи дождь -->
    <rect x="22" y="70" width="182" height="262" fill="#15191d" stroke="#9aa4ae" stroke-width="3"/>
    <rect x="28" y="262" width="170" height="70" fill="#0a1220"/>${rainLines(28, 262, 170, 70, 26, 41, '#5a6e86')}
    <path d="M28 330q40 -6 80 -2t90 -2" stroke="#2a4466" stroke-width="2" fill="none"/>
    <g stroke="#2a3036" stroke-width="2">${range(17).map(i => `<path d="M24 ${80 + i * 11}H202"/>`).join('')}</g>
    <path d="M24 262H202" stroke="#9aa4ae" stroke-width="4"/><rect x="100" y="254" width="24" height="7" fill="#555"/>
    <rect x="40" y="52" width="148" height="14" fill="#1c1f23" stroke="#555"/><text x="114" y="63" ${F} font-size="9" text-anchor="middle" fill="#ffd400" letter-spacing="2">ВОРОТА 3 · БУХТА</text>
    <!-- стеллаж: ячейки уже развезли по пяти зданиям -->
    <g stroke="#566270" stroke-width="5"><path d="M224 332V60M456 332V60"/><path d="M224 140H456M224 228H456M224 316H456"/></g>
    <g stroke="#3a434c" stroke-width="2">${range(6).map(i => `<path d="M${226} ${62 + i * 46}L${454} ${102 + i * 46}"/>`).join('')}</g>
    ${crate(232, 92, 66, 46, 'З-001')}${crate(304, 92, 66, 46, '', true)}${crate(376, 92, 72, 46, '', true)}
    ${crate(232, 180, 66, 46, '', true)}${crate(304, 180, 66, 46, 'З-118')}${crate(376, 180, 72, 46, '', true)}
    ${crate(232, 268, 66, 46, '', true)}${crate(304, 268, 66, 46, '', true)}${crate(376, 268, 72, 46, 'З-120')}
    <rect x="238" y="70" width="80" height="14" fill="#ffd400"/><text x="278" y="81" ${F} font-size="8" text-anchor="middle" fill="#000">СЕКЦИЯ «ЗАРЯ»</text>
    <!-- граффити -->
    ${circleA(530, 100, 42, RED, 7)}
    <text x="530" y="184" ${F} font-size="18" text-anchor="middle" fill="${RED}" opacity=".9" transform="rotate(-4 530 184)">СВЕТ ПОГАСНЕТ</text>
    <path d="M470 194q30 4 60 -2t50 4" stroke="${RED}" stroke-width="2" fill="none" opacity=".5"/>
    <!-- конторка мастера и пробковая доска -->
    <rect x="612" y="60" width="186" height="272" fill="#14181c" stroke="#9aa4ae" stroke-width="3"/>
    <rect x="626" y="210" width="74" height="70" fill="#22303a" stroke="#9aa4ae" stroke-width="2"/><path d="M663 210v70M626 245h74" stroke="#9aa4ae" stroke-width="2"/><circle cx="650" cy="230" r="24" fill="url(#lampGlow)"/>
    <rect x="716" y="200" width="66" height="132" fill="#1b2026" stroke="#9aa4ae" stroke-width="2"/><circle cx="772" cy="268" r="3" fill="#ccc"/>
    <rect x="634" y="86" width="140" height="98" fill="#7a5a34" stroke="#3a2a14" stroke-width="3"/><rect x="634" y="86" width="140" height="98" fill="url(#htk)" opacity=".25"/>
    <g transform="rotate(-4 680 130)"><rect x="646" y="98" width="62" height="58" fill="${PAPER}" stroke="#000" stroke-width="1.2"/><path d="M652 108h40M652 116h48M652 124h44M652 132h46M652 140h30" stroke="#666" stroke-width="1.3"/><text x="700" y="152" ${F} font-size="8" text-anchor="end" fill="#2f6bff">Л.Ф.</text><circle cx="677" cy="100" r="3" fill="${RED}"/></g>
    <g transform="rotate(5 742 128)"><rect x="718" y="104" width="46" height="34" fill="#ffe680"/><path d="M722 114h36M722 122h30M722 130h24" stroke="#776" stroke-width="1.2"/><circle cx="741" cy="106" r="2.5" fill="#2f6bff"/></g>
    <rect x="720" y="146" width="44" height="30" fill="#eee" stroke="#000"/><path d="M724 154h36M724 162h30" stroke="#999" stroke-width="1.2"/>
    <!-- лампы -->
    ${lamp(120, 40, 300, 120)}${lamp(400, 40, 330, 150)}${lamp(560, 40, 320, 130, .45)}
    ${dust(320, 80, 180, 280, 26, 7)}
    <!-- пол: бетон, жёлтая полоса, лужи -->
    <rect y="330" width="800" height="170" fill="#0b0c0e"/><path d="M0 332H800" stroke="#cfd8e0" stroke-width="3"/>
    <g stroke="#15171a" stroke-width="2">${range(10).map(i => `<path d="M${i * 90} 332L${i * 90 - 70} 500"/>`).join('')}<path d="M0 410H800"/></g>
    <path d="M300 332L240 500H290L346 332Z" fill="#ffd400" opacity=".18"/><path d="M300 332L240 500M346 332L290 500" stroke="#ffd400" stroke-width="3" opacity=".7"/>
    <ellipse cx="380" cy="470" rx="80" ry="10" fill="#1e2a36" opacity=".8"/><ellipse cx="380" cy="470" rx="40" ry="4" fill="#fff4c8" opacity=".14"/>
    <!-- верстак со световым столом и трафаретами -->
    <path d="M40 360H282V376H40Z" fill="#3a2a1c" stroke="#cfd8e0" stroke-width="2.5"/><path d="M52 376V470M270 376V470M52 440H270" stroke="#cfd8e0" stroke-width="5"/>
    <rect x="70" y="338" width="150" height="22" fill="#e8f6ff" stroke="#888" stroke-width="2"/><rect x="70" y="338" width="150" height="22" fill="url(#zg7)" opacity=".8"/>
    <rect x="66" y="320" width="158" height="30" fill="url(#lampGlow)" opacity=".7"/>
    <g opacity=".85"><path d="M78 336l64 -8l6 22l-64 8z" fill="#5fd0ff" opacity=".35" stroke="#5fd0ff" stroke-width="1.5"/><path d="M118 330l60 4l-2 22l-60 -4z" fill="#ff7ab0" opacity=".35" stroke="#ff7ab0" stroke-width="1.5"/><path d="M150 334l56 -6l4 20l-56 6z" fill="#ffd400" opacity=".3" stroke="#ffd400" stroke-width="1.5"/></g>
    <g fill="#111">${range(9).map(i => `<rect x="${88 + i * 13}" y="${340 + (i % 3) * 5}" width="5" height="5" opacity=".7"/>`).join('')}</g>
    <g transform="translate(238 330)"><rect x="0" y="0" width="12" height="30" rx="3" fill="#ccc" stroke="#000" stroke-width="1.5"/><rect x="0" y="10" width="12" height="9" fill="${RED}"/><rect x="3" y="-5" width="6" height="5" fill="#333"/></g>
    <g transform="translate(256 334) rotate(18)"><rect x="0" y="0" width="12" height="28" rx="3" fill="#ccc" stroke="#000" stroke-width="1.5"/><rect x="0" y="9" width="12" height="8" fill="#111"/><rect x="3" y="-5" width="6" height="5" fill="#333"/></g>
    <path d="M200 362l30 -4" stroke="#ffd400" stroke-width="3"/><path d="M226 358l14 -2" stroke="#999" stroke-width="2"/>
    <!-- стенд с ячейкой -->
    <path d="M430 398H640V410H430Z" fill="#4a525a" stroke="#cfd8e0" stroke-width="2.5"/><path d="M442 410V470M628 410V470M442 456H628" stroke="#cfd8e0" stroke-width="4"/>
    <circle cx="446" cy="476" r="7" fill="#222" stroke="#999" stroke-width="2"/><circle cx="624" cy="476" r="7" fill="#222" stroke="#999" stroke-width="2"/>
    ${cellBody(530, 226, 1, true)}
    <g transform="translate(580 370)"><path d="M0 28L8 0H52L58 28Z" fill="#222" stroke="#cfd8e0" stroke-width="2"/><rect x="10" y="3" width="40" height="20" fill="#0b2a33"/><text x="30" y="12" ${MONO} font-size="5.5" text-anchor="middle" fill="#9fd">ПРОШИВКА 2.4</text><text x="30" y="20" ${MONO} font-size="5.5" text-anchor="middle" fill="${RED}">ИЗМЕНЕНА</text></g>
    <path d="M572 300q30 40 14 74" stroke="#888" stroke-width="2" fill="none"/>
    <!-- погрузчик -->
    <g transform="translate(690 350)"><path d="M0 0H70V50H0Z" fill="#c9a020" stroke="#000" stroke-width="2"/><path d="M10 0V-50H56V0" fill="none" stroke="#222" stroke-width="5"/><path d="M-10 -60V60M-4 -60V60" stroke="#666" stroke-width="5"/><path d="M-30 52H-6" stroke="#888" stroke-width="5"/><circle cx="16" cy="56" r="13" fill="#111" stroke="#555" stroke-width="3"/><circle cx="58" cy="56" r="11" fill="#111" stroke="#555" stroke-width="3"/><rect x="14" y="-40" width="30" height="20" fill="#1a2630" stroke="#555"/></g>
    <!-- взломанная боковая дверь: следы фомки -->
    <path d="M206 300l10 -6M208 312l12 -4" stroke="#cfd8e0" stroke-width="2"/>
    ${marker(400, 492, 1)}
    `);
  }

  /* ---------- место 2: заброшенная станция «Кейн-стрит» ---------- */
  function c7s2() {
    const tiles = `<g stroke="#20262a" stroke-width="1.5">${range(18).map(r => `<path d="M0 ${60 + r * 15}H800"/>`).join('')}${range(18).map(r => range(28).map(c => `<path d="M${c * 30 + (r % 2) * 15} ${60 + r * 15}v15"/>`).join('')).join('')}</g>`;
    return S(`
    <rect width="800" height="500" fill="#14181b"/>
    <rect y="60" width="800" height="272" fill="#1c2226"/>${tiles}
    <rect y="60" width="800" height="272" fill="url(#htk)" opacity=".18"/>
    <path d="M0 200H800" stroke="#2f4a3a" stroke-width="12"/><path d="M0 194H800M0 206H800" stroke="#20262a" stroke-width="2"/>
    <!-- свод -->
    <path d="M0 60Q400 -40 800 60V0H0Z" fill="#0b0d0f"/><path d="M0 60Q400 -40 800 60" stroke="#3a4248" stroke-width="5" fill="none"/>
    <!-- мозаика с названием станции -->
    <rect x="262" y="70" width="276" height="44" fill="#e8e2d0" stroke="#2f4a3a" stroke-width="6"/><rect x="262" y="70" width="276" height="44" fill="url(#htk)" opacity=".12"/>
    <text x="400" y="101" ${F} font-size="24" text-anchor="middle" fill="#1c3a2a" letter-spacing="3">КЕЙН-СТРИТ</text>
    <path d="M290 70l-6 44M520 76l10 30" stroke="#8a8270" stroke-width="1.5"/>
    <!-- колонны -->
    ${[236, 566].map(x => `<rect x="${x}" y="40" width="24" height="292" fill="#2a3034" stroke="#566" stroke-width="2"/><rect x="${x - 6}" y="40" width="36" height="10" fill="#3a4248"/><rect x="${x - 6}" y="320" width="36" height="12" fill="#3a4248"/>${bolts(x + 5, 60, 12, 0, 22)}${bolts(x + 19, 60, 12, 0, 22)}`).join('')}
    ${circleA(248, 250, 14, RED, 3)}
    <!-- лампочки на проводе -->
    <path d="M0 36Q200 60 400 40T800 44" stroke="#222" stroke-width="2" fill="none"/>
    ${[[120, 50], [330, 46], [470, 42], [690, 47]].map(([x, y], i) => `<path d="M${x} ${y}v10" stroke="#222" stroke-width="2"/><circle cx="${x}" cy="${y + 16}" r="6" fill="${i === 2 ? '#3a3a2a' : '#fff4c8'}" stroke="#000"/>${i === 2 ? '' : `<circle cx="${x}" cy="${y + 16}" r="60" fill="url(#lampGlow)" opacity=".6"/>`}`).join('')}
    <!-- карта метро на стене -->
    <rect x="30" y="112" width="190" height="146" fill="#0e1214" stroke="#8a8270" stroke-width="5"/><rect x="36" y="118" width="178" height="134" fill="#e8e2d0"/>
    <text x="125" y="132" ${F} font-size="9" text-anchor="middle" fill="#333">СХЕМА ПОДЗЕМКИ ГОТЭМА · 1974</text>
    <g fill="none" stroke-width="4" stroke-linecap="round"><path d="M50 228L90 190L140 150L190 140" stroke="${RED}"/><path d="M60 160L110 200L170 210L200 236" stroke="#2f6bff"/><path d="M80 240V170L130 140" stroke="#2fae5a"/></g>
    <g fill="#fff" stroke="#000" stroke-width="1.5">${[[90, 190], [140, 150], [110, 200], [170, 210], [80, 170], [190, 140], [200, 236], [50, 228]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4"/>`).join('')}</g>
    <g stroke="${RED}" stroke-width="2" fill="none"><circle cx="90" cy="190" r="9"/><circle cx="170" cy="210" r="9"/><circle cx="140" cy="150" r="9"/><path d="M190 140l10 -10M196 132h6v6"/></g>
    <path d="M150 118l-20 70l30 64" stroke="#fff" stroke-width="1.2" fill="none" opacity=".6"/>
    <!-- плакат «разыскивается» -->
    <g transform="rotate(3 670 180)"><rect x="618" y="118" width="104" height="128" fill="#e0d6b8" stroke="#000" stroke-width="2"/><rect x="618" y="118" width="104" height="128" fill="url(#htk)" opacity=".1"/>
      <text x="670" y="137" ${F} font-size="10" text-anchor="middle" fill="#000">РАЗЫСКИВАЕТСЯ</text>
      <rect x="640" y="146" width="60" height="50" fill="#2a2a2a" stroke="#000"/><text x="670" y="168" ${F} font-size="18" text-anchor="middle" fill="#777">?</text><text x="670" y="186" ${MONO} font-size="6" text-anchor="middle" fill="#888">ФОТО НЕТ</text>
      <g fill="#000" transform="translate(704 150) scale(.5)"><ellipse cx="0" cy="8" rx="7" ry="6"/><circle cx="-8" cy="-2" r="3"/><circle cx="-3" cy="-7" r="3"/><circle cx="3" cy="-7" r="3"/><circle cx="8" cy="-2" r="3"/></g>
      <text x="670" y="212" ${F} font-size="9" text-anchor="middle" fill="${RED}">«КОШКА»</text><text x="670" y="226" ${MONO} font-size="7" text-anchor="middle" fill="#333">НАГРАДА 50 000 $</text><text x="670" y="238" ${MONO} font-size="6" text-anchor="middle" fill="#555">ГОТЭМСКИЙ МУЗЕЙ</text>
      <path d="M700 246l10 -14l8 10z" fill="#c8bea0"/></g>
    <!-- кабель антенны уходит в вентиляцию -->
    <path d="M470 300Q530 230 600 160T606 40" stroke="#111" stroke-width="4" fill="none"/><path d="M470 300Q530 230 600 160T606 40" stroke="#555" stroke-width="1.5" fill="none" stroke-dasharray="3 5"/>
    <rect x="586" y="26" width="40" height="16" fill="#222" stroke="#666"/>${range(4).map(i => `<path d="M${590 + i * 9} 28v12" stroke="#666" stroke-width="2"/>`).join('')}
    <!-- платформа -->
    <rect y="330" width="800" height="90" fill="#24292c"/><path d="M0 332H800" stroke="#cfd8e0" stroke-width="3"/>
    <g stroke="#1a1e21" stroke-width="2">${range(18).map(i => `<path d="M${i * 48} 332L${i * 48 - 40} 420"/>`).join('')}<path d="M0 372H800"/></g>
    <rect y="408" width="800" height="12" fill="#ffd400"/><g fill="#000" opacity=".5">${range(40).map(i => `<circle cx="${i * 20 + 10}" cy="414" r="2.2"/>`).join('')}</g>
    <!-- пульт пиратского радио -->
    <path d="M286 300H516V312H286Z" fill="#3a3530" stroke="#cfd8e0" stroke-width="2.5"/><path d="M298 312L290 400M504 312L512 400M300 360H502" stroke="#cfd8e0" stroke-width="4"/>
    <rect x="300" y="240" width="96" height="60" rx="4" fill="#2a2a24" stroke="#cfd8e0" stroke-width="2.5"/>
    ${[[318, 262], [344, 262]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#111" stroke="#aaa" stroke-width="2"/><path d="M${x} ${y}l6 -6" stroke="#fff" stroke-width="2"/>`).join('')}
    <rect x="360" y="250" width="30" height="20" fill="#1a1608" stroke="#777"/><path d="M364 268q11 -16 22 0" stroke="#ffd400" stroke-width="1.5" fill="none"/><path d="M375 268l6 -12" stroke="${RED}" stroke-width="1.5"/>
    <rect x="306" y="282" width="84" height="10" fill="#0b1a10"/><text x="348" y="290" ${MONO} font-size="8" text-anchor="middle" fill="#7f7" filter="url(#glowS)">66.6 FM</text>
    <!-- катушечный магнитофон -->
    <rect x="402" y="252" width="80" height="48" rx="3" fill="#cfcabd" stroke="#000" stroke-width="2"/>
    ${[422, 462].map(x => `<circle cx="${x}" cy="270" r="13" fill="#333" stroke="#000" stroke-width="1.5"/><circle cx="${x}" cy="270" r="4" fill="#ccc"/>${range(3).map(k => `<path d="M${x} 270l${f1(Math.cos(k * 2.1) * 10)} ${f1(Math.sin(k * 2.1) * 10)}" stroke="#777" stroke-width="2"/>`).join('')}`).join('')}<path d="M422 283H462" stroke="#5a3a1a" stroke-width="2"/>
    <!-- микрофон, наушники, листовки -->
    <path d="M492 300V250" stroke="#999" stroke-width="3"/><rect x="484" y="226" width="16" height="26" rx="8" fill="#333" stroke="#ccc" stroke-width="2"/><path d="M484 236h16M484 242h16" stroke="#777"/>
    <path d="M436 300q0 -20 14 -20q14 0 14 20" stroke="#111" stroke-width="4" fill="none"/>
    ${range(5).map(i => `<rect x="${290 + i * 3}" y="${292 - i * 3}" width="40" height="8" fill="${PAPER}" stroke="#555" stroke-width=".6" transform="rotate(${-6 + i * 3} 310 292)"/>`).join('')}
    <rect x="352" y="360" width="56" height="34" fill="#111" stroke="#888" stroke-width="2"/><path d="M362 360v-6h10v6M388 360v-6h10v6" stroke="#888" stroke-width="2"/><text x="380" y="382" ${F} font-size="9" text-anchor="middle" fill="${RED}">+ −</text>
    <!-- листовки на полу -->
    ${[[120, 380, -20], [180, 395, 14], [560, 386, 30], [630, 398, -8], [700, 378, 12]].map(([x, y, a]) => `<g transform="rotate(${a} ${x} ${y})"><rect x="${x - 14}" y="${y - 9}" width="28" height="18" fill="${PAPER}" stroke="#555" stroke-width=".8"/>${circleA(x - 6, y, 5, RED, 0, 1.4)}<path d="M${x} ${y - 3}h10M${x} ${y + 1}h8M${x} ${y + 5}h9" stroke="#555" stroke-width=".8"/></g>`).join('')}
    <!-- пути и тоннель -->
    <rect y="420" width="800" height="80" fill="#0a0b0c"/>
    <g fill="#2a2420">${range(20).map(i => `<rect x="${i * 44}" y="${448}" width="30" height="8"/><rect x="${i * 44 - 8}" y="${478}" width="36" height="10"/>`).join('')}</g>
    <path d="M0 444H800M0 474H800" stroke="#8a8f94" stroke-width="4"/>
    <path d="M720 332V120Q720 96 760 96H800V332Z" fill="#050606" stroke="#3a4248" stroke-width="4"/>
    <path d="M740 332V190Q740 170 770 170H800V332" fill="#141619" stroke="#444" stroke-width="2"/><rect x="752" y="200" width="30" height="34" fill="#1d2a30" stroke="#555"/><circle cx="766" cy="300" r="8" fill="#2a2a2a" stroke="#666" stroke-width="2"/>
    <path d="M610 60q2 30 0 60" stroke="#3a4248" stroke-width="5"/><path d="M610 120q0 6 0 12" stroke="#5a7a8a" stroke-width="2" stroke-dasharray="2 6"/><ellipse cx="610" cy="330" rx="10" ry="3" fill="#2a3a44"/>
    ${marker(150, 494, 2)}
    `);
  }

  /* ---------- место 3: диспетчерская энергосети ---------- */
  function c7s3() {
    const nodes = [[240, 110, 'БАШНЯ'], [330, 160, 'НАУКИ'], [430, 100, 'ФОНД'], [520, 170, 'КЕМИКАЛ'], [610, 120, 'ПОРТ']];
    return S(`
    <rect width="800" height="500" fill="#0c0f12"/>
    <g stroke="#13171b" stroke-width="2">${range(30).map(i => `<path d="M${i * 28} 30V330"/>`).join('')}</g>
    <!-- лампы дневного света -->
    <rect width="800" height="30" fill="#08090b"/>${[140, 400, 660].map((x, i) => `<rect x="${x - 70}" y="22" width="140" height="8" fill="${i === 1 ? '#3a4040' : '#e8fff8'}" stroke="#555"/>${i === 1 ? '' : `<path d="M${x - 70} 30L${x - 160} 330H${x + 160}L${x + 70} 30Z" fill="url(#cone7)" opacity=".25"/>`}`).join('')}
    <!-- мнемосхема города -->
    <rect x="120" y="44" width="560" height="176" fill="#071318" stroke="#8a96a2" stroke-width="4"/>
    <g stroke="#123040" stroke-width="2">${range(14).map(i => `<path d="M${130 + i * 40} 50V214"/>`).join('')}${range(5).map(i => `<path d="M126 ${60 + i * 36}H674"/>`).join('')}</g>
    <path d="M126 200Q300 180 420 206T674 190" stroke="#1d4a6a" stroke-width="10" fill="none"/>
    <circle cx="420" cy="140" r="18" fill="#0b2a33" stroke="${ZARYA}" stroke-width="3"/>${sunLogo(420, 146, .35, ZARYA)}
    ${nodes.map(([x, y, t]) => `<path d="M420 140L${x} ${y}" stroke="${ZARYA}" stroke-width="2.5" opacity=".7"/><circle cx="${x}" cy="${y}" r="9" fill="#ff2a2a" filter="url(#glowS)"/><text x="${x}" y="${y + 22}" ${MONO} font-size="9" text-anchor="middle" fill="#9fd">${t}</text>`).join('')}
    ${circleA(640, 76, 20, RED, 4, 3.5)}
    <rect x="360" y="226" width="80" height="22" fill="#000" stroke="#555"/><text x="400" y="243" ${MONO} font-size="16" text-anchor="middle" fill="${RED}" filter="url(#glowS)">23:05</text>
    <!-- подсобка: дверь подпёрта стулом, заперт дежурный -->
    <rect x="12" y="60" width="96" height="272" fill="#1a1e22" stroke="#8a96a2" stroke-width="3"/><rect x="24" y="74" width="72" height="20" fill="#ffd400"/><text x="60" y="88" ${F} font-size="9" text-anchor="middle" fill="#000">ПОДСОБКА</text>
    <circle cx="94" cy="200" r="5" fill="#ccc"/><path d="M90 200q-20 10 -40 70" stroke="#666" stroke-width="3" fill="none"/><path d="M20 240l70 -40" stroke="#ccc" stroke-width="5"/><path d="M20 240v92M70 266v66" stroke="#ccc" stroke-width="4"/>
    <text x="46" y="150" ${F} font-size="12" fill="#cfd8e0" opacity=".7" transform="rotate(-8 46 150)">БУМ! БУМ!</text>
    <!-- маркерная доска -->
    <path d="M50 380L70 240M190 380L172 240" stroke="#999" stroke-width="4"/>
    <rect x="24" y="226" width="186" height="128" fill="#f4f6f8" stroke="#888" stroke-width="3"/>
    <g stroke="#222" stroke-width="1.5" fill="none"><path d="M70 246H200M70 266H200M70 286H200M70 306H200M70 326H200"/><path d="M70 246V346M102 246V346M134 246V346M166 246V346M198 246V346"/></g>
    <text x="34" y="262" ${MONO} font-size="8" fill="#222">НАУКИ</text><text x="34" y="282" ${MONO} font-size="8" fill="#222">ФОНД</text><text x="34" y="302" ${MONO} font-size="8" fill="#222">КЕМ.</text><text x="34" y="322" ${MONO} font-size="8" fill="#222">ПОРТ</text>
    <g stroke="${RED}" stroke-width="2"><path d="M80 252l12 10M92 252l-12 10M144 292l12 10M156 292l-12 10"/></g><text x="112" y="320" ${F} font-size="12" fill="#2f6bff">?</text>
    ${circleA(184, 340, 9, RED, 0, 2)}
    <!-- пульт: мониторы, телефон, телевизор -->
    <path d="M222 330Q400 300 590 330V370Q400 344 222 370Z" fill="#2a3036" stroke="#cfd8e0" stroke-width="2.5"/>
    ${[[250, 262], [326, 252], [402, 252]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="66" height="50" rx="4" fill="#1a1e22" stroke="#cfd8e0" stroke-width="2"/><rect x="${x + 6}" y="${y + 6}" width="54" height="36" fill="${i === 1 ? '#2a0a0a' : '#0b2a33'}"/>${i === 1 ? circleA(x + 33, y + 24, 12, RED, 0, 2.5) : `<path d="M${x + 10} ${y + 30}l10 -8l8 4l12 -14l12 10" stroke="#9fd" stroke-width="1.5" fill="none"/>`}<path d="M${x + 28} ${y + 50}v8h10v-8" stroke="#888" stroke-width="2" fill="none"/>`).join('')}
    <rect x="270" y="322" width="70" height="8" fill="#444" stroke="#999"/><path d="M360 326q20 -6 30 4" stroke="#222" stroke-width="3" fill="none"/><rect x="384" y="318" width="22" height="12" rx="3" fill="#8a1010" stroke="#000"/>
    <!-- маленький телевизор: трансляция юбилея -->
    <rect x="484" y="248" width="80" height="62" rx="5" fill="#2a2420" stroke="#cfd8e0" stroke-width="2.5"/><rect x="492" y="255" width="58" height="46" fill="#1b2a3a"/>
    <path d="M492 301L512 270H530L550 301Z" fill="#0d1520"/>${range(5).map(i => `<circle cx="${500 + i * 11}" cy="${262 + (i % 2) * 3}" r="1.6" fill="#fff4c8"/>`).join('')}
    <rect x="514" y="276" width="14" height="10" fill="#fff"/><path d="M516 276v-4M520 276v-5M524 276v-4" stroke="#ffd400" stroke-width="1.5"/><text x="521" y="298" ${F} font-size="7" text-anchor="middle" fill="#fff">50</text>
    <circle cx="556" cy="268" r="3" fill="#777"/><circle cx="556" cy="282" r="3" fill="#777"/><path d="M500 248l-10 -14M540 248l12 -16" stroke="#999" stroke-width="2"/>
    <!-- кружка, опрокинутое кресло -->
    <rect x="440" y="312" width="14" height="16" rx="2" fill="#fff" stroke="#000" stroke-width="1.5"/><path d="M454 316q6 2 0 8" stroke="#fff" stroke-width="2" fill="none"/>
    <g transform="translate(360 420) rotate(-80)"><path d="M-30 0H30V8H-30Z" fill="#333" stroke="#999" stroke-width="2"/><path d="M-24 -30V0M24 -30V0" stroke="#999" stroke-width="3"/><path d="M-30 -50H30V-30H-30Z" fill="#333" stroke="#999" stroke-width="2"/><path d="M0 8V36M-20 36H20" stroke="#999" stroke-width="3"/></g>
    <!-- шкаф с рубильниками -->
    <rect x="606" y="196" width="176" height="226" fill="#20262c" stroke="#cfd8e0" stroke-width="3"/><path d="M606 196L572 210V408L606 422" fill="#2a3138" stroke="#cfd8e0" stroke-width="2.5"/>
    <rect x="620" y="206" width="148" height="18" fill="#ffd400"/><text x="694" y="219" ${F} font-size="9" text-anchor="middle" fill="#000">ЩИТ АВАРИЙНЫЙ · 0,4 кВ</text>
    ${range(4).map(r => range(4).map(c => { const on = (r * 3 + c) % 3 !== 0; const x = 624 + c * 36, y = 232 + r * 46; return `<rect x="${x}" y="${y}" width="28" height="38" rx="3" fill="#15181b" stroke="#666"/><rect x="${x + 8}" y="${on ? y + 4 : y + 20}" width="12" height="14" rx="2" fill="${on ? '#2fae5a' : RED}"/>`; }).join('')).join('')}
    ${circleA(744, 396, 12, RED, 2, 2.4)}
    <path d="M600 330q-30 30 -10 90" stroke="#111" stroke-width="6" fill="none"/>
    <!-- фальшпол -->
    <rect y="330" width="800" height="170" fill="#101316" opacity=".0"/><path d="M0 420H800" stroke="#cfd8e0" stroke-width="3"/><rect y="422" width="800" height="78" fill="#0d1013"/>
    <g stroke="#1a1f24" stroke-width="2">${range(14).map(i => `<path d="M${i * 60} 422L${i * 60 - 30} 500"/>`).join('')}<path d="M0 460H800"/></g>
    ${marker(300, 492, 3)}
    `);
  }

  /* ---------- место 4/5: станция пневмопочты под мэрией ---------- */
  function hideout(on) {
    const tubes = [[400, 190, 120, 40], [400, 190, 220, 30], [400, 190, 330, 26], [400, 190, 470, 26], [400, 190, 580, 30], [400, 190, 690, 46]];
    const screenFill = on ? `<rect x="254" y="34" width="292" height="128" fill="#ece6d6"/><rect x="254" y="34" width="292" height="128" fill="url(#htk)" opacity=".08"/>
        <g fill="#140d0d">${(() => { const q = rng(77); let h = ''; for (let i = 0; i < 12; i++) { const x = 400 - 6 - q() * 50, y = 52 + q() * 90, rx = 4 + q() * 14, ry = 4 + q() * 11; h += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}"/><ellipse cx="${f1(800 - x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}"/>`; } return h; })()}<ellipse cx="400" cy="96" rx="7" ry="30"/></g>
        <rect x="470" y="40" width="70" height="22" fill="#000"/><text x="505" y="57" ${MONO} font-size="15" text-anchor="middle" fill="${RED}" filter="url(#glowS)">03:00</text>
        <ellipse cx="400" cy="300" rx="380" ry="200" fill="url(#scr7)" opacity=".5"/>`
      : `<rect x="254" y="34" width="292" height="128" fill="#07090b"/><path d="M262 40L330 40L270 150Z" fill="#fff" opacity=".04"/><path d="M500 40L540 40L540 90Z" fill="#fff" opacity=".03"/>`;
    return S(`
    <rect width="800" height="500" fill="#100c0a"/>
    <!-- кирпичный свод -->
    <g stroke="#1f1612" stroke-width="2">${range(20).map(r => `<path d="M0 ${r * 18}H800"/>${range(22).map(c => `<path d="M${c * 40 + (r % 2) * 20} ${r * 18}v18"/>`).join('')}`).join('')}</g>
    <path d="M0 0H800V40Q600 0 400 20Q200 0 0 40Z" fill="#0a0706"/>
    ${[0, 400].map(x => `<path d="M${x} 330V60Q${x + 200} -30 ${x + 400} 60V330" stroke="#2a1d16" stroke-width="10" fill="none"/>`).join('')}
    ${on ? `<rect width="800" height="500" fill="#3a0606" opacity=".35"/>` : ''}
    <!-- трубы пневмопочты вдоль стен -->
    <g fill="none" stroke-linecap="round">${[[0, 70, 800, 70], [0, 92, 230, 92], [570, 92, 800, 92]].map(([x1, y1, x2, y2]) => `<path d="M${x1} ${y1}H${x2}" stroke="#000" stroke-width="16"/><path d="M${x1} ${y1}H${x2}" stroke="url(#brass7)" stroke-width="12"/>`).join('')}</g>
    ${range(9).map(i => `<rect x="${30 + i * 90}" y="62" width="10" height="16" fill="${BRASSD}" stroke="#000"/>`).join('')}
    <!-- коллектор: латунный барабан, от него расходятся трубы -->
    ${tubes.map(([x1, y1, x2, y2]) => `<path d="M${x1} ${y1 + 50}Q${(x1 + x2) / 2} ${y2 + 160} ${x2} ${y2 + 80}V0" stroke="#000" stroke-width="18" fill="none"/><path d="M${x1} ${y1 + 50}Q${(x1 + x2) / 2} ${y2 + 160} ${x2} ${y2 + 80}V0" stroke="url(#brassH7)" stroke-width="12" fill="none" opacity=".9"/>`).join('')}
    <!-- большой экран над коллектором -->
    <rect x="244" y="26" width="312" height="144" rx="4" fill="#111" stroke="#cfd8e0" stroke-width="4"/>${screenFill}
    <path d="M300 170v14M500 170v14" stroke="#555" stroke-width="5"/><rect x="380" y="164" width="40" height="8" fill="#222" stroke="#666"/>
    <ellipse cx="400" cy="330" rx="100" ry="16" fill="#000" opacity=".6"/>
    <path d="M318 214H482V318H318Z" fill="url(#brassH7)" stroke="#000" stroke-width="3"/><ellipse cx="400" cy="214" rx="82" ry="16" fill="${BRASSL}" stroke="#000" stroke-width="3"/><ellipse cx="400" cy="318" rx="82" ry="16" fill="${BRASSD}" stroke="#000" stroke-width="3"/>
    ${range(8).map(i => `<ellipse cx="${f1(400 + Math.cos(i * .785) * 62)}" cy="${f1(214 + Math.sin(i * .785) * 11)}" rx="8" ry="3" fill="#000"/>`).join('')}
    <g stroke="#000" stroke-width="1.5" fill="none" opacity=".5">${range(6).map(i => `<path d="M${330 + i * 28} 228V306"/>`).join('')}</g>
    <rect x="344" y="252" width="112" height="30" fill="#1a120a" stroke="${BRASSL}" stroke-width="2"/><text x="400" y="265" ${F} font-size="8" text-anchor="middle" fill="${BRASSL}">ПНЕВМОПОЧТА</text><text x="400" y="277" ${F} font-size="6.5" text-anchor="middle" fill="${BRASSL}">МУНИЦИПАЛИТЕТ ГОТЭМА · 1924</text>
    ${circleA(400, 300, 10, RED, 0, 2)}
    <!-- стойки капсул -->
    ${range(2).map(r => range(5).map(c => `<g transform="translate(${500 + c * 16} ${222 + r * 42})"><rect x="-5" y="0" width="10" height="34" rx="5" fill="url(#brassH7)" stroke="#000" stroke-width="1.2"/><path d="M-5 8h10M-5 26h10" stroke="#000" stroke-width="1"/></g>`).join('')).join('')}
    <!-- сейф-труба с графическим замком -->
    <path d="M58 206H190V318H58Z" fill="#1e1a16" stroke="#cfd8e0" stroke-width="3"/>
    <circle cx="124" cy="262" r="48" fill="url(#brassH7)" stroke="#000" stroke-width="3"/><circle cx="124" cy="262" r="40" fill="#3a2a14" stroke="${BRASSL}" stroke-width="2"/>
    ${range(8).map(i => `<circle cx="${f1(124 + Math.cos(i * .785) * 44)}" cy="${f1(262 + Math.sin(i * .785) * 44)}" r="3" fill="#222"/>`).join('')}
    <rect x="100" y="238" width="48" height="48" rx="4" fill="#0b1418" stroke="#9fd" stroke-width="1.5"/>${range(9).map(i => `<circle cx="${110 + (i % 3) * 14}" cy="${248 + Math.floor(i / 3) * 14}" r="2.5" fill="#9fd"/>`).join('')}
    <path d="M110 276L110 262L124 248L138 262L138 276" stroke="#9fd" stroke-width="1.2" fill="none" opacity=".25"/>
    <text x="124" y="226" ${F} font-size="8" text-anchor="middle" fill="#cfd8e0">ТРУБА №4</text>
    <!-- газетная вырезка на кирпиче -->
    <g transform="rotate(-5 160 112)"><rect x="118" y="100" width="88" height="70" fill="#e0d6b8" stroke="#000" stroke-width="1.5"/><rect x="124" y="106" width="76" height="10" fill="#222"/><text x="162" y="114" ${F} font-size="7" text-anchor="middle" fill="#fff">САНТА-ПРИСКА</text>
      <path d="M124 124h76M124 130h70M124 136h74M124 142h40" stroke="#666" stroke-width="1.2"/><rect x="168" y="140" width="32" height="24" fill="#555"/><path d="M174 162q10 -20 20 0" fill="#222"/><circle cx="160" cy="102" r="3" fill="${RED}"/></g>
    <!-- стена мониторов: там стучат клавиши -->
    <g>${[[548, 190], [606, 186], [664, 194], [554, 246], [616, 244], [674, 250]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="54" height="46" rx="4" fill="#1a1a1a" stroke="#888" stroke-width="2"/><rect x="${x + 5}" y="${y + 5}" width="44" height="32" fill="${on ? '#3a0606' : ['#0b2a33', '#1a0a0a', '#0b2a33', '#14141a', '#0b2a33', '#1a0a0a'][i]}"/>${on || i % 2 ? circleA(x + 27, y + 21, 10, RED, 0, 2) : `<path d="M${x + 9} ${y + 12}h20M${x + 9} ${y + 18}h30M${x + 9} ${y + 24}h14M${x + 9} ${y + 30}h26" stroke="#9fd" stroke-width="1.5"/>`}`).join('')}</g>
    <rect x="560" y="300" width="160" height="16" fill="#222" stroke="#888" stroke-width="2"/><g fill="#555">${range(18).map(i => `<rect x="${566 + i * 8}" y="304" width="6" height="4"/><rect x="${566 + i * 8}" y="309" width="6" height="4"/>`).join('')}</g>
    ${on ? '' : `<rect x="540" y="180" width="200" height="140" fill="url(#lampGlow)" opacity=".2"/><path d="M600 318l14 -16l10 6" stroke="#cfd8e0" stroke-width="2" fill="none" opacity=".6"/>`}
    <!-- флаг, постер -->
    <path d="M226 92V150" stroke="#555" stroke-width="2"/><path d="M226 96Q250 92 272 100V140Q250 132 226 136Z" fill="#111" stroke="#cfd8e0" stroke-width="1.5"/>${circleA(249, 118, 12, RED, 0, 2.2)}
    <g transform="rotate(4 740 140)"><rect x="700" y="104" width="84" height="104" fill="#111" stroke="#cfd8e0" stroke-width="2"/>${circleA(742, 146, 24, RED, 3, 4)}<text x="742" y="188" ${F} font-size="7" text-anchor="middle" fill="#fff">АНАРХИЯ —</text><text x="742" y="198" ${F} font-size="7" text-anchor="middle" fill="#fff">ЭТО ПОРЯДОК</text></g>
    <!-- пол -->
    <path d="M0 330H800" stroke="#cfd8e0" stroke-width="3"/><rect y="332" width="800" height="168" fill="#0d0a08"/>
    <g stroke="#1a130f" stroke-width="2">${range(12).map(i => `<path d="M${i * 72} 332L${i * 72 - 50} 500"/>`).join('')}<path d="M0 400H800"/></g>
    ${on ? '<ellipse cx="400" cy="380" rx="300" ry="40" fill="#ece6d6" opacity=".06"/>' : ''}
    <!-- верстак: детонаторы, паяльник -->
    <path d="M230 380H520V394H230Z" fill="#3a2a1c" stroke="#cfd8e0" stroke-width="2.5"/><path d="M242 394V470M508 394V470" stroke="#cfd8e0" stroke-width="5"/>
    <rect x="250" y="362" width="110" height="18" fill="#222" stroke="#888"/>${range(10).map(i => `<circle cx="${260 + i * 10}" cy="371" r="4" fill="#2a4a2a" stroke="#9a9" stroke-width="1"/>`).join('')}
    <path d="M380 378l60 -20" stroke="#ccc" stroke-width="4"/><path d="M440 358l10 -4" stroke="#ffd400" stroke-width="3"/><path d="M448 352q4 -10 -2 -18q6 -6 0 -14" stroke="#aaa" stroke-width="1.5" fill="none" opacity=".6"/>
    ${range(3).map(i => `<rect x="${470 + i * 13}" y="${360 + (i % 2) * 4}" width="10" height="${20 - (i % 2) * 4}" rx="2" fill="${['#2fae5a', '#d0142c', '#2f6bff'][i]}" stroke="#000"/>`).join('')}
    <!-- матрас, скейт, банки -->
    <path d="M20 430H200V462H20Z" fill="#3a3a44" stroke="#888" stroke-width="2"/><path d="M30 424q40 -10 90 0q30 6 70 0V440H30Z" fill="#5a2a2a" stroke="#888" stroke-width="1.5"/>
    <g transform="rotate(-12 640 450)"><rect x="590" y="444" width="110" height="12" rx="6" fill="#222" stroke="#999" stroke-width="2"/><circle cx="606" cy="460" r="5" fill="#ffd400"/><circle cx="684" cy="460" r="5" fill="#ffd400"/></g>
    ${[[214, 470], [228, 474], [700, 420]].map(([x, y]) => `<rect x="${x}" y="${y - 16}" width="9" height="16" rx="2" fill="#2fae5a" stroke="#000"/>`).join('')}
    ${marker(160, 494, on ? 5 : 4)}
    `);
  }
  const c7s4 = () => hideout(false);
  const c7s5 = () => hideout(true);

  /* ---------- сюжетные панели ---------- */
  function splash7() {
    const q = rng(5);
    return S(`
    <rect width="800" height="420" fill="#07080c"/>
    <!-- прожекторы праздника режут небо -->
    <path d="M150 420L60 0H120Z" fill="#fff4c8" opacity=".06"/><path d="M640 420L760 0H700Z" fill="#fff4c8" opacity=".06"/><path d="M420 420L330 0H380Z" fill="#fff4c8" opacity=".04"/>
    <g fill="#0f1218">${range(26).map(i => { const w = 22 + q() * 30, h = 60 + q() * 150; return `<rect x="${i * 32 - 10}" y="${300 - h}" width="${w}" height="${h + 120}"/>`; }).join('')}</g>
    <g fill="#ffd77a" opacity=".5">${range(90).map(() => `<rect x="${f1(q() * 800)}" y="${f1(120 + q() * 180)}" width="2" height="3"/>`).join('')}</g>
    <!-- башня с проекцией «50» -->
    <path d="M520 300V60L552 30L584 60V300Z" fill="#141820" stroke="#3a4250" stroke-width="2"/><path d="M552 30V4" stroke="#3a4250" stroke-width="3"/><circle cx="552" cy="4" r="3" fill="${RED}"/>
    <text x="552" y="120" ${F} font-size="38" text-anchor="middle" fill="#fff4c8" opacity=".85" filter="url(#glowS)">50</text>
    ${range(12).map(i => `<rect x="${526 + (i % 3) * 18}" y="${150 + Math.floor(i / 3) * 34}" width="10" height="16" fill="#ffd77a" opacity=".6"/>`).join('')}
    <!-- рекламный щит «Зари» на крыше -->
    <path d="M150 330L170 300M630 330L610 300M280 330V310M500 330V310" stroke="#555" stroke-width="5"/>
    <rect x="120" y="150" width="560" height="160" fill="#e8eef2" stroke="#000" stroke-width="5"/><rect x="120" y="150" width="560" height="160" fill="url(#htk)" opacity=".08"/>
    <rect x="120" y="150" width="200" height="160" fill="#0b2a3a"/>${sunLogo(220, 250, 1.6, ZARYA)}<circle cx="220" cy="240" r="70" fill="url(#zg7)" opacity=".35"/>
    <text x="490" y="214" ${F} font-size="56" text-anchor="middle" fill="#0b2a3a" letter-spacing="4">ЗАРЯ</text>
    <text x="490" y="246" ${F} font-size="16" text-anchor="middle" fill="#0b2a3a">ЧИСТЫЙ СВЕТ ДЛЯ ГОТЭМА</text>
    <text x="490" y="278" ${F} font-size="13" text-anchor="middle" fill="#555">ПРЕЗЕНТАЦИЯ · СЕГОДНЯ · 00:00</text>
    ${range(6).map(i => `<path d="M${150 + i * 100} 310V318" stroke="#888" stroke-width="4"/><circle cx="${150 + i * 100}" cy="322" r="5" fill="#fff4c8"/>`).join('')}
    ${circleA(612, 214, 46, RED, 8, 9)}
    <text x="404" y="300" ${F} font-size="17" fill="${RED}" transform="rotate(-5 404 300)">СВЕТ ПОГАСНЕТ</text><path d="M330 214l300 30" stroke="${RED}" stroke-width="6" opacity=".75" stroke-linecap="round"/>
    <!-- крыша -->
    <rect y="330" width="800" height="90" fill="#050506"/><path d="M0 332H800" stroke="#cfd8e0" stroke-width="3"/>
    <g transform="translate(700 250)"><path d="M-30 82L-24 30M30 82L24 30M-24 56H24" stroke="#222" stroke-width="4"/><path d="M-30 30V-10Q0 -26 30 -10V30Z" fill="#141414" stroke="#3a3a3a" stroke-width="2"/><path d="M-30 30V-10Q0 -26 30 -10" fill="none" stroke="#cfd8e0" stroke-width="1.5" opacity=".4"/><path d="M-30 4H30M-30 18H30" stroke="#2a2a2a" stroke-width="2"/></g>
    <rect x="240" y="350" width="70" height="40" fill="#141414" stroke="#3a3a3a" stroke-width="2"/><circle cx="275" cy="370" r="14" fill="#0a0a0a" stroke="#3a3a3a" stroke-width="2"/><path d="M275 356v28M261 370h28" stroke="#2a2a2a" stroke-width="2"/>
    <path d="M380 332V300h14v32M420 332v-24h10v24" fill="#141414" stroke="#3a3a3a" stroke-width="2"/>
    <g transform="translate(90 360)"><rect x="0" y="0" width="12" height="30" rx="3" fill="#ccc" stroke="#000" stroke-width="1.5"/><rect x="0" y="10" width="12" height="9" fill="${RED}"/><rect x="3" y="-5" width="6" height="5" fill="#333"/></g>
    <g transform="translate(112 384) rotate(80)"><rect x="0" y="0" width="12" height="30" rx="3" fill="#ccc" stroke="#000" stroke-width="1.5"/><rect x="0" y="10" width="12" height="9" fill="${RED}"/></g>
    `, '0 0 800 420');
  }
  // Оракул — только голос на защищённом канале
  function oracle() {
    const q = rng(9);
    const wave = range(40).map(i => `${i * 5},${f1(150 + Math.sin(i * .7) * (6 + q() * 26) * Math.sin(i / 40 * Math.PI))}`).join(' ');
    return svg(`
    <rect width="200" height="230" fill="#062028"/><rect width="200" height="230" fill="url(#ht)" opacity=".06"/>
    <g stroke="#0d3a46" stroke-width="1">${range(12).map(i => `<path d="M0 ${i * 20}H200M${i * 20} 0V230"/>`).join('')}</g>
    <g fill="none" stroke="#9fe8ff"><circle cx="100" cy="72" r="16" stroke-width="5"/><circle cx="100" cy="72" r="32" stroke-width="3" opacity=".7"/><circle cx="100" cy="72" r="48" stroke-width="2" opacity=".4"/><circle cx="100" cy="72" r="5" fill="#9fe8ff"/></g>
    <g class="or-wave"><polyline points="${wave}" fill="none" stroke="#9fe8ff" stroke-width="3" filter="url(#glowS)"/></g>
    <path d="M0 150H200" stroke="#0d3a46" stroke-width="1"/>
    <rect x="0" y="184" width="200" height="46" fill="#000" opacity=".5"/>
    <text x="100" y="208" font-family="Russo One, Arial Black, sans-serif" font-size="20" text-anchor="middle" fill="#fff" letter-spacing="4">ОРАКУЛ</text>
    <text x="100" y="223" font-family="monospace" font-size="8" text-anchor="middle" fill="#9fe8ff">ЗАЩИЩЁННЫЙ КАНАЛ · ГОЛОС</text>
    <circle cx="16" cy="16" r="5" fill="${RED}"/><text x="26" y="20" font-family="monospace" font-size="9" fill="#fff">REC</text>
    `, '0 0 200 230');
  }
  function anarkyFlyer() {
    return S(`
    <rect width="800" height="420" fill="#0e1012"/>
    <g stroke="#181c1f" stroke-width="2">${range(18).map(i => `<path d="M${i * 48} 0L${i * 48 - 120} 420"/>`).join('')}</g>
    <ellipse cx="560" cy="330" rx="200" ry="40" fill="#1a2a36" opacity=".6"/>
    <g transform="rotate(-6 400 210)">
      <path d="M220 40L590 52L580 380L230 368Z" fill="${PAPER}" stroke="#000" stroke-width="3"/>
      <path d="M220 40L590 52L580 380L230 368Z" fill="url(#htk)" opacity=".07"/>
      <path d="M300 60l-20 300M480 54l14 320M226 200l360 10" stroke="#c8c0aa" stroke-width="2" fill="none"/>
      ${circleA(400, 130, 56, '#111', 4, 9)}
      <text x="400" y="232" ${F} font-size="22" text-anchor="middle" fill="#111">ГОТЭМ ПРИНАДЛЕЖИТ</text>
      <text x="400" y="260" ${F} font-size="22" text-anchor="middle" fill="#111">НЕ УЭЙНАМ</text>
      <text x="400" y="296" ${F} font-size="15" text-anchor="middle" fill="${RED}">В ПОЛНОЧЬ СВЕТ ПОГАСНЕТ</text>
      <text x="400" y="320" ${F} font-size="12" text-anchor="middle" fill="#333">И ВЫ УВИДИТЕ ГОРОД БЕЗ ХОЗЯЕВ</text>
      <text x="400" y="350" ${MONO} font-size="12" text-anchor="middle" fill="#333">СЛУШАЙ: 66,6 FM</text>
      <path d="M470 300q40 30 90 20q-10 30 -60 50q-30 -30 -30 -70z" fill="#5a4a3a" opacity=".25"/>
    </g>
    <path d="M610 330l60 -10l40 30l-50 20z" fill="#000" opacity=".4"/>
    `, '0 0 800 420');
  }
  // энергетическая ячейка, вскрытая: экспонат к проводам
  function zaryaCell() {
    return S(`<rect width="600" height="360" fill="#0d1014"/><g stroke="#151a20" stroke-width="1">${range(16).map(i => `<path d="M${i * 40} 0V360M0 ${i * 40}H600"/>`).join('')}</g>
      ${cellBody(220, 110, 1.2, true)}
      <g transform="translate(380 60)"><rect width="190" height="220" fill="${PAPER}" stroke="#000" stroke-width="2"/><text x="95" y="22" ${F} font-size="11" text-anchor="middle" fill="#000">ПАСПОРТ ЯЧЕЙКИ «ЗАРЯ»</text>
        <path d="M14 34H176" stroke="#000" stroke-width="1.5"/><text x="14" y="54" ${MONO} font-size="10" fill="#000">Модель: З-24/5</text><text x="14" y="72" ${MONO} font-size="10" fill="#000">Ёмкость: 2,4 МВт·ч</text><text x="14" y="90" ${MONO} font-size="10" fill="#000">Защита: тройная</text><text x="14" y="108" ${MONO} font-size="10" fill="#000">Пуск: сигнал сети</text>
        <path d="M14 122H176" stroke="#000" stroke-width="1"/><text x="14" y="142" ${MONO} font-size="10" fill="${RED}">Чужой модуль:</text><text x="14" y="160" ${MONO} font-size="10" fill="${RED}">капсюль + таймер</text><text x="14" y="178" ${MONO} font-size="10" fill="${RED}">в кожухе охлаждения</text>
        <g transform="translate(150 196) scale(.4)">${circleA(0, 0, 24, RED, 0, 4)}</g></g>`, '0 0 600 360');
  }
  function anarkyCaught() {
    return S(`
    <rect width="800" height="420" fill="#0d0a08"/>
    <g stroke="#1f1612" stroke-width="2">${range(24).map(r => `<path d="M0 ${r * 18}H800"/>${range(22).map(c => `<path d="M${c * 40 + (r % 2) * 20} ${r * 18}v18"/>`).join('')}`).join('')}</g>
    <rect width="800" height="420" fill="#000" opacity=".35"/>
    <!-- латунная труба поперёк кадра -->
    <path d="M-20 170L820 250" stroke="#000" stroke-width="54"/><path d="M-20 170L820 250" stroke="url(#brass7)" stroke-width="46"/>
    <path d="M-20 158L820 238" stroke="${BRASSL}" stroke-width="4" opacity=".6"/>
    ${[160, 520].map(x => `<path d="M${x} ${170 + x * .095 - 30}v60" stroke="#000" stroke-width="20"/><path d="M${x} ${170 + x * .095 - 30}v60" stroke="${BRASSD}" stroke-width="14"/>`).join('')}
    <!-- рука в рукаве толстовки, стянута хомутом -->
    <path d="M190 420Q240 330 330 260L382 300Q320 360 300 420Z" fill="#26282c" stroke="#000" stroke-width="3"/><path d="M220 420Q260 350 340 280" stroke="#3a3c42" stroke-width="3" fill="none"/>
    <path d="M330 260L382 300" stroke="#111" stroke-width="10"/>
    <path d="M352 268Q372 236 400 226Q426 222 434 238Q440 254 420 262Q404 266 398 282Q388 296 372 290Z" fill="#e6c9a8" stroke="#000" stroke-width="3"/>
    <path d="M404 236q10 -2 20 2M408 246q10 0 16 4" stroke="#000" stroke-width="2" fill="none"/>
    <path d="M356 252Q372 268 392 276" stroke="#fff" stroke-width="7" fill="none"/><path d="M356 252Q372 268 392 276" stroke="#111" stroke-width="2" fill="none" stroke-dasharray="3 2"/>
    <path d="M392 276Q410 250 420 214" stroke="#fff" stroke-width="6" fill="none"/><path d="M416 212l8 -6l4 8" fill="#fff" stroke="#000"/>
    <!-- трос Робина, баллончик, треснувший планшет -->
    <path d="M800 120Q640 150 520 200" stroke="#ffd400" stroke-width="4" fill="none"/><path d="M520 200l-14 4l6 10" stroke="#888" stroke-width="5" fill="none"/>
    <g transform="translate(560 330) rotate(70)"><rect x="0" y="0" width="22" height="56" rx="5" fill="#ccc" stroke="#000" stroke-width="2"/><rect x="0" y="18" width="22" height="16" fill="${RED}"/><rect x="6" y="-8" width="10" height="8" fill="#333"/></g>
    <path d="M520 360q20 10 44 4" stroke="${RED}" stroke-width="5" fill="none" opacity=".8"/>
    <g transform="rotate(-8 660 360)"><rect x="600" y="320" width="130" height="86" rx="6" fill="#111" stroke="#999" stroke-width="3"/><rect x="608" y="328" width="114" height="70" fill="#0b2a33"/>${circleA(665, 362, 22, RED, 0, 3.5)}<path d="M610 400l40 -40l20 10l50 -36M640 330l20 30" stroke="#cfd8e0" stroke-width="1.5" opacity=".8"/></g>
    <circle cx="400" cy="250" r="190" fill="url(#lampGlow)" opacity=".18"/>
    `, '0 0 800 420');
  }
  function screenOn() {
    const q = rng(31);
    return S(`
    <rect width="800" height="420" fill="#070505"/>
    <rect x="150" y="30" width="500" height="240" rx="6" fill="#111" stroke="#cfd8e0" stroke-width="5"/>
    <rect x="164" y="44" width="472" height="212" fill="#d8d4c8"/>
    <g fill="#fff">${range(260).map(() => `<rect x="${f1(164 + q() * 468)}" y="${f1(44 + q() * 208)}" width="${f1(1 + q() * 6)}" height="2"/>`).join('')}</g>
    <g fill="#222">${range(320).map(() => `<rect x="${f1(164 + q() * 468)}" y="${f1(44 + q() * 208)}" width="${f1(1 + q() * 5)}" height="2"/>`).join('')}</g>
    <path d="M164 140H636" stroke="#fff" stroke-width="10" opacity=".35"/><path d="M164 152H636" stroke="#000" stroke-width="3" opacity=".25"/>
    <ellipse cx="400" cy="420" rx="420" ry="160" fill="url(#scr7)" opacity=".55"/>
    <path d="M330 270v24M470 270v24" stroke="#555" stroke-width="7"/>
    <!-- коллектор и трубы в контровом свете -->
    <path d="M300 420V330H500V420Z" fill="#000"/><ellipse cx="400" cy="330" rx="100" ry="18" fill="#000" stroke="#d8d4c8" stroke-width="2" opacity=".9"/>
    ${[[0, 360, 300, 340], [500, 340, 800, 300], [0, 300, 160, 290]].map(([a, b, c, d]) => `<path d="M${a} ${b}L${c} ${d}" stroke="#000" stroke-width="22"/><path d="M${a} ${b - 9}L${c} ${d - 9}" stroke="#d8d4c8" stroke-width="2" opacity=".5"/>`).join('')}
    <g transform="translate(660 300)"><rect x="0" y="0" width="70" height="56" fill="#000"/><path d="M0 0H70" stroke="#d8d4c8" stroke-width="2" opacity=".6"/></g>
    <circle cx="590" cy="250" r="4" fill="${RED}"/><text x="602" y="254" ${MONO} font-size="11" fill="${RED}">● ВХОДЯЩИЙ СИГНАЛ</text>
    `, '0 0 800 420');
  }
  // кадр новостей: горящая башня, вертолёт, машины внизу
  function newsGotham() {
    const q = rng(12);
    return S(`
    <rect width="800" height="450" fill="url(#sky7)"/>
    ${range(12).map(i => `<ellipse cx="${f1(250 + i * 30 + q() * 40)}" cy="${f1(220 - i * 18)}" rx="${f1(70 + i * 12)}" ry="${f1(30 + i * 6)}" fill="${i < 4 ? '#2a1e1e' : '#3a3034'}" opacity=".8"/>`).join('')}
    <g fill="#120c0d">${range(14).map(i => { const h = 80 + q() * 120; return `<rect x="${i * 60 - 10}" y="${380 - h}" width="${40 + q() * 20}" height="${h + 80}"/>`; }).join('')}</g>
    <path d="M300 450V110L360 70L420 110V450Z" fill="#0b0808" stroke="#3a2420" stroke-width="2"/><path d="M360 70V40" stroke="#3a2420" stroke-width="4"/>
    ${range(10).map(r => range(5).map(c => `<rect x="${310 + c * 22}" y="${130 + r * 30}" width="12" height="16" fill="${(r * 5 + c) % 4 === 0 || r < 3 ? '#ff8a2a' : '#2a1410'}" opacity="${r < 3 ? .95 : .7}"/>`).join('')).join('')}
    <circle cx="360" cy="150" r="150" fill="url(#fireGlow)"/>
    ${[[312, 120, 96], [300, 210, 40], [380, 260, 44]].map(([x, y, w]) => `<path d="M${x} ${y}${range(8).map(k => `q${f1(w / 16)} -${f1(20 + q() * 40)} ${f1(w / 8)} 0`).join('')}Z" fill="${RED}"/><path d="M${x + 6} ${y}${range(6).map(k => `q${f1((w - 12) / 12)} -${f1(12 + q() * 22)} ${f1((w - 12) / 6)} 0`).join('')}Z" fill="#ff8a2a"/><path d="M${x + 14} ${y}${range(4).map(k => `q${f1((w - 28) / 8)} -${f1(8 + q() * 12)} ${f1((w - 28) / 4)} 0`).join('')}Z" fill="#ffd23f"/>`).join('')}
    <!-- вертолёт с прожектором -->
    <path d="M660 70L520 300L600 300Z" fill="#fff4c8" opacity=".1"/>
    <g transform="translate(660 60)"><ellipse cx="0" cy="0" rx="24" ry="9" fill="#111"/><path d="M20 -2H56M-30 -12H34" stroke="#111" stroke-width="3"/><path d="M50 -8v12" stroke="#111" stroke-width="3"/><circle cx="-14" cy="2" r="3" fill="#fff4c8"/><circle cx="20" cy="-6" r="2" fill="${RED}"/></g>
    <g fill="#ff3030">${range(6).map(i => `<rect x="${120 + i * 90}" y="${420 + (i % 2) * 6}" width="${8}" height="4"/>`).join('')}</g><g fill="#3a6bff">${range(6).map(i => `<rect x="${132 + i * 90}" y="${420 + (i % 2) * 6}" width="8" height="4"/>`).join('')}</g>
    <g fill="#8a7a74" opacity=".7">${range(60).map(() => `<rect x="${f1(q() * 800)}" y="${f1(q() * 450)}" width="2" height="2"/>`).join('')}</g>
    `, '0 0 800 450');
  }
  function gothamBurns() {
    const q = rng(44);
    return S(`
    <rect width="800" height="420" fill="url(#sky7)"/>
    ${range(5).map(k => { const x = 70 + k * 160; return range(7).map(i => `<ellipse cx="${f1(x + i * 22 + q() * 20)}" cy="${f1(200 - i * 26)}" rx="${f1(30 + i * 14)}" ry="${f1(16 + i * 7)}" fill="${i < 2 ? '#2a1c1c' : '#433a3e'}" opacity=".75"/>`).join(''); }).join('')}
    <g fill="#100a0b">${range(30).map(i => { const h = 40 + q() * 90; return `<rect x="${i * 28 - 6}" y="${330 - h}" width="${20 + q() * 12}" height="${h}"/>`; }).join('')}</g>
    ${range(5).map(k => { const x = 50 + k * 160, h = 150 + (k * 37) % 60, w = 34 + (k % 2) * 10; return `<path d="M${x} 330V${330 - h}H${x + w}V330Z" fill="#0a0707"/>${range(Math.floor(h / 20)).map(r => `<rect x="${x + 6}" y="${334 - h + r * 20}" width="${w - 12}" height="8" fill="${r < 3 ? '#ff8a2a' : '#2a120e'}" opacity=".8"/>`).join('')}<path d="M${x - 4} ${330 - h}${range(6).map(i => `q${f1((w + 8) / 12)} -${f1(16 + q() * 30)} ${f1((w + 8) / 6)} 0`).join('')}Z" fill="${RED}"/><path d="M${x + 4} ${330 - h}${range(4).map(i => `q${f1((w - 8) / 8)} -${f1(10 + q() * 18)} ${f1((w - 8) / 4)} 0`).join('')}Z" fill="#ffd23f"/><circle cx="${x + w / 2}" cy="${330 - h}" r="80" fill="url(#fireGlow)"/>`; }).join('')}
    <!-- крыша управления полиции: прожектор погашен -->
    <path d="M520 420V352H800V420Z" fill="#050404"/><path d="M520 352H800" stroke="#5a4a4a" stroke-width="2"/>
    <g transform="translate(680 330)"><path d="M-30 22H30L20 0H-20Z" fill="#111" stroke="#5a4a4a" stroke-width="2"/><ellipse cx="0" cy="-10" rx="30" ry="28" fill="#141010" stroke="#5a4a4a" stroke-width="3"/><ellipse cx="0" cy="-10" rx="22" ry="20" fill="#0a0808"/><path d="M-14 -22l28 24" stroke="#2a2222" stroke-width="2"/></g>
    <g fill="#9a8a84" opacity=".7">${range(80).map(() => `<rect x="${f1(q() * 800)}" y="${f1(q() * 420)}" width="2" height="2"/>`).join('')}</g>
    `, '0 0 800 420');
  }

  Object.assign(window.Art, { c7s1, c7s2, c7s3, c7s4, c7s5, splash7, oracle, anarkyFlyer, zaryaCell, anarkyCaught, screenOn, newsGotham, gothamBurns, circleA7: circleA });
})();
