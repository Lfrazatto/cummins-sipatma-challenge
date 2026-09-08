from pathlib import Path

path = Path('/home/ubuntu/cummins-sipatma-challenge/client/src/App.tsx')
text = path.read_text()

cards_start = text.index('const challengeCards:')
cards_end = text.index('const question =', cards_start)
new_cards = '''const challengeCards: Array<{
  key: ChallengeKey;
  title: string;
  eyebrow: string;
  description: string;
  icon: typeof ShieldCheck;
  tone: string;
  stat: string;
}> = [
  { key: "quiz", title: "Quiz de Segurança", eyebrow: "Conhecimento rápido", description: "Aprenda a reconhecer riscos, cuidar de si e proteger quem trabalha com você.", icon: ShieldCheck, tone: "cyan", stat: "12 perguntas" },
  { key: "errors", title: "Encontre os riscos", eyebrow: "Olhar atento", description: "Observe a fábrica e identifique situações que podem causar acidentes.", icon: Search, tone: "yellow", stat: "6 riscos visuais" },
  { key: "fiveS", title: "Organize e cuide", eyebrow: "Cuidado no posto", description: "Pratique organização, limpeza e disciplina para tornar o trabalho mais seguro.", icon: Grid3X3, tone: "green", stat: "Missão 5S" },
  { key: "environment", title: "Cuide do ambiente", eyebrow: "Responsabilidade", description: "Escolha atitudes que reduzem desperdícios e protegem o meio ambiente.", icon: Leaf, tone: "green", stat: "Impacto positivo" },
];

'''
text = text[:cards_start] + new_cards + text[cards_end:]

bank_start = text.index('const questionBank: Question[] = [')
bank_end = text.index('const initialPlayer', bank_start)
new_bank = '''const questionBank: Question[] = [
  question(1, "Segurança", "safety", "Fácil", "Por que a segurança deve estar presente em cada atividade?", ["Para cumprir uma regra sem pensar", "Para proteger pessoas, processo e ambiente", "Somente para evitar advertências", "Porque deixa o trabalho mais lento"], 1, "Segurança é um compromisso diário para que todos voltem bem para casa e para que o processo seja confiável."),
  question(2, "Segurança", "safety", "Fácil", "Você percebe um risco de acidente no seu caminho. O que deve fazer primeiro?", ["Ignorar se ninguém se machucou", "Sinalizar, afastar as pessoas e comunicar o responsável", "Passar rapidamente pelo local", "Esperar alguém resolver"], 1, "Agir ao perceber o risco evita que outra pessoa se machuque. Sinalizar e comunicar são atitudes de cuidado."),
  question(3, "Segurança", "safety", "Fácil", "Qual atitude demonstra cuidado com um colega?", ["Deixar que ele descubra o risco sozinho", "Alertar com respeito e ajudar a encontrar uma forma segura", "Fazer a tarefa no lugar dele sem avisar", "Brincar para aliviar a situação"], 1, "Cuidar é intervir com respeito, reforçar o comportamento seguro e buscar ajuda quando necessário."),
  question(4, "Segurança", "safety", "Fácil", "Antes de começar uma tarefa diferente, é importante:", ["Começar logo para ganhar tempo", "Entender os riscos, o procedimento e os controles necessários", "Copiar o colega sem perguntar", "Usar qualquer ferramenta disponível"], 1, "Preparação e entendimento dos riscos reduzem improvisos e ajudam a escolher os controles corretos."),
  question(5, "Segurança", "safety", "Médio", "Por que o uso correto do EPI é importante?", ["Porque substitui todos os outros controles", "Porque ajuda a reduzir a exposição ao risco quando usado corretamente", "Porque serve apenas para visitantes", "Porque elimina a necessidade de treinamento"], 1, "O EPI é uma barreira importante, mas deve complementar controles coletivos, procedimentos e comportamento seguro."),
  question(6, "Segurança", "safety", "Médio", "Ao encontrar uma proteção de máquina removida, você deve:", ["Continuar se a máquina parecer lenta", "Parar a atividade e comunicar conforme o procedimento", "Colocar uma fita e seguir", "Pedir para alguém ficar olhando"], 1, "Uma proteção removida pode expor energia perigosa. A atividade deve ser controlada antes de continuar."),
  question(7, "Segurança", "safety", "Médio", "O que um quase-acidente pode ensinar à equipe?", ["Que nada precisa ser feito", "Onde fortalecer barreiras antes que ocorra uma lesão", "Quem deve ser punido", "Que os registros são desnecessários"], 1, "Quase-acidentes são oportunidades de aprendizado e prevenção antes que uma consequência mais grave aconteça."),
  question(8, "Segurança", "safety", "Médio", "Em uma emergência, a atitude mais segura é:", ["Correr sem avisar ninguém", "Seguir o plano, a sinalização e as orientações da brigada", "Voltar para buscar objetos pessoais", "Usar qualquer saída, mesmo bloqueada"], 1, "Planos de emergência, rotas sinalizadas e brigada orientam uma saída segura e coordenada."),
  question(9, "Segurança", "safety", "Difícil", "Ao manipular um produto sem identificação, qual é a decisão correta?", ["Cheirar para descobrir o que é", "Isolar, não manipular e acionar o responsável", "Misturar com água", "Usar uma pequena quantidade"], 1, "Sem identificação não é possível controlar a exposição. O material deve ser isolado e tratado por pessoa autorizada."),
  question(10, "Segurança", "safety", "Difícil", "Uma mudança no processo pode criar novos riscos. Antes de iniciar, a equipe deve:", ["Produzir uma peça e observar depois", "Revisar a análise de risco e validar os controles", "Remover a sinalização antiga", "Esperar um incidente"], 1, "A gestão de mudanças ajuda a antecipar riscos e confirmar que os controles continuam eficazes."),
  question(11, "Segurança", "safety", "Difícil", "Qual comportamento fortalece uma cultura de segurança?", ["Ficar em silêncio para não atrasar", "Falar sobre riscos, ouvir as pessoas e agir para melhorar", "Deixar decisões somente para a liderança", "Valorizar apenas velocidade"], 1, "Uma cultura forte combina diálogo, escuta, responsabilidade compartilhada e melhoria contínua."),
  question(12, "Segurança", "safety", "Difícil", "O que significa colocar a segurança em primeiro lugar?", ["Paralisar todas as atividades", "Tomar decisões sem aceitar atalhos que exponham pessoas a riscos", "Produzir menos em qualquer situação", "Usar mais equipamentos sem avaliar a necessidade"], 1, "Segurança em primeiro lugar significa planejar, controlar riscos e não normalizar desvios para cumprir metas."),
];

'''
text = text[:bank_start] + new_bank + text[bank_end:]

text = text.replace('60+ perguntas no banco', '12 perguntas de segurança')
text = text.replace('08 desafios disponíveis', '04 caminhos de cuidado')
text = text.replace('O desafio corporativo que transforma segurança, sustentabilidade e Lean em uma experiência de jogo.', 'Uma experiência prática para aprender segurança, cuidado e responsabilidade na SIPATMA.')
text = text.replace('Escolha seu próximo desafio', 'Escolha como quer aprender')
text = text.replace('Central de missões', 'Escolha uma missão')
text = text.replace('const category = challenge === "quiz" ? undefined :', 'const category = challenge === "quiz" ? undefined :')
text = text.replace('questionBank.filter((item) => item.difficulty === player.difficulty && (!category || item.category === category))', 'questionBank.filter((item) => item.difficulty === player.difficulty && (!category || item.category === category || (challenge === "quiz" && item.mode === "safety")))')
text = text.replace('<button className={page === "play" ? "active" : ""} onClick={() => go(player.name === "Visitante" ? "setup" : "play")}>Jogar</button>', '<button className={page === "play" ? "active" : ""} onClick={() => go(player.name === "Visitante" ? "setup" : "play")}>Jogar agora</button>')
text = text.replace('<button className={page === "learn" ? "active" : ""} onClick={() => go("learn")}>Aprenda</button>', '<button className={page === "learn" ? "active" : ""} onClick={() => go("learn")}>Aprender</button>')
text = text.replace('{sidebarOpen && <div className="mobile-nav"><button onClick={() => go("home")}>Início</button><button onClick={() => go(player.name === "Visitante" ? "setup" : "play")}>Jogar</button><button onClick={() => go("ranking")}>Ranking</button><button onClick={() => go("learn")}>Aprenda</button><button onClick={() => go("profile")}>Meu perfil</button></div>}', '{sidebarOpen && <div className="mobile-nav"><div className="mobile-nav-title">MENU PRINCIPAL</div><button onClick={() => go("home")}>Início <small>Visão geral</small></button><button onClick={() => go(player.name === "Visitante" ? "setup" : "play")}>Jogar agora <small>Escolher uma missão</small></button><button onClick={() => go("ranking")}>Ranking <small>Acompanhar resultados</small></button><button onClick={() => go("learn")}>Aprender <small>Conteúdos SIPATMA</small></button><button onClick={() => go("profile")}>Meu perfil <small>Seu progresso</small></button></div>}')
path.write_text(text)
