export interface Exercise {
  id: string;
  name: string;
  group: string;
  seriesCount: number;
  defaultReps: number;
  defaultWeight: number;
  restSeconds: number;
  description: string;
  jointProtectionTip?: string;
  repsDisplay?: string; // Optional custom display (like "60s" or "30-40s")
}

export interface Workout {
  id: string;
  name: string;
  title: string;
  focus: string;
  description: string;
  exercises: Exercise[];
}

export const WORKOUT_SPLIT: Workout[] = [
  {
    id: "treino-a",
    name: "Treino A",
    title: "Shape Estético (Push)",
    focus: "Peitoral superior + ombro lateral SEM destruir articulação",
    description: "Foco na porção clavicular do peito, deltoide lateral isolado e proteção articular absoluta.",
    exercises: [
      {
        id: "a1",
        name: "Manguito rotador polia",
        group: "Ombro Mobilidade",
        seriesCount: 2,
        defaultReps: 15,
        defaultWeight: 5,
        restSeconds: 60,
        description: "Excelente para estabilização articular antes das cargas pesadas.",
        jointProtectionTip: "Mantenha o cotovelo colado ao tronco e faça o arco de rotação bem controlado."
      },
      {
        id: "a2",
        name: "Supino inclinado máquina",
        group: "Peito Superior",
        seriesCount: 4,
        defaultReps: 10,
        defaultWeight: 20,
        restSeconds: 90,
        description: "Máxima ativação da porção clavicular sem risco de falha descontrolada.",
        jointProtectionTip: "Evite abrir excessivamente os cotovelos; ajuste o banco para empurrar no plano escapular.",
        repsDisplay: "8-12"
      },
      {
        id: "a3",
        name: "Supino reto halteres pegada neutra",
        group: "Peito Geral",
        seriesCount: 3,
        defaultReps: 10,
        defaultWeight: 18,
        restSeconds: 90,
        description: "Totalmente anatômico. A pegada neutra poupa os ombros de rotação excessiva.",
        jointProtectionTip: "Aduza e trave as escápulas fortemente contra o estofado antes de iniciar.",
        repsDisplay: "10-12"
      },
      {
        id: "a4",
        name: "Crucifixo máquina",
        group: "Peito Isolamento",
        seriesCount: 3,
        defaultReps: 12,
        defaultWeight: 30,
        restSeconds: 60,
        description: "Contração máxima sem estresse excessivo de estiramento nos ombros.",
        jointProtectionTip: "Inicie controlando totalmente o alongamento, parando antes da hiperestensão.",
        repsDisplay: "12-15"
      },
      {
        id: "a5",
        name: "Desenvolvimento máquina leve",
        group: "Ombro Anterior",
        seriesCount: 3,
        defaultReps: 10,
        defaultWeight: 15,
        restSeconds: 75,
        description: "Foco puramente mecânico e sob controle. Mantenha leve, explorando cadência lenta.",
        jointProtectionTip: "Mantenha o arco de subida natural, sem estender totalmente no topo.",
        repsDisplay: "10-12"
      },
      {
        id: "a6",
        name: "Elevação lateral halteres",
        group: "Ombro Lateral",
        seriesCount: 5,
        defaultReps: 12,
        defaultWeight: 8,
        restSeconds: 60,
        description: "Construção de largura e ombros redondos. Mantenha o foco em afastar as mãos.",
        jointProtectionTip: "Incline o tronco ligeiramente para a frente e trabalhe no plano escapular (30 graus à frente).",
        repsDisplay: "12-15"
      },
      {
        id: "a7",
        name: "Elevação lateral no cabo",
        group: "Ombro Lateral",
        seriesCount: 3,
        defaultReps: 15,
        defaultWeight: 5,
        restSeconds: 60,
        description: "Tensão contínua proporcionada pelo cabo em toda a amplitude de movimento.",
        jointProtectionTip: "Ajuste a polia na altura correta e suba apenas até a altura do ombro.",
        repsDisplay: "15"
      },
      {
        id: "a8",
        name: "Tríceps corda",
        group: "Tríceps",
        seriesCount: 4,
        defaultReps: 10,
        defaultWeight: 15,
        restSeconds: 60,
        description: "Isolamento do tríceps com abertura final da corda para máxima contração.",
        jointProtectionTip: "Mantenha os cotovelos absolutamente estáticos ao longo de toda a série.",
        repsDisplay: "10-12"
      },
      {
        id: "a9",
        name: "Tríceps francês unilateral",
        group: "Tríceps Lateral",
        seriesCount: 3,
        defaultReps: 12,
        defaultWeight: 6,
        restSeconds: 60,
        description: "Foco excelente na cabeça longa do tríceps.",
        jointProtectionTip: "Evite deixar o cotovelo apontando muito para fora para evitar pinçamento subacromial.",
        repsDisplay: "12"
      },
      {
        id: "a10",
        name: "Abdômen supra",
        group: "Core",
        seriesCount: 3,
        defaultReps: 20,
        defaultWeight: 0,
        restSeconds: 60,
        description: "Trabalho clássico e essencial para fortalecimento do reto abdominal superior.",
        jointProtectionTip: "Pense em enrolar os ombros em direção ao quadril, evitando puxar o pescoço.",
        repsDisplay: "20"
      }
    ]
  },
  {
    id: "treino-b",
    name: "Treino B",
    title: "Costas + Trapézio (V-Taper)",
    focus: "Esse treino vai construir o 'V'",
    description: "Visando a expansão da largura dorsal, densidade traseira e controle escapular absoluto.",
    exercises: [
      {
        id: "b1",
        name: "Puxada alta aberta",
        group: "Costas Largura",
        seriesCount: 4,
        defaultReps: 10,
        defaultWeight: 45,
        restSeconds: 90,
        description: "Excelente para ativar as asas (latíssimo do dorso) e alargar a silhueta alta.",
        jointProtectionTip: "Puxe direcionando os cotovelos para baixo, não para trás. Controle a volta por 3 segundos.",
        repsDisplay: "8-12"
      },
      {
        id: "b2",
        name: "Pull down unilateral",
        group: "Costas Isolamento",
        seriesCount: 3,
        defaultReps: 12,
        defaultWeight: 15,
        restSeconds: 60,
        description: "Tensão concentrada na porção mais baixa do grande dorsal.",
        jointProtectionTip: "Mantenha o braço quase estendido, contraindo intensamente no ponto de chegada ao quadril.",
        repsDisplay: "12"
      },
      {
        id: "b3",
        name: "Remada baixa neutra",
        group: "Costas Geral",
        seriesCount: 4,
        defaultReps: 10,
        defaultWeight: 40,
        restSeconds: 75,
        description: "Squeeze impecável ao final da remada para espessura de miolo de costas.",
        jointProtectionTip: "Não balance o tronco. Mantenha os ombros abaixados e aduza fortemente as escápulas.",
        repsDisplay: "10-12"
      },
      {
        id: "b4",
        name: "Remada articulada peito apoiado",
        group: "Costas Espessura",
        seriesCount: 3,
        defaultReps: 10,
        defaultWeight: 20,
        restSeconds: 75,
        description: "Apoio total no peito para eliminar balanços da lombar.",
        jointProtectionTip: "Mantenha o peito sempre firme e colado contra o estofado de proteção.",
        repsDisplay: "10"
      },
      {
        id: "b5",
        name: "Face pull",
        group: "Ombro Posterior",
        seriesCount: 4,
        defaultReps: 15,
        defaultWeight: 15,
        restSeconds: 60,
        description: "Correção de postura milagrosa para os ombros e infraespinhal.",
        jointProtectionTip: "Puxe a corda em direção aos olhos, abrindo as mãos e rodando os dedões para trás.",
        repsDisplay: "15"
      },
      {
        id: "b6",
        name: "Encolhimento halteres",
        group: "Trapézio",
        seriesCount: 5,
        defaultReps: 12,
        defaultWeight: 22,
        restSeconds: 60,
        description: "Apenas subida vertical pura. Nada de giros lesionadores.",
        jointProtectionTip: "Segure 2 segundos de pico de contração no topo para recrutar as fibras corretas.",
        repsDisplay: "12-15"
      },
      {
        id: "b7",
        name: "Encolhimento barra guiada",
        group: "Trapézio Superior",
        seriesCount: 4,
        defaultReps: 10,
        defaultWeight: 30,
        restSeconds: 60,
        description: "Superfície estável na máquina guiada para cargas controladas de trapézio.",
        jointProtectionTip: "Subida contínua. Mantenha os braços esticados e faça a força estritamente nos trapézios.",
        repsDisplay: "10-12"
      },
      {
        id: "b8",
        name: "Rosca martelo",
        group: "Bíceps / Antebraço",
        seriesCount: 3,
        defaultReps: 12,
        defaultWeight: 10,
        restSeconds: 60,
        description: "Trabalho excelente de braquiorradial para volume geral de braço.",
        jointProtectionTip: "Não balance os braços; trave os cotovelos absolutamente estáticos lateralmente.",
        repsDisplay: "12"
      },
      {
        id: "b9",
        name: "Rosca direta barra W",
        group: "Bíceps",
        seriesCount: 3,
        defaultReps: 10,
        defaultWeight: 12,
        restSeconds: 60,
        description: "Pegada angulada na barra W para menor estresse mecânico nos punhos.",
        jointProtectionTip: "Estenda quase inteiramente os braços mas sem travar a articulação em hiperextensão.",
        repsDisplay: "10-12"
      }
    ]
  },
  {
    id: "treino-c",
    name: "Treino C",
    title: "Pernas + Core",
    focus: "Pernas estéticas sem 'pesar' cintura/quadril",
    description: "Volume estético quadríceps/isquiotibiais focado em manter a cintura escapular e pélvica estreitas e fortes.",
    exercises: [
      {
        id: "c1",
        name: "Agachamento Smith",
        group: "Pernas Geral",
        seriesCount: 4,
        defaultReps: 8,
        defaultWeight: 20,
        restSeconds: 90,
        description: "Excelente controle de plano no trilho livre guiado do Smith.",
        jointProtectionTip: "Posicione os pés ligeiramente à frente para proteger os joelhos de pressão anterior excessiva.",
        repsDisplay: "8-10"
      },
      {
        id: "c2",
        name: "Leg press",
        group: "Coxas Geral",
        seriesCount: 4,
        defaultReps: 10,
        defaultWeight: 80,
        restSeconds: 90,
        description: "Empurre potente e focado nos membros inferiores mantendo as costas em segurança cilíndrica.",
        jointProtectionTip: "Nunca tire a região lombar do encosto. Trave as mãos fortemente nas alças externas.",
        repsDisplay: "10-12"
      },
      {
        id: "c3",
        name: "Mesa flexora",
        group: "Posterior de Coxa",
        seriesCount: 4,
        defaultReps: 10,
        defaultWeight: 25,
        restSeconds: 60,
        description: "Estimulação poderosa das fibras isquiotibiais posteriores isoladas.",
        jointProtectionTip: "Mantenha o quadril pressionado fortemente sobre o estofado anterior para não forçar a lombar.",
        repsDisplay: "10-12"
      },
      {
        id: "c4",
        name: "Extensora",
        group: "Quadríceps",
        seriesCount: 3,
        defaultReps: 15,
        defaultWeight: 30,
        restSeconds: 60,
        description: "Isolamento cirúrgico para as porções anterior e média dos quadríceps.",
        jointProtectionTip: "Ajuste o encosto de modo que a articulação do joelho fique alinhada com o eixo da máquina.",
        repsDisplay: "15"
      },
      {
        id: "c5",
        name: "Panturrilha em pé",
        group: "Panturrilhas",
        seriesCount: 5,
        defaultReps: 15,
        defaultWeight: 40,
        restSeconds: 60,
        description: "Séries pesadas buscando a máxima rotação do gastrocnêmio.",
        jointProtectionTip: "Controle a descida até o alongamento extremo, parando por 1 segundo embaixo antes de subir.",
        repsDisplay: "15-20"
      },
      {
        id: "c6",
        name: "Panturrilha sentado",
        group: "Panturrilha Sóleo",
        seriesCount: 4,
        defaultReps: 15,
        defaultWeight: 20,
        restSeconds: 60,
        description: "Foco no feixe do músculo sóleo. Extremamente isolado.",
        jointProtectionTip: "Controle total sem saltos mecânicos rápidos entre as repetições.",
        repsDisplay: "15-20"
      },
      {
        id: "c7",
        name: "Elevação de pernas",
        group: "Core / Abdômen",
        seriesCount: 4,
        defaultReps: 15,
        defaultWeight: 0,
        restSeconds: 60,
        description: "Trabalho focado na parede infra-abdominal e controle postural pélvico.",
        jointProtectionTip: "Use o quadril para elevar as pernas em rotação pélvica, não balance as pernas soltas.",
        repsDisplay: "15"
      },
      {
        id: "c8",
        name: "Prancha",
        group: "Core Estabilidade",
        seriesCount: 3,
        defaultReps: 60,
        defaultWeight: 0,
        restSeconds: 60,
        description: "Fortalecimento transverso do abdômen para estreitar o diâmetro da cintura pélvica.",
        jointProtectionTip: "Mantenha o corpo linear com contração máxima de glúteos e abdômen profundo.",
        repsDisplay: "60s"
      },
      {
        id: "c9",
        name: "Vacuum abdominal",
        group: "Core Profundo",
        seriesCount: 3,
        defaultReps: 30,
        defaultWeight: 0,
        restSeconds: 60,
        description: "A técnica secreta clássica para retenção estéril do diâmetro de cintura.",
        jointProtectionTip: "Exale todo o ar dos pulmões antes de puxar o abdômen ao limite posterior. Segure firme.",
        repsDisplay: "30-40s"
      }
    ]
  }
];

export interface TipBlock {
  id: string;
  category: string;
  title: string;
  content: string;
  recommendation: string;
  tag: string;
}

export const TIPS_DATA: TipBlock[] = [
  {
    id: "ombro",
    category: "Prevenção",
    title: "Alertas do Ombro (Proteção Escapular)",
    content: "O manguito rotador é o amortecedor do seu supino. Se você executa o supino tradicional com os cotovelos abertos em um ângulo de 90° graus em relação ao tronco, você está esmagando o tendão do supraespinhal. Forçar a barra contra o peito mantendo as escápulas soltas destrói a articulação a médio prazo.",
    recommendation: "Aduza ativamente as escápulas antes de tirar a carga do suporte. Imagine espremer uma uva entre os ombros e mantenha essa contração firme durante todo o exercício. Mantenha os cotovelos rotacionados para dentro, em um ângulo de cerca de 45° a 60° em relação ao corpo.",
    tag: "Articulações"
  }
];
