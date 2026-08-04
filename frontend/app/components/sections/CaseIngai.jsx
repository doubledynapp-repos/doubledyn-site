import Seal from '../Seal';

// Prova social — case real Ingaí (dados institucionais, verificáveis no produto)
export default function CaseIngai() {
  return (
    <section className="section section-case" id="case-ingai">
      <div className="container">
        <div className="case-strip">
          <div className="case-icon">
            <Seal icon="tree" size={52} />
          </div>
          <div className="case-main">
            <div className="case-title">Caso real: Prefeitura de Ingaí-MG</div>
            <div className="case-desc">
              Inventário de GEE, cálculo de emissões e compensação on-chain — com certificados digitais NFT na rede Polygon (Mainnet).
            </div>
          </div>
          <div className="case-stats">
            <div className="case-stat"><b>100</b><span>tCO₂e compensadas</span></div>
            <div className="case-stat"><b>4</b><span>NFTs ERC-721 on-chain</span></div>
            <div className="case-stat"><b>967</b><span>DQS · Selo Ouro</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
