"""
Nawgati Setup - Environment setup for all platforms (Windows, macOS, Linux)
Checks for Python venv, Node.js, and installs all dependencies.
"""

import os
import sys
import subprocess
import platform
import shutil
from pathlib import Path

# Color codes for terminal output
class Colors:
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    CYAN = "\033[96m"
    BOLD = "\033[1m"
    END = "\033[0m"

def log_step(msg):
    print(f"{Colors.CYAN}[SETUP]{Colors.END} {msg}")

def log_success(msg):
    print(f"{Colors.GREEN}  ✓{Colors.END} {msg}")

def log_warn(msg):
    print(f"{Colors.YELLOW}  ⚠{Colors.END} {msg}")

def log_error(msg):
    print(f"{Colors.RED}  ✗{Colors.END} {msg}")

def get_project_root():
    """Get the project root directory."""
    return Path(__file__).parent.parent.resolve()

def get_os_info():
    """Get OS-specific information."""
    system = platform.system().lower()
    return {
        "system": system,
        "is_windows": system == "windows",
        "is_mac": system == "darwin",
        "is_linux": system == "linux",
        "python_cmd": sys.executable,
    }

def run_cmd(cmd, cwd=None, capture=True, check=True):
    """Run a shell command."""
    try:
        result = subprocess.run(
            cmd, cwd=cwd, capture_output=capture, text=True,
            check=check, shell=isinstance(cmd, str)
        )
        return result
    except subprocess.CalledProcessError as e:
        log_error(f"Command failed: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
        if e.stderr:
            log_error(e.stderr[:500])
        return None

def check_python():
    """Verify Python version."""
    log_step("Checking Python installation...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 10:
        log_success(f"Python {version.major}.{version.minor}.{version.micro} found")
        return True
    else:
        log_error(f"Python 3.10+ required, found {version.major}.{version.minor}")
        return False

def check_node():
    """Verify Node.js installation."""
    log_step("Checking Node.js installation...")
    node = shutil.which("node")
    if not node:
        log_error("Node.js not found. Please install Node.js 18+ from https://nodejs.org/")
        return False

    result = run_cmd(["node", "--version"])
    if result:
        version = result.stdout.strip()
        log_success(f"Node.js {version} found")
        return True
    return False

def check_npm():
    """Verify npm installation."""
    npm = shutil.which("npm")
    if not npm:
        log_error("npm not found. Please install Node.js which includes npm.")
        return False
    result = run_cmd(["npm", "--version"])
    if result:
        log_success(f"npm {result.stdout.strip()} found")
        return True
    return False

def setup_venv(root):
    """Create or verify Python virtual environment."""
    log_step("Setting up Python virtual environment...")
    os_info = get_os_info()
    venv_path = root / ".venv"

    if os_info["is_windows"]:
        pip_path = venv_path / "Scripts" / "pip.exe"
        python_path = venv_path / "Scripts" / "python.exe"
    else:
        pip_path = venv_path / "bin" / "pip"
        python_path = venv_path / "bin" / "python"

    if venv_path.exists() and pip_path.exists():
        log_success("Virtual environment already exists")
    else:
        if venv_path.exists():
            log_warn("Removing broken venv...")
            shutil.rmtree(venv_path)

        log_step("Creating virtual environment...")
        result = run_cmd([sys.executable, "-m", "venv", str(venv_path)])
        if result is None:
            log_error("Failed to create virtual environment")
            return None
        log_success("Virtual environment created")

    return str(python_path), str(pip_path)

def install_python_deps(pip_path, root):
    """Install Python dependencies."""
    log_step("Installing Python backend dependencies...")
    requirements = root / "backend" / "requirements.txt"

    if not requirements.exists():
        log_error(f"requirements.txt not found at {requirements}")
        return False

    result = run_cmd([pip_path, "install", "-r", str(requirements)])
    if result:
        log_success("Python dependencies installed")
        return True
    else:
        log_error("Failed to install Python dependencies")
        return False

def install_node_deps(root):
    """Install Node.js dependencies for the frontend."""
    log_step("Installing Node.js frontend dependencies...")
    frontend_dir = root / "frontend"
    package_json = frontend_dir / "package.json"

    if not package_json.exists():
        log_error(f"package.json not found at {package_json}")
        return False

    node_modules = frontend_dir / "node_modules"
    if node_modules.exists():
        log_success("node_modules already exists, checking for updates...")

    result = run_cmd(["npm", "install"], cwd=str(frontend_dir))
    if result:
        log_success("Node.js dependencies installed")
        return True
    else:
        log_error("Failed to install Node.js dependencies")
        return False

def check_env_file(root):
    """Check if .env file exists in backend."""
    log_step("Checking environment configuration...")
    env_file = root / "backend" / ".env"

    if env_file.exists():
        log_success(".env file found in backend/")
        return True
    else:
        log_warn(".env file not found in backend/")
        log_warn("Please create backend/.env with your API keys")
        log_warn("See backend/.env.example for reference")
        return False

def create_output_dirs(root):
    """Create necessary output directories."""
    log_step("Creating output directories...")
    dirs = [
        root / "backend" / "outputs" / "research",
        root / "backend" / "outputs" / "converted",
        root / "backend" / "outputs" / "logs",
        root / "backend" / "outputs" / "interactions",
    ]
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)
    log_success("Output directories created")

def run_setup():
    """Main setup function."""
    print(f"""
{Colors.BOLD}{Colors.CYAN}
╔══════════════════════════════════════════════════════════╗
║              🚀 NAWGATI SETUP                            ║
║  Fuel Station Profile Dashboard                          ║
║  Setting up your development environment...              ║
╚══════════════════════════════════════════════════════════╝
{Colors.END}""")

    root = get_project_root()
    os_info = get_os_info()
    log_step(f"Platform: {platform.system()} {platform.release()}")
    log_step(f"Project root: {root}")
    print()

    # Step 1: Check Python
    if not check_python():
        sys.exit(1)

    # Step 2: Check Node.js
    node_ok = check_node()
    npm_ok = check_npm() if node_ok else False
    print()

    # Step 3: Setup venv
    venv_result = setup_venv(root)
    if not venv_result:
        sys.exit(1)
    python_path, pip_path = venv_result
    print()

    # Step 4: Install Python dependencies
    if not install_python_deps(pip_path, root):
        sys.exit(1)
    print()

    # Step 5: Install Node.js dependencies
    if npm_ok:
        install_node_deps(root)
    else:
        log_warn("Skipping Node.js dependencies (Node.js not available)")
    print()

    # Step 6: Check .env
    check_env_file(root)
    print()

    # Step 7: Create output dirs
    create_output_dirs(root)
    print()

    print(f"""
{Colors.GREEN}{Colors.BOLD}
╔══════════════════════════════════════════════════════════╗
║              ✅ SETUP COMPLETE                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Next step: python -m nawgati run                        ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
{Colors.END}""")
