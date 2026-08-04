import { track } from '../../lib/track';

export default function Hero() {
  return (
    <section className="hero light" id="hero">
      <div className="hero-bg-particles" id="particles"></div>
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          Protocolo DoubleDyn V1
        </div>
        <h1 className="hero-title">
          Sua empresa precisa <span className="text-accent">comprovar</span> — não só medir.
        </h1>
        <p className="hero-sub">
          A plataforma de confiança ambiental: meça com método auditado (GHG Protocol, MCTI/SIRENE),
          compense com rastreabilidade on-chain e prove com certificado verificável.
        </p>
        <div className="hero-ctas">
          <a href="/register" className="btn btn-primary" onClick={() => track('cta_criar_conta_hero')}>Crie sua conta grátis →</a>
        </div>
      </div>
      <div className="hero-scroll-indicator">
        <span>Scroll</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
}
