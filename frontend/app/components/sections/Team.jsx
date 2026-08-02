'use client';
import { useState } from 'react';

export default function Team() {
  const [current, setCurrent] = useState(0);

  const members = [
    {
      role: 'CEO & Founder',
      name: 'Diego Augusto',
      desc: 'Estrategista em descarbonização e mercado de carbono. Consultoria em relatoria legal (SBCE), investimentos verdes e liderança em operações internacionais.',
      tags: ['Descarbonização', 'SBCE', 'Investimentos Verdes'],
      linkedin: 'https://www.linkedin.com/in/diego-augusto-aa04351b3/',
      photo: '/assets/images/diego-augusto.jpg',
    },
    {
      role: 'COO & Co-Founder',
      name: 'Pedro Henrique',
      desc: 'Estrategista de negócios e articulador de ecossistemas. Responsável pela visão da DoubleDyn, posicionamento de mercado e conexão entre tecnologia, sustentabilidade e descarbonização.',
      tags: ['Estratégia', 'Parcerias', 'Novos Mercados'],
      linkedin: 'https://linkedin.com/in/pedrodoubledyn',
      photo: '/assets/images/pedro-augusto.jpg',
    },
    {
      role: 'Chief Commercial Officer',
      name: 'Raphaela Oliveira',
      desc: 'Motor comercial da DoubleDyn. Desenha a estratégia de vendas, capta clientes corporativos e estrutura parcerias que geram receita recorrente.',
      tags: ['Vendas', 'Parcerias', 'Expansão'],
      linkedin: 'https://www.linkedin.com/in/raphaela-oliveira-5822a9216/',
      photo: '/assets/images/raphaela-oliveira.jpg',
    },
    {
      role: 'CTO & Co-Founder',
      name: 'Rony Costa',
      desc: 'Desenvolvedor full-stack e arquiteto blockchain. Responsável pela infraestrutura técnica: smart contracts Solidity, certificação NFT e a plataforma de cálculo de emissões.',
      tags: ['Blockchain', 'Solidity', 'Full-Stack'],
      linkedin: 'https://www.linkedin.com/in/fealty-crypto-960791318/',
      photo: '/assets/images/rony-costa.jpg',
    },
  ];

  const goTo = (i) => {
    setCurrent((i + members.length) % members.length);
  };

  const LinkedInIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );

  return (
    <section className="section section-team" id="time">
      <div className="container">
        <div className="section-label">Quem Somos</div>
        <h2 className="section-title">Liderança <span className="text-accent">DoubleDyn</span></h2>
        <div className="team-carousel">
          <button
            className="carousel-arrow carousel-arrow--left"
            id="teamPrev"
            aria-label="Anterior"
            onClick={() => goTo(current - 1)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"></path>
            </svg>
          </button>
          <div className="carousel-viewport" id="teamViewport">
            {members.map((m, i) => (
              <div key={m.name} className={`carousel-slide${i === current ? ' active' : ''}`}>
                <div className="slide-content">
                  <div className="slide-info">
                    <span className="slide-role">{m.role}</span>
                    <h3 className="slide-name">{m.name}</h3>
                    <p className="slide-desc">{m.desc}</p>
                    <div className="slide-tags">
                      {m.tags.map((tag) => (
                        <span key={tag} className="team-tag">{tag}</span>
                      ))}
                    </div>
                    <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="team-linkedin">
                      <LinkedInIcon />
                      <span>LinkedIn</span>
                    </a>
                  </div>
                  <div className="slide-photo">
                    <img src={m.photo} alt={m.name} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="carousel-arrow carousel-arrow--right"
            id="teamNext"
            aria-label="Próximo"
            onClick={() => goTo(current + 1)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          </button>
          <div className="carousel-dots" id="teamDots">
            {members.map((m, i) => (
              <button
                key={m.name}
                className={`carousel-dot${i === current ? ' active' : ''}`}
                data-index={i}
                onClick={() => goTo(i)}
                aria-label={`Ir para ${m.name}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
