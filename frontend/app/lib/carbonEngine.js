// SPDX-License-Identifier: MIT
// Copyright (c) 2026 DoubleDyn Ecotoken — MIT License (ver LICENSE.md)
// ===== DoubleDyn Carbon Engine — v4.0 (React Module) =====
// Reescrito como módulo ES6 puro, sem dependência do DOM.
// Fonte: GHG Protocol Brasil, IPCC AR6, MCTI 2024, ABNT NBR ISO 14064.

// ===== CONSTANTES SETORIAIS =====
// Benchmarks de intensidade (tCO₂e por R$ 1 mi de faturamento) — SEEG/GHG Protocol Brasil.
// ⚠️ Mesmos valores do módulo benchmark.js (fonte única a consolidar na Fase 0).
const BENCH_ESTIMATIVA = {
  agro: 120, mineracao: 180, industria: 85, logistica: 110, construcao: 75,
  servicos: 12, comercio: 25, tecnologia: 12, saude: 60, alimenticio: 60,
  educacao: 12, outro: 60,
};

export const MEDIA_SETOR = {
  industria: 8.5, comercio: 2.1, servicos: 1.8, agro: 12.0,
  construcao: 6.5, logistica: 9.0, tecnologia: 1.2, saude: 3.5,
  alimenticio: 4.0, mineracao: 15.0, educacao: 1.5, outro: 3.0,
};

export const CNAE_TO_SETOR = {
  '01': 'agro', '02': 'agro', '03': 'agro',
  '05': 'mineracao', '06': 'mineracao', '07': 'mineracao', '08': 'mineracao', '09': 'mineracao',
  '10': 'alimenticio', '11': 'alimenticio', '12': 'alimenticio',
  '13': 'industria', '14': 'industria', '15': 'industria', '16': 'industria', '17': 'industria',
  '18': 'industria', '19': 'industria', '20': 'industria', '21': 'industria', '22': 'industria',
  '23': 'industria', '24': 'industria', '25': 'industria', '26': 'industria', '27': 'industria',
  '28': 'industria', '29': 'industria', '30': 'industria', '31': 'industria', '32': 'industria',
  '33': 'industria', '35': 'industria',
  '41': 'construcao', '42': 'construcao', '43': 'construcao',
  '45': 'comercio', '46': 'comercio', '47': 'comercio',
  '49': 'logistica', '50': 'logistica', '51': 'logistica', '52': 'logistica', '53': 'logistica',
  '62': 'tecnologia', '63': 'tecnologia',
  '85': 'educacao',
  '86': 'saude', '87': 'saude', '88': 'saude',
};

export const PORTE_MAP = {
  ME: 'Microempresa', EPP: 'Empresa de Pequeno Porte', DEMAIS: 'Médio/Grande Porte',
};

export const RISCO_SETOR = {
  mineracao: { nivel: 'ALTO', msg: 'Mineração é um dos setores mais regulados. Emissão média de 15 tCO₂e/funcionário/ano.' },
  industria: { nivel: 'ALTO', msg: 'Indústria será diretamente afetada pelo SBCE. Emissão média de 8.5 tCO₂e/funcionário/ano.' },
  logistica: { nivel: 'ALTO', msg: 'Logística e transporte respondem por grande parte das emissões de Escopo 1.' },
  agro: { nivel: 'MODERADO', msg: 'Agronegócio tem alta exposição regulatória com o SBCE e COP30.' },
  construcao: { nivel: 'MODERADO', msg: 'Construção civil enfrenta novas exigências de certificação ambiental.' },
  alimenticio: { nivel: 'MODERADO', msg: 'Setor alimentício tem cadeia de frio e resíduos com alto impacto.' },
  saude: { nivel: 'MODERADO', msg: 'Hospitais e clínicas geram resíduos perigosos que exigem destinação certificada.' },
  comercio: { nivel: 'BAIXO', msg: 'Comércio tem menor exposição, mas exigências ESG de fornecedores crescem.' },
  servicos: { nivel: 'BAIXO', msg: 'Serviços têm impacto menor, mas empresas ESG ganham vantagem competitiva.' },
  tecnologia: { nivel: 'BAIXO', msg: 'TI tem baixa emissão, mas data centers e cloud têm pegada crescente.' },
  educacao: { nivel: 'BAIXO', msg: 'Instituições de ensino podem se beneficiar da certificação ambiental para captação.' },
  outro: { nivel: 'MODERADO', msg: 'Recomendamos uma avaliação personalizada do seu setor.' },
};

export const DADOS_SETORIAIS = {
  logistica: { pct: 77, texto: 'das empresas de logística já possuem inventário GEE', fonte: 'ABOL 2025' },
  mineracao: { pct: 86, texto: 'do setor de mineração reporta ao CDP', fonte: 'CDP/IBRAM 2025' },
  industria: { pct: 89, texto: 'das indústrias já estabeleceram metas de redução', fonte: 'CDP 2025' },
  agro: { pct: 74, texto: 'do agronegócio de exportação já monitora emissões', fonte: 'CNA/SEEG 2024' },
  construcao: { pct: 65, texto: 'das construtoras buscam certificação LEED/AQUA', fonte: 'CBIC 2024' },
  alimenticio: { pct: 70, texto: 'do setor alimentício já monitora pegada de carbono', fonte: 'ABIA 2024' },
};

export const CBAM_EMISSOES_EMBUTIDAS = {
  ferro_aco: 1.85, aluminio: 8.40, cimento: 0.62,
  fertilizantes: 2.90, hidrogenio: 9.00, outro: 1.50,
};

export const DADOS_MERCADO = {
  precoCarbonEUETS: 80.56,
  markupCBAM2026: 0.10,
  cotacaoEURBRL: 6.10,
};

// ===== FATORES DE EMISSÃO (GHG Protocol Brasil + IPCC) =====
const FATORES = {
  // Eletricidade (tCO₂/MWh) — fator médio anual do SIN, MCTI/SIRENE 2025 (0,0461).
  // Atualizado em 2026-08-01 (auditoria R1): o valor anterior 0,0817 era o fator de 2016.
  // Fonte: gov.br/mcti/sirene — planilha "Fator Médio Anual (tCO2/MWh)".
  ELETRICIDADE: 0.0461,
  // Combustíveis estacionários
  GLP: 2.983,         // kgCO₂/kg
  GAS_NATURAL: 2.07,  // kgCO₂/m³
  DIESEL_EST: 2.603,  // kgCO₂/litro (gerador)
  LENHA: 1460,        // kgCO₂/tonelada
  // Combustíveis veiculares
  GASOLINA: 2.212,    // kgCO₂/litro
  DIESEL: 2.603,      // kgCO₂/litro
  ETANOL: 0.0,        // neutro (biocombustível)
  GNV: 2.07,          // kgCO₂/m³
  // Viagens aéreas
  AEREO_DOM: 0.133,   // kgCO₂/km/passageiro
  AEREO_INT: 0.102,   // kgCO₂/km/passageiro
  DIST_DOM: 1500,     // km trecho médio doméstico
  DIST_INT: 8000,     // km trecho médio internacional
  // Outros
  AGUA: 0.708,        // kgCO₂/m³
  PAPEL: 3.0,         // kgCO₂/resma
  AR_COND: 0.05,      // tCO₂/unidade/ano
  REFRIG: { nenhuma: 0, pequena: 0.5, media: 2.0, grande: 5.0 },
  RESIDUOS: 0.5,      // tCO₂/tonelada aterro
  RESIDUOS_PERIG: 1.2,// kgCO₂/kg
};

// ===== UTILITÁRIOS =====
export function formatBRL(val) {
  return 'R$ ' + Math.round(val).toLocaleString('pt-BR');
}

export function parseBRL(str) {
  if (!str) return 0;
  return parseFloat(String(str).replace(/[^\d,]/g, '').replace(',', '.')) || 0;
}

function n(val) {
  return parseFloat(val) || 0;
}

// ===== FUNÇÃO PRINCIPAL DE CÁLCULO =====
/**
 * Calcula o impacto de carbono completo a partir dos dados do formulário.
 * @param {object} data - Dados validados pelo Zod schema da calculadora.
 * @param {object} [opts] - Opções: { estimarSeVazio: boolean } — quando true e não há
 *   dados de consumo, estima pelas médias setoriais (benchmark × faturamento) para que
 *   o usuário que "não sabe" nunca fique bloqueado. O resultado marca `estimadoPorCNAE`.
 * @returns {object} Objeto com todos os resultados calculados.
 */
export function calculateEmissions(data, opts = {}) {
  // ── STEP 1: EMPRESA ──
  const empresa = data.empresa || 'Sua Empresa';
  const setor = data.setor || 'outro';
  const funcionarios = Math.max(n(data.funcionarios), 1);

  // ── STEP 2: ENERGIA ──
  const eletricidade = n(data.eletricidade);
  const fonteEnergia = data.fonteEnergia || 'convencional';
  const glp = n(data.glp);
  const gasNatural = n(data.gasNatural);
  const dieselGerador = n(data.dieselGerador);
  const lenha = n(data.lenha);

  // Fator elétrico por fonte
  let fatorEletrico = FATORES.ELETRICIDADE;
  if (fonteEnergia === 'solar' || fonteEnergia === 'eolica') fatorEletrico *= 0.05;
  else if (fonteEnergia === 'biomassa') fatorEletrico *= 0.15;
  else if (fonteEnergia === 'misto') fatorEletrico *= 0.55;

  const emEletricidade = (eletricidade / 1000) * fatorEletrico * 12;
  const emGLP = (glp * FATORES.GLP / 1000) * 12;
  const emGasNatural = (gasNatural * FATORES.GAS_NATURAL / 1000) * 12;
  const emDieselGerador = (dieselGerador * FATORES.DIESEL_EST / 1000) * 12;
  const emLenha = (lenha * FATORES.LENHA / 1000) * 12;
  const emissaoEnergia = emEletricidade + emGLP + emGasNatural + emDieselGerador + emLenha;

  // ── STEP 3: FROTA ──
  const gasolinaLitros = n(data.gasolinaLitros);
  const dieselLitros = n(data.dieselLitros);
  const etanolLitros = n(data.etanolLitros);
  const gnvM3 = n(data.gnvM3);
  const viagensDom = n(data.viagensDomesticas);
  const viagensInt = n(data.viagensInternacionais);

  const emGasolina = (gasolinaLitros * FATORES.GASOLINA / 1000) * 12;
  const emDieselFrota = (dieselLitros * FATORES.DIESEL / 1000) * 12;
  const emGNV = (gnvM3 * FATORES.GNV / 1000) * 12;
  const emAereoDom = (viagensDom * FATORES.DIST_DOM * FATORES.AEREO_DOM) / 1000;
  const emAereoInt = (viagensInt * FATORES.DIST_INT * FATORES.AEREO_INT) / 1000;
  const emissaoTransporte = emGasolina + emDieselFrota + emGNV + emAereoDom + emAereoInt;

  // ── STEP 4: INSTALAÇÕES ──
  const aguaM3 = n(data.aguaM3);
  const arCondicionado = n(data.arCondicionado);
  const refrigeracao = data.refrigeracao || 'nenhuma';
  const papelResmas = n(data.papelResmas);
  const homeOfficeRatio = n(data.homeOffice) / 100;
  const fatorPresencial = 1 - (homeOfficeRatio * 0.7);

  const emAgua = (aguaM3 * FATORES.AGUA / 1000) * 12 * fatorPresencial;
  const emAr = arCondicionado * FATORES.AR_COND * fatorPresencial;
  const emRefrig = FATORES.REFRIG[refrigeracao] || 0;
  const emPapel = (papelResmas * FATORES.PAPEL / 1000) * 12 * fatorPresencial;
  const emissaoInstalacoes = emAgua + emAr + emRefrig + emPapel;

  // ── STEP 5: RESÍDUOS ──
  const residuos = n(data.residuos);
  const reciclagem = n(data.reciclagem);
  const residuosPerigosos = n(data.residuosPerigosos);

  const emResiduosSolidos = (residuos * (1 - reciclagem / 100) * FATORES.RESIDUOS) * 12;
  const emResiduosPerig = (residuosPerigosos * FATORES.RESIDUOS_PERIG / 1000) * 12;
  const emissaoResiduos = emResiduosSolidos + emResiduosPerig;

  // ── TOTAL ──
  let emissaoBase = emissaoEnergia + emissaoTransporte + emissaoInstalacoes + emissaoResiduos;

  // ── MODO ESTIMATIVA POR SETOR (usuário que "não sabe" nunca fica bloqueado) ──
  const estimadoPorCNAE = Boolean(opts?.estimarSeVazio) && emissaoBase < 0.001;
  if (estimadoPorCNAE) {
    const fat = parseBRL(data.faturamento);
    const revM = fat > 0 ? fat / 1e6 : 1;
    emissaoBase = (BENCH_ESTIMATIVA[setor] || BENCH_ESTIMATIVA.outro) * revM;
  }

  let margemSeguranca = emissaoBase * 0.15;
  const totalEmissao = emissaoBase + margemSeguranca;

  // ── DQS SCORE ──
  const intensidade = totalEmissao / funcionarios;
  const mediaSetor = MEDIA_SETOR[setor] || MEDIA_SETOR['outro'];
  const razaoSetorial = intensidade / mediaSetor;
  const dqsScore = Math.min(1000, Math.max(0, Math.round(1000 - razaoSetorial * 500)));

  let pcrSeal = 'Bronze';
  let pcrColor = '#cd7f32';
  if (dqsScore >= 700) { pcrSeal = 'Ouro'; pcrColor = '#f1c40f'; }
  else if (dqsScore >= 400) { pcrSeal = 'Prata'; pcrColor = '#bdc3c7'; }

  // ── IMPACTO EMOCIONAL ──
  const arvoresPreservadas = Math.round(totalEmissao * 6.25);

  // ── RISCO REGULATÓRIO ──
  let risco, riscoCor, riscoMsg;
  if (totalEmissao < 10) {
    risco = 'BAIXO'; riscoCor = '#2ecc71';
    riscoMsg = 'está em conformidade básica, mas a regulamentação pode endurecer.';
  } else if (totalEmissao < 50) {
    risco = 'MODERADO'; riscoCor = '#f1c40f';
    riscoMsg = 'precisa de atenção — novas regras podem exigir compensação obrigatória.';
  } else if (totalEmissao < 200) {
    risco = 'ALTO'; riscoCor = '#e67e22';
    riscoMsg = 'corre risco real de multas e restrições a partir de 2027.';
  } else {
    risco = 'CRÍTICO'; riscoCor = '#e74c3c';
    riscoMsg = 'pode enfrentar multas severas, perda de contratos e restrições operacionais.';
  }

  // ── ÍNDICE DE EXPOSIÇÃO SBCE ──
  const faturamento = parseBRL(data.faturamento);
  const exportaUE = data.exportaUE || 'nao';
  const jaFazInventario = data.jaFazInventario || 'nao';
  const setorCBAM = data.setorCBAM || 'outro';

  let exposureScore = 0;
  if (totalEmissao >= 25000) exposureScore += 3.0;
  else if (totalEmissao >= 10000) exposureScore += 2.5;
  else if (totalEmissao >= 5000) exposureScore += 2.0;
  else if (totalEmissao >= 1000) exposureScore += 1.5;
  else if (totalEmissao >= 100) exposureScore += 0.8;
  else exposureScore += 0.3;

  const setorRiscoMap = {
    mineracao: 2.0, industria: 1.8, logistica: 1.8, agro: 1.5,
    construcao: 1.3, alimenticio: 1.2, saude: 1.0, comercio: 0.6,
    servicos: 0.5, tecnologia: 0.4, educacao: 0.3, outro: 1.0,
  };
  exposureScore += setorRiscoMap[setor] || 1.0;
  if (exportaUE === 'sim') exposureScore += 2.0;
  if (jaFazInventario === 'nao') exposureScore += 1.5;
  if (faturamento >= 50000000) exposureScore += 1.5;
  else if (faturamento >= 10000000) exposureScore += 1.0;
  else if (faturamento >= 1000000) exposureScore += 0.5;
  exposureScore = Math.min(10, Math.max(0, parseFloat(exposureScore.toFixed(1))));

  const multaPotencial = faturamento * 0.03;

  // ── CBAM ──
  let custoCBAM = 0;
  if (exportaUE === 'sim') {
    custoCBAM = totalEmissao * DADOS_MERCADO.precoCarbonEUETS * DADOS_MERCADO.cotacaoEURBRL;
    if (jaFazInventario === 'nao') custoCBAM *= (1 + DADOS_MERCADO.markupCBAM2026);
  }

  // ── COMPLIANCE SEAL ──
  let complianceSealStatus, complianceSealEmoji;
  if (exposureScore >= 6) {
    complianceSealStatus = 'NÃO CONFORME — AÇÃO NECESSÁRIA';
    complianceSealEmoji = '⚠️';
  } else if (exposureScore >= 4) {
    complianceSealStatus = 'EM RISCO — ADEQUAÇÃO RECOMENDADA';
    complianceSealEmoji = '🔶';
  } else {
    complianceSealStatus = 'BAIXO RISCO — MANTER MONITORAMENTO';
    complianceSealEmoji = '✅';
  }

  // ── EXPOSURE COLOR ──
  let exposureColor;
  if (exposureScore <= 3) exposureColor = '#2ecc71';
  else if (exposureScore <= 5) exposureColor = '#f1c40f';
  else if (exposureScore <= 7) exposureColor = '#e67e22';
  else exposureColor = '#e74c3c';

  // ── ÍNDICE DE DESPERDÍCIO ──
  const emissaoPerCapita = totalEmissao / funcionarios;
  const ratio = emissaoPerCapita / Math.max(mediaSetor, 0.1);
  let indiceDesperdicio;
  if (ratio <= 0) indiceDesperdicio = 0;
  else indiceDesperdicio = Math.min(10, Math.max(0, parseFloat((5 + Math.log2(ratio) * 2.15).toFixed(1))));

  let classDesperdicio;
  if (indiceDesperdicio <= 3) classDesperdicio = 'Bom';
  else if (indiceDesperdicio <= 5) classDesperdicio = 'Atenção';
  else if (indiceDesperdicio <= 7) classDesperdicio = 'Alto';
  else classDesperdicio = 'Crítico';

  let wasteIndexLevel;
  if (indiceDesperdicio <= 3) wasteIndexLevel = 'bom';
  else if (indiceDesperdicio <= 5) wasteIndexLevel = 'atencao';
  else if (indiceDesperdicio <= 7) wasteIndexLevel = 'alto';
  else wasteIndexLevel = 'critico';

  const pctVsMedia = Math.round((ratio - 1) * 100);
  let descDesperdicio;
  if (pctVsMedia <= -30) descDesperdicio = `Sua empresa emite ${emissaoPerCapita.toFixed(1)} tCO₂e/funcionário — ${Math.abs(pctVsMedia)}% abaixo da média do setor (${mediaSetor} t). Excelente!`;
  else if (pctVsMedia <= 10) descDesperdicio = `Sua empresa emite ${emissaoPerCapita.toFixed(1)} tCO₂e/funcionário — próximo da média do setor (${mediaSetor} t).`;
  else if (pctVsMedia <= 100) descDesperdicio = `Sua empresa emite ${emissaoPerCapita.toFixed(1)} tCO₂e/funcionário — ${pctVsMedia}% acima da média do setor (${mediaSetor} t).`;
  else descDesperdicio = `Sua empresa emite ${emissaoPerCapita.toFixed(1)} tCO₂e/funcionário — ${pctVsMedia}% acima da média do setor (${mediaSetor} t). Ação urgente recomendada.`;

  // ── CUSTOS ──
  const custoTradicional = 8500 + (totalEmissao * 120);
  const projecao5Anos = Array.from({ length: 6 }, (_, i) => custoTradicional * Math.pow(1.15, i));
  const custoTotal5Anos = projecao5Anos.reduce((a, b) => a + b, 0);

  // ── MAIOR EMISSOR / INSIGHT ──
  const categorias = [
    { nome: 'Energia', valor: emissaoEnergia, insight: 'Sua principal oportunidade de redução está no consumo de energia. Empresas similares conseguiram reduzir até 20% com auditoria energética e migração para fontes renováveis.' },
    { nome: 'Frota', valor: emissaoTransporte, insight: 'Sua frota é o maior emissor. A substituição gradual por veículos flex ou elétricos pode reduzir até 35% das emissões de transporte.' },
    { nome: 'Instalações', valor: emissaoInstalacoes, insight: 'Suas instalações têm alto potencial de otimização. Retrofit de climatização e eficiência hídrica podem reduzir até 25% das emissões.' },
    { nome: 'Resíduos', valor: emissaoResiduos, insight: 'A gestão de resíduos é seu ponto crítico. Programas estruturados de reciclagem e compostagem podem reduzir até 40% das emissões nesta categoria.' },
  ];
  const maiorCategoria = [...categorias].sort((a, b) => b.valor - a.valor)[0];

  // ── OBRIGAÇÕES SBCE ──
  const obrigacaoRelato = totalEmissao >= 10000;
  const obrigacaoConciliacao = totalEmissao >= 25000;
  const dadoSetor = DADOS_SETORIAIS[setor] || null;

  // ── WHATSAPP MESSAGE ──
  const nomeContato = data.nomeContato || '';
  const emailContato = data.emailContato || '';
  const telefone = data.telefone || '';
  const cnpj = data.cnpj || '';
  const cidade = data.cidade || '';

  const waMsg = [
    `*RELATÓRIO DoubleDyn - Impacto Ambiental*`, ``,
    `━━━ DADOS DA EMPRESA ━━━`,
    `- *Empresa:* ${empresa}`,
    cnpj ? `- *CNPJ:* ${cnpj}` : '',
    `- *Setor:* ${setor}`, `- *Funcionários:* ${funcionarios}`,
    cidade ? `- *Cidade:* ${cidade}` : '', ``,
    `━━━ RESULTADO ━━━`,
    `> *Risco Regulatório:* ${risco}`,
    `> *Índice de Desperdício:* ${indiceDesperdicio.toFixed(1)}/10 (${classDesperdicio})`,
    `> *IMPACTO TOTAL:* *${totalEmissao.toFixed(1)} tCO2e/ano*`,
    `> *Maior Emissor:* ${maiorCategoria.nome}`, ``,
    `━━━ FINANCEIRO ━━━`,
    `> Mercado Tradicional: ${formatBRL(custoTradicional)}`,
    `> Projeção 5 anos (inação): ${formatBRL(custoTotal5Anos)}`,
    `> Pacote DoubleDyn: *Sob Consulta*`, `> *Economia Estimada: Até 70%*`, ``,
    `Gostaria de criar uma conta gratuita e ver meu plano de ação completo com o simulador de ROI.`,

  ].filter(l => l !== '').join('\n');

  return {
    // Empresa
    empresa, setor, funcionarios, estimadoPorCNAE,
    // Categorias de emissão
    emissaoEnergia, emissaoTransporte, emissaoInstalacoes, emissaoResiduos,
    emissaoBase, margemSeguranca, totalEmissao,
    // DQS
    dqsScore, pcrSeal, pcrColor,
    // Impacto emocional
    arvoresPreservadas,
    // Risco regulatório
    risco, riscoCor, riscoMsg,
    // Exposição SBCE
    exposureScore, exposureColor, multaPotencial, faturamento,
    custoCBAM, exportaUE, jaFazInventario, setorCBAM,
    complianceSealStatus, complianceSealEmoji,
    obrigacaoRelato, obrigacaoConciliacao,
    dadoSetor,
    // Desperdício
    indiceDesperdicio, classDesperdicio, wasteIndexLevel, descDesperdicio,
    // Custos
    custoTradicional, projecao5Anos, custoTotal5Anos,
    // Insight
    maiorCategoria, categorias,
    // Contato
    nomeContato, emailContato, telefone, cnpj, cidade,
    // WhatsApp
    waMsg,
  };
}

// ===== ESTIMATIVA PARCIAL AO VIVO (Live Meter) =====
// Recalcula as emissões por categoria apenas com o que já foi preenchido,
// permitindo que o usuário acompanhe o impacto crescendo a cada etapa.
// Usa os MESMOS fatores do calculateEmissions (fonte única de verdade).
export function computePartialEstimates(values = {}) {
  const v = values || {};
  const n = (x) => parseFloat(x) || 0;

  // ── ENERGIA (STEP 2) ──
  const fonteEnergia = v.fonteEnergia || 'convencional';
  let fatorEletrico = FATORES.ELETRICIDADE;
  if (fonteEnergia === 'solar' || fonteEnergia === 'eolica') fatorEletrico *= 0.05;
  else if (fonteEnergia === 'biomassa') fatorEletrico *= 0.15;
  else if (fonteEnergia === 'misto') fatorEletrico *= 0.55;
  const energia = (n(v.eletricidade) / 1000) * fatorEletrico * 12
    + (n(v.glp) * FATORES.GLP / 1000) * 12
    + (n(v.gasNatural) * FATORES.GAS_NATURAL / 1000) * 12
    + (n(v.dieselGerador) * FATORES.DIESEL_EST / 1000) * 12
    + (n(v.lenha) * FATORES.LENHA / 1000) * 12;

  // ── FROTA (STEP 3) ──
  const frota = (n(v.gasolinaLitros) * FATORES.GASOLINA / 1000) * 12
    + (n(v.dieselLitros) * FATORES.DIESEL / 1000) * 12
    + (n(v.gnvM3) * FATORES.GNV / 1000) * 12
    + (n(v.viagensDomesticas) * FATORES.DIST_DOM * FATORES.AEREO_DOM) / 1000
    + (n(v.viagensInternacionais) * FATORES.DIST_INT * FATORES.AEREO_INT) / 1000;

  // ── INSTALAÇÕES (STEP 4) ──
  const homeOfficeRatio = n(v.homeOffice) / 100;
  const fatorPresencial = 1 - (homeOfficeRatio * 0.7);
  const instalacoes = (n(v.aguaM3) * FATORES.AGUA / 1000) * 12 * fatorPresencial
    + n(v.arCondicionado) * FATORES.AR_COND * fatorPresencial
    + (FATORES.REFRIG[v.refrigeracao] || 0)
    + (n(v.papelResmas) * FATORES.PAPEL / 1000) * 12 * fatorPresencial;

  // ── RESÍDUOS (STEP 5) ──
  const residuos = (n(v.residuos) * (1 - n(v.reciclagem) / 100) * FATORES.RESIDUOS) * 12
    + (n(v.residuosPerigosos) * FATORES.RESIDUOS_PERIG / 1000) * 12;

  const categorias = [
    { nome: 'Energia', valor: energia },
    { nome: 'Frota', valor: frota },
    { nome: 'Instalações', valor: instalacoes },
    { nome: 'Resíduos', valor: residuos },
  ];

  const totalBase = energia + frota + instalacoes + residuos;
  const categoriasPreenchidas = categorias.filter(c => c.valor > 0).length;
  const totalComMargem = totalBase * 1.15; // mesma margem do calculateEmissions (relatório final)

  return {
    categorias,
    energia, frota, instalacoes, residuos, // acesso direto por categoria
    totalBase,          // sem margem — os 15% de segurança entram no cálculo final
    totalComMargem,
    categoriasPreenchidas,
    custoEstimado: 8500 + totalComMargem * 120, // mesma fórmula do relatório final (custoTradicional)
  };
}
