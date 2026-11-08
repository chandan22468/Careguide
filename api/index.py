import os
import sys
from pathlib import Path

# Add backend directory to sys.path
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Expose the FastAPI app
try:
    from main import app
except ImportError:
    from app.main import app

__all__ = ["app"]

