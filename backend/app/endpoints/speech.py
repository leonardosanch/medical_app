from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import os

from ..services.speech_recognition import transcribe_audio, transcribe_audio_base64
from ..services.text_to_speech_service import text_to_speech

router = APIRouter()

class TranscriptionRequest(BaseModel):
    audio_base64: str
    format: Optional[str] = "wav"

class TranscriptionResponse(BaseModel):
    text: str

class TextToSpeechRequest(BaseModel):
    text: str
    language: str = "en"

@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe(request: TranscriptionRequest):
    """
    Endpoint to transcribe audio in base64 format to text.
    """
    try:
        text = transcribe_audio_base64(request.audio_base64, request.format)
        return TranscriptionResponse(text=text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/transcribe/upload")
async def transcribe_upload(file: UploadFile = File(...)):
    """
    Endpoint to transcribe an uploaded audio file.
    """
    try:
        # Save the file temporarily
        temp_file_path = f"/tmp/{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Transcribe the audio
        text = transcribe_audio(temp_file_path)
        
        # Clean up the temporary file
        os.remove(temp_file_path)
        
        return TranscriptionResponse(text=text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/text-to-speech")
async def generate_speech(request: TextToSpeechRequest):
    """
    Endpoint to convert text to speech.
    """
    try:
        audio_path = text_to_speech(request.text, request.language)
        return FileResponse(
            audio_path, 
            media_type="audio/wav",
            headers={"Content-Disposition": f"attachment; filename=speech.wav"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))