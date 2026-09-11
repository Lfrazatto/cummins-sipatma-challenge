from pathlib import Path

path = Path('/home/ubuntu/cummins-sipatma-challenge/client/src/App.tsx')
text = path.read_text()
start = text.index('  question(17, "Segurança"')
end = text.index('const sectorOptions = [', start)
block = text[start:end]
text = text[:start] + text[end:]
array_end = text.index('\n];\n\nconst sectorOptions = [')
text = text[:array_end] + '\n' + block.rstrip() + text[array_end:]
path.write_text(text)
