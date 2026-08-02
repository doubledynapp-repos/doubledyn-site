export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg-particles" id="particles"></div>
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          Protocolo DoubleDyn V1
        </div>
        <h1 className="hero-title">
          Qual o <span className="text-accent">impacto ambiental</span> da sua empresa?
          <br />Descubra em <span className="text-accent">2 minutos.</span>
        </h1>
        <p className="hero-sub">
          Calculadora gratuita de impacto ambiental corporativo. Receba um relatório personalizado
          e descubra como economizar com ativos ambientais rastreáveis.
        </p>
        <div className="hero-ctas">
          <a href="#calculadora" className="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
            Calcular Agora
          </a>
          <a href="#como-funciona" className="btn btn-secondary">Saiba Mais →</a>
        </div>
      </div>
      <div className="hero-scroll-indicator">
        <span>Scroll</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
}
