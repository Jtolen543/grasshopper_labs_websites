from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from .api.router import api

def create_app() -> FastAPI:
    app = FastAPI()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )

    app.include_router(api, prefix="", tags=["api"])

    return app