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

  /* ---------- детали ---------- */
  const F0 = 'font-family="Russo One, Arial Black, sans-serif"';
  // конечность с белым контуром (комиксная обводка)
  const limb = (d, w) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="${w + 6}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#000" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  // кисть: ладонь и пальцы
  const hand = (x, y, rot, open) => `<g transform="translate(${x} ${y}) rotate(${rot})">
    ${open ? [-6, -2, 2, 6].map((f, k) => `<path d="M6 ${f * 0.9}l${10 - Math.abs(k - 1.5) * 2} ${f * 0.5}" stroke="#000" stroke-width="5.5" stroke-linecap="round"/><path d="M6 ${f * 0.9}l${10 - Math.abs(k - 1.5) * 2} ${f * 0.5}" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>`).join('') : ''}
    <ellipse cx="2" cy="0" rx="9" ry="7.5" fill="#fff" stroke="#000" stroke-width="1.6"/>
    ${open ? '<path d="M-2 -7q6 -8 10 -10" stroke="#000" stroke-width="5.5" stroke-linecap="round"/><path d="M-2 -7q6 -8 10 -10" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>' : '<path d="M5 -5v10M8 -4v8" stroke="#000" stroke-width="1.2"/>'}</g>`;

  // плавная «трубка» переменной толщины по контрольным точкам (Catmull-Rom)
  function taper(pts, ws) {
    const P = [], W = [];
    const cr = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); };
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[i], c = pts[i + 1], d = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < 8; k++) { const t = k / 8; P.push([cr(a[0], b[0], c[0], d[0], t), cr(a[1], b[1], c[1], d[1], t)]); W.push(ws[i] + (ws[i + 1] - ws[i]) * t); }
    }
    P.push(pts[pts.length - 1]); W.push(ws[ws.length - 1]);
    const L = [], R = [];
    P.forEach((p, i) => {
      const q = P[Math.min(P.length - 1, i + 1)], o = P[Math.max(0, i - 1)];
      let dx = q[0] - o[0], dy = q[1] - o[1]; const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;
      L.push([p[0] - dy * W[i] / 2, p[1] + dx * W[i] / 2]); R.push([p[0] + dy * W[i] / 2, p[1] - dx * W[i] / 2]);
    });
    const f = v => v[0].toFixed(1) + ' ' + v[1].toFixed(1);
    const e = P[P.length - 1], s0 = P[0];
    return `M${f(L[0])} ${L.map(v => 'L' + f(v)).join(' ')} Q${f([e[0] + (e[0] - P[P.length - 2][0]) * 1.6, e[1] + (e[1] - P[P.length - 2][1]) * 1.6])} ${f(R[R.length - 1])} ${R.slice().reverse().map(v => 'L' + f(v)).join(' ')} Q${f([s0[0] - (P[1][0] - s0[0]) * 1.6, s0[1] - (P[1][1] - s0[1]) * 1.6])} ${f(L[0])}Z`;
  }

  // лежащее тело (вид сверху, лицом вверх, голова слева). o: {date, look: 'watch'|'printer', card}
  function body(x, y, s, o) {
    o = o || {};
    const printer = o.look === 'printer';
    const legR = taper([[132, -18], [172, -24], [212, -26], [250, -24], [282, -22]], [36, 31, 25, 22, 20]);
    const legL = taper([[132, 18], [166, 36], [198, 52], [234, 50], [266, 46]], [36, 31, 25, 22, 20]);
    const armU = taper([[42, -34], [24, -54], [6, -66], [-18, -70], [-40, -70]], [22, 19, 17, 15, 13]);
    const armD = taper([[42, 36], [68, 52], [96, 62], [122, 68], [144, 70]], [22, 19, 17, 15, 13]);
    const sleeveEnd = printer ? 0.55 : 1;
    const torso = 'M34 -38 Q40 -48 58 -46 Q92 -42 126 -36 Q140 -34 146 -22 Q150 0 146 22 Q140 34 126 36 Q92 42 58 46 Q40 48 34 38 Q26 0 34 -38Z';
    const shoe = (cx, cy, r) => `<g transform="rotate(${r} ${cx} ${cy})"><path d="M${cx - 8} ${cy - 11} Q${cx + 16} ${cy - 13} ${cx + 16} ${cy} Q${cx + 16} ${cy + 13} ${cx - 8} ${cy + 11} Q${cx - 13} ${cy} ${cx - 8} ${cy - 11}Z" fill="#000" stroke="#fff" stroke-width="2.6"/>
      <path d="M${cx + 4} ${cy - 10} Q${cx + 12} ${cy} ${cx + 4} ${cy + 10}" fill="none" stroke="#fff" stroke-width="1.4" opacity=".7"/><path d="M${cx - 5} ${cy - 4}l5 2M${cx - 5} ${cy}h6M${cx - 5} ${cy + 4}l5 -2" stroke="#fff" stroke-width="1.2"/><path d="M${cx + 13} ${cy - 6}q3 6 0 12" stroke="#fff" stroke-width="2.4" fill="none"/></g>`;
    const sil = `<path d="${legR}"/><path d="${legL}"/><path d="${armU}"/><path d="${armD}"/><path d="${torso}"/> <ellipse cx="0" cy="0" rx="26" ry="23"/><rect x="18" y="-9" width="18" height="18"/>
      <ellipse cx="290" cy="-22" rx="16" ry="12"/><ellipse cx="274" cy="48" rx="16" ry="12"/><ellipse cx="-50" cy="-70" rx="12" ry="10"/><ellipse cx="154" cy="70" rx="12" ry="10"/>`;
    const ink = 'fill="#000" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"';
    return `<g transform="translate(${x} ${y}) scale(${s || 1})">
    <g filter="url(#chalk)" fill="#000">${sil}</g>
    <path d="${legR}" ${ink}/><path d="${legL}" ${ink}/>
    <path d="M150 -20 Q210 -27 278 -22M150 20 Q192 46 214 50" stroke="#fff" stroke-width="1.2" fill="none" opacity=".7"/>
    <path d="M206 -36q4 10 0 20M192 40q10 2 14 14" stroke="#fff" stroke-width="1.6" fill="none"/>
    <path d="M270 -32v20M254 36l6 18" stroke="#fff" stroke-width="3"/>
    ${shoe(290, -22, 2)}${shoe(274, 48, -6)}
    <path d="${armD}" ${ink}/>${printer ? `<path d="${taper([[96, 62], [122, 68], [144, 70]], [16, 14, 12])}" fill="#fff" stroke="#000" stroke-width="1.4"/>` : '<path d="M136 62l-3 15" stroke="#fff" stroke-width="5"/>'}
    <path d="M84 50q4 8 -2 16" stroke="#fff" stroke-width="1.4" fill="none"/>
    ${hand(154, 70, 8, false)}
    <path d="${torso}" ${ink}/>
    <path d="${torso}" fill="url(#hatch)" opacity=".14"/>
    <path d="M36 -15 L88 -3 L88 3 L36 15 Z" fill="#fff"/>
    <path d="M38 -4 L48 -6 L96 -3 L104 0 L96 3 L48 6 L38 4 Z" fill="#000"/><path d="M37 -5h10v10h-10z" fill="#000" stroke="#fff" stroke-width="1.2"/>
    <path d="M60 -3l30 0M64 2h26" stroke="#fff" stroke-width=".8" opacity=".5"/>
    <path d="M35 -18 L60 -30 L90 -5M35 18 L60 30 L90 5" fill="none" stroke="#fff" stroke-width="2.4"/>
    <path d="M60 -30 L54 -40M60 30 L54 40" stroke="#fff" stroke-width="1.6"/>
    <path d="M62 -42l12 -2l2 7l-12 2z" fill="#fff"/>
    <circle cx="112" cy="9" r="2.6" fill="#fff"/><circle cx="128" cy="9" r="2.6" fill="#fff"/>
    <path d="M126 -36 Q140 -34 146 -22 Q150 0 146 22" stroke="#fff" stroke-width="1.4" fill="none" opacity=".6"/>
    ${printer ? `<path d="M96 -26 Q150 -32 214 -28 Q222 0 214 30 Q150 34 96 28 Q90 0 96 -26Z" fill="#f1ecdf" stroke="#000" stroke-width="2"/>
      <path d="M58 -14 L96 -18 L96 20 L58 16 Z" fill="#f1ecdf" stroke="#000" stroke-width="2"/>
      <path d="M58 -14 L40 -34M58 16 L40 36" stroke="#f1ecdf" stroke-width="3"/><path d="M150 -33v66" stroke="#000" stroke-width="1" opacity=".4"/>
      <g fill="#000"><ellipse cx="114" cy="-10" rx="9" ry="5"/><ellipse cx="160" cy="12" rx="6" ry="9"/><circle cx="188" cy="-14" r="4"/><circle cx="128" cy="20" r="3"/><circle cx="200" cy="8" r="2.5"/><path d="M118 -24q8 4 18 -2"/></g>` : ''}
    <path d="${armU}" ${ink}/>${printer ? `<path d="${taper([[6, -66], [-18, -70], [-40, -70]], [16, 14, 12])}" fill="#fff" stroke="#000" stroke-width="1.4"/>` : '<path d="M-28 -78l-2 16" stroke="#fff" stroke-width="5"/>'}
    <path d="M18 -62q8 4 6 12" stroke="#fff" stroke-width="1.4" fill="none"/>
    ${hand(-50, -70, 180, true)}
    <path d="M18 -9 L36 -10 L36 10 L18 9 Z" fill="#fff" stroke="#000" stroke-width="1.5"/><path d="M24 -8v16" stroke="#000" stroke-width="1" opacity=".4"/>
    <g transform="scale(1.18)">
    <ellipse cx="0" cy="-19" rx="6" ry="3.6" fill="#fff" stroke="#000" stroke-width="1.5"/><ellipse cx="0" cy="19" rx="6" ry="3.6" fill="#fff" stroke="#000" stroke-width="1.5"/>
    <ellipse cx="0" cy="0" rx="22" ry="19" fill="#fff" stroke="#000" stroke-width="2"/>
    <path d="M5 -18 Q21 -14 22 0 Q21 14 5 18 Q15 0 5 -18Z" fill="url(#htk)" opacity=".55"/>
    <path d="M-22 0 Q-23 -19 -6 -20 Q-14 -10 -13 0 Q-14 10 -6 20 Q-23 19 -22 0Z" fill="#000"/>
    <path d="M-18 -9q4 -5 9 -8M-19 4q5 -2 10 5M-20 -2q4 1 6 -1" stroke="#fff" stroke-width="1.1" fill="none"/>
    <path d="M-5 -13 Q-3 -8 -5 -3M-5 3 Q-3 8 -5 13" stroke="#000" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M0 -12 Q3 -8 0 -4M0 4 Q3 8 0 12" stroke="#000" stroke-width="1.5" fill="none"/>
    <path d="M3 -2.5 L11 -1 L11 1.5 L3 2.5" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M14 -5 Q16 0 14 5" stroke="#000" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    ${o.date ? `<text x="-13" y="3" transform="rotate(-90 -13 0)" ${F0} font-size="7.5" text-anchor="middle" fill="${RED}" letter-spacing=".3">${o.date}</text>` : ''}
    </g>
    ${o.card ? `<g transform="translate(-74 -92) rotate(-18)"><rect x="0" y="0" width="28" height="20" fill="#fff" stroke="#000" stroke-width="1.5"/><rect x="0" y="0" width="28" height="6" fill="${RED}"/><path d="M4 11h20M4 15h20" stroke="#000" stroke-width="1"/></g>` : ''}
  </g>`;
  }

  // улика-номерок на полу
  const marker = (x, y, n) => `<g><path d="M${x - 11} ${y}l11 -20l11 20z" fill="#fff" stroke="#000" stroke-width="1.5"/><path d="M${x} ${y - 20}l11 20h4l-11 -20z" fill="#999"/><text x="${x}" y="${y - 3}" ${F0} font-size="10" text-anchor="middle" fill="#000">${n}</text></g>`;

  // настенные часы с делениями, цифрами и фигурными стрелками
  function wallClock(cx, cy, r, h, m, style) {
    const rad = Math.PI / 180, ha = (h % 12 + m / 60) * 30, ma = m * 6;
    let o = '';
    if (style === 'sun') o += range(24).map(i => `<path d="M${cx} ${cy - r - 3}l${i % 2 ? 3 : 5} ${-(i % 2 ? 8 : 14)}l${i % 2 ? 3 : 5} ${(i % 2 ? 8 : 14)}z" fill="#fff" transform="rotate(${i * 15} ${cx} ${cy}) translate(${i % 2 ? -3 : -5} 0)"/>`).join('');
    if (style === 'square') o += `<rect x="${cx - r - 7}" y="${cy - r - 7}" width="${2 * r + 14}" height="${2 * r + 14}" fill="#000" stroke="#fff" stroke-width="3"/><rect x="${cx - r - 7}" y="${cy - r - 7}" width="${2 * r + 14}" height="${2 * r + 14}" fill="url(#hatch)" opacity=".25"/>`;
    if (style === 'oct') { const R = r + 9; o += `<polygon points="${range(8).map(i => `${(cx + Math.cos((i * 45 + 22.5) * rad) * R).toFixed(1)},${(cy + Math.sin((i * 45 + 22.5) * rad) * R).toFixed(1)}`).join(' ')}" fill="#000" stroke="#fff" stroke-width="3"/>`; }
    o += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#000" stroke="#fff" stroke-width="${r > 30 ? 4 : 3}"/><circle cx="${cx}" cy="${cy}" r="${r - 5}" fill="none" stroke="#fff" stroke-width="1"/>`;
    if (r >= 24) o += range(60).filter(i => i % 5).map(i => `<line x1="${cx}" y1="${cy - r + 5}" x2="${cx}" y2="${cy - r + 8}" stroke="#fff" stroke-width=".8" transform="rotate(${i * 6} ${cx} ${cy})"/>`).join('');
    o += range(12).map(i => `<line x1="${cx}" y1="${cy - r + 5}" x2="${cx}" y2="${cy - r + (i % 3 ? 10 : 13)}" stroke="#fff" stroke-width="${i % 3 ? 1.8 : 3}" transform="rotate(${i * 30} ${cx} ${cy})"/>`).join('');
    if (r >= 30) {
      const labels = style === 'roman' ? ['XII', 'III', 'VI', 'IX'] : ['12', '3', '6', '9'];
      labels.forEach((t, k) => { const a = (k * 90 - 90) * rad, d = r - 22; o += `<text x="${(cx + Math.cos(a) * d).toFixed(1)}" y="${(cy + Math.sin(a) * d + 3.5).toFixed(1)}" ${F0} font-size="${r > 36 ? 10 : 8}" text-anchor="middle" fill="#fff">${t}</text>`; });
    }
    const hand = (ang, len, w, tip) => `<g transform="rotate(${ang.toFixed(1)} ${cx} ${cy})"><path d="M${cx - w} ${cy + len * 0.18}L${cx - w * 0.6} ${cy - len + (tip ? 6 : 0)}L${cx} ${cy - len}L${cx + w * 0.6} ${cy - len + (tip ? 6 : 0)}L${cx + w} ${cy + len * 0.18}Z" fill="#fff"/>${tip ? `<circle cx="${cx}" cy="${cy - len * 0.72}" r="${w * 0.9}" fill="none" stroke="#fff" stroke-width="1.2"/>` : ''}</g>`;
    o += hand(ha, r * 0.5, Math.max(2, r * 0.07), true) + hand(ma, r * 0.78, Math.max(1.3, r * 0.045), false);
    if (style === 'sec') o += `<line x1="${cx}" y1="${cy + r * 0.2}" x2="${cx}" y2="${cy - r * 0.85}" stroke="${RED}" stroke-width="1.2" transform="rotate(${(m * 37) % 360} ${cx} ${cy})"/>`;
    o += `<circle cx="${cx}" cy="${cy}" r="${Math.max(2.5, r * 0.09)}" fill="#fff" stroke="#000" stroke-width="1"/>`;
    return `<g>${o}</g>`;
  }

  // напольные часы с маятником
  const grandfather = (x, y) => `<g stroke="#fff" stroke-width="3" fill="#000">
    <path d="M${x - 4} ${y + 6}h64v-8q-32 -26 -64 0z"/><circle cx="${x + 28}" cy="${y - 20}" r="4" fill="#fff"/><path d="M${x - 2} ${y - 4}l-4 -10M${x + 58} ${y - 4}l4 -10" stroke-width="3"/>
    <rect x="${x}" y="${y + 6}" width="56" height="58"/></g>
    ${wallClock(x + 28, y + 35, 22, 3, 40, 'roman')}
    <g stroke="#fff" stroke-width="3" fill="#000"><rect x="${x + 6}" y="${y + 64}" width="44" height="118"/><rect x="${x - 4}" y="${y + 182}" width="64" height="30"/></g>
    <rect x="${x + 6}" y="${y + 64}" width="44" height="118" fill="url(#hatch)" opacity=".18"/>
    <rect x="${x + 14}" y="${y + 72}" width="28" height="96" fill="#000" stroke="#fff" stroke-width="2"/>
    <line x1="${x + 28}" y1="${y + 72}" x2="${x + 24}" y2="${y + 150}" stroke="#fff" stroke-width="2"/><circle cx="${x + 24}" cy="${y + 152}" r="8" fill="#fff"/>
    <rect x="${x + 33}" y="${y + 80}" width="5" height="22" fill="#fff"/><rect x="${x + 18}" y="${y + 92}" width="5" height="22" fill="#fff"/>
    <path d="M${x + 40} ${y + 78}l-8 26" stroke="#fff" stroke-width="1" opacity=".6"/>`;

  /* ============ МЕСТО 1: часовая мастерская ============ */
  // свет из окна с горизонтальными жалюзи: полосы поперёк, разделённые тенью от средней рамы
  function blindsLight(x0, x1, y0, y1, xb0, xb1, n) {
    let o = '';
    const L = y => x0 + (y - y0) * (xb0 - x0) / (y1 - y0), R = y => x1 + (y - y0) * (xb1 - x1) / (y1 - y0);
    for (let k = 0; k < n; k++) {
      const a = y0 + Math.pow(k / n, 1.25) * (y1 - y0), b = y0 + Math.pow((k + 1) / n, 1.25) * (y1 - y0), c = a + (b - a) * 0.58;
      [[a, c]].forEach(([p, q]) => {
        const m = y => (L(y) + R(y)) / 2, g = y => 4 + (y - y0) * 0.035;
        o += `<polygon points="${L(p).toFixed(1)},${p.toFixed(1)} ${(m(p) - g(p)).toFixed(1)},${p.toFixed(1)} ${(m(q) - g(q)).toFixed(1)},${q.toFixed(1)} ${L(q).toFixed(1)},${q.toFixed(1)}"/>`;
        o += `<polygon points="${(m(p) + g(p)).toFixed(1)},${p.toFixed(1)} ${R(p).toFixed(1)},${p.toFixed(1)} ${R(q).toFixed(1)},${q.toFixed(1)} ${(m(q) + g(q)).toFixed(1)},${q.toFixed(1)}"/>`;
      });
    }
    return `<g fill="#fff">${o}</g>`;
  }

  function scene1() {
    const clocks = [[452, 86, 40, 10, 10, 'roman'], [540, 54, 24, 7, 15], [612, 116, 34, 2, 50, 'sun'], [706, 60, 26, 5, 50, 'square'], [762, 150, 20, 11, 5, 'oct'], [532, 150, 21, 4, 20, 'sec'], [440, 186, 17, 8, 35], [690, 152, 16, 1, 25], [292, 82, 22, 9, 45, 'oct']];
    return svg(`
    <rect width="800" height="500" fill="#000"/>
    <rect x="240" y="20" width="560" height="315" fill="url(#ht)" opacity=".10"/>
    <!-- окно: две створки, горизонтальные жалюзи -->
    <rect x="40" y="50" width="190" height="250" fill="#fff"/>
    <path d="M40 300V212h28v-42h26v62h30v-96h22v72h34v-30h20v52h30v70z" fill="#000"/>
    <g fill="#fff">${[[52, 230], [60, 250], [100, 196], [146, 222], [186, 240], [204, 262]].map(p => `<rect x="${p[0]}" y="${p[1]}" width="3" height="4"/>`).join('')}</g>
    ${rainLines(40, 50, 190, 120, 26, 3)}
    <g fill="#000">${range(12).map(i => `<rect x="40" y="${50 + i * 21}" width="190" height="9"/><rect x="40" y="${58 + i * 21}" width="190" height="1.5" fill="#fff" opacity=".35"/>`).join('')}</g>
    <path d="M70 50v250M200 50v250" stroke="#000" stroke-width="1.5"/>
    <rect x="131" y="50" width="8" height="250" fill="#000"/>
    <rect x="34" y="44" width="202" height="262" fill="none" stroke="#fff" stroke-width="5"/>
    <rect x="26" y="304" width="218" height="10" fill="#fff"/><rect x="26" y="314" width="218" height="4" fill="#000"/>
    <path d="M232 40v270" stroke="#fff" stroke-width="2"/><path d="M236 46q14 120 2 264" stroke="#fff" stroke-width="10" fill="none"/><path d="M236 46q14 120 2 264" stroke="#000" stroke-width="2" fill="none" stroke-dasharray="1 9"/>
    <!-- пол -->
    <line x1="0" y1="335" x2="800" y2="335" stroke="#fff" stroke-width="3"/>
    <g stroke="#2b2b2b" stroke-width="1.5">${[348, 364, 384, 410, 442, 480].map(y => `<line x1="0" y1="${y}" x2="800" y2="${y}"/>`).join('')}</g>
    ${blindsLight(66, 238, 338, 500, 300, 574, 11)}
    <!-- стена часов -->
    ${clocks.map(c => wallClock(...c)).join('')}
    ${grandfather(326, 112)}
    <!-- отрывной календарь -->
    <g transform="rotate(-3 275 228)"><path d="M275 188v8" stroke="#fff" stroke-width="2"/><circle cx="275" cy="187" r="2.5" fill="#fff"/>
      <rect x="252" y="196" width="46" height="62" fill="#fff"/><rect x="252" y="196" width="46" height="13" fill="${RED}"/>
      <text x="275" y="206" ${F0} font-size="7" text-anchor="middle" fill="#fff">ЯНВАРЬ</text>
      <text x="275" y="244" ${F0} font-size="30" text-anchor="middle" fill="#000">1</text>
      <path d="M257 250h36M257 254h26" stroke="#000" stroke-width="1"/><path d="M252 258l4 3l4 -3l4 3l4 -3l4 3l4 -3l4 3l4 -3l4 3l4 -3l4 3" fill="none" stroke="#fff" stroke-width="1.2"/></g>
    <!-- прилавок -->
    <rect x="440" y="255" width="340" height="80" fill="#000" stroke="#fff" stroke-width="3"/>
    <rect x="440" y="255" width="340" height="80" fill="url(#hatch)" opacity=".22"/>
    <g stroke="#fff" stroke-width="2" fill="none">${[452, 562, 672].map(x => `<rect x="${x}" y="268" width="96" height="26"/><rect x="${x}" y="300" width="96" height="26"/>`).join('')}</g>
    <g fill="#fff">${[500, 610, 720].map(x => `<rect x="${x - 8}" y="279" width="16" height="4"/><rect x="${x - 8}" y="311" width="16" height="4"/>`).join('')}</g>
    <rect x="432" y="246" width="356" height="12" fill="#fff"/><rect x="432" y="258" width="356" height="3" fill="#000"/>
    <!-- касса -->
    <path d="M462 246v-34l6 -8h76l6 8v34z" fill="#000" stroke="#fff" stroke-width="3"/>
    <rect x="474" y="182" width="52" height="20" fill="#000" stroke="#fff" stroke-width="2.5"/><text x="500" y="197" ${F0} font-size="11" text-anchor="middle" fill="#fff">0.00</text>
    <g fill="#fff">${range(12).map(i => `<rect x="${472 + (i % 6) * 12}" y="${214 + Math.floor(i / 6) * 11}" width="8" height="7"/>`).join('')}</g>
    <path d="M550 222h10v-10" stroke="#fff" stroke-width="3" fill="none"/><circle cx="560" cy="210" r="4" fill="#fff"/>
    <!-- карманные часы на подставке, лоток деталей, лупа -->
    <path d="M592 246v-30M584 246h16" stroke="#fff" stroke-width="3"/>${wallClock(592, 204, 12, 6, 30)}<circle cx="592" cy="190" r="3" fill="none" stroke="#fff" stroke-width="2"/>
    <rect x="606" y="234" width="28" height="12" fill="#000" stroke="#fff" stroke-width="2"/>
    <g fill="none" stroke="#fff" stroke-width="1.5"><circle cx="613" cy="240" r="3"/><circle cx="621" cy="239" r="2"/><circle cx="628" cy="241" r="2.5"/></g>
    <!-- монитор камеры -->
    <path d="M682 248v8M668 258h28" stroke="#fff" stroke-width="3"/>
    <rect x="640" y="192" width="84" height="56" fill="#fff"/><rect x="646" y="198" width="72" height="44" fill="#000"/>
    <g stroke="#fff" stroke-width=".6" opacity=".35">${range(10).map(i => `<line x1="646" y1="${200 + i * 4.3}" x2="718" y2="${200 + i * 4.3}"/>`).join('')}</g>
    <circle cx="682" cy="220" r="14" fill="none" stroke="#fff" stroke-width="2"/><path d="M682 220l-6 -8M682 220l-7 -10" stroke="#fff" stroke-width="2"/>
    <circle cx="710" cy="204" r="3" fill="${RED}"/><text x="652" y="238" font-family="monospace" font-size="6" fill="#fff">CAM 02</text>
    <path d="M700 0v22l34 14v-12z" fill="#fff"/><circle cx="728" cy="30" r="3" fill="${RED}"/>
    <!-- лупа часовщика на полу и номерки -->
    <g transform="rotate(-20 206 384)"><circle cx="206" cy="384" r="10" fill="#000" stroke="#fff" stroke-width="3"/><circle cx="203" cy="381" r="3" fill="#fff" opacity=".7"/><rect x="216" y="381" width="16" height="6" fill="#fff"/></g>
    ${marker(224, 462, 1)}${marker(452, 360, 2)}${marker(186, 410, 3)}
    <!-- тело -->
    ${body(272, 420, 0.95, { date: '1 ЯНВ', look: 'watch', card: true })}
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
    <g>
      <path d="M216 470q2 -44 46 -50q44 6 46 50z" fill="#000" stroke="#fff" stroke-width="3"/>
      <path d="M232 434q30 -10 60 0" stroke="#fff" stroke-width="2" fill="none" stroke-dasharray="4 4"/>
      <path d="M300 442q26 6 30 34" stroke="#000" stroke-width="16" stroke-linecap="round" fill="none"/><path d="M300 442q26 6 30 34" stroke="#fff" stroke-width="2" fill="none"/>
      <ellipse cx="331" cy="482" rx="7" ry="9" fill="#fff" stroke="#000" stroke-width="1.5"/>
      <path d="M250 420l12 8l12 -8" fill="#fff" stroke="#000" stroke-width="1.5"/>
      <!-- голова запрокинута: лицо видно вверх ногами -->
      <g transform="translate(262 396) rotate(180)">
        <ellipse cx="0" cy="-30" rx="12" ry="9" fill="#000" stroke="#fff" stroke-width="2"/>
        <ellipse cx="0" cy="0" rx="21" ry="24" fill="#fff" stroke="#000" stroke-width="2"/>
        <path d="M-21 -2 Q-22 -26 0 -26 Q22 -26 21 -2 Q14 -18 0 -18 Q-14 -18 -21 -2Z" fill="#000"/>
        <path d="M-14 4q5 3 10 0M4 4q5 3 10 0" stroke="#000" stroke-width="2" fill="none"/>
        <circle cx="-9" cy="4" r="7" fill="none" stroke="#000" stroke-width="1.8"/><circle cx="9" cy="4" r="7" fill="none" stroke="#000" stroke-width="1.8"/><path d="M-2 4h4M-16 3l-5 -2M16 3l5 -2" stroke="#000" stroke-width="1.5"/>
        <path d="M0 8l-3 8h5" stroke="#000" stroke-width="1.5" fill="none"/><path d="M-5 18q5 3 10 0" stroke="#000" stroke-width="1.8" fill="none"/>
        <text x="0" y="-9" ${F0} font-size="6.5" text-anchor="middle" fill="${RED}">1 ФЕВ</text>
      </g>
    </g>
    ${range(5).map(i => `<path d="M${40 + i * 70} 520v-40q0 -22 24 -22q24 0 24 22v40z" fill="#000" stroke="#fff" stroke-width="3"/>`).join('')}
    <rect x="700" y="20" width="62" height="20" fill="#000" stroke="${RED}" stroke-width="2"/><text x="731" y="35" ${F0} font-size="11" text-anchor="middle" fill="${RED}">ВЫХОД</text>
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
    ${wallClock(71, 146, 24, 1, 5)}
    <rect x="52" y="182" width="38" height="8" fill="#fff"/><rect x="60" y="174" width="22" height="26" fill="#fff" stroke="#000" stroke-width="1.5"/><line x1="64" y1="184" x2="78" y2="184" stroke="${RED}" stroke-width="2.5"/>
    <!-- печатный станок -->
    <g stroke="#fff" stroke-width="4" fill="#000">
      <circle cx="140" cy="318" r="74"/><circle cx="140" cy="318" r="12" fill="#fff"/>
      ${range(6).map(i => `<line x1="140" y1="318" x2="${(140 + Math.cos(i * 1.047) * 74).toFixed(0)}" y2="${(318 + Math.sin(i * 1.047) * 74).toFixed(0)}"/>`).join('')}
      <path d="M184 432 L196 300 Q200 268 226 262 L300 262 Q326 268 330 300 L342 432Z"/><path d="M160 432h204v26h-204z"/><path d="M196 262l18 -30h104l18 30z"/>
    </g>
    <path d="M184 432 L196 300 Q200 268 226 262 L300 262 Q326 268 330 300 L342 432Z" fill="url(#hatch)" opacity=".22"/>
    <circle cx="140" cy="318" r="58" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="140" cy="318" r="5" fill="#000"/>
    <ellipse cx="300" cy="190" rx="34" ry="10" fill="#000" stroke="#fff" stroke-width="3"/><path d="M300 200v32" stroke="#fff" stroke-width="5"/><path d="M276 186q24 -6 48 0" stroke="#fff" stroke-width="1.5" fill="none" opacity=".7"/>
    <g stroke="#fff" stroke-width="3" fill="#000"><rect x="214" y="282" width="98" height="12" rx="6"/><rect x="214" y="300" width="98" height="12" rx="6"/></g>
    <path d="M140 318 L196 340" stroke="#fff" stroke-width="7"/><circle cx="196" cy="340" r="7" fill="#fff"/>
    <rect x="232" y="330" width="64" height="70" fill="#000" stroke="#fff" stroke-width="2"/><g stroke="#fff" stroke-width="1.5">${range(5).map(i => `<line x1="240" y1="${342 + i * 12}" x2="288" y2="${342 + i * 12}"/>`).join('')}</g>
    <path d="M330 420h40v-20h-40" fill="none" stroke="#fff" stroke-width="3"/><path d="M370 400l14 -6v32l-14 -6" fill="#fff"/>
    <g transform="rotate(-7 250 240)"><rect x="210" y="196" width="84" height="74" fill="#fff"/><text x="252" y="226" font-family="Russo One, Arial Black, sans-serif" font-size="17" text-anchor="middle" fill="#000">KAL.</text><text x="252" y="256" font-family="Russo One, Arial Black, sans-serif" font-size="24" text-anchor="middle" fill="${RED}">APR.</text></g>
    <!-- наборная касса -->
    <rect x="556" y="262" width="216" height="200" fill="#000" stroke="#fff" stroke-width="4"/>
    <g stroke="#fff" stroke-width="2">${range(5).map(i => `<line x1="556" y1="${296 + i * 34}" x2="772" y2="${296 + i * 34}"/>`).join('')}${range(5).map(i => `<line x1="${592 + i * 36}" y1="262" x2="${592 + i * 36}" y2="462"/>`).join('')}</g>
    <g fill="#fff">${range(18).map(i => `<rect x="${562 + (i % 6) * 36 + (i * 7) % 14}" y="${270 + Math.floor(i / 6) * 68 + (i * 5) % 12}" width="9" height="9"/>`).join('')}</g>
    <g fill="#fff">${range(30).map(i => `<rect x="${566 + (i % 6) * 36}" y="${289 + Math.floor(i / 6) * 34}" width="16" height="3"/>`).join('')}</g>
    <rect x="574" y="234" width="170" height="20" fill="#fff"/><g fill="#000">${range(15).map(i => `<rect x="${580 + i * 11}" y="238" width="8" height="12"/>`).join('')}</g>
    <rect x="574" y="250" width="170" height="5" fill="${RED}"/>
    <g stroke="#fff" stroke-width="2.5" fill="#000"><rect x="372" y="440" width="26" height="30"/><rect x="402" y="446" width="22" height="24"/></g><path d="M372 448h26M402 452h22" stroke="#fff" stroke-width="1.5"/><path d="M380 440q4 -8 10 0" stroke="#000" stroke-width="4"/>
    <!-- стол с папкой -->
    <path d="M362 368h180v14h-180z" fill="#fff"/><path d="M376 382v80M528 382v80" stroke="#fff" stroke-width="6"/>
    <g transform="rotate(-6 440 350)"><rect x="392" y="336" width="88" height="34" fill="#fff" stroke="#000" stroke-width="2"/><rect x="398" y="342" width="32" height="6" fill="#000"/><circle cx="460" cy="353" r="10" fill="none" stroke="${RED}" stroke-width="3"/></g>
    <path d="M500 340h26v28h-26z" fill="#000" stroke="#fff" stroke-width="3"/>
    <!-- тело и бумага -->
    <g fill="#fff">${range(5).map(i => `<rect x="${30 + i * 3}" y="${474 - i * 9}" width="${120 - i * 5}" height="6"/>`).join('')}</g>
    ${body(300, 446, 0.7, { date: '1 МАР', look: 'printer' })}
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
    <path d="M500 268q20 18 40 0l-6 14q-14 10 -28 0z" fill="#fff" stroke="#000" stroke-width="1.5"/>
    <circle cx="520" cy="210" r="13" fill="#000" stroke="#fff" stroke-width="2"/>
    <ellipse cx="520" cy="240" rx="21" ry="24" fill="#fff" stroke="#000" stroke-width="2"/>
    <path d="M499 238q0 -26 21 -26q21 0 21 26q-6 -16 -21 -16q-15 0 -21 16z" fill="#000"/>
    <path d="M534 224q8 10 7 26" stroke="#fff" stroke-width="1.2" fill="none" opacity=".6"/>
    <path d="M508 242q5 3 9 0M523 242q5 3 9 0" stroke="#000" stroke-width="2" fill="none"/>
    <path d="M520 246l-3 9h5" stroke="#000" stroke-width="1.5" fill="none"/><path d="M514 258q6 2 12 0" stroke="#000" stroke-width="1.8" fill="none"/>
    <path d="M541 240q4 18 -6 30" stroke="#000" stroke-width="1" fill="none"/><rect x="527" y="232" width="13" height="16" fill="url(#htk)" opacity=".5"/>
    <path d="M472 300q50 14 96 0" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="6 5"/>
    <!-- часовой механизм -->
    <g transform="translate(455 276)"><path d="M0 0q30 -34 44 -38" stroke="${RED}" stroke-width="3" fill="none"/>
      <circle r="22" fill="#000" stroke="${RED}" stroke-width="4"/><circle r="8" fill="${RED}"/>
      ${range(8).map(i => `<rect x="-3" y="-29" width="6" height="8" fill="${RED}" transform="rotate(${i * 45})"/>`).join('')}
      <circle cx="-22" cy="26" r="12" fill="#000" stroke="${RED}" stroke-width="3"/>${range(6).map(i => `<rect x="-24" y="10" width="4" height="5" fill="${RED}" transform="rotate(${i * 60} -22 26)"/>`).join('')}</g>
    <!-- книжные полки -->
    <g stroke="#fff" stroke-width="3" fill="#000"><rect x="610" y="196" width="170" height="140"/></g>
    ${[214, 260, 306].map((y, r) => `<line x1="610" y1="${y + 22}" x2="780" y2="${y + 22}" stroke="#fff" stroke-width="3"/>` + range(11).map(i => `<rect x="${616 + i * 15}" y="${y - 12 + ((i * 7 + r * 3) % 9)}" width="11" height="${34 - ((i * 7 + r * 3) % 9)}" fill="${(i + r) % 4 === 0 ? '#fff' : '#000'}" stroke="#fff" stroke-width="1.5"/>`).join('')).join('')}
    <!-- стол -->
    <path d="M330 344h440v22h-440z" fill="#fff"/>
    <path d="M344 366h412v134h-412z" fill="#000" stroke="#fff" stroke-width="4"/>
    <path d="M344 366h412v134h-412z" fill="url(#hatch)" opacity=".2"/>
    <rect x="380" y="392" width="340" height="80" fill="none" stroke="#fff" stroke-width="2"/>
    <!-- книга на столе -->
    <path d="M556 318l52 10l52 -10v24l-52 10l-52 -10z" fill="#fff" stroke="#000" stroke-width="2"/><line x1="608" y1="328" x2="608" y2="352" stroke="#000" stroke-width="2"/>
    <g stroke="${RED}" stroke-width="2"><line x1="566" y1="328" x2="600" y2="335"/><line x1="566" y1="335" x2="600" y2="342"/><line x1="616" y1="335" x2="650" y2="328"/></g>
    <rect x="452" y="322" width="62" height="20" fill="#000" stroke="#fff" stroke-width="2.5"/><text x="483" y="336" ${F0} font-size="9" text-anchor="middle" fill="#fff">М. ХОЛТ</text>
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

  // голова Человека-календаря: лысый череп в татуировке-сетке с датами
  function calHead(cx, cy, k, id) {
    const head = `M${cx - 62} ${cy} Q${cx - 64} ${cy - 86} ${cx} ${cy - 90} Q${cx + 64} ${cy - 86} ${cx + 62} ${cy} Q${cx + 60} ${cy + 62} ${cx + 30} ${cy + 86} Q${cx} ${cy + 100} ${cx - 30} ${cy + 86} Q${cx - 60} ${cy + 62} ${cx - 62} ${cy}Z`;
    let grid = '';
    for (let r = 0; r < 13; r++) for (let c = 0; c < 9; c++) {
      const x = cx - 72 + c * 16, y = cy - 96 + r * 15, n = r * 9 + c - 2;
      grid += `<rect x="${x}" y="${y}" width="16" height="15" fill="none" stroke="#000" stroke-width="${r < 6 ? 1.1 : 0.6}" opacity="${r < 6 ? 1 : 0.55}"/>`;
      if (n > 0 && n < 32 && (r < 4 || (r > 6 && (c < 2 || c > 6)))) grid += `<text x="${x + 13}" y="${y + 7}" font-family="monospace" font-size="5.5" text-anchor="end" fill="#000">${n}</text>`;
      if (n === 1 || n === 14) grid += `<circle cx="${x + 8}" cy="${y + 7.5}" r="6.5" fill="none" stroke="${RED}" stroke-width="1.8"/>`;
    }
    return `<g transform="translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})">
      <defs><clipPath id="${id}"><path d="${head}"/></clipPath></defs>
      <ellipse cx="${cx - 62}" cy="${cy + 6}" rx="10" ry="18" fill="#fff" stroke="#000" stroke-width="2.5"/><ellipse cx="${cx + 62}" cy="${cy + 6}" rx="10" ry="18" fill="#fff" stroke="#000" stroke-width="2.5"/>
      <path d="${head}" fill="#fff" stroke="#000" stroke-width="3"/>
      <g clip-path="url(#${id})">${grid}
        <path d="M${cx + 8} ${cy - 92} Q${cx + 70} ${cy - 70} ${cx + 64} ${cy + 10} Q${cx + 56} ${cy + 70} ${cx + 22} ${cy + 96} L${cx + 80} ${cy + 100} L${cx + 80} ${cy - 100}Z" fill="url(#htk)" opacity=".75"/>
      </g>
      <path d="M${cx - 44} ${cy - 2} Q${cx - 26} ${cy - 12} ${cx - 8} ${cy - 4}M${cx + 8} ${cy - 4} Q${cx + 26} ${cy - 12} ${cx + 44} ${cy - 2}" stroke="#000" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="${cx - 26}" cy="${cy + 10}" rx="19" ry="13" fill="url(#htk)" opacity=".8"/><ellipse cx="${cx + 26}" cy="${cy + 10}" rx="19" ry="13" fill="url(#htk)" opacity=".9"/>
      <path d="M${cx - 40} ${cy + 10} Q${cx - 26} ${cy + 2} ${cx - 12} ${cy + 10} Q${cx - 26} ${cy + 18} ${cx - 40} ${cy + 10}Z" fill="#fff" stroke="#000" stroke-width="2.5"/>
      <path d="M${cx + 12} ${cy + 10} Q${cx + 26} ${cy + 2} ${cx + 40} ${cy + 10} Q${cx + 26} ${cy + 18} ${cx + 12} ${cy + 10}Z" fill="#fff" stroke="#000" stroke-width="2.5"/>
      <circle cx="${cx - 24}" cy="${cy + 10}" r="3.6" fill="#000"/><circle cx="${cx + 26}" cy="${cy + 10}" r="3.6" fill="#000"/>
      <path d="M${cx - 40} ${cy + 20} q14 6 26 0M${cx + 14} ${cy + 20} q14 6 26 0" stroke="#000" stroke-width="1.5" fill="none"/>
      <path d="M${cx + 2} ${cy + 4} L${cx - 6} ${cy + 40} Q${cx + 2} ${cy + 46} ${cx + 10} ${cy + 40}" stroke="#000" stroke-width="3" fill="none" stroke-linejoin="round"/>
      <path d="M${cx - 32} ${cy + 60} Q${cx - 8} ${cy + 66} ${cx + 32} ${cy + 54}" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M${cx - 20} ${cy + 63} Q${cx} ${cy + 70} ${cx + 22} ${cy + 59}" stroke="#000" stroke-width="1.4" fill="none"/>
      <path d="M${cx - 50} ${cy + 30} q6 22 20 34M${cx + 50} ${cy + 28} q-6 22 -18 32" stroke="#000" stroke-width="1.6" fill="none"/>
      <path d="M${cx - 30} ${cy + 58} l-5 -5M${cx + 30} ${cy + 56} l5 -6" stroke="#000" stroke-width="2.5"/>
      <path d="M${cx - 14} ${cy + 80} q14 6 28 0" stroke="#000" stroke-width="1.5" fill="none"/>
      <path d="M${cx - 48} ${cy - 30} h20M${cx + 26} ${cy - 30} h22" stroke="#000" stroke-width="1.2"/>
    </g>`;
  }
  // плащ с календарной сеткой
  const calCape = (d, id) => {
    let g = '';
    for (let r = 0; r < 14; r++) for (let c = 0; c < 26; c++) g += `<rect x="${c * 30}" y="${200 + r * 26}" width="30" height="26" fill="none" stroke="#000" stroke-width="1.4"/>${(r * 26 + c) % 7 === 3 ? `<text x="${c * 30 + 26}" y="${200 + r * 26 + 11}" font-family="monospace" font-size="9" text-anchor="end" fill="#000">${(r * 26 + c) % 31 + 1}</text>` : ''}`;
    return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><path d="${d}" fill="#f1ecdf" stroke="#000" stroke-width="3"/><g clip-path="url(#${id})">${g}<rect x="0" y="200" width="800" height="400" fill="url(#htk)" opacity=".35"/></g><path d="${d}" fill="none" stroke="#fff" stroke-width="2"/>`;
  };

  function basement() {
    const leaves = range(9).map(i => { const x = 250 + i * 60, y = 30 + (i * 37) % 60; return `<line x1="${x + 17}" y1="0" x2="${x + 17}" y2="${y}" stroke="#fff" stroke-width="1.5"/><g transform="rotate(${(i * 13) % 16 - 8} ${x + 17} ${y})"><rect x="${x}" y="${y}" width="34" height="46" fill="#fff"/><rect x="${x}" y="${y}" width="34" height="9" fill="${i % 4 === 1 ? RED : '#000'}"/><text x="${x + 17}" y="${y + 37}" ${F0} font-size="22" text-anchor="middle" fill="#000">1</text></g>`; }).join('');
    return svg(`
    <rect width="800" height="420" fill="#000"/>
    <path d="M0 0h200l160 420h-360z" fill="#fff"/>
    <g fill="#000">${range(8).map(i => `<path d="M${-20 + i * 26} ${90 + i * 44}h${230 - i * 4}v14h-${230 - i * 4}z"/>`).join('')}</g>
    ${batShadow(-60, 40, 0.75, '#000')}
    ${leaves}
    <!-- станок за спиной -->
    <g stroke="#fff" stroke-width="4" fill="#000"><circle cx="720" cy="300" r="70"/><path d="M640 230h70v190h-70z"/></g>
    <g stroke="#fff" stroke-width="3">${range(6).map(i => `<line x1="720" y1="300" x2="${(720 + Math.cos(i * 1.047) * 70).toFixed(0)}" y2="${(300 + Math.sin(i * 1.047) * 70).toFixed(0)}"/>`).join('')}</g>
    <!-- лампа снизу -->
    <path d="M330 420l90 -150l170 150z" fill="#fff" opacity=".12"/>
    ${calCape('M380 420 Q384 320 450 296 L500 286 L560 300 L620 286 L670 296 Q736 320 740 420Z', 'capeB')}
    <path d="M478 300 L452 196 L520 270 Z M642 300 L668 196 L600 270 Z" fill="#f1ecdf" stroke="#000" stroke-width="3"/>
    <path d="M466 250 L520 270M654 250 L600 270" stroke="#000" stroke-width="1.5"/>
    ${calHead(560, 196, 1, 'calA')}
    <g transform="rotate(-8 450 360)"><rect x="392" y="320" width="120" height="86" fill="#fff" stroke="#000" stroke-width="3"/>
      <text x="452" y="352" ${F0} font-size="20" text-anchor="middle" fill="#000">KAL. MAI.</text><text x="452" y="386" ${F0} font-size="22" text-anchor="middle" fill="${RED}">ГОРОД</text></g>
    <path d="M500 380 q16 -14 30 -4 l10 30 h-36z" fill="#fff" stroke="#000" stroke-width="2.5"/>
    `, '0 0 800 420');
  }

  function capture() {
    return svg(`
    <rect width="800" height="420" fill="${RED}"/>
    <rect width="800" height="420" fill="url(#htk)" opacity=".3"/>
    ${batShadow(40, -20, 1.8, '#000')}
    <g fill="#fff" stroke="#000" stroke-width="2">${range(14).map(i => `<rect x="${40 + (i * 131) % 720}" y="${20 + (i * 67) % 380}" width="22" height="29" transform="rotate(${i * 37} ${51 + (i * 131) % 720} ${34 + (i * 67) % 380})"/>`).join('')}</g>
    ${calCape('M300 420 Q312 330 360 316 L440 316 Q488 330 500 420Z', 'capeC')}
    <g stroke="#000" stroke-width="3">${[['M352 340 Q300 300 290 240', 'L'], ['M448 340 Q500 300 510 240', 'R']].map(([d]) => `<path d="${d}" stroke="#000" stroke-width="30" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#f1ecdf" stroke-width="24" fill="none" stroke-linecap="round"/>`).join('')}</g>
    <g fill="#fff" stroke="#000" stroke-width="2.5"><ellipse cx="288" cy="232" rx="14" ry="12"/><ellipse cx="512" cy="232" rx="14" ry="12"/></g>
    ${calHead(400, 262, 0.62, 'calB')}
    <path d="M384 300 q16 10 32 0" stroke="#000" stroke-width="3" fill="#000"/>
    `, '0 0 800 420');
  }

  // комиссар Гордон: очки, усы, плащ с поднятым воротом
  function gordonFig(x, y, k) {
    return `<g transform="translate(${x} ${y}) scale(${k})">
    <path d="M-110 300 L-96 70 Q-90 22 -40 8 L0 0 L40 8 Q90 22 96 70 L110 300Z" fill="#000" stroke="#fff" stroke-width="3"/>
    <path d="M10 0 Q90 22 96 70 L110 300 L20 300Z" fill="url(#hatch)" opacity=".22"/>
    <path d="M-40 8 L-58 -40 L-6 -6Z M40 8 L58 -40 L6 -6Z" fill="#000" stroke="#fff" stroke-width="3"/>
    <path d="M-34 6 L-14 80 L-56 150 L-72 70Z M34 6 L14 80 L56 150 L72 70Z" fill="#000" stroke="#fff" stroke-width="3"/>
    <path d="M-16 0 L0 70 L16 0Z" fill="#fff"/>
    <path d="M-6 4h12l-2 12l10 58l-14 18l-14 -18l10 -58z" fill="#000" stroke="#fff" stroke-width="1.5"/>
    <path d="M-100 190h200" stroke="#fff" stroke-width="3"/><rect x="-14" y="182" width="28" height="18" fill="#000" stroke="#fff" stroke-width="3"/>
    <circle cx="-34" cy="230" r="4" fill="#fff"/><circle cx="-34" cy="270" r="4" fill="#fff"/>
    <path d="M-80 120q20 60 10 140M60 140q-10 60 0 120" stroke="#fff" stroke-width="1.5" fill="none" opacity=".6"/>
    <path d="M-92 210h40l-6 20h-30z" fill="#000" stroke="#fff" stroke-width="2.5"/><path d="M58 210h40l-6 20h-30z" fill="#000" stroke="#fff" stroke-width="2.5"/>
    <path d="M-20 -14 L-24 4 L-4 -2Z M20 -14 L24 4 L4 -2Z" fill="#fff" stroke="#000" stroke-width="2"/>
    <!-- голова -->
    <ellipse cx="-50" cy="-74" rx="9" ry="15" fill="#fff" stroke="#000" stroke-width="2.5"/><ellipse cx="50" cy="-74" rx="9" ry="15" fill="#fff" stroke="#000" stroke-width="2.5"/>
    <path d="M-48 -90 Q-50 -140 0 -142 Q50 -140 48 -90 Q48 -46 26 -24 Q0 -10 -26 -24 Q-48 -46 -48 -90Z" fill="#fff" stroke="#000" stroke-width="3"/>
    <path d="M8 -142 Q50 -140 48 -90 Q48 -46 26 -24 Q14 -16 4 -14 Q30 -50 26 -100 Q24 -130 8 -142Z" fill="url(#htk)" opacity=".6"/>
    <path d="M-50 -94 Q-60 -150 0 -156 Q58 -152 52 -96 Q46 -118 28 -122 Q6 -128 -14 -124 Q-38 -118 -50 -94Z" fill="#fff" stroke="#000" stroke-width="3"/>
    <path d="M10 -154 Q58 -152 52 -96 Q46 -118 28 -122 Q22 -140 10 -154Z" fill="url(#hatchk)" opacity=".5"/>
    <g stroke="#000" stroke-width="1.5" fill="none"><path d="M-44 -104 Q-36 -134 -6 -146"/><path d="M-34 -118 Q-20 -142 14 -148"/><path d="M-20 -124 Q0 -144 34 -140"/><path d="M0 -127 Q24 -140 46 -120"/><path d="M-48 -98 Q-50 -122 -36 -136"/></g>
    <path d="M-30 -112 h22M-26 -106 h16" stroke="#000" stroke-width="1.3"/>
    <path d="M-38 -94 Q-24 -102 -8 -96M8 -96 Q24 -102 38 -94" stroke="#000" stroke-width="5" fill="none" stroke-linecap="round"/>
    <rect x="-40" y="-90" width="34" height="22" rx="4" fill="#fff" stroke="#000" stroke-width="4"/><rect x="6" y="-90" width="34" height="22" rx="4" fill="#fff" stroke="#000" stroke-width="4"/>
    <path d="M-6 -82h12M-40 -84l-10 -2M40 -84l10 -2" stroke="#000" stroke-width="3"/>
    <path d="M-34 -86l8 -2M12 -86l8 -2" stroke="#000" stroke-width="1.5" opacity=".5"/>
    <circle cx="-22" cy="-78" r="3.4" fill="#000"/><circle cx="24" cy="-78" r="3.4" fill="#000"/>
    <path d="M2 -70 L-6 -46 Q2 -40 10 -46" stroke="#000" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <path d="M-20 -54 q-6 10 -2 20M22 -54 q6 10 2 20" stroke="#000" stroke-width="1.6" fill="none"/>
    <path d="M-30 -36 Q-16 -48 0 -42 Q16 -48 30 -36 Q30 -24 16 -28 Q6 -22 0 -26 Q-6 -22 -16 -28 Q-30 -24 -30 -36Z" fill="#fff" stroke="#000" stroke-width="3"/>
    <g stroke="#000" stroke-width="1.4"><path d="M-22 -36l-2 6M-14 -38l-2 8M-6 -38l-1 9M6 -38l1 9M14 -38l2 8M22 -36l2 6"/></g>
    <path d="M-10 -20 q10 4 20 0" stroke="#000" stroke-width="2" fill="none"/>
    </g>`;
  }

  function gordon() {
    return svg(`
    <rect width="800" height="420" fill="#000"/>
    <path d="M0 420V250h120v-70h90v110h100v-150h80v190h410v90z" fill="#fff" opacity=".12"/>
    <path d="M605 258l-150 -150h70zM605 258l190 -110l10 60z" fill="${RED}" opacity=".4"/><path d="M640 258l-60 -200h40z" fill="#fff" opacity=".15"/>
    ${rainLines(0, 0, 800, 420, 120, 44, '#fff')}
    <!-- патрульная машина -->
    <path d="M440 336q10 -54 70 -60h150q48 4 70 60h60v62h-370v-62z" fill="#fff"/>
    <path d="M516 284h66v44h-80zM590 284h64q22 8 34 44h-98z" fill="#000"/><path d="M586 284v100" stroke="#000" stroke-width="3"/>
    <path d="M440 352h370" stroke="#000" stroke-width="3"/><rect x="796" y="342" width="14" height="10" fill="${RED}"/><rect x="440" y="342" width="16" height="10" fill="#000"/>
    <circle cx="512" cy="398" r="28" fill="#000" stroke="#fff" stroke-width="4"/><circle cx="512" cy="398" r="11" fill="#fff"/><circle cx="728" cy="398" r="28" fill="#000" stroke="#fff" stroke-width="4"/><circle cx="728" cy="398" r="11" fill="#fff"/>
    <rect x="566" y="262" width="34" height="14" fill="${RED}"/><rect x="600" y="262" width="34" height="14" fill="#fff" stroke="#000" stroke-width="2"/>
    <text x="640" y="376" ${F0} font-size="22" text-anchor="middle" fill="#000">G.C.P.D.</text>
    <path d="M660 300l30 26" stroke="#fff" stroke-width="3"/>
    <!-- полицейские вдали -->
    <g fill="#000" stroke="#fff" stroke-width="2"><path d="M380 420v-110q0 -14 12 -16h20q12 2 12 16v110z"/><path d="M384 296h36l-4 -12h-28z"/><circle cx="402" cy="276" r="10"/><path d="M384 270h36v-6h-36z"/></g>
    ${gordonFig(236, 214, 1.08)}
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
    <rect x="356" y="80" width="88" height="92" fill="url(#hatch)" opacity=".2"/>
    ${wallClock(400, 124, 30, 11, 17, 'roman')}
    <path d="M344 80q-12 -6 -14 6q10 -2 14 4M456 80q12 -6 14 6q-10 -2 -14 4" fill="#fff"/><path d="M366 172l-8 10h84l-8 -10" fill="#fff"/>
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
    ${hatterFig(560, 250, 0.42)}
    ${tcup(300, 300, 0.9, true)}${tcup(470, 276, 0.8, true)}${tcup(640, 300, 0.9, true)}
    <g transform="translate(470 372)"><path d="M-54 -34h108l-12 64q-42 16 -84 0z" fill="#000" stroke="${RED}" stroke-width="4"/><ellipse cx="0" cy="-34" rx="54" ry="10" fill="#fff"/><circle cx="0" cy="-58" r="15" fill="#fff"/><path d="M-15 -62q0 -22 15 -22q15 0 15 22q-6 -8 -15 -8q-9 0 -15 8z" fill="#000"/><path d="M-22 -40q22 10 44 0" stroke="${RED}" stroke-width="4" fill="none"/></g>
    `, '0 0 800 420');
  }

  // Безумный Шляпник: огромный цилиндр, всклокоченные волосы, зубастая ухмылка, бант в горошек
  function hatterFig(x, y, k) {
    const tufts = side => range(5).map(i => { const a = side * (20 + i * 14), r = 66; const sx = side * (40 + i * 4), sy = -10 + i * 14;
      return `<path d="M${sx} ${sy} l${side * (26 + (i % 2) * 14)} ${-14 + i * 9} l${-side * 8} ${10} l${side * 22} ${4 + i * 6} l${-side * 34} ${-2}z" fill="#000" stroke="#fff" stroke-width="2"/>`; }).join('');
    return `<g transform="translate(${x} ${y}) scale(${k})">
    <!-- сюртук -->
    <path d="M-150 200 Q-140 100 -70 80 L70 80 Q140 100 150 200Z" fill="#000" stroke="#fff" stroke-width="3"/>
    <path d="M20 80 L70 80 Q140 100 150 200 L60 200Z" fill="url(#hatch)" opacity=".22"/>
    <path d="M-46 80 L0 200 L46 80Z" fill="#f1ecdf"/>
    <path d="M-46 80 L0 200 L46 80Z" fill="url(#htk)" opacity=".35"/>
    <path d="M-70 80 L-30 150 L-56 200 L-100 120Z M70 80 L30 150 L56 200 L100 120Z" fill="#000" stroke="#fff" stroke-width="3"/>
    <path d="M-30 140 Q0 170 30 140" stroke="#fff" stroke-width="2" fill="none" stroke-dasharray="3 3"/><circle cx="30" cy="140" r="8" fill="#fff" stroke="#000" stroke-width="2"/>
    <circle cx="0" cy="170" r="3" fill="#000"/><circle cx="0" cy="188" r="3" fill="#000"/>
    <!-- воротник и бант -->
    <path d="M-30 60 L-20 92 L0 80 L20 92 L30 60Z" fill="#fff" stroke="#000" stroke-width="2.5"/>
    <path d="M0 84 L-62 58 L-66 116 Z M0 84 L62 58 L66 116 Z" fill="${RED}" stroke="#000" stroke-width="3"/>
    <g fill="#fff">${[[-46, 72], [-52, 96], [-30, 90], [46, 72], [52, 96], [30, 90]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="5"/>`).join('')}</g>
    <rect x="-12" y="74" width="24" height="20" rx="4" fill="${RED}" stroke="#000" stroke-width="3"/>
    <!-- голова -->
    ${tufts(-1)}${tufts(1)}
    <ellipse cx="-54" cy="10" rx="10" ry="16" fill="#fff" stroke="#000" stroke-width="2.5"/><ellipse cx="54" cy="10" rx="10" ry="16" fill="#fff" stroke="#000" stroke-width="2.5"/>
    <path d="M-52 -14 Q-56 52 -24 70 Q0 80 24 70 Q56 52 52 -14Z" fill="#fff" stroke="#000" stroke-width="3"/>
    <path d="M6 -14 L52 -14 Q56 52 24 70 Q14 74 6 76 Q30 40 6 -14Z" fill="url(#htk)" opacity=".55"/>
    <ellipse cx="-22" cy="4" rx="16" ry="18" fill="url(#htk)" opacity=".9"/><ellipse cx="22" cy="4" rx="16" ry="18" fill="url(#htk)" opacity=".9"/>
    <circle cx="-22" cy="4" r="12" fill="#fff" stroke="#000" stroke-width="2.5"/><circle cx="22" cy="4" r="12" fill="#fff" stroke="#000" stroke-width="2.5"/>
    <circle cx="-19" cy="6" r="3" fill="#000"/><circle cx="25" cy="2" r="3" fill="#000"/>
    <path d="M-40 -16 Q-24 -32 -6 -18M6 -18 Q24 -34 40 -14" stroke="#000" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M0 6 L-12 34 Q-2 40 6 34" stroke="#000" stroke-width="3" fill="#fff" stroke-linejoin="round"/>
    <path d="M-34 42 Q0 70 36 40 Q28 62 0 64 Q-26 62 -34 42Z" fill="#000"/>
    <path d="M-8 46 h8 v12 h-8z M1 46 h8 v12 h-8z" fill="#fff" stroke="#000" stroke-width="1.5"/>
    <path d="M-26 46 l6 6 l6 -5M14 47 l6 5 l6 -6" stroke="#fff" stroke-width="2" fill="none"/>
    <path d="M-40 34 q-6 6 -4 14M40 32 q6 6 4 14" stroke="#000" stroke-width="1.8" fill="none"/>
    <!-- цилиндр -->
    <ellipse cx="0" cy="-16" rx="100" ry="18" fill="#000" stroke="#fff" stroke-width="3"/>
    <path d="M-56 -20 L-70 -190 Q0 -206 70 -190 L56 -20 Q0 -10 -56 -20Z" fill="#000" stroke="#fff" stroke-width="3"/>
    <path d="M14 -200 Q50 -198 70 -190 L56 -20 Q40 -16 26 -15Z" fill="url(#hatch)" opacity=".25"/>
    <path d="M-58 -46 Q0 -34 58 -46 L57 -24 Q0 -14 -57 -24Z" fill="${RED}"/>
    <path d="M-64 -150 q-2 40 4 90" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>
    <g transform="rotate(-10 30 -80)"><rect x="-2" y="-118" width="64" height="74" fill="#fff" stroke="#000" stroke-width="3"/>
      <text x="30" y="-98" ${F0} font-size="9" text-anchor="middle" fill="#000">In this style</text><text x="30" y="-62" ${F0} font-size="26" text-anchor="middle" fill="${RED}">10/6</text></g>
    </g>`;
  }

  function hatter() {
    return svg(`
    <rect width="800" height="420" fill="${RED}"/>
    <rect width="800" height="420" fill="url(#htk)" opacity=".3"/>
    <g stroke="#000" stroke-width="2">${[[90, 70, -20, '♥'], [690, 90, 18, '♠'], [130, 300, 12, '♦'], [700, 300, -14, '♣'], [240, 40, 30, '♥']].map(([x, y, r, su]) => `<g transform="rotate(${r} ${x} ${y})"><rect x="${x - 26}" y="${y - 36}" width="52" height="72" rx="5" fill="#fff"/><text x="${x}" y="${y + 12}" ${F0} font-size="34" text-anchor="middle" fill="${su === '♥' || su === '♦' ? RED : '#000'}" stroke="none">${su}</text></g>`).join('')}</g>
    ${cup(150, 360, 2.2)}<path d="M140 320q10 -20 0 -40q-10 -20 0 -40M160 318q10 -16 2 -34" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>
    ${hatterFig(420, 236, 1.02)}
    `, '0 0 800 420');
  }

  window.Art = { body, wallClock, marker, svg, calHead, gordonFig, hatterFig, c2s1, c2s2, c2s3, c2s4, splash2, park, hatter, scene1, scene2, scene3, scene4, batman, splash, basement, capture, gordon, clock, RED };
})();
