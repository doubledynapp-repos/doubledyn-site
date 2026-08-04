'use client';
import { useState } from 'react';
import Seal from '../Seal';

// ── Conteúdo dos 3 passos (RASCUNHO — revisar com a equipe) ──
const STEPS = [
  {
    id: 1,
    numero: '01',
    titulo: 'Calcule',
    icone: 'leaf',
    resumo: 'Use nossa calculadora gratuita para descobrir o impacto ambiental da sua operação com base em dados reais.',
    painelTitulo: 'Diagnóstico completo em ~2 minutos',
    bullets: [
      '6 etapas guiadas: dados da empresa, energia, frota, instalações, resíduos e contato.',
      'Cálculo com fatores oficiais: GHG Protocol Brasil, IPCC AR6 e MCTI/SIRENE 2025.',
      'Não sabe os dados de consumo? Estimamos pela média do seu setor — sempre sinalizado como estimativa.',
      'Margem de segurança de 15% incluída no total final.',
      'Resultado gerado na hora, direto no navegador, sem espera.',
    ],
    recebe: [
      'Total de emissões em tCO₂e/ano',
      'DQS Score (0–1000) com selo Bronze/Prata/Ouro',
      'Exposição regulatória estimada (Lei 15.042/2024 — SBCE)',
      'Benchmark: sua empresa vs. média do setor',
      'Plano de ação em 3 passos (redução, gestão e compensação)',
    ],
  },
  {
    id: 2,
    numero: '02',
    titulo: 'Consultoria',
    icone: 'handSprout',
    resumo: 'Nossos especialistas analisam o relatório e criam um plano personalizado de redução e compensação.',
    painelTitulo: 'Especialistas que transformam diagnóstico em ação',
    bullets: [
      'Análise do seu relatório por especialistas em descarbonização.',
      'Plano personalizado de redução e compensação, priorizado por impacto.',
      'Estimativas de investimento, economia e retorno para cada ação.',
      'Acompanhamento de metas e evolução do DQS Score ao longo do tempo.',
      'Orientação para o compliance com o SBCE e relatórios no padrão GHG.',
    ],
    recebe: [
      'Plano de ação priorizado com custo e retorno estimados',
      'Roadmap de redução de emissões',
      'Acompanhamento contínuo de metas',
      'Suporte para relatórios e compliance regulatório',
    ],
  },
  {
    id: 3,
    numero: '03',
    titulo: 'Certifique',
    icone: 'tree',
    resumo: 'Receba o Certificado DoubleDyn — prova pública e verificável de que sua empresa compensa suas emissões.',
    painelTitulo: 'Prova pública, imutável e verificável',
    bullets: [
      'Certificado NFT (ERC-721) registrado na Polygon Mainnet — imutável.',
      'Compensação registrada on-chain com retirement permanente dos créditos.',
      'Verificação pública por QR code — qualquer pessoa confere na blockchain.',
      'Memorial técnico público com hashes e transações auditáveis.',
      'Case de referência: Prefeitura de Ingaí-MG — 100 tCO₂e certificados.',
    ],
    recebe: [
      'Certificado NFT DoubleDyn (Official Seal)',
      'Registro on-chain do retirement',
      'QR code de verificação pública',
      'Selo para site e materiais da empresa',
    ],
  },
];

export default function ComoFunciona() {
  const [aberto, setAberto] = useState(null); // fechado por padrão — abre só ao clicar

  const toggle = (id) => setAberto((prev) => (prev === id ? null : id));

  return (
    <section className="section section-how" id="como-funciona">
      <div className="container">
        <div className="section-label">Como Funciona</div>
        <h2 className="section-title">
          Três passos para a <span className="text-accent">neutralidade</span>
          <svg className="title-squiggle" viewBox="0 0 220 14" fill="none" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10c30-8 60-8 90-3s60 5 90-2 25-3 34-2" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/></svg>
        </h2>

        <div className="how-grid">
          {STEPS.map((s, i) => (
            <div key={s.id} className="how-slot">
              <button
                type="button"
                className={`how-card${aberto === s.id ? ' active' : ''}`}
                onClick={() => toggle(s.id)}
                aria-expanded={aberto === s.id}
                aria-controls={`how-panel-${s.id}`}
              >
                <div className="how-card-top">
                  <div className="how-card-head">
                    <span className="how-icon"><Seal icon={s.icone} size={54} /></span>
                    <div className="how-number">{s.numero}</div>
                  </div>
                  <span className="how-chevron" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points={aberto === s.id ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                    </svg>
                  </span>
                </div>
                <h3>{s.titulo}</h3>
                <p>{s.resumo}</p>
              </button>
              {i < STEPS.length - 1 && <div className="how-arrow" aria-hidden="true">→</div>}
            </div>
          ))}
        </div>

        {/* Painel expansível — posiciona a seta sob o card ativo */}
        <div
          className={`how-panel-wrap${aberto ? ' open' : ''}`}
          id="how-panel"
          aria-live="polite"
          style={{ '--active-pos': aberto ? `${((aberto - 1) * 2 + 1) * 16.666}%` : '16.666%' }}
        >
          <span className="how-panel-arrow" aria-hidden="true" />
          <div className="how-panel">
            {STEPS.map((s) => (
              <div key={s.id} id={`how-panel-${s.id}`} className={`how-panel-body${aberto === s.id ? ' active' : ''}`} role="region" aria-hidden={aberto !== s.id}>
                <h4>{s.painelTitulo}</h4>
                <div className="how-panel-cols">
                  <ul className="how-panel-list">
                    {s.bullets.map((b) => (
                      <li key={b}>
                        <span className="how-check">✓</span> {b}
                      </li>
                    ))}
                  </ul>
                  <div className="how-panel-recebe">
                    <span className="how-panel-label">Você recebe</span>
                    <ul>
                      {s.recebe.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <a href="#calculadora" className="btn btn-secondary">
            Ver a calculadora gratuita
          </a>
        </div>
      </div>
    </section>
  );
}
