from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.endpoints import health, resume

def create_app():
    app = FastAPI()
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(health.router, prefix="/api/health", tags=["health"])
    app.include_router(resume.router, prefix="/api/resume", tags=["resume"])

    return app