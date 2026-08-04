'use client';
import { useState, useRef, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { STEP_SCHEMAS } from '../../lib/calcSchema';
import { calculateEmissions, formatBRL, CNAE_TO_SETOR, RISCO_SETOR, PORTE_MAP, computePartialEstimates } from '../../lib/carbonEngine';
import { computeBenchmark } from '../../lib/benchmark';
import { gerarPlanoDeAcao } from '../../lib/actionPlan';
import { track } from '../../lib/track';
import { equivalenciasDe } from '../../lib/equivalencias';
import { calculateEventEmissions, EVENTO_PRECOS } from '../../lib/eventEngine';
import Icon from '../Icon';
import Seal from '../Seal';

// Selo semântico por ação do plano (mapeado pelo id gerado no actionPlan)
const PLAN_SEAL = {
  energia: 'bolt', frota: 'car', agro: 'wheat', comercio: 'building',
  residuos: 'recycleLeaf', gestao: 'clipboard', compensacao: 'sprout', inventario: 'docLeaf',
};
function sealFor(a) {
  for (const [k, v] of Object.entries(PLAN_SEAL)) if (a.id.includes(k)) return v;
  return 'leaf';
}

const TOTAL_STEPS = 6;

// ── Número Animado (Live Meter) ──
function AnimatedNumber({ value, decimals = 1 }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(to);
      prev.current = value;
      return;
    }
    prev.current = value;
    if (Math.abs(from - to) < 0.001) { setDisplay(to); return; }
    const start = performance.now();
    const dur = 450;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{display.toFixed(decimals)}</>;
}

// ── Meter ao Vivo: impacto acumulado por etapa ──
function LiveMeter({ partial }) {
  const { totalBase, categorias, custoEstimado } = partial;
  return (
    <div className={`calc-live-meter${totalBase > 0 ? ' has-data' : ''}`}>
      <div className="meter-head">
        <span className="meter-label">SEU IMPACTO ATÉ AQUI</span>
        <span className="meter-live"><span className="meter-dot" />AO VIVO</span>
      </div>
      <div className="meter-main">
        <div className="meter-value">
          <AnimatedNumber value={totalBase} />
          <span className="meter-unit"> tCO₂e/ano</span>
        </div>
        <div className="meter-cost">
          {totalBase > 0
            ? <>≈ {formatBRL(custoEstimado)} de exposição anual</>
            : <>Preencha os dados para ver seu impacto crescer <Icon name="sparkle" size={14} inline /></>}
        </div>
        {totalBase > 0 && (() => {
          const eq = equivalenciasDe(totalBase);
          return (
            <div className="meter-equiv">
              {eq.slice(0, 2).map((e) => (
                <span key={e.id} className="meter-equiv-item"><Icon name={e.icon} size={13} inline />{e.texto}</span>
              ))}
            </div>
          );
        })()}
      </div>
      <div className="meter-bars">
        {categorias.map((c) => {
          const pct = totalBase > 0 ? Math.round((c.valor / totalBase) * 100) : 0;
          return (
            <div key={c.nome} className="meter-bar-row">
              <span className="meter-bar-label">{c.nome}</span>
              <div className="meter-bar-track">
                <div className="meter-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="meter-bar-val">{c.valor.toFixed(1)} t</span>
            </div>
          );
        })}
      </div>
      <div className="meter-note">+15% de margem de segurança entra no relatório final</div>
    </div>
  );
}

// ── Benchmark Setorial: você vs. a média do seu setor ──
const BENCH_COLORS = {
  acima: { color: '#e67e22', bg: 'rgba(230,126,34,0.12)', label: 'ACIMA DA MÉDIA' },
  na_media: { color: '#f1c40f', bg: 'rgba(241,196,15,0.10)', label: 'NA MÉDIA DO SETOR' },
  abaixo: { color: '#2ecc71', bg: 'rgba(46,204,113,0.12)', label: 'ABAIXO DA MÉDIA' },
};

function BenchmarkCard({ result }) {
  const bench = useMemo(() => computeBenchmark({
    emissionsTotal: result?.totalEmissao || 0,
    revenueMillions: result?.faturamento > 0 ? result.faturamento / 1e6 : 0,
    sector: result?.setor || 'outro',
  }), [result]);

  if (!bench.ok) {
    return (
      <div className="bench-card">
        <div className="bench-head">
          <span className="bench-title"><Icon name="scale" size={16} inline />Você vs. seu Setor</span>
        </div>
        <p className="bench-fallback">{bench.message}</p>
      </div>
    );
  }

  const style = BENCH_COLORS[bench.status] || BENCH_COLORS.na_media;
  const maxIntensity = Math.max(bench.intensity, bench.benchmark) * 1.15;
  const yourPct = Math.min(100, (bench.intensity / maxIntensity) * 100);
  const avgPct = Math.min(100, (bench.benchmark / maxIntensity) * 100);

  return (
    <div className="bench-card">
      <div className="bench-head">
        <span className="bench-title"><Icon name="scale" size={16} inline />Você vs. seu Setor</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={`origin-chip ${result.estimadoPorCNAE ? 'estimate' : 'informed'}`}>
            {result.estimadoPorCNAE ? <><Icon name="sparkle" size={13} inline />ESTIMATIVA CNAE</> : <><Icon name="chart" size={13} inline />DADOS INFORMADOS</>}
          </span>
          <span className="bench-pill" style={{ color: style.color, background: style.bg }}>{style.label}</span>
        </div>
      </div>

      <div className="bench-main">
        <div className="bench-rank">
          <div className="bench-rank-value">Percentil {bench.rank}</div>
          <div className="bench-rank-desc">
            {bench.status === 'abaixo'
              ? `entre os ${100 - bench.rank}% mais eficientes`
              : `${bench.pctBetter}% das empresas do setor emitem menos que você`}
          </div>
        </div>
        <div className="bench-bars">
          <div className="bench-bar-row">
            <span className="bench-bar-label">Sua empresa</span>
            <div className="bench-bar-track">
              <div className="bench-bar-fill yours" style={{ width: `${yourPct}%` }} />
            </div>
            <span className="bench-bar-val">{bench.intensity.toFixed(1)} t/R$mi</span>
          </div>
          <div className="bench-bar-row">
            <span className="bench-bar-label">Média do setor</span>
            <div className="bench-bar-track">
              <div className="bench-bar-fill avg" style={{ width: `${avgPct}%` }} />
            </div>
            <span className="bench-bar-val">{bench.benchmark} t/R$mi</span>
          </div>
        </div>
      </div>

      <p className="bench-message">{bench.message}</p>
      <div className="bench-opportunity">
        <span className="bench-opp-label"><Icon name="bulb" size={14} inline />OPORTUNIDADE</span>
        <span>{bench.opportunity}</span>
      </div>
      <p className="bench-note">
        Comparação com a média nacional do setor (SEEG / GHG Protocol Brasil). Metodologia detalhada na{' '}
        <a href="/metodologia" style={{ color: 'var(--accent)', fontWeight: 700 }}>Nota Metodológica</a>.
      </p>
    </div>
  );
}

// ── Plano de Ação: 3 passos pós-diagnóstico (o produto que fecha a venda) ──
const TIPO_BADGE = {
  eficiencia: { label: 'REDUÇÃO', color: '#2ecc71', bg: 'rgba(46,204,113,0.12)' },
  gestao: { label: 'GESTÃO', color: '#3498db', bg: 'rgba(52,152,219,0.12)' },
  compensacao: { label: 'COMPENSAÇÃO', color: '#c3ff00', bg: 'rgba(195,255,0,0.10)' },
};

function ActionPlanCard({ result }) {
  const plano = useMemo(() => gerarPlanoDeAcao(result), [result]);

  const handleCriarConta = () => {
    track('cta_criar_conta', { total: Math.round(result.totalEmissao || 0), setor: result.setor });
    try {
      // Guarda o diagnóstico COMPLETO (categorias, maior emissor, multa potencial...)
      // para o dashboard: card de continuidade + simulador de ROI (extra pago)
      localStorage.setItem('doubledyn_calc', JSON.stringify({
        ...result,
        emailContato: result.emailContato || '',
      }));
    } catch (e) { /* localStorage indisponível — segue sem pré-preencher */ }
    window.location.href = '/register';
  };

  return (
    <div className="plan-card">
      <div className="plan-head">
        <span className="plan-title"><Icon name="target" size={18} inline />Seu Plano de Ação — 3 passos</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <span className={`origin-chip ${result.estimadoPorCNAE ? 'estimate' : 'informed'}`}>
            {result.estimadoPorCNAE ? <><Icon name="sparkle" size={13} inline />BASE: ESTIMATIVA POR CNAE</> : <><Icon name="chart" size={13} inline />BASE: DADOS INFORMADOS</>}
          </span>
          <span className="plan-sub">Custos são estimativas de mercado</span>
        </div>
      </div>

      <div className="plan-actions">
        {plano.acoes.map((a, i) => {
          const badge = TIPO_BADGE[a.tipo] || TIPO_BADGE.gestao;
          return (
            <div key={a.id} className="plan-action">
              <div className="plan-action-head">
                <Seal icon={sealFor(a)} size={42} />
                <div className="plan-action-title-wrap">
                  <div className="plan-action-title">{a.titulo}</div>
                  <span className="plan-badge" style={{ color: badge.color, background: badge.bg }}>{badge.label}</span>
                </div>
              </div>
              <p className="plan-action-desc">{a.descricao}</p>
              <div className="plan-action-metrics">
                <span className="plan-metric"><b>{formatBRL(a.custo)}</b> custo</span>
                {a.economiaAnual !== null && a.economiaAnual > 0 && (
                  <span className="plan-metric"><b>{formatBRL(a.economiaAnual)}/ano</b> economia</span>
                )}
                {a.paybackMeses !== null && (
                  <span className="plan-metric"><b>{a.paybackMeses === 0 ? 'imediato' : `${a.paybackMeses} meses`}</b> payback</span>
                )}
                {a.reducaoTonnes > 0 && (
                  <span className="plan-metric"><b>−{a.reducaoTonnes} t</b> CO₂e/ano</span>
                )}
                <span className="plan-metric"><b>DQS +{a.impactoDQS}</b></span>
              </div>
              <p className="plan-action-note"><Icon name="briefcase" size={14} inline />{a.exposicao}{a.nota ? ` · ${a.nota}` : ''}</p>
            </div>
          );
        })}
      </div>

      <div className="plan-resumo">
        <span><b>{formatBRL(plano.resumo.totalCusto)}</b> investimento total estimado</span>
        <span><b>−{Math.round(plano.resumo.reducaoTotal)} t</b> CO₂e/ano reduzidos</span>
        <span>DQS: <b>{plano.resumo.dqsAtual} → {plano.resumo.dqsPotencial}</b></span>
      </div>

      <div className="plan-cta">
        <button className="btn btn-primary" onClick={handleCriarConta} style={{ flex: 1, justifyContent: 'center', padding: '18px', fontSize: '1rem' }}>
          Criar conta grátis para salvar seu plano e liberar o simulador de ROI →
        </button>
      </div>
      <p style={{ margin: '10px 0 0', fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
        <Icon name="alert" size={16} inline /> Seu diagnóstico <b>não fica salvo</b> — fechar esta página apaga este resultado. Crie a conta para guardar tudo.
      </p>
      <p className="plan-note">
        Valores são estimativas de mercado (premissas documentadas). O simulador de ROI com seus dados reais é liberado após o cadastro. Metodologia na{' '}
        <a href="/metodologia" style={{ color: 'var(--accent)', fontWeight: 700 }}>Nota Metodológica</a>.
      </p>
    </div>
  );
}

// ── Tooltip Helper ──
function Tooltip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span className={`tooltip-trigger${open ? ' tooltip-active' : ''}`} onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}>
      ?<span className="tooltip-content">{text}</span>
    </span>
  );
}

// ── Resultado Bento Box ──
function CalcResult({ result, onRecalc }) {
  const [preReportVisible, setPreReportVisible] = useState(false);
  const [waLoading, setWaLoading] = useState(false);

  const waURL = `https://wa.me/5511924526590?text=${encodeURIComponent(result.waMsg)}`;

  const handlePreReport = () => {
    setPreReportVisible(true);
    const emailContato = result.emailContato;
    if (emailContato) {
      const reportData = new FormData();
      reportData.append('_subject', `🌿 Pré-Relatório DoubleDyn - ${result.empresa}`);
      reportData.append('_template', 'table');
      reportData.append('_captcha', 'false');
      reportData.append('_replyto', emailContato);
      reportData.append('01_EMPRESA', result.empresa);
      reportData.append('02_EMISSAO_TOTAL', result.totalEmissao.toFixed(1) + ' tCO2e/ano');
      reportData.append('03_RISCO', result.risco);
      fetch('https://formsubmit.co/ajax/DoubleDynaapp@gmail.com', { method: 'POST', body: reportData })
        .catch(err => console.warn('[DoubleDyn] Erro email pre-report:', err));
    }
  };

  const now = new Date();
  const dataRelatorio = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="calc-result" id="calcResult">
      {result.estimadoPorCNAE && (
        <div className="result-estimate-banner">
          <Icon name="alert" size={16} inline /> <b>Estimativa automática pelo setor (CNAE)</b> — você não informou dados de consumo, então calculamos pela média do seu setor × faturamento. Informe seus dados reais para refinar o diagnóstico.
        </div>
      )}

      {/* HERO DE ANCORAGEM — persuasão: exposição em R$ + urgência SBCE */}
      <div className="result-hero">
        <div className="result-hero-id">
          <Seal icon="medal" tone="gold" size={64} label={`DQS ${result.dqsScore}`} />
          <div>
            <div className="result-hero-title"><Icon name="target" size={22} inline />Seu Diagnóstico Ambiental</div>
            <div className="result-hero-sub">
              {result.empresa} · {result.totalEmissao.toFixed(1)} tCO₂e/ano · {result.pcrSeal}
            </div>
          </div>
        </div>
        <div className="result-hero-anchor">
          <div className="result-hero-value">
            {result.faturamento > 0 ? formatBRL(result.multaPotencial) : 'até 3% do faturamento'}
          </div>
          <div className="result-hero-label">de exposição regulatória estimada (Lei 15.042/2024 · SBCE)</div>
          <div className="result-hero-urgency">A regulamentação está em implementação — quem se antecipa reduz risco e custo.</div>
        </div>
      </div>

      {/* Equivalências ilustrativas — dimensão humana do número */}
      <div className="result-equiv">
        <span className="result-equiv-label"><Icon name="sparkle" size={12} inline />EQUIVALÊNCIAS ILUSTRATIVAS</span>
        <div className="result-equiv-grid">
          {equivalenciasDe(result.totalEmissao).map((e) => (
            <span key={e.id} className="result-equiv-chip"><Icon name={e.icon} size={14} inline />{e.texto}</span>
          ))}
        </div>
        <span className="result-equiv-note">estimativas médias ilustrativas — não são cotação técnica</span>
      </div>

      {/* PLANO DE AÇÃO — o produto primeiro */}
      <ActionPlanCard result={result} />

      {/* BENCHMARK SETORIAL */}
      <BenchmarkCard result={result} />

      {/* CTAs secundários — o diagnóstico completo fica no dashboard (produto pago) */}
      <div className="result-ctas">
        <button
          className="btn btn-secondary"
          onClick={handlePreReport}
          disabled={preReportVisible}
          style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: '0.9rem' }}
        >
          {preReportVisible ? <><Icon name="checkCircle" size={16} inline />Pré-Relatório Gerado!</> : <><Icon name="mail" size={16} inline />Receber pré-relatório por e-mail</>}
        </button>
        <a className="btn btn-secondary" href={waURL} target="_blank" rel="noopener noreferrer" style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: '0.9rem' }}>
          <Icon name="chat" size={16} inline />Dúvidas? Fale no WhatsApp
        </a>
        <button className="btn btn-secondary" onClick={onRecalc} style={{ flex: '0 0 auto', padding: '12px', fontSize: '0.9rem' }}>
          ↺ Recalcular
        </button>
      </div>

      {/* PRÉ-RELATÓRIO */}
      {preReportVisible && (
        <div className="pre-report-section" id="preReportSection">
          <div className="pre-report-header">
            <div className="pre-report-logo">
              <img src="/assets/logo-icon.png" alt="DoubleDyn" style={{ width: '32px', height: '32px' }} />
              <span>DoubleDyn Ecotoken</span>
            </div>
            <div className="pre-report-badge">PRÉ-RELATÓRIO ESG</div>
          </div>
          <div className="pre-report-title-row">
            <h3>Diagnóstico Ambiental</h3>
            <p><strong>{result.empresa}</strong> — <span>{dataRelatorio}</span></p>
          </div>
          <div className="pre-report-grid">
            <div className="pre-report-metric">
              <span className="pre-report-metric-label">Emissão Total Estimada</span>
              <span className="pre-report-metric-value">{result.totalEmissao.toFixed(1)} tCO₂e/ano</span>
            </div>
            <div className="pre-report-metric">
              <span className="pre-report-metric-label">Risco Regulatório</span>
              <span className="pre-report-metric-value">{result.risco}</span>
            </div>
            <div className="pre-report-metric">
              <span className="pre-report-metric-label">Índice de Desperdício</span>
              <span className="pre-report-metric-value">{result.indiceDesperdicio.toFixed(1)}/10 ({result.classDesperdicio})</span>
            </div>
            <div className="pre-report-metric">
              <span className="pre-report-metric-label">Impacto Equivalente</span>
              <span className="pre-report-metric-value">{result.arvoresPreservadas} árvores</span>
            </div>
          </div>
          <p className="pre-report-desc">{result.descDesperdicio}</p>
          <div className="pre-report-breakdown">
            <h4>Breakdown por Categoria</h4>
            <div className="pre-report-breakdown-grid">
              <div className="pre-report-breakdown-item">
                <span className="pre-report-breakdown-label"><Icon name="bolt" size={14} inline />Energia</span>
                <span className="pre-report-breakdown-value">{result.emissaoEnergia.toFixed(1)} t</span>
              </div>
              <div className="pre-report-breakdown-item">
                <span className="pre-report-breakdown-label"><Icon name="car" size={14} inline />Transporte</span>
                <span className="pre-report-breakdown-value">{result.emissaoTransporte.toFixed(1)} t</span>
              </div>
              <div className="pre-report-breakdown-item">
                <span className="pre-report-breakdown-label"><Icon name="building" size={14} inline />Instalações</span>
                <span className="pre-report-breakdown-value">{result.emissaoInstalacoes.toFixed(1)} t</span>
              </div>
              <div className="pre-report-breakdown-item">
                <span className="pre-report-breakdown-label"><Icon name="recycleLeaf" size={14} inline />Resíduos</span>
                <span className="pre-report-breakdown-value">{result.emissaoResiduos.toFixed(1)} t</span>
              </div>
              <div className="pre-report-breakdown-item">
                <span className="pre-report-breakdown-label"><Icon name="wheat" size={14} inline />Atividade</span>
                <span className="pre-report-breakdown-value">{result.emissaoSetor.toFixed(1)} t</span>
              </div>
            </div>
          </div>
          <div className="pre-report-insight">
            <h4><Icon name="bulb" size={17} inline />Sua Maior Oportunidade de Redução</h4>
            <p>{result.maiorCategoria.insight}</p>
          </div>
          <div className="pre-report-costs">
            <div className="pre-report-cost-item">
              <span>Custo Mercado Tradicional</span>
              <span className="pre-report-cost-value cost-bad">{formatBRL(result.custoTradicional)}</span>
            </div>
            <div className="pre-report-cost-item">
              <span>Projeção 5 Anos (inação)</span>
              <span className="pre-report-cost-value cost-bad">{formatBRL(result.custoTotal5Anos)}</span>
            </div>
            <div className="pre-report-cost-item highlight">
              <span>Pacote DoubleDyn</span>
              <span className="pre-report-cost-value cost-good">Até 70% de economia</span>
            </div>
          </div>
          <div className="pre-report-footer">
            <p><Icon name="lock" size={15} inline />Este pré-relatório foi enviado para o e-mail informado. Para o relatório completo, o simulador de ROI e seu selo, <a href="/register" style={{ color: 'var(--accent)', fontWeight: 700 }}>crie sua conta grátis →</a></p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CALCULADORA PRINCIPAL ──
export default function Calculator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [result, setResult] = useState(null);
  // ── Modo Evento (Evento Neutro) ──
  const [modo, setModo] = useState('empresa');
  const [eventResult, setEventResult] = useState(null);
  const [eventoNome, setEventoNome] = useState('');
  const [participantes, setParticipantes] = useState('');
  const [kmMedio, setKmMedio] = useState('');
  const [energiaKwh, setEnergiaKwh] = useState('');
  const [residuosKg, setResiduosKg] = useState('');
  const [cnpjData, setCnpjData] = useState(null);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjHint, setCnpjHint] = useState({ msg: '', type: '' });
  const [showCBAMField, setShowCBAMField] = useState(false);
  const [faturamentoDisplay, setFaturamentoDisplay] = useState('');
  // Atalho "não sei": pula os passos de consumo e estima pelo setor (CNAE)
  const [skipConsumo, setSkipConsumo] = useState(false);

  const SAVED_KEY = 'doubledyn_calc_progress';

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(STEP_SCHEMAS[currentStep - 1]),
    mode: 'onTouched',
  });

  // ── Meter ao Vivo: recalcula a cada resposta (matemática pura, <1ms) ──
  const watchValues = watch();
  const partial = useMemo(() => computePartialEstimates(watchValues), [watchValues]);

  // ── Auto-save: recarregou a página = continua de onde parou ──
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify({ values: watchValues, step: currentStep }));
    } catch (e) { /* localStorage indisponível */ }
  }, [watchValues, currentStep]);

  // ── Restaura o progresso salvo (apenas na primeira carga) ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved || !saved.values) return;
      Object.entries(saved.values).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          setValue(k, v);
          if (k === 'faturamento') setFaturamentoDisplay(v);
        }
      });
      const savedStep = Number(saved.step);
      if (savedStep >= 1 && savedStep <= TOTAL_STEPS) setCurrentStep(savedStep);
    } catch (e) { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Navegação de Steps ──
  const goToStep = (n) => {
    setCurrentStep(n);
    track('calc_step', { step: n });
    document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleNext = async () => {
    const valid = await trigger();
    if (valid && currentStep < TOTAL_STEPS) goToStep(currentStep + 1);
  };

  // Permite avançar sem preencher a etapa atual. A validação continua
  // normalmente no botão Próximo e na etapa final do cálculo.
  const handleSkip = () => {
    if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  };

  const handleStepClick = (step) => {
    // Navegação livre entre os 6 passos (clique nos números).
    // Coerente com o "Pular": a validação acontece no submit final, não na navegação.
    goToStep(step);
  };

  const handleRecalc = () => {
    setResult(null);
    setCurrentStep(1);
  };

  // ── Busca CNPJ ──
  const handleCNPJInput = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 14) v = v.slice(0, 14);
    if (v.length > 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
    else if (v.length > 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4');
    else if (v.length > 5) v = v.replace(/^(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d{1,3})/, '$1.$2');
    setValue('cnpj', v);
    const digits = v.replace(/\D/g, '');
    if (digits.length === 14) buscarCNPJ(digits);
  };

  const buscarCNPJ = async (cnpj) => {
    setCnpjLoading(true);
    setCnpjData(null);
    setCnpjHint({ msg: '', type: '' });
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (!res.ok) throw new Error(res.status === 404 ? 'CNPJ não encontrado' : 'Erro na consulta');
      const d = await res.json();

      const nomeEmpresa = d.nome_fantasia || d.razao_social;
      setValue('empresa', nomeEmpresa);
      const cidade = d.municipio ? `${d.municipio}${d.uf ? ' - ' + d.uf : ''}` : '';
      if (cidade) setValue('cidade', cidade);

      const cnaeCod = String(d.cnae_fiscal || '').slice(0, 2);
      const setorMapeado = CNAE_TO_SETOR[cnaeCod] || 'outro';
      setValue('setor', setorMapeado);

      const statusOk = d.situacao_cadastral === 'ATIVA' || d.descricao_situacao_cadastral === 'ATIVA';
      const risco = RISCO_SETOR[setorMapeado] || RISCO_SETOR.outro;

      setCnpjData({ d, statusOk, nomeEmpresa, cidade, cnaeCod, setorMapeado, risco });
    } catch (err) {
      setCnpjHint({ msg: err.message || 'Erro ao buscar CNPJ. Preencha manualmente.', type: 'error' });
    } finally {
      setCnpjLoading(false);
    }
  };

  // ── Máscara Faturamento ──
  const handleFaturamentoInput = (e) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw === '') { setFaturamentoDisplay(''); setValue('faturamento', ''); return; }
    if (raw.length > 15) raw = raw.slice(0, 15);
    const cents = parseInt(raw, 10);
    const formatted = (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
    setFaturamentoDisplay(formatted);
    setValue('faturamento', formatted);
  };

  // ── Submit Final ──
  const onSubmit = (data) => {
    if (modo === 'evento') {
      const ev = calculateEventEmissions({ participantes, kmMedio, energiaKwh, residuosKg });
      setEventResult(ev);
      track('evento_calculado', { total: Math.round(ev.totalEmissao), participantes: ev.participantes });
      return;
    }
    const allData = getValues();
    const fullData = { ...allData, ...data, faturamento: faturamentoDisplay };

    // Sem dados de consumo? Nunca bloqueamos: estima pelas médias do setor (CNAE).
    const hasConsumption =
      parseFloat(fullData.eletricidade) > 0 ||
      parseFloat(fullData.gasolinaLitros) > 0 ||
      parseFloat(fullData.dieselLitros) > 0 ||
      parseFloat(fullData.aguaM3) > 0 ||
      parseFloat(fullData.residuos) > 0;

    const calc = calculateEmissions(fullData, { estimarSeVazio: !hasConsumption || skipConsumo });
    setResult(calc);
    // Fim da jornada: limpa o progresso salvo e registra a conversão
    try { localStorage.removeItem(SAVED_KEY); } catch (e) { /* ignore */ }
    track('calc_completed', { total: Math.round(calc.totalEmissao), setor: calc.setor, estimado: Boolean(calc.estimadoPorCNAE) });

    // Enviar lead para o backend
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_name: calc.empresa,
        email: calc.emailContato || `lead@${calc.empresa.replace(/\s/g, '')}.com`,
        phone: calc.telefone || '',
        emissions: Math.round(calc.totalEmissao),
        estimated_cost: Math.round(calc.custoTradicional),
        dqs_score: calc.dqsScore,
        pcr_seal: calc.pcrSeal,
      }),
    }).catch(err => console.warn('[DoubleDyn] Erro backend:', err));

    // Enviar lead por email (Formsubmit)
    const leadData = new FormData();
    leadData.append('_subject', `🌿 LEAD Calculadora - ${calc.empresa}`);
    leadData.append('_template', 'table');
    leadData.append('_captcha', 'false');
    leadData.append('01_EMPRESA', calc.empresa);
    leadData.append('02_EMAIL', calc.emailContato);
    leadData.append('03_EMISSAO_TOTAL', calc.totalEmissao.toFixed(1) + ' tCO2e/ano');
    leadData.append('04_RISCO', calc.risco);
    leadData.append('05_DQS_SCORE', calc.dqsScore + '/1000 (' + calc.pcrSeal + ')');
    fetch('https://formsubmit.co/ajax/DoubleDynaapp@gmail.com', { method: 'POST', body: leadData })
      .catch(err => console.warn('[DoubleDyn] Erro email lead:', err));
  };

  const stepNames = ['Empresa', 'Energia', 'Frota', 'Instalações', 'Resíduos', 'Contato'];

  if (result) {
    return (
      <section className="section section-calc" id="calculadora">
        <div className="container">
          <div className="section-label">Resultado</div>
          <h2 className="section-title">Diagnóstico <span className="text-accent">Ambiental</span></h2>
          <CalcResult result={result} onRecalc={handleRecalc} />
        </div>
      </section>
    );
  }

  if (modo === 'evento' && eventResult) {
    return (
      <section className="section section-calc" id="calculadora">
        <div className="container">
          <div className="section-label">Evento Neutro</div>
          <h2 className="section-title">Seu evento, <span className="text-accent">carbono neutro</span></h2>
          <div className="event-certificate">
            <div className="event-cert-head">
              <Seal name="tree" size={64} tone="gold" />
              <div>
                <div className="event-cert-title">Certificado de Evento Neutro</div>
                <div className="event-cert-name">{eventoNome || 'Evento'}</div>
                <div className="event-cert-sub">Estimativa de emissões · compensação com rastreabilidade on-chain</div>
              </div>
            </div>
            <div className="event-cert-grid">
              <div className="event-cert-stat"><span className="event-cert-num">{eventResult.totalEmissao.toLocaleString('pt-BR')}</span><span className="event-cert-lbl">tCO₂e estimadas</span></div>
              <div className="event-cert-stat"><span className="event-cert-num">{eventResult.participantes.toLocaleString('pt-BR')}</span><span className="event-cert-lbl">participantes</span></div>
              <div className="event-cert-stat"><span className="event-cert-num">{formatBRL(eventResult.valorTotal)}</span><span className="event-cert-lbl">valor do pacote</span></div>
            </div>
            <div className="event-cert-breakdown">
              <div><Icon name="car" size={13} inline /> Deslocamento: {eventResult.transporte.toFixed(2)} t</div>
              <div><Icon name="bolt" size={13} inline /> Energia do local: {eventResult.energia.toFixed(2)} t</div>
              <div><Icon name="leaf" size={13} inline /> Resíduos: {eventResult.residuos.toFixed(2)} t</div>
            </div>
            <div className="event-cert-price">
              <span className="event-cert-price-lbl">Como é calculado</span>
              <span>Base {formatBRL(EVENTO_PRECOS.base)} (até {EVENTO_PRECOS.limiteBase} t) {eventResult.valorPorTonelada > 0 && <>+ {formatBRL(eventResult.valorPorTonelada)}/t excedente</>}</span>
            </div>
            <p className="event-cert-note">Estimativa ilustrativa com premissas documentadas — o certificado final é emitido após a compensação executada on-chain (caso Ingaí: 100 tCO₂e · 4 NFTs · Polygon).</p>
            <div className="event-cert-ctas">
              <a href="/register" className="btn btn-primary" onClick={() => track('cta_evento_contratar')}>Quero meu evento neutro →</a>
              <button type="button" className="btn btn-secondary" onClick={() => { setEventResult(null); }}>Recalcular</button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section section-calc" id="calculadora">
      <div className="container">
        <div className="section-label">Calculadora Gratuita</div>
        <h2 className="section-title">Calcule o <span className="text-accent">impacto ambiental</span> da sua empresa</h2>
        <p className="section-subtitle">Preencha os dados abaixo e receba um relatório personalizado com oportunidades de economia.</p>

        <div className="calc-wrapper">
          {/* Toggle Empresa / Evento */}
          <div className="calc-modo-toggle" role="tablist">
            <button type="button" role="tab" aria-selected={modo === 'empresa'} className={`calc-modo-btn${modo === 'empresa' ? ' active' : ''}`} onClick={() => { setModo('empresa'); setResult(null); setEventResult(null); }}><Icon name="building" size={15} inline /> Empresa</button>
            <button type="button" role="tab" aria-selected={modo === 'evento'} className={`calc-modo-btn${modo === 'evento' ? ' active' : ''}`} onClick={() => { setModo('evento'); setResult(null); setEventResult(null); }}><Icon name="sparkle" size={15} inline /> Evento Neutro</button>
          </div>

          {/* Meter ao Vivo — impacto acumulado por etapa */}
          <LiveMeter partial={partial} />

          {/* Progress Bar */}
          {modo === 'empresa' && (
          <div className="calc-progress">
            <div className="progress-bar" style={{ '--progress': `${(currentStep / TOTAL_STEPS) * 100}%` }}></div>
            <div className="progress-steps">
              {stepNames.map((name, i) => {
                const step = i + 1;
                return (
                  <div
                    key={name}
                    className={`progress-step${step === currentStep ? ' active' : step < currentStep ? ' done' : ''}`}
                    data-step={step}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleStepClick(step)}
                    title={`Ir para o passo ${step}: ${name}`}
                  >
                    <span>{step}</span> {name}
                  </div>
                );
              })}
            </div>
          </div>
          )}

          <form id="calcForm" className="calc-form" onSubmit={handleSubmit(onSubmit)}>

            {modo === 'empresa' && (
            <>
            {/* ── STEP 1: EMPRESA ── */}
            <div className={`calc-step${currentStep === 1 ? ' active' : ''}`} data-step="1">
              <h3 className="step-title">Dados da Empresa</h3>
              <p className="step-desc">Digite o CNPJ para preenchimento automático ou preencha manualmente.</p>
              <div className="form-group full-width" style={{ marginBottom: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                  onClick={() => { setSkipConsumo(true); goToStep(6); }}
                >
                  <Icon name="bolt" size={16} inline /> Não tenho os dados de consumo — estimar pelo meu setor
                </button>
                <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                  Estimamos suas emissões pela média do setor (CNAE) × faturamento. Você pode refinar depois com dados reais.
                </p>
              </div>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="cnpj">CNPJ <Tooltip text="Digite os 14 dígitos do CNPJ. Usamos para pré-preencher dados automaticamente." /></label>
                  <div className="cnpj-input-wrapper">
                    <input type="text" id="cnpj" {...register('cnpj')} placeholder="00.000.000/0001-00" maxLength="18" autoComplete="off" onChange={handleCNPJInput} />
                    <button type="button" id="btnBuscarCNPJ" className="btn-cnpj-search" title="Buscar dados" onClick={() => { const v = getValues('cnpj') || ''; const digits = v.replace(/\D/g, ''); if (digits.length === 14) buscarCNPJ(digits); else setCnpjHint({ msg: 'Digite os 14 dígitos do CNPJ', type: 'warn' }); }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </button>
                    {cnpjLoading && (
                      <div className="cnpj-loading" style={{ display: 'flex' }}>
                        <div className="cnpj-spinner"></div>
                        <span>Buscando dados...</span>
                      </div>
                    )}
                  </div>
                  {cnpjHint.msg && <div className={`cnpj-hint cnpj-hint-${cnpjHint.type}`}>{cnpjHint.msg}</div>}
                </div>

                {cnpjData && (
                  <div className="form-group full-width">
                    <div className="raiox-card" id="raioxCard">
                      <div className="raiox-header">
                        <div className="raiox-title-row">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                          <h4>Raio-X Empresarial</h4>
                        </div>
                        <span className="raiox-status">
                          {cnpjData.statusOk
                            ? <span className="status-ativa">ATIVA</span>
                            : <span className="status-inativa">{cnpjData.d.descricao_situacao_cadastral}</span>
                          }
                        </span>
                      </div>
                      <div className="raiox-body">
                        <div className="raiox-company">
                          <div className="raiox-company-name">{cnpjData.d.razao_social}</div>
                          {cnpjData.d.nome_fantasia && <div className="raiox-company-fantasy">{cnpjData.d.nome_fantasia}</div>}
                        </div>
                        <div className="raiox-grid">
                          <div className="raiox-item"><span className="raiox-label">Setor (CNAE)</span><span className="raiox-value">{cnpjData.d.cnae_fiscal_descricao || 'Não informado'}</span></div>
                          <div className="raiox-item"><span className="raiox-label">Localização</span><span className="raiox-value">{cnpjData.cidade || 'Não informado'}</span></div>
                          <div className="raiox-item"><span className="raiox-label">Porte</span><span className="raiox-value">{PORTE_MAP[cnpjData.d.porte] || cnpjData.d.porte || 'Não informado'}</span></div>
                          <div className="raiox-item">
                            <span className="raiox-label">Operando desde</span>
                            <span className="raiox-value">
                              {cnpjData.d.data_inicio_atividade
                                ? `${cnpjData.d.data_inicio_atividade.slice(0, 4)} (${new Date().getFullYear() - parseInt(cnpjData.d.data_inicio_atividade.slice(0, 4))} anos)`
                                : 'Não informado'}
                            </span>
                          </div>
                        </div>
                        <div className="raiox-alert">
                          <span>Risco regulatório <strong style={{ color: cnpjData.risco.nivel === 'ALTO' ? '#e74c3c' : cnpjData.risco.nivel === 'MODERADO' ? '#f39c12' : '#2ecc71' }}>{cnpjData.risco.nivel}</strong> — {cnpjData.risco.msg}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="empresa">Nome da Empresa <Tooltip text="Razão social ou nome fantasia da empresa." /></label>
                  <input type="text" id="empresa" {...register('empresa')} placeholder="Nome da empresa" />
                  {errors.empresa && <span className="field-error-msg">{errors.empresa.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="cidade">Cidade / Estado <Tooltip text="Cidade onde a empresa está sediada." /></label>
                  <input type="text" id="cidade" {...register('cidade')} placeholder="Ex: São Paulo - SP" />
                </div>
                <div className="form-group">
                  <label htmlFor="setor">Setor de Atuação <Tooltip text="Segmento principal da empresa. Determina o fator de emissão setorial." /></label>
                  <select id="setor" {...register('setor')}>
                    <option value="">Selecione o setor...</option>
                    <option value="industria">Indústria / Manufatura</option>
                    <option value="comercio">Comércio / Varejo</option>
                    <option value="servicos">Serviços</option>
                    <option value="agro">Agronegócio</option>
                    <option value="construcao">Construção Civil</option>
                    <option value="logistica">Logística / Transporte</option>
                    <option value="tecnologia">Tecnologia / TI</option>
                    <option value="saude">Saúde / Hospitalar</option>
                    <option value="alimenticio">Alimentício / Bebidas</option>
                    <option value="mineracao">Mineração / Extração</option>
                    <option value="educacao">Educação</option>
                    <option value="outro">Outro</option>
                  </select>
                  {errors.setor && <span className="field-error-msg">{errors.setor.message}</span>}
                </div>
                {/* ── MÓDULO SETORIAL v1: campos específicos do setor ── */}
                {watchValues.setor === 'agro' && (
                  <div className="form-group full-width">
                    <label className="form-section-label"><Icon name="wheat" size={15} inline />Atividade Agropecuária (Escopo 1 agrícola)</label>
                  </div>
                )}
                {watchValues.setor === 'agro' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="rebanhoBovino">Rebanho bovino (cabeças) <Tooltip text="Número de cabeças de gado de corte/leite. Fermentação entérica (metano) — IPCC Tier 1." /></label>
                      <input type="number" id="rebanhoBovino" {...register('rebanhoBovino')} placeholder="Ex: 200" min="0" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="fertilizanteKg">Fertilizantes nitrogenados (kg N/ano) <Tooltip text="Quilos de nitrogênio aplicados por ano. Emissões de N₂O — IPCC Tier 1." /></label>
                      <input type="number" id="fertilizanteKg" {...register('fertilizanteKg')} placeholder="Ex: 5000" min="0" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="queimaResiduosT">Queima de resíduos agrícolas (t/ano) <Tooltip text="Toneladas de palha/resíduos queimados em campo por ano (CH₄ + N₂O)." /></label>
                      <input type="number" id="queimaResiduosT" {...register('queimaResiduosT')} placeholder="Ex: 10" min="0" />
                    </div>
                  </>
                )}
                {watchValues.setor === 'comercio' && (
                  <div className="form-group">
                    <label htmlFor="lojasRefrigeracao">Unidades de refrigeração comercial (gôndolas/câmaras) <Tooltip text="Número de equipamentos de refrigeração com gases refrigerantes — emissões de fugas." /></label>
                    <input type="number" id="lojasRefrigeracao" {...register('lojasRefrigeracao')} placeholder="Ex: 5" min="0" />
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="funcionarios">Número de Funcionários <Tooltip text="Total de colaboradores ativos (CLT + PJ + temporários)." /></label>
                  <input type="number" id="funcionarios" {...register('funcionarios')} placeholder="Ex: 150" min="1" />
                  {errors.funcionarios && <span className="field-error-msg">{errors.funcionarios.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="faturamento">Faturamento Anual (opcional) <Tooltip text="Faturamento bruto anual. Usado para calcular o passivo de multa potencial." /></label>
                  <input type="text" id="faturamento" value={faturamentoDisplay} onChange={handleFaturamentoInput} placeholder="R$ 0,00" />
                </div>
                <div className="form-group">
                  <label htmlFor="areaM2">Área Total (m²) <Tooltip text="Área total das instalações em metros quadrados." /></label>
                  <input type="number" id="areaM2" {...register('areaM2')} placeholder="Ex: 2000" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="exportaUE">Exporta para a União Europeia? <Tooltip text="Empresas que exportam para a UE podem ser afetadas pelo CBAM (taxa de carbono europeia)." /></label>
                  <select id="exportaUE" {...register('exportaUE')} onChange={(e) => setShowCBAMField(e.target.value === 'sim')}>
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>
                {showCBAMField && (
                  <div className="form-group" id="setorCBAMGroup">
                    <label htmlFor="setorCBAM">Setor CBAM <Tooltip text="Setores cobertos pelo CBAM: aço, alumínio, cimento, fertilizantes, hidrogênio." /></label>
                    <select id="setorCBAM" {...register('setorCBAM')}>
                      <option value="ferro_aco">Ferro e Aço</option>
                      <option value="aluminio">Alumínio</option>
                      <option value="cimento">Cimento</option>
                      <option value="fertilizantes">Fertilizantes</option>
                      <option value="hidrogenio">Hidrogênio</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="jaFazInventario">Já faz inventário de emissões? <Tooltip text="Se a empresa já realiza o inventário de GEE (gases de efeito estufa)." /></label>
                  <select id="jaFazInventario" {...register('jaFazInventario')}>
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── STEP 2: ENERGIA ── */}
            <div className={`calc-step${currentStep === 2 ? ' active' : ''}`} data-step="2">
              <h3 className="step-title">Consumo de Energia</h3>
              <p className="step-desc">Dados de eletricidade e combustíveis usados nas instalações.</p>
              <div className="form-grid">
                <div className="form-group full-width"><label className="form-section-label"><Icon name="bolt" size={15} inline />Eletricidade</label></div>
                <div className="form-group">
                  <label htmlFor="eletricidade">Consumo de Energia Elétrica (kWh/mês) <Tooltip text="Total de kWh na conta de energia. Veja a fatura mensal da CEMIG/ENEL." /></label>
                  <input type="number" id="eletricidade" {...register('eletricidade')} placeholder="Ex: 5000" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="fonteEnergia">Fonte de Energia Principal <Tooltip text="De onde vem a eletricidade. Energia solar ou eólica reduz drasticamente as emissões." /></label>
                  <select id="fonteEnergia" {...register('fonteEnergia')}>
                    <option value="convencional">Rede convencional (hidro/termo)</option>
                    <option value="solar">Solar (fotovoltaica)</option>
                    <option value="eolica">Eólica</option>
                    <option value="biomassa">Biomassa/Biogás</option>
                    <option value="misto">Misto (rede + renovável)</option>
                  </select>
                </div>
                <div className="form-group full-width"><label className="form-section-label"><Icon name="flame" size={15} inline />Combustíveis Estacionários</label></div>
                <div className="form-group">
                  <label htmlFor="glp">GLP / Gás de Cozinha (kg/mês) <Tooltip text="Consumo de GLP (botijões/granel). 1 botijão P13 = 13 kg." /></label>
                  <input type="number" id="glp" {...register('glp')} placeholder="Ex: 100" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="gasNatural">Gás Natural (m³/mês) <Tooltip text="Volume de gás natural consumido. Veja a fatura da distribuidora." /></label>
                  <input type="number" id="gasNatural" {...register('gasNatural')} placeholder="Ex: 500" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="dieselGerador">Diesel em Geradores (litros/mês) <Tooltip text="Consumo de diesel apenas em geradores e equipamentos estacionários." /></label>
                  <input type="number" id="dieselGerador" {...register('dieselGerador')} placeholder="Ex: 200" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="lenha">Lenha / Biomassa Sólida (toneladas/mês) <Tooltip text="Consumo de lenha ou cavacos em fornos, caldeiras e processos industriais." /></label>
                  <input type="number" id="lenha" {...register('lenha')} placeholder="Ex: 5" min="0" step="0.1" />
                </div>
              </div>
            </div>

            {/* ── STEP 3: FROTA ── */}
            <div className={`calc-step${currentStep === 3 ? ' active' : ''}`} data-step="3">
              <h3 className="step-title">Frota & Transporte</h3>
              <p className="step-desc">Combustível da frota de veículos e viagens aéreas corporativas.</p>
              <div className="form-grid">
                <div className="form-group full-width"><label className="form-section-label"><Icon name="car" size={15} inline />Frota de Veículos</label></div>
                <div className="form-group">
                  <label htmlFor="numVeiculos">Nº de Veículos na Frota <Tooltip text="Total de veículos (próprios + locados) utilizados na operação." /></label>
                  <input type="number" id="numVeiculos" {...register('numVeiculos')} placeholder="Ex: 10" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="kmMes">Km Rodados por Mês (total frota) <Tooltip text="Quilometragem total percorrida por todos os veículos da frota." /></label>
                  <input type="number" id="kmMes" {...register('kmMes')} placeholder="Ex: 15000" min="0" />
                </div>
                <div className="form-group full-width"><label className="form-section-label"><Icon name="fuel" size={15} inline />Combustíveis (litros ou m³ por mês)</label></div>
                <div className="form-group">
                  <label htmlFor="gasolinaLitros">Gasolina (litros/mês) <Tooltip text="Total de gasolina abastecida na frota por mês. Veja os recibos de abastecimento." /></label>
                  <input type="number" id="gasolinaLitros" {...register('gasolinaLitros')} placeholder="Ex: 500" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="dieselLitros">Diesel (litros/mês) <Tooltip text="Total de diesel abastecido na frota (caminhões, ônibus, etc.)." /></label>
                  <input type="number" id="dieselLitros" {...register('dieselLitros')} placeholder="Ex: 1000" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="etanolLitros">Etanol (litros/mês) <Tooltip text="Consumo de etanol. Considerado neutro em carbono (biocombustível)." /></label>
                  <input type="number" id="etanolLitros" {...register('etanolLitros')} placeholder="Ex: 200" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="gnvM3">GNV — Gás Natural Veicular (m³/mês) <Tooltip text="Consumo de GNV em veículos adaptados." /></label>
                  <input type="number" id="gnvM3" {...register('gnvM3')} placeholder="Ex: 100" min="0" />
                </div>
                <div className="form-group full-width"><label className="form-section-label"><Icon name="plane" size={15} inline />Viagens Aéreas</label></div>
                <div className="form-group">
                  <label htmlFor="viagensDomesticas">Trechos Domésticos/ano <Tooltip text="Número de trechos aéreos nacionais por ano. 1 ida e volta = 2 trechos." /></label>
                  <input type="number" id="viagensDomesticas" {...register('viagensDomesticas')} placeholder="Ex: 30" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="viagensInternacionais">Trechos Internacionais/ano <Tooltip text="Número de trechos aéreos internacionais por ano. 1 ida e volta = 2 trechos." /></label>
                  <input type="number" id="viagensInternacionais" {...register('viagensInternacionais')} placeholder="Ex: 5" min="0" />
                </div>
              </div>
            </div>

            {/* ── STEP 4: INSTALAÇÕES ── */}
            <div className={`calc-step${currentStep === 4 ? ' active' : ''}`} data-step="4">
              <h3 className="step-title">Instalações & Recursos</h3>
              <p className="step-desc">Consumo de água, papel, climatização e outros recursos das instalações.</p>
              <div className="form-grid">
                <div className="form-group full-width"><label className="form-section-label"><Icon name="droplet" size={15} inline />Água</label></div>
                <div className="form-group">
                  <label htmlFor="aguaM3">Consumo de Água (m³/mês) <Tooltip text="Volume em m³ na conta de água. Ex: 150 m³. Se não souber, estime: ~0.05 m³/funcionário/dia." /></label>
                  <input type="number" id="aguaM3" {...register('aguaM3')} placeholder="Ex: 150" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="tratamentoAgua">Tratamento de Efluentes <Tooltip text="Como o esgoto da empresa é tratado. Rede pública é o mais comum." /></label>
                  <select id="tratamentoAgua" {...register('tratamentoAgua')}>
                    <option value="rede">Rede pública (COPASA/SABESP)</option>
                    <option value="fossa">Fossa séptica</option>
                    <option value="eta">ETA/ETE própria</option>
                    <option value="nenhum">Sem tratamento</option>
                  </select>
                </div>
                <div className="form-group full-width"><label className="form-section-label"><Icon name="snow" size={15} inline />Climatização</label></div>
                <div className="form-group">
                  <label htmlFor="arCondicionado">Nº de Aparelhos de Ar-Condicionado <Tooltip text="Quantidade total de aparelhos de ar-condicionado em todas as unidades." /></label>
                  <input type="number" id="arCondicionado" {...register('arCondicionado')} placeholder="Ex: 10" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="refrigeracao">Câmaras Frigoríficas / Refrigeração Industrial <Tooltip text="Se a empresa possui câmaras frias ou freezers industriais." /></label>
                  <select id="refrigeracao" {...register('refrigeracao')}>
                    <option value="nenhuma">Não possui</option>
                    <option value="pequena">Pequena (1-3 câmaras)</option>
                    <option value="media">Média (4-10 câmaras)</option>
                    <option value="grande">Grande (10+ câmaras)</option>
                  </select>
                </div>
                <div className="form-group full-width"><label className="form-section-label"><Icon name="docLeaf" size={15} inline />Escritório</label></div>
                <div className="form-group">
                  <label htmlFor="papelResmas">Papel Consumido (resmas/mês) <Tooltip text="Quantidade de resmas de papel A4 consumidas. 1 resma = 500 folhas." /></label>
                  <input type="number" id="papelResmas" {...register('papelResmas')} placeholder="Ex: 20" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="homeOffice">% Funcionários em Home Office <Tooltip text="Percentual de funcionários que trabalham remotamente. Ex: 30 = 30% em home office." /></label>
                  <input type="number" id="homeOffice" {...register('homeOffice')} placeholder="Ex: 30" min="0" max="100" />
                </div>
              </div>
            </div>

            {/* ── STEP 5: RESÍDUOS ── */}
            <div className={`calc-step${currentStep === 5 ? ' active' : ''}`} data-step="5">
              <h3 className="step-title">Resíduos & Gestão Ambiental</h3>
              <p className="step-desc">Geração de resíduos sólidos, destinação e práticas ambientais atuais.</p>
              <div className="form-grid">
                <div className="form-group full-width"><label className="form-section-label"><Icon name="recycleLeaf" size={15} inline />Resíduos Sólidos</label></div>
                <div className="form-group">
                  <label htmlFor="residuos">Resíduos Gerados (toneladas/mês) <Tooltip text="Peso total de lixo gerado por mês. Pergunte ao serviço de coleta." /></label>
                  <input type="number" id="residuos" {...register('residuos')} placeholder="Ex: 5" min="0" step="0.1" />
                </div>
                <div className="form-group">
                  <label htmlFor="reciclagem">% Reciclado / Reaproveitado <Tooltip text="Percentual do lixo que vai para reciclagem. Se não recicla, coloque 0." /></label>
                  <input type="number" id="reciclagem" {...register('reciclagem')} placeholder="Ex: 30" min="0" max="100" />
                </div>
                <div className="form-group">
                  <label htmlFor="destinacao">Destinação Principal <Tooltip text="Para onde vai a maior parte do lixo da empresa." /></label>
                  <select id="destinacao" {...register('destinacao')}>
                    <option value="aterro">Aterro sanitário</option>
                    <option value="incineracao">Incineração</option>
                    <option value="compostagem">Compostagem</option>
                    <option value="reciclagem_dest">Cooperativa de reciclagem</option>
                    <option value="misto_dest">Misto</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="residuosPerigosos">Resíduos Perigosos (kg/mês) <Tooltip text="Óleos, solventes, baterias, produtos químicos, lixo hospitalar. Se não tem, deixe 0." /></label>
                  <input type="number" id="residuosPerigosos" {...register('residuosPerigosos')} placeholder="Ex: 50" min="0" />
                </div>
                <div className="form-group full-width"><label className="form-section-label"><Icon name="sprout" size={15} inline />Práticas Atuais</label></div>
                <div className="form-group">
                  <label htmlFor="certificacao">Possui Certificação Ambiental? <Tooltip text="Se a empresa possui alguma certificação ambiental vigente." /></label>
                  <select id="certificacao" {...register('certificacao')}>
                    <option value="nenhuma">Nenhuma</option>
                    <option value="iso14001">ISO 14001</option>
                    <option value="bcorp">B Corp</option>
                    <option value="outra_cert">Outra</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="compensaAtual">Já compensa emissões? <Tooltip text="Se a empresa já compra créditos de carbono ou faz alguma compensação." /></label>
                  <select id="compensaAtual" {...register('compensaAtual')}>
                    <option value="nao">Não</option>
                    <option value="parcial">Parcialmente</option>
                    <option value="sim">Sim, 100%</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── STEP 6: CONTATO ── */}
            <div className={`calc-step${currentStep === 6 ? ' active' : ''}`} data-step="6">
              <h3 className="step-title">Seus Dados de Contato</h3>
              <p className="step-desc">Para enviarmos seu relatório personalizado com oportunidades de economia.</p>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="nomeContato">Seu Nome Completo <Tooltip text="Nome da pessoa responsável por receber o relatório." /></label>
                  <input type="text" id="nomeContato" {...register('nomeContato')} placeholder="Nome completo" />
                  {errors.nomeContato && <span className="field-error-msg">{errors.nomeContato.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="emailContato">E-mail Corporativo <Tooltip text="E-mail profissional para envio do relatório. Evite e-mails pessoais." /></label>
                  <input type="email" id="emailContato" {...register('emailContato')} placeholder="voce@empresa.com" />
                  {errors.emailContato && <span className="field-error-msg">{errors.emailContato.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="telefone">WhatsApp <Tooltip text="Número com DDD para contato rápido. Ex: (31) 99999-9999" /></label>
                  <input type="tel" id="telefone" {...register('telefone')} placeholder="(11) 99999-9999" />
                </div>
                <div className="form-group">
                  <label htmlFor="cargo">Cargo <Tooltip text="Seu cargo na empresa. Ex: Diretor de Operações" /></label>
                  <input type="text" id="cargo" {...register('cargo')} placeholder="Ex: Diretor de Sustentabilidade" />
                </div>
              </div>
              <div className="step-note">
                <p><Icon name="lock" size={14} inline />Seus dados são confidenciais e serão usados exclusivamente para envio do relatório e contato comercial.</p>
              </div>
            </div>

            {/* ── AÇÕES ── */}
            <div className="calc-actions">
              <button type="button" className="btn btn-secondary" id="btnPrev" style={{ display: currentStep > 1 ? 'inline-flex' : 'none' }} onClick={handlePrev}>← Voltar</button>
              <button type="button" className="btn btn-primary" id="btnNext" style={{ display: currentStep < TOTAL_STEPS ? 'inline-flex' : 'none' }} onClick={handleNext}>Próximo →</button>
              <button type="button" className="btn btn-secondary btn-skip" id="btnSkip" style={{ display: currentStep < TOTAL_STEPS ? 'inline-flex' : 'none' }} onClick={handleSkip}>Pular etapa</button>
              <button type="submit" className="btn btn-primary btn-submit" id="btnSubmit" style={{ display: currentStep === TOTAL_STEPS ? 'inline-flex' : 'none' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Calcular Meu Impacto
              </button>
            </div>
            </>
            )}

            {/* ── MODO EVENTO ── */}
            {modo === 'evento' && (
            <div className="event-form" data-step="evento">
              <h3 className="step-title">Seu evento <span className="text-accent">carbono neutro</span></h3>
              <p className="step-desc">Estime as emissões do seu evento (deslocamento de participantes + energia do local + resíduos) e receba o pacote com certificado on-chain.</p>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="eventoNome">Nome do evento</label>
                  <input type="text" id="eventoNome" value={eventoNome} onChange={(e) => setEventoNome(e.target.value)} placeholder="Ex.: Festival Sustentável 2026" />
                </div>
                <div className="form-group">
                  <label htmlFor="participantes">Nº de participantes</label>
                  <input type="number" id="participantes" value={participantes} onChange={(e) => setParticipantes(e.target.value)} placeholder="500" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="kmMedio">Km médio por participante <Tooltip text="Distância média de deslocamento (ida e volta) por participante. Usamos mix de transporte: carro, ônibus e metrô." /></label>
                  <input type="number" id="kmMedio" value={kmMedio} onChange={(e) => setKmMedio(e.target.value)} placeholder="20" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="energiaKwh">Energia do local (kWh)</label>
                  <input type="number" id="energiaKwh" value={energiaKwh} onChange={(e) => setEnergiaKwh(e.target.value)} placeholder="3000" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="residuosKg">Resíduos gerados (kg)</label>
                  <input type="number" id="residuosKg" value={residuosKg} onChange={(e) => setResiduosKg(e.target.value)} placeholder="400" min="0" />
                </div>
              </div>
              <p style={{ margin: '10px 0 0', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Estimativa com premissas documentadas (mix de transporte, fator SIN 2025 e DEFRA 2024) — o valor final é calculado após a medição real do evento.
              </p>
              <div className="calc-actions">
                <button type="button" className="btn btn-primary btn-submit" style={{ display: 'inline-flex' }} onClick={() => onSubmit({})}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Calcular Evento Neutro
                </button>
              </div>
            </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
