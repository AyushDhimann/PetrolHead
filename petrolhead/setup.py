"""
PetrolHead Setup - Environment setup for all platforms (Windows, macOS, Linux)
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

def prompt_for_credentials():
    """Prompt user for API credentials."""
    print(f"""
{Colors.BOLD}{Colors.YELLOW}
╔══════════════════════════════════════════════════════════╗
║              🔐 CREDENTIALS SETUP                        ║
║  You'll need API keys for the system to function         ║
╚══════════════════════════════════════════════════════════╝
{Colors.END}""")

    credentials = {}

    print(f"\n{Colors.BOLD}Google Gemini API{Colors.END}")
    print(f"  Required for AI-powered research")
    print(f"  Get key: https://aistudio.google.com/apikey")
    credentials["GEMINI_API_KEY"] = input("  Enter GEMINI_API_KEY (press Enter to skip): ").strip()

    print(f"\n{Colors.BOLD}Perplexity API (Optional - for fallback){Colors.END}")
    print(f"  Get key: https://www.perplexity.ai/api")
    credentials["PERPLEXITY_API_KEY"] = input("  Enter PERPLEXITY_API_KEY (press Enter to skip): ").strip()

    print(f"\n{Colors.BOLD}Supabase (Optional - for persistence){Colors.END}")
    print(f"  Get details: https://supabase.com/dashboard")
    print(f"  You'll need to create tables using: backend/database.sql")
    credentials["SUPABASE_URL"] = input("  Enter SUPABASE_URL (press Enter to skip): ").strip()
    credentials["SUPABASE_KEY"] = input("  Enter SUPABASE_KEY (press Enter to skip): ").strip()

    return credentials

def create_env_file(root, credentials):
    """Create .env file in backend directory."""
    log_step("Creating backend/.env file...")
    env_file = root / "backend" / ".env"

    if env_file.exists():
        log_warn("backend/.env already exists")
        overwrite = input("  Overwrite? (y/n): ").strip().lower()
        if overwrite != 'y':
            log_success("Keeping existing backend/.env")
            return True

    env_example = root / "backend" / ".env.example"
    if not env_example.exists():
        log_error(f"backend/.env.example not found")
        return False

    # Read example file and update with user credentials
    with open(env_example, 'r') as f:
        env_content = f.read()

    # Replace placeholders with actual values
    env_content = env_content.replace(
        "GEMINI_API_KEY=your_google_api_key_here",
        f"GEMINI_API_KEY={credentials.get('GEMINI_API_KEY', 'your_google_api_key_here')}"
    )
    env_content = env_content.replace(
        "PERPLEXITY_API_KEY=your_perplexity_key_here",
        f"PERPLEXITY_API_KEY={credentials.get('PERPLEXITY_API_KEY', 'your_perplexity_key_here')}"
    )
    env_content = env_content.replace(
        "SUPABASE_URL=your_supabase_url",
        f"SUPABASE_URL={credentials.get('SUPABASE_URL', 'your_supabase_url')}"
    )
    env_content = env_content.replace(
        "SUPABASE_KEY=your_supabase_anon_key",
        f"SUPABASE_KEY={credentials.get('SUPABASE_KEY', 'your_supabase_anon_key')}"
    )

    with open(env_file, 'w') as f:
        f.write(env_content)

    log_success("backend/.env created")
    return True

def create_env_local_file(root, credentials):
    """Create .env.local file in frontend directory."""
    log_step("Creating frontend/.env.local file...")
    env_local_file = root / "frontend" / ".env.local"

    if env_local_file.exists():
        log_warn("frontend/.env.local already exists")
        overwrite = input("  Overwrite? (y/n): ").strip().lower()
        if overwrite != 'y':
            log_success("Keeping existing frontend/.env.local")
            return True

    env_local_content = f"""
# PetrolHead Frontend Environment
NEXT_PUBLIC_API_URL=http://localhost:6055
GOOGLE_GENERATIVE_AI_API_KEY={credentials.get('GEMINI_API_KEY', 'your_google_api_key_here')}
"""

    with open(env_local_file, 'w') as f:
        f.write(env_local_content.strip())

    log_success("frontend/.env.local created")
    return True

def check_database_setup(root):
    """Notify user about database setup."""
    log_step("Database setup instructions...")
    db_sql = root / "backend" / "database.sql"

    if db_sql.exists():
        log_success("Found backend/database.sql for Supabase schema")
        print(f"""
{Colors.YELLOW}
  If you're using Supabase:
    1. Go to https://supabase.com/dashboard
    2. Create a new project
    3. Run the SQL from backend/database.sql in the SQL editor
    4. Copy the project URL and anon key to backend/.env
{Colors.END}""")
    else:
        log_warn(f"backend/database.sql not found at {db_sql}")

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
║              🚀 PETROLHEAD SETUP                        ║
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

    # Step 6: Prompt for credentials
    credentials = prompt_for_credentials()
    print()

    # Step 7: Create .env and .env.local files
    if not create_env_file(root, credentials):
        log_warn("Failed to create backend/.env, but continuing...")
    print()

    if not create_env_local_file(root, credentials):
        log_warn("Failed to create frontend/.env.local, but continuing...")
    print()

    # Step 8: Check database setup
    check_database_setup(root)
    print()

    # Step 9: Create output dirs
    create_output_dirs(root)
    print()

    print(f"""
{Colors.GREEN}{Colors.BOLD}
╔══════════════════════════════════════════════════════════╗
║              ✅ SETUP COMPLETE                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Next steps:                                             ║
║                                                          ║
║  1. Verify credentials in:                               ║
║     - backend/.env                                       ║
║     - frontend/.env.local                                ║
║                                                          ║
║  2. If using Supabase, run database.sql in the console   ║
║                                                          ║
║  3. Start the application:                               ║
║     python -m petrolhead run                            ║
║                                                          ║
║  Backend:  http://localhost:6055                         ║
║  Frontend: http://localhost:5055                         ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
{Colors.END}""")
