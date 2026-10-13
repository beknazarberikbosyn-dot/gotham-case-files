/* Графика кампании, глава I: доктор Фосфор, доктор Стрендж, места пожаров. */
(function () {
  const A = window.Art;
  const { svg, rng, range, rainLines, batShadow, marker } = A;
  const RED = A.RED;
  const F = 'font-family="Russo One, Arial Black, sans-serif"';

  /* ---------- пламя ---------- */
  function flames(cx, base, w, h, seed, col) {
    const r = rng(seed);
    let d = `M${cx - w / 2} ${base}`;
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const x = cx - w / 2 + (w * i) / n, tip = base - h * (0.45 + r() * 0.55) * (1 - Math.abs(i / n - 0.5) * 0.9);
      d += ` Q${(x - w / n / 2).toFixed(1)} ${(base - h * 0.25).toFixed(1)} ${x.toFixed(1)} ${tip.toFixed(1)}`;
    }
    d += ` L${cx + w / 2} ${base}Z`;
    return `<path d="${d}" fill="${col || RED}"/>`;
  }

  /* ---------- доктор Фосфор: горящий скелет ---------- */
  function phosFig(x, y, k) {
    const rib = i => `<path d="M0 ${30 + i * 13} Q${-34 + i * 1.5} ${24 + i * 13} ${-38 + i * 2} ${42 + i * 13}M0 ${30 + i * 13} Q${34 - i * 1.5} ${24 + i * 13} ${38 - i * 2} ${42 + i * 13}" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    return `<g transform="translate(${x} ${y}) scale(${k})">
      ${flames(0, 190, 220, 330, 4, RED)}${flames(0, 190, 160, 260, 9, '#ff7a3a')}${flames(0, 190, 100, 200, 13, '#fff4c8')}
      <path d="M-70 190 Q-74 60 -40 30 L40 30 Q74 60 70 190Z" fill="#000" opacity=".55"/>
      <rect x="-4" y="20" width="8" height="150" fill="#fff"/>
      ${range(6).map(rib).join('')}
      <path d="M-30 168 Q0 150 30 168 Q20 188 0 184 Q-20 188 -30 168Z" fill="#fff"/>
      <path d="M-40 34 Q-80 80 -84 140M40 34 Q84 70 98 20" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>
      <g fill="#fff">${[[-86, 148], [-80, 154], [-90, 154]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="4"/>`).join('')}${[[100, 12], [106, 16], [96, 8]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="4"/>`).join('')}</g>
      <path d="M-40 34 h80" stroke="#fff" stroke-width="6"/>
      <!-- череп -->
      <path d="M-34 -30 Q-38 -84 0 -86 Q38 -84 34 -30 Q32 -10 20 -4 L18 12 L-18 12 L-20 -4 Q-32 -10 -34 -30Z" fill="#fff" stroke="#000" stroke-width="2"/>
      <path d="M-24 -44 Q-12 -54 -4 -40 Q-10 -26 -22 -28 Q-28 -34 -24 -44Z M24 -44 Q12 -54 4 -40 Q10 -26 22 -28 Q28 -34 24 -44Z" fill="#000"/>
      <circle cx="-14" cy="-38" r="3.4" fill="${RED}"/><circle cx="14" cy="-38" r="3.4" fill="${RED}"/>
      <path d="M0 -26 L-6 -14 L6 -14Z" fill="#000"/>
      <path d="M-16 0 h32" stroke="#000" stroke-width="2"/><g stroke="#000" stroke-width="1.6">${range(7).map(i => `<line x1="${-15 + i * 5}" y1="-6" x2="${-15 + i * 5}" y2="10"/>`).join('')}</g>
      <path d="M-30 -60 Q-20 -76 0 -78" stroke="#000" stroke-width="1.5" fill="none" opacity=".5"/>
    </g>`;
  }
  const phosPortrait = () => svg(`<rect width="200" height="230" fill="#000"/><rect width="200" height="230" fill="url(#ht)" opacity=".12"/>${phosFig(100, 120, 0.62)}`, '0 0 200 230');

  /* ---------- доктор Стрендж ---------- */
  function strangeFig(x, y, k) {
    return `<g transform="translate(${x} ${y}) scale(${k})">
      <path d="M-90 200 Q-86 90 -40 76 L40 76 Q86 90 90 200Z" fill="#f1ecdf" stroke="#000" stroke-width="3"/>
      <path d="M-40 76 L-14 150 L-30 200M40 76 L14 150 L30 200" stroke="#000" stroke-width="2.5" fill="none"/>
      <path d="M-18 76 L0 120 L18 76Z" fill="#000"/><path d="M-6 80 h12 l-2 10 l6 40 l-10 12 l-10 -12 l6 -40z" fill="${RED}"/>
      <rect x="40" y="110" width="22" height="30" fill="#000"/><path d="M44 110v-6M52 110v-8" stroke="#000" stroke-width="2"/>
      <ellipse cx="-44" cy="-4" rx="8" ry="13" fill="#fff" stroke="#000" stroke-width="2"/><ellipse cx="44" cy="-4" rx="8" ry="13" fill="#fff" stroke="#000" stroke-width="2"/>
      <path d="M-40 -16 Q-42 -68 0 -70 Q42 -68 40 -16 Q40 20 24 38 Q0 50 -24 38 Q-40 20 -40 -16Z" fill="#fff" stroke="#000" stroke-width="3"/>
      <path d="M8 -69 Q42 -66 40 -16 Q40 20 24 38 Q30 0 26 -36 Q22 -60 8 -69Z" fill="url(#htk)" opacity=".45"/>
      <path d="M-34 -48 Q-20 -62 0 -64" stroke="#000" stroke-width="1.4" fill="none" opacity=".6"/>
      <path d="M-30 12 Q-34 60 0 66 Q34 60 30 12 Q20 26 0 24 Q-20 26 -30 12Z" fill="#fff" stroke="#000" stroke-width="2.5"/>
      <g stroke="#000" stroke-width="1.2">${range(9).map(i => `<path d="M${-24 + i * 6} ${22 + Math.abs(i - 4)} q2 14 0 ${30 - Math.abs(i - 4) * 3}" fill="none"/>`).join('')}</g>
      <path d="M-14 22 Q0 30 14 22" stroke="#000" stroke-width="3" fill="none"/>
      <circle cx="-16" cy="-12" r="13" fill="#fff" stroke="#000" stroke-width="4"/><circle cx="16" cy="-12" r="13" fill="#fff" stroke="#000" stroke-width="4"/>
      <path d="M-3 -12h6M-29 -14l-12 -4M29 -14l12 -4" stroke="#000" stroke-width="3"/>
      <circle cx="-16" cy="-12" r="3" fill="#000"/><circle cx="16" cy="-12" r="3" fill="#000"/>
      <path d="M-24 -18l6 -3M8 -18l6 -3" stroke="#000" stroke-width="1.4" opacity=".6"/>
      <path d="M-30 -30 Q-18 -36 -6 -30M6 -30 Q18 -36 30 -30" stroke="#000" stroke-width="3" fill="none"/>
      <path d="M0 -6 L-6 10 Q0 14 6 10" stroke="#000" stroke-width="2" fill="none"/>
    </g>`;
  }

  /* ---------- фото склада: до и после ---------- */
  function warehouseShot(after) {
    const barrel = (x, y, un) => `<g><rect x="${x - 13}" y="${y - 22}" width="26" height="40" rx="3" fill="#ddd" stroke="#000" stroke-width="1.5"/><path d="M${x - 13} ${y - 10}h26M${x - 13} ${y + 6}h26" stroke="#000" stroke-width="1"/><path d="M${x} ${y - 8}l7 7l-7 7l-7 -7z" fill="#fff" stroke="${RED}" stroke-width="1.5"/></g>`;
    let h = `<rect width="400" height="260" fill="#111"/><rect x="10" y="8" width="380" height="244" fill="#1c1c1c" stroke="#fff" stroke-width="3"/>
      ${range(16).map(i => `<line x1="${20 + i * 24}" y1="40" x2="${20 + i * 24}" y2="236" stroke="#262626" stroke-width="2"/>`).join('')}
      <text x="200" y="28" ${F} font-size="15" text-anchor="middle" fill="#fff" letter-spacing="2">${after ? 'W&#160;&#160;NE&#160;CHE&#160;&#160;CALS' : 'WAYNE CHEMICALS'}</text>
      <path d="M40 120h200M40 180h200" stroke="#fff" stroke-width="4"/><path d="M44 120v116M236 120v116" stroke="#fff" stroke-width="3"/>`;
    const xs = [64, 94, 124, 154, 184, 214];
    xs.forEach((x, i) => { if (!(after && (i === 3 || i === 4))) h += barrel(x, 158, ''); });
    xs.slice(0, 5).forEach(x => { h += barrel(x + 6, 216, ''); });
    if (after) h += `<path d="M144 178h46" stroke="${RED}" stroke-width="2" stroke-dasharray="4 3"/>`;
    h += `<rect x="236" y="70" width="40" height="110" fill="none" stroke="#fff" stroke-width="2"/><g stroke="#888" stroke-width="1">${range(8).map(i => `<line x1="236" y1="${74 + i * 13}" x2="276" y2="${86 + i * 13}"/>`).join('')}</g>`;
    if (after) h += `<path d="M244 104 q2 -16 6 -18 q2 10 2 14 q2 -16 6 -16 q1 10 0 16 q3 -12 6 -10 q-2 10 -4 16 q4 -4 6 -2 q-6 12 -14 14 q-8 -2 -8 -14z" fill="#000" stroke="${RED}" stroke-width="1.5"/>`;
    h += `<path d="M330 236V100" stroke="${RED}" stroke-width="6"/><circle cx="334" cy="124" r="14" fill="none" stroke="${RED}" stroke-width="4"/><path d="M320 124h28M334 110v28" stroke="${RED}" stroke-width="2"/>`;
    if (after) h += `<path d="M318 112 q16 10 30 0 M318 136 q16 -10 30 0" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="4 2"/>`;
    h += `<g transform="translate(364 40) rotate(${after ? 30 : 150})"><rect x="-12" y="-6" width="24" height="12" fill="#fff"/><rect x="10" y="-4" width="6" height="8" fill="#888"/></g><path d="M372 30v-14" stroke="#fff" stroke-width="2"/>`;
    h += `<text x="380" y="246" font-family="monospace" font-size="10" text-anchor="end" fill="#ffd400">${after ? 'ПОСЛЕ ПОЖАРА' : 'СТРАХОВАНИЕ'}</text>`;
    return svg(h, '0 0 400 260');
  }

  /* ---------- сцены ---------- */
  function c4s1() {
    const barrel = (x, y, burnt) => `<g><rect x="${x - 16}" y="${y - 30}" width="32" height="52" rx="4" fill="${burnt ? '#2a2a2a' : '#ddd'}" stroke="#fff" stroke-width="2"/><path d="M${x - 16} ${y - 14}h32M${x - 16} ${y + 6}h32" stroke="#000" stroke-width="1.5"/><path d="M${x} ${y - 10}l8 8l-8 8l-8 -8z" fill="#fff" stroke="${RED}" stroke-width="2"/></g>`;
    return svg(`
    <rect width="800" height="500" fill="#000"/>
    ${range(34).map(i => `<line x1="${i * 24}" y1="30" x2="${i * 24}" y2="330" stroke="#1d1d1d" stroke-width="6"/>`).join('')}
    <path d="M0 30h800" stroke="#fff" stroke-width="4"/><path d="M500 0h120l-10 30h-100z" fill="#0d1a2a"/><path d="M510 0l-20 30M600 0l20 30" stroke="#fff" stroke-width="2"/>
    ${rainLines(500, 0, 120, 30, 6, 2, '#fff')}
    <g fill="#000" opacity=".85"><ellipse cx="330" cy="150" rx="140" ry="90"/><ellipse cx="520" cy="110" rx="90" ry="60"/></g>
    <text x="400" y="66" ${F} font-size="26" text-anchor="middle" fill="#fff" letter-spacing="6">W&#160;&#160;NE CHE&#160;&#160;CALS</text>
    <!-- стеллаж с бочками -->
    <g stroke="#fff" stroke-width="5"><path d="M30 330V140M260 330V140"/><path d="M30 220h230M30 330h230M30 140h230"/></g>
    ${barrel(62, 200)}${barrel(104, 200)}${barrel(146, 200, true)}${barrel(222, 200)}${barrel(70, 306)}${barrel(112, 306)}${barrel(154, 306)}${barrel(196, 306)}${barrel(234, 306)}
    <path d="M168 220h28" stroke="${RED}" stroke-width="3" stroke-dasharray="5 4"/>
    <!-- клетка -->
    <rect x="280" y="140" width="130" height="190" fill="none" stroke="#fff" stroke-width="5"/>
    <g stroke="#666" stroke-width="1.4">${range(14).map(i => `<line x1="280" y1="${146 + i * 13}" x2="410" y2="${170 + i * 13}"/><line x1="410" y1="${146 + i * 13}" x2="280" y2="${170 + i * 13}"/>`).join('')}</g>
    <path d="M300 230 q4 -26 10 -30 q3 16 3 22 q4 -26 10 -26 q2 16 0 26 q5 -20 10 -16 q-3 16 -6 26 q6 -6 10 -2 q-10 20 -24 22 q-14 -2 -13 -22z" fill="#000" stroke="${RED}" stroke-width="2.5"/>
    <rect x="378" y="234" width="26" height="34" rx="4" fill="#000" stroke="#fff" stroke-width="3"/><path d="M384 234v-10q7 -10 14 0v10" stroke="#fff" stroke-width="3" fill="none"/>
    <g fill="#fff">${range(4).map(i => `<rect x="${382 + i * 5}" y="${246}" width="3" height="10"/>`).join('')}</g>
    <!-- вентиль спринклеров -->
    <path d="M640 0v330" stroke="#fff" stroke-width="10"/><path d="M640 120h-40v-10" stroke="#fff" stroke-width="8" fill="none"/>
    <circle cx="640" cy="220" r="34" fill="none" stroke="${RED}" stroke-width="8"/><path d="M606 220h68M640 186v68" stroke="${RED}" stroke-width="4"/><circle cx="640" cy="220" r="8" fill="${RED}"/>
    <path d="M610 200 q30 26 60 0M612 246 q28 -24 56 0" stroke="#bbb" stroke-width="4" fill="none" stroke-dasharray="6 3"/>
    <!-- камера и папка со страховкой -->
    <g transform="translate(560 90) rotate(20)"><rect x="-20" y="-9" width="40" height="18" fill="#fff"/><rect x="18" y="-6" width="10" height="12" fill="#888"/></g><path d="M550 82v-50" stroke="#fff" stroke-width="3"/>
    <path d="M730 330V110" stroke="#fff" stroke-width="6"/><rect x="700" y="116" width="62" height="84" fill="#f1ecdf" stroke="#000" stroke-width="2"/><rect x="706" y="126" width="50" height="34" fill="#333"/><path d="M710 168h42M710 176h42M710 184h30" stroke="#000" stroke-width="1.5"/><rect x="722" y="110" width="18" height="10" fill="#888"/>
    <!-- пол с подпалинами -->
    <rect y="330" width="800" height="170" fill="#0d0d0d"/><line x1="0" y1="332" x2="800" y2="332" stroke="#fff" stroke-width="3"/>
    <g fill="#000" stroke="#333" stroke-width="2">${[[340, 400, -1], [420, 380, 0], [500, 410, 1], [380, 450, -1], [470, 460, 1]].map(([x, y, d]) => `<path d="M${x} ${y} l${30 * d - 20} 40 h40z"/>`).join('')}</g>
    <path d="M300 360 Q420 340 540 370 Q560 430 520 480 Q400 492 310 470 Q280 420 300 360Z" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 6" opacity=".6"/>
    <path d="M410 338 q6 6 0 12" stroke="#fff" stroke-width="3" fill="none"/><path d="M414 336 l8 -4 l2 6" stroke="#bbb" stroke-width="2" fill="none"/>
    <!-- сторож на носилках -->
    <path d="M40 440h170v14h-170z" fill="#fff"/><path d="M50 454v26M200 454v26" stroke="#fff" stroke-width="5"/>
    <path d="M70 440 Q74 380 116 372 Q158 380 162 440Z" fill="#000" stroke="#fff" stroke-width="3"/>
    <path d="M134 388 q10 -6 18 2 q-2 12 -12 12 q-8 -4 -6 -14z" fill="${RED}"/>
    <circle cx="116" cy="350" r="18" fill="#fff" stroke="#000" stroke-width="2"/><path d="M98 344 Q102 330 116 330 Q130 330 134 344Z" fill="#000"/><path d="M109 352h5M119 352h5" stroke="#000" stroke-width="2"/><path d="M111 362q5 -3 10 0" stroke="#000" stroke-width="1.6" fill="none"/>
    <path d="M72 420 Q60 400 76 392" stroke="#fff" stroke-width="10" stroke-linecap="round" fill="none"/><path d="M76 396 h36" stroke="#fff" stroke-width="2"/>
    ${marker(250, 470, 1)}${marker(560, 470, 2)}
    `);
  }

  function c4s2() {
    return svg(`
    <rect width="800" height="500" fill="#000"/>
    <rect width="800" height="330" fill="url(#ht)" opacity=".08"/>
    <text x="210" y="40" ${F} font-size="14" fill="#fff" letter-spacing="2">КЛИНИКА ФОНДА ТОМАСА УЭЙНА</text><path d="M200 48h300" stroke="#fff" stroke-width="2"/>
    <!-- оплавленные часы -->
    <path d="M300 64 Q360 58 368 96 Q372 136 356 160 Q346 176 350 196 Q338 176 316 160 Q292 140 298 100 Q296 72 300 64Z" fill="#000" stroke="#fff" stroke-width="4"/>
    <path d="M330 104 L322 82M330 104 L346 112" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="330" cy="104" r="4" fill="#fff"/>
    ${range(8).map(i => `<line x1="${330 + Math.cos(i * 0.785) * 22}" y1="${104 + Math.sin(i * 0.785) * 22 * (i > 3 ? 1.4 : 1)}" x2="${330 + Math.cos(i * 0.785) * 28}" y2="${104 + Math.sin(i * 0.785) * 28 * (i > 3 ? 1.4 : 1)}" stroke="#fff" stroke-width="2"/>`).join('')}
    <!-- коридор и дверь архива -->
    <path d="M400 330 L430 120 h120 L580 330" fill="#111" stroke="#fff" stroke-width="3"/>
    <rect x="440" y="140" width="96" height="190" fill="#000" stroke="#fff" stroke-width="4"/><rect x="440" y="140" width="96" height="190" fill="url(#hatch)" opacity=".25"/>
    <text x="488" y="164" ${F} font-size="11" text-anchor="middle" fill="#fff">АРХИВ</text>
    <path d="M440 330 Q470 230 488 190 Q510 230 536 330" fill="#000" opacity=".8"/><path d="M456 300 q10 -40 30 -60 q16 30 34 60" stroke="${RED}" stroke-width="2" fill="none"/>
    <rect x="514" y="236" width="18" height="8" fill="#fff"/><circle cx="518" cy="240" r="5" fill="#fff"/>
    <!-- окно с налётом -->
    <rect x="610" y="44" width="140" height="80" fill="#fff"/><rect x="610" y="44" width="140" height="80" fill="#bbb" opacity=".6"/>${rainLines(610, 44, 140, 60, 12, 5)}<path d="M680 44v80M610 84h140" stroke="#000" stroke-width="4"/>
    <g fill="#fff" opacity=".9"><ellipse cx="640" cy="64" rx="20" ry="8"/><ellipse cx="712" cy="100" rx="26" ry="10"/></g>
    <!-- доска с картами пациентов -->
    <rect x="600" y="158" width="92" height="76" fill="#000" stroke="#fff" stroke-width="3"/>
    <g fill="#f1ecdf" stroke="#000" stroke-width="1"><rect x="608" y="166" width="34" height="26"/><rect x="648" y="166" width="36" height="26"/><rect x="608" y="198" width="34" height="28"/></g>
    <g transform="rotate(6 666 212)"><rect x="648" y="198" width="38" height="30" fill="#fff" stroke="${RED}" stroke-width="2"/><path d="M652 206h30M652 213h30M652 220h22" stroke="#000" stroke-width="2"/></g>
    <!-- стойка регистратуры -->
    <path d="M20 300h250v100h-250z" fill="#000" stroke="#fff" stroke-width="4"/><path d="M20 300h250v100h-250z" fill="url(#hatch)" opacity=".2"/><path d="M14 292h262v10h-262z" fill="#fff"/>
    <g transform="rotate(-4 120 280)"><rect x="80" y="266" width="96" height="28" fill="#f1ecdf" stroke="#000" stroke-width="2"/><path d="M128 266v28" stroke="#000" stroke-width="1.5"/><path d="M86 274h36M86 282h36M134 274h36" stroke="#bbb" stroke-width="1"/></g>
    <rect x="200" y="262" width="46" height="30" fill="#000" stroke="#fff" stroke-width="2"/><rect x="204" y="266" width="38" height="20" fill="#2a3a4a"/>
    <!-- каталка и кресло-коляска -->
    <g stroke="#fff" stroke-width="4" fill="none"><path d="M620 380h140M630 380v40M750 380v40"/><circle cx="640" cy="430" r="8"/><circle cx="740" cy="430" r="8"/></g><rect x="616" y="362" width="148" height="18" fill="#fff"/>
    <!-- пол -->
    <rect y="330" width="800" height="170" fill="#0c0c0c"/><line x1="0" y1="332" x2="800" y2="332" stroke="#fff" stroke-width="3"/>
    <g stroke="#1e1e1e" stroke-width="2">${range(9).map(i => `<line x1="${i * 100}" y1="332" x2="${i * 100 - 60}" y2="500"/>`).join('')}</g>
    <g stroke="#fff" stroke-width="3" fill="none"><path d="M620 380h140M630 380v40M750 380v40"/></g><rect x="616" y="362" width="148" height="18" fill="#fff"/>
    <g stroke="#fff" stroke-width="4" fill="none"><circle cx="640" cy="430" r="8"/><circle cx="740" cy="430" r="8"/></g>
    <ellipse cx="384" cy="446" rx="20" ry="9" fill="#3a6aa8" stroke="#fff" stroke-width="2"/><path d="M370 446h28" stroke="#fff" stroke-width="1"/>
    ${marker(300, 470, 3)}
    `);
  }

  function c4s3() {
    return svg(`
    <rect width="800" height="500" fill="#000"/>
    <rect width="560" height="340" fill="url(#ht)" opacity=".07"/>
    <path d="M0 110h560" stroke="#fff" stroke-width="10"/><path d="M0 104h560" stroke="#333" stroke-width="2"/>
    <!-- вагон -->
    <path d="M30 130 Q30 116 50 116 H470 Q500 116 520 150 L540 220 Q546 250 520 250 H30Z" fill="#000" stroke="#fff" stroke-width="5"/>
    <path d="M30 190 H540" stroke="${RED}" stroke-width="6"/>
    <g>${range(6).map(i => `<rect x="${52 + i * 62}" y="138" width="46" height="40" fill="#111" stroke="#fff" stroke-width="2"/>`).join('')}</g>
    <g fill="${RED}" opacity=".75">${range(6).map(i => `<path d="M${56 + i * 62} 178 q10 -30 18 -10 q8 -26 18 0 q6 -10 10 10z"/>`).join('')}</g>
    <path d="M440 138 h60 q20 30 24 40 h-84z" fill="#1a2a3a" stroke="#fff" stroke-width="2"/>
    <text x="120" y="232" ${F} font-size="20" fill="#fff" letter-spacing="4">WAYNE</text><text x="440" y="236" ${F} font-size="32" fill="#fff">9</text>
    <path d="M30 250 h510 v26 h-510z" fill="#111" stroke="#fff" stroke-width="3"/>
    <!-- диспетчерская -->
    <path d="M560 40 H790 V340 H560Z" fill="#0b0b0b" stroke="#fff" stroke-width="4"/>
    <rect x="576" y="60" width="200" height="110" fill="#fff"/>${rainLines(576, 60, 200, 90, 18, 12)}<path d="M676 60v110" stroke="#000" stroke-width="4"/>
    <path d="M570 170h214" stroke="#fff" stroke-width="6"/>
    <g transform="translate(626 166)"><rect x="-22" y="-14" width="18" height="14" rx="5" fill="#000" stroke="#fff" stroke-width="2"/><rect x="4" y="-14" width="18" height="14" rx="5" fill="#000" stroke="#fff" stroke-width="2"/><path d="M-4 -8h8" stroke="#fff" stroke-width="3"/></g>
    <path d="M572 210h150v10h-150z" fill="#fff"/><path d="M584 220v40M710 220v40" stroke="#fff" stroke-width="4"/>
    <g transform="rotate(-8 610 206)"><rect x="590" y="196" width="40" height="14" fill="#f1ecdf" stroke="#000" stroke-width="1.5"/><path d="M596 202h28" stroke="${RED}" stroke-width="1.5"/></g>
    <rect x="566" y="250" width="66" height="40" fill="#f1ecdf" stroke="#000" stroke-width="2"/><path d="M572 262h54M572 270h54M572 278h40" stroke="#000" stroke-width="1.2"/>
    <rect x="644" y="264" width="98" height="92" fill="#000" stroke="#fff" stroke-width="4"/><circle cx="694" cy="310" r="24" fill="#000" stroke="#fff" stroke-width="3"/><path d="M694 310v-18" stroke="${RED}" stroke-width="3"/><rect x="726" y="296" width="8" height="26" fill="#fff"/>
    <!-- платформа -->
    <rect y="340" width="800" height="160" fill="#0c0c0c"/><line x1="0" y1="342" x2="800" y2="342" stroke="#fff" stroke-width="3"/>
    <path d="M40 420h200v12h-200z" fill="#fff"/><path d="M52 432v30M228 432v30" stroke="#fff" stroke-width="5"/>
    <g transform="rotate(-6 136 412)"><rect x="96" y="398" width="80" height="22" fill="#e7d8a8" stroke="#000" stroke-width="2"/><path d="M104 404h40M104 410h60" stroke="#000" stroke-width="1"/></g>
    <path d="M308 410h56l-8 62h-40z" fill="#000" stroke="#fff" stroke-width="3"/><g fill="#fff">${[[322, 404], [338, 400], [350, 406]].map(p => `<rect x="${p[0]}" y="${p[1]}" width="10" height="16" transform="rotate(${p[0] - 334} ${p[0]} ${p[1]})"/>`).join('')}</g>
    ${marker(420, 470, 4)}
    `);
  }

  function c4s4() {
    return svg(`
    <rect width="800" height="500" fill="#000"/>
    <!-- Парк-Роу в глубине -->
    <path d="M300 60h200v260h-200z" fill="#1a1a1a"/><path d="M300 60h200v40h-200z" fill="#fff" opacity=".2"/>
    <text x="400" y="88" ${F} font-size="18" text-anchor="middle" fill="#fff" opacity=".7">MONARCH</text>
    <path d="M330 300v-80h40v80M430 300v-60h40v60" fill="#111" stroke="#333" stroke-width="2"/>
    ${rainLines(0, 0, 800, 500, 120, 77, '#fff')}
    <!-- кирпичные стены -->
    <path d="M0 0h300v500h-300z" fill="#0d0d0d"/><path d="M500 0h300v500h-300z" fill="#0d0d0d"/>
    <g stroke="#262626" stroke-width="2">${range(25).map(i => `<line x1="0" y1="${i * 20}" x2="300" y2="${i * 20}"/><line x1="500" y1="${i * 20}" x2="800" y2="${i * 20}"/>`).join('')}${range(25).map(i => range(8).map(j => `<line x1="${j * 40 + (i % 2) * 20}" y1="${i * 20}" x2="${j * 40 + (i % 2) * 20}" y2="${i * 20 + 20}"/><line x1="${500 + j * 40 + (i % 2) * 20}" y1="${i * 20}" x2="${500 + j * 40 + (i % 2) * 20}" y2="${i * 20 + 20}"/>`).join('')).join('')}</g>
    <path d="M300 0v500M500 0v500" stroke="#fff" stroke-width="3"/>
    <!-- пожарная лестница -->
    <g stroke="#fff" stroke-width="3" fill="none"><path d="M120 40v240M200 40v240"/>${range(10).map(i => `<path d="M120 ${50 + i * 24}h80"/>`).join('')}<path d="M100 150h120M100 270h120"/></g>
    <!-- памятная табличка -->
    <rect x="560" y="220" width="84" height="56" fill="#b8962e" stroke="#fff" stroke-width="3"/><path d="M570 236h64M570 246h64M570 256h50M570 266h40" stroke="#000" stroke-width="2"/>
    <!-- Фосфор идёт по переулку -->
    ${phosFig(410, 210, 0.42)}
    <!-- горящие баки -->
    <g><rect x="660" y="360" width="110" height="80" fill="#000" stroke="#fff" stroke-width="3"/>${flames(715, 362, 120, 110, 21, '#fff4c8')}${flames(715, 362, 70, 70, 3, RED)}</g>
    <!-- заряд на стене -->
    <rect x="196" y="226" width="64" height="48" fill="#f1ecdf" stroke="#000" stroke-width="2"/><circle cx="228" cy="250" r="14" fill="#fff" stroke="#000" stroke-width="2"/><path d="M228 250v-10" stroke="${RED}" stroke-width="3"/><path d="M204 232h12" stroke="${RED}" stroke-width="3"/>
    <!-- асфальт -->
    <path d="M300 320 L0 500 H800 L500 320Z" fill="#111"/><path d="M300 320 L0 500M500 320 L800 500" stroke="#fff" stroke-width="2"/>
    <g fill="#777">${[[388, 360], [412, 372], [394, 386], [418, 398]].map(p => `<ellipse cx="${p[0]}" cy="${p[1]}" rx="8" ry="4"/>`).join('')}</g>
    <!-- арсенал, план, счётчик, ампула -->
    <path d="M60 400h100v60h-100z" fill="#000" stroke="#fff" stroke-width="3"/><g fill="#9fd">${range(3).map(i => `<circle cx="${84 + i * 26}" cy="430" r="9"/>`).join('')}</g>${batShadow(85, 404, 0.12, '#fff')}
    <g transform="rotate(-4 340 450)"><rect x="300" y="424" width="80" height="54" fill="#f1ecdf" stroke="#000" stroke-width="2"/><path d="M308 440h64M340 432v40" stroke="#000" stroke-width="1.5"/><circle cx="356" cy="452" r="5" fill="${RED}"/></g>
    <rect x="484" y="414" width="64" height="44" fill="#000" stroke="#fff" stroke-width="3"/><path d="M490 440 q8 -16 16 0 t16 0 t16 0" stroke="#9fd" stroke-width="2" fill="none"/>
    <rect x="684" y="404" width="10" height="20" rx="3" fill="#fff" stroke="#000" stroke-width="1.5"/>
    `);
  }

  /* ---------- сюжетные панели ---------- */
  function splash4() {
    const door = (x, n, open) => `<g><rect x="${x}" y="150" width="90" height="200" fill="${open ? '#000' : '#1a1a1a'}" stroke="#fff" stroke-width="3"/><rect x="${x + 25}" y="170" width="40" height="20" fill="${open ? RED : '#000'}" stroke="#fff" stroke-width="2"/><text x="${x + 45}" y="226" ${F} font-size="22" text-anchor="middle" fill="${open ? RED : '#fff'}">${n}</text>${open ? `<path d="M${x + 90} 150 l30 14 v186 l-30 0z" fill="#333" stroke="#fff" stroke-width="2"/>` : ''}</g>`;
    return svg(`
    <rect width="800" height="420" fill="#0b0b0b"/>
    <path d="M0 350h800" stroke="#fff" stroke-width="3"/>
    ${range(6).map(i => door(30 + i * 128, i + 1, true)).join('')}
    <path d="M0 0h800v120h-800z" fill="#000"/>
    <text x="400" y="60" ${F} font-size="22" text-anchor="middle" fill="#fff" letter-spacing="6">АРКХЕМ · ИЗОЛЯТОР</text>
    ${strangeFig(400, 250, 0.9)}
    `, '0 0 800 420');
  }

  function phoscap() {
    return svg(`
    <rect width="800" height="420" fill="#9fd"/><rect width="800" height="420" fill="url(#htk)" opacity=".25"/>
    ${range(10).map(i => `<path d="M${400 + Math.cos(i * 0.63) * 40} ${230 + Math.sin(i * 0.63) * 40} L${400 + Math.cos(i * 0.63) * 400} ${230 + Math.sin(i * 0.63) * 400}" stroke="#fff" stroke-width="6"/>`).join('')}
    ${phosFig(400, 210, 0.8)}
    <rect width="800" height="420" fill="#cfefff" opacity=".45"/>
    ${batShadow(-20, 10, 1.1, '#000')}
    <g fill="#fff">${range(30).map(i => `<path d="M${(i * 97) % 800} ${(i * 53) % 420}l4 8l-4 8l-4 -8z"/>`).join('')}</g>
    `, '0 0 800 420');
  }

  function interro() {
    return svg(`
    <rect width="800" height="420" fill="#0b0b0b"/>
    <path d="M0 360h800" stroke="#fff" stroke-width="3"/>
    <rect x="300" y="40" width="200" height="320" rx="100" fill="#9fd" opacity=".25" stroke="#fff" stroke-width="5"/>
    ${phosFig(400, 190, 0.55)}
    <rect x="300" y="40" width="200" height="320" rx="100" fill="#cfefff" opacity=".45"/>
    <g stroke="#fff" stroke-width="2" opacity=".7">${range(8).map(i => `<path d="M${320 + i * 22} 60 l6 10 l-6 10"/>`).join('')}</g>
    <path d="M40 420 Q60 200 160 170 Q210 160 220 120 L238 60 L248 110 L262 110 L272 60 L290 120 Q300 170 260 200 Q300 260 300 420Z" fill="#000" stroke="#fff" stroke-width="2"/>
    <path d="M760 420 Q760 300 690 280 Q650 270 640 230 Q640 200 662 196 Q690 196 690 230 Q690 262 720 280 Q780 300 790 420Z" fill="#000" stroke="${RED}" stroke-width="3"/>
    <path d="M648 222h30" stroke="#0c3b22" stroke-width="7"/>
    `, '0 0 800 420');
  }

  function strangeoffice() {
    const photo = (x, y, t, bat) => `<g transform="rotate(${(x % 7) - 3} ${x + 40} ${y + 30})"><rect x="${x}" y="${y}" width="80" height="60" fill="#f1ecdf" stroke="#000" stroke-width="2"/>${bat ? batShadow(x + 10, y + 14, 0.15, '#000') : `<circle cx="${x + 40}" cy="${y + 24}" r="12" fill="#333"/><path d="M${x + 22} ${y + 56}q18 -24 36 0" fill="#333"/>`}<text x="${x + 40}" y="${y + 74}" ${F} font-size="9" text-anchor="middle" fill="#fff">${t}</text></g>`;
    return svg(`
    <rect width="800" height="420" fill="#0b0b0b"/>
    <rect x="380" y="20" width="400" height="260" fill="#1a1a1a" stroke="#fff" stroke-width="3"/>
    ${photo(410, 50, 'Б. УЭЙН')}${photo(620, 46, 'ОБЪЕКТ', true)}${photo(410, 170, 'СКЛАД')}${photo(520, 180, 'КЛИНИКА')}${photo(630, 170, 'ДЕПО')}
    <g stroke="${RED}" stroke-width="2.5" fill="none"><path d="M490 80 Q560 60 620 76"/><path d="M450 110 L450 170M470 110 L560 180M480 100 L670 170"/><path d="M660 106 L560 180M660 106 L670 170M660 106 L450 170"/></g>
    <g>${range(5).map(i => `<rect x="${40 + i * 56}" y="${300 + (i % 2) * 6}" width="50" height="60" fill="#e7d8a8" stroke="#000" stroke-width="2" transform="rotate(${i * 3 - 6} ${65 + i * 56} 330)"/><text x="${65 + i * 56}" y="${336 + (i % 2) * 6}" ${F} font-size="10" text-anchor="middle" fill="#000">№${i + 2}</text>`).join('')}</g>
    <path d="M0 370h800" stroke="#fff" stroke-width="3"/><path d="M20 370h340v-10h-340z" fill="#fff"/>
    ${strangeFig(220, 170, 0.95)}
    <g transform="rotate(-10 320 300)"><rect x="290" y="270" width="70" height="50" fill="#fff" stroke="#000" stroke-width="2"/><path d="M296 282h56M296 292h56M296 302h40" stroke="#000" stroke-width="1.5"/><path d="M296 312h30" stroke="${RED}" stroke-width="2"/></g>
    `, '0 0 800 420');
  }

  Object.assign(window.Art, { phosFig, phosPortrait, strangeFig, warehouseShot, c4s1, c4s2, c4s3, c4s4, splash4, phoscap, interro, strangeoffice });
})();
