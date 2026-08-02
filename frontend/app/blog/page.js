'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/sections/Navbar';
import Footer from '../components/sections/Footer';

export default function Blog() {
    const [filter, setFilter] = useState('todos');

    const blogPosts = [
        {
            href: "/posts/o-que-e-sbce",
            tags: ["sbce", "regulacao"],
            title: "O que é o SBCE e por que sua empresa precisa se preparar AGORA",
            excerpt: "O Sistema Brasileiro de Comércio de Emissões vai mudar as regras do jogo para empresas. Entenda o que muda e como se preparar.",
            date: "20 Mai 2026",
            readTime: "5 min de leitura"
        },
        {
            href: "/posts/como-calcular-emissoes",
            tags: ["carbono", "tutorial"],
            title: "Como calcular as emissões de carbono da sua empresa em 5 passos",
            excerpt: "Aprenda a medir o impacto ambiental da sua operação seguindo o padrão GHG Protocol, com exemplos práticos por setor.",
            date: "20 Mai 2026",
            readTime: "6 min de leitura"
        },
        {
            href: "/posts/lei-15042-2024",
            tags: ["lei", "sbce"],
            title: "Lei 15.042/2024: tudo que muda para empresas brasileiras",
            excerpt: "A nova lei do mercado de carbono regulado no Brasil. Obrigações, prazos, setores mais impactados e penalidades.",
            date: "20 Mai 2026",
            readTime: "7 min de leitura"
        },
        {
            href: "/posts/esg-na-pratica",
            tags: ["esg", "sustentabilidade"],
            title: "ESG na prática: como começar a compensar suas emissões hoje",
            excerpt: "Guia prático para implementar ESG e compensar emissões com créditos de carbono. ROI da sustentabilidade.",
            date: "20 Mai 2026",
            readTime: "5 min de leitura"
        },
        {
            href: "/posts/creditos-de-carbono",
            tags: ["carbono", "educacao"],
            title: "O que são créditos de carbono e como funcionam no Brasil",
            excerpt: "Entenda o mercado de créditos de carbono e como a blockchain está transformando a certificação ambiental no Brasil.",
            date: "20 Mai 2026",
            readTime: "6 min de leitura"
        }
    ];

    const filteredPosts = blogPosts.filter(post => filter === 'todos' || post.tags.includes(filter));

    return (
        <>
            <Navbar />
            <main>
                {/* BLOG HERO */}
                <section className="blog-hero">
                    <div className="section-label">Blog</div>
                    <h1 className="blog-hero-title">Educação, regulação e <span className="text-accent">sustentabilidade</span></h1>
                    <p className="blog-hero-sub">Tudo que sua empresa precisa saber sobre o mercado de carbono brasileiro, ESG e a nova regulação ambiental.</p>
                </section>

            {/* FILTERS */}
            <div className="blog-filters">
                {['todos', 'sbce', 'carbono', 'esg', 'lei', 'educacao', 'tutorial'].map(f => (
                    <button 
                        key={f}
                        className={`blog-filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* BLOG GRID */}
            <div className="blog-grid">
                {filteredPosts.map((post, index) => (
                    <Link href={post.href} key={index} className="blog-card">
                        <div className="blog-card-tags">
                            {post.tags.map(tag => (
                                <span key={tag} className="blog-card-tag">{tag.toUpperCase()}</span>
                            ))}
                        </div>
                        <h2 className="blog-card-title">{post.title}</h2>
                        <p className="blog-card-excerpt">{post.excerpt}</p>
                        <div className="blog-card-meta">
                            <span className="blog-card-meta-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                {post.date}
                            </span>
                            <span className="blog-card-meta-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                {post.readTime}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* CTA */}
            <div className="blog-cta">
                <h2 className="blog-cta-title">Descubra o impacto ambiental da <span className="text-accent">sua empresa</span></h2>
                <p className="blog-cta-desc">Use nossa calculadora gratuita e receba um diagnóstico completo em 2 minutos. Sem compromisso.</p>
                <Link href="/#calculadora" className="btn btn-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                    Calcular Meu Impacto Agora
                </Link>
                </div>
            </main>
            <Footer />
        </>
    );
}
