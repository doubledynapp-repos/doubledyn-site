export default function Midia() {
  return (
    <section className="section" style={{ padding: '80px 0' }}>
      <div className="container">
        <span className="section-label">Destaque</span>
        <h2 className="section-title" style={{ marginBottom: '40px' }}>Na <span className="text-accent">mídia</span></h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <img src="/assets/images/destaque-midia.png" alt="DoubleDyn Destaque na Mídia" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} />
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>23 JUN 2026 · LAVRAS, MG</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', margin: '12px 0 16px', lineHeight: 1.3 }}>
              DoubleDyn apresenta solução de compliance ambiental no Bootcamp IpêTech — UFLA
            </h3>
            <p style={{ color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: '20px' }}>
              O time DoubleDyn participou do Bootcamp Ideação 2026 no Parque Científico e Tecnológico dos Ipês da Universidade Federal de Lavras. O evento reuniu startups com soluções que já impactam a região — e a DoubleDyn apresentou sua plataforma de tokenização de créditos de carbono e compliance com a Lei 15.042/2024 (SBCE).
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href="https://ipetech.ufla.br/index.php/2026/06/18/bootcamp-ideacao-2026-encerra-no-proximo-dia-23-com-resultados-que-ja-impactam-a-regiao/" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '10px 20px' }}>
                Ler artigo no IpêTech
              </a>
              <a href="#calculadora" className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '10px 20px' }}>
                Testar a calculadora
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
