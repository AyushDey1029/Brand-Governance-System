from fastapi import FastAPI
import traceback
import os
import sys

app = FastAPI()

try:
    ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    BACKEND_DIR = os.path.join(ROOT_DIR, "backend-api")
    if BACKEND_DIR not in sys.path:
        sys.path.insert(0, BACKEND_DIR)

    from app.main import app as main_app
    app = main_app
except Exception as e:
    err_str = str(e)
    tb_str = traceback.format_exc()
    
    @app.get("/health")
    def health_debug():
        return {"status": "error", "error": err_str, "traceback": tb_str}
    
    @app.get("/api/test")
    def test_debug():
        return {"status": "error", "error": err_str, "traceback": tb_str}
