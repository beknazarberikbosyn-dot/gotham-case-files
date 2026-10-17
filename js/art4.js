/* Графика кампании, глава I «Шесть открытых дверей»: доктор Фосфор, места пожаров, архив. */
(function () {
  const A = window.Art;
  const { svg, rng, range, rainLines, batShadow, marker } = A;
  const RED = A.RED;
  const F = 'font-family="Russo One, Arial Black, sans-serif"';
  const MONO = 'font-family="monospace"';
  const BONE = '#f4f1e6', PAPER = '#f1ecdf';
  const f1 = n => (+n).toFixed(1);
  const pl = pts => 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L');

  /* ---------- огонь, дым, искры ---------- */
  const tongue = (x, y, h, w, lean) => `M${f1(x - w / 2)} ${f1(y)}C${f1(x - w / 2)} ${f1(y - h * .38)} ${f1(x + lean * .35 - w * .5)} ${f1(y - h * .58)} ${f1(x + lean)} ${f1(y - h)}C${f1(x + lean * .45 + w * .2)} ${f1(y - h * .62)} ${f1(x + w * .55)} ${f1(y - h * .42)} ${f1(x + w / 2)} ${f1(y)}Q${f1(x)} ${f1(y + w * .3)} ${f1(x - w / 2)} ${f1(y)}Z`;
  const HOT = [[RED, 1], ['#ff8a3d', .8], ['#fff4c8', .6], ['#fff', .38]];
  const WP = [[RED, 1], ['#ffd9a8', .74], ['#fff', .48]];
  function fire(x, y, w, h, seed, o) {
    o = o || {};
    const r = rng(seed), n = o.n || 5, sp = [];
    for (let i = 0; i < n; i++) {
      const t = n > 1 ? i / (n - 1) - .5 : 0;
      sp.push({ dx: t * w, hh: h * (.55 + r() * .45) * (1 - Math.abs(t) * .7), lean: (r() - .5) * h * .4, ww: (w / n) * 2 });
    }
    return `<g${o.op ? ` opacity="${o.op}"` : ''}>` + (o.layers || HOT).map(([c, k]) => `<path d="${sp.map(s => tongue(x + s.dx * k, y, s.hh * k, s.ww * k, s.lean * k)).join('')}" fill="${c}"/>`).join('') + '</g>';
  }
  function smoke(x, y, w, h, seed, col, op) {
    const r = rng(seed);
    return `<g fill="${col || '#fff'}" opacity="${op || .12}" filter="url(#glowP)">` + range(16).map(() => `<circle cx="${f1(x + (r() - .5) * w)}" cy="${f1(y - r() * h)}" r="${f1(w * .08 + r() * w * .14)}"/>`).join('') + '</g>';
  }
  const embers = (x, y, w, h, seed, n) => {
    const r = rng(seed);
    return range(n || 14).map(i => { const px = f1(x + (r() - .5) * w), py = f1(y - r() * h), s = f1(1.5 + r() * 2.5); return `<rect x="${px}" y="${py}" width="${s}" height="${s}" fill="${i % 3 ? RED : '#fff4c8'}" transform="rotate(45 ${px} ${py})"/>`; }).join('');
  };
  const frostStars = (x, y, w, h, seed, n) => {
    const r = rng(seed);
    return `<g stroke="#e6fbff" stroke-width="1.6" stroke-linecap="round">` + range(n || 16).map(() => { const px = x + (r() - .5) * w, py = y - r() * h, s = 3 + r() * 5; return `<path d="M${f1(px - s)} ${f1(py)}h${f1(s * 2)}M${f1(px - s * .5)} ${f1(py - s * .87)}l${f1(s)} ${f1(s * 1.73)}M${f1(px + s * .5)} ${f1(py - s * .87)}l${f1(-s)} ${f1(s * 1.73)}"/>`; }).join('') + '</g>';
  };
  /* выжженная ладонь */
  function palmPrint(x, y, s, rot, glow) {
    const fingers = [[-15, -30, -14, 26], [-5, -38, -4, 30], [5, -37, 4, 30], [14, -31, 12, 25]];
    const shape = col => `<path d="M-19 -8Q-22 18 -6 24Q12 26 19 12Q22 -6 17 -14Q0 -20 -19 -8Z" fill="${col}"/>` + fingers.map(([fx, fy, a, l]) => `<rect x="${fx - 4.5}" y="${fy}" width="9" height="${l}" rx="4.5" fill="${col}" transform="rotate(${a} ${fx} ${fy + l})"/>`).join('') + `<rect x="-30" y="-6" width="9" height="22" rx="4.5" fill="${col}" transform="rotate(-48 -24 10)"/>`;
    return `<g transform="translate(${x} ${y}) rotate(${rot || 0}) scale(${s})">${glow ? `<g filter="url(#glowS)">${shape(RED)}</g>` : `<g transform="scale(1.12)">${shape(RED)}</g>`}${shape('#0a0a0a')}<g opacity=".5" transform="scale(.7)">${shape('#3a1208')}</g></g>`;
  }

  /* ---------- кости и череп ---------- */
  const bone = (d, w) => `<path d="${d}" fill="none" stroke="#000" stroke-width="${w + 3}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${BONE}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const knob = (x, y, r) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r + 1.5}" fill="#000"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${BONE}"/>`;
  function skull(cx, cy, s, o) {
    o = o || {};
    const eyes = o.eyes === 'dead'
      ? '<path d="M-15 -5l6 6M-9 -5l-6 6M9 -5l6 6M15 -5l-6 6" stroke="#5a7d8a" stroke-width="2"/>'
      : `<g filter="url(#glowS)"><circle cx="-12" cy="-4" r="5" fill="${RED}"/><circle cx="12" cy="-4" r="5" fill="${RED}"/></g><circle cx="-12" cy="-4" r="2.2" fill="#fff"/><circle cx="12" cy="-4" r="2.2" fill="#fff"/>`;
    return `<g transform="translate(${f1(cx)} ${f1(cy)}) rotate(${o.rot || 0}) scale(${s})">
      <path d="M-29 -4C-33 -36 -17 -50 0 -50C17 -50 33 -36 29 -4C28 6 25 12 22 17L19 27C17 36 9 41 0 41C-9 41 -17 36 -19 27L-22 17C-25 12 -28 6 -29 -4Z" fill="${BONE}" stroke="#000" stroke-width="2.4"/>
      <path d="M10 -49C26 -44 33 -30 29 -4C28 6 25 12 22 17L19 27C17 35 12 39 6 40C14 30 18 10 18 -8C18 -26 16 -40 10 -49Z" fill="url(#htk)" opacity=".55"/>
      <path d="M-25 -16Q-14 -24 -3 -14M25 -16Q14 -24 3 -14" stroke="#000" stroke-width="3" fill="none"/>
      <path d="M-22 -5C-22 -16 -6 -17 -4 -7C-3 2 -9 7 -15 7C-20 6 -22 1 -22 -5ZM22 -5C22 -16 6 -17 4 -7C3 2 9 7 15 7C20 6 22 1 22 -5Z" fill="#000"/>
      ${eyes}
      <path d="M0 6L-5 16Q0 19 5 16Z" fill="#000"/>
      <path d="M-25 8Q-21 18 -14 16M25 8Q21 18 14 16" stroke="#000" stroke-width="1.6" fill="none"/>
      <path d="M-14 21H14V28H-14Z" fill="${BONE}" stroke="#000" stroke-width="1.6"/>
      <g stroke="#000" stroke-width="1.3">${range(7).map(i => `<line x1="${-12 + i * 4}" y1="21" x2="${-12 + i * 4}" y2="34"/>`).join('')}</g>
      <path d="M-15 28Q0 32 15 28" stroke="#000" stroke-width="1.8" fill="none"/>
      <path d="M-21 -36Q-8 -44 6 -44" stroke="#000" stroke-width="1.2" fill="none" opacity=".5"/>
    </g>`;
  }

  /* ---------- доктор Фосфор ---------- */
  const PH = {
    stand: { head: [0, -382], rot: 0, neck: [0, -345], wy: -205, shL: [-58, -318], shR: [58, -318], elL: [-80, -238], wrL: [-92, -164], hL: 'claw', elR: [100, -372], wrR: [112, -440], hR: 'open', knL: [-30, -96], knR: [30, -96], anL: [-34, -18], anR: [34, -18], toL: [-66, -2], toR: [66, -2] },
    idle: { head: [0, -382], rot: 0, neck: [0, -345], wy: -205, shL: [-58, -318], shR: [58, -318], elL: [-78, -238], wrL: [-88, -164], hL: 'claw', elR: [78, -238], wrR: [88, -164], hR: 'claw', knL: [-28, -96], knR: [28, -96], anL: [-30, -18], anR: [30, -18], toL: [-60, -2], toR: [60, -2] },
    kneel: { head: [12, -290], rot: 16, neck: [0, -252], wy: -112, shL: [-58, -225], shR: [58, -225], elL: [-76, -148], wrL: [-86, -72], hL: 'claw', elR: [80, -150], wrR: [96, -76], hR: 'claw', knL: [-38, -10], knR: [38, -10] }
  };
  function handPts(wr, el, type) {
    const dx = wr[0] - el[0], dy = wr[1] - el[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, px = -uy, py = ux;
    const palm = [wr[0] + ux * 15, wr[1] + uy * 15];
    const fingers = [-1.5, -.5, .5, 1.5].map((f, i) => {
      const kx = palm[0] + px * f * 5.5, ky = palm[1] + py * f * 5.5;
      const sp = type === 'open' ? f * .3 : f * .12, ca = Math.cos(sp), sa = Math.sin(sp);
      const vx = ux * ca - uy * sa, vy = ux * sa + uy * ca, len = [18, 22, 21, 16][i];
      const m = [kx + vx * len * .55, ky + vy * len * .55];
      const c = type === 'claw' ? 1 : .15, c2 = Math.cos(c), s2 = Math.sin(c);
      const wx = vx * c2 - vy * s2, wy = vx * s2 + vy * c2;
      return [[kx, ky], m, [m[0] + wx * len * .5, m[1] + wy * len * .5]];
    });
    const tb = [wr[0] + ux * 5 + px * 8, wr[1] + uy * 5 + py * 8];
    const thumb = [tb, [tb[0] + (ux * .5 + px * .8) * 11, tb[1] + (uy * .5 + py * .8) * 11], [tb[0] + (ux + px * .6) * 19, tb[1] + (uy + py * .6) * 19]];
    return { palm, fingers, thumb };
  }
  function phosFig(x, y, k, o) {
    o = o || {};
    const J = PH[o.pose || 'stand'], lit = !o.frozen, weak = !!o.weak;
    const hL = handPts(J.wrL, J.elL, J.hL), hR = handPts(J.wrR, J.elR, J.hR);
    const nx = J.neck[0], ny = J.neck[1], wy = J.wy;
    const torso = pl([[nx - 12, ny], [nx - 34, ny + 10], [J.shL[0] - 4, J.shL[1] - 2], [J.shL[0] - 2, J.shL[1] + 36], [nx - 48, ny + 92], [nx - 38, wy - 10], [nx - 40, wy], [nx + 40, wy], [nx + 38, wy - 10], [nx + 48, ny + 92], [J.shR[0] + 2, J.shR[1] + 36], [J.shR[0] + 4, J.shR[1] - 2], [nx + 34, ny + 10], [nx + 12, ny]]) + 'Z';
    const limbs = [[pl([J.shL, J.elL]), 32], [pl([J.elL, J.wrL]), 26], [pl([J.wrL, hL.palm]), 20], [pl([J.shR, J.elR]), 32], [pl([J.elR, J.wrR]), 26], [pl([J.wrR, hR.palm]), 20], [pl([J.neck, J.head]), 24]];
    [hL, hR].forEach(h => h.fingers.concat([h.thumb]).forEach(f => limbs.push([pl(f), 7])));
    if (J.anL) limbs.push([pl([J.knL, J.anL]), 27], [pl([J.knR, J.anR]), 27], [pl([J.anL, J.toL]), 15], [pl([J.anR, J.toR]), 15]);
    const shapes = (col, ex) => `<path d="${torso}" fill="${col}" stroke="${col}" stroke-width="${ex || .01}" stroke-linejoin="round"/>` + limbs.map(([d, w]) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w + ex}" stroke-linecap="round" stroke-linejoin="round"/>`).join('') + `<ellipse cx="${J.head[0]}" cy="${J.head[1] - 2}" rx="${36 + ex / 2}" ry="${50 + ex / 2}" fill="${col}" transform="rotate(${J.rot} ${J.head[0]} ${J.head[1]})"/>`;
    // штаны пациента, оборванные и прожжённые
    const hem = (a, b, seed) => { const r = rng(seed); let d = ''; for (let i = 1; i <= 5; i++) { const t = i / 6; d += `L${f1(a[0] + (b[0] - a[0]) * t)} ${f1(a[1] + (b[1] - a[1]) * t + (i % 2 ? 9 + r() * 7 : -2))}`; } return d + `L${f1(b[0])} ${f1(b[1])}`; };
    const oL = [J.knL[0] - 19, J.knL[1] - 2], iL = [J.knL[0] + 15, J.knL[1] - 4], oR = [J.knR[0] + 19, J.knR[1] - 2], iR = [J.knR[0] - 15, J.knR[1] - 4];
    const pants = `M-43 ${wy}L43 ${wy}L${oR[0]} ${oR[1]}${hem(oR, iR, 5)}L5 ${wy + 50}L-5 ${wy + 50}L${iL[0]} ${iL[1]}${hem(iL, oL, 8)}Z`;
    // кости
    const off = (a, b, d) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); return [-dy / L * d, dx / L * d]; };
    const pair = (a, b, w1, w2) => { const [ox, oy] = off(a, b, 3.2); return bone(pl([[a[0] + ox, a[1] + oy], [b[0] + ox, b[1] + oy]]), w1) + bone(pl([[a[0] - ox, a[1] - oy], [b[0] - ox, b[1] - oy]]), w2); };
    let bones = '';
    for (let yy = ny + 4; yy < wy - 4; yy += 9) bones += `<rect x="${nx - 5}" y="${yy}" width="10" height="6.5" rx="2.5" fill="${BONE}" stroke="#000" stroke-width="1.4"/>`;
    for (let i = 0; i < 6; i++) { const yy = ny + 26 + i * 11, ex = 44 - i * 1.6; bones += bone(`M${nx - 4} ${yy}Q${f1(nx - ex - 6)} ${yy - 5} ${f1(nx - ex + 3)} ${yy + 19}`, 4) + bone(`M${nx + 4} ${yy}Q${f1(nx + ex + 6)} ${yy - 5} ${f1(nx + ex - 3)} ${yy + 19}`, 4); }
    bones += bone(`M${nx} ${ny + 22}V${ny + 86}`, 6);
    bones += bone(`M${nx - 6} ${ny + 18}Q${nx - 30} ${ny + 10} ${J.shL[0] + 2} ${J.shL[1] + 2}M${nx + 6} ${ny + 18}Q${nx + 30} ${ny + 10} ${J.shR[0] - 2} ${J.shR[1] + 2}`, 5);
    bones += bone(`M${nx - 34} ${wy + 2}Q${nx - 30} ${wy - 16} ${nx - 10} ${wy - 8}M${nx + 34} ${wy + 2}Q${nx + 30} ${wy - 16} ${nx + 10} ${wy - 8}`, 4);
    [[J.shL, J.elL, J.wrL, hL], [J.shR, J.elR, J.wrR, hR]].forEach(([s, e, w, h]) => {
      bones += knob(s[0], s[1], 7) + bone(pl([s, e]), 6) + knob(e[0], e[1], 5) + pair(e, w, 3.5, 2.5) + knob(w[0], w[1], 4);
      bones += h.fingers.concat([h.thumb]).map(f => bone(pl([w, f[0]]), 2) + bone(pl(f), 2.4)).join('');
    });
    if (J.anL) [[J.knL, J.anL, J.toL], [J.knR, J.anR, J.toR]].forEach(([kk, a, t]) => { bones += pair(kk, a, 5, 2.5) + knob(a[0], a[1], 4) + [-6, -1, 4].map(d => bone(pl([a, [t[0], t[1] + d]]), 2)).join(''); });
    // пламя
    let back = '', front = '';
    if (lit) {
      const q = weak ? .45 : 1;
      back = fire(J.shL[0] + 8, J.shL[1] + 14, 90, 230 * q, 4, { layers: WP, n: 5 }) + fire(J.shR[0] - 8, J.shR[1] + 14, 90, 220 * q, 9, { layers: WP, n: 5 }) + fire(J.head[0], J.head[1] + 10, 110, 270 * q, 13, { layers: WP, n: 7 }) + fire(nx, wy, 140, 190 * q, 17, { layers: WP, n: 6 });
      const W = { layers: WP, n: 3, op: .9 };
      front = fire(J.elL[0] + 4, J.elL[1] + 6, 22, 60 * q, 37, W) + fire(hL.palm[0], hL.palm[1] + 8, 22, 50 * q, 41, W) + fire(J.shL[0] - 10, J.shL[1] + 30, 16, 50 * q, 21, W) + fire(J.shR[0] + 10, J.shR[1] + 30, 16, 50 * q, 23, W) + (J.hR === 'open' ? fire(hR.palm[0] + 4, hR.palm[1] - 4, 50, 140 * q, 31, { layers: WP, n: 4 }) : fire(hR.palm[0], hR.palm[1] + 8, 22, 50 * q, 43, W));
    }
    const holes = `<g fill="#000" stroke="${lit ? RED : '#555'}" stroke-width="2"><path d="M-30 ${wy + 40}q8 -8 14 2q-2 10 -10 8q-8 -2 -4 -10z"/><path d="M20 ${wy + 70}q6 -6 12 0q0 8 -6 9q-8 -1 -6 -9z"/></g>`;
    return `<g transform="translate(${x} ${y}) scale(${k})">
      ${lit ? smoke(nx, J.head[1] - 150, 260, 220, 3, '#fff', weak ? .05 : .08) : smoke(nx + 10, J.head[1] - 30, 220, 180, 3, '#fff', .16)}
      ${back}
      <g filter="url(#glowP)" opacity="${lit ? (weak ? .45 : .8) : .4}">${shapes(lit ? '#d9ffe9' : '#bfefff', 30)}</g>
      ${shapes(lit ? '#f0fff5' : '#e2f8ff', 6)}
      ${shapes(lit ? '#16291f' : '#15242c', 0)}
      <g opacity=".22">${shapes('url(#ht)', 0)}</g>
      ${bones}
      <path d="${pants}" fill="#262626" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="${pants}" fill="url(#hatch)" opacity=".08"/>
      ${holes}
      <path d="M-40 ${wy + 6}H40" stroke="#fff" stroke-width="1.5" opacity=".5"/>
      ${skull(J.head[0], J.head[1], 1, { rot: J.rot, eyes: lit ? 'hot' : 'dead' })}
      ${front}
      ${lit ? embers(nx, J.head[1] + 40, 300, 320, 7, weak ? 6 : 18) : frostStars(nx, wy + 60, 220, 340, 5, 22) + `<g fill="#e6fbff" opacity=".85">${[J.elL, J.elR, J.wrL, J.wrR].map((p, i) => `<path d="M${f1(p[0] - 6)} ${f1(p[1] + 8)}l4 ${16 + i * 3}l4 -${16 + i * 3}z"/>`).join('')}</g>`}
    </g>`;
  }
  const phosPortrait = () => svg(`<rect width="200" height="230" fill="#000"/><circle cx="100" cy="110" r="140" fill="url(#hotGlow)" opacity=".35"/>${phosFig(96, 312, .56)}`, '0 0 200 230');

  /* ---------- доктор Хьюго Стрендж (для следующих дел главы) ---------- */
  function strangeFig(x, y, k) {
    return `<g transform="translate(${x} ${y}) scale(${k})">
      <path d="M-96 210 Q-92 96 -44 80 L44 80 Q92 96 96 210Z" fill="${PAPER}" stroke="#000" stroke-width="3"/>
      <path d="M-44 80 L-20 160 L-34 210M44 80 L20 160 L34 210" stroke="#000" stroke-width="2.5" fill="none"/>
      <path d="M-30 80 L0 150 L30 80Z" fill="#111"/><path d="M-14 80 L0 112 L14 80Z" fill="#fff" stroke="#000" stroke-width="1.5"/>
      <path d="M-5 86h10l-2 8l6 42l-9 12l-9 -12l6 -42z" fill="${RED}" stroke="#000" stroke-width="1"/>
      <rect x="44" y="118" width="20" height="28" fill="#000"/><path d="M48 118v-8M56 118v-6" stroke="#000" stroke-width="2.5"/>
      <path d="M-20 60 Q-18 82 0 84 Q18 82 20 60Z" fill="#fff" stroke="#000" stroke-width="2"/>
      <ellipse cx="-41" cy="-8" rx="8" ry="13" fill="#fff" stroke="#000" stroke-width="2"/><ellipse cx="41" cy="-8" rx="8" ry="13" fill="#fff" stroke="#000" stroke-width="2"/>
      <path d="M-38 -14 Q-40 -74 0 -76 Q40 -74 38 -14 Q38 14 30 30 L-30 30 Q-38 14 -38 -14Z" fill="#fff" stroke="#000" stroke-width="3"/>
      <path d="M10 -75 Q40 -72 38 -14 Q38 14 30 30 L22 30 Q30 -6 26 -40 Q22 -64 10 -75Z" fill="url(#htk)" opacity=".5"/>
      <path d="M-30 -56 Q-18 -68 0 -70" stroke="#000" stroke-width="1.4" fill="none" opacity=".5"/>
      <path d="M-34 4 Q-38 44 -20 62 Q0 78 20 62 Q38 44 34 4 Q28 20 14 22 Q0 18 -14 22 Q-28 20 -34 4Z" fill="#d6d6d6" stroke="#000" stroke-width="2.5"/>
      <g stroke="#7a7a7a" stroke-width="1.2">${range(11).map(i => `<path d="M${-26 + i * 5.2} ${28 + Math.abs(i - 5) * 1.5} l${(i - 5) * .4} ${14 - Math.abs(i - 5)}" fill="none"/>`).join('')}</g>
      <path d="M-18 20 Q0 10 18 20 Q9 27 0 25 Q-9 27 -18 20Z" fill="#bdbdbd" stroke="#000" stroke-width="2"/>
      <path d="M-7 32 Q0 34 7 32" stroke="#000" stroke-width="2.5" fill="none"/>
      <path d="M0 -6 L-6 12 Q0 15 6 12" stroke="#000" stroke-width="2" fill="none"/>
      <path d="M-33 -32 Q-20 -40 -5 -30M33 -32 Q20 -40 5 -30" stroke="#000" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="-17" cy="-14" r="14" fill="#fff" stroke="#000" stroke-width="4.5"/><circle cx="17" cy="-14" r="14" fill="#fff" stroke="#000" stroke-width="4.5"/>
      <path d="M-25 -20l9 -7M-24 -10l15 -12M9 -20l9 -7M10 -10l15 -12" stroke="#a9b6bd" stroke-width="3" stroke-linecap="round"/>
      <path d="M-3 -14h6M-31 -16l-9 -2M31 -16l9 -2" stroke="#000" stroke-width="3.5"/>
    </g>`;
  }

  /* ---------- Робин со спины, в три четверти ---------- */
  function robinBack(x, y, k) {
    return `<g transform="translate(${x} ${y}) scale(${k})">
      <path d="M-120 200 Q-118 70 -40 50 L40 50 Q118 70 120 200Z" fill="#000" stroke="#fff" stroke-width="3"/>
      <path d="M-60 70 Q-50 140 -70 200M60 70 Q50 140 70 200" stroke="#333" stroke-width="3" fill="none"/>
      <path d="M-46 52 Q-60 64 -84 78 Q-60 70 -40 66Z" fill="${RED}"/><path d="M46 52 Q60 64 84 78 Q60 70 40 66Z" fill="${RED}"/>
      <path d="M-26 30 Q-30 56 0 60 Q30 56 26 30Z" fill="#000" stroke="#fff" stroke-width="2"/>
      <path d="M-34 -8 Q-38 -52 0 -54 Q36 -52 34 -8 Q34 22 14 34 Q0 40 -14 34 Q-34 22 -34 -8Z" fill="${PAPER}" stroke="#000" stroke-width="3"/>
      <path d="M-36 -10 Q-46 -40 -30 -56 L-24 -44 Q-18 -66 0 -62 L2 -50 Q18 -70 32 -54 L28 -42 Q46 -44 40 -20 Q38 -10 36 -4 Q30 -30 6 -34 Q-24 -36 -36 -10Z" fill="#111" stroke="#fff" stroke-width="1.5"/>
      <path d="M-34 -10 Q-20 -18 -6 -12 L-8 0 Q-22 4 -32 0Z" fill="#000"/><path d="M-30 -8 Q-22 -12 -12 -8 Q-20 -4 -28 -4Z" fill="#fff"/>
      <path d="M-34 14 Q-28 20 -20 18" stroke="#000" stroke-width="2" fill="none"/>
      <ellipse cx="30" cy="-4" rx="6" ry="10" fill="${PAPER}" stroke="#000" stroke-width="2"/>
    </g>`;
  }

  /* ---------- портреты для архива главы ---------- */
  const baseMug = A.mug;
  function campMug(id) {
    const lines = range(6).map(i => `<line x1="0" y1="${14 + i * 14}" x2="80" y2="${14 + i * 14}" stroke="#999" stroke-width=".6"/><text x="2" y="${12 + i * 14}" ${MONO} font-size="5" fill="#777">${190 - i * 10}</text>`).join('');
    const plate = n => `<rect x="20" y="82" width="40" height="11" fill="#111"/><text x="40" y="90" ${MONO} font-size="6" text-anchor="middle" fill="#fff">${n}</text>`;
    const face = (fill) => `<path d="M26 40 Q25 22 40 21 Q55 22 54 40 Q54 56 46 63 Q40 66 34 63 Q26 56 26 40Z" fill="${fill || '#fff'}" stroke="#000" stroke-width="1.6"/>`;
    const ears = '<ellipse cx="25.5" cy="43" rx="2.6" ry="4.4" fill="#fff" stroke="#000" stroke-width="1.2"/><ellipse cx="54.5" cy="43" rx="2.6" ry="4.4" fill="#fff" stroke="#000" stroke-width="1.2"/>';
    const shade = '<path d="M44 22 Q55 24 54 40 Q54 56 46 63 Q50 46 48 34 Q47 26 44 22Z" fill="url(#htk)" opacity=".5"/>';
    const eyes = (y, c) => `<path d="M31 ${y}h6M43 ${y}h6" stroke="${c || '#000'}" stroke-width="2.2" stroke-linecap="round"/>`;
    const nose = '<path d="M40 44 L37 51 Q40 53 43 51" stroke="#000" stroke-width="1.2" fill="none"/>';
    const bust = (fill, extra) => `<path d="M6 96 Q8 70 40 66 Q72 70 74 96Z" fill="${fill || '#111'}" stroke="#000" stroke-width="1.4"/>${extra || ''}`;
    const P = {
      phos: `<rect width="80" height="96" fill="#0c0c0c"/><circle cx="40" cy="44" r="40" fill="url(#hotGlow)" opacity=".5"/>${fire(40, 34, 40, 34, 13, { n: 5 })}${bust('#14211a', '<path d="M6 96 Q8 70 40 66 Q72 70 74 96" fill="none" stroke="#e6fff0" stroke-width="1.6"/>' + range(4).map(i => `<path d="M40 ${74 + i * 5}q-14 -3 -18 5M40 ${74 + i * 5}q14 -3 18 5" stroke="${BONE}" stroke-width="1.6" fill="none"/>`).join(''))}<ellipse cx="40" cy="43" rx="17" ry="23" fill="#14211a" stroke="#e6fff0" stroke-width="1.6"/>${skull(40, 45, .42)}`,
      firefly: bust('#3b3b3b', `<path d="M24 70 L40 82 L56 70" stroke="${RED}" stroke-width="3" fill="none"/><rect x="30" y="76" width="20" height="8" fill="#222" stroke="#999" stroke-width="1"/>`) + ears + face() + shade +
        `<path d="M25 34 Q22 16 40 14 Q58 14 56 32 Q50 24 42 26 Q32 22 25 34Z" fill="#b5552c" stroke="#000" stroke-width="1.4"/>
         <rect x="25" y="24" width="30" height="9" rx="4" fill="#111"/><circle cx="33" cy="28.5" r="5" fill="#2c4a2a" stroke="#111" stroke-width="2"/><circle cx="47" cy="28.5" r="5" fill="#2c4a2a" stroke="#111" stroke-width="2"/><path d="M31 26l3 -2M45 26l3 -2" stroke="#9fd" stroke-width="1.2"/>
         ${eyes(41)}<circle cx="34" cy="41.5" r="1.3"/><circle cx="46" cy="41.5" r="1.3"/>${nose}<path d="M34 57 q6 -2 12 0" stroke="#000" stroke-width="1.4" fill="none"/>
         <path d="M44 48 q4 2 8 0 q-1 6 -5 9 q-3 -3 -3 -9z" fill="${RED}" opacity=".55"/><path d="M45 51l5 1M46 54l4 0" stroke="#000" stroke-width=".7"/>`,
      moth: bust('#4a4a4a', `<path d="M6 96 Q4 76 20 70 L40 80 L60 70 Q76 76 74 96Z" fill="#6a6a6a" stroke="#000" stroke-width="1.2"/><path d="M14 86 Q26 76 40 82 Q54 76 66 86" stroke="#000" stroke-width="1" fill="none"/>`) +
        `<path d="M22 46 Q20 16 40 14 Q60 16 58 46 Q58 64 40 68 Q22 64 22 46Z" fill="#555" stroke="#000" stroke-width="1.6"/>
         <path d="M30 16 Q24 4 14 6M50 16 Q56 4 66 6" stroke="#000" stroke-width="1.8" fill="none"/><circle cx="14" cy="6" r="2.5"/><circle cx="66" cy="6" r="2.5"/>
         <path d="M29 36 Q40 30 51 36 L51 62 Q40 68 29 62Z" fill="#fff" stroke="#000" stroke-width="1.3"/>
         <circle cx="32" cy="34" r="6.5" fill="#d8b94a" stroke="#000" stroke-width="1.6"/><circle cx="48" cy="34" r="6.5" fill="#d8b94a" stroke="#000" stroke-width="1.6"/><circle cx="32" cy="34" r="2.2"/><circle cx="48" cy="34" r="2.2"/>
         ${nose}<path d="M34 55 q6 -3 12 0" stroke="#000" stroke-width="1.6" fill="none"/><path d="M33 51.5 q7 -2 14 0" stroke="#000" stroke-width="1.2" fill="none"/>`,
      wesker: bust('#2b2b2b', `<path d="M32 66 L40 78 L48 66" fill="#fff" stroke="#000" stroke-width="1"/><path d="M38 70h4l-1 10h-2z" fill="${RED}"/>`) +
        `<g transform="translate(58 58)"><path d="M-8 40 Q-10 18 0 14 Q12 14 14 40Z" fill="#333" stroke="#000" stroke-width="1.2"/><ellipse cx="2" cy="6" rx="9" ry="10" fill="#f4e0c0" stroke="#000" stroke-width="1.3"/><path d="M-10 -1 L14 -1 L12 -4 Q2 -10 -8 -4Z" fill="#111"/><path d="M-12 -1h28" stroke="#111" stroke-width="2"/><circle cx="-1" cy="5" r="1.2"/><circle cx="6" cy="5" r="1.2"/><path d="M-3 12 h10" stroke="#000" stroke-width="1.6"/><path d="M-5 3 l4 6" stroke="${RED}" stroke-width="1"/><path d="M8 12 l6 1" stroke="#fff" stroke-width="1.6"/></g>
         ${ears}${face()}${shade}<path d="M26 34 Q24 26 30 24M54 34 Q56 26 50 24" stroke="#bbb" stroke-width="4" fill="none"/>
         <circle cx="34" cy="41" r="5" fill="#fff" stroke="#000" stroke-width="1.4"/><circle cx="46" cy="41" r="5" fill="#fff" stroke="#000" stroke-width="1.4"/><path d="M39 41h2" stroke="#000" stroke-width="1.2"/><circle cx="34" cy="42" r="1.4"/><circle cx="46" cy="42" r="1.4"/>
         <path d="M30 34 q4 -2 8 0M42 34 q4 -2 8 0" stroke="#000" stroke-width="1" fill="none"/>${nose}<path d="M36 57 q4 -2 8 0" stroke="#000" stroke-width="1.2" fill="none"/>`,
      magpie: bust('#111', `<g fill="#222" stroke="#fff" stroke-width=".7">${range(7).map(i => `<path d="M${10 + i * 10} 96 l4 -22 l4 22z"/>`).join('')}</g>`) +
        `<path d="M22 60 Q14 30 28 16 Q40 8 54 16 Q66 30 58 62 Q52 46 52 34 Q44 26 30 30 Q28 46 22 60Z" fill="#0d0d0d" stroke="#000" stroke-width="1.2"/>
         ${face()}${shade}<path d="M30 18 Q34 12 42 12 Q36 18 34 30 Q31 24 30 18Z" fill="#fff"/>
         <path d="M28 40 Q34 34 38 40 Q34 42 28 40Z" fill="#000"/><path d="M52 40 Q46 34 42 40 Q46 42 52 40Z" fill="#000"/><path d="M27 39 l-6 -5 l7 2zM53 39 l6 -5 l-7 2z" fill="#000"/>
         <circle cx="34" cy="39.5" r="1.3" fill="#fff"/><circle cx="46" cy="39.5" r="1.3" fill="#fff"/>${nose}<path d="M35 57 q5 -3 10 0 q-5 3 -10 0z" fill="${RED}"/>`,
      clay: bust('#6e5f4c', `<g fill="#6e5f4c">${[[18, 74], [30, 80], [58, 76]].map(([dx, dy]) => `<path d="M${dx} ${dy} q3 8 0 14 q-3 -6 0 -14z"/>`).join('')}</g>`) +
        `<path d="M20 50 Q18 18 40 16 Q62 18 60 50 Q62 70 54 74 Q52 82 48 74 Q40 78 34 74 Q30 84 26 72 Q18 68 20 50Z" fill="#8a7860" stroke="#000" stroke-width="1.6"/>
         <path d="M50 20 Q60 26 60 50 Q61 66 55 72 Q56 50 54 36 Q53 26 50 20Z" fill="url(#htk)" opacity=".45"/>
         <path d="M28 40 Q32 34 36 40 Q34 46 30 45 Q27 44 28 40Z" fill="#111"/><path d="M44 42 Q48 36 52 41 Q51 47 47 47 Q44 46 44 42Z" fill="#111"/><circle cx="32" cy="41" r="1.4" fill="#fff"/><circle cx="48" cy="43" r="1.4" fill="#fff"/>
         <path d="M30 58 Q40 66 52 57 Q46 62 40 62 Q34 62 30 58Z" fill="#111"/><path d="M24 30 q2 6 0 10M56 32 q-2 5 0 9" stroke="#5a4b3a" stroke-width="1.2" fill="none"/>`,
      ralston: bust('#fff', `<path d="M28 68 L40 80 L52 68" stroke="#000" stroke-width="1.4" fill="none"/><path d="M40 80V96" stroke="#000" stroke-width="1"/><rect x="50" y="70" width="14" height="10" fill="${PAPER}" stroke="#000" stroke-width="1"/><path d="M52 73h10" stroke="${RED}" stroke-width="1.6"/><path d="M52 77h7" stroke="#000" stroke-width=".8"/><path d="M57 70v-4" stroke="#888" stroke-width="1.4"/>`) +
        `${ears}<path d="M26 38 Q25 22 40 21 Q55 22 54 38 L54 52 Q52 62 40 64 Q28 62 26 52Z" fill="#fff" stroke="#000" stroke-width="1.6"/>${shade}
         <path d="M26 34 Q24 18 40 17 Q56 18 54 34 Q52 26 46 25 Q38 22 30 26 Q27 28 26 34Z" fill="#a08460" stroke="#000" stroke-width="1.3"/>
         <path d="M30 37 h8M42 37 h8" stroke="#000" stroke-width="2.2"/>${eyes(42)}<circle cx="34" cy="42" r="1.2"/><circle cx="46" cy="42" r="1.2"/>${nose}<path d="M34 57 h12" stroke="#000" stroke-width="1.6"/><path d="M30 60 Q40 66 50 60" stroke="#000" stroke-width=".8" fill="none" opacity=".5"/>`,
      unknown: `<rect width="80" height="96" fill="#bfb8a6"/>${bust('#1a1a1a')}<path d="M25 44 Q24 20 40 19 Q56 20 55 44 Q55 62 40 66 Q25 62 25 44Z" fill="#1a1a1a"/>
         <text x="40" y="54" ${F} font-size="30" text-anchor="middle" fill="${RED}">?</text>
         <g transform="rotate(-14 40 76)"><rect x="8" y="68" width="64" height="15" fill="none" stroke="${RED}" stroke-width="2"/><text x="40" y="79" ${F} font-size="8" text-anchor="middle" fill="${RED}">НЕТ ДАННЫХ</text></g>`
    };
    const NUM = { phos: 'А-0417', firefly: 'А-1138', moth: 'А-0562', wesker: 'А-0919', magpie: 'А-0703', clay: 'А-0333', ralston: 'ПЕРСОНАЛ', unknown: '— — —' };
    if (!P[id]) return baseMug(id);
    const bg = id === 'phos' || id === 'unknown' ? '' : '<rect width="80" height="96" fill="#d9d4c4"/>';
    return `<svg viewBox="0 0 80 96">${bg}${P[id].startsWith('<rect width="80"') ? P[id].replace(/^(<rect[^>]*\/>)/, '$1' + lines) : lines + P[id]}${plate(NUM[id])}</svg>`;
  }

  /* ---------- фото склада: до и после ---------- */
  function warehouseShot(after) {
    const barrel = (x, y) => `<g><rect x="${x - 13}" y="${y - 22}" width="26" height="40" rx="3" fill="#ddd" stroke="#000" stroke-width="1.5"/><path d="M${x - 13} ${y - 10}h26M${x - 13} ${y + 6}h26" stroke="#000" stroke-width="1"/><path d="M${x} ${y - 8}l7 7l-7 7l-7 -7z" fill="#fff" stroke="${RED}" stroke-width="1.5"/></g>`;
    let h = `<rect width="400" height="260" fill="#111"/><rect x="10" y="8" width="380" height="244" fill="#1c1c1c" stroke="#fff" stroke-width="3"/>
      ${range(16).map(i => `<line x1="${20 + i * 24}" y1="40" x2="${20 + i * 24}" y2="236" stroke="#262626" stroke-width="2"/>`).join('')}
      <text x="200" y="28" ${F} font-size="15" text-anchor="middle" fill="#fff" letter-spacing="2">${after ? 'W&#160;&#160;NE&#160;CHE&#160;&#160;CALS' : 'WAYNE CHEMICALS'}</text>
      <path d="M40 120h200M40 180h200" stroke="#fff" stroke-width="4"/><path d="M44 120v116M236 120v116" stroke="#fff" stroke-width="3"/>`;
    const xs = [64, 94, 124, 154, 184, 214];
    xs.forEach((x, i) => { if (!(after && (i === 3 || i === 4))) h += barrel(x, 158); });
    xs.slice(0, 5).forEach(x => { h += barrel(x + 6, 216); });
    if (after) h += `<path d="M144 178h46" stroke="${RED}" stroke-width="2" stroke-dasharray="4 3"/>`;
    h += `<rect x="236" y="70" width="40" height="110" fill="none" stroke="#fff" stroke-width="2"/><g stroke="#888" stroke-width="1">${range(8).map(i => `<line x1="236" y1="${74 + i * 13}" x2="276" y2="${86 + i * 13}"/>`).join('')}</g>`;
    if (after) h += palmPrint(256, 106, .42, 8);
    h += `<path d="M330 236V100" stroke="${RED}" stroke-width="6"/><circle cx="334" cy="124" r="14" fill="none" stroke="${RED}" stroke-width="4"/><path d="M320 124h28M334 110v28" stroke="${RED}" stroke-width="2"/>`;
    if (after) h += `<path d="M318 112 q16 10 30 0 M318 136 q16 -10 30 0" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="4 2"/>`;
    h += `<g transform="translate(364 40) rotate(${after ? 30 : 150})"><rect x="-12" y="-6" width="24" height="12" fill="#fff"/><rect x="10" y="-4" width="6" height="8" fill="#888"/></g><path d="M372 30v-14" stroke="#fff" stroke-width="2"/>`;
    h += `<text x="380" y="246" ${MONO} font-size="10" text-anchor="end" fill="#ffd400">${after ? 'ПОСЛЕ ПОЖАРА' : 'СТРАХОВАНИЕ'}</text>`;
    return svg(h, '0 0 400 260');
  }

  /* ---------- общие предметы ---------- */
  const barrelBig = (x, y, burnt) => `<g><rect x="${x - 16}" y="${y - 30}" width="32" height="52" rx="4" fill="${burnt ? '#2a2a2a' : '#ddd'}" stroke="#fff" stroke-width="2"/><path d="M${x - 16} ${y - 14}h32M${x - 16} ${y + 6}h32" stroke="#000" stroke-width="1.5"/><path d="M${x} ${y - 10}l8 8l-8 8l-8 -8z" fill="#fff" stroke="${RED}" stroke-width="2"/>${burnt ? `<path d="M${x - 16} ${y - 30}q8 12 16 4q8 10 16 -4" fill="#000"/>` : ''}</g>`;
  const ghostBarrel = (x, y) => `<rect x="${x - 16}" y="${y - 30}" width="32" height="52" rx="4" fill="none" stroke="${RED}" stroke-width="2.5" stroke-dasharray="6 4"/><ellipse cx="${x}" cy="${y + 20}" rx="14" ry="3" fill="#000" opacity=".6"/>`;
  const bareFoot = (x, y, s, rot, col) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" fill="${col}"><path d="M-6 -10Q-9 4 -5 14Q0 19 5 14Q8 4 6 -10Q4 -16 0 -16Q-5 -16 -6 -10Z"/><circle cx="-5" cy="-20" r="2.6"/><circle cx="-0.5" cy="-21.5" r="2.4"/><circle cx="3.5" cy="-20.5" r="2.1"/><circle cx="6.5" cy="-18" r="1.8"/><circle cx="8.6" cy="-14.6" r="1.5"/></g>`;
  const SOLE = 'M0 -30C9 -30 12 -20 11 -10C10 -2 6 4 6 10C6 18 8 24 0 26C-8 24 -6 18 -6 10C-6 4 -11 -2 -11 -10C-12 -20 -9 -30 0 -30Z';
  const coverPrint = (x, y, s, rot) => `<g transform="translate(${x} ${y}) scale(1 .55)"><g transform="rotate(${rot}) scale(${s})"><path d="${SOLE}" fill="#4f7fc0" opacity=".8"/><path d="${SOLE}" fill="none" stroke="#a9cbf3" stroke-width="2" stroke-dasharray="3 2"/><g stroke="#24497a" stroke-width="1.6" fill="none">${range(7).map(i => `<path d="M-8 ${-24 + i * 7}q8 ${i % 2 ? 3 : -3} 16 0"/>`).join('')}</g></g></g>`;
  const ashFoot = (x, y, s, rot) => `<g transform="translate(${x} ${y}) scale(1 .5)">${bareFoot(0, 0, s, rot, '#8a8a8a')}<g fill="#4a4a4a" transform="rotate(${rot}) scale(${s})">${[[-3, -6], [2, 2], [-1, 9], [3, -12]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="1.6"/>`).join('')}</g></g>`;

  /* ---------- место 1: склад ---------- */
  function c4s1() {
    const letters = 'WAYNE CHEMICALS'.split(''), burnt = [1, 2, 9, 10];
    const sign = letters.map((c, i) => {
      const lx = 236 + i * 23;
      if (c === ' ') return '';
      if (burnt.includes(i)) return `<g><path d="M${lx - 10} 72q-4 -18 4 -30q6 -8 10 2q6 -10 8 4q4 14 -4 26q4 10 -2 30q-4 -16 -8 -6q-6 -12 -8 -26z" fill="#050505"/><path d="M${lx - 6} 50q4 -8 8 0" stroke="${RED}" stroke-width="2" fill="none"/></g>`;
      return `<text x="${lx}" y="66" ${F} font-size="26" text-anchor="middle" fill="#fff">${c}</text>`;
    }).join('');
    return svg(`
    <rect width="800" height="500" fill="#000"/>
    ${range(34).map(i => `<line x1="${i * 24}" y1="30" x2="${i * 24}" y2="330" stroke="#1b1b1b" stroke-width="7"/>`).join('')}
    <path d="M0 30h800" stroke="#fff" stroke-width="4"/><path d="M500 0h120l-10 30h-100z" fill="#0d1a2a"/><path d="M510 0l-20 30M600 0l20 30" stroke="#fff" stroke-width="2"/>
    ${rainLines(500, 0, 120, 30, 6, 2, '#fff')}
    ${smoke(300, 140, 420, 110, 11, '#2c2c2c', .75)}${smoke(640, 90, 220, 70, 12, '#262626', .7)}
    <path d="M226 40 Q260 28 300 38 Q320 22 360 34 Q400 24 430 40 Q470 26 520 40 Q560 30 590 44 L590 48 Q400 34 226 48Z" fill="#070707"/>
    ${sign}
    <!-- спринклеры под потолком -->
    <path d="M20 44h760" stroke="#777" stroke-width="5"/>${range(7).map(i => `<path d="M${70 + i * 110} 44v10h-8h16" stroke="#777" stroke-width="3" fill="none"/>`).join('')}
    <!-- стеллаж: две бочки пропали -->
    <g stroke="#fff" stroke-width="5"><path d="M30 330V140M260 330V140"/><path d="M30 222h230M30 330h230M30 140h230"/></g>
    ${barrelBig(58, 200)}${barrelBig(98, 200)}${barrelBig(138, 200, true)}${ghostBarrel(178, 200)}${ghostBarrel(218, 200)}
    ${barrelBig(66, 306)}${barrelBig(108, 306)}${barrelBig(150, 306)}${barrelBig(192, 306)}${barrelBig(234, 306)}
    <text x="198" y="136" ${MONO} font-size="11" text-anchor="middle" fill="${RED}">? ?</text>
    <!-- клетка Б: бочки за сеткой, ладонь на двери, замок с биркой -->
    ${barrelBig(306, 306)}${barrelBig(346, 306, true)}${barrelBig(386, 306)}
    <rect x="280" y="140" width="130" height="190" fill="none" stroke="#fff" stroke-width="5"/>
    <g stroke="#777" stroke-width="1.4">${range(14).map(i => `<line x1="280" y1="${146 + i * 13}" x2="410" y2="${170 + i * 13}"/><line x1="410" y1="${146 + i * 13}" x2="280" y2="${170 + i * 13}"/>`).join('')}</g>
    <text x="345" y="160" ${F} font-size="12" text-anchor="middle" fill="#fff">КЛЕТКА Б</text>
    ${palmPrint(322, 218, .78, 8, true)}
    <rect x="376" y="236" width="28" height="34" rx="4" fill="#111" stroke="#fff" stroke-width="3"/><path d="M382 236v-10q8 -12 16 0v10" stroke="#fff" stroke-width="3" fill="none"/>
    <g fill="#fff">${range(4).map(i => `<rect x="${380 + i * 6}" y="248" width="4" height="12" rx="1"/>`).join('')}</g>
    <path d="M398 270 q6 10 2 18" stroke="#fff" stroke-width="1.2" fill="none"/><g transform="rotate(14 402 296)"><rect x="392" y="286" width="22" height="16" fill="${PAPER}" stroke="#000" stroke-width="1"/><circle cx="396" cy="290" r="1.6" fill="#000"/><path d="M398 296h12" stroke="${RED}" stroke-width="1.5"/></g>
    <!-- вентиль спринклеров с цепью и пустым приводом -->
    <path d="M640 44v286" stroke="#fff" stroke-width="10"/>
    <rect x="652" y="236" width="40" height="34" fill="#111" stroke="#fff" stroke-width="2.5"/><circle cx="664" cy="253" r="4" fill="none" stroke="${RED}" stroke-width="2" stroke-dasharray="2 2"/><circle cx="680" cy="253" r="4" fill="none" stroke="${RED}" stroke-width="2" stroke-dasharray="2 2"/>
    <circle cx="640" cy="212" r="34" fill="none" stroke="${RED}" stroke-width="8"/>${range(6).map(i => `<path d="M640 212L${f1(640 + Math.cos(i * 1.047) * 32)} ${f1(212 + Math.sin(i * 1.047) * 32)}" stroke="${RED}" stroke-width="4"/>`).join('')}<circle cx="640" cy="212" r="9" fill="${RED}" stroke="#000" stroke-width="2"/>
    <g fill="none" stroke="#c8c8c8" stroke-width="3">${range(9).map(i => `<ellipse cx="${606 + i * 8.5}" cy="${200 + (i % 2) * 22 + Math.abs(i - 4) * 2}" rx="5" ry="3" transform="rotate(${i % 2 ? -30 : 30} ${606 + i * 8.5} ${200 + (i % 2) * 22})"/>`).join('')}</g>
    <g fill="none" stroke="#9a9a9a" stroke-width="3">${range(7).map(i => `<ellipse cx="${606 + i * 9}" cy="${322 - (i % 2) * 3}" rx="5" ry="3"/>`).join('')}</g>
    <!-- камера повёрнута на ворота -->
    <path d="M552 44v34" stroke="#fff" stroke-width="3"/><g transform="translate(560 88) rotate(28)"><rect x="-22" y="-10" width="44" height="20" fill="#fff" stroke="#000" stroke-width="1.5"/><rect x="20" y="-7" width="10" height="14" fill="#888"/><circle cx="-14" cy="-3" r="2.4" fill="${RED}"/></g>
    <path d="M590 102 L800 250 L800 190Z" fill="#fff" opacity=".05"/>
    <!-- страховое дело на столбе -->
    <path d="M736 330V96" stroke="#fff" stroke-width="6"/>
    <g transform="rotate(4 736 160)"><rect x="700" y="116" width="72" height="88" fill="#d9b25a" stroke="#000" stroke-width="2"/><rect x="726" y="110" width="20" height="10" rx="2" fill="#888" stroke="#000" stroke-width="1"/>
      <rect x="708" y="126" width="56" height="42" fill="#fff" stroke="#000" stroke-width="1"/><rect x="712" y="130" width="48" height="30" fill="#2a2a2a"/><path d="M716 156V140h16v16M736 156V136h20v20" stroke="#bbb" stroke-width="1.5" fill="none"/>
      <text x="736" y="182" ${F} font-size="8" text-anchor="middle" fill="#000">СТРАХОВКА</text><path d="M710 190h52M710 196h40" stroke="#000" stroke-width="1"/></g>
    <!-- пол: очаг и V-следы копоти -->
    <rect y="330" width="800" height="170" fill="#0d0d0d"/><line x1="0" y1="332" x2="800" y2="332" stroke="#fff" stroke-width="3"/>
    <ellipse cx="420" cy="414" rx="120" ry="52" fill="#000"/>
    <g fill="#1d1d1d" stroke="#3a3a3a" stroke-width="1.5">${[[0, -1], [.8, -.8], [1, 0], [.8, .8], [0, 1], [-.8, .8], [-1, 0], [-.8, -.8]].map(([dx, dy]) => `<path d="M${f1(420 + dx * 26)} ${f1(414 + dy * 12)}L${f1(420 + dx * 108 - dy * 22)} ${f1(414 + dy * 46 + dx * 10)}L${f1(420 + dx * 108 + dy * 22)} ${f1(414 + dy * 46 - dx * 10)}Z"/>`).join('')}</g>
    <circle cx="420" cy="414" r="8" fill="#000" stroke="${RED}" stroke-width="1.5" opacity=".9"/>
    <!-- нитка и обломок клипсы бейджа -->
    <path d="M410 346 q6 -10 12 -2 q4 8 10 0 q4 -6 8 2" stroke="#fff" stroke-width="1.6" fill="none"/>
    <g transform="rotate(-18 428 350)"><rect x="420" y="344" width="16" height="9" rx="1.5" fill="#fff" stroke="#000" stroke-width="1"/><path d="M436 344l4 -3M436 353l3 3" stroke="#fff" stroke-width="1.4"/><text x="428" y="351" ${MONO} font-size="4.5" text-anchor="middle" fill="${RED}">САН</text></g>
    <!-- сторож на носилках -->
    <path d="M36 438h178v14h-178z" fill="#fff"/><path d="M48 452v26M202 452v26" stroke="#fff" stroke-width="5"/><circle cx="48" cy="482" r="5" fill="none" stroke="#fff" stroke-width="2"/><circle cx="202" cy="482" r="5" fill="none" stroke="#fff" stroke-width="2"/>
    <path d="M72 440 Q66 396 92 378 Q116 368 140 378 Q166 396 160 440Z" fill="#9a9a9a" stroke="#000" stroke-width="2"/><path d="M72 440 Q66 396 92 378 Q116 368 140 378 Q166 396 160 440Z" fill="url(#htk)" opacity=".35"/>
    <path d="M92 380 Q116 400 140 380" stroke="#000" stroke-width="1.5" fill="none"/>
    <path d="M132 384 q14 -6 22 4 q-2 14 -14 14 q-10 -4 -8 -18z" fill="#111"/>${palmPrint(142, 392, .32, 20)}
    <path d="M100 404 Q112 392 132 392" stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M100 404 Q112 392 132 392" stroke="#000" stroke-width="5" stroke-linecap="round" fill="none"/>
    <ellipse cx="135" cy="391" rx="7" ry="6" fill="#fff" stroke="#000" stroke-width="1.5"/>
    <circle cx="116" cy="350" r="19" fill="#fff" stroke="#000" stroke-width="2"/><path d="M128 340 Q134 352 130 364" fill="url(#htk)" opacity=".5"/>
    <path d="M96 344 Q98 326 116 326 Q134 326 136 344Z" fill="#111" stroke="#000" stroke-width="1"/><path d="M94 344h46" stroke="#111" stroke-width="4"/><rect x="108" y="332" width="16" height="6" fill="#fff"/><text x="116" y="337" ${MONO} font-size="4.5" text-anchor="middle" fill="#000">ОХРАНА</text>
    <circle cx="109" cy="352" r="3.2" fill="#fff" stroke="#000" stroke-width="1.4"/><circle cx="123" cy="352" r="3.2" fill="#fff" stroke="#000" stroke-width="1.4"/><circle cx="109" cy="352" r="1.2"/><circle cx="123" cy="352" r="1.2"/>
    <path d="M104 346 l7 -2M128 346 l-7 -2" stroke="#000" stroke-width="1.4"/><ellipse cx="116" cy="362" rx="3" ry="2.4" fill="#000"/>
    ${marker(250, 470, 1)}${marker(560, 470, 2)}
    `);
  }

  /* ---------- место 2: клиника ---------- */
  function c4s2() {
    return svg(`
    <rect width="800" height="500" fill="#0a0a0a"/>
    <g stroke="#171717" stroke-width="2">${range(17).map(i => `<line x1="0" y1="${i * 20}" x2="800" y2="${i * 20}"/>`).join('')}${range(41).map(i => `<line x1="${i * 20}" y1="0" x2="${i * 20}" y2="330"/>`).join('')}</g>
    <text x="210" y="40" ${F} font-size="14" fill="#fff" letter-spacing="2">КЛИНИКА ФОНДА ТОМАСА УЭЙНА</text><path d="M200 48h300" stroke="#fff" stroke-width="2"/>
    <!-- оплавленные часы -->
    <path d="M300 64 Q360 58 368 96 Q372 136 356 160 Q346 176 350 200 Q342 210 340 196 Q336 176 316 160 Q292 140 298 100 Q296 72 300 64Z" fill="#000" stroke="#fff" stroke-width="4"/>
    <path d="M348 196 q2 14 -2 22" stroke="#fff" stroke-width="3" fill="none"/>
    <path d="M330 104 L322 82M330 104 L346 112" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="330" cy="104" r="4" fill="#fff"/>
    ${range(8).map(i => `<line x1="${f1(330 + Math.cos(i * 0.785) * 22)}" y1="${f1(104 + Math.sin(i * 0.785) * 22 * (i > 3 ? 1.4 : 1))}" x2="${f1(330 + Math.cos(i * 0.785) * 28)}" y2="${f1(104 + Math.sin(i * 0.785) * 28 * (i > 3 ? 1.4 : 1))}" stroke="#fff" stroke-width="2"/>`).join('')}
    <!-- коридор и обгоревшая дверь архива -->
    <path d="M400 330 L430 120 h120 L580 330" fill="#111" stroke="#fff" stroke-width="3"/>
    <path d="M430 120 Q440 90 470 100 Q488 70 512 96 Q536 84 550 120Z" fill="#000"/>
    <rect x="440" y="140" width="96" height="190" fill="#000" stroke="#fff" stroke-width="4"/><rect x="440" y="140" width="96" height="190" fill="url(#hatch)" opacity=".22"/>
    <rect x="464" y="152" width="48" height="16" fill="#fff"/><text x="488" y="164" ${F} font-size="11" text-anchor="middle" fill="#000">АРХИВ</text>
    <path d="M440 330 Q470 230 488 190 Q510 230 536 330" fill="#000" opacity=".85"/><path d="M456 300 q10 -40 30 -60 q16 30 34 60" stroke="${RED}" stroke-width="2" fill="none"/>
    <g fill="#fff" opacity=".85">${range(22).map(i => `<circle cx="${f1(522 + Math.cos(i * 2.4) * (4 + i * .7))}" cy="${f1(242 + Math.sin(i * 2.4) * (3 + i * .5))}" r="${i % 3 ? .9 : 1.4}"/>`).join('')}</g>
    <rect x="512" y="236" width="24" height="9" rx="3" fill="#ddd" stroke="#000" stroke-width="1.5"/><circle cx="515" cy="240.5" r="6" fill="#ddd" stroke="#000" stroke-width="1.5"/><rect x="510" y="232" width="10" height="18" fill="none" stroke="#999" stroke-width="1"/>
    <!-- окно с белым налётом -->
    <rect x="606" y="42" width="148" height="86" fill="#fff"/><rect x="612" y="48" width="136" height="74" fill="#1b2328"/>
    ${rainLines(612, 48, 136, 74, 10, 5, '#556')}
    <rect x="612" y="48" width="136" height="74" fill="#e4eaec" opacity=".5"/>
    <g stroke="#e4eaec" stroke-width="2" opacity=".7">${range(9).map(i => `<path d="M${622 + i * 15} 50 v${10 + (i * 7) % 22}"/>`).join('')}</g>
    <path d="M626 100 q22 -30 52 -34" stroke="#1b2328" stroke-width="10" stroke-linecap="round" fill="none"/><path d="M700 110 q14 -14 34 -16" stroke="#1b2328" stroke-width="7" stroke-linecap="round" fill="none"/>
    <path d="M680 42v86M606 85h148" stroke="#fff" stroke-width="5"/>
    <!-- доска с картами пациентов -->
    <rect x="600" y="158" width="92" height="76" fill="#4a3a26" stroke="#fff" stroke-width="3"/>
    <g fill="${PAPER}" stroke="#000" stroke-width="1"><rect x="608" y="166" width="34" height="26"/><rect x="648" y="166" width="36" height="26"/><rect x="608" y="198" width="34" height="28"/></g>
    <g fill="#000">${[[612, 172], [652, 172], [612, 204]].map(([x, y]) => `<path d="M${x} ${y}h24M${x} ${y + 6}h20M${x} ${y + 12}h22" stroke="#555" stroke-width="1.2"/>`).join('')}</g>
    <g transform="rotate(6 666 212)"><rect x="648" y="198" width="38" height="30" fill="#fff" stroke="${RED}" stroke-width="2"/><g fill="#1a0a06">${range(7).map(i => `<rect x="${651 + i * 5}" y="${205 + (i % 2) * 7}" width="3.5" height="5"/>`).join('')}</g><path d="M650 223q18 -4 34 0" stroke="#3a1208" stroke-width="2" fill="none"/><rect x="676" y="201" width="7" height="7" fill="none" stroke="#000" stroke-width="1"/><text x="679.5" y="207" ${MONO} font-size="6" text-anchor="middle">P</text></g>
    <g fill="${RED}">${[[612, 162], [652, 162], [612, 194], [664, 196]].map(([x, y]) => `<circle cx="${x + 12}" cy="${y + 4}" r="2.4"/>`).join('')}</g>
    <!-- стойка регистратуры, журнал, монитор -->
    <path d="M20 300h250v100h-250z" fill="#000" stroke="#fff" stroke-width="4"/><path d="M20 300h250v100h-250z" fill="url(#hatch)" opacity=".2"/><path d="M14 292h262v10h-262z" fill="#fff"/>
    <g transform="rotate(-4 128 280)"><path d="M80 290 L84 266 H126 L128 290Z" fill="${PAPER}" stroke="#000" stroke-width="2"/><path d="M128 290 L130 266 H172 L176 290Z" fill="${PAPER}" stroke="#000" stroke-width="2"/>
      <path d="M88 272h34M87 278h34M86 284h34" stroke="#c8c0aa" stroke-width="1.2"/><path d="M132 270l2 4l-1 3l3 4l-2 3l2 4" stroke="#999" stroke-width="1" fill="none"/>
      <path d="M134 272h34M135 278h34M136 284h30" stroke="#ddd" stroke-width="1"/><path d="M150 262 l22 10" stroke="#111" stroke-width="3" stroke-linecap="round"/></g>
    <rect x="200" y="254" width="52" height="34" fill="#000" stroke="#fff" stroke-width="2"/><rect x="205" y="258" width="42" height="24" fill="#22313d"/><path d="M220 288v4h12v-4" stroke="#fff" stroke-width="2" fill="none"/>
    <!-- пол -->
    <rect y="330" width="800" height="170" fill="#0c0c0c"/><line x1="0" y1="332" x2="800" y2="332" stroke="#fff" stroke-width="3"/>
    <g stroke="#1e1e1e" stroke-width="2">${range(9).map(i => `<line x1="${i * 100}" y1="332" x2="${i * 100 - 60}" y2="500"/>`).join('')}</g>
    <g stroke="#fff" stroke-width="3" fill="none"><path d="M620 380h140M630 380v40M750 380v40"/></g><rect x="616" y="362" width="148" height="18" fill="#fff"/><path d="M616 362q20 -14 52 -8" stroke="#fff" stroke-width="6" fill="none"/>
    <g stroke="#fff" stroke-width="4" fill="none"><circle cx="640" cy="430" r="8"/><circle cx="740" cy="430" r="8"/></g>
    <!-- следы бахил -->
    ${coverPrint(370, 450, 1, -70)}${coverPrint(410, 430, .9, -62)}
    <g transform="rotate(10 448 456)"><path d="M428 454 q4 -14 20 -14 q16 0 20 14 q-4 10 -20 10 q-16 0 -20 -10z" fill="#4f7fc0" stroke="#24497a" stroke-width="1.5"/><path d="M432 452 q16 -8 32 0" stroke="#cfe2fa" stroke-width="2.4" fill="none" stroke-dasharray="2.5 1.5"/><path d="M440 446 q4 6 2 12M452 445 q-2 6 0 13" stroke="#24497a" stroke-width="1" fill="none"/></g>
    ${marker(300, 470, 3)}
    `);
  }

  /* ---------- место 3: депо монорельса ---------- */
  function c4s3() {
    return svg(`
    <rect width="800" height="500" fill="#000"/>
    <rect width="560" height="340" fill="url(#ht)" opacity=".07"/>
    <path d="M0 110h560" stroke="#fff" stroke-width="10"/><path d="M0 104h560" stroke="#333" stroke-width="2"/>
    ${smoke(260, 120, 420, 120, 31, '#2a2a2a', .8)}
    <!-- сгоревший первый состав -->
    <path d="M30 130 Q30 116 50 116 H470 Q500 116 520 150 L540 220 Q546 250 520 250 H30Z" fill="#0b0b0b" stroke="#fff" stroke-width="5"/>
    <path d="M30 190 H540" stroke="${RED}" stroke-width="6"/>
    <g>${range(6).map(i => `<rect x="${52 + i * 62}" y="138" width="46" height="40" fill="#111" stroke="#fff" stroke-width="2"/>`).join('')}</g>
    <g fill="#000">${range(6).map(i => `<path d="M${52 + i * 62} 138q12 14 23 4q12 10 23 -4v-0z"/>`).join('')}</g>
    ${range(5).map(i => fire(75 + i * 62, 178, 34, 26 + (i % 2) * 10, 50 + i, { n: 3, op: .85 })).join('')}
    <text x="80" y="232" ${F} font-size="20" fill="#fff" letter-spacing="4">WAYNE</text>
    <circle cx="372" cy="222" r="17" fill="none" stroke="#fff" stroke-width="3"/><text x="372" y="232" ${F} font-size="26" text-anchor="middle" fill="#fff">9</text>
    <path d="M30 250 h510 v26 h-510z" fill="#111" stroke="#fff" stroke-width="3"/>
    <!-- кабина машиниста: дверь открыта, видно сиденье -->
    <rect x="452" y="146" width="56" height="102" fill="#050505" stroke="#fff" stroke-width="3"/>
    <path d="M508 146 L530 152 V244 L508 248Z" fill="#1a1a1a" stroke="#fff" stroke-width="2"/>
    <ellipse cx="480" cy="212" rx="34" ry="30" fill="#c9ffd9" opacity=".18" filter="url(#glowP)"/>
    <path d="M466 176 h26 q4 0 4 4 v32 h-34 v-32 q0 -4 4 -4z" fill="#3a3a3a" stroke="#fff" stroke-width="2"/>
    <path d="M460 212 h40 q4 0 4 4 v8 h-48 v-8 q0 -4 4 -4z" fill="#4a4a4a" stroke="#fff" stroke-width="2"/><path d="M466 224v20M494 224v20" stroke="#fff" stroke-width="3"/>
    <path d="M472 186 q8 6 16 0M472 196 q8 6 16 0" stroke="#c9ffd9" stroke-width="1.4" fill="none" opacity=".8"/>
    <!-- диспетчерская -->
    <path d="M560 40 H790 V340 H560Z" fill="#0b0b0b" stroke="#fff" stroke-width="4"/>
    <rect x="576" y="60" width="200" height="104" fill="#1b2328"/>${rainLines(576, 60, 200, 104, 18, 12, '#889')}<path d="M676 60v104" stroke="#fff" stroke-width="4"/><rect x="576" y="60" width="200" height="104" fill="none" stroke="#fff" stroke-width="4"/>
    <path d="M568 164h220v8h-220z" fill="#fff"/>
    <g transform="translate(628 154)">
      <rect x="-26" y="-10" width="20" height="18" rx="4" fill="#111" stroke="#fff" stroke-width="2"/><rect x="6" y="-10" width="20" height="18" rx="4" fill="#111" stroke="#fff" stroke-width="2"/>
      <rect x="-24" y="-16" width="16" height="8" rx="2" fill="#333" stroke="#fff" stroke-width="1.5"/><rect x="8" y="-16" width="16" height="8" rx="2" fill="#333" stroke="#fff" stroke-width="1.5"/>
      <rect x="-6" y="-8" width="12" height="8" fill="#555" stroke="#fff" stroke-width="1.5"/><circle cx="0" cy="-4" r="2" fill="#fff"/>
      <path d="M-26 6 q-10 10 4 10 h44 q14 0 4 -10" stroke="#888" stroke-width="1.5" fill="none"/></g>
    <!-- стол диспетчера и зеркальный блокнот -->
    <path d="M566 236h80v8h-80z" fill="#fff"/><path d="M574 244v54M638 244v54" stroke="#fff" stroke-width="4"/>
    <g transform="rotate(-6 608 228)"><rect x="584" y="218" width="48" height="18" fill="#fff" stroke="#000" stroke-width="1.5"/><path d="M608 218v18" stroke="#000" stroke-width="1"/><g fill="#000">${range(6).map(i => `<circle cx="608" cy="${220 + i * 3}" r=".9"/>`).join('')}</g>
      <path d="M602 222 h-14M602 226 h-12M602 230 h-15M630 222 h-16M628 226 h-14" stroke="#333" stroke-width="1.2"/><path d="M587 233h10" stroke="${RED}" stroke-width="1.2"/></g>
    <path d="M626 230 l14 -6" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="644" y="264" width="98" height="92" fill="#000" stroke="#fff" stroke-width="4"/><circle cx="694" cy="310" r="24" fill="#000" stroke="#fff" stroke-width="3"/>${range(12).map(i => `<line x1="${f1(694 + Math.cos(i * .524) * 18)}" y1="${f1(310 + Math.sin(i * .524) * 18)}" x2="${f1(694 + Math.cos(i * .524) * 23)}" y2="${f1(310 + Math.sin(i * .524) * 23)}" stroke="#fff" stroke-width="1.5"/>`).join('')}<path d="M694 310v-16" stroke="${RED}" stroke-width="3"/><rect x="726" y="296" width="8" height="26" fill="#fff"/>
    <!-- платформа -->
    <rect y="340" width="800" height="160" fill="#0c0c0c"/><line x1="0" y1="342" x2="800" y2="342" stroke="#fff" stroke-width="3"/>
    <path d="M40 420h200v12h-200z" fill="#fff"/><path d="M52 432v30M228 432v30" stroke="#fff" stroke-width="5"/>
    <g transform="rotate(-5 136 410)"><rect x="94" y="396" width="86" height="24" fill="#d9b25a" stroke="#000" stroke-width="2"/>
      <g transform="rotate(-10 112 396)"><rect x="98" y="384" width="30" height="20" fill="#f4f0e0" stroke="#000" stroke-width="1"/><path d="M101 389h24" stroke="#000" stroke-width="2.5"/><path d="M101 395h14M101 399h18" stroke="#777" stroke-width="1"/><rect x="117" y="393" width="8" height="8" fill="#555"/></g>
      <g transform="rotate(8 150 394)"><rect x="136" y="382" width="32" height="20" fill="#f4f0e0" stroke="#000" stroke-width="1"/><path d="M139 387h26" stroke="#000" stroke-width="2.5"/><path d="M139 392h22M139 396h16" stroke="#777" stroke-width="1"/>${batShadow(152, 391, .03, '#000')}</g>
      <text x="137" y="415" ${MONO} font-size="7" text-anchor="middle" fill="#000">ВЫРЕЗКИ · МАЙ</text></g>
    <!-- урна с обрывками -->
    <ellipse cx="336" cy="468" rx="30" ry="6" fill="#000"/>
    <path d="M310 416 L316 468 H356 L362 416Z" fill="#111" stroke="#fff" stroke-width="3"/>
    <g stroke="#555" stroke-width="1.2">${range(6).map(i => `<line x1="${316 + i * 8}" y1="420" x2="${319 + i * 7}" y2="466"/>`).join('')}<path d="M313 432h46M314 446h44M315 458h42"/></g>
    <g fill="#fff" stroke="#000" stroke-width="1">${[[320, 396, -14], [332, 392, 6], [344, 398, 18], [326, 402, -4]].map(([x, y, r]) => `<g transform="rotate(${r} ${x} ${y + 12})"><rect x="${x - 4}" y="${y}" width="9" height="24"/><path d="M${x - 2} ${y + 5}h5M${x - 2} ${y + 9}h4M${x - 2} ${y + 13}h5" stroke="#666" stroke-width=".8"/></g>`).join('')}</g>
    <ellipse cx="336" cy="416" rx="27" ry="5" fill="none" stroke="#fff" stroke-width="3"/>
    <g transform="rotate(64 378 470)"><rect x="372" y="458" width="9" height="22" fill="#fff" stroke="#000" stroke-width="1"/><path d="M374 463h5M374 467h4" stroke="#666" stroke-width=".8"/></g>
    ${marker(420, 470, 4)}
    `);
  }

  /* ---------- место 4: Аллея преступлений (поджигателя ещё нет) ---------- */
  function c4s4() {
    const can = (cx, by, s, seed) => `<g transform="translate(${cx} ${by}) scale(${s})">
      <ellipse cx="0" cy="0" rx="32" ry="7" fill="#000"/>
      <path d="M-26 -70 L-22 0 H22 L26 -70Z" fill="#2a2a2a" stroke="#fff" stroke-width="3"/>
      <g stroke="#555" stroke-width="2">${[-50, -30, -12].map(yy => `<path d="M${-25} ${yy}h50"/>`).join('')}</g>
      <path d="M-30 -70 h60" stroke="#fff" stroke-width="5"/><path d="M-8 -74 h16" stroke="#fff" stroke-width="3"/>
      ${fire(0, -68, 56, 110, seed, { n: 5 })}</g>`;
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
    <circle cx="640" cy="330" r="200" fill="url(#fireGlow)"/>
    <path d="M300 0v500M500 0v500" stroke="#fff" stroke-width="3"/>
    <!-- пожарная лестница -->
    <g stroke="#fff" stroke-width="3" fill="none"><path d="M120 40v240M200 40v240"/>${range(10).map(i => `<path d="M120 ${50 + i * 24}h80"/>`).join('')}<path d="M100 150h120M100 270h120"/></g>
    <!-- памятная табличка -->
    <rect x="560" y="220" width="84" height="56" fill="#b8962e" stroke="#fff" stroke-width="3"/><rect x="566" y="226" width="72" height="44" fill="none" stroke="#6b5414" stroke-width="1.5"/>
    <text x="602" y="242" ${F} font-size="7" text-anchor="middle" fill="#2a1f05">ТОМАС И МАРТА</text><text x="602" y="253" ${F} font-size="7" text-anchor="middle" fill="#2a1f05">УЭЙН</text><path d="M578 262h48" stroke="#2a1f05" stroke-width="1.5"/>
    <!-- заряд на стене: банка с фосфором, таймер, провода -->
    <path d="M190 240 h76 M190 262 h76" stroke="#c9b48a" stroke-width="6" opacity=".8"/>
    <rect x="198" y="228" width="30" height="46" rx="5" fill="#d9e6e0" stroke="#000" stroke-width="2"/><rect x="198" y="228" width="30" height="46" rx="5" fill="#c9ffd9" opacity=".35"/>
    <rect x="203" y="244" width="20" height="14" fill="#fff" stroke="#000" stroke-width="1"/><text x="213" y="255" ${F} font-size="11" text-anchor="middle" fill="${RED}">P</text>
    <circle cx="246" cy="250" r="15" fill="#fff" stroke="#000" stroke-width="2.5"/>${range(12).map(i => `<line x1="${f1(246 + Math.cos(i * .524) * 11)}" y1="${f1(250 + Math.sin(i * .524) * 11)}" x2="${f1(246 + Math.cos(i * .524) * 13.5)}" y2="${f1(250 + Math.sin(i * .524) * 13.5)}" stroke="#000" stroke-width="1.2"/>`).join('')}
    <path d="M246 250 L254 242" stroke="${RED}" stroke-width="2.5" stroke-linecap="round"/><circle cx="246" cy="250" r="2" fill="#000"/><rect x="242" y="232" width="8" height="4" fill="#000"/>
    <path d="M228 262 q8 12 18 4 M231 236 q8 -8 14 0" stroke="${RED}" stroke-width="2" fill="none"/><path d="M228 268 q10 8 20 0" stroke="#fff" stroke-width="1.5" fill="none"/>
    <!-- асфальт -->
    <path d="M300 320 L0 500 H800 L500 320Z" fill="#111"/><path d="M300 320 L0 500M500 320 L800 500" stroke="#fff" stroke-width="2"/>
    <ellipse cx="560" cy="400" rx="60" ry="10" fill="#fff4c8" opacity=".12"/><ellipse cx="430" cy="470" rx="90" ry="12" fill="#fff" opacity=".05"/>
    <!-- горящие баки у таблички -->
    ${can(586, 388, .9, 21)}${can(660, 432, 1.05, 25)}
    ${smoke(620, 280, 200, 260, 41, '#fff', .07)}${embers(620, 330, 200, 200, 9, 16)}
    <!-- пепел босых ступней -->
    ${ashFoot(388, 382, 1.15, 62)}${ashFoot(410, 366, 1.05, 70)}${ashFoot(432, 374, 1, 62)}${ashFoot(452, 360, .92, 70)}
    <g fill="#666">${range(14).map(i => `<circle cx="${380 + (i * 37) % 80}" cy="${352 + (i * 23) % 36}" r="${.8 + (i % 3) * .5}"/>`).join('')}</g>
    <!-- арсенал бэтмобиля -->
    <path d="M58 404h104v60h-104z" fill="#000" stroke="#fff" stroke-width="3"/><path d="M58 404 L70 360 H170 L162 404Z" fill="#111" stroke="#fff" stroke-width="3"/>${batShadow(92, 368, .14, '#fff')}
    ${range(3).map(i => `<g transform="translate(${80 + i * 30} 432)"><rect x="-9" y="-16" width="18" height="30" rx="6" fill="#bff3ff" stroke="#000" stroke-width="2"/><rect x="-5" y="-22" width="10" height="7" fill="#555" stroke="#000" stroke-width="1"/><path d="M0 -8v14M-6 -4l12 6M6 -4l-12 6" stroke="#2a6a80" stroke-width="1.6"/></g>`).join('')}
    <!-- план засады -->
    <g transform="rotate(-4 340 450)"><rect x="300" y="424" width="80" height="54" fill="${PAPER}" stroke="#000" stroke-width="2"/><path d="M310 432 L310 470 M370 432 L370 470" stroke="#000" stroke-width="1.5"/><path d="M314 452 h52" stroke="#000" stroke-width=".8" stroke-dasharray="3 2"/><path d="M324 444l6 6M330 444l-6 6M344 456l6 6M350 456l-6 6" stroke="${RED}" stroke-width="2"/><rect x="360" y="436" width="8" height="6" fill="#b8962e"/></g>
    <!-- криодетонаторы -->
    ${[0, 1].map(i => `<g transform="translate(${500 + i * 34} ${428 + i * 6}) rotate(${i ? 8 : -6})"><rect x="-13" y="-8" width="26" height="36" rx="4" fill="#111" stroke="#fff" stroke-width="2.5"/><path d="M8 -8 V-24" stroke="#fff" stroke-width="2"/><circle cx="8" cy="-26" r="2.5" fill="${RED}"/><rect x="-9" y="-3" width="18" height="11" fill="#0b2a33"/><path d="M-8 3 q2 -5 4 0 t4 0 t4 0 t4 0" stroke="#9fd" stroke-width="1.2" fill="none"/><circle cx="-5" cy="18" r="3" fill="#fff"/><circle cx="5" cy="18" r="3" fill="#fff"/></g>`).join('')}
    <!-- ампула на асфальте -->
    <g transform="rotate(-24 590 452)"><rect x="574" y="446" width="26" height="9" rx="4.5" fill="#e9f6ff" stroke="#000" stroke-width="1.5"/><path d="M600 450.5 h6 q3 0 4 -2 v5 q-1 -2 -4 -2" fill="#e9f6ff" stroke="#000" stroke-width="1.2"/><rect x="580" y="446" width="10" height="9" fill="${RED}" opacity=".8"/><path d="M576 448h20" stroke="#fff" stroke-width="1.2"/></g>
    <g fill="#e9f6ff" stroke="#000" stroke-width=".8"><path d="M610 444l5 -3l1 5z"/><path d="M604 458l4 1l-3 3z"/></g>
    `);
  }

  /* ---------- сюжетные панели ---------- */
  function splash4() {
    // коридор изолятора в перспективе: три двери слева, три справа, все приоткрыты
    const topL = x => 140 * x / 330, botL = x => 420 - 170 * x / 330;
    const door = (xa, xb, n, right, first) => {
      const fx = v => right ? 800 - v : v;
      const ya = botL(xa), yb = botL(xb), ta = ya - .7 * (ya - topL(xa)), tb = yb - .7 * (yb - topL(xb));
      const gap = xa + (xb - xa) * .78;
      const yg = botL(gap), tg = yg - .7 * (yg - topL(gap));
      const q = pts => pts.map(([x, y]) => `${f1(fx(x))},${f1(y)}`).join(' ');
      const plateX = xa + (xb - xa) * .5, plateY = ta + (tb - ta) * .5 + 14;
      return `<polygon points="${q([[xa, ya], [xa, ta], [xb, tb], [xb, yb]])}" fill="#1c1c1c" stroke="#fff" stroke-width="3"/>
        <polygon points="${q([[gap, yg], [gap, tg], [xb, tb], [xb, yb]])}" fill="${first ? '#e8fff0' : '#fff4c8'}" opacity="${first ? .9 : .55}"/>
        <polygon points="${q([[gap, yg + 2], [xb, yb], [xb + (xb - xa) * .9, yb + 40], [gap + 30, yg + 44]])}" fill="${first ? '#e8fff0' : '#fff4c8'}" opacity=".08"/>
        <rect x="${f1(fx(plateX) - 9)}" y="${f1(plateY - 26)}" width="18" height="9" fill="${RED}"/>
        <text x="${f1(fx(plateX))}" y="${f1(plateY + 4)}" ${F} font-size="${f1(18 - xa / 30)}" text-anchor="middle" fill="${RED}">${n}</text>`;
    };
    return svg(`
    <rect width="800" height="420" fill="#060606"/>
    <polygon points="0,0 330,140 470,140 800,0" fill="#0e0e0e"/>
    <polygon points="0,420 330,250 470,250 800,420" fill="#121212"/>
    <g stroke="#262626" stroke-width="2">${range(9).map(i => `<line x1="${330 + i * 17.5}" y1="250" x2="${-200 + i * 150}" y2="420"/>`).join('')}${[262, 280, 306, 344, 400].map(yy => `<line x1="0" y1="${yy}" x2="800" y2="${yy}"/>`).join('')}</g>
    <polygon points="0,420 330,250 470,250 800,420" fill="url(#ht)" opacity=".05"/>
    <rect x="330" y="140" width="140" height="110" fill="#0a0a0a" stroke="#fff" stroke-width="2"/>
    <rect x="338" y="160" width="124" height="22" fill="#fff"/><text x="400" y="176" ${F} font-size="10" text-anchor="middle" fill="#000">ИЗОЛЯТОР · СЕКТОР Б</text>
    <path d="M0 0L330 140M800 0L470 140M0 420L330 250M800 420L470 250" stroke="#fff" stroke-width="3"/>
    ${[[60, 330], [190, 290], [260, 268]].map(([y, w], i) => `<path d="M${400 - w * .18} ${30 + i * 40}h${w * .36}" stroke="#fff" stroke-width="${8 - i * 2}"/><path d="M${400 - w * .18} ${34 + i * 40}L${400 - w * .4} ${100 + i * 50}H${400 + w * .4}L${400 + w * .18} ${34 + i * 40}Z" fill="#fff" opacity=".04"/>`).join('')}
    ${door(24, 108, 1, false, true)}${door(160, 214, 3)}${door(250, 284, 5)}
    ${door(24, 108, 2, true)}${door(160, 214, 4, true)}${door(250, 284, 6, true)}
    ${palmPrint(54, 230, .7, -6, true)}
    ${ashFoot(150, 368, 1.2, 104)}${ashFoot(196, 392, 1.35, 98)}${ashFoot(254, 404, 1.5, 96)}${ashFoot(316, 414, 1.6, 92)}
    <g transform="translate(560 392) rotate(-20)"><circle r="9" fill="none" stroke="#bbb" stroke-width="2.5"/><path d="M8 2 l18 4 l0 4 l-4 0 l0 3 l-4 0" stroke="#bbb" stroke-width="2.5" fill="none"/><path d="M-6 8 l-8 16 l3 2 l2 -3 l3 2" stroke="#bbb" stroke-width="2.5" fill="none"/></g>
    `, '0 0 800 420');
  }

  function phoscap() {
    return svg(`
    <rect width="800" height="420" fill="#050a0d"/>
    <g stroke="#0f1a1f" stroke-width="2">${range(22).map(i => `<line x1="0" y1="${i * 20}" x2="800" y2="${i * 20}"/>`).join('')}</g>
    <circle cx="410" cy="250" r="330" fill="url(#frostGlow)"/>
    ${range(16).map(i => { const a = i * .3927 + .1, r1 = 60 + (i % 3) * 20; return `<path d="M${f1(410 + Math.cos(a) * r1)} ${f1(250 + Math.sin(a) * r1)}L${f1(410 + Math.cos(a - .03) * 520)} ${f1(250 + Math.sin(a - .03) * 520)}L${f1(410 + Math.cos(a + .03) * 520)} ${f1(250 + Math.sin(a + .03) * 520)}Z" fill="#e6fbff" opacity="${i % 2 ? .35 : .6}"/>`; }).join('')}
    ${phosFig(410, 420, .62, { pose: 'kneel', frozen: true })}
    ${frostStars(410, 420, 760, 420, 17, 30)}
    <g fill="#fff">${range(30).map(i => `<path d="M${(i * 97) % 800} ${(i * 53) % 420}l4 8l-4 8l-4 -8z" opacity=".8"/>`).join('')}</g>
    ${batShadow(-30, 0, 1.15, '#000')}
    `, '0 0 800 420');
  }

  function interro() {
    return svg(`
    <rect width="800" height="420" fill="#0b0b0b"/>
    <path d="M0 360h800" stroke="#fff" stroke-width="3"/>
    <rect x="290" y="30" width="220" height="330" rx="110" fill="#06141a" stroke="#fff" stroke-width="6"/>
    ${phosFig(400, 352, .66, { pose: 'idle', weak: true })}
    <rect x="290" y="30" width="220" height="330" rx="110" fill="#bff3ff" opacity=".22"/>
    <path d="M320 80 Q340 50 380 42" stroke="#fff" stroke-width="5" fill="none" opacity=".5"/>
    <g fill="#e6fbff" opacity=".7">${range(8).map(i => `<path d="M${312 + i * 24} 352 l6 -${18 + (i % 3) * 10} l6 ${18 + (i % 3) * 10}z"/>`).join('')}</g>
    <g stroke="#fff" stroke-width="2" opacity=".7">${range(8).map(i => `<path d="M${318 + i * 22} 54 l6 10 l-6 10" fill="none"/>`).join('')}</g>
    <rect x="370" y="364" width="60" height="14" fill="#111" stroke="#fff" stroke-width="2"/><text x="400" y="375" ${MONO} font-size="9" text-anchor="middle" fill="#9fd">−52 °C</text>
    <path d="M40 420 Q60 200 160 170 Q210 160 220 120 L238 60 L248 110 L262 110 L272 60 L290 120 Q300 170 260 200 Q300 260 300 420Z" fill="#000" stroke="#fff" stroke-width="2"/>
    ${robinBack(690, 250, .95)}
    `, '0 0 800 420');
  }

  function watcher() {
    const photo = (x, y, t, bat) => `<g transform="rotate(${(x % 7) - 3} ${x + 40} ${y + 30})"><rect x="${x}" y="${y}" width="80" height="60" fill="${PAPER}" stroke="#000" stroke-width="2"/>${bat ? batShadow(x + 10, y + 14, 0.15, '#000') : `<circle cx="${x + 40}" cy="${y + 24}" r="12" fill="#333"/><path d="M${x + 22} ${y + 56}q18 -24 36 0" fill="#333"/>`}<rect x="${x + 6}" y="${y + 64}" width="68" height="13" fill="#fff"/><text x="${x + 40}" y="${y + 74}" ${F} font-size="9" text-anchor="middle" fill="#000">${t}</text></g>`;
    return svg(`
    <rect width="800" height="420" fill="#070707"/>
    <rect x="380" y="20" width="400" height="260" fill="#161616" stroke="#fff" stroke-width="3"/>
    ${photo(410, 44, 'Б. УЭЙН')}${photo(640, 40, 'ОБЪЕКТ', true)}${photo(400, 168, 'СКЛАД')}${photo(512, 178, 'КЛИНИКА')}${photo(626, 168, 'ДЕПО')}
    <g stroke="${RED}" stroke-width="2.5" fill="none"><path d="M490 74 Q565 54 640 70"/><path d="M450 108 L440 168M470 108 L552 178M480 100 L666 168"/><path d="M680 104 L552 178M680 104 L666 168M680 104 L440 168"/></g>
    <circle cx="500" cy="190" r="260" fill="url(#lampGlow)" opacity=".4"/>
    <!-- мониторы -->
    <rect x="60" y="70" width="150" height="110" rx="8" fill="#111" stroke="#fff" stroke-width="3"/><rect x="72" y="80" width="126" height="86" fill="#1d2a24"/>
    <path d="M80 158h110M90 130h30v28M140 120h40v38" stroke="#5a7a6a" stroke-width="2" fill="none"/>${batShadow(110, 92, .2, '#000')}
    <text x="192" y="94" ${MONO} font-size="8" text-anchor="end" fill="${RED}">● REC</text><text x="78" y="162" ${MONO} font-size="7" fill="#9fd">СКЛАД · 03:41</text>
    <rect x="224" y="84" width="110" height="84" rx="6" fill="#111" stroke="#fff" stroke-width="3"/><rect x="234" y="92" width="90" height="66" fill="#222"/>
    ${range(14).map(i => `<line x1="236" y1="${95 + i * 4.5}" x2="322" y2="${95 + i * 4.5}" stroke="#444" stroke-width="1.5"/>`).join('')}
    <!-- стол, лампа, папки -->
    <path d="M0 330h800" stroke="#fff" stroke-width="3"/><path d="M30 316h520v14h-520z" fill="#fff"/>
    <path d="M470 316 l10 -60 l-24 -30" stroke="#fff" stroke-width="4" fill="none"/><path d="M430 214 l40 -6 l10 26 l-58 8z" fill="#fff"/><path d="M432 240 L360 316 H560 L478 236Z" fill="#fff4c8" opacity=".12"/>
    ${range(5).map(i => `<g transform="rotate(${i * 3 - 6} ${430 + i * 30} 300)"><rect x="${410 + i * 28}" y="${282 + (i % 2) * 4}" width="34" height="34" fill="#d9b25a" stroke="#000" stroke-width="2"/><text x="${427 + i * 28}" y="${304 + (i % 2) * 4}" ${F} font-size="9" text-anchor="middle" fill="#000">№${i + 2}</text></g>`).join('')}
    <g transform="rotate(-8 330 300)"><rect x="300" y="282" width="70" height="34" fill="#fff" stroke="#000" stroke-width="2"/><path d="M306 290h56M306 298h56M306 306h36" stroke="#000" stroke-width="1.5"/><path d="M306 312h30" stroke="${RED}" stroke-width="2"/></g>
    <!-- высокое кресло спинкой к нам -->
    <path d="M70 420 L80 200 Q90 150 170 146 Q250 150 260 200 L270 420Z" fill="#000" stroke="#fff" stroke-width="3"/>
    <path d="M96 210 Q170 190 244 210" stroke="#333" stroke-width="3" fill="none"/>${range(4).map(i => range(3).map(j => `<circle cx="${120 + j * 50}" cy="${230 + i * 40}" r="3" fill="#333"/>`).join('')).join('')}
    <path d="M262 300 h60 q10 0 10 10 v10 h-70z" fill="#000" stroke="#fff" stroke-width="2.5"/>
    <path d="M300 296 q12 -10 26 -4 l8 6 q-6 6 -18 4z" fill="#d8d0c0" stroke="#000" stroke-width="1.5"/><path d="M322 296 l36 -14" stroke="#111" stroke-width="3" stroke-linecap="round"/>
    <path d="M262 300 Q250 260 266 240" stroke="#111" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M262 300 Q250 260 266 240" stroke="#fff" stroke-width="2" fill="none" opacity=".4"/>
    `, '0 0 800 420');
  }

  Object.assign(window.Art, { phosFig, phosPortrait, strangeFig, robinBack, skull, palmPrint, fire, warehouseShot, c4s1, c4s2, c4s3, c4s4, splash4, phoscap, interro, watcher, mug: campMug });
})();
