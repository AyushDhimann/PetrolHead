"""
Nawgati CLI Entry Point
Usage:
    python -m nawgati setup    # Install all dependencies
    python -m nawgati run      # Run backend + frontend
"""

import sys
import os

def main():
    if len(sys.argv) < 2:
        print("""
╔══════════════════════════════════════════════════════════╗
║              🚀 NAWGATI CLI                              ║
║  Fuel Station Profile Dashboard                          ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Usage:                                                  ║
║    python -m nawgati setup   → Install all dependencies  ║
║    python -m nawgati run     → Start backend + frontend  ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
        """)
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == "setup":
        from nawgati.setup import run_setup
        run_setup()
    elif command == "run":
        from nawgati.run import run_all
        run_all()
    else:
        print(f"Unknown command: {command}")
        print("Available commands: setup, run")
        sys.exit(1)

if __name__ == "__main__":
    main()
