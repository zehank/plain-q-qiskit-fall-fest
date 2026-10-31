#!/usr/bin/env python3
"""Plain Q — a quantum circuit that explains itself.

Backend: Qiskit Statevector simulation (exact, no sampling error).
Frontend: static/ (vanilla HTML+CSS+JS, no build step, no CDN).

Run:  python3 server.py [port]
      HOST=0.0.0.0 PORT=8080 python3 server.py     # when something else hosts it
"""
import json
import math
import os
import sys
import time
import warnings
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

warnings.filterwarnings("ignore", message="Using Qiskit with Python 3.9")

import qiskit  # noqa: E402
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, partial_trace

HERE = Path(__file__).resolve().parent
STATIC = HERE / "static"

MAX_QUBITS = 3
MAX_GATES = 8
SHOTS = 1024
# name -> number of qubits it touches
GATES = {"h": 1, "x": 1, "z": 1, "cx": 2}


def _binary_entropy(p):
    if p <= 1e-12 or p >= 1 - 1e-12:
        return 0.0
    return -p * math.log2(p) - (1 - p) * math.log2(1 - p)


def _analyse(sv, n):
    """Probabilities over all 2^n outcomes + the Bloch state of every qubit."""
    probs = [float(p) for p in sv.probabilities()]
    qubits = []
    for q in range(n):
        rho = partial_trace(sv, [i for i in range(n) if i != q]).data
        x = 2.0 * float(rho[0, 1].real)
        y = -2.0 * float(rho[0, 1].imag)
        z = float(rho[0, 0].real - rho[1, 1].real)
        r = math.sqrt(x * x + y * y + z * z)
        # the state is always pure here (unitary gates only), so a mixed
        # reduced state *is* entanglement with the other qubits.
        qubits.append({"x": x, "y": y, "z": z, "r": r, "entropy": _binary_entropy((1 - r) / 2)})
    return probs, qubits


def _validate(req):
    n = int(req.get("n", 2))
    if not 1 <= n <= MAX_QUBITS:
        raise ValueError(f"n must be 1..{MAX_QUBITS}")
    raw = req.get("gates") or []
    if not isinstance(raw, list):
        raise ValueError("gates must be a list")
    if len(raw) > MAX_GATES:
        raise ValueError(f"at most {MAX_GATES} gates")
    gates = []
    for g in raw:
        name = str(g.get("gate", "")).lower()
        if name not in GATES:
            raise ValueError(f"unknown gate: {name}")
        qubits = [int(q) for q in (g.get("qubits") or [])]
        if len(qubits) != GATES[name]:
            raise ValueError(f"{name} needs {GATES[name]} qubit(s)")
        if len(set(qubits)) != len(qubits):
            raise ValueError("gate uses the same qubit twice")
        if any(q < 0 or q >= n for q in qubits):
            raise ValueError("qubit index out of range")
        gates.append({"gate": name, "qubits": qubits})
    return n, gates


def simulate(n, gates):
    qc = QuantumCircuit(n)
    steps = []
    for g in gates:
        getattr(qc, g["gate"])(*g["qubits"])
        probs, qubits = _analyse(Statevector.from_instruction(qc), n)
        steps.append({"gate": g["gate"], "qubits": g["qubits"], "probs": probs, "qubits_state": qubits})

    final = Statevector.from_instruction(qc)
    probs, qubits = _analyse(final, n)

    sampler = Statevector.from_instruction(qc)
    sampler.seed(7)
    counts = {str(k): int(v) for k, v in sampler.sample_counts(SHOTS).items()}

    return {
        "n": n,
        "gates": gates,
        "probs": probs,
        "qubits": qubits,
        "steps": steps,
        "counts": counts,
        "shots": SHOTS,
        "amplitudes": [[float(a.real), float(a.imag)] for a in final.data],
        "engine": f"qiskit {qiskit.__version__} · Statevector (exact)",
    }


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC), **kwargs)

    def log_message(self, fmt, *args):
        sys.stderr.write("  " + (fmt % args) + "\n")

    def _json(self, payload, status=200):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        route = self.path.split("?")[0]
        if route != "/api/simulate":
            self._json({"error": "not found"}, 404)
            return
        length = int(self.headers.get("Content-Length") or 0)
        try:
            req = json.loads(self.rfile.read(length) or b"{}")
            n, gates = _validate(req)
            t0 = time.perf_counter()
            out = simulate(n, gates)
            out["ms"] = round((time.perf_counter() - t0) * 1000, 2)
        except (ValueError, TypeError) as exc:
            self._json({"error": str(exc)}, 400)
            return
        except Exception as exc:  # noqa: BLE001 - surface real errors to the UI
            self._json({"error": f"{type(exc).__name__}: {exc}"}, 500)
            return
        self._json(out)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("-")]

    # Locally this stays 127.0.0.1 — nothing outside the machine can reach it.
    # A host that serves the app publicly (Render, Fly, a VPS) sets HOST=0.0.0.0
    # and PORT=<whatever it assigned>; neither changes the local behaviour.
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(args[0]) if args else int(os.environ.get("PORT", 8765))

    server = ThreadingHTTPServer((host, port), Handler)
    shown = "127.0.0.1" if host in ("0.0.0.0", "::") else host
    url = f"http://{shown}:{port}/"
    print(f"\n  Plain Q  ->  {url}   (bound to {host}:{port})\n  Ctrl-C to stop.\n")
    if host == "127.0.0.1" and "--no-open" not in sys.argv:
        try:
            webbrowser.open(url)
        except Exception:
            pass
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  bye.\n")


if __name__ == "__main__":
    main()
