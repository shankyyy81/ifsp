import re
import string
from typing import List, Dict
import spacy

class TextProcessor:
    def __init__(self):
        self.punctuation = string.punctuation
        self.nlp = spacy.load("en_core_web_sm")

    def preprocess_text(self, text: str) -> List[str]:
        """
        Preprocess text by:
        1. Converting to lowercase
        2. Removing punctuation
        3. Tokenizing into words
        4. Removing extra whitespace
        
        Args:
            text (str): Input text to preprocess
            
        Returns:
            List[str]: List of preprocessed tokens
        """
        if not text or not isinstance(text, str):
            return []
            
        # Convert to lowercase
        text = text.lower()
        
        # Remove punctuation
        text = text.translate(str.maketrans('', '', self.punctuation))
        
        # Remove extra whitespace and split into tokens
        tokens = re.split(r'\s+', text.strip())
        
        # Remove empty tokens
        tokens = [token for token in tokens if token]
        
        return tokens

    def get_sentence_structure(self, tokens: List[str]) -> List[str]:
        """
        Get basic sentence structure from tokens.
        This is a simplified version that will be enhanced in task 2.2.
        
        Args:
            tokens (List[str]): List of preprocessed tokens
            
        Returns:
            List[str]: List of tokens representing sentence structure
        """
        return tokens  # For now, just return the tokens as is 

    def extract_svo(self, text: str) -> List[str]:
        """
        Extract a minimal subject-verb-object (SVO) structure from the text using spaCy.
        Returns a list like [subject, verb, object] if found, otherwise an empty list.
        """
        doc = self.nlp(text)
        subject = None
        verb = None
        obj = None
        for token in doc:
            if token.dep_ in ("nsubj", "nsubjpass") and subject is None:
                subject = token.text
            if token.pos_ == "VERB" and verb is None:
                verb = token.text
            if token.dep_ in ("dobj", "pobj", "attr") and obj is None:
                obj = token.text
        if subject and verb and obj:
            return [subject, verb, obj]
        # fallback: return whatever is found
        return [t for t in [subject, verb, obj] if t] 