#!/bin/sh
# Plain Q — one command to run.
#   ./run.sh          → http://127.0.0.1:8765
#   ./run.sh 9000     → pick a port
set -e
cd "$(dirname "$0")"

if [ ! -d .venv ]; then
  python3 -m venv .venv
fi

if ! .venv/bin/python -c "import qiskit" 2>/dev/null; then
  echo "installing qiskit (first run only)…"
  .venv/bin/pip install -q --only-binary :all: -r requirements.txt
fi

exec .venv/bin/python server.py "$@"
