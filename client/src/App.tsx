import { useEffect, useMemo, useRef, useState } from "react";
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
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";

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
  Fácil: { points: 100, seconds: 120, color: accent.green, className: "easy" },
  Médio: { points: 200, seconds: 90, color: accent.yellow, className: "medium" },
  Difícil: { points: 400, seconds: 60, color: "#ff6b6b", className: "hard" },
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
  { key: "quiz", title: "Quiz de Segurança", eyebrow: "Conhecimento rápido", description: "Aprenda a reconhecer riscos, cuidar de si e proteger quem trabalha com você.", icon: ShieldCheck, tone: "cyan", stat: "40 perguntas" },
  { key: "errors", title: "Encontre os riscos", eyebrow: "Olhar atento", description: "Observe a fábrica e identifique situações que podem causar acidentes.", icon: Search, tone: "yellow", stat: "6 riscos visuais" },
  { key: "fiveS", title: "Organize e cuide", eyebrow: "Cuidado no posto", description: "Pratique organização, limpeza e disciplina para tornar o trabalho mais seguro.", icon: Grid3X3, tone: "green", stat: "20 perguntas" },
  { key: "environment", title: "Cuide do ambiente", eyebrow: "Responsabilidade", description: "Escolha atitudes que reduzem desperdícios e protegem o meio ambiente.", icon: Leaf, tone: "green", stat: "20 perguntas" },
];

const question = (id: number, category: Category, mode: ChallengeKey, difficulty: Difficulty, prompt: string, options: string[], answer: number, explanation: string): Question => ({ id, category, mode, difficulty, prompt, options, answer, explanation });

// 40-question SIPATMA bank: safety, care, prevention and environmental responsibility.
const questionBank: Question[] = [
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
  question(13, "Meio ambiente", "environment", "Fácil", "Qual atitude demonstra cuidado com o meio ambiente na rotina?", ["Misturar todos os resíduos", "Separar corretamente os resíduos e evitar desperdícios", "Deixar vazamentos para depois", "Usar mais água para terminar rápido"], 1, "Cuidar do ambiente começa em atitudes simples: separar, reduzir, reutilizar e comunicar anormalidades."),
  question(14, "Meio ambiente", "environment", "Fácil", "Ao perceber um vazamento de água ou óleo, você deve:", ["Ignorar se for pequeno", "Sinalizar, comunicar e seguir o procedimento de contenção", "Lavar o local para esconder", "Esperar o fim do turno"], 1, "Comunicar rapidamente evita impactos maiores e ajuda a equipe responsável a agir com segurança."),
  question(15, "Meio ambiente", "environment", "Médio", "Por que reduzir desperdícios também é uma atitude de segurança?", ["Porque libera espaço, evita improvisos e reduz riscos no processo", "Porque deixa a meta mais fácil", "Porque substitui treinamentos", "Porque elimina a necessidade de inspeção"], 0, "Menos desperdício significa um ambiente mais organizado, previsível e seguro para as pessoas."),
  question(16, "Meio ambiente", "environment", "Difícil", "Qual escolha combina responsabilidade ambiental e SIPATMA?", ["Pensar apenas no custo imediato", "Considerar consumo, resíduos, pessoas e impactos antes de decidir", "Transferir o resíduo para outra área", "Produzir mais para compensar perdas"], 1, "SIPATMA conecta cuidado com pessoas, processo e ambiente em decisões responsáveis."),
  question(17, "Segurança", "safety", "Fácil", "Por que uma área isolada deve ser respeitada?", ["Porque o isolamento indica um risco que precisa ser controlado", "Porque evita conversa", "Porque é uma regra apenas para visitantes", "Porque aumenta a velocidade"], 0, "Respeitar isolamentos evita que pessoas entrem em áreas com energia, movimentação ou condições perigosas."),
  question(18, "Segurança", "safety", "Fácil", "Ao ouvir um alarme de emergência, qual é a primeira atitude?", ["Continuar trabalhando até alguém explicar", "Pegar o celular para filmar", "Interromper com segurança e seguir a rota e orientação previstas", "Correr para a área mais próxima"], 2, "Alarmes devem ser tratados com seriedade: pare com segurança e siga o plano de emergência."),
  question(19, "Segurança", "safety", "Fácil", "Uma ferramenta danificada deve ser:", ["Usada com mais cuidado", "Retirada de uso, identificada e comunicada", "Compartilhada com outra equipe", "Guardada sem avisar"], 1, "Ferramentas danificadas podem falhar e causar lesões; retire-as de uso e comunique o desvio."),
  question(20, "Segurança", "safety", "Fácil", "Qual atitude ajuda a manter uma rota de fuga segura?", ["Deixar materiais temporariamente no corredor", "Usar a rota como área de descanso", "Guardar caixas perto da porta", "Manter passagem, portas e sinalização livres"], 3, "Rotas de fuga precisam permanecer acessíveis, visíveis e livres de obstáculos."),
  question(21, "Segurança", "safety", "Médio", "Antes de intervir em uma máquina, a equipe deve confirmar:", ["Apenas se a máquina está desligada no painel", "O isolamento das fontes de energia e a ausência de energia residual", "Se há outra pessoa olhando", "Se a produção está atrasada"], 1, "O controle de energias perigosas exige isolamento, bloqueio, identificação e verificação."),
  question(22, "Segurança", "safety", "Médio", "Qual exemplo representa uma condição insegura?", ["Piso molhado sem sinalização em uma área de circulação", "Checklist preenchido antes da tarefa", "Ferramenta guardada no local definido", "Proteção instalada e inspecionada"], 0, "Condições inseguras devem ser identificadas, sinalizadas e corrigidas antes de causar um acidente."),
  question(23, "Segurança", "safety", "Médio", "Se o procedimento não contempla uma situação encontrada, o mais seguro é:", ["Improvisar seguindo a experiência", "Copiar o que outra pessoa fez", "Parar, avaliar o risco e buscar orientação responsável", "Continuar para não perder a meta"], 2, "Quando há dúvida ou mudança de condição, pare e busque orientação; improviso aumenta a exposição ao risco."),
  question(24, "Segurança", "safety", "Médio", "Ao levantar uma carga manualmente, você deve primeiro:", ["Testar o peso, avaliar a rota e usar ajuda ou recurso adequado", "Puxar rapidamente", "Girar o tronco para mudar de direção", "Levantar sozinho para demonstrar força"], 0, "Avaliar peso, pega, rota e necessidade de auxílio reduz sobrecarga e lesões musculoesqueléticas."),
  question(33, "Meio ambiente", "environment", "Fácil", "Qual prática reduz o desperdício de água na fábrica?", ["Deixar a torneira aberta durante a limpeza", "Comunicar vazamentos e usar somente o volume necessário", "Lavar áreas sem planejamento", "Aumentar a pressão sempre"], 1, "Usar água de forma consciente e corrigir vazamentos reduz consumo e impactos ambientais."),
  question(34, "Meio ambiente", "environment", "Fácil", "Resíduos devem ser descartados:", ["No recipiente identificado e compatível com sua classificação", "No primeiro recipiente disponível", "Junto com ferramentas", "No ralo quando forem líquidos"], 0, "A segregação correta evita contaminação, exposição e destinação inadequada."),
  question(35, "Meio ambiente", "environment", "Médio", "Ao encontrar um recipiente sem identificação, você deve:", ["Misturar com outro para liberar espaço", "Abrir para verificar o conteúdo", "Isolar e acionar a área responsável pela identificação", "Descartar como resíduo comum"], 2, "Um recipiente desconhecido deve ser tratado como potencialmente perigoso até ser identificado por pessoa competente."),
  question(36, "Meio ambiente", "environment", "Médio", "Qual ação ajuda a prevenir contaminação do solo?", ["Armazenar produtos sobre contenção adequada e inspecionar recipientes", "Deixar tambores diretamente no piso", "Lavar pequenos vazamentos para o ralo", "Guardar materiais ao ar livre sem proteção"], 0, "Contenção e inspeção reduzem a chance de vazamentos alcançarem o solo ou a drenagem."),
  question(37, "Meio ambiente", "environment", "Médio", "O que fazer ao identificar um odor químico incomum?", ["Ignorar se não houver fumaça", "Investigar aproximando o rosto", "Abrir todos os recipientes", "Afastar-se, comunicar e seguir o procedimento de emergência"], 3, "Odor incomum pode indicar exposição; afaste-se e comunique sem tentar investigar de forma insegura."),
  question(38, "Meio ambiente", "environment", "Difícil", "Uma boa prática para reduzir emissões e consumo de energia é:", ["Manter equipamentos ligados sem necessidade", "Identificar perdas, desligar o que não está em uso e melhorar eficiência", "Remover sensores", "Aumentar o tempo de funcionamento"], 1, "Eficiência depende de eliminar perdas e operar recursos conforme a necessidade real."),
  question(39, "Meio ambiente", "environment", "Difícil", "Quando há derramamento de produto, a resposta deve considerar:", ["Somente limpar rapidamente", "Apenas registrar a quantidade", "Segurança das pessoas, contenção, comunicação e destinação correta", "Esconder o local até a manutenção"], 2, "A resposta precisa proteger pessoas, impedir a propagação e garantir tratamento adequado do resíduo."),
  question(40, "Meio ambiente", "environment", "Difícil", "Qual decisão integra segurança, qualidade e meio ambiente?", ["Escolher o caminho mais rápido sempre", "Avaliar riscos, requisitos, consumo e impacto antes de executar", "Transferir o problema para outra área", "Priorizar custo sem avaliar consequências"], 1, "Decisões responsáveis equilibram pessoas, processo, conformidade, qualidade e impacto ambiental."),

  question(41, "Meio ambiente", "environment", "Fácil", "Qual é o primeiro passo ao identificar uma perda de material?", ["Acelerar o consumo para acabar logo", "Comunicar e investigar a origem da perda", "Esconder o material danificado", "Misturar com produto bom"], 1, "Comunicar a perda permite conter o impacto e investigar a causa antes que ela se repita."),
  question(42, "Meio ambiente", "environment", "Fácil", "O que deve ser feito com uma lâmpada quebrada?", ["Colocar no lixo comum sem proteção", "Esmagar os pedaços para caber", "Isolar e descartar conforme o procedimento aplicável", "Lavar no ralo"], 2, "Lâmpadas podem conter materiais que exigem manuseio e destinação específicos."),
  question(43, "Meio ambiente", "environment", "Médio", "Como evitar que um produto alcance a drenagem em um vazamento?", ["Usar contenção adequada e proteger ralos conforme o plano", "Empurrar o líquido com água", "Abrir mais ralos", "Aguardar a evaporação"], 0, "A contenção na fonte e a proteção da drenagem limitam a propagação do produto."),
  question(44, "Meio ambiente", "environment", "Médio", "A compra de um insumo mais barato deve considerar:", ["Somente o preço unitário", "Apenas o prazo de entrega", "Consumo, segurança, resíduos e ciclo de vida", "Se a embalagem é maior"], 2, "Decisões sustentáveis consideram impactos além do custo imediato."),
  question(45, "Meio ambiente", "environment", "Médio", "Qual comportamento reduz a geração de resíduos de embalagem?", ["Pedir material extra para garantir", "Escolher embalagens adequadas e evitar descartáveis desnecessários", "Descartar sobras junto com recicláveis", "Abrir todas as embalagens antes de usar"], 1, "Planejamento e escolha adequada de materiais reduzem resíduos na origem."),
  question(46, "Meio ambiente", "environment", "Difícil", "Um indicador ambiental piorou por três meses. A equipe deve:", ["Parar de medir", "Alterar a meta para parecer melhor", "Analisar tendência, causas e ações corretivas", "Registrar somente o melhor mês"], 2, "Indicadores servem para revelar tendências e orientar ações verificáveis."),
  question(47, "Meio ambiente", "environment", "Difícil", "Qual é uma evidência de controle ambiental eficaz?", ["Um procedimento guardado sem uso", "Uma inspeção com ação concluída e resultado acompanhado", "Uma promessa verbal", "Uma área sem placa"], 1, "Controle eficaz combina ação, responsabilidade, evidência e verificação do resultado."),
  question(48, "Meio ambiente", "environment", "Difícil", "Ao observar fumaça ou emissão fora do padrão, a atitude correta é:", ["Ignorar se o turno estiver acabando", "Filmar e publicar imediatamente", "Afastar-se se houver risco e comunicar pelo canal definido", "Cobrir a saída da emissão"], 2, "Emissões anormais devem ser comunicadas com segurança para avaliação e resposta adequadas."),
  question(49, "5S", "fiveS", "Fácil", "No 5S, separar o necessário do desnecessário significa:", ["Guardar tudo para evitar falta", "Manter apenas o que tem uso definido no local", "Jogar fora sem consultar", "Colocar itens em qualquer armário"], 1, "O senso de utilização reduz excesso e deixa disponível apenas o que faz sentido para a atividade."),
  question(50, "5S", "fiveS", "Fácil", "Qual é um exemplo de Seiton?", ["Definir lugar, identificação e acesso para cada item", "Limpar somente antes da auditoria", "Comprar mais ferramentas", "Retirar todas as etiquetas"], 0, "Ordenar é definir um lugar visível e funcional para cada coisa."),
  question(51, "5S", "fiveS", "Fácil", "A limpeza no 5S também serve para:", ["Deixar a área bonita para visitantes", "Encontrar fontes de sujeira, vazamentos e anormalidades", "Substituir manutenção", "Evitar inspeções"], 1, "Limpar permite inspecionar e perceber anormalidades antes que se agravem."),
  question(52, "5S", "fiveS", "Fácil", "Uma etiqueta vermelha deve ser usada para:", ["Identificar itens sem uso claro para avaliação", "Marcar itens favoritos", "Decorar a bancada", "Indicar que a tarefa acabou"], 0, "A etiqueta vermelha ajuda a separar dúvidas e excessos para decisão responsável."),
  question(53, "5S", "fiveS", "Médio", "Uma bancada com ferramentas misturadas aumenta o risco de:", ["Encontrar tudo mais rápido", "Perda de tempo, danos e uso de ferramenta inadequada", "Melhorar o fluxo", "Reduzir o estoque"], 1, "A desorganização dificulta localizar, conferir e devolver ferramentas corretamente."),
  question(54, "5S", "fiveS", "Médio", "Qual é a melhor forma de manter um padrão 5S?", ["Depender da memória de cada pessoa", "Usar referências visuais, rotina e responsáveis definidos", "Fazer uma grande limpeza anual", "Mudar o local toda semana"], 1, "Padrões visuais e rotina tornam o comportamento esperado claro e sustentável."),
  question(55, "5S", "fiveS", "Médio", "Se um item não tem local definido, a equipe deve:", ["Deixá-lo no chão até alguém procurar", "Criar uma solução visual e confirmar com o processo", "Esconder na gaveta mais próxima", "Comprar outro igual"], 1, "O local precisa ser definido de forma funcional para evitar repetição da desordem."),
  question(56, "5S", "fiveS", "Médio", "Qual atitude é contrária ao senso de limpeza?", ["Investigar uma fonte de vazamento", "Limpar e devolver o material ao lugar", "Usar pano sujo para espalhar óleo e ocultar a origem", "Manter o piso sinalizado durante a limpeza"], 2, "Limpeza não deve esconder a causa; deve revelar e tratar a anormalidade."),
  question(57, "5S", "fiveS", "Médio", "Uma área visualmente organizada, mas com rotas bloqueadas:", ["Está adequada porque parece limpa", "Ainda possui um risco e precisa de correção", "Só precisa de uma foto", "Deve receber mais materiais"], 1, "Organização precisa apoiar segurança e fluxo, não apenas aparência."),
  question(58, "5S", "fiveS", "Médio", "Quem é responsável por manter o 5S?", ["Somente a equipe de limpeza", "Somente a liderança", "Todas as pessoas que usam e cuidam do local", "A auditoria externa"], 2, "5S é uma prática diária compartilhada por quem atua no processo."),
  question(59, "5S", "fiveS", "Difícil", "Um padrão visual deve ser revisado quando:", ["Nunca, depois de publicado", "O processo muda ou o padrão deixa de evitar desvios", "Somente quando alguém reclamar", "Apenas durante a auditoria"], 1, "Padrões precisam acompanhar mudanças e demonstrar que continuam eficazes."),
  question(60, "5S", "fiveS", "Difícil", "Qual indicador mostra uma oportunidade de melhoria no 5S?", ["Itens sem localização ou devolvidos em locais diferentes", "Todos os armários identificados", "Rotas livres", "Ferramentas em sombra definida"], 0, "Itens fora do padrão mostram que o sistema precisa ser ajustado ou reforçado."),
  question(61, "5S", "fiveS", "Difícil", "Ao encontrar um equipamento sem identificação, você deve:", ["Assumir que está liberado", "Identificar de qualquer forma", "Segregar e solicitar identificação conforme o procedimento", "Usar e depois perguntar"], 2, "Identificação evita uso indevido e permite controlar status e responsabilidade."),
  question(62, "5S", "fiveS", "Difícil", "Uma boa auditoria 5S deve:", ["Procurar culpados", "Comparar evidências com o padrão e gerar ações úteis", "Avaliar somente a aparência", "Ser feita sem falar com usuários"], 1, "Auditoria deve aprender com o processo e gerar melhorias verificáveis."),
  question(63, "5S", "fiveS", "Fácil", "Por que demarcar áreas de circulação?", ["Para ocupar mais espaço", "Para deixar claro onde pessoas e materiais podem circular", "Para substituir treinamento", "Para esconder obstáculos"], 1, "Demarcações tornam o fluxo esperado visível e ajudam a prevenir conflitos e bloqueios."),
  question(64, "5S", "fiveS", "Médio", "Quando um armário está cheio de itens raramente usados, o melhor é:", ["Adicionar outro sem avaliar", "Revisar uso, necessidade e destino dos itens", "Misturar com itens de emergência", "Retirar as etiquetas"], 1, "Revisar a necessidade evita excesso e libera espaço para o que realmente é usado."),
  question(65, "5S", "fiveS", "Médio", "Qual solução facilita a devolução de uma ferramenta?", ["Um local sem identificação", "Uma sombra ou endereço visual próximo ao ponto de uso", "Uma caixa trancada sem responsável", "Um armário distante"], 1, "A melhor solução combina identificação e proximidade com o trabalho."),
  question(66, "5S", "fiveS", "Difícil", "Se a mesma anormalidade aparece em várias auditorias, é necessário:", ["Parar de registrar", "Tratar a causa e revisar o padrão ou a rotina", "Reduzir a nota", "Trocar o formulário"], 1, "Repetição indica que a ação anterior não foi suficiente ou não foi sustentada."),
  question(67, "5S", "fiveS", "Difícil", "O 5S apoia a segurança porque:", ["Elimina a necessidade de EPI", "Reduz desordem, facilita percepção de desvios e melhora o fluxo", "Substitui bloqueio de energia", "Garante que ninguém erre"], 1, "Um ambiente ordenado ajuda a perceber riscos, mas não substitui controles técnicos e procedimentos."),
  question(68, "5S", "fiveS", "Fácil", "Qual atitude sustenta o senso de autodisciplina?", ["Fazer somente quando alguém observa", "Cumprir o padrão e ajudar a melhorá-lo quando necessário", "Esperar a próxima auditoria", "Deixar para o colega"], 1, "Autodisciplina é praticar o padrão de forma consistente e participar da melhoria."),

];

const sectorOptions = ["Produção", "Qualidade", "Manutenção", "Logística", "Engenharia", "Administrativo", "Outros"];

const initialPlayer: Player = { name: "Visitante", sector: "Produção", difficulty: "Médio", totalScore: 0, games: 0, correct: 0, errors: 0, bestScore: 0, bestStreak: 0, highestDifficulty: "Fácil", badges: [] };

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function shuffleQuestion(item: Question): Question {
  const randomized = shuffle(item.options.map((option, index) => ({ option, index })));
  return { ...item, options: randomized.map((item) => item.option), answer: randomized.findIndex((entry) => entry.index === item.answer) };
}

function timeAdjustedPoints(difficulty: Difficulty, elapsedSeconds: number) {
  const base = difficultyMeta[difficulty].points;
  const limit = difficultyMeta[difficulty].seconds;
  const progress = Math.min(1, Math.max(0, elapsedSeconds / Math.max(1, limit)));
  const multiplier = Math.max(0.25, 1 - progress * 0.75);
  return Math.max(25, Math.round((base * multiplier) / 5) * 5);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function App() {
  const analytics = trpc.analytics;
  const visitorKeyRef = useRef<string>("");
  const sessionKeyRef = useRef<string | null>(null);
  const recordVisit = analytics.recordVisit.useMutation();
  const startSessionMutation = analytics.startSession.useMutation();
  const recordAnswerMutation = analytics.recordAnswer.useMutation();
  const completeSessionMutation = analytics.completeSession.useMutation();
  const publicStats = analytics.publicStats.useQuery();
  const publicLeaderboard = analytics.publicLeaderboard.useQuery();
  const auth = useAuth();
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
  const [earnedThisAnswer, setEarnedThisAnswer] = useState(0);
  const [streak, setStreak] = useState(0);
  const [roundBestStreak, setRoundBestStreak] = useState(0);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [roundErrors, setRoundErrors] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [result, setResult] = useState<{ score: number; correct: number; total: number; bestStreak: number; time: number; rank: number; gap: number } | null>(null);
  const [foundErrors, setFoundErrors] = useState<string[]>([]);
  const [wrongErrorClicks, setWrongErrorClicks] = useState(0);
  const [kanbanCards, setKanbanCards] = useState({ todo: ["Kit de vedação", "Inspeção final", "Ordem 2048"], doing: ["Setup prensa"], done: ["Lote 2047"] });
  const [selectedKanban, setSelectedKanban] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem("sipatma-player", JSON.stringify(player)); }, [player]);
  useEffect(() => { localStorage.setItem("sipatma-leaders", JSON.stringify(leaders)); }, [leaders]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sipatma-visitor-key") || crypto.randomUUID();
      localStorage.setItem("sipatma-visitor-key", saved);
      visitorKeyRef.current = saved;
      recordVisit.mutate({ visitorKey: saved, userAgent: navigator.userAgent, referrer: document.referrer || undefined, path: window.location.pathname });
    } catch {
      // Analytics must never block the public game when browser storage is unavailable.
    }
  }, []);

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
  const displayedLeaders = useMemo<Leader[]>(() => publicLeaderboard.data?.length ? publicLeaderboard.data.map((leader) => ({ name: leader.name, sector: leader.sector, score: Number(leader.score), level: leader.level as Difficulty })) : leaders, [publicLeaderboard.data, leaders]);

  const go = (next: Page) => { setPage(next); setSidebarOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const startChallenge = (challenge: ChallengeKey, playerForRound: Player = player) => {
    const sessionKey = crypto.randomUUID();
    sessionKeyRef.current = sessionKey;
    setActiveChallenge(challenge);
    setResult(null);
    setSelectedAnswer(null);
    setFeedback(null);
    setQuestionIndex(0);
    setScore(0);
    setEarnedThisAnswer(0);
    setStreak(0);
    setRoundBestStreak(0);
    setRoundCorrect(0);
    setRoundErrors(0);
    setLives(3);
    setFoundErrors([]);
    setWrongErrorClicks(0);
    setSelectedKanban(null);
    setKanbanCards({ todo: ["Kit de vedação", "Inspeção final", "Ordem 2048"], doing: ["Setup prensa"], done: ["Lote 2047"] });
    setGameSeed((seed) => seed + 1);
    setStartedAt(Date.now());
    if (challenge === "errors") {
      setTimeLeft(difficultyMeta[playerForRound.difficulty].seconds);
      startSessionMutation.mutate({ sessionKey, playerName: playerForRound.name, sector: playerForRound.sector, difficulty: playerForRound.difficulty, challenge, totalQuestions: 6 });
      go("play");
      return;
    }
    const category = challenge === "quiz" ? undefined : challenge === "fiveS" ? "5S" : challenge === "lean" ? "Lean Manufacturing" : challenge === "kaizen" ? "Kaizen" : challenge === "kanban" ? "Kanban" : challenge === "safety" ? "Segurança" : "Meio ambiente";
    const pool = questionBank.filter((item) => item.difficulty === playerForRound.difficulty && (!category || item.category === category || (challenge === "quiz" && (item.mode === "safety" || item.mode === "environment"))));
    const themePool = questionBank.filter((item) => !category || item.category === category);
    const source = pool.length >= 8 ? pool : themePool.length ? themePool : pool;
    const questions = shuffle(source).slice(0, 8).map(shuffleQuestion);
    setGameQuestions(questions);
    setTimeLeft(difficultyMeta[playerForRound.difficulty].seconds);
    startSessionMutation.mutate({ sessionKey, playerName: playerForRound.name, sector: playerForRound.sector, difficulty: playerForRound.difficulty, challenge, totalQuestions: questions.length });
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
    if (sessionKeyRef.current) {
      completeSessionMutation.mutate({ sessionKey: sessionKeyRef.current, score: finalScore, correctAnswers: correct, incorrectAnswers: Math.max(0, total - correct), totalQuestions: total });
    }
  };

  const submitAnswer = (index: number) => {
    if (selectedAnswer !== null || !currentQuestion || result) return;
    const isCorrect = index === currentQuestion.answer;
    const nextStreak = isCorrect ? streak + 1 : 0;
    const bonus = isCorrect && nextStreak === 3 ? 100 : isCorrect && nextStreak === 5 ? 250 : isCorrect && nextStreak === 10 ? 500 : 0;
    const elapsedSeconds = startedAt ? Math.max(0, (Date.now() - startedAt) / 1000) : 0;
    const earned = isCorrect ? timeAdjustedPoints(player.difficulty, elapsedSeconds) + bonus : 0;
    setSelectedAnswer(index);
    setEarnedThisAnswer(earned);
    setFeedback(isCorrect ? "correct" : "wrong");
    setScore((value) => value + earned);
    setStreak(nextStreak);
    setRoundBestStreak((value) => Math.max(value, nextStreak));
    setRoundCorrect((value) => value + (isCorrect ? 1 : 0));
    setRoundErrors((value) => value + (isCorrect ? 0 : 1));
    setLives((value) => Math.max(0, value - (isCorrect ? 0 : 1)));
    if (sessionKeyRef.current) {
      recordAnswerMutation.mutate({ sessionKey: sessionKeyRef.current, questionId: currentQuestion.id, selectedAnswer: index, correct: isCorrect, points: earned, challenge: activeChallenge });
    }
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
    const elapsedSeconds = startedAt ? Math.max(0, (Date.now() - startedAt) / 1000) : 0;
    const points = timeAdjustedPoints(player.difficulty, elapsedSeconds);
    setScore((value) => value + points);
    setStreak((value) => value + 1);
    setRoundBestStreak((value) => Math.max(value, streak + 1));
    if (sessionKeyRef.current) {
      recordAnswerMutation.mutate({ sessionKey: sessionKeyRef.current, questionId: 1000 + errorHotspots.findIndex((spot) => spot.id === id), selectedAnswer: 1, correct: true, points, challenge: activeChallenge });
    }
    if (next.length === 6) finishGame(score + points, 6, 6, Math.max(roundBestStreak, streak + 1));
  };

  const missError = () => {
    if (result) return;
    setWrongErrorClicks((value) => value + 1);
    setScore((value) => Math.max(0, value - 25));
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
          <button className={page === "play" ? "active" : ""} onClick={() => go(player.name === "Visitante" ? "setup" : "play")}>Jogar agora</button>
          <button className={page === "ranking" ? "active" : ""} onClick={() => go("ranking")}>Ranking</button>
          <button className={page === "learn" ? "active" : ""} onClick={() => go("learn")}>Aprender</button>
        </nav>
        <div className="top-actions">
          <button className="score-chip" onClick={() => go("profile")}><Trophy size={16} /> <span>{formatNumber(player.totalScore)}</span></button>
          <button className="avatar-button" onClick={() => go("profile")}>{player.name === "Visitante" ? "V" : player.name.slice(0, 1).toUpperCase()}</button>
          <button className="mobile-menu" onClick={() => setSidebarOpen((value) => !value)} aria-label="Abrir menu"><Menu size={22} /></button>
        </div>
      </header>
      {sidebarOpen && <div className="mobile-nav"><div className="mobile-nav-title">MENU PRINCIPAL</div><button onClick={() => go("home")}>Início <small>Visão geral</small></button><button onClick={() => go(player.name === "Visitante" ? "setup" : "play")}>Jogar agora <small>Escolher uma missão</small></button><button onClick={() => go("ranking")}>Ranking <small>Acompanhar resultados</small></button><button onClick={() => go("learn")}>Aprender <small>Conteúdos SIPATMA</small></button><button onClick={() => go("profile")}>Meu perfil <small>Seu progresso</small></button></div>}

      <main>
        {page === "home" && <HomePage player={player} go={go} startChallenge={startChallenge} stats={publicStats.data} />}
        {page === "setup" && <SetupPage player={player} setPlayer={setPlayer} startChallenge={startChallenge} go={go} />}
        {page === "play" && <PlayPage player={player} activeChallenge={activeChallenge} startChallenge={startChallenge} gameQuestions={gameQuestions} currentQuestion={currentQuestion} questionIndex={questionIndex} selectedAnswer={selectedAnswer} feedback={feedback} submitAnswer={submitAnswer} nextQuestion={nextQuestion} score={score} earnedThisAnswer={earnedThisAnswer} streak={streak} lives={lives} timeLeft={timeLeft} result={result} foundErrors={foundErrors} wrongErrorClicks={wrongErrorClicks} chooseError={chooseError} missError={missError} kanbanCards={kanbanCards} selectedKanban={selectedKanban} setSelectedKanban={setSelectedKanban} moveKanban={moveKanban} go={go} />}
        {page === "ranking" && <RankingPage leaders={displayedLeaders} player={player} sectorScores={sectorScores} />}
        {page === "learn" && <LearnPage />}
        {page === "achievements" && <AchievementsPage player={player} />}
        {page === "profile" && <ProfilePage player={player} rank={playerRank} go={go} />}
        {page === "admin" && <AdminPage resetDemo={resetDemo} player={player} leaders={leaders} user={auth.user} authLoading={auth.loading} isAuthenticated={auth.isAuthenticated} />}
      </main>
      <footer className="footer"><span>© Cummins • Programa SIPATMA</span><span><button onClick={() => go("achievements")}>Conquistas</button><button onClick={() => go("admin")}>Admin</button></span></footer>
    </div>
  );
}

function HomePage({ player, go, startChallenge, stats }: { player: Player; go: (page: Page) => void; startChallenge: (challenge: ChallengeKey) => void; stats?: { uniqueVisitors: number; completedSessions: number; averageAccuracy: number } }) {
  return <div className="page home-page">
    <section className="hero-grid">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot" /> PROGRAMA SIPATMA 2026 <span className="eyebrow-line" /></div>
        <h1>Aprenda.<br /><span>Jogue.</span><br />Melhore.</h1>
        <p className="hero-lede">Uma experiência prática para aprender segurança, cuidado e responsabilidade na SIPATMA.</p>
        <div className="hero-actions"><button className="primary-button" onClick={() => go(player.name === "Visitante" ? "setup" : "play")}><Play size={17} fill="currentColor" /> COMEÇAR DESAFIO <ArrowRight size={17} /></button><button className="text-button" onClick={() => go("learn")}>Como funciona <ChevronRight size={15} /></button></div>
        <div className="hero-proof"><div className="proof-avatars"><span>CM</span><span>OS</span><span>SP</span><span>+</span></div><p><strong>{formatNumber(Number(stats?.uniqueVisitors || 0))} visitantes</strong><br /><span>acessos reais registrados</span></p></div>
      </div>
      <div className="hero-visual">
        <div className="visual-frame"><img src="/manus-storage/sipatma-reference_87b500c7.png" alt="Ilustração de uma linha de produção com segurança e Lean" /><div className="visual-tag tag-score"><span className="pulse-dot" /> PONTUAÇÃO <strong>12.450</strong></div><div className="visual-tag tag-safety"><ShieldCheck size={15} /> SAFETY FIRST</div><div className="visual-corner" /></div>
        <div className="hero-stats"><div><span>{stats ? `${Math.round(Number(stats.averageAccuracy || 0))}%` : "—"}</span><small>precisão média real</small></div><div><span>{formatNumber(Number(stats?.completedSessions || 0))}</span><small>partidas concluídas</small></div><div><span>{questionBank.length}</span><small>perguntas SIPATMA</small></div></div>
      </div>
    </section>
    <section className="osasco-feature"><div className="osasco-photo"><img src="/manus-storage/cummins-osasco-lab_3f8bd7f1.jpg" alt="Laboratório de ensaios mecânicos na unidade Cummins de Osasco" /><span>OSASCO • SP</span></div><div className="osasco-copy"><div className="eyebrow"><span className="eyebrow-dot" /> CUMMINS BRASIL</div><h2>Segurança também é <span>inovação.</span></h2><p>Conecte as atitudes do dia a dia ao cuidado com as pessoas, a qualidade do processo e a confiabilidade que movem a Cummins.</p><small>Imagem pública de referência: AutoIndústria, “Cummins reforça capacidades de laboratório em Osasco”. <a href="https://www.autoindustria.com.br/2025/02/20/cummins-reforca-capacidades-de-laboratorio-em-osasco/" target="_blank" rel="noreferrer">Ver fonte</a>. Use a imagem apenas conforme a autorização aplicável.</small></div></section>
    <section className="section-block featured-block"><div className="section-heading"><div><div className="eyebrow">CENTRAL DE MISSÕES</div><h2>Escolha como quer aprender</h2></div><button className="text-button" onClick={() => go("play")}>Ver todos <ArrowRight size={15} /></button></div><div className="challenge-grid">{challengeCards.slice(0, 4).map((card) => <ChallengeCard key={card.key} card={card} onClick={() => startChallenge(card.key)} />)}</div></section>
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
  player: Player; activeChallenge: ChallengeKey; startChallenge: (challenge: ChallengeKey) => void; gameQuestions: Question[]; currentQuestion?: Question; questionIndex: number; selectedAnswer: number | null; feedback: "correct" | "wrong" | null; submitAnswer: (index: number) => void; nextQuestion: () => void; score: number; earnedThisAnswer: number; streak: number; lives: number; timeLeft: number; result: { score: number; correct: number; total: number; bestStreak: number; time: number; rank: number; gap: number } | null; foundErrors: string[]; wrongErrorClicks: number; chooseError: (id: string) => void; missError: () => void; kanbanCards: { todo: string[]; doing: string[]; done: string[] }; selectedKanban: string | null; setSelectedKanban: (value: string | null) => void; moveKanban: (lane: "todo" | "doing" | "done") => void; go: (page: Page) => void;
}) {
  const { player, activeChallenge, startChallenge, gameQuestions, currentQuestion, questionIndex, selectedAnswer, feedback, submitAnswer, nextQuestion, score, earnedThisAnswer, streak, lives, timeLeft, result, foundErrors, wrongErrorClicks, chooseError, missError, kanbanCards, selectedKanban, setSelectedKanban, moveKanban, go } = props;
  const title = challengeCards.find((item) => item.key === activeChallenge)?.title || "Desafio";
  return <div className="page play-page"><div className="play-toolbar"><button className="back-link" onClick={() => go("home")}><ArrowLeft size={16} /> Escolha uma missão</button><div className="live-stats"><span><Trophy size={15} /> {formatNumber(score)}</span><span className="streak-stat"><Flame size={15} /> x{streak}</span><span><Heart size={15} fill="currentColor" /> {lives}</span><span className="timer"><Clock3 size={15} /> {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}</span></div></div><div className="play-layout"><aside className="challenge-sidebar"><div className="sidebar-label">MISSÕES</div>{challengeCards.map((card) => { const Icon = card.icon; return <button key={card.key} className={activeChallenge === card.key ? `mission-link active ${card.tone}` : "mission-link"} onClick={() => startChallenge(card.key)}><Icon size={17} /><span>{card.title}</span><ChevronRight size={14} /></button>; })}<div className="sidebar-tip"><Sparkles size={16} /><strong>Dica de campeão</strong><span>Sequências de acertos liberam bônus especiais.</span></div></aside><section className="game-stage"><div className="game-stage-head"><div><div className="eyebrow">DESAFIO ATIVO • {difficultyMeta[player.difficulty].className.toUpperCase()}</div><h1>{title}</h1></div><div className="stage-progress"><span>PROGRESSO</span><strong>{activeChallenge === "errors" ? `${foundErrors.length}/6` : activeChallenge === "kanban" ? `${kanbanCards.done.length}/3` : `${Math.min(questionIndex + (selectedAnswer !== null ? 1 : 0), gameQuestions.length)}/${gameQuestions.length || 8}`}</strong><div><i style={{ width: `${activeChallenge === "errors" ? (foundErrors.length / 6) * 100 : activeChallenge === "kanban" ? Math.min(100, (kanbanCards.done.length / 3) * 100) : (Math.min(questionIndex + (selectedAnswer !== null ? 1 : 0), gameQuestions.length) / (gameQuestions.length || 8)) * 100}%` }} /></div></div></div>{result ? <ResultCard result={result} player={player} go={go} replay={() => startChallenge(activeChallenge)} /> : activeChallenge === "errors" ? <ErrorHunt foundErrors={foundErrors} wrongErrorClicks={wrongErrorClicks} chooseError={chooseError} missError={missError} /> : activeChallenge === "kanban" ? <KanbanBoard cards={kanbanCards} selected={selectedKanban} setSelected={setSelectedKanban} move={moveKanban} /> : <QuizCard difficulty={player.difficulty} question={currentQuestion} index={questionIndex} selected={selectedAnswer} feedback={feedback} submit={submitAnswer} next={nextQuestion} score={score} earnedThisAnswer={earnedThisAnswer} streak={streak} />}</section></div></div>;
}

function QuizCard({ difficulty, question, index, selected, feedback, submit, next, score, earnedThisAnswer, streak }: { difficulty: Difficulty; question?: Question; index: number; selected: number | null; feedback: "correct" | "wrong" | null; submit: (index: number) => void; next: () => void; score: number; earnedThisAnswer: number; streak: number }) {
  if (!question) return <div className="empty-state"><CircleHelp size={34} /><h2>Carregando missão...</h2><p>Escolha uma missão ao lado para começar.</p></div>;
  return <div className="quiz-wrap"><div className="quiz-card"><div className="quiz-card-top"><span className="question-number">QUESTÃO {String(index + 1).padStart(2, "0")}</span><span className="category-tag">{question.category}</span></div><h2>{question.prompt}</h2><div className="answers">{question.options.map((option, optionIndex) => { const isRight = optionIndex === question.answer; const isSelected = selected === optionIndex; const state = selected !== null ? isRight ? "right" : isSelected ? "wrong" : "muted" : ""; return <button key={option} className={`answer-option ${state}`} onClick={() => submit(optionIndex)} disabled={selected !== null}><span className="answer-letter">{String.fromCharCode(65 + optionIndex)}</span><span>{option}</span>{selected !== null && isRight && <CheckCircle2 size={18} />}{selected !== null && isSelected && !isRight && <X size={18} />}</button>; })}</div>{feedback && <div className={`answer-feedback ${feedback}`}><span className="feedback-icon">{feedback === "correct" ? <Check size={18} /> : <Info size={18} />}</span><span><strong>{feedback === "correct" ? `Boa! +${formatNumber(earnedThisAnswer)} pontos` : "Quase! Aprendizado desbloqueado"}</strong><small>{question.explanation}</small></span></div>}<div className="quiz-card-foot"><span><Zap size={15} /> Quanto mais rápido, mais pontos: <strong>x{streak}</strong></span>{selected !== null && <button className="primary-button next-button" onClick={next}>{index >= 7 ? "VER RESULTADO" : "PRÓXIMA QUESTÃO"} <ArrowRight size={15} /></button>}</div></div><div className="quiz-side-note"><Target size={18} /><div><strong>Jogue com atenção</strong><span>Você ganha mais pontos quando responde rápido e corretamente.</span></div><div className="score-mini"><span>PLACAR</span><strong>{formatNumber(score)}</strong></div></div></div>;
}

const errorHotspots = [
  { id: "ppe", label: "EPI incompleto", top: "41%", left: "55%", note: "Proteção ocular deve ser usada conforme o risco." },
  { id: "spill", label: "Vazamento", top: "72%", left: "16%", note: "Sinalize, isole e comunique o derramamento." },
  { id: "blocked", label: "Passagem bloqueada", top: "72%", left: "67%", note: "Rotas demarcadas precisam permanecer livres." },
  { id: "stock", label: "Estoque excessivo", top: "74%", left: "47%", note: "Excesso de estoque ocupa espaço e esconde problemas." },
  { id: "waste", label: "Resíduo misturado", top: "78%", left: "91%", note: "Segregue resíduos no ponto de geração." },
  { id: "tool", label: "Ferramenta fora do lugar", top: "32%", left: "16%", note: "O 5S facilita encontrar e devolver ferramentas." },
];

function ErrorHunt({ foundErrors, wrongErrorClicks, chooseError, missError }: { foundErrors: string[]; wrongErrorClicks: number; chooseError: (id: string) => void; missError: () => void }) {
  return <div className="error-hunt"><div className="error-instruction"><span><Search size={17} /> Clique na cena onde você identifica uma anomalia.</span><strong>{foundErrors.length}/6 encontrados • {wrongErrorClicks} tentativas erradas</strong></div><div className="factory-board" onClick={missError}><img src="/manus-storage/factory-error-hunt_8a64efc8.png" alt="Cena de fábrica com riscos industriais para investigar" />{errorHotspots.map((spot) => <button key={spot.id} className={foundErrors.includes(spot.id) ? "hotspot found" : "hotspot"} style={{ top: spot.top, left: spot.left }} onClick={(event) => { event.stopPropagation(); chooseError(spot.id); }} aria-label="Investigar esta área">{foundErrors.includes(spot.id) ? <Check size={15} /> : <span />}</button>)}</div><div className="found-list">{errorHotspots.map((spot) => <div key={spot.id} className={foundErrors.includes(spot.id) ? "found-item found" : "found-item"}><span>{foundErrors.includes(spot.id) ? <Check size={13} /> : <span className="empty-dot" />}</span><span><strong>{foundErrors.includes(spot.id) ? spot.label : `Anomalia ${errorHotspots.indexOf(spot) + 1}`}</strong><small>{foundErrors.includes(spot.id) ? spot.note : "Observe a cena e encontre este risco"}</small></span></div>)}</div></div>;
}

function KanbanBoard({ cards, selected, setSelected, move }: { cards: { todo: string[]; doing: string[]; done: string[] }; selected: string | null; setSelected: (value: string | null) => void; move: (lane: "todo" | "doing" | "done") => void }) {
  const lanes: Array<{ id: "todo" | "doing" | "done"; label: string; hint: string; color: string }> = [{ id: "todo", label: "A fazer", hint: "Puxar quando houver capacidade", color: "cyan" }, { id: "doing", label: "Em produção", hint: "Limite WIP: 2 cartões", color: "yellow" }, { id: "done", label: "Concluído", hint: "Entregue ao próximo processo", color: "green" }];
  return <div className="kanban-wrap"><div className="kanban-banner"><div><div className="eyebrow">MISSÃO KANBAN</div><h2>Libere o fluxo sem sobrecarregar o sistema.</h2></div><div className="wip-badge"><span>WIP</span><strong>{cards.doing.length}/2</strong></div></div><p className="kanban-help">Selecione um cartão e escolha o próximo estágio. Respeite o limite de trabalho em processo.</p><div className="kanban-board">{lanes.map((lane) => <div key={lane.id} className={`kanban-lane ${lane.color}`}><div className="lane-head"><span><i />{lane.label}</span><strong>{cards[lane.id].length}</strong></div><small>{lane.hint}</small><div className="lane-cards">{cards[lane.id].map((card) => <button key={card} className={selected === card ? "kanban-card selected" : "kanban-card"} onClick={() => setSelected(selected === card ? null : card)}><span className="card-grip">⠿</span><span>{card}</span><ChevronRight size={14} /></button>)}</div>{selected && lane.id !== "todo" && <button className="lane-action" onClick={() => move(lane.id)}>Mover para {lane.label} <ArrowRight size={14} /></button>}</div>)}</div>{selected && <div className="selected-card-note"><CheckCircle2 size={16} /> Cartão selecionado: <strong>{selected}</strong><span>Escolha uma coluna de destino.</span></div>}</div>;
}

function ResultCard({ result, player, go, replay }: { result: { score: number; correct: number; total: number; bestStreak: number; time: number; rank: number; gap: number }; player: Player; go: (page: Page) => void; replay: () => void }) {
  return <div className="result-card"><div className="result-confetti"><span>✦</span><span>✧</span><span>+</span></div><div className="result-title"><div className="trophy-large"><Trophy size={30} /></div><div><div className="eyebrow">MISSÃO CONCLUÍDA</div><h2>Parabéns, {player.name.split(" ")[0]}!</h2><p>Você fez sua parte por uma fábrica mais segura e cuidadosa.</p></div></div><div className="result-score"><span>PONTUAÇÃO DA PARTIDA</span><strong>{formatNumber(result.score)}</strong><em>{result.score > 0 ? "Nova pontuação registrada" : "Tente novamente para pontuar"}</em></div><div className="result-grid"><div><span>ACERTOS</span><strong>{result.correct}/{result.total}</strong></div><div><span>TEMPO</span><strong>{String(Math.floor(result.time / 60)).padStart(2, "0")}:{String(result.time % 60).padStart(2, "0")}</strong></div><div><span>MELHOR SEQUÊNCIA</span><strong>{result.bestStreak} acertos</strong></div><div><span>POSIÇÃO ATUAL</span><strong>#{result.rank}</strong></div></div><div className="result-message">{result.rank <= 3 ? <><Trophy size={18} /> Você entrou no <strong>Top 3!</strong></> : result.gap > 0 ? <><Flame size={18} /> Faltam <strong>{formatNumber(result.gap)} pontos</strong> para ultrapassar o próximo jogador.</> : <><Sparkles size={18} /> Nova melhor pontuação!</>}</div><div className="result-actions"><button className="primary-button" onClick={replay}><RotateCcw size={16} /> JOGAR NOVAMENTE</button><button className="secondary-button" onClick={() => go("ranking")}><Trophy size={16} /> VER RANKING</button><button className="text-button" onClick={() => go("learn")}>Aprender mais <ArrowRight size={15} /></button></div></div>;
}

function RankingPage({ leaders, player, sectorScores }: { leaders: Leader[]; player: Player; sectorScores: [string, number][] }) {
  const sorted = [...leaders].sort((a, b) => b.score - a.score);
  const podium = sorted.slice(0, 3);
  return <div className="page ranking-page"><div className="page-heading-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> COMPETIÇÃO SAUDÁVEL</div><h1>Ranking <span>SIPATMA</span></h1><p>Quem está colocando a melhoria em movimento?</p></div><div className="live-pill"><span className="pulse-dot" /> ATUALIZADO AGORA</div></div><div className="podium-grid">{podium.map((leader, index) => <div key={leader.name} className={`podium-card place-${index + 1}`}><div className="podium-medal">{index === 0 ? "♛" : index === 1 ? "Ⅱ" : "Ⅲ"}</div><span className="podium-place">TOP {index + 1}</span><strong>{leader.name}</strong><small>{leader.sector}</small><b>{formatNumber(leader.score)} <em>pts</em></b><i className={`level-badge ${difficultyMeta[leader.level].className}`}>{leader.level}</i></div>)}</div><div className="ranking-content"><section className="table-card"><div className="table-head"><div><div className="eyebrow">PLACAR GERAL</div><h2>Todos os participantes</h2></div><span className="participant-count"><Users size={14} /> {sorted.length + (player.name !== "Visitante" && !sorted.some((item) => item.name === player.name) ? 1 : 0)} jogadores</span></div><div className="rank-table"><div className="rank-row rank-header"><span>POSIÇÃO</span><span>JOGADOR</span><span>SETOR</span><span>PONTUAÇÃO</span><span>NÍVEL</span></div>{sorted.map((leader, index) => <div key={leader.name} className={leader.name === player.name ? "rank-row is-you" : "rank-row"}><span className="rank-number">{index < 3 ? ["🥇", "🥈", "🥉"][index] : `#${index + 1}`}</span><span className="rank-name"><span className="tiny-avatar">{leader.name.slice(0, 1)}</span>{leader.name}{leader.name === player.name && <em>VOCÊ</em>}</span><span>{leader.sector}</span><strong>{formatNumber(leader.score)}</strong><span className={`level-badge ${difficultyMeta[leader.level].className}`}>{leader.level}</span></div>)}</div></section><aside className="sector-card"><div className="eyebrow">RANKING POR SETOR</div><h2>Setor campeão</h2><div className="sector-champion"><span><Trophy size={22} /></span><div><strong>{sectorScores[0]?.[0] || "Produção"}</strong><small>{formatNumber(sectorScores[0]?.[1] || 0)} pontos acumulados</small></div></div><div className="sector-bars">{sectorScores.slice(0, 5).map(([sector, total], index) => <div key={sector}><div><span>{sector}</span><strong>{formatNumber(total)}</strong></div><div className="bar-track"><i style={{ width: `${Math.max(12, (total / (sectorScores[0]?.[1] || 1)) * 100)}%`, background: index === 0 ? accent.yellow : accent.cyan }} /></div></div>)}</div></aside></div></div>;
}

const learnConcepts = [
  { title: "SIPATMA", tag: "Cultura", icon: ShieldCheck, text: "Segurança, saúde, meio ambiente e qualidade de vida fazem parte de uma mesma atitude: cuidar das pessoas e do futuro." },
  { title: "Perceba o risco", tag: "Prevenção", icon: Search, text: "Observe o ambiente, identifique perigos e não normalize desvios. Todo risco percebido é uma chance de prevenir." },
  { title: "Cuide do colega", tag: "Respeito", icon: Heart, text: "Uma cultura segura se constrói com diálogo, escuta e coragem para alertar com respeito quando algo pode machucar." },
  { title: "Trabalhe com atenção", tag: "Comportamento", icon: Target, text: "Siga procedimentos, use os controles previstos e pare quando as condições não forem seguras para continuar." },
  { title: "Organize o posto", tag: "Cuidado", icon: Grid3X3, text: "Organização, limpeza e sinalização tornam anormalidades visíveis e reduzem tropeços, erros e improvisos." },
  { title: "Proteja o ambiente", tag: "Responsabilidade", icon: Leaf, text: "Use recursos com consciência, separe resíduos e comunique vazamentos para reduzir impactos na operação e na comunidade." },
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

function AdminPage({ resetDemo, player, leaders, user, authLoading, isAuthenticated }: { resetDemo: () => void; player: Player; leaders: Leader[]; user: { name: string | null; role: "admin" | "user" } | null; authLoading: boolean; isAuthenticated: boolean }) {
  const isAdmin = user?.role === "admin";
  const dashboard = trpc.analytics.dashboard.useQuery(undefined, { enabled: isAdmin });
  if (authLoading) return <div className="page admin-gate"><div className="admin-gate-card"><span className="admin-lock"><LockKeyhole size={22} /></span><div className="eyebrow">VALIDANDO ACESSO</div><h1>Carregando <span>painel.</span></h1><p>Estamos verificando sua conta administrativa com segurança.</p></div></div>;
  if (!isAuthenticated) return <div className="page admin-gate"><div className="admin-gate-card"><span className="admin-lock"><LockKeyhole size={22} /></span><div className="eyebrow">ÁREA RESTRITA</div><h1>Entrar no <span>painel.</span></h1><p>Faça login com sua conta Cummins/Manus para acessar pessoas, respostas, pontuação e desempenho.</p><button className="primary-button wide" onClick={() => startLogin()}>ENTRAR COM MINHA CONTA <ArrowRight size={16} /></button><small className="demo-hint">Somente administradores autorizados têm acesso aos dados.</small></div></div>;
  if (!isAdmin) return <div className="page admin-gate"><div className="admin-gate-card"><span className="admin-lock"><LockKeyhole size={22} /></span><div className="eyebrow">ACESSO NEGADO</div><h1>Permissão <span>necessária.</span></h1><p>Sua conta está autenticada, mas não possui a permissão administrativa para visualizar os dados da campanha.</p></div></div>;
  const totals = dashboard.data?.totals;
  return <div className="page admin-page"><div className="page-heading-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> DADOS REAIS DA CAMPANHA</div><h1>Painel <span>administrativo</span></h1><p>Olá, {user.name || "administrador"}. Acompanhe acessos, respostas, precisão e pontuação.</p></div><div className="admin-live"><span className="pulse-dot" /> BANCO CONECTADO</div></div><div className="admin-stats"><div><Users size={18} /><span>VISITANTES ÚNICOS</span><strong>{formatNumber(Number(totals?.uniqueVisitors || 0))}</strong><small>{formatNumber(Number(totals?.visits || 0))} acessos registrados</small></div><div><Play size={18} /><span>PARTICIPAÇÕES</span><strong>{formatNumber(Number(totals?.sessions || 0))}</strong><small>{formatNumber(Number(totals?.completedSessions || 0))} partidas concluídas</small></div><div><CheckCircle2 size={18} /><span>PRECISÃO MÉDIA</span><strong>{Math.round(Number(totals?.averageAccuracy || 0))}%</strong><small>{formatNumber(Number(totals?.correctAnswers || 0))} respostas corretas</small></div><div><Trophy size={18} /><span>PONTOS ACUMULADOS</span><strong>{formatNumber(Number(totals?.totalPoints || 0))}</strong><small>{formatNumber(Number(totals?.answers || 0))} alternativas respondidas</small></div></div><div className="admin-panels"><section className="admin-panel"><div className="panel-heading"><div><div className="eyebrow">PARTICIPAÇÕES RECENTES</div><h2>Quem jogou</h2></div><span className="participant-count">{dashboard.isLoading ? "Atualizando…" : "Dados persistentes"}</span></div><div className="admin-list">{dashboard.data?.recentSessions?.length ? dashboard.data.recentSessions.slice(0, 8).map((session) => <div key={session.sessionKey}><span className="list-icon cyan"><ShieldCheck size={16} /></span><div><strong>{session.playerName} <small>• {session.sector}</small></strong><small>{session.challenge} • {session.status === "completed" ? "Concluída" : "Em andamento"} • {session.accuracy}% de acerto</small></div><b>{formatNumber(session.score)} pts</b></div>) : <div className="admin-empty"><CircleHelp size={18} /><span>Nenhuma participação registrada ainda. Os dados aparecerão aqui quando alguém iniciar uma missão.</span></div>}</div></section><section className="admin-panel"><div className="panel-heading"><div><div className="eyebrow">DESEMPENHO POR SETOR</div><h2>Onde está a participação</h2></div><BarChart3 size={20} /></div><div className="sector-bars admin-sector-bars">{dashboard.data?.sectors?.length ? dashboard.data.sectors.map((sector, index) => <div key={sector.sector}><div><span>{sector.sector}</span><strong>{formatNumber(Number(sector.points))} pts</strong></div><div className="bar-track"><i style={{ width: `${Math.max(12, (Number(sector.points) / Math.max(1, Number(dashboard.data?.sectors?.[0]?.points || 1))) * 100)}%`, background: index === 0 ? accent.yellow : accent.cyan }} /></div><small>{sector.players} pessoas • {Math.round(Number(sector.accuracy))}% de precisão</small></div>) : <div className="admin-empty"><BarChart3 size={18} /><span>O ranking por setor será formado conforme as participações forem registradas.</span></div>}</div><div className="admin-actions"><button onClick={() => dashboard.refetch()}><RotateCcw size={16} /><span>Atualizar dados<small>Buscar os números mais recentes</small></span><ChevronRight size={15} /></button><button className="danger-action" onClick={resetDemo}><RotateCcw size={16} /><span>Resetar placar local<small>Limpa apenas o ranking deste navegador</small></span><ChevronRight size={15} /></button></div></section></div><section className="admin-panel admin-privacy-note"><ShieldCheck size={18} /><div><strong>Dados protegidos</strong><span>O painel está restrito a usuários com role administrativo. O jogo público registra apenas o apelido, setor, respostas e métricas necessárias para a campanha.</span></div></section></div>;
}

export default App;
