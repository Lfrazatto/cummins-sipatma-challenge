from pathlib import Path
path = Path('/home/ubuntu/cummins-sipatma-challenge/client/src/App.tsx')
text = path.read_text()
needle = '<button className="danger-action" onClick={resetDemo}><RotateCcw size={16} /><span>Resetar placar local<small>Limpa apenas o ranking deste navegador</small></span><ChevronRight size={15} /></button>'
replacement = needle + '<button className="danger-action" disabled={clearRankings.isPending} onClick={() => { if (window.confirm("Apagar todas as partidas e respostas do ranking real? Esta ação não pode ser desfeita.")) clearRankings.mutate(); }}><X size={16} /><span>{clearRankings.isPending ? "Apagando..." : "Apagar ranking real"}<small>Remove partidas e respostas do banco</small></span><ChevronRight size={15} /></button>'
if needle not in text:
    raise SystemExit('admin action needle not found')
path.write_text(text.replace(needle, replacement, 1))
