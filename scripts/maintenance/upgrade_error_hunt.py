from pathlib import Path

path = Path('/home/ubuntu/cummins-sipatma-challenge/client/src/App.tsx')
text = path.read_text()
start = text.index('function ErrorHunt(')
end = text.index('\nfunction KanbanBoard', start)
new = r'''function ErrorHunt({ foundErrors, wrongErrorClicks, chooseError, missError }: { foundErrors: string[]; wrongErrorClicks: number; chooseError: (id: string) => void; missError: () => void }) {
  return <div className="error-hunt"><div className="error-instruction"><span><Search size={17} /> Clique na cena onde você identifica uma anomalia.</span><strong>{foundErrors.length}/6 encontrados • {wrongErrorClicks} tentativas erradas</strong></div><div className="factory-board" onClick={missError}><img src="/manus-storage/factory-error-hunt_8a64efc8.png" alt="Cena de fábrica com riscos industriais para investigar" />{errorHotspots.map((spot) => <button key={spot.id} className={foundErrors.includes(spot.id) ? "hotspot found" : "hotspot"} style={{ top: spot.top, left: spot.left }} onClick={(event) => { event.stopPropagation(); chooseError(spot.id); }} aria-label="Investigar esta área">{foundErrors.includes(spot.id) ? <Check size={15} /> : <span />}</button>)}</div><div className="found-list">{errorHotspots.map((spot) => <div key={spot.id} className={foundErrors.includes(spot.id) ? "found-item found" : "found-item"}><span>{foundErrors.includes(spot.id) ? <Check size={13} /> : <span className="empty-dot" />}</span><span><strong>{foundErrors.includes(spot.id) ? spot.label : `Anomalia ${errorHotspots.indexOf(spot) + 1}`}</strong><small>{foundErrors.includes(spot.id) ? spot.note : "Observe a cena e encontre este risco"}</small></span></div>)}</div></div>;
}
'''
text = text[:start] + new + text[end:]
text = text.replace('activeChallenge === "errors" ? <ErrorHunt foundErrors={foundErrors} chooseError={chooseError} />', 'activeChallenge === "errors" ? <ErrorHunt foundErrors={foundErrors} wrongErrorClicks={wrongErrorClicks} chooseError={chooseError} missError={missError} />', 1)
path.write_text(text)
