from fastapi import APIRouter, HTTPException
from services.sign_language.mapping import map_tokens_to_gestures
from typing import Dict, List
import logging

router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/translate_signs", response_model=Dict[str, List[str]])
async def translate_signs(data: Dict[str, List[str]]):
    """
    Translate a list of tokens to a sequence of gesture IDs.
    Expects a JSON body: {"tokens": ["i", "want", "water"]}
    Returns: {"gestures": ["gesture_002", "gesture_003", "gesture_004"]}
    """
    if not data or "tokens" not in data:
        raise HTTPException(status_code=400, detail="No tokens provided")
    tokens = data["tokens"]
    if not isinstance(tokens, list) or not all(isinstance(t, str) for t in tokens):
        raise HTTPException(status_code=400, detail="Tokens must be a list of strings")
    gestures = map_tokens_to_gestures(tokens)
    return {"gestures": gestures} 