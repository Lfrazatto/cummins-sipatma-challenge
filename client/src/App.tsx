import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Factory,
  Flame,
  Gauge,
  Grid3X3,
  Heart,
  Info,
  LayoutDashboard,
  Leaf,
  LockKeyhole,
  Menu,
  PackageCheck,
  Play,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import "./index.css";

type Page = "home" | "play" | "ranking" | "learn" | "achievements" | "profile" | "admin" | "setup";
type Difficulty = "Fácil" | "Médio" | "Difícil";
type Category = "Segurança" | "Meio ambiente" | "Lean Manufacturing" | "5S" | "Kaizen" | "Kanban";
type ChallengeKey = "quiz" | "errors" | "lean" | "fiveS" | "kaizen" | "kanban" | "safety" | "environment";

type Question = {
  id: number;
  category: Category;
  mode: ChallengeKey;
  difficulty: Difficulty;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

type Player = {
  name: string;
  sector: string;
  difficulty: Difficulty;
  totalScore: number;
  games: number;
  correct: number;
  errors: number;
  bestScore: number;
  bestStreak: number;
  highestDifficulty: Difficulty;
  badges: string[];
};

type Leader = { name: string; sector: string; score: number; level: Difficulty };

const accent = {
  cyan: "#18c7ee",
  yellow: "#f8c843",
  green: "#68d391",
};

const difficultyMeta: Record<Difficulty, { points: number; seconds: number; color: string; className: string }> = {
  Fácil: { points: 100, seconds: 60, color: accent.green, className: "easy" },
  Médio: { points: 200, seconds: 45, color: accent.yellow, className: "medium" },
  Difícil: { points: 400, seconds: 30, color: "#ff6b6b", className: "hard" },
};

const initialLeaders: Leader[] = [
  { name: "Camila Ribeiro", sector: "Qualidade", score: 12450, level: "Difícil" },
  { name: "Rafael Souza", sector: "Produção", score: 11820, level: "Difícil" },
  { name: "Bianca Lima", sector: "Engenharia", score: 10490, level: "Médio" },
  { name: "Diego Martins", sector: "Manutenção", score: 9870, level: "Médio" },
  { name: "Fernanda Alves", sector: "Logística", score: 9240, level: "Fácil" },
  { name: "João Pedro", sector: "Administrativo", score: 8410, level: "Fácil" },
  { name: "Marina Costa", sector: "Produção", score: 7920, level: "Médio" },
  { name: "Lucas Ferreira", sector: "Qualidade", score: 7350, level: "Fácil" },
];

const badgeCatalog = [
  { id: "first", icon: "✦", name: "Primeiro Desafio", detail: "Completou o primeiro jogo", color: "cyan" },
  { id: "streak", icon: "⚡", name: "Sequência Perfeita", detail: "Acertou 10 questões seguidas", color: "yellow" },
  { id: "safety", icon: "◈", name: "Guardião da Segurança", detail: "Completou desafios de segurança", color: "cyan" },
  { id: "eco", icon: "♻", name: "Amigo do Meio Ambiente", detail: "Completou desafios ambientais", color: "green" },
  { id: "lean", icon: "▦", name: "Mestre Lean", detail: "Completou desafios Lean", color: "yellow" },
  { id: "fiveS", icon: "5S", name: "Especialista 5S", detail: "Acertou todos os desafios de 5S", color: "cyan" },
  { id: "top3", icon: "♛", name: "Top 3", detail: "Alcançou o pódio", color: "yellow" },
  { id: "speed", icon: "↯", name: "Velocista", detail: "Completou um desafio em tempo recorde", color: "green" },
];

const challengeCards: Array<{
  key: ChallengeKey;
  title: string;
  eyebrow: string;
  description: string;
  icon: typeof ShieldCheck;
  tone: string;
  stat: string;
}> = [
  { key: "quiz", title: "Quiz SIPATMA", eyebrow: "Conhecimento rápido", description: "Segurança, sustentabilidade e Lean em perguntas que valem pontos.", icon: CircleHelp, tone: "cyan", stat: "60+ questões" },
  { key: "errors", title: "Caça-erros na fábrica", eyebrow: "Visão de processo", description: "Encontre os riscos escondidos antes que eles virem um incidente.", icon: Search, tone: "yellow", stat: "6 riscos visuais" },
  { key: "lean", title: "Desafio Lean", eyebrow: "Pensamento enxuto", description: "Identifique desperdícios e escolha a melhoria que libera o fluxo.", icon: BarChart3, tone: "purple", stat: "8 desperdícios" },
  { key: "fiveS", title: "Missão 5S", eyebrow: "Organização", description: "Transforme o posto de trabalho com os cinco sensos.", icon: Grid3X3, tone: "green", stat: "5 sensos" },
  { key: "kaizen", title: "Kaizen", eyebrow: "Melhoria contínua", description: "Uma pequena mudança hoje. Um processo melhor amanhã.", icon: Sparkles, tone: "orange", stat: "+ melhoria" },
  { key: "kanban", title: "Kanban Flow", eyebrow: "Ritmo e puxada", description: "Organize o fluxo sem criar excesso de produção ou gargalos.", icon: PackageCheck, tone: "blue", stat: "WIP limitado" },
  { key: "safety", title: "O que você faria?", eyebrow: "Decisão segura", description: "Escolha a ação que protege pessoas, processo e ambiente.", icon: ShieldCheck, tone: "cyan", stat: "Situações reais" },
  { key: "environment", title: "Impacto ambiental", eyebrow: "Escolhas conscientes", description: "Faça a fábrica evoluir com menos consumo, resíduos e emissões.", icon: Leaf, tone: "green", stat: "Zero desperdício" },
];

const question = (id: number, category: Category, mode: ChallengeKey, difficulty: Difficulty, prompt: string, options: string[], answer: number, explanation: string): Question => ({ id, category, mode, difficulty, prompt, options, answer, explanation });

// 60-question starter bank: 15 Segurança, 10 Meio ambiente, 15 Lean, 10 5S, 5 Kaizen, 5 Kanban.
const questionBank: Question[] = [
  question(1, "Segurança", "safety", "Fácil", "Você encontra óleo derramado perto de uma passagem. Qual é a primeira atitude?", ["Ignorar se não foi você quem derramou", "Sinalizar, isolar e comunicar o responsável", "Passar por cima com cuidado", "Cobrir com papel e seguir"], 1, "A sinalização e o isolamento evitam exposição imediata; depois, o derramamento deve ser tratado pelo procedimento correto."),
  question(2, "Segurança", "safety", "Fácil", "Qual item protege os olhos contra partículas em uma operação de usinagem?", ["Protetor auricular", "Óculos de segurança", "Calçado comum", "Avental de tecido"], 1, "Óculos de segurança são selecionados conforme o risco de impacto, partículas ou respingos."),
  question(3, "Segurança", "safety", "Fácil", "Antes de intervir em uma máquina, o operador deve principalmente:", ["Acelerar para terminar logo", "Desligar apenas o botão verde", "Seguir o bloqueio e etiquetagem (LOTO)", "Pedir para alguém observar"], 2, "O LOTO controla energias perigosas e evita a partida inesperada durante a intervenção."),
  question(4, "Segurança", "safety", "Fácil", "O que uma faixa amarela no piso normalmente ajuda a indicar?", ["Área de circulação ou limite de segurança", "Local de descanso", "Estoque liberado", "Rota para empilhadeira sem regras"], 0, "A sinalização de piso delimita áreas e ajuda a manter circulação e materiais organizados."),
  question(5, "Segurança", "safety", "Fácil", "Em caso de emergência, a melhor decisão é:", ["Correr sem avisar ninguém", "Seguir o plano, a sinalização e as orientações da brigada", "Usar o elevador mais próximo", "Voltar para pegar objetos pessoais"], 1, "Planos de emergência e brigada existem para orientar uma saída segura e coordenada."),
  question(6, "Segurança", "safety", "Médio", "Por que o EPI não substitui medidas de proteção coletiva?", ["Porque EPI é opcional", "Porque controles de engenharia protegem mais pessoas na fonte", "Porque EPI só é usado fora da fábrica", "Porque proteção coletiva só vale para visitantes"], 1, "A hierarquia de controles prioriza eliminar ou controlar o risco na fonte antes de depender do comportamento individual."),
  question(7, "Segurança", "safety", "Médio", "Ao perceber um quase-acidente, qual ação fortalece a prevenção?", ["Não registrar para evitar burocracia", "Relatar o evento e ajudar a investigar causas", "Comentar apenas no intervalo", "Esperar que se repita"], 1, "Quase-acidentes são sinais valiosos para agir antes de uma lesão ou perda."),
  question(8, "Segurança", "safety", "Médio", "Qual prática reduz risco ergonômico em uma bancada?", ["Manter materiais de uso frequente próximos e na altura adequada", "Girar o tronco a cada ciclo", "Trabalhar sempre em pé sem pausas", "Aumentar o alcance dos itens"], 0, "A organização do posto reduz alcance, torção e esforço repetitivo."),
  question(9, "Segurança", "safety", "Médio", "O que fazer ao encontrar uma proteção de máquina removida?", ["Recolocar sozinho com a máquina ligada", "Parar a atividade e comunicar conforme o procedimento", "Continuar se a máquina estiver lenta", "Colocar uma fita adesiva"], 1, "Uma proteção removida expõe energia perigosa e exige controle imediato e comunicação."),
  question(10, "Segurança", "safety", "Médio", "Para movimentar uma carga com segurança, é essencial:", ["Conhecer peso, rota, capacidade e usar o equipamento correto", "Puxar com qualquer corda", "Ficar sob a carga para guiar", "Priorizar velocidade"], 0, "Planejamento e equipamento adequado reduzem quedas, colisões e sobrecarga."),
  question(11, "Segurança", "safety", "Difícil", "Em um produto químico sem identificação, a atitude segura é:", ["Cheirar para reconhecer", "Usar o conteúdo se parecer conhecido", "Isolar, não manipular e acionar o responsável", "Misturar com água"], 2, "Sem identificação não há controle adequado de exposição; o material deve ser isolado e tratado por pessoa autorizada."),
  question(12, "Segurança", "safety", "Difícil", "Qual combinação representa melhor uma análise de risco eficaz?", ["Perigo, exposição, consequência e controles", "Apenas o nome da máquina", "Somente o histórico de acidentes", "A opinião do operador mais antigo"], 0, "Analisar risco exige entender o perigo, como ocorre a exposição, o dano possível e os controles existentes."),
  question(13, "Segurança", "safety", "Difícil", "Em trabalho em altura, o sistema de proteção deve ser definido:", ["Depois da queda", "Conforme análise de risco, procedimento e equipamento aprovado", "Apenas pelo colaborador", "Pelo item mais barato"], 1, "Trabalho em altura requer planejamento, sistema adequado e pessoas capacitadas."),
  question(14, "Segurança", "safety", "Difícil", "Uma mudança de processo pode criar riscos novos. O que fazer antes de iniciar?", ["Produzir uma peça de teste sem avaliação", "Atualizar a análise de risco e validar os controles", "Esperar um acidente", "Remover a sinalização antiga e pronto"], 1, "A gestão de mudanças antecipa impactos e confirma que os controles continuam eficazes."),
  question(15, "Segurança", "safety", "Difícil", "Em uma investigação sem culpa, o foco deve estar em:", ["Encontrar um culpado rapidamente", "Compreender causas sistêmicas e fortalecer barreiras", "Punir quem estava mais perto", "Evitar registros"], 1, "Aprender com o evento e melhorar o sistema gera prevenção mais consistente."),
  question(16, "Meio ambiente", "environment", "Fácil", "Qual prática representa separação correta de resíduos?", ["Misturar tudo para agilizar", "Destinar cada resíduo ao coletor identificado", "Jogar líquidos no ralo", "Retirar as etiquetas"], 1, "A segregação na fonte evita contaminação e permite a destinação adequada."),
  question(17, "Meio ambiente", "environment", "Fácil", "Para economizar energia em uma área vazia, o ideal é:", ["Deixar tudo ligado por segurança", "Desligar equipamentos e iluminação conforme o padrão", "Abrir portas para ventilar", "Aumentar a temperatura"], 1, "Desligamentos padronizados evitam consumo sem uso e preservam a segurança."),
  question(18, "Meio ambiente", "environment", "Fácil", "Qual exemplo reduz o consumo de água?", ["Comunicar vazamentos e usar água somente quando necessário", "Lavar o piso continuamente", "Deixar torneiras abertas", "Usar água potável para qualquer limpeza"], 0, "Pequenos vazamentos e usos sem controle geram perdas significativas."),
  question(19, "Meio ambiente", "environment", "Fácil", "O que significa consumo consciente?", ["Comprar mais para não faltar", "Usar recursos com necessidade, eficiência e responsabilidade", "Descartar materiais úteis", "Escolher sempre o produto maior"], 1, "Consumo consciente considera necessidade, eficiência, vida útil e destinação."),
  question(20, "Meio ambiente", "environment", "Fácil", "A reciclagem começa com:", ["A separação correta no ponto de geração", "A coleta no fim do mês", "A mistura de materiais", "A retirada do coletor"], 0, "Sem segregação na fonte, a recuperação de materiais fica mais difícil."),
  question(21, "Meio ambiente", "environment", "Médio", "Qual ação ajuda a reduzir emissões associadas à logística?", ["Aumentar viagens vazias", "Planejar rotas e consolidar cargas", "Movimentar lotes menores sem necessidade", "Ignorar a ocupação dos veículos"], 1, "Planejamento reduz deslocamentos, consumo de combustível e emissões."),
  question(22, "Meio ambiente", "environment", "Médio", "Um resíduo contaminado deve ser:", ["Misturado ao reciclável", "Classificado e acondicionado segundo o procedimento", "Colocado no lixo comum", "Lavado no ralo"], 1, "A classificação e o acondicionamento corretos protegem pessoas e evitam contaminação."),
  question(23, "Meio ambiente", "environment", "Médio", "O que é prevenção de poluição?", ["Agir somente depois do vazamento", "Reduzir ou eliminar a geração de poluentes na origem", "Esconder o resíduo", "Transferir o problema para outro setor"], 1, "Prevenir na origem é mais eficaz do que tratar o impacto depois que ele acontece."),
  question(24, "Meio ambiente", "environment", "Difícil", "Uma boa decisão ambiental considera:", ["Apenas o custo imediato", "Ciclo de vida, consumo, resíduos e impactos", "Somente a cor da embalagem", "A velocidade de compra"], 1, "Decisões responsáveis equilibram operação e impactos ao longo do ciclo de vida."),
  question(25, "Meio ambiente", "environment", "Difícil", "Para reduzir descarte de materiais ainda úteis, um time deve primeiro:", ["Aumentar o estoque", "Entender a causa do descarte e prevenir a perda", "Eliminar o registro", "Enviar para qualquer coletor"], 1, "A causa da perda direciona uma solução sustentável e reduz desperdício recorrente."),
  question(26, "Lean Manufacturing", "lean", "Fácil", "Uma ferramenta fora do lugar na produção está mais relacionada a qual conceito?", ["5S", "Just in Time", "Kanban", "Produção em massa"], 0, "O 5S organiza, limpa, padroniza e sustenta o ambiente de trabalho."),
  question(27, "Lean Manufacturing", "lean", "Fácil", "Produzir antes da demanda é um exemplo de:", ["Superprodução", "Qualidade na fonte", "Poka-yoke", "Fluxo contínuo"], 0, "Superprodução cria estoque, ocupa espaço e pode esconder problemas."),
  question(28, "Lean Manufacturing", "lean", "Fácil", "Quando uma pessoa espera material para continuar, temos desperdício de:", ["Espera", "Talento", "Defeito", "Transporte"], 0, "A espera interrompe o fluxo e aumenta o tempo total de atravessamento."),
  question(29, "Lean Manufacturing", "lean", "Fácil", "Mover uma peça várias vezes entre setores representa:", ["Transporte", "Kaizen", "Qualidade", "Puxada"], 0, "Movimentação de materiais que não agrega valor é desperdício de transporte."),
  question(30, "Lean Manufacturing", "lean", "Fácil", "Um produto que precisa ser refeito apresenta:", ["Defeito", "Fluxo", "Takt time", "Heijunka"], 0, "Defeitos geram retrabalho, custo e atraso para o cliente."),
  question(31, "Lean Manufacturing", "lean", "Médio", "Caminhar longas distâncias para buscar uma ferramenta é desperdício de:", ["Movimento", "Estoque", "Processamento", "Talento"], 0, "Movimento é o deslocamento desnecessário de pessoas durante o trabalho."),
  question(32, "Lean Manufacturing", "lean", "Médio", "Uma inspeção duplicada sem mudar o resultado é exemplo de:", ["Processamento excessivo", "Puxada", "Nivelamento", "Seiton"], 0, "Processos além do necessário aumentam esforço sem gerar valor ao cliente."),
  question(33, "Lean Manufacturing", "lean", "Médio", "Manter muito material parado no almoxarifado é desperdício de:", ["Estoque", "Defeito", "Movimento", "Segurança"], 0, "Estoque excessivo usa espaço, capital e pode esconder problemas de fluxo."),
  question(34, "Lean Manufacturing", "lean", "Médio", "Quando as ideias do operador não são consideradas, qual desperdício aparece?", ["Talento não utilizado", "Transporte", "Espera", "Superprodução"], 0, "Pessoas próximas do processo percebem oportunidades que o sistema deve aproveitar."),
  question(35, "Lean Manufacturing", "lean", "Médio", "O que uma melhoria de fluxo busca principalmente?", ["Reduzir interrupções e conectar etapas", "Aumentar lotes e filas", "Criar mais aprovações", "Produzir sem demanda"], 0, "Fluxo é a passagem contínua do trabalho, com menos filas, esperas e interrupções."),
  question(36, "Lean Manufacturing", "lean", "Médio", "Qual é um bom primeiro passo para reduzir um desperdício?", ["Observar o processo no local e entender a causa", "Comprar um software imediatamente", "Mudar tudo ao mesmo tempo", "Aumentar o estoque"], 0, "Ir ao gemba e observar o trabalho real ajuda a separar sintomas de causas."),
  question(37, "Lean Manufacturing", "lean", "Difícil", "Em um sistema puxado, a produção é acionada:", ["Pela demanda do processo seguinte", "Pela capacidade máxima da máquina", "Pelo estoque mais alto", "Pela meta de produzir sempre mais"], 0, "A puxada evita antecipação e alinha o ritmo à necessidade real."),
  question(38, "Lean Manufacturing", "lean", "Difícil", "Takt time é usado para:", ["Relacionar demanda do cliente ao tempo disponível", "Medir o tamanho do estoque", "Escolher o EPI", "Contar acidentes"], 0, "O takt orienta o ritmo necessário para atender a demanda dentro do tempo disponível."),
  question(39, "Lean Manufacturing", "lean", "Difícil", "Uma causa raiz bem tratada deve:", ["Evitar a recorrência e fortalecer o processo", "Apenas corrigir o sintoma", "Ser escondida do time", "Aumentar inspeções sem análise"], 0, "A contramedida eficaz muda o sistema e reduz a chance de repetição."),
  question(40, "Lean Manufacturing", "lean", "Difícil", "Qual sinal costuma indicar um gargalo?", ["Acúmulo de trabalho antes de uma etapa", "Zero fila em todos os pontos", "Materiais no local correto", "Fluxo nivelado"], 0, "Filas e acúmulo antes de um processo indicam restrição de capacidade ou variação."),
  question(41, "5S", "fiveS", "Fácil", "Seiri significa:", ["Utilização", "Organização", "Limpeza", "Disciplina"], 0, "Seiri é separar o necessário do desnecessário."),
  question(42, "5S", "fiveS", "Fácil", "Seiton ajuda a:", ["Definir lugar e identificação para cada item", "Criar sujeira", "Aumentar procura", "Remover padrões"], 0, "Seiton torna fácil encontrar, usar e devolver cada item."),
  question(43, "5S", "fiveS", "Fácil", "Seiso está ligado a:", ["Limpeza e inspeção do ambiente", "Aumento do estoque", "Atraso de manutenção", "Produção sem padrão"], 0, "Limpar também é inspecionar e identificar anormalidades."),
  question(44, "5S", "fiveS", "Médio", "Seiketsu busca:", ["Padronizar as melhores condições", "Descartar todo material", "Trabalhar sem rotina", "Criar mais variações"], 0, "Padrões visuais e rotinas sustentam os primeiros três sensos."),
  question(45, "5S", "fiveS", "Médio", "Shitsuke representa:", ["Disciplina para manter e melhorar os padrões", "Compra de ferramentas", "Estoque de segurança", "Limpeza terceirizada"], 0, "A disciplina transforma o 5S em hábito e cultura."),
  question(46, "5S", "fiveS", "Médio", "Qual indicador mostra que um 5S está sustentado?", ["Auditorias com ações e melhoria ao longo do tempo", "Uma grande faxina anual", "Mais itens sem uso", "Padrões guardados em uma gaveta"], 0, "O 5S é vivo: verifica, corrige e melhora continuamente."),
  question(47, "5S", "fiveS", "Difícil", "Uma etiqueta vermelha no 5S ajuda a:", ["Identificar itens para decisão e remoção", "Aumentar o estoque", "Liberar qualquer descarte", "Substituir a análise"], 0, "A etiqueta sinaliza o que precisa ser avaliado, não autoriza descarte sem critério."),
  question(48, "5S", "fiveS", "Difícil", "Para manter uma área visualmente gerenciável, é melhor:", ["Definir padrões, responsáveis e frequência de checagem", "Confiar apenas na memória", "Esconder materiais", "Remover toda sinalização"], 0, "Padrões claros e responsáveis tornam a condição esperada visível."),
  question(49, "5S", "fiveS", "Difícil", "O 5S contribui para segurança porque:", ["Deixa anormalidades, obstruções e riscos mais visíveis", "Elimina todo EPI", "Dispensa treinamento", "Aumenta a complexidade"], 0, "Organização e limpeza facilitam perceber e corrigir condições inseguras."),
  question(50, "5S", "fiveS", "Médio", "Ao encontrar um item sem identificação, a melhor ação é:", ["Definir sua necessidade e local antes de guardá-lo", "Deixar no corredor", "Colocar em qualquer caixa", "Descartar sem critério"], 0, "Todo item deve ter uso definido, local e identificação."),
  question(51, "Kaizen", "kaizen", "Fácil", "Kaizen é melhor descrito como:", ["Melhoria contínua com participação das pessoas", "Uma grande reforma anual", "Aumento de estoque", "Inspeção final"], 0, "Kaizen estimula pequenas melhorias frequentes, baseadas em fatos."),
  question(52, "Kaizen", "kaizen", "Médio", "Uma estação exige muitas caminhadas. Qual melhoria é mais adequada?", ["Aproximar os materiais usados", "Aumentar a distância", "Criar mais aprovações", "Aumentar o lote"], 0, "Aproximar materiais reduz movimento e facilita o fluxo."),
  question(53, "Kaizen", "kaizen", "Médio", "O ciclo PDCA começa com:", ["Planejar", "Agir sem medir", "Padronizar antes de testar", "Punir o desvio"], 0, "Planejar define problema, hipótese e forma de verificar o resultado."),
  question(54, "Kaizen", "kaizen", "Difícil", "Depois de uma melhoria comprovada, o próximo passo é:", ["Padronizar e acompanhar para sustentar o ganho", "Desfazer o padrão", "Parar de medir", "Mudar outra coisa sem aprender"], 0, "Padronização evita que o ganho dependa apenas de memória ou esforço individual."),
  question(55, "Kaizen", "kaizen", "Difícil", "Uma boa contramedida Kaizen deve ser:", ["Simples, testável e ligada à causa", "A mais cara disponível", "Definida sem observar", "Difícil de explicar"], 0, "Melhorias simples e testáveis permitem aprender rápido e ajustar com segurança."),
  question(56, "Kanban", "kanban", "Fácil", "No quadro Kanban, a sequência básica é:", ["A fazer → Em produção → Concluído", "Concluído → A fazer → Espera", "Estoque → Resíduo → Defeito", "Puxar → Empurrar → Parar"], 0, "As colunas tornam o fluxo de trabalho visível."),
  question(57, "Kanban", "kanban", "Médio", "O limite de WIP serve para:", ["Evitar tarefas demais em andamento", "Aumentar filas", "Esconder gargalos", "Produzir sem demanda"], 0, "Limitar o trabalho em processo ajuda a terminar antes de começar mais."),
  question(58, "Kanban", "kanban", "Médio", "Se a coluna Em produção atingiu o limite, o time deve:", ["Ajudar a concluir antes de puxar novo trabalho", "Criar outra fila", "Puxar mais cartões", "Ignorar o limite"], 0, "O limite orienta colaboração e evita sobrecarga do fluxo."),
  question(59, "Kanban", "kanban", "Difícil", "Um cartão Kanban deve representar:", ["Uma unidade clara de trabalho com critério de conclusão", "Qualquer ideia sem dono", "Todo o estoque da fábrica", "Uma tarefa sem prioridade"], 0, "Cartões claros tornam capacidade e prioridade visíveis."),
  question(60, "Kanban", "kanban", "Difícil", "Qual resultado indica que o Kanban está ajudando?", ["Menos multitarefa e fluxo mais previsível", "Mais tarefas abertas", "Filas maiores", "Menos transparência"], 0, "A visibilidade e o WIP limitado ajudam a entregar com mais previsibilidade."),
];

const sectorOptions = ["Produção", "Qualidade", "Manutenção", "Logística", "Engenharia", "Administrativo", "Outros"];
const initialPlayer: Player = { name: "Visitante", sector: "Produção", difficulty: "Médio", totalScore: 0, games: 0, correct: 0, errors: 0, bestScore: 0, bestStreak: 0, highestDifficulty: "Fácil", badges: [] };

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function App() {
  const [page, setPage] = useState<Page>("home");
  const [player, setPlayer] = useState<Player>(() => {
    try {
      return JSON.parse(localStorage.getItem("sipatma-player") || "null") || initialPlayer;
    } catch {
      return initialPlayer;
    }
  });
  const [leaders, setLeaders] = useState<Leader[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("sipatma-leaders") || "null") || initialLeaders;
    } catch {
      return initialLeaders;
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<ChallengeKey>("quiz");
  const [gameSeed, setGameSeed] = useState(0);
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [roundBestStreak, setRoundBestStreak] = useState(0);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [roundErrors, setRoundErrors] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [result, setResult] = useState<{ score: number; correct: number; total: number; bestStreak: number; time: number; rank: number; gap: number } | null>(null);
  const [foundErrors, setFoundErrors] = useState<string[]>([]);
  const [kanbanCards, setKanbanCards] = useState({ todo: ["Kit de vedação", "Inspeção final", "Ordem 2048"], doing: ["Setup prensa"], done: ["Lote 2047"] });
  const [selectedKanban, setSelectedKanban] = useState<string | null>(null);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  useEffect(() => { localStorage.setItem("sipatma-player", JSON.stringify(player)); }, [player]);
  useEffect(() => { localStorage.setItem("sipatma-leaders", JSON.stringify(leaders)); }, [leaders]);

  const currentQuestion = gameQuestions[questionIndex];
  const playerRank = useMemo(() => {
    const all = [...leaders, ...(player.name !== "Visitante" ? [{ name: player.name, sector: player.sector, score: player.totalScore, level: player.highestDifficulty }] : [])].sort((a, b) => b.score - a.score);
    return Math.max(1, all.findIndex((item) => item.name === player.name) + 1);
  }, [leaders, player]);
  const sectorScores = useMemo(() => {
    const scores: Record<string, number> = {};
    leaders.forEach((leader) => { scores[leader.sector] = (scores[leader.sector] || 0) + leader.score; });
    if (player.name !== "Visitante") scores[player.sector] = (scores[player.sector] || 0) + player.totalScore;
    return Object.entries(scores).sort((a, b) => b[1] - a[1]);
  }, [leaders, player]);

  const go = (next: Page) => { setPage(next); setSidebarOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const startChallenge = (challenge: ChallengeKey) => {
    setActiveChallenge(challenge);
    setResult(null);
    setSelectedAnswer(null);
    setFeedback(null);
    setQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setRoundBestStreak(0);
    setRoundCorrect(0);
    setRoundErrors(0);
    setLives(3);
    setFoundErrors([]);
    setSelectedKanban(null);
    setKanbanCards({ todo: ["Kit de vedação", "Inspeção final", "Ordem 2048"], doing: ["Setup prensa"], done: ["Lote 2047"] });
    setGameSeed((seed) => seed + 1);
    setStartedAt(Date.now());
    if (challenge === "errors") {
      setTimeLeft(difficultyMeta[player.difficulty].seconds);
      go("play");
      return;
    }
    const category = challenge === "quiz" ? undefined : challenge === "fiveS" ? "5S" : challenge === "lean" ? "Lean Manufacturing" : challenge === "kaizen" ? "Kaizen" : challenge === "kanban" ? "Kanban" : challenge === "safety" ? "Segurança" : "Meio ambiente";
    const pool = questionBank.filter((item) => item.difficulty === player.difficulty && (!category || item.category === category));
    setGameQuestions(shuffle(pool.length >= 8 ? pool : questionBank.filter((item) => item.difficulty === player.difficulty)).slice(0, 8));
    setTimeLeft(difficultyMeta[player.difficulty].seconds);
    go("play");
  };

  useEffect(() => {
    if (page !== "play" || result || !startedAt || timeLeft <= 0) return;
    const timer = window.setInterval(() => setTimeLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [page, result, startedAt, timeLeft]);

  useEffect(() => {
    if (page === "play" && startedAt && timeLeft === 0 && !result && activeChallenge !== "kanban") {
      finishGame(score, roundCorrect, gameQuestions.length || foundErrors.length, roundBestStreak);
    }
    // finishGame intentionally depends on the live round values when the timer hits zero.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const finishGame = (finalScore: number, correct: number, total: number, best: number) => {
    if (result) return;
    const elapsed = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 0;
    const nextPlayer: Player = {
      ...player,
      totalScore: player.totalScore + finalScore,
      games: player.games + 1,
      correct: player.correct + correct,
      errors: player.errors + Math.max(0, total - correct),
      bestScore: Math.max(player.bestScore, finalScore),
      bestStreak: Math.max(player.bestStreak, best),
      highestDifficulty: difficultyMeta[player.difficulty].points > difficultyMeta[player.highestDifficulty].points ? player.difficulty : player.highestDifficulty,
      badges: Array.from(new Set([...player.badges, "first", ...(activeChallenge === "safety" ? ["safety"] : []), ...(activeChallenge === "environment" ? ["eco"] : []), ...(activeChallenge === "lean" ? ["lean"] : []), ...(activeChallenge === "fiveS" && correct === total ? ["fiveS"] : []), ...(best >= 10 ? ["streak"] : []), ...(elapsed < 20 ? ["speed"] : [])])),
    };
    setPlayer(nextPlayer);
    const nextLeaders = [...leaders.filter((leader) => leader.name !== nextPlayer.name), { name: nextPlayer.name, sector: nextPlayer.sector, score: nextPlayer.totalScore, level: nextPlayer.difficulty }].sort((a, b) => b.score - a.score);
    setLeaders(nextLeaders);
    const rank = nextLeaders.findIndex((leader) => leader.name === nextPlayer.name) + 1;
    const nextAbove = nextLeaders[rank - 2];
    setResult({ score: finalScore, correct, total, bestStreak: best, time: elapsed, rank, gap: nextAbove ? Math.max(0, nextAbove.score - nextPlayer.totalScore) : 0 });
  };

  const submitAnswer = (index: number) => {
    if (selectedAnswer !== null || !currentQuestion || result) return;
    const isCorrect = index === currentQuestion.answer;
    const nextStreak = isCorrect ? streak + 1 : 0;
    const bonus = isCorrect && nextStreak === 3 ? 100 : isCorrect && nextStreak === 5 ? 250 : isCorrect && nextStreak === 10 ? 500 : 0;
    const earned = isCorrect ? difficultyMeta[player.difficulty].points + bonus : 0;
    setSelectedAnswer(index);
    setFeedback(isCorrect ? "correct" : "wrong");
    setScore((value) => value + earned);
    setStreak(nextStreak);
    setRoundBestStreak((value) => Math.max(value, nextStreak));
    setRoundCorrect((value) => value + (isCorrect ? 1 : 0));
    setRoundErrors((value) => value + (isCorrect ? 0 : 1));
    setLives((value) => Math.max(0, value - (isCorrect ? 0 : 1)));
  };

  const nextQuestion = () => {
    if (selectedAnswer === null) return;
    if (lives === 0 || questionIndex >= gameQuestions.length - 1) {
      finishGame(score, roundCorrect, gameQuestions.length, roundBestStreak);
      return;
    }
    setQuestionIndex((value) => value + 1);
    setSelectedAnswer(null);
    setFeedback(null);
  };

  const chooseError = (id: string) => {
    if (foundErrors.includes(id) || result) return;
    const next = [...foundErrors, id];
    setFoundErrors(next);
    const points = difficultyMeta[player.difficulty].points;
    setScore((value) => value + points);
    setStreak((value) => value + 1);
    setRoundBestStreak((value) => Math.max(value, streak + 1));
    if (next.length === 6) finishGame(points * 6, 6, 6, Math.max(roundBestStreak, streak + 1));
  };

  const moveKanban = (lane: "todo" | "doing" | "done") => {
    if (!selectedKanban || lane === "todo") return;
    if (lane === "doing" && kanbanCards.doing.length >= 2) return;
    const currentLane = Object.entries(kanbanCards).find(([, cards]) => cards.includes(selectedKanban))?.[0] as keyof typeof kanbanCards | undefined;
    if (!currentLane || currentLane === lane) return;
    const next = { ...kanbanCards, [currentLane]: kanbanCards[currentLane].filter((card) => card !== selectedKanban), [lane]: [...kanbanCards[lane], selectedKanban] };
    setKanbanCards(next);
    setSelectedKanban(null);
    if (lane === "done") {
      const newScore = score + difficultyMeta[player.difficulty].points;
      setScore(newScore);
      if (next.done.length >= 3) finishGame(newScore, 3, 3, 1);
    }
  };

  const resetDemo = () => {
    setLeaders(initialLeaders);
    setPlayer(initialPlayer);
    localStorage.removeItem("sipatma-player");
    localStorage.removeItem("sipatma-leaders");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => go("home")} aria-label="Voltar ao início">
          <span className="brand-mark"><Factory size={20} strokeWidth={2.4} /></span>
          <span><strong>CUMMINS</strong><em>SIPATMA CHALLENGE</em></span>
        </button>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <button className={page === "home" ? "active" : ""} onClick={() => go("home")}>Início</button>
          <button className={page === "play" ? "active" : ""} onClick={() => go(player.name === "Visitante" ? "setup" : "play")}>Jogar</button>
          <button className={page === "ranking" ? "active" : ""} onClick={() => go("ranking")}>Ranking</button>
          <button className={page === "learn" ? "active" : ""} onClick={() => go("learn")}>Aprenda</button>
        </nav>
        <div className="top-actions">
          <button className="score-chip" onClick={() => go("profile")}><Trophy size={16} /> <span>{formatNumber(player.totalScore)}</span></button>
          <button className="avatar-button" onClick={() => go("profile")}>{player.name === "Visitante" ? "V" : player.name.slice(0, 1).toUpperCase()}</button>
          <button className="mobile-menu" onClick={() => setSidebarOpen((value) => !value)} aria-label="Abrir menu"><Menu size={22} /></button>
        </div>
      </header>
      {sidebarOpen && <div className="mobile-nav"><button onClick={() => go("home")}>Início</button><button onClick={() => go(player.name === "Visitante" ? "setup" : "play")}>Jogar</button><button onClick={() => go("ranking")}>Ranking</button><button onClick={() => go("learn")}>Aprenda</button><button onClick={() => go("profile")}>Meu perfil</button></div>}

      <main>
        {page === "home" && <HomePage player={player} go={go} startChallenge={startChallenge} />}
        {page === "setup" && <SetupPage player={player} setPlayer={setPlayer} startChallenge={startChallenge} go={go} />}
        {page === "play" && <PlayPage player={player} activeChallenge={activeChallenge} startChallenge={startChallenge} gameQuestions={gameQuestions} currentQuestion={currentQuestion} questionIndex={questionIndex} selectedAnswer={selectedAnswer} feedback={feedback} submitAnswer={submitAnswer} nextQuestion={nextQuestion} score={score} streak={streak} lives={lives} timeLeft={timeLeft} result={result} foundErrors={foundErrors} chooseError={chooseError} kanbanCards={kanbanCards} selectedKanban={selectedKanban} setSelectedKanban={setSelectedKanban} moveKanban={moveKanban} go={go} />}
        {page === "ranking" && <RankingPage leaders={leaders} player={player} sectorScores={sectorScores} />}
        {page === "learn" && <LearnPage />}
        {page === "achievements" && <AchievementsPage player={player} />}
        {page === "profile" && <ProfilePage player={player} rank={playerRank} go={go} />}
        {page === "admin" && <AdminPage unlocked={adminUnlocked} password={adminPassword} setPassword={setAdminPassword} error={adminError} unlock={() => { if (adminPassword === "CUMMINS2026") { setAdminUnlocked(true); setAdminError(""); } else setAdminError("Senha de demonstração incorreta."); }} resetDemo={resetDemo} player={player} leaders={leaders} />}
      </main>
      <footer className="footer"><span>© Cummins • Programa SIPATMA</span><span><button onClick={() => go("achievements")}>Conquistas</button><button onClick={() => go("admin")}>Admin</button></span></footer>
    </div>
  );
}

function HomePage({ player, go, startChallenge }: { player: Player; go: (page: Page) => void; startChallenge: (challenge: ChallengeKey) => void }) {
  return <div className="page home-page">
    <section className="hero-grid">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot" /> PROGRAMA SIPATMA 2026 <span className="eyebrow-line" /></div>
        <h1>Aprenda.<br /><span>Jogue.</span><br />Melhore.</h1>
        <p className="hero-lede">O desafio corporativo que transforma segurança, sustentabilidade e Lean em uma experiência de jogo.</p>
        <div className="hero-actions"><button className="primary-button" onClick={() => go(player.name === "Visitante" ? "setup" : "play")}><Play size={17} fill="currentColor" /> COMEÇAR DESAFIO <ArrowRight size={17} /></button><button className="text-button" onClick={() => go("learn")}>Como funciona <ChevronRight size={15} /></button></div>
        <div className="hero-proof"><div className="proof-avatars"><span>CR</span><span>RS</span><span>BL</span><span>+2k</span></div><p><strong>2.438 colaboradores</strong><br /><span>já estão no jogo</span></p></div>
      </div>
      <div className="hero-visual">
        <div className="visual-frame"><img src="/manus-storage/sipatma-reference_87b500c7.png" alt="Ilustração de uma linha de produção com segurança e Lean" /><div className="visual-tag tag-score"><span className="pulse-dot" /> PONTUAÇÃO <strong>12.450</strong></div><div className="visual-tag tag-safety"><ShieldCheck size={15} /> SAFETY FIRST</div><div className="visual-corner" /></div>
        <div className="hero-stats"><div><span>+48%</span><small>adesão no último ciclo</small></div><div><span>08</span><small>desafios disponíveis</small></div><div><span>60+</span><small>perguntas no banco</small></div></div>
      </div>
    </section>
    <section className="section-block featured-block"><div className="section-heading"><div><div className="eyebrow">CENTRAL DE MISSÕES</div><h2>Escolha seu próximo desafio</h2></div><button className="text-button" onClick={() => go("play")}>Ver todos <ArrowRight size={15} /></button></div><div className="challenge-grid">{challengeCards.slice(0, 4).map((card) => <ChallengeCard key={card.key} card={card} onClick={() => startChallenge(card.key)} />)}</div></section>
    <section className="split-callout"><div className="callout-visual"><img src="/manus-storage/factory-error-hunt_8a64efc8.png" alt="Linha de produção com riscos para encontrar" /><span className="scan-line" /></div><div className="callout-copy"><div className="eyebrow">MISSÃO EM DESTAQUE</div><h2>Você enxerga o risco antes dele acontecer?</h2><p>Seis anomalias estão escondidas na fábrica. Encontre todas, ganhe pontos e ajude a construir uma cultura mais segura.</p><button className="secondary-button" onClick={() => startChallenge("errors")}>Jogar caça-erros <Search size={16} /></button></div></section>
    <section className="principles"><div className="principle-intro"><div className="eyebrow">O QUE MOVE A GENTE</div><h2>Uma fábrica melhor começa com você.</h2><p>Conteúdo rápido, decisões reais e feedback imediato para transformar conhecimento em atitude.</p></div><div className="principle-list"><div><span className="principle-icon cyan"><ShieldCheck size={20} /></span><span><strong>Segurança na fonte</strong><small>Identifique riscos e fortaleça barreiras.</small></span></div><div><span className="principle-icon yellow"><Zap size={20} /></span><span><strong>Melhoria contínua</strong><small>Pequenas ideias que liberam o fluxo.</small></span></div><div><span className="principle-icon green"><Leaf size={20} /></span><span><strong>Impacto positivo</strong><small>Menos desperdício. Mais futuro.</small></span></div></div></section>
  </div>;
}

function SetupPage({ player, setPlayer, startChallenge, go }: { player: Player; setPlayer: (player: Player) => void; startChallenge: (challenge: ChallengeKey) => void; go: (page: Page) => void }) {
  const [name, setName] = useState(player.name === "Visitante" ? "" : player.name);
  const [sector, setSector] = useState(player.sector);
  const [difficulty, setDifficulty] = useState<Difficulty>(player.difficulty);
  const canStart = name.trim().length >= 2;
  const saveAndStart = () => { if (!canStart) return; setPlayer({ ...player, name: name.trim(), sector, difficulty }); startChallenge("quiz"); };
  return <div className="page narrow-page setup-page"><button className="back-link" onClick={() => go("home")}><ArrowLeft size={16} /> Voltar</button><div className="setup-layout"><div className="setup-intro"><div className="eyebrow"><span className="eyebrow-dot" /> IDENTIFICAÇÃO RÁPIDA</div><h1>Pronto para<br /><span>melhorar o jogo?</span></h1><p>Use um nome ou apelido. Nada de informações pessoais desnecessárias — aqui, o que importa é sua atitude na fábrica.</p><div className="setup-note"><ShieldCheck size={18} /><span>Ambiente de competição saudável<br /><small>Seu progresso fica salvo neste dispositivo.</small></span></div></div><div className="setup-card"><div className="card-topline"><span>01 / 03</span><span><LockKeyhole size={13} /> PRIVACIDADE</span></div><h2>Configure seu perfil</h2><label>Nome ou apelido<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Ana da Produção" autoFocus /></label><label>Setor / área<select value={sector} onChange={(event) => setSector(event.target.value)}>{sectorOptions.map((item) => <option key={item}>{item}</option>)}</select></label><fieldset><legend>Escolha seu nível</legend><div className="difficulty-options">{(Object.keys(difficultyMeta) as Difficulty[]).map((item) => <button key={item} type="button" className={difficulty === item ? `selected ${difficultyMeta[item].className}` : ""} onClick={() => setDifficulty(item)}><span className={`difficulty-dot ${difficultyMeta[item].className}`} /> <strong>{item}</strong><small>+{difficultyMeta[item].points} pts</small></button>)}</div></fieldset><button className="primary-button wide" disabled={!canStart} onClick={saveAndStart}>ENTRAR NO JOGO <ArrowRight size={17} /></button><p className="form-footnote">Você pode alterar a dificuldade depois no seu perfil.</p></div></div></div>;
}

function ChallengeCard({ card, onClick }: { card: typeof challengeCards[number]; onClick: () => void }) {
  const Icon = card.icon;
  return <button className="challenge-card" onClick={onClick}><span className={`challenge-icon ${card.tone}`}><Icon size={21} /></span><span className="challenge-meta"><small>{card.eyebrow}</small><strong>{card.title}</strong><span>{card.description}</span></span><span className="challenge-foot"><em>{card.stat}</em><ArrowUpRightIcon /></span></button>;
}

function ArrowUpRightIcon() { return <span className="arrow-circle"><ArrowRight size={14} /></span>; }

function PlayPage(props: {
  player: Player; activeChallenge: ChallengeKey; startChallenge: (challenge: ChallengeKey) => void; gameQuestions: Question[]; currentQuestion?: Question; questionIndex: number; selectedAnswer: number | null; feedback: "correct" | "wrong" | null; submitAnswer: (index: number) => void; nextQuestion: () => void; score: number; streak: number; lives: number; timeLeft: number; result: { score: number; correct: number; total: number; bestStreak: number; time: number; rank: number; gap: number } | null; foundErrors: string[]; chooseError: (id: string) => void; kanbanCards: { todo: string[]; doing: string[]; done: string[] }; selectedKanban: string | null; setSelectedKanban: (value: string | null) => void; moveKanban: (lane: "todo" | "doing" | "done") => void; go: (page: Page) => void;
}) {
  const { player, activeChallenge, startChallenge, gameQuestions, currentQuestion, questionIndex, selectedAnswer, feedback, submitAnswer, nextQuestion, score, streak, lives, timeLeft, result, foundErrors, chooseError, kanbanCards, selectedKanban, setSelectedKanban, moveKanban, go } = props;
  const title = challengeCards.find((item) => item.key === activeChallenge)?.title || "Desafio";
  return <div className="page play-page"><div className="play-toolbar"><button className="back-link" onClick={() => go("home")}><ArrowLeft size={16} /> Central de missões</button><div className="live-stats"><span><Trophy size={15} /> {formatNumber(score)}</span><span className="streak-stat"><Flame size={15} /> x{streak}</span><span><Heart size={15} fill="currentColor" /> {lives}</span><span className="timer"><Clock3 size={15} /> {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}</span></div></div><div className="play-layout"><aside className="challenge-sidebar"><div className="sidebar-label">MISSÕES</div>{challengeCards.map((card) => { const Icon = card.icon; return <button key={card.key} className={activeChallenge === card.key ? `mission-link active ${card.tone}` : "mission-link"} onClick={() => startChallenge(card.key)}><Icon size={17} /><span>{card.title}</span><ChevronRight size={14} /></button>; })}<div className="sidebar-tip"><Sparkles size={16} /><strong>Dica de campeão</strong><span>Sequências de acertos liberam bônus especiais.</span></div></aside><section className="game-stage"><div className="game-stage-head"><div><div className="eyebrow">DESAFIO ATIVO • {difficultyMeta[player.difficulty].className.toUpperCase()}</div><h1>{title}</h1></div><div className="stage-progress"><span>PROGRESSO</span><strong>{activeChallenge === "errors" ? `${foundErrors.length}/6` : activeChallenge === "kanban" ? `${kanbanCards.done.length}/3` : `${Math.min(questionIndex + (selectedAnswer !== null ? 1 : 0), gameQuestions.length)}/${gameQuestions.length || 8}`}</strong><div><i style={{ width: `${activeChallenge === "errors" ? (foundErrors.length / 6) * 100 : activeChallenge === "kanban" ? Math.min(100, (kanbanCards.done.length / 3) * 100) : (Math.min(questionIndex + (selectedAnswer !== null ? 1 : 0), gameQuestions.length) / (gameQuestions.length || 8)) * 100}%` }} /></div></div></div>{result ? <ResultCard result={result} player={player} go={go} replay={() => startChallenge(activeChallenge)} /> : activeChallenge === "errors" ? <ErrorHunt foundErrors={foundErrors} chooseError={chooseError} /> : activeChallenge === "kanban" ? <KanbanBoard cards={kanbanCards} selected={selectedKanban} setSelected={setSelectedKanban} move={moveKanban} /> : <QuizCard difficulty={player.difficulty} question={currentQuestion} index={questionIndex} selected={selectedAnswer} feedback={feedback} submit={submitAnswer} next={nextQuestion} score={score} streak={streak} />}</section></div></div>;
}

function QuizCard({ difficulty, question, index, selected, feedback, submit, next, score, streak }: { difficulty: Difficulty; question?: Question; index: number; selected: number | null; feedback: "correct" | "wrong" | null; submit: (index: number) => void; next: () => void; score: number; streak: number }) {
  if (!question) return <div className="empty-state"><CircleHelp size={34} /><h2>Carregando missão...</h2><p>Escolha uma missão ao lado para começar.</p></div>;
  return <div className="quiz-wrap"><div className="quiz-card"><div className="quiz-card-top"><span className="question-number">QUESTÃO {String(index + 1).padStart(2, "0")}</span><span className="category-tag">{question.category}</span></div><h2>{question.prompt}</h2><div className="answers">{question.options.map((option, optionIndex) => { const isRight = optionIndex === question.answer; const isSelected = selected === optionIndex; const state = selected !== null ? isRight ? "right" : isSelected ? "wrong" : "muted" : ""; return <button key={option} className={`answer-option ${state}`} onClick={() => submit(optionIndex)} disabled={selected !== null}><span className="answer-letter">{String.fromCharCode(65 + optionIndex)}</span><span>{option}</span>{selected !== null && isRight && <CheckCircle2 size={18} />}{selected !== null && isSelected && !isRight && <X size={18} />}</button>; })}</div>{feedback && <div className={`answer-feedback ${feedback}`}><span className="feedback-icon">{feedback === "correct" ? <Check size={18} /> : <Info size={18} />}</span><span><strong>{feedback === "correct" ? `Boa! +${formatNumber(difficultyMeta[difficulty].points)} pontos` : "Quase! Aprendizado desbloqueado"}</strong><small>{question.explanation}</small></span></div>}<div className="quiz-card-foot"><span><Zap size={15} /> Sequência atual: <strong>x{streak}</strong></span>{selected !== null && <button className="primary-button next-button" onClick={next}>{index >= 7 ? "VER RESULTADO" : "PRÓXIMA QUESTÃO"} <ArrowRight size={15} /></button>}</div></div><div className="quiz-side-note"><Target size={18} /><div><strong>Jogue com atenção</strong><span>Você ganha mais pontos com acerto e velocidade. Errar tira uma vida.</span></div><div className="score-mini"><span>PLACAR</span><strong>{formatNumber(score)}</strong></div></div></div>;
}

const errorHotspots = [
  { id: "ppe", label: "EPI incompleto", top: "41%", left: "55%", note: "Proteção ocular deve ser usada conforme o risco." },
  { id: "spill", label: "Vazamento", top: "72%", left: "16%", note: "Sinalize, isole e comunique o derramamento." },
  { id: "blocked", label: "Passagem bloqueada", top: "72%", left: "67%", note: "Rotas demarcadas precisam permanecer livres." },
  { id: "stock", label: "Estoque excessivo", top: "74%", left: "47%", note: "Excesso de estoque ocupa espaço e esconde problemas." },
  { id: "waste", label: "Resíduo misturado", top: "78%", left: "91%", note: "Segregue resíduos no ponto de geração." },
  { id: "tool", label: "Ferramenta fora do lugar", top: "32%", left: "16%", note: "O 5S facilita encontrar e devolver ferramentas." },
];

function ErrorHunt({ foundErrors, chooseError }: { foundErrors: string[]; chooseError: (id: string) => void }) {
  return <div className="error-hunt"><div className="error-instruction"><span><Search size={17} /> Clique nos pontos da cena onde você identifica uma anomalia.</span><strong>{foundErrors.length}/6 encontrados</strong></div><div className="factory-board"><img src="/manus-storage/factory-error-hunt_8a64efc8.png" alt="Cena de fábrica com riscos escondidos" />{errorHotspots.map((spot) => <button key={spot.id} className={foundErrors.includes(spot.id) ? "hotspot found" : "hotspot"} style={{ top: spot.top, left: spot.left }} onClick={() => chooseError(spot.id)} aria-label={spot.label}>{foundErrors.includes(spot.id) ? <Check size={15} /> : <span />}</button>)}</div><div className="found-list">{errorHotspots.map((spot) => <div key={spot.id} className={foundErrors.includes(spot.id) ? "found-item found" : "found-item"}><span>{foundErrors.includes(spot.id) ? <Check size={13} /> : <span className="empty-dot" />}</span><span><strong>{spot.label}</strong><small>{foundErrors.includes(spot.id) ? spot.note : "Risco ainda não identificado"}</small></span></div>)}</div></div>;
}

function KanbanBoard({ cards, selected, setSelected, move }: { cards: { todo: string[]; doing: string[]; done: string[] }; selected: string | null; setSelected: (value: string | null) => void; move: (lane: "todo" | "doing" | "done") => void }) {
  const lanes: Array<{ id: "todo" | "doing" | "done"; label: string; hint: string; color: string }> = [{ id: "todo", label: "A fazer", hint: "Puxar quando houver capacidade", color: "cyan" }, { id: "doing", label: "Em produção", hint: "Limite WIP: 2 cartões", color: "yellow" }, { id: "done", label: "Concluído", hint: "Entregue ao próximo processo", color: "green" }];
  return <div className="kanban-wrap"><div className="kanban-banner"><div><div className="eyebrow">MISSÃO KANBAN</div><h2>Libere o fluxo sem sobrecarregar o sistema.</h2></div><div className="wip-badge"><span>WIP</span><strong>{cards.doing.length}/2</strong></div></div><p className="kanban-help">Selecione um cartão e escolha o próximo estágio. Respeite o limite de trabalho em processo.</p><div className="kanban-board">{lanes.map((lane) => <div key={lane.id} className={`kanban-lane ${lane.color}`}><div className="lane-head"><span><i />{lane.label}</span><strong>{cards[lane.id].length}</strong></div><small>{lane.hint}</small><div className="lane-cards">{cards[lane.id].map((card) => <button key={card} className={selected === card ? "kanban-card selected" : "kanban-card"} onClick={() => setSelected(selected === card ? null : card)}><span className="card-grip">⠿</span><span>{card}</span><ChevronRight size={14} /></button>)}</div>{selected && lane.id !== "todo" && <button className="lane-action" onClick={() => move(lane.id)}>Mover para {lane.label} <ArrowRight size={14} /></button>}</div>)}</div>{selected && <div className="selected-card-note"><CheckCircle2 size={16} /> Cartão selecionado: <strong>{selected}</strong><span>Escolha uma coluna de destino.</span></div>}</div>;
}

function ResultCard({ result, player, go, replay }: { result: { score: number; correct: number; total: number; bestStreak: number; time: number; rank: number; gap: number }; player: Player; go: (page: Page) => void; replay: () => void }) {
  return <div className="result-card"><div className="result-confetti"><span>✦</span><span>✧</span><span>+</span></div><div className="result-title"><div className="trophy-large"><Trophy size={30} /></div><div><div className="eyebrow">MISSÃO CONCLUÍDA</div><h2>Parabéns, {player.name.split(" ")[0]}!</h2><p>Você fez sua parte para uma fábrica mais segura e enxuta.</p></div></div><div className="result-score"><span>PONTUAÇÃO DA PARTIDA</span><strong>{formatNumber(result.score)}</strong><em>{result.score > 0 ? "Nova pontuação registrada" : "Tente novamente para pontuar"}</em></div><div className="result-grid"><div><span>ACERTOS</span><strong>{result.correct}/{result.total}</strong></div><div><span>TEMPO</span><strong>{String(Math.floor(result.time / 60)).padStart(2, "0")}:{String(result.time % 60).padStart(2, "0")}</strong></div><div><span>MELHOR SEQUÊNCIA</span><strong>{result.bestStreak} acertos</strong></div><div><span>POSIÇÃO ATUAL</span><strong>#{result.rank}</strong></div></div><div className="result-message">{result.rank <= 3 ? <><Trophy size={18} /> Você entrou no <strong>Top 3!</strong></> : result.gap > 0 ? <><Flame size={18} /> Faltam <strong>{formatNumber(result.gap)} pontos</strong> para ultrapassar o próximo jogador.</> : <><Sparkles size={18} /> Nova melhor pontuação!</>}</div><div className="result-actions"><button className="primary-button" onClick={replay}><RotateCcw size={16} /> JOGAR NOVAMENTE</button><button className="secondary-button" onClick={() => go("ranking")}><Trophy size={16} /> VER RANKING</button><button className="text-button" onClick={() => go("learn")}>Aprender mais <ArrowRight size={15} /></button></div></div>;
}

function RankingPage({ leaders, player, sectorScores }: { leaders: Leader[]; player: Player; sectorScores: [string, number][] }) {
  const sorted = [...leaders].sort((a, b) => b.score - a.score);
  const podium = sorted.slice(0, 3);
  return <div className="page ranking-page"><div className="page-heading-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> COMPETIÇÃO SAUDÁVEL</div><h1>Ranking <span>SIPATMA</span></h1><p>Quem está colocando a melhoria em movimento?</p></div><div className="live-pill"><span className="pulse-dot" /> ATUALIZADO AGORA</div></div><div className="podium-grid">{podium.map((leader, index) => <div key={leader.name} className={`podium-card place-${index + 1}`}><div className="podium-medal">{index === 0 ? "♛" : index === 1 ? "Ⅱ" : "Ⅲ"}</div><span className="podium-place">TOP {index + 1}</span><strong>{leader.name}</strong><small>{leader.sector}</small><b>{formatNumber(leader.score)} <em>pts</em></b><i className={`level-badge ${difficultyMeta[leader.level].className}`}>{leader.level}</i></div>)}</div><div className="ranking-content"><section className="table-card"><div className="table-head"><div><div className="eyebrow">PLACAR GERAL</div><h2>Todos os participantes</h2></div><span className="participant-count"><Users size={14} /> {sorted.length + (player.name !== "Visitante" && !sorted.some((item) => item.name === player.name) ? 1 : 0)} jogadores</span></div><div className="rank-table"><div className="rank-row rank-header"><span>POSIÇÃO</span><span>JOGADOR</span><span>SETOR</span><span>PONTUAÇÃO</span><span>NÍVEL</span></div>{sorted.map((leader, index) => <div key={leader.name} className={leader.name === player.name ? "rank-row is-you" : "rank-row"}><span className="rank-number">{index < 3 ? ["🥇", "🥈", "🥉"][index] : `#${index + 1}`}</span><span className="rank-name"><span className="tiny-avatar">{leader.name.slice(0, 1)}</span>{leader.name}{leader.name === player.name && <em>VOCÊ</em>}</span><span>{leader.sector}</span><strong>{formatNumber(leader.score)}</strong><span className={`level-badge ${difficultyMeta[leader.level].className}`}>{leader.level}</span></div>)}</div></section><aside className="sector-card"><div className="eyebrow">RANKING POR SETOR</div><h2>Setor campeão</h2><div className="sector-champion"><span><Trophy size={22} /></span><div><strong>{sectorScores[0]?.[0] || "Produção"}</strong><small>{formatNumber(sectorScores[0]?.[1] || 0)} pontos acumulados</small></div></div><div className="sector-bars">{sectorScores.slice(0, 5).map(([sector, total], index) => <div key={sector}><div><span>{sector}</span><strong>{formatNumber(total)}</strong></div><div className="bar-track"><i style={{ width: `${Math.max(12, (total / (sectorScores[0]?.[1] || 1)) * 100)}%`, background: index === 0 ? accent.yellow : accent.cyan }} /></div></div>)}</div></aside></div></div>;
}

const learnConcepts = [
  { title: "SIPATMA", tag: "Cultura", icon: ShieldCheck, text: "Segurança, saúde, meio ambiente e qualidade de vida fazem parte de uma mesma atitude: cuidar das pessoas e do futuro." },
  { title: "Lean Manufacturing", tag: "Fluxo", icon: BarChart3, text: "Uma forma de trabalhar que busca valor para o cliente, elimina desperdícios e aprende com o processo real." },
  { title: "5S", tag: "Organização", icon: Grid3X3, text: "Seiri, Seiton, Seiso, Seiketsu e Shitsuke: utilizar, organizar, limpar, padronizar e sustentar." },
  { title: "Kaizen", tag: "Melhoria", icon: Sparkles, text: "Melhoria contínua feita por quem conhece o processo. Pequenos ganhos consistentes geram grandes resultados." },
  { title: "Kanban", tag: "Puxada", icon: PackageCheck, text: "Um sistema visual para equilibrar demanda e capacidade, limitar o WIP e tornar o fluxo mais previsível." },
  { title: "Just in Time", tag: "Ritmo", icon: Clock3, text: "Produzir o necessário, na hora necessária e na quantidade necessária, evitando antecipação e excesso." },
  { title: "8 desperdícios", tag: "Olhar Lean", icon: Target, text: "Transporte, estoque, movimento, espera, superprodução, processamento excessivo, defeitos e talento não utilizado." },
  { title: "Meio ambiente", tag: "Impacto", icon: Leaf, text: "Cada escolha de energia, água, material e resíduo ajuda a construir uma operação mais responsável." },
];

function LearnPage() {
  const [selected, setSelected] = useState(0);
  const item = learnConcepts[selected];
  const Icon = item.icon;
  return <div className="page learn-page"><div className="page-heading-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> MICRO-APRENDIZADO</div><h1>Aprenda para <span>jogar melhor.</span></h1><p>Conceitos rápidos para levar do jogo para o gemba.</p></div><div className="learn-progress"><span>TRILHA DE CONHECIMENTO</span><strong>{String(selected + 1).padStart(2, "0")} / {String(learnConcepts.length).padStart(2, "0")}</strong></div></div><div className="learn-layout"><aside className="learn-nav">{learnConcepts.map((concept, index) => { const ConceptIcon = concept.icon; return <button key={concept.title} className={selected === index ? "selected" : ""} onClick={() => setSelected(index)}><ConceptIcon size={17} /><span>{concept.title}</span><ChevronRight size={14} /></button>; })}</aside><section className="concept-detail"><div className="concept-number">0{selected + 1}</div><div className="concept-icon-large"><Icon size={28} /></div><span className="concept-tag">{item.tag}</span><h2>{item.title}</h2><p>{item.text}</p><div className="concept-example"><span><Info size={17} /></span><div><strong>Como aparece no jogo</strong><small>{selected === 0 ? "Você toma decisões seguras em situações reais da fábrica." : selected === 1 ? "Você encontra e elimina desperdícios para liberar o fluxo." : selected === 2 ? "Você organiza o posto e torna as anormalidades visíveis." : selected === 3 ? "Você escolhe uma contramedida simples e sustentável." : "Você transforma conhecimento em uma decisão de processo."}</small></div></div><div className="detail-nav"><button disabled={selected === 0} onClick={() => setSelected(selected - 1)}><ArrowLeft size={15} /> Anterior</button><button disabled={selected === learnConcepts.length - 1} onClick={() => setSelected(selected + 1)}>Próximo <ArrowRight size={15} /></button></div></section></div></div>;
}

function AchievementsPage({ player }: { player: Player }) {
  return <div className="page achievements-page"><div className="page-heading-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> SUA EVOLUÇÃO</div><h1>Conquistas <span>desbloqueadas.</span></h1><p>Cada badge representa uma atitude que move a melhoria.</p></div><div className="achievement-count"><strong>{player.badges.length}</strong><span>/ {badgeCatalog.length} badges</span></div></div><div className="achievement-grid">{badgeCatalog.map((badge) => { const unlocked = player.badges.includes(badge.id); return <div key={badge.id} className={unlocked ? `achievement-card unlocked ${badge.color}` : "achievement-card locked"}><div className="badge-symbol">{unlocked ? badge.icon : <LockKeyhole size={21} />}</div><div><strong>{badge.name}</strong><p>{badge.detail}</p></div>{unlocked ? <CheckCircle2 size={18} className="badge-check" /> : <span className="locked-label">BLOQUEADO</span>}</div>; })}</div><div className="achievement-tip"><Award size={19} /><div><strong>Próximo desbloqueio</strong><span>Complete um desafio de segurança ou ambiental para ganhar uma nova medalha.</span></div></div></div>;
}

function ProfilePage({ player, rank, go }: { player: Player; rank: number; go: (page: Page) => void }) {
  const accuracy = player.correct + player.errors > 0 ? Math.round((player.correct / (player.correct + player.errors)) * 100) : 0;
  return <div className="page profile-page"><div className="profile-hero"><div className="profile-avatar">{player.name.slice(0, 1).toUpperCase()}</div><div><div className="eyebrow">PERFIL DO JOGADOR</div><h1>{player.name}</h1><p>{player.sector} <span>•</span> Nível {player.highestDifficulty}</p></div><button className="secondary-button" onClick={() => go("setup")}><Settings2 size={15} /> Editar perfil</button></div><div className="profile-highlight"><div><span>PONTUAÇÃO TOTAL</span><strong>{formatNumber(player.totalScore)}</strong><small><Trophy size={13} /> {rank <= 3 ? "Você está no pódio!" : `Posição #${rank} no ranking`}</small></div><div><span>PRECISÃO</span><strong>{accuracy}%</strong><div className="profile-progress"><i style={{ width: `${accuracy}%` }} /></div></div><div><span>MELHOR SEQUÊNCIA</span><strong>{player.bestStreak}</strong><small><Flame size={13} /> recorde pessoal</small></div></div><div className="stats-grid"><div className="stat-card"><span><Play size={17} /></span><small>PARTIDAS</small><strong>{player.games}</strong></div><div className="stat-card"><span><CheckCircle2 size={17} /></span><small>ACERTOS</small><strong>{player.correct}</strong></div><div className="stat-card"><span><X size={17} /></span><small>ERROS</small><strong>{player.errors}</strong></div><div className="stat-card"><span><Zap size={17} /></span><small>MELHOR PARTIDA</small><strong>{formatNumber(player.bestScore)}</strong></div></div><div className="profile-bottom"><section className="recent-card"><div className="eyebrow">DESEMPENHO</div><h2>Seu radar de melhoria</h2><div className="radar-placeholder"><div className="radar-shape"><span>SEGURANÇA</span><span>LEAN</span><span>5S</span><span>AMBIENTE</span><div /></div></div></section><section className="profile-badges"><div className="eyebrow">BADGES</div><h2>Suas conquistas</h2><div className="mini-badges">{badgeCatalog.slice(0, 6).map((badge) => <div key={badge.id} className={player.badges.includes(badge.id) ? "mini-badge active" : "mini-badge"}>{player.badges.includes(badge.id) ? badge.icon : <LockKeyhole size={15} />}</div>)}</div><button className="text-button" onClick={() => go("achievements")}>Ver todas <ArrowRight size={14} /></button></section></div></div>;
}

function AdminPage({ unlocked, password, setPassword, error, unlock, resetDemo, player, leaders }: { unlocked: boolean; password: string; setPassword: (value: string) => void; error: string; unlock: () => void; resetDemo: () => void; player: Player; leaders: Leader[] }) {
  if (!unlocked) return <div className="page admin-gate"><div className="admin-gate-card"><span className="admin-lock"><LockKeyhole size={22} /></span><div className="eyebrow">ÁREA RESTRITA</div><h1>Painel <span>administrativo</span></h1><p>Gerencie o banco de perguntas, pontuações e indicadores da campanha.</p><label>Senha de acesso<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => event.key === "Enter" && unlock()} placeholder="Digite a senha" /></label>{error && <div className="form-error">{error}</div>}<button className="primary-button wide" onClick={unlock}>ACESSAR PAINEL <ArrowRight size={16} /></button><small className="demo-hint">Demonstração local • senha: CUMMINS2026</small></div></div>;
  return <div className="page admin-page"><div className="page-heading-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> CONTROLE DA CAMPANHA</div><h1>Painel <span>administrativo</span></h1><p>Visão rápida da operação do desafio SIPATMA.</p></div><div className="admin-live"><span className="pulse-dot" /> SISTEMA OPERACIONAL</div></div><div className="admin-stats"><div><Users size={18} /><span>JOGADORES</span><strong>{leaders.length}</strong><small>participantes no ranking</small></div><div><CircleHelp size={18} /><span>QUESTÕES ATIVAS</span><strong>{questionBank.length}</strong><small>banco diversificado</small></div><div><Trophy size={18} /><span>PARTIDAS REGISTRADAS</span><strong>{player.games}</strong><small>neste dispositivo</small></div><div><BarChart3 size={18} /><span>SETOR LÍDER</span><strong>Produção</strong><small>por pontuação acumulada</small></div></div><div className="admin-panels"><section className="admin-panel"><div className="panel-heading"><div><div className="eyebrow">BANCO DE CONTEÚDO</div><h2>Gerenciar perguntas</h2></div><button className="secondary-button"><Sparkles size={15} /> Nova pergunta</button></div><div className="question-summary"><div><strong>Segurança</strong><span>15 perguntas</span></div><div><strong>Lean Manufacturing</strong><span>15 perguntas</span></div><div><strong>Meio ambiente</strong><span>10 perguntas</span></div><div><strong>5S / Kaizen / Kanban</strong><span>20 perguntas</span></div></div><div className="admin-list"><div><span className="list-icon cyan"><ShieldCheck size={16} /></span><div><strong>Como agir ao encontrar um risco?</strong><small>Segurança • Médio • 200 pts</small></div><button><Settings2 size={15} /></button></div><div><span className="list-icon yellow"><BarChart3 size={16} /></span><div><strong>Identifique o desperdício no fluxo</strong><small>Lean Manufacturing • Difícil • 400 pts</small></div><button><Settings2 size={15} /></button></div></div></section><section className="admin-panel"><div className="panel-heading"><div><div className="eyebrow">MANUTENÇÃO</div><h2>Ações do sistema</h2></div><Settings2 size={20} /></div><div className="admin-actions"><button><LayoutDashboard size={16} /><span>Visualizar estatísticas<small>Indicadores por desafio e setor</small></span><ChevronRight size={15} /></button><button><Trophy size={16} /><span>Exportar ranking<small>Gerar relatório da campanha</small></span><ChevronRight size={15} /></button><button className="danger-action" onClick={resetDemo}><RotateCcw size={16} /><span>Resetar ranking de demonstração<small>Limpa os dados deste dispositivo</small></span><ChevronRight size={15} /></button></div></section></div></div>;
}

export default App;
