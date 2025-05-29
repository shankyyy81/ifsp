# Minimal sign language gesture mapping

from .gesture_map import GESTURE_MAP

def map_tokens_to_gestures(tokens):
    """
    Map a list of tokens to gesture video file paths using the GESTURE_MAP.
    Unmapped tokens are ignored.
    """
    gestures = []
    for token in tokens:
        if token in GESTURE_MAP:
            gestures.extend(GESTURE_MAP[token])
    return gestures 