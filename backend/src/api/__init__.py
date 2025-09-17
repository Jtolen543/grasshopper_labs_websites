from fastapi import APIRouter
from .endpoints import health, resume

routes = APIRouter()

routes.include_router(health.router, prefix="", tags=["health"])
routes.include_router(resume.router, prefix="/resume", tags=["resume"])