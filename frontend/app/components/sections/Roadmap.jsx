export default function Roadmap() {
  const fases = [
    {
      side: 'left',
      status: 'done',
      badge: '✓ Concluído',
      date: 'Q1–Q2 2026',
      title: 'Validação & Piloto',
      items: [
        'Piloto com a Prefeitura de Ingaí (MG) — 1º evento público com compensação certificada do estado',
        'Calculadora de impacto ambiental corporativo no ar',
        'Protocolo PCR-DoubleDyn v1 estruturado',
        'Time de founders formado (CEO, COO, CCO, CTO)',
      ],
    },
    {
      side: 'right',
      status: 'active',
      badge: '⚡ Em andamento',
      date: 'Q3 2026',
      title: 'Expansão Municipal',
      items: [
        'Pipeline de 10 municípios em negociação',
        'Lançamento do DQS — DoubleDyn Quality Score (rating proprietário)',
        'Primeiro relatório corporativo com selo PCR-DoubleDyn',
        'Pitch para fundos de impacto e aceleradoras',
      ],
    },
    {
      side: 'left',
      status: 'planned',
      badge: 'Planejado',
      date: 'Q4 2026',
      title: 'Plataforma & Web3',
      items: [
        'Dashboard corporativo para clientes (relatórios em tempo real)',
        'Certificação NFT com QR Code verificável on-chain',
        'API aberta para auditorias e integrações',
        'Protocolo PCR-DoubleDyn 2.0 finalizado',
      ],
    },
    {
      side: 'right',
      status: 'planned',
      badge: 'Planejado',
      date: 'Q1 2027',
      title: 'Compliance CBAM',
      items: [
        'Módulo de conformidade CBAM para exportadores brasileiros',
        'Foco: setores Aço/Ferro (US$ 4,7B em exportações para UE)',
        'Parcerias com associações industriais',
        'Primeiros contratos B2B corporativos de grande porte',
      ],
    },
    {
      side: 'left',
      status: 'vision',
      badge: 'Visão',
      date: 'Q2–Q3 2027',
      title: 'Mercado & Escala',
      items: [
        'Marketplace de créditos auditados com liquidez real',
        'Integração nativa com o SBCE regulado',
        'Expansão internacional (LATAM → Europa)',
        'Meta: 50+ empresas certificadas, US$ 2M em ativos transacionados',
      ],
    },
  ];

  return (
    <section className="section section-roadmap" id="roadmap">
      <div className="container">
        <div className="section-label">Roadmap</div>
        <h2 className="section-title">Construindo o <span className="text-accent">futuro</span> do mercado de carbono</h2>
        <p className="section-subtitle">Nossa jornada de validação local à infraestrutura global de confiança ambiental.</p>

        <div className="roadmap-timeline">
          <div className="roadmap-line"></div>
          {fases.map((fase) => (
            <div key={fase.title} className={`roadmap-item roadmap-${fase.side}`} data-reveal="">
              <div className={`roadmap-node${fase.status === 'done' ? ' roadmap-node--done' : fase.status === 'active' ? ' roadmap-node--active' : ''}`}></div>
              <div className="roadmap-card">
                <div className={`roadmap-badge${fase.status === 'done' ? ' roadmap-badge--done' : fase.status === 'active' ? ' roadmap-badge--active' : ''}`}>{fase.badge}</div>
                <span className="roadmap-date">{fase.date}</span>
                <h3 className="roadmap-title">{fase.title}</h3>
                <ul className="roadmap-list">
                  {fase.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
