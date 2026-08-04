export default function Roadmap() {
  const fases = [
    {
      side: 'left',
      status: 'done',
      badge: '✓ Concluído',
      date: 'Q1–Q2 2026',
      title: 'Validação & Piloto',
      items: [
        'Piloto com a Prefeitura de Ingaí (MG) — 100 tCO₂e compensadas, 4 certificados NFT na Polygon Mainnet, DQS 967 (Selo Ouro)',
        'Calculadora de impacto ambiental corporativo no ar',
        'Protocolo PCR-DoubleDyn v1 estruturado',
        'Time de founders formado (CEO, COO, CCO, CTO)',
      ],
    },
    {
      side: 'right',
      status: 'done',
      badge: '✓ Concluído',
      date: 'Q2–Q3 2026',
      title: 'Produto SaaS (product-led)',
      items: [
        'Calculadora completa: 6 etapas guiadas, meter ao vivo, módulos setoriais (agro/comércio) e estimativa por CNAE',
        'Plano de Ação em 3 passos (redução, gestão, compensação) com benchmark setorial (12 setores)',
        'Simulador de ROI no dashboard (plano Business)',
        'Fatores auditados (MCTI/SIRENE 2025) + Nota Metodológica pública e dinâmica',
        'Dashboard corporativo com DQS (0–1000) e diagnóstico completo',
      ],
    },
    {
      side: 'left',
      status: 'active',
      badge: 'Em andamento',
      date: 'Q3–Q4 2026',
      title: 'Monetização & Fundação',
      items: [
        'Checkout e cobrança real (planos Starter R$ 490 · Business R$ 990 · Enterprise R$ 2.490)',
        'Fase 0: API como fonte única + persistência do diagnóstico por conta',
        'Onboarding guiado e verificação de e-mail',
        'Primeiros clientes pagantes B2B',
      ],
    },
    {
      side: 'right',
      status: 'planned',
      badge: 'Planejado',
      date: 'Q4 2026',
      title: 'Certificação & Web3',
      items: [
        'Certificação NFT self-service com QR Code verificável on-chain',
        'Relatório público no padrão GHG/CVM (etapa 7 da jornada)',
        'Widget público do selo para sites de clientes',
        'Protocolo PCR-DoubleDyn 2.0 finalizado',
      ],
    },
    {
      side: 'left',
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
      side: 'right',
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