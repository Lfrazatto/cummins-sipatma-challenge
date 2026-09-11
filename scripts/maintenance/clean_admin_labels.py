from pathlib import Path

path = Path('/home/ubuntu/cummins-sipatma-challenge/client/src/App.tsx')
text = path.read_text()
replacements = {
    'banco diversificado': 'foco em segurança e cuidado',
    '<span>12 perguntas</span>': '<span>16 perguntas</span>',
    '<div><strong>Segurança</strong><span>15 perguntas</span></div>': '<div><strong>Segurança e cuidado</strong><span>12 perguntas</span></div>',
    '<div><strong>Lean Manufacturing</strong><span>15 perguntas</span></div>': '<div><strong>Prevenção de riscos</strong><span>Na trilha SIPATMA</span></div>',
    '<div><strong>Meio ambiente</strong><span>10 perguntas</span></div>': '<div><strong>Atitudes responsáveis</strong><span>Na trilha SIPATMA</span></div>',
    '<div><strong>5S / Kaizen / Kanban</strong><span>20 perguntas</span></div>': '<div><strong>Cultura de segurança</strong><span>Na trilha SIPATMA</span></div>',
    '<strong>Identifique o desperdício no fluxo</strong><small>Lean Manufacturing • Difícil • 400 pts</small>': '<strong>Qual atitude demonstra cuidado com um colega?</strong><small>Segurança • Fácil • 100 pts</small>',
}
for old, new in replacements.items():
    text = text.replace(old, new)
path.write_text(text)
