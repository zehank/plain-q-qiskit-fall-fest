/* Plain Q — the whole quantum engine, in the browser.

   In the Python build this work happens in server.py on Qiskit. Here it happens
   in the page, so the site is three static files and needs no server at all.

   Same maths, same answers: a statevector of complex amplitudes, H / X / Z /
   CNOT applied as unitary matrices, probabilities read off as |a|^2, and each
   wire's Bloch vector taken from the reduced density matrix. Two or three wires
   means at most eight amplitudes, so exact arithmetic is cheap.

   Qiskit is not used and is not claimed. The engine line in the footer says so. */

const Sim = (() => {
  const MAX_QUBITS = 3;
  const MAX_GATES = 8;
  const SHOTS = 1024;
  const GATES = { h: 1, x: 1, z: 1, cx: 2 };
  const SQ2 = Math.SQRT1_2;

  // complex numbers as [re, im]
  const zero = () => [0, 0];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  // H, X and Z all have real entries, so one scalar multiplier covers them
  const scale = (c, z) => [c * z[0], c * z[1]];

  function validate(req) {
    const n = Number(req.n);
    if (!Number.isInteger(n) || n < 1 || n > MAX_QUBITS) throw new Error(`n must be 1..${MAX_QUBITS}`);
    const raw = req.gates || [];
    if (!Array.isArray(raw)) throw new Error('gates must be a list');
    if (raw.length > MAX_GATES) throw new Error(`at most ${MAX_GATES} gates`);
    const gates = raw.map((g) => {
      const name = String(g.gate || '').toLowerCase();
      if (!GATES[name]) throw new Error(`unknown gate: ${name}`);
      const qubits = (g.qubits || []).map(Number);
      if (qubits.length !== GATES[name]) throw new Error(`${name} needs ${GATES[name]} qubit(s)`);
      if (new Set(qubits).size !== qubits.length) throw new Error('gate uses the same qubit twice');
      if (qubits.some((q) => q < 0 || q >= n)) throw new Error('qubit index out of range');
      return { gate: name, qubits };
    });
    return { n, gates };
  }

  // one-qubit unitary, applied to the pair (index without bit q, index with bit q)
  function applyOne(psi, n, q, u) {
    const bit = 1 << q;
    for (let i = 0; i < psi.length; i += 1) {
      if (i & bit) continue;
      const a = psi[i];
      const b = psi[i | bit];
      psi[i] = add(scale(u[0], a), scale(u[1], b));
      psi[i | bit] = add(scale(u[2], a), scale(u[3], b));
    }
  }

  // control flips the target's bit — a permutation of the amplitudes
  function applyCx(psi, n, control, target) {
    const cBit = 1 << control;
    const tBit = 1 << target;
    const out = new Array(psi.length);
    for (let i = 0; i < psi.length; i += 1) {
      out[i] = psi[i & cBit ? i ^ tBit : i];
    }
    for (let i = 0; i < psi.length; i += 1) psi[i] = out[i];
  }

  const U = {
    h: [SQ2, SQ2, SQ2, -SQ2],
    x: [0, 1, 1, 0],
    z: [1, 0, 0, -1],
  };

  function binaryEntropy(p) {
    if (p <= 1e-12 || p >= 1 - 1e-12) return 0;
    return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
  }

  // probabilities plus, per wire, the Bloch vector of its reduced state
  function analyse(psi, n) {
    const probs = psi.map((a) => a[0] * a[0] + a[1] * a[1]);
    const qubits = [];
    for (let q = 0; q < n; q += 1) {
      const bit = 1 << q;
      let r00 = 0, r11 = 0, r01re = 0, r01im = 0;
      for (let i = 0; i < psi.length; i += 1) {
        const p = psi[i][0] * psi[i][0] + psi[i][1] * psi[i][1];
        if (i & bit) r11 += p; else r00 += p;
      }
      // rho_01 = sum over the other wires of psi[0,k] * conj(psi[1,k])
      for (let i = 0; i < psi.length; i += 1) {
        if (i & bit) continue;
        const a = psi[i];          // this wire = 0
        const b = psi[i | bit];    // this wire = 1
        // a * conj(b)
        r01re += a[0] * b[0] + a[1] * b[1];
        r01im += a[1] * b[0] - a[0] * b[1];
      }
      const x = 2 * r01re;
      const y = -2 * r01im;
      const z = r00 - r11;
      const r = Math.sqrt(x * x + y * y + z * z);
      qubits.push({ x, y, z, r, entropy: binaryEntropy((1 - r) / 2) });
    }
    return { probs, qubits };
  }

  function sample(probs, shots, seed) {
    let s = seed >>> 0;
    const rand = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
    const counts = {};
    for (let k = 0; k < shots; k += 1) {
      let r = rand();
      let idx = probs.length - 1;
      for (let i = 0; i < probs.length; i += 1) {
        if (r < probs[i]) { idx = i; break; }
        r -= probs[i];
      }
      counts[idx] = (counts[idx] || 0) + 1;
    }
    const out = {};
    Object.keys(counts).forEach((k) => { out[String(k)] = counts[k]; });
    return out;
  }

  function run(req) {
    const started = performance.now();
    const { n, gates } = validate(req);
    const size = 1 << n;

    let psi = Array.from({ length: size }, () => zero());
    psi[0] = [1, 0];

    const steps = [];
    for (const g of gates) {
      if (g.gate === 'cx') applyCx(psi, n, g.qubits[0], g.qubits[1]);
      else applyOne(psi, n, g.qubits[0], U[g.gate]);
      const a = analyse(psi, n);
      steps.push({ gate: g.gate, qubits: g.qubits, probs: a.probs, qubits_state: a.qubits });
    }

    const final = analyse(psi, n);
    return {
      n,
      gates,
      probs: final.probs,
      qubits: final.qubits,
      steps,
      counts: sample(final.probs, SHOTS, 7),
      shots: SHOTS,
      amplitudes: psi.map((a) => [a[0], a[1]]),
      engine: 'javascript statevector · exact (same maths as the Qiskit backend)',
      ms: Math.round((performance.now() - started) * 100) / 100,
    };
  }

  return { run, validate };
})();
