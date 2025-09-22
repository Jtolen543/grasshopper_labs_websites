from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
from config import settings
from ...utils.resume_parser import ResumeParser
import uuid

router = APIRouter()
parser = ResumeParser()

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    try:
        # Get upload directory from settings
        upload_dir = Path(settings.STATIC_DIR) / "uploads"
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            return JSONResponse(
                content={"error": "Only PDF files are allowed"},
                status_code=400
            )
        
        # Save the file
        original_filename = file.filename
        unique_filename = f"{uuid.uuid4()}.pdf"
        file_path = upload_dir / unique_filename
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
            
        # Parse the uploaded resume
        parsed_data = parser.extract_fields(file_path)
        
        return JSONResponse(
            content={
                "message": "Resume uploaded and parsed successfully",
                "original_filename": original_filename,
                "stored_filename": unique_filename,
                "parsed_data": parsed_data
            },
            status_code=200
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )