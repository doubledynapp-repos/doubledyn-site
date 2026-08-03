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
          <br />Descubra <span className="text-accent">agora.</span>
        </h1>
        <p className="hero-sub">
          Calculadora gratuita de impacto ambiental corporativo. Receba um relatório personalizado
          e descubra como economizar com ativos ambientais rastreáveis.
        </p>
        <div className="hero-ctas">
          <a href="/register" className="btn btn-primary">Crie sua conta grátis →</a>
        </div>
      </div>
      <div className="hero-scroll-indicator">
        <span>Scroll</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
}
