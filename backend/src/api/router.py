from fastapi import APIRouter
from .endpoints import health

api = APIRouter()

api.include_router(health.router, prefix="", tags=["health"])