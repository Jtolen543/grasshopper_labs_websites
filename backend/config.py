from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv()

class Settings(BaseSettings):
    ORIGINS: list[str] = []
    UPLOAD_DIR: str = "static/uploads"
    PROJECT_DIR: Path = Path(__file__).parent
    STATIC_DIR: Path = PROJECT_DIR / "static"


    def makeDirectories(self):
        os.makedirs(self.UPLOAD_DIR, exist_ok=True)


settings = Settings()
settings.makeDirectories()