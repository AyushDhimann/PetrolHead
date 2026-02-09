"""
PetrolHead CLI Entry Point
Usage:
    python -m petrolhead setup    # Install all dependencies
    python -m petrolhead run      # Run backend + frontend
"""

import sys
import os

def main():
    if len(sys.argv) < 2:
        print("""
╔══════════════════════════════════════════════════════════╗
║              🚀 PETROLHEAD CLI                           ║
║  Fuel Station Profile Dashboard                          ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Usage:                                                  ║
║    python -m petrolhead setup   → Install all deps      ║
║    python -m petrolhead run     → Start backend+frontend║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
        """)
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == "setup":
        from petrolhead.setup import run_setup
        run_setup()
    elif command == "run":
        from petrolhead.run import run_all
        run_all()
    else:
        print(f"Unknown command: {command}")
        print("Available commands: setup, run")
        sys.exit(1)

if __name__ == "__main__":
    main()
