/* Plain Q — front end.
   The Python backend does the quantum part (Qiskit); this file does the
   language part: it reads the numbers coming back and turns them into
   sentences a non-physicist can follow. */

/* ------------------------------------------------------------------ gates */
const G = {
  h:  { color: '#2ee6c5', arity: 1 },
  x:  { color: '#ff7a5c', arity: 1 },
  z:  { color: '#b48cff', arity: 1 },
  cx: { color: '#ffc857', arity: 2 },
};
const QNAME = ['A', 'B', 'C'];
const COLS = 6;

/* --------------------------------------------------------------- language */
const I18N = {
  en: {
    tagline: 'Build a circuit. Get an answer you can actually read.',
    glossaryBtn: 'What does that word mean?',
    glossaryTitle: 'Every word on this page, in plain language',
    pick: 'Pick a box',
    orStart: 'Or start from a story',
    build: 'Click a wire to drop the next box',
    wires: 'Wires',
    clear: 'Clear the board',
    live: 'live simulation',
    hintEmpty: 'nothing on the board yet',
    hintPlace: 'click a wire to add a box · click a box to remove it',
    hintFull: 'board is full — click a box to remove it',
    hintPickFirst: 'pick a box on the left first',
    hintLastWire: 'Link needs a wire below it',
    emptyTitle: 'Nothing built yet.',
    emptyBody: 'Pick <b>Mix</b> on the left, then click wire <b>A</b>. That one box already puts a qubit in two places at once.',

    gates: {
      h:  { name: 'Mix',   sub: 'be 0 and 1 at the same time', glyph: 'H' },
      x:  { name: 'Flip',  sub: 'turn 0 into 1', glyph: 'X' },
      z:  { name: 'Twist', sub: 'change a hidden sign', glyph: 'Z' },
      cx: { name: 'Link',  sub: 'make one wire follow another', glyph: '⊕' },
    },
    board: { h: 'mix', x: 'flip', z: 'twist' },
    wiresLabel: (q) => QNAME[q],

    stories: [
      { id: 'coin',  n: 2, gates: [{ gate: 'h', qubits: [0] }],
        t: 'A coin that never lands', s: 'One box. Instant 50 / 50.' },
      { id: 'bell',  n: 2, gates: [{ gate: 'h', qubits: [0] }, { gate: 'cx', qubits: [0, 1] }],
        t: 'Two wires, one answer', s: 'They stop having separate answers.' },
      { id: 'cancel', n: 2, gates: [{ gate: 'h', qubits: [0] }, { gate: 'z', qubits: [0] }, { gate: 'h', qubits: [0] }],
        t: 'Make a wrong answer cancel', s: 'Three boxes. One outcome dies.' },
      { id: 'ghz',   n: 3, gates: [{ gate: 'h', qubits: [0] }, { gate: 'cx', qubits: [0, 1] }, { gate: 'cx', qubits: [1, 2] }],
        t: 'Three wires, one pact', s: 'All three agree, every time.' },
    ],

    cardBars: 'Chance of each answer',
    cardOutcome: 'What the machine will answer',
    cardQubits: 'The state of each wire',
    cardSteps: 'Box by box',
    cardWhy: 'So what?',
    tagExact: 'exact',
    tagMeasured: '1024 runs',
    shots: (n) => `run ${n} times on the simulator, you would see: `,
    sphereFree: 'no answer of its own',
    sphereDef: (b) => `sitting at ${b}`,
    sphereSuper: (p) => `${p} of the time 0`,
    sphereMixed: 'partly tied to the others',
    stepAfter: 'after this box → ',

    hEmpty: 'Nothing has happened yet. Every wire is sitting at 0.',
    hOne: (b) => `One answer, every time: <u>${b}</u>. The circuit has no choice left.`,
    hPair: (a, b, same) => same
      ? `The wires answer together: <u>${a}</u> or <u>${b}</u> — they always agree.`
      : `The wires answer together: <u>${a}</u> or <u>${b}</u> — they always disagree.`,
    hTwo: (a, b, p, q) => `Two answers, <u>${p}</u> and <u>${q}</u>. Nobody can predict which one you get.`,
    hUniform: (k) => `All <u>${k}</u> answers exist at once, and every one is equally likely.`,
    hSpread: (b, p, rest) => `<u>${b}</u> comes up ${p} of the time; the rest is spread over ${rest} other answers.`,

    sEntangled: (qs) => `Wires ${qs} no longer have an answer of their own. They only have a shared one — that is <b>entanglement</b>.`,
    sSuper: (q, p, r) => `Wire <b>${q}</b> is 0 and 1 at the same time: ${p} chance of reading 0, ${r} chance of reading 1. It has not decided yet.`,
    sFixed: (b) => `Nothing here is random any more. Run it a thousand times and you get <b>${b}</b> a thousand times.`,
    sPartly: (q) => `Wire <b>${q}</b> is only partly decided — the rest of its fate is tied to the other wires.`,

    gStepH: (q, p, r) => `<span class="g">Mix</span> puts wire <b>${q}</b> into both answers at once: ${p} zero, ${r} one.`,
    gStepHDone: (q, b) => `<span class="g">Mix</span> on wire <b>${q}</b> — and it lands on <b>${b}</b> every time. The two paths cancelled instead of adding up.`,
    gStepX: (q) => `<span class="g">Flip</span> swaps 0 and 1 on wire <b>${q}</b>. Whatever was 0 is now 1.`,
    gStepZ: (q) => `<span class="g">Twist</span> changes a hidden sign on wire <b>${q}</b>. On its own it looks like nothing happened — but it decides whether the next Mix adds up or cancels.`,
    gStepCX: (c, t) => `<span class="g">Link</span> ties the wires together: whenever <b>${c}</b> is 1, <b>${t}</b> flips. From here on they move as one object.`,
    gCancel: (b) => `Two paths cancelled: <b>${b}</b> just became impossible. That is <b>interference</b> — the engine of every real quantum algorithm.`,

    vEntangled: '<span class="lbl">entanglement</span>Two dice that always show the same number, even a kilometre apart. This is the resource behind quantum key distribution and quantum links in a real machine.',
    vInterference: '<span class="lbl">interference</span>The wrong answer was not filtered out afterwards — it was cancelled before it ever happened. This is where quantum beats classical computing.',
    vUniform: '<span class="lbl">superposition</span>A coin spinning in the air. It is genuinely both sides until you look. Ask it once, you still get one side — the trick is making the wrong sides cancel first.',
    vFixed: '<span class="lbl">deterministic</span>No randomness left. Quantum circuits can be certain too — the interesting part is what happens in the middle.',
    vSuper: '<span class="lbl">superposition</span>Every box is one step of a computation that explores several answers at once. Add a Twist and a second Mix and watch one of them disappear.',

    err: (m) => `The simulator said: ${m}`,
    errDown: 'Cannot reach the Python simulator. Start it with <code>python3 server.py</code> in the project folder.',

    glossary: [
      ['Qubit', '量子比特', 'A bit that can also be 0 and 1 at the same time instead of just one of them. Wires A, B, C in this app are qubits.'],
      ['Superposition', '叠加', 'Being in two states at once, the way a spinning coin is neither heads nor tails until it lands. <em>Mix</em> creates it.'],
      ['Entanglement', '纠缠', 'Two qubits that lose their individual answers and keep only a shared one. Ask one, and you instantly know the other. <em>Link</em> creates it.'],
      ['Interference', '干涉', 'Paths that would lead to a wrong answer cancel each other out, the way two waves can cancel into silence. <em>Twist</em> plus a second <em>Mix</em> does it.'],
      ['Gate / Box', '门', 'One instruction applied to a qubit. Here they are called Mix, Flip, Twist, Link.'],
      ['Measurement', '测量', 'Looking at the answer. It forces one outcome out of many, and you cannot see the others any more.'],
      ['|0⟩ and |1⟩', '0 态和 1 态', 'Just the two possible answers of a single qubit — the ordinary 0 and 1 of a normal bit.'],
    ],
    timeAxis: 'time →',
  },

  zh: {
    tagline: '搭一个量子电路，得到一句你看得懂的解释。',
    glossaryBtn: '这些词到底什么意思？',
    glossaryTitle: '这一页上出现的每个词，都用人话说一遍',
    pick: '选一个方块',
    orStart: '或者从一个小故事开始',
    build: '点一条线，把下一个方块放上去',
    wires: '几条线',
    clear: '清空电路板',
    live: '实时模拟',
    hintEmpty: '板上还什么都没有',
    hintPlace: '点线放方块 · 点方块删掉它',
    hintFull: '板子满了 —— 点一个方块删掉它',
    hintPickFirst: '先在左边选一个方块',
    hintLastWire: '「连起来」需要下面还有一条线',
    emptyTitle: '还什么都没搭。',
    emptyBody: '先在左边点 <b>混一混</b>，再点线 <b>A</b>。就这一个方块，已经让量子比特同时待在两个地方了。',

    gates: {
      h:  { name: '混一混', sub: '同时变成 0 和 1', glyph: '混' },
      x:  { name: '翻过来', sub: '0 变 1，1 变 0', glyph: '翻' },
      z:  { name: '扭一下', sub: '改一个看不见的符号', glyph: '扭' },
      cx: { name: '连起来', sub: '一条线动了，另一条跟着', glyph: '连' },
    },
    board: { h: '混', x: '翻', z: '扭' },
    wiresLabel: (q) => QNAME[q],

    stories: [
      { id: 'coin',  n: 2, gates: [{ gate: 'h', qubits: [0] }],
        t: '一枚永不落地的硬币', s: '一个方块，立刻 50 / 50。' },
      { id: 'bell',  n: 2, gates: [{ gate: 'h', qubits: [0] }, { gate: 'cx', qubits: [0, 1] }],
        t: '两条线，一个答案', s: '它们不再各自有答案。' },
      { id: 'cancel', n: 2, gates: [{ gate: 'h', qubits: [0] }, { gate: 'z', qubits: [0] }, { gate: 'h', qubits: [0] }],
        t: '让一个错答案消失', s: '三个方块，一个结果被抵消。' },
      { id: 'ghz',   n: 3, gates: [{ gate: 'h', qubits: [0] }, { gate: 'cx', qubits: [0, 1] }, { gate: 'cx', qubits: [1, 2] }],
        t: '三条线，一个约定', s: '三条永远一起同意。' },
    ],

    cardBars: '每个答案的几率',
    cardOutcome: '机器会给出的答案',
    cardQubits: '每条线的状态',
    cardSteps: '一个方块一个方块看',
    cardWhy: '所以呢？',
    tagExact: '精确值',
    tagMeasured: '实测 1024 次',
    shots: (n) => `在模拟器上跑 ${n} 次，会看到：`,
    sphereFree: '自己已经没有答案',
    sphereDef: (b) => `停在 ${b}`,
    sphereSuper: (p) => `有 ${p} 的机会读到 0`,
    sphereMixed: '一半答案在别人手里',
    stepAfter: '这一步之后 → ',

    hEmpty: '还什么都没发生，每条线都稳稳地停在 0。',
    hOne: (b) => `每次都只有一个答案：<u>${b}</u>。电路已经没得选了。`,
    hPair: (a, b, same) => same
      ? `这几条线一起回答：<u>${a}</u> 或 <u>${b}</u> —— 它们永远一致。`
      : `这几条线一起回答：<u>${a}</u> 或 <u>${b}</u> —— 它们永远相反。`,
    hTwo: (a, b, p, q) => `两个答案，<u>${p}</u> 和 <u>${q}</u>。没人能预测你会拿到哪一个。`,
    hUniform: (k) => `<u>${k}</u> 个答案同时存在，每一个概率都一样。`,
    hSpread: (b, p, rest) => `<u>${b}</u> 出现的概率是 ${p}，剩下的散在另外 ${rest} 个答案上。`,

    sEntangled: (qs) => `线 ${qs} 已经各自没有答案了，它们只共有一个答案 —— 这就是<b>纠缠 entanglement</b>。`,
    sSuper: (q, p, r) => `线 <b>${q}</b> 同时是 0 和 1：${p} 的机会读到 0，${r} 的机会读到 1。它还没决定。`,
    sFixed: (b) => `这里已经没有随机性了。跑一千次，一千次都是 <b>${b}</b>。`,
    sPartly: (q) => `线 <b>${q}</b> 只决定了一部分，剩下的命运握在别的线手里。`,

    gStepH: (q, p, r) => `<span class="g">混一混</span>让线 <b>${q}</b> 同时进入两个答案：${p} 是 0，${r} 是 1。`,
    gStepHDone: (q, b) => `<span class="g">混一混</span>作用在线 <b>${q}</b> 上 —— 结果永远是 <b>${b}</b>。两条路没有相加，而是互相抵消了。`,
    gStepX: (q) => `<span class="g">翻过来</span>把线 <b>${q}</b> 上的 0 和 1 互换。原来是 0 的现在是 1。`,
    gStepZ: (q) => `<span class="g">扭一下</span>改的是线 <b>${q}</b> 上一个看不见的符号。单独看像什么都没发生 —— 但它决定了下一次「混一混」是相加还是抵消。`,
    gStepCX: (c, t) => `<span class="g">连起来</span>把两条线绑在一起：只要 <b>${c}</b> 是 1，<b>${t}</b> 就翻转。从此它们作为一个整体移动。`,
    gCancel: (b) => `两条路互相抵消：<b>${b}</b> 这一下变成了不可能。这就是<b>干涉 interference</b> —— 所有真量子算法的发动机。`,

    vEntangled: '<span class="lbl">纠缠</span>两颗骰子，隔着一公里也永远掷出同一个数。量子密钥分发和真实机器里的量子链路，靠的就是这个资源。',
    vInterference: '<span class="lbl">干涉</span>错答案不是算完再筛掉的 —— 它在发生之前就被抵消了。量子计算快过经典计算，赢就赢在这里。',
    vUniform: '<span class="lbl">叠加</span>一枚还在空中转的硬币，没落地之前它真的是两面。你问一次只会得到一个面 —— 诀窍是让错的那面先自己抵消掉。',
    vFixed: '<span class="lbl">确定</span>这里已经没有随机性了。量子电路也可以是确定的 —— 有意思的是中间那段过程。',
    vSuper: '<span class="lbl">叠加</span>每一个方块都是一步计算，同时探索好几个答案。再加一个「扭一下」和一次「混一混」，看其中一个答案消失。',

    err: (m) => `模拟器说：${m}`,
    errDown: '连不上 Python 模拟器。在项目目录里跑 <code>python3 server.py</code> 启动它。',

    glossary: [
      ['Qubit', '量子比特', '一种比特，可以同时是 0 和 1，而不只是其中之一。这个应用里的线 A、B、C 就是量子比特。'],
      ['Superposition', '叠加', '同时处于两个状态，像一枚还在转的硬币，落地之前既不是正面也不是反面。<em>混一混</em> 制造它。'],
      ['Entanglement', '纠缠', '两个量子比特失去了各自的答案，只剩下一个共同的答案。问其中一个，另一个立刻就知道。<em>连起来</em> 制造它。'],
      ['Interference', '干涉', '通往错误答案的几条路互相抵消，就像两列波可以抵消成安静。<em>扭一下</em> 加第二次 <em>混一混</em> 就能做到。'],
      ['Gate / Box', '门', '作用在量子比特上的一条指令。这里叫混一混、翻过来、扭一下、连起来。'],
      ['Measurement', '测量', '去看答案。它把众多可能逼成一个，而你就再也看不到别的了。'],
      ['|0⟩ and |1⟩', '0 态和 1 态', '就是一个量子比特仅有的两个可能答案 —— 也就是普通比特的 0 和 1。'],
    ],
    timeAxis: '时间 →',
  },
};

let lang = localStorage.getItem('plainq.lang') || 'en';
if (!I18N[lang]) lang = 'en';
const L = () => I18N[lang];

/* ------------------------------------------------------------------ state */
const S = { n: 2, gates: [], sel: null, result: null, busy: false, again: false, error: null };

const $ = (id) => document.getElementById(id);
// Qiskit statevector indexes are little-endian: index 1 is |q1 q0⟩ = |01⟩,
// i.e. wire A (q0) is the 1. The page prints answers in wire order A B C,
// so the binary string has to be reversed before it is shown.
const bits = (i, n) => i.toString(2).padStart(n, '0').split('').reverse().join('');
const pct = (p) => (p > 0 && p < 0.005 ? '<1%' : Math.round(p * 100) + '%');
const qnames = (list) => list.map((q) => QNAME[q]).join(' + ');

/* ------------------------------------------------------------------- boot */
function applyStatic() {
  const t = L();
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-i]').forEach((el) => {
    const v = t[el.dataset.i];
    if (typeof v === 'string') el.textContent = v;
  });
  $('tagline').textContent = t.tagline;
  $('glossaryBtn').innerHTML = `<b>?</b><span>${t.glossaryBtn}</span>`;
  document.querySelectorAll('.lang button').forEach((b) => b.classList.toggle('on', b.dataset.lang === lang));
  renderPalette();
  renderStories();
  renderBoard();
  renderResults();
}

/* ---------------------------------------------------------------- palette */
function renderPalette() {
  const t = L();
  const wrap = $('palette');
  wrap.innerHTML = '';
  ['h', 'x', 'z', 'cx'].forEach((k) => {
    const b = document.createElement('button');
    b.className = 'chip' + (S.sel === k ? ' on' : '');
    b.style.setProperty('--c', G[k].color);
    b.innerHTML = `<span class="glyph">${t.gates[k].glyph}</span>
      <span class="txt"><span class="nm">${t.gates[k].name}</span><span class="sb">${t.gates[k].sub}</span></span>`;
    b.onclick = () => { S.sel = S.sel === k ? null : k; renderPalette(); renderBoard(); };
    wrap.appendChild(b);
  });
}

function renderStories() {
  const t = L();
  const wrap = $('recipes');
  wrap.innerHTML = '';
  t.stories.forEach((s) => {
    const b = document.createElement('button');
    b.className = 'recipe';
    b.innerHTML = `<span class="r1">${s.t}</span><span class="r2">${s.s}</span>`;
    b.onclick = () => loadStory(s.id);
    wrap.appendChild(b);
  });
}

function loadStory(id) {
  const s = L().stories.find((x) => x.id === id);
  if (!s) return;
  S.n = s.n;
  S.gates = s.gates.map((g) => ({ gate: g.gate, qubits: [...g.qubits] }));
  S.sel = null;
  syncQubitSeg();
  renderPalette();
  renderBoard();
  run();
}

/* ------------------------------------------------------------------ board */
const GEO = { labelW: 68, colW: 76, rowH: 90, padT: 44, padB: 40 };

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function renderBoard() {
  const t = L();
  const n = S.n;
  const W = GEO.labelW + COLS * GEO.colW + 16;
  const H = GEO.padT + n * GEO.rowH + GEO.padB;
  const wy = (q) => GEO.padT + q * GEO.rowH + 45;
  const cx = (i) => GEO.labelW + i * GEO.colW + GEO.colW / 2;

  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, xmlns: 'http://www.w3.org/2000/svg' });
  svg.style.fontFamily = '-apple-system, "Helvetica Neue", sans-serif';

  // wires + labels
  for (let q = 0; q < n; q++) {
    svg.appendChild(svgEl('line', {
      x1: GEO.labelW - 12, x2: W - 16, y1: wy(q), y2: wy(q),
      stroke: 'rgba(255,255,255,.14)', 'stroke-width': 1.5,
    }));
    const lbl = svgEl('text', {
      x: 10, y: wy(q) + 5, fill: '#e9eef8', 'font-size': 13.5, 'font-weight': 600,
    });
    lbl.textContent = QNAME[q];
    svg.appendChild(lbl);
    const ket = svgEl('text', {
      x: 30, y: wy(q) + 5, fill: '#5c687e', 'font-size': 12,
    });
    ket.textContent = '|0⟩';
    svg.appendChild(ket);
  }

  // the next free column
  const next = S.gates.length;
  if (next < COLS) {
    svg.appendChild(svgEl('rect', {
      x: cx(next) - 30, y: GEO.padT + 2, width: 60, height: n * GEO.rowH - 4,
      rx: 12, fill: 'rgba(46,230,197,.055)', stroke: 'rgba(46,230,197,.35)',
      'stroke-width': 1.2, 'stroke-dasharray': '4 5',
    }));
    for (let q = 0; q < n; q++) {
      const hit = svgEl('rect', {
        x: cx(next) - 30, y: wy(q) - 26, width: 60, height: 52, rx: 10, fill: 'transparent',
      });
      hit.style.cursor = 'pointer';
      hit.onclick = () => place(q);
      svg.appendChild(hit);
    }
  }

  // gates
  S.gates.forEach((g, i) => {
    const color = G[g.gate].color;
    const x = cx(i);
    if (g.gate === 'cx') {
      const [c, tg] = g.qubits;
      svg.appendChild(svgEl('line', {
        x1: x, x2: x, y1: wy(c), y2: wy(tg), stroke: color, 'stroke-width': 2, opacity: .85,
      }));
      svg.appendChild(svgEl('circle', { cx: x, cy: wy(c), r: 5.5, fill: color }));
      svg.appendChild(svgEl('circle', {
        cx: x, cy: wy(tg), r: 14, fill: 'rgba(255,200,87,.12)', stroke: color, 'stroke-width': 2,
      }));
      svg.appendChild(svgEl('line', { x1: x - 14, x2: x + 14, y1: wy(tg), y2: wy(tg), stroke: color, 'stroke-width': 2 }));
      svg.appendChild(svgEl('line', { x1: x, x2: x, y1: wy(tg) - 14, y2: wy(tg) + 14, stroke: color, 'stroke-width': 2 }));
    } else {
      const y = wy(g.qubits[0]);
      svg.appendChild(svgEl('rect', {
        x: x - 26, y: y - 19, width: 52, height: 38, rx: 11,
        fill: 'rgba(255,255,255,.05)', stroke: color, 'stroke-width': 1.6,
      }));
      const tx = svgEl('text', {
        x, y: y + 4.5, fill: color, 'font-size': 12, 'font-weight': 600, 'text-anchor': 'middle',
      });
      tx.textContent = t.board[g.gate];
      svg.appendChild(tx);
    }
    const hit = svgEl('rect', {
      x: x - 30, y: Math.min(...g.qubits.map(wy)) - 26, width: 60,
      height: Math.abs(wy(g.qubits[0]) - wy(g.qubits[g.qubits.length - 1])) + 52,
      fill: 'transparent',
    });
    hit.style.cursor = 'pointer';
    hit.onclick = (e) => { e.stopPropagation(); S.gates.splice(i, 1); renderBoard(); run(); };
    svg.appendChild(hit);

    const num = svgEl('text', {
      x, y: GEO.padT - 8, fill: '#4d576b', 'font-size': 9.5, 'text-anchor': 'middle',
    });
    num.textContent = i + 1;
    svg.appendChild(num);
  });

  const axis = svgEl('text', {
    x: W - 16, y: H - 8, fill: '#3f4859', 'font-size': 10, 'text-anchor': 'end',
  });
  axis.textContent = t.timeAxis;
  svg.appendChild(axis);

  const board = $('board');
  board.innerHTML = '';
  board.appendChild(svg);

  $('hint').textContent = S.gates.length >= COLS ? t.hintFull : S.gates.length ? t.hintPlace : t.hintEmpty;
}

function place(q) {
  if (S.gates.length >= COLS) return;
  if (!S.sel) { $('hint').textContent = L().hintPickFirst; return; }
  const arity = G[S.sel].arity;
  if (arity === 2) {
    if (q + 1 >= S.n) { $('hint').textContent = L().hintLastWire; return; }
    S.gates.push({ gate: S.sel, qubits: [q, q + 1] });
  } else {
    S.gates.push({ gate: S.sel, qubits: [q] });
  }
  renderBoard();
  run();
}

/* -------------------------------------------------------------------- run */
let timer = null;
function run() {
  clearTimeout(timer);
  timer = setTimeout(doRun, 60);
}

async function doRun() {
  if (S.busy) { S.again = true; return; }
  S.busy = true;
  S.error = null;
  try {
    // The whole simulation runs here — this build has no server behind it.
    S.result = Sim.run({ n: S.n, gates: S.gates.map((g) => ({ gate: g.gate, qubits: g.qubits })) });
  } catch (e) {
    S.result = null;
    S.error = e.message || String(e);
  }
  S.busy = false;
  renderResults();
  if (S.again) { S.again = false; doRun(); }
}

/* ---------------------------------------------------------------- results */
function renderResults() {
  const t = L();
  const body = $('resultsBody');
  const empty = $('resultsEmpty');
  $('stepsHead').textContent = L().cardSteps;

  $('engine').textContent = S.result ? `${S.result.engine} · ${S.result.ms} ms` : '';

  $('stepsWrap').hidden = true;
  if (S.error) {
    empty.hidden = true; body.hidden = false;
    body.innerHTML = `<div class="card"><div class="headline" style="font-size:16px;color:#ff9b82">⚠</div>
      <p class="subline">${t.err(S.error)}<br><br>${t.errDown}</p></div>`;
    return;
  }
  if (!S.result || !S.result.gates.length) {
    body.hidden = true; empty.hidden = false;
    empty.innerHTML = `<p style="font-size:21px;color:#e9eef8;font-weight:600;letter-spacing:-.01em;margin-bottom:10px">${t.emptyTitle}</p>
      <p>${t.emptyBody}</p>`;
    return;
  }

  const F = S.result;
  empty.hidden = true; body.hidden = false;
  const d = describe(F, t);

  const sup = F.probs.map((p, i) => ({ i, p })).filter((o) => o.p > 0.005);
  const maxP = Math.max(...F.probs);
  const shots = Object.entries(F.counts).sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}×${v}`).join(' · ');

  body.innerHTML = `
    <div class="card">
      <div class="card-h"><span>${t.cardOutcome}</span><span class="tag">${t.tagExact}</span></div>
      <div class="headline">${d.head}</div>
      <p class="subline">${d.sub}</p>
    </div>

    <div class="card">
      <div class="card-h"><span>${t.cardBars}</span><span class="tag">${t.tagMeasured}</span></div>
      <div class="bars">
        ${sup.map((o) => `
          <div class="bar-row ${o.p === maxP ? 'top' : ''}">
            <span class="bar-label">${bits(o.i, F.n)}</span>
            <span class="bar-track"><span class="bar-fill" style="width:${(o.p * 100).toFixed(1)}%"></span></span>
            <span class="bar-pct">${pct(o.p)}</span>
          </div>`).join('')}
      </div>
      <div class="shots">${t.shots(F.shots)}${shots}</div>
    </div>

    <div class="card">
      <div class="card-h"><span>${t.cardQubits}</span></div>
      <div class="spheres">
        ${F.qubits.map((q, i) => `
          <div class="sphere">
            <canvas data-q="${i}" width="132" height="132"></canvas>
            <div class="cap"><b>${QNAME[i]}</b>${sphereCap(q, t)}</div>
          </div>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-h"><span>${t.cardWhy}</span></div>
      <div class="verdict">${d.why}</div>
    </div>`;

  $('steps').innerHTML = F.steps.map((s, i) => `
    <div class="step">
      <span class="step-n">${i + 1}</span>
      <div>
        <div class="step-txt">${stepText(F, i, t)}</div>
        <div class="step-after">${t.stepAfter}${topLine(s.probs, F.n)}</div>
      </div>
    </div>`).join('');
  $('stepsWrap').hidden = false;

  startSpheres(F);
}

function topLine(probs, n) {
  return probs.map((p, i) => ({ i, p })).filter((o) => o.p > 0.005)
    .sort((a, b) => b.p - a.p).slice(0, 2)
    .map((o) => `${bits(o.i, n)} ${pct(o.p)}`).join(' · ');
}

function sphereCap(q, t) {
  if (q.r < 0.04) return t.sphereFree;
  if (q.r > 0.97) {
    if (Math.abs(q.z) > 0.97) return t.sphereDef((q.z > 0 ? '0' : '1'));
    return t.sphereSuper(pct((1 + q.z) / 2));
  }
  return t.sphereMixed;
}

/* ------------------------------------------------------------- narration */
function describe(F, t) {
  const n = F.n;
  const sup = F.probs.map((p, i) => ({ i, p })).filter((o) => o.p > 0.005);
  const tied = [];
  const superposed = [];
  F.qubits.forEach((q, i) => {
    if (q.entropy > 0.03) tied.push(i);
    else if (q.r > 0.97 && Math.abs(q.z) < 0.97) superposed.push(i);
  });

  // ---- headline
  let head = t.hEmpty;
  if (sup.length === 1) {
    head = t.hOne(bits(sup[0].i, n));
  } else if (sup.length === 2 && tied.length >= 2 && Math.abs(sup[0].p - 0.5) < 0.02) {
    const a = bits(sup[0].i, n), b = bits(sup[1].i, n);
    head = t.hPair(a, b, sameWithin(a) && sameWithin(b));
  } else if (sup.length === 2 && Math.abs(sup[0].p - sup[1].p) < 0.02) {
    head = t.hTwo(bits(sup[0].i, n), bits(sup[1].i, n), pct(sup[0].p), pct(sup[1].p));
  } else if (sup.length === F.probs.length && sup.every((o) => Math.abs(o.p - 1 / sup.length) < 0.02)) {
    head = t.hUniform(sup.length);
  } else {
    const top = sup.slice().sort((x, y) => y.p - x.p)[0];
    head = t.hSpread(bits(top.i, n), pct(top.p), sup.length - 1);
  }

  // ---- subline
  let sub = '';
  if (tied.length >= 2) {
    sub = t.sEntangled(qnames(tied));
  } else if (sup.length === 1 && tied.length === 0) {
    sub = t.sFixed(bits(sup[0].i, n));
  } else if (superposed.length) {
    const q = superposed[0];
    const p0 = (1 + F.qubits[q].z) / 2;
    sub = t.sSuper(QNAME[q], pct(p0), pct(1 - p0));
  } else if (tied.length === 1) {
    sub = t.sPartly(QNAME[tied[0]]);
  }

  // ---- why
  let why = t.vSuper;
  const cancelled = F.steps.some((_, i) => i > 0 && isInterference(F.steps[i - 1].probs, F.steps[i].probs));
  if (tied.length >= 2) why = t.vEntangled;
  else if (cancelled) why = t.vInterference;
  else if (sup.length === F.probs.length) why = t.vUniform;
  else if (sup.length === 1) why = t.vFixed;

  return { head, sub, why, tied, superposed };
}

// "the wires always agree" = in both surviving answers all wires show the same value
function sameWithin(s) {
  return [...s].every((c) => c === s[0]);
}

// interference = branches vanished and no new branch appeared
function isInterference(before, after) {
  let gone = false;
  for (let i = 0; i < before.length; i++) {
    if (before[i] > 0.08 && after[i] < 0.005) gone = true;
    if (before[i] < 0.005 && after[i] > 0.08) return false; // a branch moved, that is not cancellation
  }
  return gone;
}

function stepText(F, i, t) {
  const s = F.steps[i];
  const [a, b] = s.qubits;
  // interference wins over the gate's own description
  if (i > 0 && isInterference(F.steps[i - 1].probs, s.probs)) {
    const gone = [];
    for (let k = 0; k < s.probs.length; k++) {
      if (F.steps[i - 1].probs[k] > 0.08 && s.probs[k] < 0.005) gone.push(bits(k, F.n));
    }
    return t.gCancel(gone.join(', '));
  }
  if (s.gate === 'h') {
    const q = s.qubits_state[a];
    const p0 = (1 + q.z) / 2;
    if (Math.abs(q.r) > 0.97 && (p0 < 0.005 || p0 > 0.995)) {
      return t.gStepHDone(QNAME[a], p0 > 0.5 ? '0' : '1');
    }
    return t.gStepH(QNAME[a], pct(p0), pct(1 - p0));
  }
  if (s.gate === 'x') return t.gStepX(QNAME[a]);
  if (s.gate === 'z') return t.gStepZ(QNAME[a]);
  return t.gStepCX(QNAME[a], QNAME[b]);
}

/* ---------------------------------------------------------- bloch spheres */
let raf = null;
let yaw = 0;

function startSpheres() {
  if (raf) cancelAnimationFrame(raf);
  const canvases = [...document.querySelectorAll('.sphere canvas')];
  if (!canvases.length) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const e = 0.42, ce = Math.cos(e), se = Math.sin(e);
  canvases.forEach((c) => {
    const s = c.clientWidth || 118;
    c.width = Math.round(s * dpr); c.height = Math.round(s * dpr);
  });

  const project = (x, y, z, R, ox, oy) => {
    const X = x * Math.cos(yaw) - y * Math.sin(yaw);
    const Y = x * Math.sin(yaw) + y * Math.cos(yaw);
    return [ox + X * R, oy - (Y * se + z * ce) * R];
  };

  const frame = () => {
    yaw += 0.006;
    canvases.forEach((c) => {
      const size = c.clientWidth || 118;
      const R = size * 0.335, ox = size / 2, oy = size / 2;
      const q = S.result.qubits[+c.dataset.q];
      const ctx = c.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      // sphere body
      const grd = ctx.createRadialGradient(ox - 12, oy - 16, 4, ox, oy, R);
      grd.addColorStop(0, 'rgba(120,170,220,.13)');
      grd.addColorStop(1, 'rgba(20,30,50,.05)');
      ctx.beginPath(); ctx.arc(ox, oy, R, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 1; ctx.stroke();

      // equator, drawn segment by segment so the back half fades
      for (let k = 0; k < 64; k++) {
        const a1 = (k / 64) * Math.PI * 2, a2 = ((k + 1) / 64) * Math.PI * 2;
        const p1 = project(Math.cos(a1), Math.sin(a1), 0, R, ox, oy);
        const p2 = project(Math.cos(a2), Math.sin(a2), 0, R, ox, oy);
        const depth = Math.sin((a1 + a2) / 2); // +1 = far side
        ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]);
        ctx.strokeStyle = depth > 0 ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.20)';
        ctx.lineWidth = 1; ctx.stroke();
      }

      // axis pole labels
      ctx.fillStyle = 'rgba(255,255,255,.42)';
      ctx.font = '600 10px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('|0⟩', ox, oy - R + 1);
      ctx.fillText('|1⟩', ox, oy + R + 11);

      // the arrow
      if (q.r > 0.04) {
        const tip = project(q.x, q.y, q.z, R, ox, oy);
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(tip[0], tip[1]);
        ctx.strokeStyle = '#2ee6c5'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(46,230,197,.9)'; ctx.shadowBlur = 9;
        ctx.stroke();
        ctx.beginPath(); ctx.arc(tip[0], tip[1], 3.6, 0, Math.PI * 2);
        ctx.fillStyle = '#7ff5df'; ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        const pulse = 3.5 + Math.sin(yaw * 6) * 1.4;
        ctx.beginPath(); ctx.arc(ox, oy, pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,.30)'; ctx.fill();
        ctx.beginPath(); ctx.arc(ox, oy, R * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1; ctx.stroke();
      }
    });
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
}

/* ----------------------------------------------------------------- events */
function syncQubitSeg() {
  document.querySelectorAll('#qubitSeg button').forEach((b) => {
    b.classList.toggle('on', +b.dataset.n === S.n);
  });
}

document.querySelectorAll('#qubitSeg button').forEach((b) => {
  b.onclick = () => {
    S.n = +b.dataset.n;
    S.gates = S.gates.filter((g) => g.qubits.every((q) => q < S.n));
    syncQubitSeg(); renderBoard(); run();
  };
});

document.querySelectorAll('.lang button').forEach((b) => {
  b.onclick = () => {
    lang = b.dataset.lang;
    localStorage.setItem('plainq.lang', lang);
    applyStatic();
  };
});

$('clearBtn').onclick = () => { S.gates = []; S.sel = null; renderPalette(); renderBoard(); run(); };

$('glossaryBtn').onclick = () => {
  const t = L();
  $('glossary').innerHTML = t.glossary.map(([en, zh, body]) => `
    <div class="term">
      <h4>${en}<span>${zh}</span></h4>
      <p>${body}</p>
    </div>`).join('');
  $('modal').hidden = false;
};
$('modalClose').onclick = () => { $('modal').hidden = true; };
$('modal').onclick = (e) => { if (e.target.id === 'modal') $('modal').hidden = true; };
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { $('modal').hidden = true; S.sel = null; renderPalette(); renderBoard(); }
  if (e.key === 'Backspace' && !/input|textarea/i.test(e.target.tagName)) {
    e.preventDefault();
    if (S.gates.length) { S.gates.pop(); renderBoard(); run(); }
  }
});

/* ------------------------------------------------------------------- init */
const qs = new URLSearchParams(location.search);
if (I18N[qs.get('lang')]) lang = qs.get('lang');
applyStatic();
syncQubitSeg();
const story = qs.get('story');
if (story) loadStory(story); else run();
