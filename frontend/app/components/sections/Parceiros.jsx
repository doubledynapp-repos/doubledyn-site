'use client';
import { useState } from 'react';

// ── Selos de credibilidade (RASCUNHO — revisar com a equipe) ──
const SELOS = [
  {
    id: 1,
    icone: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"></path></svg>
    ),
    nome: 'GHG Protocol Brasil',
    painelTitulo: 'O padrão mundial de inventário de emissões',
    bullets: [
      'O GHG Protocol é o padrão global mais usado para contabilizar emissões de gases de efeito estufa (Escopos 1, 2 e 3).',
      'No Brasil, o programa é conduzido pela FGV — a referência nacional para inventários corporativos.',
      'A DoubleDyn segue essa lógica na calculadora: classifica emissões diretas (energia, frota) e indiretas (eletricidade) nos escopos corretos.',
    ],
    recebe: [
      'Seu inventário fala a mesma língua que investidores, bancos e clientes exigem.',
      'Base sólida para relatórios de sustentabilidade (GHG, GRI, ISSB).',
    ],
  },
  {
    id: 2,
    icone: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-4V4a2 2 0 00-4 0v6H6l6 8 6-8z"></path><path d="M3 20h18"></path></svg>
    ),
    nome: 'IPCC — Mudanças Climáticas',
    painelTitulo: 'A ciência que dá valor aos números',
    bullets: [
      'O IPCC é o painel científico da ONU que avalia a ciência do clima e publica os fatores de aquecimento global (GWP).',
      'Os relatórios de avaliação (AR6) definem quanto cada gás (CO₂, CH₄, N₂O) equivale em CO₂ equivalente.',
      'A DoubleDyn usa fatores IPCC AR6 combinados com fatores oficiais nacionais (MCTI/SIRENE 2025).',
    ],
    recebe: [
      'Números defensáveis em auditoria e em negociações.',
      'Metodologia alinhada ao estado da arte da ciência climática.',
    ],
  },
  {
    id: 3,
    icone: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L1 9l11 6 9-4.91V17"></path><path d="M5 13.18v4L12 21l7-3.82v-4"></path></svg>
    ),
    nome: 'Lei 15.042/2024 — SBCE',
    painelTitulo: 'O mercado regulado de carbono do Brasil',
    bullets: [
      'A Lei 15.042/2024 criou o SBCE — o Sistema Brasileiro de Comércio de Emissões, o mercado regulado de carbono do país.',
      'Empresas com emissões acima dos limites definidos terão obrigações de reporte e, em fases seguintes, de adquirir créditos.',
      'A DoubleDyn ajuda empresas a medir a exposição, preparar o inventário e antecipar o compliance.',
    ],
    recebe: [
      'Antecipação: quem se adequa agora entra na frente das obrigações.',
      'Plano claro de preparação para o mercado regulado (2025–2027).',
    ],
  },
];

export default function Parceiros() {
  const [aberto, setAberto] = useState(null); // começa fechado

  const toggle = (id) => setAberto((prev) => (prev === id ? null : id));

  return (
    <section className="section section-partners" id="parceiros">
      <div className="container">
        <div className="section-label">Credibilidade</div>
        <h2 className="section-title">Por que empresas escolhem a <span className="text-accent">DoubleDyn</span></h2>
        <p className="section-subtitle">Nossa metodologia segue os padrões mais rigorosos do mercado global de ativos ambientais.</p>

        <div className="partners-logos">
          {SELOS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`partner-logo${aberto === s.id ? ' active' : ''}`}
              onClick={() => toggle(s.id)}
              aria-expanded={aberto === s.id}
              aria-controls={`selo-panel-${s.id}`}
            >
              {s.icone}
              <span>{s.nome}</span>
              <svg className="partner-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points={aberto === s.id ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
              </svg>
            </button>
          ))}
        </div>

        {/* Painel expansível */}
        <div
          className={`how-panel-wrap${aberto ? ' open' : ''}`}
          aria-live="polite"
          style={{ '--active-pos': aberto ? `${((aberto - 1) * 2 + 1) * 16.666}%` : '16.666%' }}
        >
          <span className="how-panel-arrow" aria-hidden="true" />
          <div className="how-panel">
            {SELOS.map((s) => (
              <div key={s.id} id={`selo-panel-${s.id}`} className={`how-panel-body${aberto === s.id ? ' active' : ''}`} role="region" aria-hidden={aberto !== s.id}>
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
                    <span className="how-panel-label">O que significa para você</span>
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

        <div className="impact-grid">
          <div className="impact-card" data-reveal="">
            <div className="impact-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
            </div>
            <div className="impact-number">Zero Risco</div>
            <h4>Sua empresa blindada</h4>
            <p>Antecipe-se à regulamentação obrigatória. Quem se adequa agora evita multas, restrições e perda de contratos no futuro.</p>
          </div>
          <div className="impact-card" data-reveal="">
            <div className="impact-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5C7 4 7 7 7 7"></path><path d="M18 9h1.5a2.5 2.5 0 000-5C17 4 17 7 17 7"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"></path><path d="M18 2H6v7a6 6 0 0012 0V2z"></path></svg>
            </div>
            <div className="impact-number">Vantagem Real</div>
            <h4>Saia na frente da concorrência</h4>
            <p>Empresas com certificação ambiental vencem mais licitações, atraem investidores e conquistam clientes que valorizam responsabilidade.</p>
          </div>
          <div className="impact-card" data-reveal="">
            <div className="impact-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path></svg>
            </div>
            <div className="impact-number">Selo Verificável</div>
            <h4>Prova pública de compromisso</h4>
            <p>Seu certificado fica registrado permanentemente. Qualquer pessoa pode verificar que sua empresa compensa suas emissões.</p>
          </div>
        </div>

        <div className="impact-cta-row">
          <a href="#calculadora" className="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
            Descobrir Meu Impacto Ambiental
          </a>
          <a href="https://wa.me/5511924526590?text=Olá!%20Quero%20saber%20como%20certificar%20minha%20empresa." className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
            💬 Falar com Consultor
          </a>
        </div>
      </div>
    </section>
  );
}
