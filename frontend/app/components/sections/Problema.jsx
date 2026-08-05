export default function Problema() {
  return (
    <section className="section section-problema" id="problema">
      <div className="container">
        <div className="section-label">O Problema</div>
        <h2 className="section-title">A maioria das empresas <span className="text-accent">não sabe</span> quanto polui.</h2>
        <p className="section-subtitle">E as que sabem, não conseguem comprovar o impacto das suas ações ambientais.</p>
        <div className="problema-grid">
          <a href="https://blog.doubledyn.com/posts/esg-na-pratica.html" target="_blank" rel="noopener" className="problema-card-link" data-reveal="">
          <div className="problema-card">
            <div className="problema-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div className="problema-number">82%</div>
            <p>dos brasileiros <strong>não acreditam</strong> em promessas de sustentabilidade corporativa. <small style={{ opacity: '0.5' }}>(Pesquisa Consumo Sustentável 2026)</small></p>
          </div>
          </a>
          <a href="https://blog.doubledyn.com/posts/lei-15042-2024.html" target="_blank" rel="noopener" className="problema-card-link" data-reveal="">
          <div className="problema-card">
            <div className="problema-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div className="problema-number">R$ 50M</div>
            <p>em <strong>multas por não-conformidade</strong> com a Lei 15.042/24 (SBCE). A compensação será <strong>obrigatória</strong>.</p>
          </div>
          </a>
          <a href="https://blog.doubledyn.com/posts/o-que-e-sbce.html" target="_blank" rel="noopener" className="problema-card-link" data-reveal="">
          <div className="problema-card">
            <div className="problema-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <polyline points="9 12 11 14 15 10"></polyline>
              </svg>
            </div>
            <div className="problema-number">85%</div>
            <p>dos investidores globais veem <strong>greenwashing</strong> como o maior risco ESG atual. <small style={{ opacity: '0.5' }}>(EY Global Investor Survey 2025)</small></p>
          </div>
          </a>
        </div>
      </div>
    </section>
  );
}
