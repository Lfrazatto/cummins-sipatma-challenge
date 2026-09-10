from pathlib import Path

path = Path('/home/ubuntu/cummins-sipatma-challenge/client/src/App.tsx')
text = path.read_text()
old = '<strong>{spot.label}</strong><small>{foundErrors.includes(spot.id) ? spot.note : "Risco ainda não identificado"}</small>'
new = '<strong>{foundErrors.includes(spot.id) ? spot.label : `Anomalia ${errorHotspots.indexOf(spot) + 1}`}</strong><small>{foundErrors.includes(spot.id) ? spot.note : "Observe a cena e encontre este risco"}</small>'
if old not in text:
    raise SystemExit("target label markup not found")
path.write_text(text.replace(old, new, 1))
