from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Literal
from pathlib import Path

router = APIRouter()

class PreferencesData(BaseModel):
    role: Literal['Software Engineer', 'Data Scientist', 'ML Engineer', 'DevOps Engineer']
    industry: Literal['FinTech', 'Healthcare', 'Defense', 'Tech', 'Consulting']
    location: str

# Create uploads directory relative to the backend folder
UPLOAD_DIR = Path(__file__).parent.parent.parent.parent / "uploads"

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    try:
        # Create uploads directory if it doesn't exist
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        
        # Validate file type
        allowed_types = [".pdf", ".doc", ".docx"]
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail="File type not allowed. Please upload PDF, DOC, or DOCX"
            )
        
        # Save the file
        file_path = UPLOAD_DIR / file.filename
        with file_path.open("wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        return JSONResponse(
            content={"message": "Resume uploaded successfully"},
            status_code=200
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/preferences")
async def save_preferences(preferences: PreferencesData):
    try:
        return JSONResponse(
            content={"message": "Preferences saved successfully"},
            status_code=200
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))