export default function Midia() {
  return (
    <section className="section section-midia" id="midia">
      <div className="container">
        <span className="section-label">Destaque</span>
        <h2 className="section-title">Na <span className="text-accent">mídia</span></h2>
        <div className="midia-grid">
          <div className="midia-image">
            <img src="/assets/images/destaque-midia.png" alt="DoubleDyn Destaque na Mídia" />
          </div>
          <div className="midia-content">
            <span className="midia-date">23 JUN 2026 · LAVRAS, MG</span>
            <h3 className="midia-headline">
              DoubleDyn apresenta solução de compliance ambiental no Bootcamp IpêTech — UFLA
            </h3>
            <p className="midia-desc">
              O time DoubleDyn participou do Bootcamp Ideação 2026 no Parque Científico e Tecnológico dos Ipês da Universidade Federal de Lavras. O evento reuniu startups com soluções que já impactam a região — e a DoubleDyn apresentou sua plataforma de tokenização de créditos de carbono e compliance com a Lei 15.042/2024 (SBCE).
            </p>
            <div className="midia-ctas">
              <a href="https://ipetech.ufla.br/index.php/2026/06/18/bootcamp-ideacao-2026-encerra-no-proximo-dia-23-com-resultados-que-ja-impactam-a-regiao/" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                Ler artigo no IpêTech
              </a>
              <a href="#calculadora" className="btn btn-secondary btn-sm">
                Testar a calculadora
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
