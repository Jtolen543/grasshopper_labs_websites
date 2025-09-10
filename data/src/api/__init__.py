from fastapi import APIRouter
from .endpoints import health

routes = APIRouter()

routes.include_router(health.router, prefix="", tags=["health"])