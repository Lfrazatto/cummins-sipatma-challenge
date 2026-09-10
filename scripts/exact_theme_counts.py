from pathlib import Path
import re

path = Path('/home/ubuntu/cummins-sipatma-challenge/client/src/App.tsx')
text = path.read_text()
text, removed_safety = re.subn(r'  question\(25, "Segurança".*?\n(?=  question\(33,)', '', text, flags=re.S)
text, removed_five_s = re.subn(r'  question\(69, "5S".*?\n(?=\n\];)', '', text, flags=re.S)
if removed_safety != 1 or removed_five_s != 1:
    raise SystemExit(f'expected one range each, got safety={removed_safety} fiveS={removed_five_s}')
path.write_text(text)
