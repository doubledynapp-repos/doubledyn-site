// ===== Simulador de ROI (v1) — a feature principal pós-diagnóstico =====
// Deriva do Plano de Ação (actionPlan.js): o cliente ajusta o investimento
// por ação e vê o retorno (economia, payback, multa evitada, DQS final).
// Premissas: fatores auditados em factors.js; banda de incerteza ±40%
// (conservador 0.6× / médio 1.0× / otimista 1.4×) — estimativas rotuladas.
import { gerarPlanoDeAcao } from './actionPlan';

// pct por ação: 0 = nada, 1 = 100% do custo estimado, até 1.5 (over)
export function simularROI(result, investimentos) {
  const plano = gerarPlanoDeAcao(result);
  const acoes = plano.acoes;
  const multaPotencial = result.multaPotencial || 0;
  const totalEmissao = Math.max(result.totalEmissao || 0, 0.001);
  const dqsAtual = Math.round(result.dqsScore || 0);

  const itens = acoes.map((acao, i) => {
    const pct = Math.max(0, Math.min((investimentos?.[`a${i + 1}`] ?? 1), 1.5));
    const invest = acao.custo * pct;
    // Redução limitada a 100% da ação (investir mais não reduz mais)
    const reducao = acao.reducaoTonnes * Math.min(pct, 1);
    const economia = (acao.economiaAnual || 0) * pct;
    const impactoDQS = Math.round(acao.impactoDQS * pct);
    const multaEvitada = multaPotencial * (reducao / totalEmissao);
    const paybackMeses = economia > 0 ? (invest / economia) * 12 : null;
    return { ...acao, pct, invest, reducao, economia, impactoDQS, multaEvitada, paybackMeses };
  });

  const investTotal = itens.reduce((s, i) => s + i.invest, 0);
  const economiaTotal = itens.reduce((s, i) => s + i.economia, 0);
  const reducaoTotal = itens.reduce((s, i) => s + i.reducao, 0);
  const multaEvitadaTotal = itens.reduce((s, i) => s + i.multaEvitada, 0);
  const impactoDQSTotal = itens.reduce((s, i) => s + i.impactoDQS, 0);
  const dqsFinal = Math.min(1000, dqsAtual + impactoDQSTotal);
  const paybackMedio = economiaTotal > 0 && investTotal > 0
    ? (investTotal / economiaTotal) * 12
    : null;
  const retornoAnualPct = investTotal > 0 ? (economiaTotal / investTotal) * 100 : null;

  return {
    itens,
    investTotal,
    economiaTotal,
    reducaoTotal,
    multaEvitadaTotal,
    impactoDQSTotal,
    dqsAtual,
    dqsFinal,
    paybackMedio,
    retornoAnualPct,
    // Banda de incerteza (±40%) — estimativa rotulada
    cenarios: {
      conservador: economiaTotal * 0.6,
      medio: economiaTotal,
      otimista: economiaTotal * 1.4,
    },
  };
}
