"""
Nawgati Run - Start both backend (FastAPI) and frontend (Next.js) concurrently.
Works on Windows, macOS, and Linux.
"""

import os
import sys
import signal
import subprocess
import platform
import time
import shutil
from pathlib import Path

class Colors:
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    CYAN = "\033[96m"
    MAGENTA = "\033[95m"
    BOLD = "\033[1m"
    END = "\033[0m"

def log(prefix, color, msg):
    print(f"{color}[{prefix}]{Colors.END} {msg}")

def get_project_root():
    return Path(__file__).parent.parent.resolve()

processes = []

def cleanup(signum=None, frame=None):
    """Gracefully shutdown all processes."""
    log("NAWGATI", Colors.YELLOW, "Shutting down services...")
    for p in processes:
        try:
            p.terminate()
            p.wait(timeout=5)
        except Exception:
            try:
                p.kill()
            except Exception:
                pass
    log("NAWGATI", Colors.GREEN, "All services stopped.")
    sys.exit(0)

def run_all():
    """Start both backend and frontend."""
    print(f"""
{Colors.BOLD}{Colors.CYAN}
╔══════════════════════════════════════════════════════════╗
║              🚀 NAWGATI RUN                              ║
║  Starting Backend (FastAPI) + Frontend (Next.js)         ║
╚══════════════════════════════════════════════════════════╝
{Colors.END}""")

    root = get_project_root()
    os_info = platform.system().lower()
    is_windows = os_info == "windows"

    # Determine paths
    if is_windows:
        python_path = root / ".venv" / "Scripts" / "python.exe"
    else:
        python_path = root / ".venv" / "bin" / "python"

    if not python_path.exists():
        # Fall back to the current Python interpreter
        python_path = Path(sys.executable)
        log("BACKEND", Colors.YELLOW, f"No .venv found. Using system Python: {python_path}")

    backend_dir = root / "backend"
    frontend_dir = root / "frontend"

    # Register signal handlers
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)
    if not is_windows:
        signal.signal(signal.SIGHUP, cleanup)

    # Start Backend
    log("BACKEND", Colors.MAGENTA, "Starting FastAPI server on port 8000...")
    backend_env = os.environ.copy()
    backend_env["PYTHONPATH"] = str(backend_dir)

    backend_proc = subprocess.Popen(
        [str(python_path), "-m", "uvicorn", "main:app",
         "--host", "0.0.0.0", "--port", "8000", "--reload"],
        cwd=str(backend_dir),
        env=backend_env,
    )
    processes.append(backend_proc)
    log("BACKEND", Colors.GREEN, "FastAPI server starting at http://localhost:8000")

    # Give backend a moment to start
    time.sleep(2)

    # Start Frontend
    npm_cmd = shutil.which("npm")
    if npm_cmd and (frontend_dir / "package.json").exists():
        log("FRONTEND", Colors.CYAN, "Starting Next.js dev server on port 3000...")
        frontend_proc = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=str(frontend_dir),
            shell=is_windows,
        )
        processes.append(frontend_proc)
        log("FRONTEND", Colors.GREEN, "Next.js server starting at http://localhost:3000")
    else:
        log("FRONTEND", Colors.YELLOW, "Frontend not ready (missing package.json or npm). Skipping.")

    print(f"""
{Colors.BOLD}{Colors.GREEN}
╔══════════════════════════════════════════════════════════╗
║  ✅ All services running                                 ║
║                                                          ║
║  Backend:  http://localhost:8000                         ║
║  API Docs: http://localhost:8000/docs                    ║
║  Frontend: http://localhost:3000                         ║
║                                                          ║
║  Press Ctrl+C to stop all services                       ║
╚══════════════════════════════════════════════════════════╝
{Colors.END}""")

    # Wait for processes
    try:
        while True:
            for p in processes:
                retcode = p.poll()
                if retcode is not None:
                    log("NAWGATI", Colors.RED, f"A process exited with code {retcode}")
            time.sleep(1)
    except KeyboardInterrupt:
        cleanup()
