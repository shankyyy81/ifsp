from fastapi import APIRouter, UploadFile, File, HTTPException
from services.speech_recognition.transcriber import Transcriber
from typing import Dict

router = APIRouter()
transcriber = Transcriber()

@router.post("/transcribe", response_model=Dict[str, str])
async def transcribe_audio(audio_file: UploadFile = File(...)):
    """
    Transcribe audio file to text
    """
    try:
        # Read audio file
        audio_data = await audio_file.read()
        
        # Save audio to temporary file
        temp_file_path = await transcriber.save_audio_file(audio_data)
        
        try:
            # Transcribe audio
            text = await transcriber.transcribe_audio(temp_file_path)
            return {"text": text}
        finally:
            # Clean up temporary file
            transcriber.cleanup(temp_file_path)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 