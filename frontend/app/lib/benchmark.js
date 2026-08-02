// SPDX-License-Identifier: MIT
// Copyright (c) 2026 DoubleDyn Ecotoken — MIT License (ver LICENSE.md)
// ===== Benchmarking Setorial (v1) — plataforma de inteligência competitiva =====
// Compara a intensidade de emissão do cliente (tCO₂e por R$ 1 milhão de faturamento)
// com a média do seu setor (CNAE) e estima o percentil de posição.
//
// FONTE DOS BENCHMARKS: médias nacionais de intensidade (SEEG / GHG Protocol Brasil).
// ⚠️ Status: a validar individualmente na Auditoria R2 (SEEG × CNAE × IBGE).
// Setores sem benchmark publicado usam aproximação por similaridade (marcado abaixo).
//
// PREMISSA ESTATÍSTICA v1 (documentada): distribuição log-normal das intensidades
// dentro de cada setor, com mediana = benchmark setorial e σ calibrado para que
// intensidade = 50% da média corresponda ao top 20% (percentil 20).
// → Validar com pool real de dados (Fase 1.9-V2, com consentimento LGPD e N ≥ 30).

export const SECTOR_BENCHMARK = {
  // tCO₂e por R$ 1 mi de faturamento anual
  agro: 120,        // SEEG/GHG Protocol Brasil
  mineracao: 180,   // SEEG/GHG Protocol Brasil
  industria: 85,    // SEEG/GHG Protocol Brasil
  logistica: 110,   // SEEG/GHG Protocol Brasil
  construcao: 75,   // SEEG/GHG Protocol Brasil
  servicos: 12,     // SEEG/GHG Protocol Brasil
  comercio: 25,     // SEEG/GHG Protocol Brasil
  tecnologia: 12,   // ≈ serviços (aproximação — R2)
  saude: 60,        // ≈ outros (aproximação — R2)
  alimenticio: 60,  // ≈ outros (aproximação — R2)
  educacao: 12,     // ≈ serviços (aproximação — R2)
  outro: 60,
};

// σ calibrado: P(intensidade ≤ 50% da média) = 80% → σ = |ln(0,5)| / Φ⁻¹(0,8) ≈ 0,82
const SIGMA = 0.82;
const TOP20_RATIO = 0.5; // top 20% mais eficiente ≈ intensidade ≤ 50% da média

// CDF da normal padrão (aproximação Abramowitz–Stegun 7.1.26)
function normalCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp(-x * x / 2);
  const p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x >= 0 ? 1 - p : p;
}

/**
 * Compara a empresa com a média do setor.
 * @param {object} input { emissionsTotal (tCO₂e/ano), revenueMillions (R$ mi), sector }
 * @returns {object} { ok, intensity, benchmark, ratio, rank, pctBetter, pctDiff,
 *   targetTop20, reductionNeededPct, status, message, opportunity }
 * rank = posição percentual (menor = melhor): 20 = top 20% mais eficiente.
 */
export function computeBenchmark({ emissionsTotal = 0, revenueMillions = 0, sector = 'outro' } = {}) {
  const benchmark = SECTOR_BENCHMARK[sector] || SECTOR_BENCHMARK.outro;
  const rev = Math.max(Number(revenueMillions) || 0, 0.1);

  if (!emissionsTotal || emissionsTotal <= 0 || !rev) {
    return {
      ok: false,
      message: 'Informe suas emissões e o faturamento para comparar com a média do seu setor.',
    };
  }

  const intensity = emissionsTotal / rev;
  const ratio = intensity / benchmark;
  const z = -Math.log(ratio) / SIGMA;
  const pctBetter = Math.round(normalCDF(z) * 100);           // % do setor que emite MENOS
  const rank = Math.max(1, Math.min(99, 100 - pctBetter));     // posição (menor = melhor)
  const pctDiff = Math.round((ratio - 1) * 100);               // % vs média do setor
  const targetTop20 = benchmark * TOP20_RATIO;
  const reductionNeededPct = ratio > TOP20_RATIO
    ? Math.round(((ratio - TOP20_RATIO) / ratio) * 100)
    : 0;

  let status = 'na_media';
  if (ratio <= 0.7) status = 'abaixo';
  else if (ratio >= 1.3) status = 'acima';

  const t = Math.round(emissionsTotal);
  const i = intensity.toFixed(1);

  let message;
  if (status === 'acima') {
    message = `Sua empresa emite ${t} tCO₂e/ano — intensidade de ${i} t/R$mi, ${pctDiff}% ACIMA da média do setor (${benchmark} t/R$mi). Você está no percentil ${rank} do setor: ${pctBetter}% das empresas emitem menos que você. Para alcançar o top 20% mais eficiente, reduza ~${reductionNeededPct}% das emissões.`;
  } else if (status === 'abaixo') {
    message = `Sua empresa emite ${t} tCO₂e/ano — intensidade de ${i} t/R$mi, ${Math.abs(pctDiff)}% ABAIXO da média do setor (${benchmark} t/R$mi). Você está no percentil ${rank} — entre os ${100 - rank}% mais eficientes do seu setor. Essa é uma vantagem competitiva real: use-a em licitações e no compliance SBCE.`;
  } else {
    message = `Sua empresa emite ${t} tCO₂e/ano — intensidade de ${i} t/R$mi, próxima da média do setor (${benchmark} t/R$mi, percentil ${rank}). Pequenos ajustes podem colocá-lo no top 20% mais eficiente — reduza ~${reductionNeededPct}% das emissões.`;
  }

  const opportunity = status === 'abaixo'
    ? 'Proteja e monetize sua vantagem: certificação DoubleDyn + relatório de benchmark para licitações.'
    : 'Urgência regulatória + economia: veja seu plano de ação para reduzir e evitar multas da Lei SBCE.';

  return {
    ok: true,
    intensity, benchmark, ratio,
    rank, pctBetter, pctDiff,
    targetTop20, reductionNeededPct,
    status, message, opportunity,
  };
}
