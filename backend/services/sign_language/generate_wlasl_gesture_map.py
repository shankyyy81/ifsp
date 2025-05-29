import json
from pathlib import Path

# Path to the WLASL annotation file
ANNOTATION_FILE = Path('/Users/shashanksathish/Desktop/ifsp/WLASL/start_kit/WLASL_v0.3.json')
VIDEO_DIR = Path('/Users/shashanksathish/Desktop/ifsp/WLASL/start_kit/videos')  # Adjust if needed
OUTPUT_FILE = Path('gesture_map.py')

with open(ANNOTATION_FILE, 'r', encoding='utf-8') as f:
    wlasl_data = json.load(f)

gesture_map = {}

for entry in wlasl_data:
    word = entry['gloss'].lower()
    video_files = [str(VIDEO_DIR / (instance['video_id'] + '.mp4')) for instance in entry['instances'] if 'video_id' in instance]
    if video_files:
        gesture_map[word] = video_files

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    f.write('GESTURE_MAP = {\n')
    for word, videos in gesture_map.items():
        f.write(f'    "{word}": {videos},\n')
    f.write('}\n')

print(f"Extracted gesture map for {len(gesture_map)} words.") 