'use client';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { STEP_SCHEMAS, calcFormSchema } from '../../lib/calcSchema';
import { calculateEmissions, formatBRL, CNAE_TO_SETOR, RISCO_SETOR, PORTE_MAP } from '../../lib/carbonEngine';

const TOTAL_STEPS = 6;

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
      <div className="bento-grid">
        {/* DQS Score */}
        <div className="bento-box highlight">
          <div>
            <div className="bento-title">DQS (DoubleDyn Quality Score)</div>
            <div className="bento-desc">Seu rating proprietário de eficiência de carbono.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div className="bento-value" style={{ marginBottom: 0, color: result.pcrColor }}>{result.dqsScore}</div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/1000</span>
            </div>
            <div style={{ padding: '12px 24px', borderRadius: '30px', fontWeight: 800, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '2px', backgroundColor: result.pcrColor, color: '#111' }}>
              Selo {result.pcrSeal}
            </div>
          </div>
          <svg className="bento-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>

        {/* Impacto Anual */}
        <div className="bento-box">
          <div className="bento-title">Impacto Anual Estimado</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div className="bento-value">{result.totalEmissao.toFixed(1)}</div>
            <span style={{ color: 'var(--accent)' }}>tCO₂e</span>
          </div>
          <div className="bento-desc">Inclui margem de segurança de +15%.</div>
          <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border)', color: 'var(--green)' }}>
            <span>Impacto = Preservação de <strong>{result.arvoresPreservadas}</strong> árvores</span>
          </div>
        </div>

        {/* Exposição SBCE */}
        <div className="bento-box">
          <div className="bento-title">Exposição Regulatória SBCE</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div className="bento-value" style={{ color: result.exposureColor }}>{result.exposureScore.toFixed(1)}</div>
            <span style={{ color: 'var(--text-muted)' }}>/10</span>
          </div>
          <div className="bento-desc" style={{ fontWeight: 'bold', color: result.riscoCor }}>RISCO REGULATÓRIO: {result.risco}</div>
          <div className="bento-desc">Com a Lei SBCE (15.042/2024), sua empresa {result.riscoMsg}</div>
          <div className="bento-desc" style={{ marginTop: '10px', fontWeight: 'bold', color: 'var(--accent)' }}>{result.complianceSealEmoji} {result.complianceSealStatus}</div>
        </div>

        {/* Passivo Ambiental */}
        <div className="bento-box">
          <div className="bento-title">Passivo Ambiental Estimado</div>
          <div className="bento-value" style={{ color: '#e74c3c', fontSize: '1.8rem' }}>
            {result.faturamento > 0 ? formatBRL(result.multaPotencial) : 'Informe o faturamento'}
          </div>
          <div className="bento-desc">
            {result.faturamento > 0
              ? `Até 3% de ${formatBRL(result.faturamento)} (Lei 15.042/2024, Art. 29)`
              : 'Multa pode chegar a 3% do faturamento bruto anual'}
          </div>
          <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border)' }}>
            <div className="bento-title" style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Custo Médio de Mercado</div>
            <div className="bento-value" style={{ fontSize: '1.5rem' }}>{formatBRL(result.custoTradicional)}</div>
          </div>
        </div>

        {/* Insight Estratégico */}
        <div className="bento-box highlight" style={{ alignItems: 'flex-start' }}>
          <div style={{ flex: 1, paddingRight: '20px' }}>
            <div className="bento-title" style={{ color: 'var(--accent)' }}>💡 Insight Estratégico</div>
            <div className="bento-value" style={{ fontSize: '1.2rem', fontWeight: 400, lineHeight: 1.6, color: 'var(--text)' }}>
              {result.maiorCategoria.insight}
            </div>
          </div>
          <div style={{ flex: '0 0 300px', borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
            <div className="bento-title">Oportunidade DoubleDyn</div>
            <div className="bento-value" style={{ color: 'var(--green)' }}>Até 70%</div>
            <div className="bento-desc">De economia no Pacote PCR All-in-One.</div>
          </div>
        </div>

        {/* CTAs */}
        <div className="bento-box highlight" style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0, flexDirection: 'row', gap: '16px' }}>
          <button
            className="btn btn-primary"
            onClick={handlePreReport}
            disabled={preReportVisible}
            style={{ flex: 1, justifyContent: 'center', padding: '20px', fontSize: '1.1rem' }}
          >
            {preReportVisible ? '✅ Pré-Relatório Gerado!' : 'Receber Meu Plano de Economia'}
          </button>
          <a className="btn btn-whatsapp" href={waURL} target="_blank" rel="noopener noreferrer" style={{ flex: 1, justifyContent: 'center', padding: '20px', fontSize: '1.1rem' }}>
            Falar com Especialista
          </a>
          <button className="btn btn-secondary" onClick={onRecalc} style={{ flex: '0 0 auto', padding: '20px' }}>
            ↺ Recalcular
          </button>
        </div>
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
                <span className="pre-report-breakdown-label">⚡ Energia</span>
                <span className="pre-report-breakdown-value">{result.emissaoEnergia.toFixed(1)} t</span>
              </div>
              <div className="pre-report-breakdown-item">
                <span className="pre-report-breakdown-label">🚗 Transporte</span>
                <span className="pre-report-breakdown-value">{result.emissaoTransporte.toFixed(1)} t</span>
              </div>
              <div className="pre-report-breakdown-item">
                <span className="pre-report-breakdown-label">🏢 Instalações</span>
                <span className="pre-report-breakdown-value">{result.emissaoInstalacoes.toFixed(1)} t</span>
              </div>
              <div className="pre-report-breakdown-item">
                <span className="pre-report-breakdown-label">♻️ Resíduos</span>
                <span className="pre-report-breakdown-value">{result.emissaoResiduos.toFixed(1)} t</span>
              </div>
            </div>
          </div>
          <div className="pre-report-insight">
            <h4>💡 Sua Maior Oportunidade de Redução</h4>
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
            <p>🔒 Este pré-relatório foi enviado para o e-mail informado. Para obter o relatório completo, agende sua call de diagnóstico.</p>
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
  const [cnpjData, setCnpjData] = useState(null);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjHint, setCnpjHint] = useState({ msg: '', type: '' });
  const [showCBAMField, setShowCBAMField] = useState(false);
  const [faturamentoDisplay, setFaturamentoDisplay] = useState('');

  // Usar ref para manter o step atual no escopo do resolver sem cache do useForm
  const stepRef = useRef(currentStep);
  stepRef.current = currentStep;

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: async (data, context, options) => {
      // Usa o schema correto do step atual dinamicamente
      return zodResolver(STEP_SCHEMAS[stepRef.current - 1])(data, context, options);
    },
    mode: 'onTouched',
  });

  // ── Navegação de Steps ──
  const goToStep = (n) => {
    setCurrentStep(n);
    document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleNext = async () => {
    const valid = await trigger();
    if (valid && currentStep < TOTAL_STEPS) goToStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  };

  const handleStepClick = (step) => {
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
    const allData = getValues();
    const fullData = { ...allData, ...data, faturamento: faturamentoDisplay };

    // Validação Global
    const parseResult = calcFormSchema.safeParse(fullData);
    if (!parseResult.success) {
      // Procurar qual foi o primeiro passo que deu erro e pular pra ele
      for (let i = 0; i < STEP_SCHEMAS.length; i++) {
        const stepRes = STEP_SCHEMAS[i].safeParse(fullData);
        if (!stepRes.success) {
          goToStep(i + 1);
          setTimeout(() => trigger(), 100); // Highlight no erro
          return;
        }
      }
      return;
    }

    // Validação mínima: ao menos um dado de consumo
    const hasConsumption =
      parseFloat(fullData.eletricidade) > 0 ||
      parseFloat(fullData.gasolinaLitros) > 0 ||
      parseFloat(fullData.dieselLitros) > 0 ||
      parseFloat(fullData.aguaM3) > 0 ||
      parseFloat(fullData.residuos) > 0;

    if (!hasConsumption) {
      setCurrentStep(2);
      return;
    }

    const calc = calculateEmissions(fullData);
    setResult(calc);

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
        raw_data: JSON.stringify(fullData),
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

  return (
    <section className="section section-calc" id="calculadora">
      <div className="container">
        <div className="section-label">Calculadora Gratuita</div>
        <h2 className="section-title">Calcule o <span className="text-accent">impacto ambiental</span> da sua empresa</h2>
        <p className="section-subtitle">Preencha os dados abaixo e receba um relatório personalizado com oportunidades de economia.</p>

        <div className="calc-wrapper">
          {/* Progress Bar */}
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
                  >
                    <span>{step}</span> {name}
                  </div>
                );
              })}
            </div>
          </div>

          <form id="calcForm" className="calc-form" onSubmit={handleSubmit(onSubmit)}>

            {/* ── STEP 1: EMPRESA ── */}
            <div className={`calc-step${currentStep === 1 ? ' active' : ''}`} data-step="1">
              <h3 className="step-title">Dados da Empresa</h3>
              <p className="step-desc">Digite o CNPJ para preenchimento automático ou preencha manualmente.</p>
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
                <div className="form-group full-width"><label className="form-section-label">⚡ Eletricidade</label></div>
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
                <div className="form-group full-width"><label className="form-section-label">🔥 Combustíveis Estacionários</label></div>
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
                <div className="form-group full-width"><label className="form-section-label">🚗 Frota de Veículos</label></div>
                <div className="form-group">
                  <label htmlFor="numVeiculos">Nº de Veículos na Frota <Tooltip text="Total de veículos (próprios + locados) utilizados na operação." /></label>
                  <input type="number" id="numVeiculos" {...register('numVeiculos')} placeholder="Ex: 10" min="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="kmMes">Km Rodados por Mês (total frota) <Tooltip text="Quilometragem total percorrida por todos os veículos da frota." /></label>
                  <input type="number" id="kmMes" {...register('kmMes')} placeholder="Ex: 15000" min="0" />
                </div>
                <div className="form-group full-width"><label className="form-section-label">⛽ Combustíveis (litros ou m³ por mês)</label></div>
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
                <div className="form-group full-width"><label className="form-section-label">✈️ Viagens Aéreas</label></div>
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
                <div className="form-group full-width"><label className="form-section-label">💧 Água</label></div>
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
                <div className="form-group full-width"><label className="form-section-label">❄️ Climatização</label></div>
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
                <div className="form-group full-width"><label className="form-section-label">📄 Escritório</label></div>
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
                <div className="form-group full-width"><label className="form-section-label">🗑️ Resíduos Sólidos</label></div>
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
                <div className="form-group full-width"><label className="form-section-label">🌱 Práticas Atuais</label></div>
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
                <p>🔒 Seus dados são confidenciais e serão usados exclusivamente para envio do relatório e contato comercial.</p>
              </div>
            </div>

            {/* ── AÇÕES ── */}
            <div className="calc-actions">
              <button type="button" className="btn btn-secondary" id="btnPrev" style={{ display: currentStep > 1 ? 'inline-flex' : 'none' }} onClick={handlePrev}>← Voltar</button>
              <button type="button" className="btn btn-primary" id="btnNext" style={{ display: currentStep < TOTAL_STEPS ? 'inline-flex' : 'none' }} onClick={handleNext}>Próximo →</button>
              <button type="submit" className="btn btn-primary btn-submit" id="btnSubmit" style={{ display: currentStep === TOTAL_STEPS ? 'inline-flex' : 'none' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Calcular Meu Impacto
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
