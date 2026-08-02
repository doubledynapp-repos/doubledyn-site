// SPDX-License-Identifier: MIT
// Copyright (c) 2026 DoubleDyn Ecotoken — MIT License (ver LICENSE.md)
// ===== Gerador de Plano de Ação (v1) — o produto pós-calculadora =====
// Gera 3 ações específicas a partir do diagnóstico:
//   Ação 1: ataca o MAIOR emissor (energia/frota/instalações/resíduos)
//   Ação 2: gestão — inventário GHG + política ESG (habilita selo/relatório SBCE)
//   Ação 3: SEMPRE compensação DoubleDyn (produto pago — receita direta)
//
// ⚠️ TODOS os valores financeiros são ESTIMATIVAS de mercado (faixa média Brasil)
// com premissas documentadas abaixo — a calibrar com dados reais na Fase 1.11
// (simulador de ROI interativo). Nada aqui é cotação ou promessa comercial.

export const PREMISSAS = {
  // R$/tCO2e — faixa média do mercado voluntário brasileiro (premissa a calibrar)
  precoCreditoTon: 90,
  // R$/veículo — VE médio compacto/sedan (faixa 150k–250k)
  custoVeiculoEletrico: 180000,
  // economia anual por VE vs combustão (combustível + manutenção) — R$/veículo/ano
  economiaVeiculoEletricoAno: 24000,
  // tCO2e/veículo/ano — média frota leve comercial
  emissaoPorVeiculoAno: 4,
  // fração da frota eletrificada no plano (2 anos)
  fracaoFrotaEletrificar: 0.3,
  // redução de emissões por veículo eletrificado vs combustão (mix de recarga)
  reducaoFrotaEletricaPct: 0.6,
  // economia média no mercado livre de energia (% da conta)
  economiaMercadoLivrePct: 0.18,
  // tarifa média de energia (R$/MWh, com tributos) — faixa BR ~700–900
  tarifaMediaMWh: 800,
  // fator médio SIN auditado (MCTI 2025) — usado p/ estimar consumo a partir das emissões
  fatorSINEletricidade: 0.0461,
  // retrofit de climatização — custo médio e potencial de redução
  retrofitCusto: 45000,
  retrofitReducaoPct: 0.2,
  // programa de reciclagem/compostagem
  reciclagemCusto: 12000,
  reciclagemReducaoPct: 0.35,
  // inventário GHG + política ESG (habilita selo e relatório SBCE)
  inventarioCusto: 15000,
  impactoDQSInventario: 50,
};

// Rótulo da exposição regulatória (base: Lei 15.042/2024, Art. 29 — até 3% do faturamento)
function exposicaoLabel(multaPotencial) {
  return `reduz a exposição regulatória estimada (até 3% do faturamento — Lei 15.042/2024)`;
}

// Custo anual estimado de energia elétrica a partir das emissões de Escopo 2 (proxy documentado)
function custoEnergiaAnualEstimado(emissaoEnergia, P) {
  if (!emissaoEnergia || emissaoEnergia <= 0) return 0;
  const mwh = emissaoEnergia / P.fatorSINEletricidade;
  return mwh * P.tarifaMediaMWh;
}

const r1 = (n) => Math.round(n * 10) / 10;

export function gerarPlanoDeAcao(result) {
  const r = result || {};
  const total = r.totalEmissao || 0;
  const multaPotencial = r.multaPotencial || 0;
  const faturamento = r.faturamento || 0;
  const P = PREMISSAS;

  const acoes = [];
  let dqsGanho = 0;

  // ── AÇÃO 1: maior emissor ──
  // No caminho "não sei" (estimadoPorCNAE) as categorias não são discriminadas:
  // energia é a maior oportunidade típica do setor (premissa documentada) e a
  // base usada é o total estimado pela média setorial — sempre com aviso claro.
  const estimadoPorCNAE = Boolean(r.estimadoPorCNAE);
  const maior = r.maiorCategoria?.nome || 'Energia';
  const emitMaior = {
    'Energia': r.emissaoEnergia || 0,
    'Frota': r.emissaoTransporte || 0,
    'Instalações': r.emissaoInstalacoes || 0,
    'Resíduos': r.emissaoResiduos || 0,
  }[maior] || 0;

  let a1 = null;
  if (maior === 'Frota' && emitMaior > 0) {
    const veiculos = Math.max(1, Math.ceil(emitMaior / P.emissaoPorVeiculoAno));
    const veiculosPlano = Math.max(1, Math.round(veiculos * P.fracaoFrotaEletrificar));
    const custo = veiculosPlano * P.custoVeiculoEletrico;
    const reducao = r1(emitMaior * P.fracaoFrotaEletrificar * P.reducaoFrotaEletricaPct);
    const economia = veiculosPlano * P.economiaVeiculoEletricoAno;
    a1 = {
      id: 'a1_frota', tipo: 'eficiencia',
      titulo: `Eletrifique ${veiculosPlano} veículo${veiculosPlano > 1 ? 's' : ''} da frota (fase 1)`,
      descricao: `Sua frota é o maior emissor (${emitMaior.toFixed(0)} tCO₂e/ano). A substituição gradual por veículos elétricos reduz até 60% das emissões de transporte e corta custo de combustível e manutenção.`,
      categoria: 'Frota',
      custo, economiaAnual: economia,
      paybackMeses: economia > 0 ? Math.round((custo / economia) * 12) : null,
      reducaoTonnes: reducao, impactoDQS: 40,
      exposicao: exposicaoLabel(multaPotencial),
      nota: 'Economia por veículo: premissa de R$ 24 mil/ano (combustível + manutenção).',
    };
  } else if (maior === 'Energia' && (emitMaior > 0 || estimadoPorCNAE)) {
    const base = emitMaior > 0 ? emitMaior : total; // estimado: usa o total projetado pelo setor
    const reducao = r1(base * P.economiaMercadoLivrePct);
    const custoEnergia = emitMaior > 0 ? custoEnergiaAnualEstimado(emitMaior, P) : 0;
    const economia = emitMaior > 0 ? Math.round(custoEnergia * P.economiaMercadoLivrePct) : null;
    a1 = {
      id: 'a1_energia', tipo: 'eficiencia',
      titulo: 'Migre para o mercado livre de energia',
      descricao: estimadoPorCNAE
        ? `Seu diagnóstico foi estimado pela média do setor (${total.toFixed(0)} tCO₂e/ano). Energia costuma ser a maior oportunidade de redução: a migração para o mercado livre permite contratar energia renovável com economia média de ~18% na conta.`
        : `Energia é seu maior emissor (${emitMaior.toFixed(0)} tCO₂e/ano). A migração para o mercado livre permite contratar energia renovável com economia média de ~18% na conta.`,
      categoria: 'Energia',
      custo: 0, economiaAnual: economia,
      paybackMeses: economia ? 0 : null,
      reducaoTonnes: reducao, impactoDQS: 40,
      exposicao: exposicaoLabel(multaPotencial),
      nota: estimadoPorCNAE
        ? 'Redução estimada sobre o total projetado pela média setorial — confirmar com dados reais no inventário.'
        : 'Custo anual de energia estimado a partir das emissões (fator SIN MCTI 2025 + tarifa média R$ 800/MWh).',
    };
  } else if (maior === 'Instalações' && emitMaior > 0) {
    const reducao = r1(emitMaior * P.retrofitReducaoPct);
    a1 = {
      id: 'a1_instalacoes', tipo: 'eficiencia',
      titulo: 'Retrofit de climatização e eficiência hídrica',
      descricao: `Suas instalações emitem ${emitMaior.toFixed(0)} tCO₂e/ano. Retrofit de ar-condicionado, iluminação LED e eficiência hídrica podem reduzir até 20% das emissões da categoria.`,
      categoria: 'Instalações',
      custo: P.retrofitCusto, economiaAnual: null,
      paybackMeses: null,
      reducaoTonnes: reducao, impactoDQS: 30,
      exposicao: exposicaoLabel(multaPotencial),
      nota: 'Economia financeira detalhada no simulador de ROI (depende de dados da sua conta).',
    };
  } else if (maior === 'Resíduos' && emitMaior > 0) {
    const reducao = r1(emitMaior * P.reciclagemReducaoPct);
    a1 = {
      id: 'a1_residuos', tipo: 'eficiencia',
      titulo: 'Programa estruturado de reciclagem e compostagem',
      descricao: `Resíduos emitem ${emitMaior.toFixed(0)} tCO₂e/ano. Desviar resíduos do aterro com reciclagem e compostagem reduz até 35% das emissões da categoria.`,
      categoria: 'Resíduos',
      custo: P.reciclagemCusto, economiaAnual: null,
      paybackMeses: null,
      reducaoTonnes: reducao, impactoDQS: 25,
      exposicao: exposicaoLabel(multaPotencial),
      nota: 'Além de reduzir emissões, reduz custo de disposição e imagem ESG.',
    };
  }
  if (a1) { acoes.push(a1); dqsGanho += a1.impactoDQS; }

  // ── AÇÃO 2: gestão — inventário GHG + política ESG ──
  const a2 = {
    id: 'a2_gestao', tipo: 'gestao',
    titulo: 'Estruture inventário GHG e política ESG',
    descricao: 'Inventário de GEE estruturado + política ESG pública é o pré-requisito do selo DoubleDyn e do relatório SBCE. Sem ele, não há como comprovar evolução ou pleitear vantagens regulatórias.',
    categoria: 'Gestão',
    custo: P.inventarioCusto, economiaAnual: 0,
    paybackMeses: null,
    reducaoTonnes: 0, impactoDQS: P.impactoDQSInventario,
    exposicao: 'habilita o selo verificável e o relatório de conformidade (SBCE)',
  };
  acoes.push(a2); dqsGanho += a2.impactoDQS;

  // ── AÇÃO 3: compensação DoubleDyn (sempre — receita direta) ──
  const tonnes = Math.max(1, Math.round(total));
  const custoCompensacao = tonnes * P.precoCreditoTon;
  const a3 = {
    id: 'a3_compensacao', tipo: 'compensacao',
    titulo: `Compense ${tonnes} tCO₂e com créditos certificados + NFT on-chain`,
    descricao: 'Neutralize 100% das emissões com créditos de carbono certificados (case Ingaí: 100 tCO₂e em NFT Polygon) e receba o selo DoubleDyn verificável publicamente — vantagem em licitações e compliance SBCE.',
    categoria: 'Compensação',
    custo: custoCompensacao, economiaAnual: 0,
    paybackMeses: null,
    reducaoTonnes: tonnes, impactoDQS: 300,
    exposicao: 'neutralização total — conformidade plena e ativo de reputação (licitações, clientes ESG)',
  };
  acoes.push(a3); dqsGanho += a3.impactoDQS;

  const dqsAtual = r.dqsScore || 0;
  const resumo = {
    totalCusto: acoes.reduce((s, a) => s + a.custo, 0),
    totalEconomiaAnual: acoes.reduce((s, a) => s + (a.economiaAnual || 0), 0),
    reducaoTotal: acoes.reduce((s, a) => s + a.reducaoTonnes, 0),
    dqsAtual,
    dqsPotencial: Math.min(1000, dqsAtual + dqsGanho),
    multaPotencial,
  };

  return { acoes, resumo, premissas: PREMISSAS };
}
