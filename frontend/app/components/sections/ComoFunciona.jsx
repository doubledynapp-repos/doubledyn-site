export default function ComoFunciona() {
  return (
    <section className="section section-how" id="como-funciona">
      <div className="container">
        <div className="section-label">Como Funciona</div>
        <h2 className="section-title">Três passos para a <span className="text-accent">neutralidade</span></h2>
        <div className="how-grid">
          <div className="how-card" data-reveal="">
            <div className="how-number">01</div>
            <h3>Calcule</h3>
            <p>Use nossa calculadora gratuita para descobrir o impacto ambiental da sua operação com base em dados reais.</p>
          </div>
          <div className="how-arrow">→</div>
          <div className="how-card" data-reveal="">
            <div className="how-number">02</div>
            <h3>Consultoria</h3>
            <p>Nossos especialistas analisam o relatório e criam um plano personalizado de redução e compensação.</p>
          </div>
          <div className="how-arrow">→</div>
          <div className="how-card" data-reveal="">
            <div className="how-number">03</div>
            <h3>Certifique</h3>
            <p>Receba o Certificado DoubleDyn — prova pública e verificável de que sua empresa compensa suas emissões.</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <a href="#calculadora" className="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
            Calcular Agora
          </a>
        </div>
      </div>
    </section>
  );
}
