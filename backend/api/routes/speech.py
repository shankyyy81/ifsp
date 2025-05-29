from fastapi import APIRouter, UploadFile, File, HTTPException
from services.speech_recognition.transcriber import Transcriber
from typing import Dict
import logging

router = APIRouter()
transcriber = Transcriber()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/transcribe", response_model=Dict[str, str])
async def transcribe_audio(audio_file: UploadFile = File(...)):
    """
    Transcribe audio file to text with enhanced error handling
    """
    if not audio_file:
        raise HTTPException(status_code=400, detail="No audio file provided")
    
    if not audio_file.content_type.startswith('audio/'):
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type: {audio_file.content_type}. Only audio files are accepted."
        )

    try:
        # Read audio file
        audio_data = await audio_file.read()
        
        if not audio_data:
            raise HTTPException(status_code=400, detail="Empty audio file")
        
        # Save audio to temporary file
        temp_file_path = await transcriber.save_audio_file(audio_data)
        
        try:
            # Transcribe audio
            text = await transcriber.transcribe_audio(temp_file_path)
            
            if not text or text.strip() == "":
                raise HTTPException(
                    status_code=422,
                    detail="Could not transcribe audio. Please ensure clear speech and try again."
                )
                
            return {"text": text}
            
        except Exception as e:
            logger.error(f"Transcription error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Error during transcription. Please try again."
            )
        finally:
            # Clean up temporary file
            transcriber.cleanup(temp_file_path)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred. Please try again."
        ) 