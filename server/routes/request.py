import time
from fastapi import APIRouter, Request, UploadFile, File, HTTPException, status
from pydantic import BaseModel

# from controllers import fetch_answer
from configs import limiter
import os
import math
import shutil

router = APIRouter(
    prefix="/api",
    tags=["request"],
)


UPLOAD_DIR = "uploaded_pdfs"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload-pdf")
@limiter.limit("2/60minute")
def upload_pdf(request: Request, file: UploadFile = File(...)):
    try:
        if file.content_type != "application/pdf":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are allowed.",
            )

        # Split filename and extension
        original_name, extension = os.path.splitext(file.filename)
        timestamp = str(math.floor(time.time()))
        file_name = f"{original_name}_{timestamp}{extension}"

        file_location = os.path.join(UPLOAD_DIR, file_name)

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {"message": "PDF uploaded successfully.", "filename": file_name}
    except:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Some Error Occured",
        )
