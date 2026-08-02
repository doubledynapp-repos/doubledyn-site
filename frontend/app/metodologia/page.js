// Nota Metodológica — página pública (estática)
import {
  META, POSICIONAMENTO, SCOPES, FACTORS, FORMULAS,
  BENCHMARKS, DQS, LIMITACOES,
} from '../lib/methodologyData';

// Paleta alinhada ao site
const C = {
  bg: '#091410', card: '#111a14', border: 'rgba(195,255,0,0.12)',
  accent: '#c3ff00', text: '#e8efe8', dim: '#8fb898', muted: '#5a7a63',
  warn: '#e67e22',
};

const section = { padding: '32px 0', borderBottom: `1px solid ${C.border}` };
const h2 = { color: C.accent, fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.3px', margin: '0 0 12px' };
const p = { color: C.dim, fontSize: '0.92rem', lineHeight: 1.7, margin: '0 0 10px' };
const table = { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' };
const th = { textAlign: 'left', padding: '10px 12px', color: C.accent, borderBottom: `1px solid ${C.border}`, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.5px' };
const td = { padding: '10px 12px', color: C.dim, borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top' };

function Card({ children, style }) {
  return <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '22px 26px', ...style }}>{children}</div>;
}

export default function Metodologia() {
  return (
    <main style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif", padding: '110px 24px 80px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ color: C.accent, fontSize: '0.7rem', fontWeight: 800, letterSpacing: '2.5px', marginBottom: '10px' }}>DOUBLEDYN · TRANSPARÊNCIA</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.8px', margin: '0 0 8px' }}>Nota Metodológica</h1>
          <p style={{ color: C.muted, fontSize: '0.85rem', margin: 0 }}>
            Versão {META.versao} · Revisada em {META.dataRevisao} · {META.statusAuditoria}
          </p>
        </div>

        {/* POSICIONAMENTO */}
        <section style={section}>
          <h2 style={h2}>Posicionamento da ferramenta</h2>
          {POSICIONAMENTO.map((t, i) => <p key={i} style={p}>{t}</p>)}
        </section>

        {/* ESCOPOS */}
        <section style={section}>
          <h2 style={h2}>Cobertura de escopos (GHG Protocol)</h2>
          <Card>
            <table style={table}>
              <thead>
                <tr><th style={th}>Dado informado</th><th style={th}>Escopo</th><th style={th}>Observação</th></tr>
              </thead>
              <tbody>
                {SCOPES.map((s, i) => (
                  <tr key={i}>
                    <td style={td}>{s.campo}</td>
                    <td style={{ ...td, color: C.accent, fontWeight: 700 }}>{s.escopo}</td>
                    <td style={td}>{s.obs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        {/* FATORES */}
        <section style={section}>
          <h2 style={h2}>Fatores de emissão</h2>
          <Card>
            <table style={table}>
              <thead>
                <tr><th style={th}>Fator</th><th style={th}>Valor</th><th style={th}>Unidade</th><th style={th}>Referência</th></tr>
              </thead>
              <tbody>
                {FACTORS.map((f, i) => (
                  <tr key={i}>
                    <td style={td}>{f.fator}</td>
                    <td style={{ ...td, color: C.text, fontWeight: 700 }}>{f.valor}</td>
                    <td style={td}>{f.unidade}</td>
                    <td style={td}>{f.fonte}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        {/* FORMULAS */}
        <section style={section}>
          <h2 style={h2}>Fórmulas de cálculo</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FORMULAS.map((f, i) => (
              <Card key={i}>
                <div style={{ color: C.accent, fontWeight: 800, fontSize: '0.85rem', marginBottom: '6px' }}>{f.nome}</div>
                <div style={{ color: C.dim, fontSize: '0.88rem', lineHeight: 1.6, fontFamily: 'monospace' }}>{f.formula}</div>
              </Card>
            ))}
          </div>
          <p style={{ ...p, marginTop: '16px', color: C.muted, fontSize: '0.8rem' }}>
            A margem de segurança de +15% é aplicada sobre a soma das categorias para cobrir a incerteza inerente a estimativas de triagem.
          </p>
        </section>

        {/* DQS */}
        <section style={section}>
          <h2 style={h2}>DQS — DoubleDyn Quality Score</h2>
          <Card>
            <p style={{ ...p, marginTop: 0 }}>{DQS.descricao}</p>
            <ol style={{ color: C.dim, fontSize: '0.9rem', lineHeight: 1.9, margin: '0 0 18px', paddingLeft: '22px' }}>
              {DQS.passos.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
            <table style={table}>
              <thead><tr><th style={th}>Selo</th><th style={th}>Faixa DQS</th></tr></thead>
              <tbody>
                {DQS.selos.map((s, i) => (
                  <tr key={i}><td style={{ ...td, color: C.accent, fontWeight: 700 }}>{s.nome}</td><td style={td}>{s.faixa}</td></tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        {/* BENCHMARKS */}
        <section style={section}>
          <h2 style={h2}>Benchmarks setoriais (intensidade)</h2>
          <Card>
            <p style={{ ...p, marginTop: 0, fontSize: '0.82rem', color: C.muted }}>
              Intensidade média em tCO₂e por R$ 1 milhão de faturamento anual, por setor. Base: dados públicos de inventários nacionais (SEEG / GHG Protocol Brasil).
            </p>
            <table style={table}>
              <thead><tr><th style={th}>Setor</th><th style={th}>Intensidade (tCO₂e/R$ mi)</th></tr></thead>
              <tbody>
                {BENCHMARKS.map((b, i) => (
                  <tr key={i}><td style={td}>{b.setor}</td><td style={{ ...td, color: C.text, fontWeight: 700 }}>{b.intensidade}</td></tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        {/* LIMITACOES */}
        <section style={section}>
          <h2 style={h2}>Limitações</h2>
          <Card>
            <ul style={{ color: C.dim, fontSize: '0.9rem', lineHeight: 1.9, margin: 0, paddingLeft: '22px' }}>
              {LIMITACOES.map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          </Card>
          <p style={{ ...p, marginTop: '18px', color: C.warn, fontSize: '0.85rem' }}>
            ⚠️ {META.statusAuditoria}
          </p>
        </section>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <a href="/#calculadora" style={{ color: C.accent, fontWeight: 700, textDecoration: 'none', borderBottom: `1px solid ${C.accent}` }}>
            ← Voltar para a calculadora
          </a>
        </div>
      </div>
    </main>
  );
}
