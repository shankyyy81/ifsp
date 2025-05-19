import whisper
import tempfile
import os

class Transcriber:
    def __init__(self):
        # Load the Whisper model (using the smallest model for faster loading)
        self.model = whisper.load_model("base")
    
    async def transcribe_audio(self, audio_file_path: str) -> str:
        """
        Transcribe audio file to text using Whisper
        """
        try:
            # Transcribe the audio
            result = self.model.transcribe(audio_file_path)
            return result["text"].strip()
        except Exception as e:
            raise Exception(f"Error transcribing audio: {str(e)}")
    
    async def save_audio_file(self, audio_data: bytes) -> str:
        """
        Save audio data to a temporary file
        """
        try:
            # Create a temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
            temp_file.write(audio_data)
            temp_file.close()
            return temp_file.name
        except Exception as e:
            raise Exception(f"Error saving audio file: {str(e)}")
    
    def cleanup(self, file_path: str):
        """
        Clean up temporary audio file
        """
        try:
            if os.path.exists(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(f"Error cleaning up file: {str(e)}") 