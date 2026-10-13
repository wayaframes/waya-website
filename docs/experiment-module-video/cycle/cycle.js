// The Waya experiment cycle: a ~49 s module for #cycleStage (780x880, placed by the integrator).
// window.buildCycle(ctx) schedules every animation from ctx.T0 and returns { end, beats }.
// ctx = { $, tw, track, show, fadeIn, rise, inout, JS, POP, EASE, T0 } — the helpers of video.html.
// Rule kept throughout: one animation per CSS property per element; anything that changes a
// property more than once goes through track().
window.buildCycle = function buildCycle(ctx) {
  const { tw, track, fadeIn, rise, JS, POP, EASE, T0 } = ctx;
  const S = document.getElementById('cycleStage');
  const q = (sel) => S.querySelector(sel);
  const T = (t) => T0 + t;
  const tr = (x, y, s = 1) => `translate(${x}px, ${y}px) scale(${s})`;
  // a transform track from [[t, x, y, s, easing?], ...] (hold points repeat the previous values)
  const move = (el, pts) => track(el, pts.map(([t, x, y, s = 1, easing = EASE]) => [T(t), { transform: tr(x, y, s), easing }]));
  const op = (el, pts) => track(el, pts.map(([t, o]) => [T(t), { opacity: o }]));
  const svgNS = 'http://www.w3.org/2000/svg';
  const el = (cls, html, parent) => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; (parent || S).appendChild(d); return d; };

  // ================= the schedule (seconds from T0) =================
  // ctx.hold = { afterDefine, beforeNextDefine } (seconds, default 0): frozen pauses inserted after
  // the Define chapter settles (before the Build chip) and after Analyze settles (before the
  // "Define · round 2" chip). Every beat from Build on shifts by afterDefine; nextDefine, nextRound
  // and end shift by afterDefine + beforeNextDefine.
  const hold = ctx.hold || {};
  const HA = Math.max(0, +hold.afterDefine || 0), HB = Math.max(0, +hold.beforeNextDefine || 0);
  const B = {
    open: 0.0, lift: 1.8, matrix: 4.4, sort: 7.8, define: 12.6, build: 16.6 + HA, integrate: 19.2 + HA,
    campaigns: 22.4 + HA, track: 30.0 + HA, analyze: 36.4 + HA, nextDefine: 42.2 + HA + HB, nextRound: 46.4 + HA + HB, end: 49.6 + HA + HB,
  };

  // ================= the hypotheses =================
  // line: the y of the line in the register crop; w: the card's width; exp: which experiment takes it
  const HYP = [
    { id: 'H1', t: 'Pod leaders pay $200', w: 226, line: 52, exp: 'mkt' },
    { id: 'H2', t: 'Co-op outreach', w: 184, line: 73, exp: 'mkt' },
    { id: 'H3', t: 'Support under 23 min', w: 226, line: 95, exp: 'inf' },
    { id: 'H4', t: 'Parents run the game', w: 226, line: 117, exp: 'inf' },
    { id: 'H6', t: 'Follow-on campaign', w: 212, line: 167 },
    { id: 'H8', t: '$300–400 holds', w: 184, line: 210 },
    { id: 'H10', t: 'Coaching tapers', w: 200, line: 253 },
    { id: 'H15', t: 'Semester windows', w: 208, line: 360, exp: 'mkt' },
    { id: 'H17', t: 'API cost near 97%', w: 216, line: 382, exp: 'inf' },
  ];
  const MATRIX = { H1: [430, 150], H17: [480, 205], H2: [380, 262], H4: [470, 318], H15: [150, 180], H3: [250, 400], H8: [130, 470], H10: [420, 520], H6: [240, 580] };
  const ROUND1 = { H1: [54, 148], H17: [404, 148], H3: [54, 196], H2: [404, 196], H15: [54, 244], H4: [404, 244] };
  const EXP = { H17: [54, 156], H4: [54, 204], H3: [54, 252], H1: [424, 156], H2: [424, 204], H15: [424, 252] };
  const LEDGER_OFF = [30, 748];                       // the ledger container's place in the box
  const LEDGER_ROW = { H6: [24, 46], H8: [250, 46], H10: [448, 46] };
  const LEDGER_COL = [[24, 50], [24, 100], [24, 150]];   // the column once the ledger comes forward

  // round 2, planned first so each "later" card's transform is one track: the row becomes a column,
  // then two eased swaps re-rank it (H10 to the top, H6 above H8), then a tick confirms each card
  const order = ['H6', 'H8', 'H10'];
  const colPts = {};
  order.forEach((id, i) => { colPts[id] = [[B.nextDefine + 0.5 + i * 0.08, ...LEDGER_COL[i]]]; });
  const swap = (a, b, t) => {
    const pa = colPts[a], pb = colPts[b], la = pa[pa.length - 1], lb = pb[pb.length - 1];
    pa.push([t, la[1], la[2]], [t + 0.8, lb[1], lb[2]]); pb.push([t, lb[1], lb[2]], [t + 0.8, la[1], la[2]]);
  };
  swap('H6', 'H10', B.nextDefine + 1.8);
  swap('H8', 'H6', B.nextDefine + 2.7);

  const cards = {};
  for (const h of HYP) {
    const later = !h.exp;
    const parent = later ? q('#cyLater') : S;
    const c = el('hyp', `<b>${h.id}</b>${h.t}<span class="tag ${later ? '' : 'now'}">${later ? 'later' : 'now'}</span>${later ? '<span class="tick"><i>✓</i>founder confirms</span>' : ''}`, parent);
    c.style.width = h.w + 'px';
    cards[h.id] = c;
    // positions are box coordinates; the "later" cards live inside the ledger, so they are offset
    const P = (x, y) => later ? [x - LEDGER_OFF[0], y - LEDGER_OFF[1]] : [x, y];
    const i = HYP.indexOf(h);
    const lift = B.lift + i * 0.14, mx = B.matrix + 0.4 + i * 0.08, st = B.sort + 1.6 + i * 0.08, df = B.define + 0.5 + i * 0.07;
    // lifts off its line in the register and settles into a column (the lines are closer than a card is tall)
    const [lx, ly] = P(176, h.line - 20), [cx, cy] = P(200, 34 + i * 50), [ax, ay] = P(...MATRIX[h.id]);
    const pts = [
      [lift, lx, ly, 0.92, EASE], [lift + 0.6, cx, cy, 1], [mx, cx, cy, 1, EASE], [mx + 0.9, ax, ay, 1],
    ];
    if (later) {
      const [sx, sy] = LEDGER_ROW[h.id];
      pts.push([st, ax, ay, 1, EASE], [st + 0.9, sx, sy, 1]);
      // round 2: hold in the row, then the column and the swaps (ledger-local coordinates)
      const col = colPts[h.id];
      pts.push([col[0][0], sx, sy, 1, EASE]);
      col.forEach(([t, x, y], k) => { pts.push([k === 0 ? t + 0.8 : t, x, y, 1, EASE]); });
      // the founder's tick, after the ranking settles
      const tk = c.querySelector('.tick'), ts = B.nextDefine + 3.5 + order.indexOf(h.id) * 0.2;
      op(tk, [[ts, 0], [ts + 0.4, 1]]);
      tw(tk, [{ transform: 'translateX(-6px)' }, { transform: 'translateX(0)' }], T(ts), 0.5, POP);
    } else {
      const [rx, ry] = ROUND1[h.id], [ex, ey] = EXP[h.id];
      pts.push([st, ax, ay, 1, EASE], [st + 0.9, rx, ry, 1], [df, rx, ry, 1, EASE], [df + 0.9, ex, ey, 1]);
    }
    move(c, pts);
    const o = [[lift, 0], [lift + 0.35, 1]];
    if (!later) o.push([B.track - 0.1, 1], [B.track + 0.4, 0]);
    op(c, o);
    // the stage tag, only while the cards are sorted
    const tag = c.querySelector('.tag');
    op(tag, [[B.sort + i * 0.1, 0], [B.sort + i * 0.1 + 0.35, 1], [B.sort + 2.8, 1], [B.sort + 3.1, 0]]);
    tw(tag, [{ transform: 'translateY(6px)' }, { transform: 'translateY(0)' }], T(B.sort + i * 0.1), 0.5, POP);
  }

  // ================= a. the register (0–4.4) =================
  const shot = q('#cyShot');
  op(shot, [[0.0, 0], [0.6, 1], [3.4, 1], [4.2, 0]]);
  tw(shot, [{ transform: 'scale(1.02)' }, { transform: 'scale(1)' }], T(0.0), 1.2);
  op(q('#cyShotLab'), [[0.6, 0], [1.0, 1], [3.4, 1], [3.8, 0]]);
  tw(q('#cyShotLab'), [{ transform: 'translateY(8px)' }, { transform: 'translateY(0)' }], T(0.6), 0.6);

  // ================= b. the matrix (4.4–7.8), then the stage sort (7.8–13) =================
  const matrix = q('#cyMatrix');
  op(matrix, [[B.matrix, 0], [B.matrix + 0.3, 1], [B.sort + 1.4, 1], [B.sort + 1.9, 0]]);
  for (const [id, s] of [['#cyAxX', 0], ['#cyAxY', 0.1]]) {
    const p = q(id), L = p.getTotalLength(); p.style.strokeDasharray = L;
    tw(p, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }], T(B.matrix + s), 0.7, 'ease-out');
  }
  fadeIn(q('#cyAxXa'), T(B.matrix + 0.6), 0.2); fadeIn(q('#cyAxYa'), T(B.matrix + 0.7), 0.2);
  for (const [id, s] of [['#cyLabX', 0.5], ['#cyLabY', 0.6]]) {
    op(q(id), [[B.matrix + s, 0], [B.matrix + s + 0.4, 1], [B.sort + 1.4, 1], [B.sort + 1.9, 0]]);
    tw(q(id), [{ transform: 'translateY(6px)' }, { transform: 'translateY(0)' }], T(B.matrix + s), 0.5);
  }
  track(q('#cyQuad'), [[T(B.matrix + 1.8), { opacity: 0 }], [T(B.matrix + 2.4), { opacity: 0.16 }]]);
  tw(q('#cyQuad'), [{ transform: 'scale(.96)' }, { transform: 'scale(1)' }], T(B.matrix + 1.8), 0.6);
  q('#cyQuad').style.transformOrigin = '577px 257px'; q('#cyQuad').style.transformBox = 'view-box';

  const round1 = q('#cyRound1');
  op(round1, [[B.sort + 1.4, 0], [B.sort + 1.9, 1], [B.define + 0.3, 1], [B.define + 0.7, 0]]);
  tw(round1, [{ transform: 'translateY(10px)' }, { transform: 'translateY(0)' }], T(B.sort + 1.4), 0.7);
  const ledger = q('#cyLedger'), lframe = q('#cyLedgerFrame');
  op(lframe, [[B.sort + 1.5, 0], [B.sort + 2.0, 1]]);
  // the ledger container: fades away once the sort is done (gone by 12.0), returns for round 2
  op(ledger, [[B.sort + 3.6, 1], [B.sort + 4.2, 0], [B.nextDefine + 0.2, 0], [B.nextDefine + 0.8, 1]]);
  track(ledger, [[T(B.nextDefine + 0.2), { transform: 'translateY(0px)', easing: EASE }], [T(B.nextDefine + 1.2), { transform: 'translateY(-420px)' }]]);
  tw(lframe, [{ height: '102px' }, { height: '230px' }], T(B.nextDefine + 0.4), 0.8);

  // ================= chips =================
  const chip = (id, s, e) => {
    const c = q(id);
    op(c, [[s, 0], [s + 0.4, 1], [e, 1], [e + 0.3, 0]]);
    tw(c, [{ transform: 'translateY(10px) scale(.96)' }, { transform: 'translateY(0) scale(1)' }], T(s), 0.6, POP);
  };
  chip('#cyChipDefine', B.define, B.build - 0.2);
  chip('#cyChipBuild', B.build, B.track - 0.2);
  chip('#cyChipTrack', B.track, B.analyze - 0.2);
  chip('#cyChipAnalyze', B.analyze, B.nextDefine - 0.2);
  chip('#cyChipDefine2', B.nextDefine, B.end);

  // ================= c. define (13–17.4): two experiments =================
  for (const [id, s] of [['#cyExpInf', 0.5], ['#cyExpMkt', 0.6]]) {
    const f = q(id);
    op(f, [[B.define + s, 0], [B.define + s + 0.5, 1], [B.track - 0.1, 1], [B.track + 0.4, 0]]);
    tw(f, [{ transform: 'translateY(8px)' }, { transform: 'translateY(0)' }], T(B.define + s), 0.7);
  }
  for (const [id, s] of [['#cyInfT', 1.6], ['#cyInfP', 1.85], ['#cyMktT', 1.75], ['#cyMktP', 2.0]]) rise(q(id), T(B.define + s), 0.5, 8);

  // ================= d. build (17.4): the tools; integrate (20): wired into Waya =================
  // x, w: the pill's box position under its experiment; tx: its place in the compact row at track
  const TOOLS = [
    { n: 'Landing page', x: 31, w: 120, tx: 82 }, { n: 'Calendar', x: 159, w: 96, tx: 214 }, { n: 'Spreadsheet', x: 263, w: 116, tx: 322 },
    { n: 'Email', x: 455, w: 76, tx: 450 }, { n: 'CRM', x: 539, w: 64, tx: 538 }, { n: 'Survey', x: 611, w: 84, tx: 614 },
  ];
  const PILL_Y = 418, ROW_Y = 100, NODE = [390, 576], NODE_R = 38;
  const wire = q('#cyWire'), node = q('#cyNode');
  const pills = TOOLS.map((t, i) => {
    const p = el('pill', `<span class="ok">✓</span>${t.n}<span class="built">built</span>`, q('#cyPills'));
    p.style.width = t.w + 'px';
    t.cx = t.x + t.w / 2; t.cy = PILL_Y + 22;
    const s = B.build + 0.3 + i * 0.12, m = B.track + 0.1 + i * 0.05, f = B.analyze + 0.3 + i * 0.05;
    move(p, [[s, t.x, PILL_Y, 0.6, POP], [s + 0.5, t.x, PILL_Y, 1], [m, t.x, PILL_Y, 1, EASE], [m + 0.9, t.tx, ROW_Y, 1], [f, t.tx, ROW_Y, 1, 'cubic-bezier(.5,0,.2,1)'], [f + 0.8, 390 - t.w / 2, 365, 0.2]]);
    op(p, [[s, 0], [s + 0.3, 1], [f + 0.4, 1], [f + 0.8, 0]]);
    // the "campaign built" state, as each tool's copy arrives: a check slides in, the pill turns mint
    const cb = B.campaigns + 0.7 + i * 0.3 + 1.15;
    tw(p, [{ backgroundColor: '#ffffff', borderColor: 'rgba(56,63,59,.14)' }, { backgroundColor: '#D3E9E0', borderColor: '#D3E9E0' }], T(cb), 0.4, 'linear');
    tw(p.querySelector('.ok'), [{ width: '0px' }, { width: '16px' }], T(cb), 0.35);
    op(p.querySelector('.built'), [[cb + 0.1, 0], [cb + 0.5, 1], [B.track - 0.1, 1], [B.track + 0.3, 0]]);
    // the connector to Waya, drawn at integrate
    const dx = NODE[0] - t.cx, dy = NODE[1] - t.cy, L0 = Math.hypot(dx, dy);
    const ex = NODE[0] - dx / L0 * (NODE_R + 2), ey = NODE[1] - dy / L0 * (NODE_R + 2);
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', `M${t.cx} ${PILL_Y + 44} L${ex} ${ey}`); path.setAttribute('fill', 'none'); path.setAttribute('stroke', '#B8BBB6'); path.setAttribute('stroke-width', '2.5'); path.setAttribute('stroke-linecap', 'round');
    wire.appendChild(path);
    const L = path.getTotalLength(); path.style.strokeDasharray = L;
    // all six lines are fully drawn by integrate+0.95, so a frame at integrate+1 shows every tool wired
    tw(path, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }], T(B.integrate + 0.25 + i * 0.05), 0.45, 'ease-out');
    track(path, [[T(B.integrate + 1.6), { stroke: '#B8BBB6' }], [T(B.integrate + 1.9), { stroke: '#EAB62F' }], [T(B.integrate + 2.4), { stroke: '#B8BBB6' }]]);
    t.path = path; t.el = p;
    return p;
  });
  op(wire, [[B.integrate, 1], [B.track - 0.1, 1], [B.track + 0.4, 0]]);
  op(node, [[B.integrate, 0], [B.integrate + 0.3, 1], [B.track - 0.1, 1], [B.track + 0.4, 0]]);
  track(node, [[T(B.integrate), { transform: 'scale(.5)', easing: POP }], [T(B.integrate + 0.5), { transform: 'scale(1)' }], [T(B.integrate + 1.6), { transform: 'scale(1)', easing: 'ease-in-out' }], [T(B.integrate + 1.95), { transform: 'scale(1.16)', easing: 'ease-in-out' }], [T(B.integrate + 2.4), { transform: 'scale(1)' }]]);
  track(node, [[T(B.integrate + 1.6), { boxShadow: '0 0 0 0 rgba(234,182,47,.5)', easing: 'ease-out' }], [T(B.integrate + 2.5), { boxShadow: '0 0 0 26px rgba(234,182,47,0)' }]]);

  // ================= e. campaigns (23.6): copy flows out, interviews come in =================
  const copy = q('#cyCopy'), intv = q('#cyInt');
  op(copy, [[B.campaigns, 0], [B.campaigns + 0.5, 1], [B.track - 0.1, 1], [B.track + 0.4, 0]]);
  tw(copy, [{ transform: 'translateY(10px)' }, { transform: 'translateY(0)' }], T(B.campaigns), 0.7);
  // copy card → Waya
  const cp = document.createElementNS(svgNS, 'path');
  cp.setAttribute('d', `M330 672 L${NODE[0] - 30} ${NODE[1] + 26}`); cp.setAttribute('fill', 'none'); cp.setAttribute('stroke', '#B8BBB6'); cp.setAttribute('stroke-width', '2.5'); cp.setAttribute('stroke-linecap', 'round');
  wire.appendChild(cp);
  { const L = cp.getTotalLength(); cp.style.strokeDasharray = L; tw(cp, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }], T(B.campaigns + 0.4), 0.5, 'ease-out'); }
  const SNIPS = ['Parents run the game', 'Book a 20-min call', 'Pod tracker', '“Run a pod this semester”', 'Co-op leads list', '3 questions for parents'];
  TOOLS.forEach((t, i) => {
    const s = el('snip', SNIPS[i], q('#cySnips'));
    const t0 = B.campaigns + 0.7 + i * 0.3;
    const at = (x, y) => `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    track(s, [[T(t0), { transform: at(330, 672), easing: 'ease-in' }], [T(t0 + 0.45), { transform: at(NODE[0], NODE[1]), easing: 'ease-out' }], [T(t0 + 1.2), { transform: at(t.cx, t.cy) }]]);
    op(s, [[t0, 0], [t0 + 0.25, 1], [t0 + 0.95, 1], [t0 + 1.2, 0]]);
  });
  op(intv, [[B.campaigns + 2.9, 0], [B.campaigns + 3.4, 1], [B.track - 0.1, 1], [B.track + 0.4, 0]]);
  tw(intv, [{ transform: 'translateY(10px)' }, { transform: 'translateY(0)' }], T(B.campaigns + 2.9), 0.7);
  const FROM = [3, 4, 3, 5, 3, 4, 0, 3, 5], INIT = ['D', 'P', 'M', 'L', 'T', 'A', 'R', 'S', 'J'], landed = [];
  INIT.forEach((ch, i) => {
    const a = el('avatar', ch, q('#cyAvatars'));
    const t = TOOLS[FROM[i]], s = B.campaigns + 3.6 + i * 0.22, lx = 560 + i * 22, ly = 692;
    const mid = [(t.cx + lx) / 2 + 40, (t.cy + ly) / 2 - 30];
    track(a, [[T(s), { transform: tr(t.cx, t.cy, 0.6), easing: 'cubic-bezier(.4,0,.3,1)' }], [T(s + 0.4), { transform: tr(mid[0], mid[1], 1), easing: 'cubic-bezier(.3,0,.2,1)' }], [T(s + 0.8), { transform: tr(lx, ly, 1) }]]);
    op(a, [[s, 0], [s + 0.2, 1], [B.track - 0.1, 1], [B.track + 0.4, 0]]);
    landed.push(T(s + 0.75));
  });
  const intN = q('#cyIntN');
  JS.push((t) => { let n = 0; for (const l of landed) if (t >= l) n++; intN.textContent = n; });

  // ================= f. track (30.4): the CRM and the live metrics =================
  const crm = q('#cyCRM'), met = q('#cyMet');
  for (const [f, s] of [[crm, 0.5], [met, 0.8]]) {
    op(f, [[B.track + s, 0], [B.track + s + 0.5, 1], [B.analyze + 0.3, 1], [B.analyze + 0.9, 0]]);
    track(f, [[T(B.track + s), { transform: 'translateY(12px) scale(1)', easing: EASE }], [T(B.track + s + 0.7), { transform: 'translateY(0) scale(1)' }], [T(B.analyze + 0.3), { transform: 'translateY(0) scale(1)', easing: 'cubic-bezier(.5,0,.2,1)' }], [T(B.analyze + 1.1), { transform: `translate(${390 - (f === crm ? 250 : 620)}px, ${365 - 395}px) scale(.2)` }]]);
  }
  const CONV = [
    ['Dana', 'co-op lead, 4 pods', 'would pay, wants a printed guide'],
    ['Priya', 'parent', 'ran a session without help'],
    ['Marcus', 'co-op lead', 'asked for a January start'],
    ['Lena', 'parent', '$200 felt high for one semester'],
    ['Tom', 'co-op lead', 'already collects money for field trips'],
  ];
  CONV.forEach(([n, r, l], i) => {
    const row = el('crow', `<div class="n">${n} <span>· ${r}</span></div><div class="l">${l}</div>`, q('#cyRows'));
    row.style.top = (64 + i * 72) + 'px';
    const s = B.track + 1.1 + i * 0.45;
    rise(row, T(s), 0.5, 8);
    rise(row.querySelector('.l'), T(s + 0.3), 0.4, 4);
  });
  const METERS = [['#cyM1', 0.85, 'cyM1v', (p) => (12.4 * p).toFixed(1) + '%'], ['#cyM2', 0.28, 'cyM2v', (p) => Math.round(1 * p) + ' of 4'], ['#cyM3', 0.56, 'cyM3v', (p) => Math.round(3 * p) + ' of 5']];
  METERS.forEach(([id, w, vid, fmt], i) => {
    const s = B.track + 3.3 + i * 0.3;
    tw(q(id + ' .mb i'), [{ width: '0%' }, { width: (w * 100) + '%' }], T(s), 1.3, 'cubic-bezier(.3,0,.2,1)');
    const v = document.getElementById(vid);
    JS.push((t) => { const p = Math.max(0, Math.min(1, (t - T(s)) / 1.3)); v.textContent = fmt(1 - Math.pow(1 - p, 3)); });
  });
  fadeIn(q('#cyKill'), T(B.track + 2.9), 0.4); rise(q('#cyKillLab'), T(B.track + 3.0), 0.5, 4);
  tw(q('#cyProg .pb i'), [{ width: '0%' }, { width: '64%' }], T(B.track + 3.8), 1.4, 'cubic-bezier(.3,0,.2,1)');

  // ================= g. analyze (37): the dashboard assembles =================
  const dash = q('#cyDash');
  op(dash, [[B.analyze + 0.9, 0], [B.analyze + 1.4, 1], [B.nextDefine, 1], [B.nextDefine + 0.5, 0]]);
  tw(dash, [{ transform: 'scale(.9)' }, { transform: 'scale(1)' }], T(B.analyze + 0.9), 0.8, POP);
  const RESULTS = [
    ['H1 · marketing', 'Pod leaders pay $200', 'acc', 'Accepted'], ['H17 · infrastructure', 'API cost near 97%', 'acc', 'Accepted'],
    ['H2 · marketing', 'Co-op outreach', 'rej', 'Rejected'], ['H4 · infrastructure', 'Parents run the game', 'inc', 'Inconclusive'],
    ['H15 · marketing', 'Semester windows', 'acc', 'Accepted'], ['H3 · infrastructure', 'Support under 23 min', 'rej', 'Rejected'],
  ];
  RESULTS.forEach(([k, t, cls, label], i) => {
    const tile = el('tile', `<div class="tk">${k}</div><div class="tt">${t}</div><div class="pillst"><span class="t">Testing</span><span class="${cls}">${label}</span></div>`, q('#cyTiles'));
    tile.style.left = (24 + (i % 2) * 346) + 'px'; tile.style.top = (62 + Math.floor(i / 2) * 134) + 'px';
    rise(tile, T(B.analyze + 1.4 + i * 0.2), 0.5, 10);
    const st = tile.querySelectorAll('.pillst span'), f = B.analyze + 2.6 + i * 0.28;
    tw(st[0], [{ opacity: 1, transform: 'rotateX(0deg)' }, { opacity: 0, transform: 'rotateX(90deg)' }], T(f), 0.3, 'ease-in');
    tw(st[1], [{ opacity: 0, transform: 'rotateX(-90deg)' }, { opacity: 1, transform: 'rotateX(0deg)' }], T(f + 0.28), 0.3, 'ease-out');
  });
  rise(q('#cyLearn'), T(B.analyze + 4.4), 0.6, 8);

  // ================= h. define · round 2 (43): the ledger comes forward, re-ranks, is confirmed =================
  // (the "later" cards' column, swaps and ticks are scheduled in the card loop above)
  // the ring and the Round 2 label
  const ring = q('#cyRingPath'), RL = ring.getTotalLength(); ring.style.strokeDasharray = RL;
  track(ring, [[T(B.nextRound + 0.2), { strokeDashoffset: RL, easing: 'cubic-bezier(.4,0,.2,1)' }], [T(B.nextRound + 1.2), { strokeDashoffset: 0 }]]);
  op(q('#cyRing'), [[B.nextRound, 0], [B.nextRound + 0.2, 1]]);
  fadeIn(q('#cyRingArrow'), T(B.nextRound + 1.1), 0.25);
  const r2 = q('#cyRound2');
  op(r2, [[B.nextRound, 0], [B.nextRound + 0.4, 1]]);
  track(r2, [[T(B.nextRound), { transform: 'translateX(-50%) scale(.7)', easing: POP }], [T(B.nextRound + 0.6), { transform: 'translateX(-50%) scale(1)' }]]);

  return {
    end: T(B.end),
    beats: {
      define: T(B.define), group: T(B.sort), build: T(B.build), integrate: T(B.integrate), campaigns: T(B.campaigns),
      track: T(B.track), analyze: T(B.analyze), nextDefine: T(B.nextDefine), nextRound: T(B.nextRound),
    },
  };
};
