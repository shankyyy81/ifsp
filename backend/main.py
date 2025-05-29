from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import whisper
import tempfile
import os

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3002"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Whisper model
model = whisper.load_model("base")

@app.post("/api/v1/transcribe")
async def transcribe_audio(audio_file: UploadFile = File(...)):
    try:
        # Create a temporary file to store the uploaded audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
            content = await audio_file.read()
            temp_audio.write(content)
            temp_audio_path = temp_audio.name

        # Transcribe the audio using Whisper
        result = model.transcribe(temp_audio_path)
        
        # Clean up the temporary file
        os.unlink(temp_audio_path)
        
        return {"text": result["text"]}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/translate")
async def translate_text(request: Request):
    data = await request.json()
    text = data.get("text", "")
    # Dummy gesture mapping for demonstration
    # In a real app, replace this with actual NLP and gesture mapping logic
    if text:
        tokens = text.lower().split()
        gestures = [f"gesture_{i+1:03d}" for i in range(len(tokens))]
    else:
        gestures = []
    return {"gestures": gestures}

@app.get("/api/v1/gesture/{gesture_id}")
async def get_gesture(gesture_id: str):
    # Dummy gesture data for demonstration
    return {
        "keyframes": [
            {"time": 0, "rotation": {"x": 0, "y": 0, "z": 0}},
            {"time": 500, "rotation": {"x": 180, "y": 0, "z": 0}},  # 180 degrees on X for visibility
            {"time": 1000, "rotation": {"x": 0, "y": 0, "z": 0}},
        ],
        "duration": 1000
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 