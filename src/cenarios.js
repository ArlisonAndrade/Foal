// ============================================================
// FOAL — Cenários de Avaliação
// Sistema: A=1.6 / B=1.4 / C=0.0 / NO=null
// Teto natural: 8.0 | FO+ empurra para 9-10
// ============================================================

// ── CENÁRIOS CFGS (Instrução de Equitação) ──────────────────
export const CENARIOS_CFGS = [
  {
    id: "c1",
    titulo: "Primeiro Contato com o Cavalo e com o Material",
    descricao: "O instrutor observa a aproximação ao cavalo, a colocação da cabeçada e sela, e o manuseio inicial do animal.",
    atributos: ["CORAGEM", "ADAPTABILIDADE"],
    ndaca: {
      CORAGEM: "Tendência de enfrentar situações de risco ou desconforto com firmeza e determinação, sem recuar diante do desconhecido.",
      ADAPTABILIDADE: "Capacidade de ajustar o comportamento e a conduta diante de situações novas, adversas ou inesperadas.",
    },
    opcoes: [
      { letra: "A", valor: 1.6, texto: "Aproxima-se com firmeza, ajusta o material com coordenação e reage bem ao temperamento do cavalo." },
      { letra: "B", valor: 0.8, texto: "Demonstra leve hesitação ou necessita de correção do monitor, mas mantém a execução básica." },
      { letra: "C", valor: 0.0, texto: "Recua, trava diante dos movimentos do cavalo ou é incapaz de realizar a equipagem do animal." },
      { letra: "NO", valor: null, texto: "Não Observado — situação não ocorreu durante a instrução." },
    ],
  },
  {
    id: "c2",
    titulo: "Ginástica e Transição de Andaduras",
    descricao: "O instrutor observa a execução dos exercícios de ginástica equestre e a transição do passo para o trote e galope.",
    atributos: ["CORAGEM", "EQUILIBRIO_EMOCIONAL"],
    ndaca: {
      CORAGEM: "Tendência de enfrentar situações de risco ou desconforto com firmeza e determinação, sem recuar diante do desconhecido.",
      EQUILIBRIO_EMOCIONAL: "Capacidade de manter o autocontrole e a estabilidade emocional diante de situações de pressão, risco ou imprevisibilidade.",
    },
    opcoes: [
      { letra: "A", valor: 1.6, texto: "Executa a ginástica e as transições de andadura com segurança, sem buscar apoio na sela ou crinas." },
      { letra: "B", valor: 0.8, texto: "Hesita em algum exercício ou busca apoio reativo, mas recupera a postura após orientação." },
      { letra: "C", valor: 0.0, texto: "Recusa ou interrompe exercícios por medo, ou perde o controle postural nas transições de andadura." },
      { letra: "NO", valor: null, texto: "Não Observado — situação não ocorreu durante a instrução." },
    ],
  },
  {
    id: "c3",
    titulo: "Reações e Postura durante as Atividades",
    descricao: "O instrutor observa se o aluno corrige ativamente a posição do cavalo, mantendo o animal alinhado e executando a atividade corretamente.",
    atributos: ["EQUILIBRIO_EMOCIONAL", "ADAPTABILIDADE"],
    ndaca: {
      EQUILIBRIO_EMOCIONAL: "Capacidade de manter o autocontrole e a estabilidade emocional diante de situações de pressão, risco ou imprevisibilidade.",
      ADAPTABILIDADE: "Capacidade de ajustar o comportamento e a conduta diante de situações novas, adversas ou inesperadas.",
    },
    opcoes: [
      { letra: "A", valor: 1.6, texto: "Percebe quando o cavalo sai do alinhamento ou da atividade e aplica a correção com precisão e oportunidade." },
      { letra: "B", valor: 0.8, texto: "Percebe o desalinhamento, mas a correção é lenta, incompleta ou depende de orientação verbal do instrutor." },
      { letra: "C", valor: 0.0, texto: "Não percebe ou ignora o desalinhamento do cavalo, deixando o animal executar incorretamente sem intervir." },
      { letra: "NO", valor: null, texto: "Não Observado — situação não ocorreu durante a instrução." },
    ],
  },
  {
    id: "c4",
    titulo: "Execução e Superação das Fases da Instrução",
    descricao: "O instrutor observa o aluno ao longo de toda a instrução, com atenção ao cansaço físico e à manutenção do esforço.",
    atributos: ["PERSISTENCIA", "EQUILIBRIO_EMOCIONAL"],
    ndaca: {
      PERSISTENCIA: "Capacidade de manter o esforço e a determinação na execução de tarefas diante de dificuldades, cansaço ou obstáculos.",
      EQUILIBRIO_EMOCIONAL: "Capacidade de manter o autocontrole e a estabilidade emocional diante de situações de pressão, risco ou imprevisibilidade.",
    },
    opcoes: [
      { letra: "A", valor: 1.6, texto: "Sustenta o esforço físico mantendo postura e concentração corretas até o encerramento da instrução." },
      { letra: "B", valor: 0.8, texto: "Demonstra sinais de cansaço e desalinha temporariamente, mas mantém o esforço voluntário." },
      { letra: "C", valor: 0.0, texto: "Abandona o exercício antes do tempo ou desaba sobre o lombo do cavalo por fadiga." },
      { letra: "NO", valor: null, texto: "Não Observado — situação não ocorreu durante a instrução." },
    ],
  },
  {
    id: "c5",
    titulo: "Liderança e Controle do Animal",
    descricao: "O instrutor observa se o aluno comanda ativamente o cavalo ou se está apenas sobrevivendo na sela enquanto o animal age por conta própria.",
    atributos: ["PERSISTENCIA", "ADAPTABILIDADE"],
    ndaca: {
      PERSISTENCIA: "Capacidade de manter o esforço e a determinação na execução de tarefas diante de dificuldades, cansaço ou obstáculos.",
      ADAPTABILIDADE: "Capacidade de ajustar o comportamento e a conduta diante de situações novas, adversas ou inesperadas.",
    },
    opcoes: [
      { letra: "A", valor: 1.6, texto: "Demonstra liderança clara — aplica comandos precisos, mantém o controle e conduz o cavalo com intencionalidade." },
      { letra: "B", valor: 0.8, texto: "Alterna momentos de comando e passividade — comanda quando orientado, mas sem iniciativa constante." },
      { letra: "C", valor: 0.0, texto: "Está apenas sobrevivendo na sela — não aplica comandos e o cavalo age por conta própria sem interferência." },
      { letra: "NO", valor: null, texto: "Não Observado — situação não ocorreu durante a instrução." },
    ],
  },
];

// ── CENÁRIOS ATLETAS (Viagem de Competição) ─────────────────
export const CENARIOS_ATLETAS = [
  {
    id: "a1",
    titulo: "Apresentação e Pontualidade",
    descricao: "O avaliador observa a apresentação pessoal do atleta fora do quartel e o cumprimento dos horários estabelecidos.",
    atributos: ["RESPONSABILIDADE", "INICIATIVA"],
    ndaca: {
      RESPONSABILIDADE: "Disposição para assumir as consequências de suas ações e cumprir com os compromissos assumidos.",
      INICIATIVA: "Capacidade de agir de forma proativa, antecipando necessidades e tomando decisões sem aguardar ordens.",
    },
    opcoes: [
      { letra: "A", valor: 1.6, texto: "Apresenta-se impecável e está no local antes do horário previsto, sem necessidade de convocação." },
      { letra: "B", valor: 0.8, texto: "Apresenta-se adequadamente e cumpre os horários, mas sem antecipar ou se destacar." },
      { letra: "C", valor: 0.0, texto: "Apresenta irregularidades na farda ou descumpre horários, necessitando de cobrança." },
      { letra: "NO", valor: null, texto: "Não Observado — situação não ocorreu durante a atividade." },
    ],
  },
  {
    id: "a2",
    titulo: "Preparo e Cuidado com o Material",
    descricao: "O avaliador observa como o atleta cuida e prepara o material e o cavalo antes e após as competições.",
    atributos: ["RESPONSABILIDADE", "DECISAO"],
    ndaca: {
      RESPONSABILIDADE: "Disposição para assumir as consequências de suas ações e cumprir com os compromissos assumidos.",
      DECISAO: "Capacidade de tomar decisões com firmeza e oportunidade, mesmo sob pressão ou com informações incompletas.",
    },
    opcoes: [
      { letra: "A", valor: 1.6, texto: "Organiza e cuida do material e do cavalo com zelo, antecipando necessidades sem ser solicitado." },
      { letra: "B", valor: 0.8, texto: "Cuida do material e do cavalo adequadamente quando solicitado, sem maiores problemas." },
      { letra: "C", valor: 0.0, texto: "Demonstra descuido com o material ou o cavalo, causando problemas ou necessitando supervisão constante." },
      { letra: "NO", valor: null, texto: "Não Observado — situação não ocorreu durante a atividade." },
    ],
  },
  {
    id: "a3",
    titulo: "Comportamento em Confraternização",
    descricao: "O avaliador observa a conduta do atleta em ambientes sociais durante a viagem, incluindo situações de liberdade e eventual presença de álcool.",
    atributos: ["COOPERACAO", "INICIATIVA"],
    ndaca: {
      COOPERACAO: "Disposição para trabalhar em equipe, contribuindo para os objetivos coletivos e apoiando os colegas.",
      INICIATIVA: "Capacidade de agir de forma proativa, antecipando necessidades e tomando decisões sem aguardar ordens.",
    },
    opcoes: [
      { letra: "A", valor: 1.6, texto: "Mantém conduta exemplar — representa a ESA com distinção, integra o grupo e demonstra autocontrole em qualquer ambiente." },
      { letra: "B", valor: 0.8, texto: "Mantém conduta adequada, sem transgressões, integra o grupo sem destaque positivo ou negativo." },
      { letra: "C", valor: 0.0, texto: "Apresenta conduta inadequada ao ambiente militar ou compromete a imagem da equipe e da ESA." },
      { letra: "NO", valor: null, texto: "Não Observado — situação não ocorreu durante a atividade." },
    ],
  },
  {
    id: "a4",
    titulo: "Conduta como Representante da ESA",
    descricao: "O avaliador observa como o atleta se porta diante de outros militares, civis e árbitros durante a competição.",
    atributos: ["COOPERACAO", "DECISAO"],
    ndaca: {
      COOPERACAO: "Disposição para trabalhar em equipe, contribuindo para os objetivos coletivos e apoiando os colegas.",
      DECISAO: "Capacidade de tomar decisões com firmeza e oportunidade, mesmo sob pressão ou com informações incompletas.",
    },
    opcoes: [
      { letra: "A", valor: 1.6, texto: "Age com postura, cordialidade e respeito em todas as interações, destacando-se como representante da ESA." },
      { letra: "B", valor: 0.8, texto: "Mantém postura adequada e respeito nas interações, sem condutas inadequadas." },
      { letra: "C", valor: 0.0, texto: "Demonstra postura inadequada, desrespeito ou comportamento incompatível com a representação institucional." },
      { letra: "NO", valor: null, texto: "Não Observado — situação não ocorreu durante a atividade." },
    ],
  },
  {
    id: "a5",
    titulo: "Situações de Pressão e Adversidade na Competição",
    descricao: "O avaliador observa a reação do atleta diante de resultados negativos, imprevistos ou situações de pressão durante a competição.",
    atributos: ["DECISAO", "INICIATIVA"],
    ndaca: {
      DECISAO: "Capacidade de tomar decisões com firmeza e oportunidade, mesmo sob pressão ou com informações incompletas.",
      INICIATIVA: "Capacidade de agir de forma proativa, antecipando necessidades e tomando decisões sem aguardar ordens.",
    },
    opcoes: [
      { letra: "A", valor: 1.6, texto: "Mantém a serenidade diante de adversidades, toma decisões rápidas e ajusta a estratégia com autonomia." },
      { letra: "B", valor: 0.8, texto: "Lida com a adversidade sem perder o controle, mas aguarda orientação antes de agir." },
      { letra: "C", valor: 0.0, texto: "Demonstra instabilidade emocional, omissão ou reações inadequadas diante de pressão ou resultados negativos." },
      { letra: "NO", valor: null, texto: "Não Observado — situação não ocorreu durante a atividade." },
    ],
  },
];

// ── ATRIBUTOS — definições completas ────────────────────────
export const ATRIBUTOS_CFGS = {
  CORAGEM:            { nome: "Coragem",             cor: "#8B1A1A", cenarios: ["c1","c2"] },
  EQUILIBRIO_EMOCIONAL:{ nome: "Equilíbrio Emocional",cor: "#1A3A5C", cenarios: ["c2","c3","c4"] },
  ADAPTABILIDADE:     { nome: "Adaptabilidade",      cor: "#1A5C2A", cenarios: ["c1","c3","c5"] },
  PERSISTENCIA:       { nome: "Persistência",         cor: "#7B4A00", cenarios: ["c4","c5"] },
};

export const ATRIBUTOS_ATLETAS = {
  RESPONSABILIDADE: { nome: "Responsabilidade", cor: "#8B1A1A", cenarios: ["a1","a2"] },
  DECISAO:          { nome: "Decisão",           cor: "#1A3A5C", cenarios: ["a2","a4","a5"] },
  INICIATIVA:       { nome: "Iniciativa",         cor: "#1A5C2A", cenarios: ["a1","a3","a5"] },
  COOPERACAO:       { nome: "Cooperação",          cor: "#7B4A00", cenarios: ["a3","a4"] },
};

// ── CÁLCULO DE NOTA ─────────────────────────────────────────
export function calcularNota(respostas, cenarios, atributos) {
  const resultado = {};

  for (const [atribId, atrib] of Object.entries(atributos)) {
    const cenariosDoAtrib = atrib.cenarios;
    let somaValores = 0;
    let countObservados = 0;
    let temNO = false;

    for (const cenId of cenariosDoAtrib) {
      const resp = respostas[cenId];
      if (resp === null || resp === undefined) continue;
      if (resp.letra === "NO") { temNO = true; break; }
      somaValores += resp.valor;
      countObservados++;
    }

    if (temNO) {
      resultado[atribId] = { nota: null, mencao: "NO", cor: "#9a9a8a" };
      continue;
    }

    if (countObservados === 0) {
      resultado[atribId] = { nota: null, mencao: "—", cor: "#9a9a8a" };
      continue;
    }

    // Máximo teórico = 2.0 por cenário
    const maxTeorico = cenariosDoAtrib.length * 2.0;
    const notaBase = parseFloat(((somaValores / maxTeorico) * 10).toFixed(1));
    resultado[atribId] = { nota: notaBase, mencao: getMencao(notaBase), cor: getCorMencao(notaBase) };
  }

  return resultado;
}

export function aplicarFO(resultados, atribId, tipoFO) {
  if (!resultados[atribId] || resultados[atribId].nota === null) return resultados;
  const ajuste = tipoFO === "pos2" ? 1.0 : tipoFO === "pos1" ? 0.5 : tipoFO === "neg1" ? -0.5 : tipoFO === "neg2" ? -1.0 : 0;
  const novaNota = Math.min(10, Math.max(0, parseFloat((resultados[atribId].nota + ajuste).toFixed(1))));
  return {
    ...resultados,
    [atribId]: { nota: novaNota, mencao: getMencao(novaNota), cor: getCorMencao(novaNota) },
  };
}

export function getMencao(nota) {
  if (nota === null) return "NO";
  if (nota === 0) return "I";
  if (nota <= 4) return "R";
  if (nota <= 7) return "B";
  return "MB";
}

export function getCorMencao(nota) {
  if (nota === null) return "#9a9a8a";
  if (nota === 0) return "#c0392b";
  if (nota <= 4) return "#e67e22";
  if (nota <= 7) return "#2980b9";
  return "#27ae60";
}
