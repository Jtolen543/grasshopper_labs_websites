from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseSettings):
    ORIGINS: list[str] = []
    UPLOAD_DIR: str = "static/uploads"

    def makeDirectories(self):
        os.makedirs(self.UPLOAD_DIR, exist_ok=True)


settings = Settings()
settings.makeDirectories()