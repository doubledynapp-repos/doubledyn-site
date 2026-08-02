// SPDX-License-Identifier: MIT
// Copyright (c) 2026 DoubleDyn Ecotoken — MIT License (ver LICENSE.md)
/**
 * DoubleDyn Quality Score (DQS) Engine v1.0
 * Motor de Cálculo de Inteligência de Carbono & Conformidade SBCE (Lei 15.042/2024)
 */

// Benchmarks da Média Nacional Brasileira (tCO2e por R$ 1 Milhão de Faturamento/Ano) - Fonte: SEEG / GHG Protocol Brasil
const SECTOR_BENCHMARKS = {
  agro: { name: 'Agronegócio & Pecuária', benchmarkIntensity: 120.0, avgDQS: 520 },
  mineracao: { name: 'Mineração & Siderurgia', benchmarkIntensity: 180.0, avgDQS: 480 },
  industria: { name: 'Indústria & Manufatura', benchmarkIntensity: 85.0, avgDQS: 580 },
  logistica: { name: 'Transporte & Logística', benchmarkIntensity: 110.0, avgDQS: 530 },
  construcao: { name: 'Construção Civil & Infraestrutura', benchmarkIntensity: 75.0, avgDQS: 610 },
  servicos: { name: 'Serviços & Tecnologia', benchmarkIntensity: 12.0, avgDQS: 750 },
  comercio: { name: 'Comércio & Varejo', benchmarkIntensity: 25.0, avgDQS: 710 },
  outros: { name: 'Outros Setores', benchmarkIntensity: 60.0, avgDQS: 600 }
};

/**
 * Calcula o DoubleDyn Quality Score (DQS) e traz o diagnóstico completo
 * @param {Object} input
 * @param {number} input.emissionsTotal - Emissões totais em tCO2e/ano
 * @param {number} [input.emissionsScope1] - Emissões diretas Escopo 1
 * @param {number} [input.emissionsScope2] - Emissões indiretas energia Escopo 2
 * @param {number} [input.emissionsScope3] - Emissões da cadeia Escopo 3
 * @param {number} [input.revenueMillions] - Faturamento anual em R$ Milhões (opcional)
 * @param {string} [input.sectorKey] - Chave do setor (agro, mineracao, industria, etc)
 * @param {number} [input.offsetTonnes] - Toneladas de carbono já compensadas/queimadas
 * @param {boolean} [input.hasRenewableEnergy] - Se utiliza energia solar/renovável
 * @param {boolean} [input.hasESGPolicy] - Se possui política ESG/inventário estruturado
 */
export function calculateDQS(input) {
  const {
    emissionsTotal = 0,
    emissionsScope1 = emissionsTotal * 0.55,
    emissionsScope2 = emissionsTotal * 0.25,
    emissionsScope3 = emissionsTotal * 0.20,
    revenueMillions = 10,
    sectorKey = 'industria',
    offsetTonnes = 0,
    hasRenewableEnergy = false,
    hasESGPolicy = false
  } = input;

  const sector = SECTOR_BENCHMARKS[sectorKey] || SECTOR_BENCHMARKS.industria;
  
  // 1. Cálculo da Intensidade de Emissão (tCO2e / R$ Milhão)
  const companyIntensity = revenueMillions > 0 ? emissionsTotal / revenueMillions : emissionsTotal / 5;
  const benchmarkRatio = companyIntensity / sector.benchmarkIntensity;

  // 2. Pontuação Base de Intensidade (0 a 500 pontos)
  let intensityScore = 0;
  if (benchmarkRatio <= 0.3) intensityScore = 500;
  else if (benchmarkRatio <= 0.7) intensityScore = 420 + (0.7 - benchmarkRatio) * 200;
  else if (benchmarkRatio <= 1.0) intensityScore = 320 + (1.0 - benchmarkRatio) * 333;
  else if (benchmarkRatio <= 2.0) intensityScore = 150 + (2.0 - benchmarkRatio) * 170;
  else intensityScore = Math.max(20, 150 - (benchmarkRatio - 2.0) * 30);

  // 3. Pontuação de Gestão e Boas Práticas (0 a 200 pontos)
  let managementScore = 100;
  if (hasRenewableEnergy) managementScore += 50;
  if (hasESGPolicy) managementScore += 50;

  // 4. Pontuação de Compensação On-Chain / ReFi (0 a 300 pontos)
  const offsetPercentage = emissionsTotal > 0 ? Math.min(1.0, offsetTonnes / emissionsTotal) : 0;
  const offsetScore = Math.round(offsetPercentage * 300);

  // Score Final DQS (0 a 1000)
  const rawDQS = Math.round(intensityScore + managementScore + offsetScore);
  const dqsScore = Math.min(1000, Math.max(50, rawDQS));

  // Determinação do Selo DQS
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

  // Avaliação de Risco Fiscal / SBCE (Lei 15.042/2024)
  let sbceRisk = { level: 'Baixo', color: '#10b981', penaltyEstimate: 0 };
  if (emissionsTotal > 25000) {
    sbceRisk = {
      level: 'CRÍTICO (Mercado Regulado Obrigatório)',
      color: '#ef4444',
      penaltyEstimate: Math.round((emissionsTotal - 25000) * 65)
    };
  } else if (emissionsTotal > 10000) {
    sbceRisk = {
      level: 'Alto (Relatório Anual Obrigatório SBCE)',
      color: '#f59e0b',
      penaltyEstimate: Math.round(emissionsTotal * 35)
    };
  } else if (emissionsTotal > 5000) {
    sbceRisk = {
      level: 'Médio (Pressão da Cadeia de Suprimentos)',
      color: '#3b82f6',
      penaltyEstimate: 0
    };
  }

  // Passivo Ambiental Estimado (Preço médio crédito de carbono BCT/TCO2 R$ 45 - R$ 75/tCO2e)
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
      scope1: Math.round(emissionsScope1),
      scope2: Math.round(emissionsScope2),
      scope3: Math.round(emissionsScope3),
      offsetTonnes: Math.round(offsetTonnes),
      offsetPercentage: Math.round(offsetPercentage * 100)
    },
    financial: {
      totalLiabilityBRL: financialLiability,
      remainingLiabilityBRL: remainingLiability,
      estimatedCreditPrice: carbonPriceBRL
    },
    sbceRisk,
    breakdown: {
      intensityScore: Math.round(intensityScore),
      managementScore: Math.round(managementScore),
      offsetScore: Math.round(offsetScore)
    }
  };
}
