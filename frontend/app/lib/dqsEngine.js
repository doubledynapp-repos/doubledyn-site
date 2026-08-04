/**
 * DoubleDyn Quality Score (DQS) Engine v1.1
 * Metodologia hierárquica — GHG Protocol (medir → reduzir → compensar),
 * alinhada às obrigações do SBCE (Lei 15.042/2024).
 *
 * Pesos documentados (DQS_METODOLOGIA):
 *  - Intensidade   500 pts (50%) — eficiência carbônica vs. benchmark setorial
 *  - Gestão        250 pts (25%) — governança/relato (rubrica, SEM pontos grátis)
 *  - Compensação   250 pts (25%) — neutralização on-chain
 *  - Fator de confiança: estimativa por CNAE (não medida) penaliza 8% (0,92)
 */

export const DQS_METODOLOGIA = {
  versao: 'v1.1',
  base: 'Hierarquia de mitigação do GHG Protocol (medir → reduzir → compensar), alinhada às obrigações de relato e conciliação do SBCE (Lei 15.042/2024).',
  pesos: { intensidade: 500, gestao: 250, compensacao: 250 },
  metricasIntensidade: {
    faturamento: 'tCO2e ÷ R$ 1 milhão de faturamento vs. benchmark setorial (padrão SEEG / GHG Protocol Brasil)',
    operacional: 'tCO2e ÷ funcionário vs. média setorial (proxy documentado quando o faturamento não é informado)',
  },
  curvaIntensidade: 'razão ≤ 0,3 → 500 pts; ≤ 0,7 → 420–500; ≤ 1,0 → 320–420; ≤ 2,0 → 150–320; > 2,0 → mínimo 20 (decaimento).',
  rubricaGestao: [
    { sinal: 'hasCertification', pontos: 70, descricao: 'Certificação ambiental formal (ISO 14001/EMAS)' },
    { sinal: 'hasESGPolicy', pontos: 60, descricao: 'Inventário GHG ou política ESG estruturada' },
    { sinal: 'hasRenewableEnergy', pontos: 50, descricao: 'Energia renovável / migração para mercado livre' },
    { sinal: 'hasWasteManagement', pontos: 40, descricao: 'Gestão estruturada de resíduos' },
    { sinal: 'hasAnnualReport', pontos: 30, descricao: 'Relato anual de emissões (obrigação SBCE ≥ 10 kt)' },
  ],
  fatorConfianca: { estimadoPorCNAE: 0.92 }, // estimativa não medida → incerteza penaliza 8%
  faixa: { min: 50, max: 1000 },
};

// Benchmarks da Média Nacional Brasileira (tCO2e por R$ 1 Milhão de Faturamento/Ano) - Fonte: SEEG / GHG Protocol Brasil
const SECTOR_BENCHMARKS = {
  agro: { name: 'Agronegócio & Pecuária', benchmarkIntensity: 120.0, avgDQS: 520 },
  mineracao: { name: 'Mineração & Siderurgia', benchmarkIntensity: 180.0, avgDQS: 480 },
  industria: { name: 'Indústria & Manufatura', benchmarkIntensity: 85.0, avgDQS: 580 },
  logistica: { name: 'Transporte & Logística', benchmarkIntensity: 110.0, avgDQS: 530 },
  construcao: { name: 'Construção Civil & Infraestrutura', benchmarkIntensity: 75.0, avgDQS: 610 },
  servicos: { name: 'Serviços & Tecnologia', benchmarkIntensity: 12.0, avgDQS: 750 },
  comercio: { name: 'Comércio & Varejo', benchmarkIntensity: 25.0, avgDQS: 710 },
  outros: { name: 'Outros Setores', benchmarkIntensity: 60.0, avgDQS: 600 },
};

function scoreIntensidade(benchmarkRatio) {
  if (benchmarkRatio <= 0.3) return 500;
  if (benchmarkRatio <= 0.7) return 420 + (0.7 - benchmarkRatio) * 200;
  if (benchmarkRatio <= 1.0) return 320 + (1.0 - benchmarkRatio) * 333;
  if (benchmarkRatio <= 2.0) return 150 + (2.0 - benchmarkRatio) * 170;
  return Math.max(20, 150 - (benchmarkRatio - 2.0) * 30);
}

/**
 * Calcula o DQS v1.1
 * @param {Object} input
 * @param {number} [input.emissionsTotal] - Emissões totais em tCO2e/ano
 * @param {number} [input.revenueMillions] - Faturamento anual em R$ milhões (métrica preferencial)
 * @param {number} [input.intensityRatio] - Razão pré-calculada (proxy operacional p/ calculadora sem faturamento)
 * @param {string} [input.sectorKey] - Chave do setor
 * @param {number} [input.offsetTonnes] - Toneladas compensadas
 * @param {boolean} [input.hasRenewableEnergy] - Energia renovável/mercado livre
 * @param {boolean} [input.hasESGPolicy] - Política ESG / inventário estruturado
 * @param {boolean} [input.hasCertification] - Certificação ambiental formal
 * @param {boolean} [input.hasWasteManagement] - Gestão estruturada de resíduos
 * @param {boolean} [input.hasAnnualReport] - Relato anual de emissões
 * @param {boolean} [input.estimadoPorCNAE] - Estimativa por setor (não medida) → fator de confiança
 */
export function calculateDQS(input) {
  const {
    emissionsTotal = 0,
    revenueMillions = 0,
    intensityRatio = null,
    sectorKey = 'industria',
    offsetTonnes = 0,
    hasRenewableEnergy = false,
    hasESGPolicy = false,
    hasCertification = false,
    hasWasteManagement = false,
    hasAnnualReport = false,
    estimadoPorCNAE = false,
  } = input;

  const sector = SECTOR_BENCHMARKS[sectorKey] || SECTOR_BENCHMARKS.industria;

  // 1. Intensidade (0–500): métrica preferencial por faturamento; proxy operacional se ausente
  const usaFaturamento = revenueMillions > 0;
  const benchmarkRatio = usaFaturamento
    ? (emissionsTotal / revenueMillions) / sector.benchmarkIntensity
    : (intensityRatio != null ? intensityRatio : 1);
  const intensityScore = scoreIntensidade(benchmarkRatio);

  // 2. Gestão (0–250): rubrica metodológica — SEM pontos grátis (0 = nenhuma ação de gestão)
  const aplicadas = [];
  let managementScore = 0;
  for (const item of DQS_METODOLOGIA.rubricaGestao) {
    if (input[item.sinal]) {
      managementScore += item.pontos;
      aplicadas.push(item.sinal);
    }
  }

  // 3. Compensação (0–250): % neutralizado × 250
  const offsetPercentage = emissionsTotal > 0 ? Math.min(1.0, offsetTonnes / emissionsTotal) : 0;
  const offsetScore = Math.round(offsetPercentage * 250);

  // 4. Fator de confiança metodológica (estimativa ≠ medição)
  const fatorConfianca = estimadoPorCNAE ? DQS_METODOLOGIA.fatorConfianca.estimadoPorCNAE : 1;
  const confiancaAplicado = estimadoPorCNAE;

  // Score Final (0–1000)
  const rawDQS = Math.round((intensityScore + managementScore + offsetScore) * fatorConfianca);
  const dqsScore = Math.min(DQS_METODOLOGIA.faixa.max, Math.max(DQS_METODOLOGIA.faixa.min, rawDQS));

  // Selo DQS
  let seal = {
    level: 'Bronze',
    color: '#cd7f32',
    gradient: 'linear-gradient(135deg, #b87333 0%, #e5a067 100%)',
    bgBadge: '#2a1e17',
    textBadge: '#e5a067',
    label: 'Alerta de Risco SBCE / Compensação Urgente',
    description: 'A empresa possui intensidade carbônica acima da média setorial e baixo nível de compensação. Risco de multas sob a Lei 15.042/2024.'
  };
  if (dqsScore >= 751) {
    seal = {
      level: 'Ouro',
      color: '#f1c40f',
      gradient: 'linear-gradient(135deg, #f39c12 0%, #f1c40f 50%, #f39c12 100%)',
      bgBadge: '#2c2508',
      textBadge: '#f1c40f',
      label: 'Liderança ESG & Excelência ReFi On-Chain',
      description: 'A empresa demonstra altíssima eficiência carbônica, superando metas do SBCE com transparência imutável na blockchain Polygon.'
    };
  } else if (dqsScore >= 401) {
    seal = {
      level: 'Prata',
      color: '#bdc3c7',
      gradient: 'linear-gradient(135deg, #7f8c8d 0%, #bdc3c7 100%)',
      bgBadge: '#1a242f',
      textBadge: '#bdc3c7',
      label: 'Conforme Média Nacional / Em Evolução',
      description: 'A empresa atende à média setorial nacional. Recomenda-se aumentar o percentual de neutralização para atingir o Selo Ouro.'
    };
  }

  // Avaliação de Risco SBCE (Lei 15.042/2024)
  let sbceRisk = { level: 'Baixo', color: '#10b981', penaltyEstimate: 0 };
  if (emissionsTotal > 25000) {
    sbceRisk = { level: 'CRÍTICO (Mercado Regulado Obrigatório)', color: '#ef4444', penaltyEstimate: Math.round((emissionsTotal - 25000) * 65) };
  } else if (emissionsTotal > 10000) {
    sbceRisk = { level: 'Alto (Relatório Anual Obrigatório SBCE)', color: '#f59e0b', penaltyEstimate: Math.round(emissionsTotal * 35) };
  } else if (emissionsTotal > 5000) {
    sbceRisk = { level: 'Médio (Pressão da Cadeia de Suprimentos)', color: '#3b82f6', penaltyEstimate: 0 };
  }

  // Passivo Ambiental Estimado (preço de referência do crédito: R$ 45–75/tCO2e)
  const carbonPriceBRL = 55;
  const financialLiability = Math.round(emissionsTotal * carbonPriceBRL);
  const remainingLiability = Math.max(0, Math.round((emissionsTotal - offsetTonnes) * carbonPriceBRL));

  return {
    dqsScore,
    seal,
    sector: sector.name,
    sectorAvgDQS: sector.avgDQS,
    emissions: {
      total: Math.round(emissionsTotal),
      offsetTonnes: Math.round(offsetTonnes),
      offsetPercentage: Math.round(offsetPercentage * 100),
    },
    financial: {
      totalLiabilityBRL: financialLiability,
      remainingLiabilityBRL: remainingLiability,
      estimatedCreditPrice: carbonPriceBRL,
    },
    sbceRisk,
    breakdown: {
      intensityScore: Math.round(intensityScore),
      managementScore: Math.round(managementScore),
      offsetScore,
      rubricaAplicada: aplicadas,
    },
    metodologia: {
      versao: DQS_METODOLOGIA.versao,
      pesos: DQS_METODOLOGIA.pesos,
      metricaIntensidade: usaFaturamento ? 'faturamento' : 'operacional',
      fatorConfiancaAplicado: confiancaAplicado ? DQS_METODOLOGIA.fatorConfianca.estimadoPorCNAE : 1,
    },
  };
}
