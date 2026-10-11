/* Комиксная графика: чёрное, белое и один красный. Всё нарисовано SVG-кодом. */
(function () {
  const RED = '#d0142c';
  const range = n => Array.from({ length: n }, (_, i) => i);
  const svg = (inner, vb) => `<svg viewBox="${vb || '0 0 800 500'}" xmlns="http://www.w3.org/2000/svg" role="img">${inner}</svg>`;
  function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }

  const rainLines = (x, y, w, h, n, seed, col) => {
    const r = rng(seed);
    return range(n).map(() => { const a = x + r() * w, b = y + r() * h, l = 10 + r() * 22; return `<line x1="${a.toFixed(0)}" y1="${b.toFixed(0)}" x2="${(a - l * 0.35).toFixed(0)}" y2="${(b + l).toFixed(0)}" stroke="${col || '#000'}" stroke-width="1.6"/>`; }).join('');
  };

  const clock = (cx, cy, r, h, m) => {
    const ha = (h % 12 + m / 60) * 30 - 90, ma = m * 6 - 90, rad = Math.PI / 180;
    return `<g><circle cx="${cx}" cy="${cy}" r="${r}" fill="#000" stroke="#fff" stroke-width="3"/>
    <line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(ha * rad) * r * 0.5).toFixed(1)}" y2="${(cy + Math.sin(ha * rad) * r * 0.5).toFixed(1)}" stroke="#fff" stroke-width="3"/>
    <line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(ma * rad) * r * 0.8).toFixed(1)}" y2="${(cy + Math.sin(ma * rad) * r * 0.8).toFixed(1)}" stroke="#fff" stroke-width="2"/></g>`;
  };

  // лежащее тело: силуэт, голова слева
  const body = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s || 1})" stroke="#fff" stroke-width="3" stroke-linejoin="round" fill="#000">
    <path d="M150 -18 l118 6 l-2 20 l-116 8z"/>
    <path d="M262 -14 l26 -14 l8 10 l-22 20z"/>
    <path d="M22 -14 q62 -22 130 -6 l8 42 q-74 14 -138 2z"/>
    <path d="M96 28 q84 30 170 22 l2 12 q-96 12 -180 -16z"/>
    <circle cx="0" cy="0" r="23"/>
    <rect x="-12" y="-13" width="20" height="7" fill="${RED}" stroke="none"/>
  </g>`;

  /* ============ МЕСТО 1: часовая мастерская ============ */
  function scene1() {
    const clocks = [[340, 92, 34, 3, 40], [425, 68, 22, 7, 15], [492, 122, 40, 10, 10], [575, 78, 26, 5, 50], [648, 126, 30, 1, 35], [722, 76, 24, 8, 20], [738, 160, 18, 11, 5], [398, 158, 18, 2, 55], [566, 160, 15, 6, 30]];
    return svg(`
    <rect width="800" height="500" fill="#000"/>
    <rect x="252" y="20" width="548" height="315" fill="url(#ht)" opacity=".10"/>
    <!-- окно с жалюзи -->
    <rect x="40" y="50" width="190" height="250" fill="#fff"/>
    <path d="M40 300V212h28v-42h26v62h30v-96h22v72h34v-30h20v52h30v70z" fill="#000"/>
    ${rainLines(40, 50, 190, 120, 26, 3)}
    <g fill="#000">${range(12).map(i => `<rect x="40" y="${50 + i * 21}" width="190" height="9"/>`).join('')}</g>
    <rect x="131" y="50" width="6" height="250" fill="#000"/>
    <rect x="34" y="44" width="202" height="262" fill="none" stroke="#fff" stroke-width="5"/>
    <!-- пол и полосы света -->
    <line x1="0" y1="335" x2="800" y2="335" stroke="#fff" stroke-width="3"/>
    <g fill="#fff">${range(8).map(i => `<polygon points="${60 + i * 62},337 ${92 + i * 62},337 ${262 + i * 62},500 ${222 + i * 62},500"/>`).join('')}</g>
    <!-- стена часов -->
    ${clocks.map(c => clock(...c)).join('')}
    <g stroke="#fff" stroke-width="3" fill="#000"><rect x="296" y="150" width="26" height="150"/><circle cx="309" cy="172" r="10"/><line x1="309" y1="186" x2="309" y2="270"/><circle cx="309" cy="274" r="8" fill="#fff"/></g>
    <!-- отрывной календарь -->
    <g transform="rotate(-3 285 230)"><rect x="252" y="196" width="46" height="62" fill="#fff"/><rect x="252" y="196" width="46" height="13" fill="${RED}"/><text x="275" y="248" font-family="Russo One, Arial Black, sans-serif" font-size="34" text-anchor="middle" fill="#000">1</text></g>
    <!-- прилавок -->
    <rect x="440" y="255" width="340" height="80" fill="#000" stroke="#fff" stroke-width="3"/>
    <rect x="440" y="255" width="340" height="80" fill="url(#hatch)" opacity=".28"/>
    <rect x="432" y="246" width="356" height="12" fill="#fff"/>
    <path d="M470 246v-30h40v-14h26v14h14v30z" fill="#000" stroke="#fff" stroke-width="3"/>
    <circle cx="590" cy="232" r="11" fill="none" stroke="#fff" stroke-width="3"/><line x1="598" y1="240" x2="612" y2="246" stroke="#fff" stroke-width="4"/>
    <!-- монитор камеры -->
    <rect x="640" y="192" width="84" height="56" fill="#fff"/><rect x="646" y="198" width="72" height="44" fill="#000"/>
    <circle cx="682" cy="220" r="14" fill="none" stroke="#fff" stroke-width="2"/><path d="M682 220l-6 -8M682 220l-7 -10" stroke="#fff" stroke-width="2"/>
    <circle cx="712" cy="203" r="3" fill="${RED}"/>
    <path d="M700 0v22l34 14v-12z" fill="#fff"/>
    <!-- тело -->
    ${body(292, 414, 1)}
    <g transform="rotate(14 586 452)"><rect x="566" y="440" width="34" height="22" fill="#fff"/><rect x="566" y="440" width="34" height="6" fill="${RED}"/></g>
    <path d="M250 468q40 14 90 4" stroke="${RED}" stroke-width="3" fill="none"/>
    `);
  }

  /* ============ МЕСТО 2: планетарий ============ */
  function scene2() {
    const r = rng(11);
    let stars = '';
    for (let i = 0; i < 150; i++) {
      const x = 60 + r() * 680, y = 40 + r() * 280;
      if (((x - 400) / 372) ** 2 + ((y - 330) / 300) ** 2 > 0.9) continue;
      stars += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(0.7 + r() * 1.9).toFixed(1)}" fill="#fff"/>`;
    }
    const seats = (y, n, x0, step) => range(n).map(i => `<path d="M${x0 + i * step} ${y + 60}v-40q0 -22 24 -22q24 0 24 22v40z" fill="#000" stroke="#fff" stroke-width="3"/>`).join('');
    return svg(`
    <rect width="800" height="500" fill="#000"/>
    <path d="M20 335 Q400 -265 780 335z" fill="#05060c" stroke="#fff" stroke-width="5"/>
    <path d="M20 335 Q400 -265 780 335" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="2 14" transform="translate(0 16)"/>
    ${stars}
    <g stroke="#fff" stroke-width="1.2" fill="none" opacity=".8">
      <polyline points="150,250 190,222 232,236 262,204 310,212"/><polyline points="520,250 560,268 610,246 640,276 600,300 560,268"/>
      <polyline points="330,120 362,96 404,104 430,80"/><polyline points="470,150 506,138 520,170 556,160"/>
    </g>
    <path id="s2arc" d="M150 262 Q400 70 650 262" fill="none"/>
    <text font-family="Russo One, Arial Black, sans-serif" font-size="22" fill="${RED}" letter-spacing="2"><textPath href="#s2arc" startOffset="50%" text-anchor="middle">KALENDIS · DEBITA · SOLVUNTUR</textPath></text>
    <!-- лучи проектора -->
    <g stroke="#fff" stroke-width="1" opacity=".22"><line x1="436" y1="262" x2="560" y2="110"/><line x1="436" y1="262" x2="640" y2="200"/><line x1="436" y1="262" x2="470" y2="60"/><line x1="368" y1="322" x2="220" y2="180"/><line x1="368" y1="322" x2="140" y2="270"/></g>
    <!-- звёздный проектор -->
    <g stroke="#fff" stroke-width="3" fill="#000">
      <path d="M392 330l-34 96h12l30 -80l30 80h12l-34 -96z"/>
      <path d="M372 306l52 -52l16 16l-52 52z"/>
      <circle cx="366" cy="324" r="30"/><circle cx="438" cy="260" r="30"/>
    </g>
    <g fill="#fff">${[[352, 314], [372, 336], [380, 312], [356, 336], [428, 246], [450, 252], [446, 274], [426, 268]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.4"/>`).join('')}</g>
    <!-- доска лектора -->
    <g><path d="M60 330l-14 100M160 330l14 100" stroke="#fff" stroke-width="4"/>
      <rect x="36" y="212" width="150" height="120" fill="#000" stroke="#fff" stroke-width="5"/>
      <g stroke="#fff" stroke-width="2"><line x1="50" y1="232" x2="150" y2="232"/><line x1="50" y1="248" x2="170" y2="248"/><line x1="50" y1="264" x2="134" y2="264"/><line x1="50" y1="280" x2="162" y2="280"/></g>
      <path d="M52 306q20 -12 34 0t34 0t34 0" stroke="${RED}" stroke-width="4" fill="none"/></g>
    <!-- кресла и тело -->
    ${seats(372, 4, 196, 0)}
    <g>${range(4).map(i => `<path d="M${70 + i * 70} 462v-40q0 -22 24 -22q24 0 24 22v40z" fill="#000" stroke="#fff" stroke-width="3"/>`).join('')}</g>
    <g><path d="M222 470q4 -50 44 -52q40 2 44 52z" fill="#fff"/><circle cx="262" cy="398" r="22" fill="#000" stroke="#fff" stroke-width="3" transform="rotate(18 262 420)"/>
      <rect x="258" y="382" width="20" height="7" fill="${RED}" transform="rotate(18 262 420)"/></g>
    ${range(5).map(i => `<path d="M${40 + i * 70} 520v-40q0 -22 24 -22q24 0 24 22v40z" fill="#000" stroke="#fff" stroke-width="3"/>`).join('')}
    <!-- пульт и шредер -->
    <path d="M500 350h150l14 34h-178z" fill="#fff"/><rect x="494" y="384" width="162" height="116" fill="#000" stroke="#fff" stroke-width="3"/>
    <g fill="#000">${range(6).map(i => `<rect x="${514 + i * 22}" y="358" width="12" height="8"/>`).join('')}</g>
    <circle cx="640" cy="366" r="5" fill="${RED}"/>
    <rect x="532" y="392" width="62" height="70" fill="#000" stroke="#fff" stroke-width="3"/><rect x="540" y="400" width="46" height="6" fill="#fff"/>
    <g stroke="#fff" stroke-width="3">${range(7).map(i => `<path d="M${543 + i * 7} 406q${i % 2 ? 6 : -6} 30 ${i % 2 ? -4 : 5} 66" fill="none"/>`).join('')}</g>
    <!-- пюпитр с книгой посетителей -->
    <path d="M662 300h70l-10 200h-50z" fill="#000" stroke="#fff" stroke-width="3"/>
    <path d="M662 300h70l-10 200h-50z" fill="url(#hatch)" opacity=".25"/>
    <path d="M640 262l56 14l56 -14v34l-56 14l-56 -14z" fill="#fff"/><line x1="696" y1="276" x2="696" y2="310" stroke="#000" stroke-width="2"/>
    <g stroke="#000" stroke-width="1.5"><line x1="650" y1="276" x2="688" y2="286"/><line x1="650" y1="284" x2="688" y2="294"/><line x1="704" y1="286" x2="742" y2="276"/></g>
    <path d="M708 296l30 -8" stroke="${RED}" stroke-width="3"/>
    `);
  }

  /* ============ МЕСТО 3: типография ============ */
  function scene3() {
    const sheet = (x, y, rot) => `<g transform="rotate(${rot} ${x} ${y})"><rect x="${x}" y="${y}" width="52" height="72" fill="#fff"/><rect x="${x}" y="${y}" width="52" height="12" fill="#000"/>
      <g stroke="#000" stroke-width="1.4">${range(4).map(i => `<line x1="${x + 6}" y1="${y + 24 + i * 11}" x2="${x + 46}" y2="${y + 24 + i * 11}"/>`).join('')}${range(4).map(i => `<line x1="${x + 12 + i * 10}" y1="${y + 18}" x2="${x + 12 + i * 10}" y2="${y + 64}"/>`).join('')}</g></g>`;
    return svg(`
    <rect width="800" height="500" fill="#000"/>
    <!-- цеховое окно -->
    <rect x="470" y="34" width="296" height="176" fill="#fff"/>
    ${rainLines(470, 34, 296, 150, 40, 8)}
    <g fill="#000">${range(5).map(i => `<rect x="${470 + (i + 1) * 49 - 3}" y="34" width="6" height="176"/>`).join('')}<rect x="470" y="90" width="296" height="6"/><rect x="470" y="150" width="296" height="6"/></g>
    <path d="M470 210h296l80 290h-520z" fill="#fff" opacity=".13"/>
    <!-- верёвка с оттисками -->
    <path d="M0 52 Q240 86 470 44" stroke="#fff" stroke-width="2" fill="none"/>
    ${sheet(120, 66, -4)}${sheet(196, 72, 3)}${sheet(272, 72, -2)}${sheet(348, 66, 5)}
    <!-- табельные часы -->
    <rect x="36" y="112" width="70" height="104" fill="#000" stroke="#fff" stroke-width="4"/>
    ${clock(71, 146, 22, 1, 5)}
    <rect x="52" y="182" width="38" height="8" fill="#fff"/><rect x="60" y="174" width="22" height="26" fill="#fff" stroke="#000" stroke-width="1.5"/><line x1="64" y1="184" x2="78" y2="184" stroke="${RED}" stroke-width="2.5"/>
    <!-- печатный станок -->
    <g stroke="#fff" stroke-width="4" fill="#000">
      <circle cx="140" cy="318" r="74"/><circle cx="140" cy="318" r="12" fill="#fff"/>
      ${range(6).map(i => `<line x1="140" y1="318" x2="${(140 + Math.cos(i * 1.047) * 74).toFixed(0)}" y2="${(318 + Math.sin(i * 1.047) * 74).toFixed(0)}"/>`).join('')}
      <path d="M176 262h170v170h-170z"/><path d="M160 432h204v26h-204z"/><path d="M190 262l24 -34h100l24 34z"/>
    </g>
    <rect x="176" y="262" width="170" height="170" fill="url(#hatch)" opacity=".22"/>
    <g transform="rotate(-7 250 240)"><rect x="210" y="196" width="84" height="74" fill="#fff"/><text x="252" y="226" font-family="Russo One, Arial Black, sans-serif" font-size="17" text-anchor="middle" fill="#000">KAL.</text><text x="252" y="256" font-family="Russo One, Arial Black, sans-serif" font-size="24" text-anchor="middle" fill="${RED}">APR.</text></g>
    <!-- наборная касса -->
    <rect x="556" y="262" width="216" height="200" fill="#000" stroke="#fff" stroke-width="4"/>
    <g stroke="#fff" stroke-width="2">${range(5).map(i => `<line x1="556" y1="${296 + i * 34}" x2="772" y2="${296 + i * 34}"/>`).join('')}${range(5).map(i => `<line x1="${592 + i * 36}" y1="262" x2="${592 + i * 36}" y2="462"/>`).join('')}</g>
    <g fill="#fff">${range(18).map(i => `<rect x="${562 + (i % 6) * 36 + (i * 7) % 14}" y="${270 + Math.floor(i / 6) * 68 + (i * 5) % 12}" width="9" height="9"/>`).join('')}</g>
    <rect x="574" y="234" width="170" height="20" fill="#fff"/><g fill="#000">${range(15).map(i => `<rect x="${580 + i * 11}" y="238" width="8" height="12"/>`).join('')}</g>
    <rect x="574" y="250" width="170" height="5" fill="${RED}"/>
    <!-- стол с папкой -->
    <path d="M362 368h180v14h-180z" fill="#fff"/><path d="M376 382v80M528 382v80" stroke="#fff" stroke-width="6"/>
    <g transform="rotate(-6 440 350)"><rect x="392" y="336" width="88" height="34" fill="#fff" stroke="#000" stroke-width="2"/><rect x="398" y="342" width="32" height="6" fill="#000"/><circle cx="460" cy="353" r="10" fill="none" stroke="${RED}" stroke-width="3"/></g>
    <path d="M500 340h26v28h-26z" fill="#000" stroke="#fff" stroke-width="3"/>
    <!-- тело и бумага -->
    <g fill="#fff">${range(5).map(i => `<rect x="${30 + i * 3}" y="${474 - i * 9}" width="${120 - i * 5}" height="6"/>`).join('')}</g>
    ${body(330, 470, 0.86)}
    `);
  }

  /* ============ МЕСТО 4: кабинет судьи ============ */
  function scene4() {
    return svg(`
    <rect width="800" height="500" fill="#000"/>
    <rect x="330" y="20" width="470" height="320" fill="url(#ht)" opacity=".09"/>
    <!-- арочное окно -->
    <path d="M80 366V150q0 -110 110 -110q110 0 110 110v216z" fill="#fff"/>
    ${rainLines(80, 40, 220, 300, 60, 17)}
    <path d="M150 40l-22 70l30 6l-34 90l66 -112l-32 -6l28 -48z" fill="#000" opacity=".9"/>
    <g fill="#000"><rect x="187" y="40" width="6" height="326"/><rect x="80" y="150" width="220" height="6"/><rect x="80" y="258" width="220" height="6"/></g>
    <path d="M193 156h107v210h-107z" fill="#000"/>
    <path d="M300 150q-70 60 -40 216h40z" fill="#fff" opacity=".9"/>
    <path d="M74 366V150q0 -116 116 -116q116 0 116 116v216" fill="none" stroke="#fff" stroke-width="5"/>
    <rect x="62" y="364" width="256" height="16" fill="#fff"/>
    <!-- перчатка и грязь на подоконнике -->
    <path d="M116 362q-4 -18 12 -22l6 -14l8 2l-2 12l10 -16l8 4l-8 16l14 -12l6 6l-14 16q6 14 -6 22z" fill="#000" stroke="#fff" stroke-width="2.5"/>
    <g fill="${RED}"><ellipse cx="188" cy="372" rx="12" ry="4"/><ellipse cx="214" cy="374" rx="6" ry="3"/></g>
    <!-- следы на полу -->
    <g fill="#fff" opacity=".85">${[[150, 410, -20], [184, 432, -16], [222, 420, -24], [254, 446, -18]].map(p => `<ellipse cx="${p[0]}" cy="${p[1]}" rx="12" ry="5" transform="rotate(${p[2]} ${p[0]} ${p[1]})"/>`).join('')}</g>
    <!-- ключ -->
    <g transform="rotate(24 274 446)" fill="none" stroke="#fff" stroke-width="4"><circle cx="262" cy="452" r="9"/><path d="M271 452h30v8m-10 -8v7"/></g>
    <path d="M250 446l-16 -10" stroke="${RED}" stroke-width="3"/><rect x="216" y="426" width="20" height="12" fill="${RED}" transform="rotate(30 226 432)"/>
    <!-- весы правосудия -->
    <g stroke="#fff" stroke-width="4" fill="none"><line x1="660" y1="52" x2="660" y2="170"/><line x1="592" y1="80" x2="728" y2="66"/><path d="M592 80l-22 52h44zM728 66l-22 52h44z"/><path d="M566 132q26 22 52 0M702 118q26 22 52 0" fill="#fff"/><path d="M636 170h48"/></g>
    <!-- кресло и судья -->
    <path d="M462 350V190q0 -34 58 -34q58 0 58 34v160z" fill="#000" stroke="#fff" stroke-width="4"/>
    <path d="M462 350V190q0 -34 58 -34q58 0 58 34v160z" fill="url(#hatch)" opacity=".2"/>
    <path d="M470 350q6 -78 50 -84q44 6 50 84z" fill="#000" stroke="#fff" stroke-width="3"/>
    <path d="M506 268l14 26l14 -26z" fill="#fff"/>
    <circle cx="520" cy="238" r="23" fill="#fff"/>
    <path d="M497 232q4 -28 24 -26q22 0 22 26q-10 -12 -24 -12q-12 0 -22 12z" fill="#000"/>
    <path d="M472 300q50 14 96 0" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="6 5"/>
    <!-- часовой механизм -->
    <g transform="translate(455 276)"><path d="M0 0q30 -34 44 -38" stroke="${RED}" stroke-width="3" fill="none"/>
      <circle r="22" fill="#000" stroke="${RED}" stroke-width="4"/><circle r="8" fill="${RED}"/>
      ${range(8).map(i => `<rect x="-3" y="-29" width="6" height="8" fill="${RED}" transform="rotate(${i * 45})"/>`).join('')}
      <circle cx="-22" cy="26" r="12" fill="#000" stroke="${RED}" stroke-width="3"/>${range(6).map(i => `<rect x="-24" y="10" width="4" height="5" fill="${RED}" transform="rotate(${i * 60} -22 26)"/>`).join('')}</g>
    <!-- стол -->
    <path d="M330 344h440v22h-440z" fill="#fff"/>
    <path d="M344 366h412v134h-412z" fill="#000" stroke="#fff" stroke-width="4"/>
    <path d="M344 366h412v134h-412z" fill="url(#hatch)" opacity=".2"/>
    <rect x="380" y="392" width="340" height="80" fill="none" stroke="#fff" stroke-width="2"/>
    <!-- книга на столе -->
    <path d="M556 318l52 10l52 -10v24l-52 10l-52 -10z" fill="#fff" stroke="#000" stroke-width="2"/><line x1="608" y1="328" x2="608" y2="352" stroke="#000" stroke-width="2"/>
    <g stroke="${RED}" stroke-width="2"><line x1="566" y1="328" x2="600" y2="335"/><line x1="566" y1="335" x2="600" y2="342"/><line x1="616" y1="335" x2="650" y2="328"/></g>
    <!-- лампа и молоток -->
    <path d="M700 344v-50l-30 -22" stroke="#fff" stroke-width="4" fill="none"/><path d="M650 262l34 -10l10 30z" fill="#fff"/>
    <path d="M684 252l-60 92h110z" fill="#fff" opacity=".14"/>
    <g transform="rotate(-18 410 330)"><rect x="384" y="318" width="40" height="18" fill="#fff"/><rect x="400" y="336" width="8" height="12" fill="#fff"/></g>
    `);
  }

  /* ============ Бэтмен ============ */
  function batman() {
    return svg(`
    <rect width="200" height="230" fill="${RED}"/>
    <rect width="200" height="230" fill="url(#htk)" opacity=".28"/>
    <path d="M0 230L14 176Q100 132 186 176L200 230z" fill="#000"/>
    <path d="M58 178L54 92L44 6L80 60Q100 52 120 60L156 6L146 92L142 178z" fill="#000"/>
    <path d="M70 118L130 118L126 160Q100 180 74 160z" fill="#fff"/>
    <path d="M100 118L130 118L126 160Q112 172 100 174z" fill="url(#hatchk)"/>
    <path d="M84 148L116 150" stroke="#000" stroke-width="3.5" stroke-linecap="square"/>
    <path d="M92 156h16" stroke="#000" stroke-width="1.5"/>
    <path d="M70 118l10 8M130 118l-10 8" stroke="#000" stroke-width="3"/>
    <path d="M66 90L94 100L92 107L70 102z" fill="#fff"/><path d="M134 90L106 100L108 107L130 102z" fill="#fff"/>
    <path d="M62 84L96 96M138 84L104 96" stroke="#000" stroke-width="5"/>
    <path d="M44 6L80 60M54 92L58 178" stroke="#fff" stroke-width="2" fill="none" opacity=".85"/>
    <path d="M14 176Q60 150 76 168" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>
    <path d="M100 196l-10 -8l-4 8q-12 -10 -26 -4q12 4 14 18q8 -8 16 -2l10 12l10 -12q8 -6 16 2q2 -14 14 -18q-14 -6 -26 4l-4 -8z" fill="#000" stroke="#fff" stroke-width="1.5"/>
    `, '0 0 200 230');
  }

  /* ============ сюжетные панели ============ */
  const batShadow = (tx, ty, s, fill) => `<path transform="translate(${tx} ${ty}) scale(${s})" fill="${fill}" d="M200 46l-13 -36l-9 38q-17 6 -27 24q-68 -34 -151 6q62 12 72 66q30 -28 58 0q12 -22 32 -10l38 62l38 -62q20 -12 32 10q28 -28 58 0q10 -54 72 -66q-83 -40 -151 -6q-10 -18 -27 -24l-9 -38z"/>`;

  function splash() {
    return svg(`
    <rect width="800" height="420" fill="#000"/>
    <rect width="800" height="420" fill="url(#ht)" opacity=".08"/>
    <path d="M0 420V300h40v-60h36v90h30v-150h30v110h50v-60h26v80h44v-180h18v-30h8v30h18v200h40v-90h36v60h30v-130h44v150h40v-70h30v100h50v-160h34v120h40v-60h36v130z" fill="#fff"/>
    <path d="M0 420V330h60v-40h50v70h70v-90h40v110h80v-60h60v80h70v-110h50v90h60v-50h70v70h60v-90h50v110h80z" fill="#000" stroke="#fff" stroke-width="2"/>
    ${rainLines(0, 0, 800, 300, 90, 31, '#fff')}
    <circle cx="610" cy="96" r="62" fill="#fff"/>
    ${batShadow(540, 60, 0.35, '#000')}
    <g transform="rotate(-5 250 150)">
      <rect x="150" y="70" width="190" height="230" fill="#fff" stroke="#000" stroke-width="4"/><rect x="150" y="70" width="190" height="46" fill="${RED}"/>
      <text x="245" y="103" font-family="Russo One, Arial Black, sans-serif" font-size="26" text-anchor="middle" fill="#fff">ЯНВАРЬ</text>
      <text x="245" y="262" font-family="Russo One, Arial Black, sans-serif" font-size="170" text-anchor="middle" fill="#000">1</text>
    </g>
    `, '0 0 800 420');
  }

  function basement() {
    const leaves = range(9).map(i => { const x = 300 + i * 54, y = 40 + (i * 37) % 60; return `<line x1="${x + 17}" y1="0" x2="${x + 17}" y2="${y}" stroke="#fff" stroke-width="1.5"/><g transform="rotate(${(i * 13) % 16 - 8} ${x + 17} ${y})"><rect x="${x}" y="${y}" width="34" height="46" fill="#fff"/><rect x="${x}" y="${y}" width="34" height="9" fill="${i % 4 === 1 ? RED : '#000'}"/><text x="${x + 17}" y="${y + 37}" font-family="Russo One, Arial Black, sans-serif" font-size="22" text-anchor="middle" fill="#000">1</text></g>`; }).join('');
    return svg(`
    <rect width="800" height="420" fill="#000"/>
    <path d="M0 0h230l150 420h-380z" fill="#fff"/>
    <g fill="#000">${range(8).map(i => `<path d="M${-20 + i * 28} ${90 + i * 44}h${250 - i * 4}v14h-${250 - i * 4}z"/>`).join('')}</g>
    ${batShadow(-40, 60, 0.8, '#000')}
    ${leaves}
    <g stroke="#fff" stroke-width="4" fill="#000"><circle cx="690" cy="300" r="56"/><path d="M560 250h110v170h-110z"/></g>
    <path d="M430 420q0 -110 60 -120q64 10 64 120z" fill="#fff"/>
    <circle cx="492" cy="262" r="34" fill="#fff"/>
    <g fill="${RED}" font-family="Russo One, Arial Black, sans-serif" font-size="9"><text x="466" y="246">JAN</text><text x="484" y="238">FEB</text><text x="504" y="244">MAR</text><text x="512" y="258">APR</text></g>
    <path d="M474 268h12M498 268h12" stroke="#000" stroke-width="4"/><path d="M482 284q10 6 20 0" stroke="#000" stroke-width="3" fill="none"/>
    `, '0 0 800 420');
  }

  function capture() {
    return svg(`
    <rect width="800" height="420" fill="${RED}"/>
    <rect width="800" height="420" fill="url(#htk)" opacity=".3"/>
    ${batShadow(60, -10, 1.7, '#000')}
    <path d="M330 420q4 -90 70 -96q66 6 70 96z" fill="#fff"/>
    <circle cx="400" cy="296" r="30" fill="#fff"/>
    <path d="M384 300h10M406 300h10" stroke="#000" stroke-width="4"/><ellipse cx="400" cy="314" rx="7" ry="5" fill="#000"/>
    <path d="M352 352l-40 -50M448 352l40 -50" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
    <g fill="#fff">${range(14).map(i => `<rect x="${40 + (i * 131) % 720}" y="${20 + (i * 67) % 380}" width="20" height="27" transform="rotate(${i * 37} ${50 + (i * 131) % 720} ${34 + (i * 67) % 380})"/>`).join('')}</g>
    `, '0 0 800 420');
  }

  function gordon() {
    return svg(`
    <rect width="800" height="420" fill="#000"/>
    <path d="M0 420V250h120v-70h90v110h100v-150h80v190h410v90z" fill="#fff" opacity=".12"/>
    ${rainLines(0, 0, 800, 420, 120, 44, '#fff')}
    <!-- патрульная машина -->
    <path d="M470 330q10 -50 60 -54h120q40 4 60 54h60v60h-330v-60z" fill="#fff"/>
    <rect x="548" y="290" width="46" height="34" fill="#000"/><rect x="604" y="290" width="46" height="34" fill="#000"/>
    <circle cx="530" cy="392" r="26" fill="#000" stroke="#fff" stroke-width="4"/><circle cx="700" cy="392" r="26" fill="#000" stroke="#fff" stroke-width="4"/>
    <rect x="580" y="258" width="50" height="16" fill="${RED}"/><path d="M605 258l-120 -120h60zM605 258l160 -100l20 50z" fill="${RED}" opacity=".45"/>
    <text x="606" y="362" font-family="Russo One, Arial Black, sans-serif" font-size="24" text-anchor="middle" fill="#000">G.C.P.D.</text>
    <!-- Гордон -->
    <path d="M150 420q0 -160 40 -190l30 -14h40l30 14q40 30 40 190z" fill="#fff"/>
    <path d="M240 232l-20 60l20 128l20 -128z" fill="#000"/><path d="M220 216l-30 30l30 30zM260 216l30 30l-30 30z" fill="#000" stroke="#fff" stroke-width="2"/>
    <circle cx="240" cy="176" r="40" fill="#fff"/>
    <path d="M200 166q4 -40 40 -40q36 0 40 40q-40 -18 -80 0z" fill="#000"/>
    <g fill="none" stroke="#000" stroke-width="4"><rect x="212" y="170" width="22" height="16" rx="3"/><rect x="246" y="170" width="22" height="16" rx="3"/><line x1="234" y1="176" x2="246" y2="176"/></g>
    <path d="M216 198q24 -12 48 0q-6 10 -24 4q-18 6 -24 -4z" fill="#000"/>
    <!-- силуэты -->
    <path d="M330 420V300l-8 -30l14 20h20l14 -20l-8 30v120z" fill="#000" stroke="#fff" stroke-width="2"/>
    <path d="M396 420v-76q0 -16 14 -16t14 16v76z" fill="#000" stroke="${RED}" stroke-width="2"/>
    `, '0 0 800 420');
  }

  /* ================================================================
     ДЕЛО №2 — «Безумное чаепитие»
     ================================================================ */
  const F = 'font-family="Russo One, Arial Black, sans-serif"';
  // цилиндр с карточкой «10/6»
  const hat = (x, y, s, rot) => `<g transform="translate(${x} ${y}) rotate(${rot || 0}) scale(${s || 1})">
    <ellipse cx="0" cy="0" rx="46" ry="10" fill="#000" stroke="#fff" stroke-width="3"/>
    <path d="M-28 -2L-32 -58Q0 -70 32 -58L28 -2Q0 6 -28 -2z" fill="#000" stroke="#fff" stroke-width="3"/>
    <path d="M-29 -16Q0 -8 29 -16L28 -4Q0 4 -28 -4z" fill="#fff"/>
    <g transform="rotate(-12 16 -24)"><rect x="4" y="-36" width="24" height="26" fill="#fff" stroke="${RED}" stroke-width="2.5"/><text x="16" y="-18" ${F} font-size="10" text-anchor="middle" fill="${RED}">10/6</text></g></g>`;
  const cup = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s || 1})"><ellipse cx="0" cy="12" rx="20" ry="5" fill="#fff"/><path d="M-12 -8h24l-3 18h-18z" fill="#fff" stroke="#000" stroke-width="2"/><path d="M12 -4q10 2 4 10" fill="none" stroke="#fff" stroke-width="3"/></g>`;
  const teapot = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s || 1})" fill="#fff"><ellipse cx="0" cy="0" rx="26" ry="20"/><rect x="-12" y="-26" width="24" height="8" rx="3"/><circle cx="0" cy="-30" r="5"/><path d="M24 -4q18 -4 22 -20l8 2q-4 26 -28 30z"/><path d="M-24 -8q-20 0 -16 14q4 10 18 6" fill="none" stroke="#fff" stroke-width="5"/></g>`;
  // чайный столик со скатертью
  const teaTable = (x, y, w) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * 0.24}" fill="#fff"/><path d="M${x - w} ${y}q${w * 0.1} ${w * 0.7} ${w * 0.25} ${w * 0.9}h${w * 1.5}q${w * 0.15} -${w * 0.2} ${w * 0.25} -${w * 0.9}q-${w} ${w * 0.5} -${w * 2} 0z" fill="#000" stroke="#fff" stroke-width="3"/>
    <path d="M${x - w} ${y}q${w * 0.1} ${w * 0.7} ${w * 0.25} ${w * 0.9}h${w * 1.5}q${w * 0.15} -${w * 0.2} ${w * 0.25} -${w * 0.9}q-${w} ${w * 0.5} -${w * 2} 0z" fill="url(#hatch)" opacity=".22"/>`;

  /* ---------- МЕСТО 1: хранилище банка ---------- */
  function c2s1() {
    const boxes = range(54).map(i => { const c = i % 9, r = Math.floor(i / 9), x = 420 + c * 40, y = 44 + r * 44; const open = c === 3 && r === 2;
      return open ? `<rect x="${x}" y="${y}" width="36" height="40" fill="#000" stroke="${RED}" stroke-width="3"/><rect x="${x + 6}" y="${y + 8}" width="46" height="34" fill="#000" stroke="#fff" stroke-width="2" transform="skewX(-12)"/><circle cx="${x + 18}" cy="${y + 20}" r="8" fill="${RED}"/><path d="M${x + 12} ${y + 14}q6 -12 12 0" fill="none" stroke="${RED}" stroke-width="3"/>`
        : `<rect x="${x}" y="${y}" width="36" height="40" fill="#000" stroke="#fff" stroke-width="2"/><circle cx="${x + 28}" cy="${y + 20}" r="3" fill="#fff"/><rect x="${x + 6}" y="${y + 8}" width="14" height="5" fill="#fff"/>`; }).join('');
    return svg(`
    <rect width="800" height="500" fill="#000"/>
    <rect x="400" y="20" width="400" height="300" fill="url(#ht)" opacity=".08"/>
    <!-- дверь хранилища -->
    <circle cx="180" cy="210" r="172" fill="#000" stroke="#fff" stroke-width="6"/>
    <circle cx="180" cy="210" r="150" fill="url(#hatch)" opacity=".2"/>
    <circle cx="180" cy="210" r="150" fill="none" stroke="#fff" stroke-width="3"/>
    <g fill="#fff">${range(16).map(i => `<circle cx="${(180 + Math.cos(i * 0.3927) * 161).toFixed(0)}" cy="${(210 + Math.sin(i * 0.3927) * 161).toFixed(0)}" r="5"/>`).join('')}</g>
    <circle cx="180" cy="210" r="62" fill="#000" stroke="#fff" stroke-width="5"/>
    <g stroke="#fff" stroke-width="9" stroke-linecap="round">${range(4).map(i => `<line x1="180" y1="210" x2="${(180 + Math.cos(i * 0.785 + .3) * 96).toFixed(0)}" y2="${(210 + Math.sin(i * 0.785 + .3) * 96).toFixed(0)}"/><line x1="180" y1="210" x2="${(180 - Math.cos(i * 0.785 + .3) * 96).toFixed(0)}" y2="${(210 - Math.sin(i * 0.785 + .3) * 96).toFixed(0)}"/>`).join('')}</g>
    <circle cx="180" cy="210" r="20" fill="#fff"/>
    <path d="M352 60v330" stroke="#fff" stroke-width="10"/>
    <!-- ячейки -->
    ${boxes}
    <line x1="0" y1="330" x2="800" y2="330" stroke="#fff" stroke-width="3"/>
    <path d="M360 330l-200 170h620l-60 -170z" fill="#fff" opacity=".1"/>
    <!-- стул и цилиндр -->
    <g stroke="#fff" stroke-width="4" fill="#000"><path d="M296 250h56v110h-56z"/><path d="M286 360h84v14h-84z"/><path d="M294 374v90M362 374v90"/></g>
    <path d="M296 250h56v110h-56z" fill="url(#hatch)" opacity=".25"/>
    ${hat(328, 356, 0.9, -6)}
    <!-- столик -->
    ${teaTable(500, 392, 130)}
    ${teapot(500, 356, 1)}
    ${cup(410, 380, 0.9)}${cup(600, 372, 0.9)}${cup(470, 404, 0.9)}
    <g transform="rotate(-8 440 392)"><rect x="416" y="378" width="52" height="30" fill="#fff" stroke="#000" stroke-width="2"/><path d="M422 386h40M422 393h40M422 400h30" stroke="${RED}" stroke-width="2" stroke-dasharray="3 2"/></g>
    <g fill="#fff" stroke="#000" stroke-width="2"><path d="M520 398l14 -18l14 18z"/><path d="M548 402l14 -18l14 18z"/><path d="M528 414l15 -19l15 19z" fill="#f1ecdf"/></g>
    <path d="M536 410h14" stroke="${RED}" stroke-width="2"/>
    `);
  }

  /* ---------- МЕСТО 2: зал зеркал ---------- */
  function c2s2() {
    const glare = (x, y, w, h) => `<path d="M${x + w * 0.15} ${y + h * 0.75}L${x + w * 0.6} ${y + h * 0.1}M${x + w * 0.4} ${y + h * 0.9}L${x + w * 0.85} ${y + h * 0.3}" stroke="#000" stroke-width="5"/>`;
    const mir = (x, y, w, h, oval) => (oval ? `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="#fff" stroke="#fff" stroke-width="8"/><ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2 + 8}" ry="${h / 2 + 8}" fill="none" stroke="#000" stroke-width="3"/>` : `<rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" fill="#000" stroke="#fff" stroke-width="3"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff"/>`) + glare(x, y, w, h);
    return svg(`
    <rect width="800" height="500" fill="#000"/>
    <rect width="800" height="340" fill="url(#ht)" opacity=".09"/>
    <line x1="0" y1="340" x2="800" y2="340" stroke="#fff" stroke-width="3"/>
    ${mir(190, 60, 90, 140, true)}${mir(500, 70, 80, 120, false)}${mir(610, 210, 60, 80, true)}${mir(250, 230, 70, 70, false)}${mir(500, 230, 70, 70, true)}
    <!-- пустое место -->
    <rect x="352" y="84" width="96" height="150" fill="#000" stroke="#fff" stroke-width="2" stroke-dasharray="8 7"/>
    <path d="M400 60v24M392 84h16" stroke="#fff" stroke-width="4"/>
    <g transform="rotate(4 400 130)"><rect x="372" y="96" width="56" height="74" fill="#fff"/><g stroke="${RED}" stroke-width="2.5">${range(6).map(i => `<line x1="${422 - (i % 2) * 8}" y1="${108 + i * 10}" x2="378" y2="${108 + i * 10}"/>`).join('')}</g></g>
    <!-- картина и сейф -->
    <g transform="rotate(-18 60 60)"><rect x="40" y="70" width="110" height="80" fill="#000" stroke="#fff" stroke-width="5"/><path d="M48 142l30 -40l22 26l16 -18l26 32z" fill="#fff"/></g>
    <rect x="70" y="92" width="84" height="70" fill="#000" stroke="#fff" stroke-width="4"/><circle cx="112" cy="127" r="20" fill="#000" stroke="#fff" stroke-width="4"/><path d="M112 127v-16" stroke="${RED}" stroke-width="4"/><rect x="140" y="120" width="8" height="18" fill="#fff"/>
    <!-- камера -->
    <path d="M720 0v26l40 18v-20z" fill="#fff"/><circle cx="756" cy="34" r="5" fill="${RED}"/><path d="M740 44v20h22" stroke="#fff" stroke-width="3" fill="none"/>
    <!-- ваза с розами -->
    <path d="M690 500v-150h70v150z" fill="#000" stroke="#fff" stroke-width="4"/><path d="M690 350h70v150h-70z" fill="url(#hatch)" opacity=".25"/>
    <path d="M706 350q-10 -40 8 -64h22q18 24 8 64z" fill="#fff"/>
    <g stroke="#fff" stroke-width="3">${[[700, 236], [722, 214], [746, 230], [712, 252], [738, 256], [728, 190], [752, 204]].map(p => `<line x1="725" y1="290" x2="${p[0]}" y2="${p[1]}"/>`).join('')}</g>
    <g fill="${RED}">${[[700, 236], [722, 214], [746, 230], [712, 252], [738, 256], [728, 190], [752, 204]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="12"/>`).join('')}</g>
    <path d="M700 248q-2 30 2 50M746 242q4 40 0 70M728 202q0 18 2 28" stroke="${RED}" stroke-width="3" fill="none"/>
    <g fill="${RED}"><ellipse cx="660" cy="470" rx="20" ry="6"/><ellipse cx="640" cy="486" rx="8" ry="3"/></g>
    <rect x="610" y="430" width="34" height="38" fill="#fff"/><rect x="606" y="426" width="42" height="8" fill="#fff"/><path d="M620 426l-14 -40" stroke="#fff" stroke-width="5"/><path d="M604 384l-6 -16l12 6z" fill="${RED}"/>
    <!-- столик с кроликом -->
    ${teaTable(220, 410, 120)}
    ${teapot(290, 378, 0.9)}${cup(140, 396, 0.9)}
    <g transform="translate(186 384)"><path d="M-16 0q-6 -44 16 -48q22 4 16 48z" fill="#fff"/><circle cx="0" cy="-58" r="17" fill="#fff"/><path d="M-10 -70q-8 -34 2 -40q8 6 4 38zM8 -72q4 -34 14 -36q6 10 -6 38z" fill="#fff"/>
      <circle cx="-6" cy="-60" r="2.5" fill="#000"/><circle cx="7" cy="-60" r="2.5" fill="#000"/><path d="M-14 -34h28v22h-28z" fill="${RED}"/><circle cx="0" cy="-22" r="8" fill="#fff" stroke="#000" stroke-width="2"/><path d="M0 -22v-5" stroke="#000" stroke-width="2"/>
      <path d="M22 -30h12m-4 -6v12" stroke="#fff" stroke-width="3"/></g>
    <!-- карты на полу -->
    <g stroke="#000" stroke-width="2" fill="#fff">${[[430, 440, -20], [470, 462, 14], [520, 444, 40]].map(p => `<rect x="${p[0]}" y="${p[1]}" width="26" height="36" transform="rotate(${p[2]} ${p[0] + 13} ${p[1] + 18})"/>`).join('')}</g>
    `);
  }

  /* ---------- МЕСТО 3: шахматный клуб ---------- */
  function c2s3() {
    const board = (x, y, s) => { let h = ''; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 0) h += `<rect x="${c * 10}" y="${r * 10}" width="10" height="10" fill="#fff"/>`;
      return `<g transform="translate(${x} ${y}) scale(${s} ${s * 0.5}) skewX(-28)"><rect x="-4" y="-4" width="88" height="88" fill="#000" stroke="#fff" stroke-width="3"/>${h}</g>`; };
    const pawn = (x, y, col, st) => `<g transform="translate(${x} ${y})" fill="${col}" stroke="${st}" stroke-width="1.5"><circle cx="0" cy="-12" r="4"/><path d="M-5 0l2 -9h6l2 9z"/></g>`;
    const locker = (x, red) => `<rect x="${x}" y="130" width="60" height="210" fill="#000" stroke="#fff" stroke-width="4"/><g stroke="#fff" stroke-width="2">${range(4).map(i => `<line x1="${x + 12}" y1="${146 + i * 8}" x2="${x + 48}" y2="${146 + i * 8}"/>`).join('')}</g><rect x="${x + 40}" y="232" width="10" height="20" fill="${red ? RED : '#fff'}"/>${red ? `<rect x="${x + 10}" y="190" width="40" height="14" fill="#000" stroke="${RED}" stroke-width="2" stroke-dasharray="4 3"/><g transform="rotate(10 ${x + 46} 270)"><rect x="${x + 34}" y="256" width="22" height="26" fill="#fff" stroke="${RED}" stroke-width="2"/><text x="${x + 45}" y="273" ${F} font-size="9" text-anchor="middle" fill="${RED}">10/6</text></g>` : `<rect x="${x + 10}" y="190" width="40" height="14" fill="#fff"/>`}`;
    return svg(`
    <rect width="800" height="500" fill="#000"/>
    <rect width="800" height="340" fill="url(#ht)" opacity=".08"/>
    <line x1="0" y1="340" x2="800" y2="340" stroke="#fff" stroke-width="3"/>
    <!-- окно -->
    <rect x="40" y="40" width="200" height="170" fill="#fff"/>${rainLines(40, 40, 200, 150, 30, 5)}
    <g fill="#000"><rect x="137" y="40" width="6" height="170"/><rect x="40" y="122" width="200" height="6"/></g>
    <path d="M40 210h200l120 290h-420z" fill="#fff" opacity=".1"/>
    <!-- портреты и кубок -->
    ${[290, 590].map(x => `<rect x="${x}" y="50" width="70" height="90" fill="#000" stroke="#fff" stroke-width="4"/><circle cx="${x + 35}" cy="84" r="16" fill="#fff"/><path d="M${x + 10} 136q4 -34 25 -34q21 0 25 34z" fill="#fff"/>`).join('')}
    <path d="M520 150h40l-6 30q-14 16 -28 0zM530 196h20v10h-20zM522 206h36v8h-36z" fill="#fff"/><rect x="496" y="214" width="88" height="8" fill="#fff"/>
    <!-- лампа и карточка -->
    <path d="M440 0v70" stroke="#fff" stroke-width="3"/><path d="M400 110l40 -44l40 44z" fill="#fff"/><path d="M400 110h80l150 230h-380z" fill="#fff" opacity=".12"/>
    <g transform="rotate(5 380 130)"><rect x="344" y="92" width="62" height="74" fill="#fff" stroke="#000" stroke-width="2"/><g stroke="#000" stroke-width="2">${range(4).map(i => `<line x1="352" y1="${106 + i * 11}" x2="398" y2="${106 + i * 11}"/>`).join('')}</g><line x1="352" y1="154" x2="384" y2="154" stroke="${RED}" stroke-width="3"/></g>
    <!-- шкафчики -->
    ${locker(580, false)}${locker(644, true)}${locker(708, false)}
    <!-- стол с доской -->
    <path d="M250 350h330l40 34h-410z" fill="#fff"/><path d="M210 384h410v22h-410z" fill="#000" stroke="#fff" stroke-width="3"/><path d="M240 406v94M590 406v94" stroke="#fff" stroke-width="8"/>
    ${board(330, 300, 2.1)}
    ${[0, 1, 2, 4, 5, 6, 7].map(i => pawn(308 + i * 21, 362, '#fff', '#000')).join('')}
    ${range(8).map(i => pawn(356 + i * 21, 316, '#000', '#fff')).join('')}
    <ellipse cx="371" cy="363" rx="9" ry="4" fill="none" stroke="${RED}" stroke-width="2.5"/>
    <g><rect x="520" y="318" width="64" height="34" fill="#000" stroke="#fff" stroke-width="3"/><circle cx="537" cy="335" r="10" fill="#fff"/><circle cx="567" cy="335" r="10" fill="#fff"/><path d="M537 335v-7M567 335l5 -4" stroke="#000" stroke-width="2"/></g>
    <!-- столик эксперта: чип под лупой -->
    <path d="M40 348h140v12h-140z" fill="#fff"/><path d="M56 360v140M164 360v140" stroke="#fff" stroke-width="6"/>
    <rect x="74" y="330" width="40" height="18" fill="#000" stroke="#fff" stroke-width="2"/><rect x="86" y="335" width="16" height="8" fill="${RED}"/>
    <path d="M150 348v-40q0 -24 -34 -26" stroke="#fff" stroke-width="5" fill="none"/><circle cx="104" cy="290" r="20" fill="#000" stroke="#fff" stroke-width="5"/><circle cx="104" cy="290" r="11" fill="${RED}" opacity=".85"/>
    <!-- чайный столик в глубине -->
    ${cup(690, 420, 1.1)}${hat(720, 470, 0.8, 8)}
    `);
  }

  /* ---------- МЕСТО 4: чайная ---------- */
  function c2s4() {
    const tins = range(24).map(i => { const c = i % 8, r = Math.floor(i / 8); return `<rect x="${470 + c * 26}" y="${70 + r * 52}" width="20" height="${30 + (i * 7) % 10}" fill="${(i * 5) % 7 === 0 ? '#fff' : '#000'}" stroke="#fff" stroke-width="2" transform="translate(0 ${10 - (i * 7) % 10})"/>`; }).join('');
    const card = (x, y, r) => `<path d="M${x} ${y}l10 -14l10 14z" fill="#fff" stroke="#000" stroke-width="1.5" transform="rotate(${r} ${x + 10} ${y})"/>`;
    return svg(`
    <rect width="800" height="500" fill="#000"/>
    <rect width="800" height="330" fill="url(#ht)" opacity=".08"/>
    <line x1="0" y1="330" x2="800" y2="330" stroke="#fff" stroke-width="3"/>
    <!-- пробковая доска -->
    <rect x="48" y="74" width="172" height="156" fill="#000" stroke="#fff" stroke-width="5"/><rect x="48" y="74" width="172" height="156" fill="url(#ht)" opacity=".25"/>
    <g fill="#fff" stroke="#000" stroke-width="2"><rect x="60" y="86" width="56" height="64" transform="rotate(-4 88 118)"/><rect x="128" y="84" width="76" height="46"/><rect x="62" y="160" width="62" height="56" transform="rotate(3 93 188)"/><rect x="140" y="142" width="64" height="74" transform="rotate(-3 172 180)"/></g>
    <g transform="rotate(8 130 150)"><rect x="92" y="126" width="80" height="48" fill="#fff" stroke="${RED}" stroke-width="3"/><path d="M100 140h62M100 150h62M100 160h40" stroke="${RED}" stroke-width="2"/><circle cx="132" cy="126" r="6" fill="${RED}"/></g>
    <!-- часы с кукушкой -->
    <path d="M400 30l-56 50h112z" fill="#fff"/><rect x="356" y="80" width="88" height="92" fill="#000" stroke="#fff" stroke-width="4"/>
    <circle cx="400" cy="124" r="30" fill="#fff"/><path d="M400 124l-6 -18M400 124l22 8" stroke="#000" stroke-width="4" stroke-linecap="round"/>
    <rect x="388" y="56" width="24" height="18" fill="#000"/><path d="M382 172v60M418 172v44" stroke="#fff" stroke-width="2"/><path d="M374 232h16l-8 22zM412 216h12l-6 18z" fill="#fff"/>
    <path d="M400 172v36" stroke="#fff" stroke-width="3"/><circle cx="400" cy="216" r="10" fill="#fff"/><rect x="406" y="196" width="18" height="12" fill="${RED}" transform="rotate(14 415 202)"/>
    <!-- полки с чаем и стойка -->
    <g stroke="#fff" stroke-width="3"><line x1="460" y1="112" x2="680" y2="112"/><line x1="460" y1="164" x2="680" y2="164"/><line x1="460" y1="216" x2="680" y2="216"/></g>${tins}
    <path d="M440 250h260v80h-260z" fill="#000" stroke="#fff" stroke-width="4"/><path d="M440 250h260v80h-260z" fill="url(#hatch)" opacity=".22"/><rect x="430" y="240" width="280" height="12" fill="#fff"/>
    ${teapot(520, 222, 0.8)}${cup(600, 228, 0.8)}
    <!-- вешалка с цилиндром -->
    <path d="M724 500V130M724 150l-30 -22M724 150l30 -22M724 200l-26 -16M724 200l26 -16" stroke="#fff" stroke-width="5" fill="none"/><path d="M690 500h68" stroke="#fff" stroke-width="8"/>
    ${hat(700, 172, 0.85, -14)}
    <!-- окно с вывеской -->
    <rect x="252" y="80" width="74" height="150" fill="#fff"/>${rainLines(252, 80, 74, 130, 14, 23)}<rect x="286" y="80" width="5" height="150" fill="#000"/>
    <!-- стол Алисы -->
    <ellipse cx="392" cy="392" rx="130" ry="34" fill="#fff"/><path d="M380 426h24v74h-24z" fill="#fff"/><ellipse cx="392" cy="392" rx="130" ry="34" fill="none" stroke="#000" stroke-width="2"/>
    ${card(300, 392, -10)}${card(340, 376, 6)}${card(388, 372, -4)}${card(440, 378, 10)}${card(470, 396, -8)}${card(330, 410, 4)}
    <g transform="rotate(-6 400 400)"><rect x="372" y="386" width="58" height="34" fill="#f1ecdf" stroke="#000" stroke-width="2"/><path d="M378 394h46M378 401h46M378 408h34" stroke="#000" stroke-width="1.5"/></g>
    <!-- стулья -->
    <g stroke="#fff" stroke-width="4" fill="#000"><path d="M214 330h44v90h-44z"/><path d="M206 420h60v10h-60zM214 430v70M258 430v70"/><path d="M536 330h44v90h-44z"/><path d="M528 420h60v10h-60zM536 430v70M580 430v70"/></g>
    <!-- фартук и разбитая чашка -->
    <path d="M90 440q30 -24 70 -8q20 20 60 14l-10 34q-60 16 -130 -6z" fill="#fff"/><path d="M100 440q-20 -20 -40 -8M214 446q20 -10 30 6" stroke="#fff" stroke-width="3" fill="none"/>
    <g fill="#fff" stroke="#000" stroke-width="1.5"><path d="M620 450l16 -10l8 16l-14 8z"/><path d="M650 462l14 -4l2 12z"/><path d="M604 470l10 -2l-2 10z"/></g><ellipse cx="634" cy="474" rx="28" ry="6" fill="${RED}" opacity=".8"/>
    `);
  }

  /* ---------- сюжетные панели ---------- */
  function splash2() {
    return svg(`
    <rect width="800" height="420" fill="#000"/>
    <rect width="800" height="420" fill="url(#ht)" opacity=".08"/>
    <path d="M0 420V330h60v-40h50v70h70v-90h40v110h80v-60h60v80h70v-110h50v90h60v-50h70v70h60v-90h50v110h80z" fill="#fff" opacity=".9"/>
    ${rainLines(0, 0, 800, 300, 80, 61, '#fff')}
    <circle cx="640" cy="100" r="62" fill="#fff"/><path d="M640 100V58M640 100v42" stroke="#000" stroke-width="7" stroke-linecap="round"/><circle cx="640" cy="100" r="6" fill="${RED}"/>
    <g fill="#000">${range(12).map(i => `<rect x="637" y="42" width="6" height="${i % 3 ? 8 : 14}" transform="rotate(${i * 30} 640 100)"/>`).join('')}</g>
    ${hat(250, 300, 3.4, -8)}
    ${cup(470, 350, 2.2)}
    `, '0 0 800 420');
  }

  function park() {
    const tcup = (x, y, s, fig) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-46 -30h92l-10 56q-36 14 -72 0z" fill="#000" stroke="#fff" stroke-width="4"/><path d="M46 -18q30 4 14 30l-18 6" fill="none" stroke="#fff" stroke-width="5"/><ellipse cx="0" cy="-30" rx="46" ry="9" fill="#fff"/>
      ${fig ? `<circle cx="0" cy="-50" r="13" fill="#fff"/><g transform="translate(0 -62) scale(.42)"><ellipse cx="0" cy="0" rx="46" ry="10" fill="#000" stroke="#fff" stroke-width="5"/><path d="M-28 -2L-32 -58Q0 -70 32 -58L28 -2z" fill="#000" stroke="#fff" stroke-width="5"/><rect x="2" y="-40" width="22" height="24" fill="${RED}"/></g>` : ''}</g>`;
    return svg(`
    <rect width="800" height="420" fill="#000"/>
    <circle cx="150" cy="150" r="120" fill="none" stroke="#fff" stroke-width="5"/><circle cx="150" cy="150" r="14" fill="#fff"/>
    <g stroke="#fff" stroke-width="2">${range(12).map(i => `<line x1="150" y1="150" x2="${(150 + Math.cos(i * 0.5236) * 120).toFixed(0)}" y2="${(150 + Math.sin(i * 0.5236) * 120).toFixed(0)}"/>`).join('')}</g>
    <g fill="#fff">${range(12).map(i => `<rect x="${(140 + Math.cos(i * 0.5236) * 120).toFixed(0)}" y="${(146 + Math.sin(i * 0.5236) * 120).toFixed(0)}" width="20" height="16"/>`).join('')}</g>
    <path d="M100 420l50 -270l50 270" fill="none" stroke="#fff" stroke-width="5"/>
    <path d="M500 96h240" stroke="#fff" stroke-width="3" opacity=".6"/><text x="620" y="84" ${F} font-size="20" text-anchor="middle" fill="#fff" opacity=".7">СТРАНА ЧУДЕС</text>
    ${rainLines(0, 0, 800, 420, 110, 71, '#fff')}
    <ellipse cx="470" cy="360" rx="330" ry="56" fill="#fff"/><ellipse cx="470" cy="360" rx="330" ry="56" fill="url(#htk)" opacity=".35"/>
    <path d="M140 360q0 60 330 60t330 -60v24q0 60 -330 60t-330 -60z" fill="#000" stroke="#fff" stroke-width="3"/>
    ${tcup(300, 300, 0.9, true)}${tcup(470, 276, 0.8, true)}${tcup(640, 300, 0.9, true)}
    <g transform="translate(470 372)"><path d="M-54 -34h108l-12 64q-42 16 -84 0z" fill="#000" stroke="${RED}" stroke-width="4"/><ellipse cx="0" cy="-34" rx="54" ry="10" fill="#fff"/><circle cx="0" cy="-58" r="15" fill="#fff"/><path d="M-15 -62q0 -22 15 -22q15 0 15 22q-6 -8 -15 -8q-9 0 -15 8z" fill="#000"/><path d="M-22 -40q22 10 44 0" stroke="${RED}" stroke-width="4" fill="none"/></g>
    `, '0 0 800 420');
  }

  function hatter() {
    return svg(`
    <rect width="800" height="420" fill="${RED}"/>
    <rect width="800" height="420" fill="url(#htk)" opacity=".3"/>
    <path d="M250 420q10 -110 150 -120q140 10 150 120z" fill="#000"/>
    <path d="M360 318l40 34l40 -34l14 40l-54 22l-54 -22z" fill="#fff"/>
    <path d="M330 220q-6 96 70 104q76 -8 70 -104z" fill="#fff"/>
    <path d="M400 222q70 0 70 0q4 92 -70 102z" fill="url(#hatchk)" opacity=".6"/>
    <circle cx="372" cy="250" r="12" fill="#000"/><circle cx="432" cy="250" r="12" fill="#000"/><circle cx="375" cy="247" r="4" fill="#fff"/><circle cx="435" cy="247" r="4" fill="#fff"/>
    <path d="M356 282q44 34 92 0q-6 30 -46 30q-40 0 -46 -30z" fill="#000"/><rect x="388" y="286" width="12" height="14" fill="#fff"/><rect x="402" y="286" width="12" height="14" fill="#fff"/>
    <path d="M322 224q-24 16 -18 46q14 -4 22 -22zM478 224q24 16 18 46q-14 -4 -22 -22z" fill="#fff"/>
    <ellipse cx="400" cy="214" rx="170" ry="26" fill="#000" stroke="#fff" stroke-width="4"/>
    <path d="M300 208L280 30Q400 0 520 30L500 208Q400 228 300 208z" fill="#000" stroke="#fff" stroke-width="4"/>
    <path d="M294 150Q400 174 506 150L502 196Q400 216 298 196z" fill="#fff"/>
    <g transform="rotate(-10 450 120)"><rect x="410" y="70" width="84" height="96" fill="#fff" stroke="#000" stroke-width="4"/><text x="452" y="100" ${F} font-size="13" text-anchor="middle" fill="#000">In this style</text><text x="452" y="146" ${F} font-size="38" text-anchor="middle" fill="${RED}">10/6</text></g>
    ${cup(160, 330, 2.4)}${cup(650, 340, 2)}
    `, '0 0 800 420');
  }

  window.Art = { c2s1, c2s2, c2s3, c2s4, splash2, park, hatter, scene1, scene2, scene3, scene4, batman, splash, basement, capture, gordon, clock, RED };
})();
