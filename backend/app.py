from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import speech, nlp, sign_translation

app = FastAPI(title="Speech to Sign Language API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(speech.router, prefix="/api/v1", tags=["speech"])
app.include_router(nlp.router, prefix="/api/v1/nlp", tags=["nlp"])
app.include_router(sign_translation.router, prefix="/api/v1", tags=["sign_translation"])

@app.get("/")
async def root():
    return {"message": "Speech to Sign Language API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 