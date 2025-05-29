from fastapi import APIRouter, HTTPException
from services.nlp.text_processor import TextProcessor
from typing import Dict, List
import logging

router = APIRouter()
text_processor = TextProcessor()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/process", response_model=Dict[str, List[str]])
async def process_text(text: Dict[str, str]):
    """
    Process text through NLP pipeline:
    1. Preprocess text (lowercase, remove punctuation, tokenize)
    2. Get basic sentence structure
    
    Args:
        text (Dict[str, str]): Dictionary containing 'text' key with input text
        
    Returns:
        Dict[str, List[str]]: Dictionary containing processed tokens and structure
    """
    if not text or 'text' not in text:
        raise HTTPException(status_code=400, detail="No text provided")
        
    input_text = text['text']
    
    try:
        # Preprocess text
        tokens = text_processor.preprocess_text(input_text)
        
        if not tokens:
            raise HTTPException(
                status_code=422,
                detail="No valid tokens found after preprocessing"
            )
            
        # Get sentence structure
        structure = text_processor.get_sentence_structure(tokens)

        # Extract SVO structure
        svo = text_processor.extract_svo(input_text)

        return {
            "tokens": tokens,
            "structure": structure,
            "svo": svo
        }
        
    except Exception as e:
        logger.error(f"Error processing text: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error processing text. Please try again."
        ) 