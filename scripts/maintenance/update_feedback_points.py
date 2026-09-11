from pathlib import Path

path = Path('/home/ubuntu/cummins-sipatma-challenge/client/src/App.tsx')
text = path.read_text()
text = text.replace('score={score} streak={streak}', 'score={score} earnedThisAnswer={earnedThisAnswer} streak={streak}', 1)
text = text.replace('score: number; streak: number }) {', 'score: number; earnedThisAnswer: number; streak: number }) {', 1)
text = text.replace('score, streak }: { difficulty:', 'score, earnedThisAnswer, streak }: { difficulty:', 1)
text = text.replace('Boa! +${formatNumber(difficultyMeta[difficulty].points)} pontos', 'Boa! +${formatNumber(earnedThisAnswer)} pontos')
text = text.replace('Sequência atual:', 'Quanto mais rápido, mais pontos:')
text = text.replace('Você ganha mais pontos com acerto e velocidade. Errar tira uma vida.', 'Você ganha mais pontos quando responde rápido e corretamente.')
path.write_text(text)
