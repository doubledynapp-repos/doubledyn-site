'use client';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className={`navbar${isScrolled ? ' scrolled' : ''}`} id="navbar">
      <div className="nav-container">
        <a href="#" className="nav-logo">
          <img src="/assets/logo-icon.png" alt="DoubleDyn" className="logo-img" />
          <span className="logo-text">DoubleDyn</span>
        </a>
        <ul className={`nav-links${isMenuOpen ? ' open' : ''}`} id="navLinks">
          <li><a href="/#problema" onClick={closeMenu}>O Problema</a></li>
          <li><a href="/#calculadora" onClick={closeMenu}>Calculadora</a></li>
          <li><a href="/#como-funciona" onClick={closeMenu}>Como Funciona</a></li>
          <li><a href="/#parceiros" onClick={closeMenu}>Parceiros</a></li>
          <li><a href="/#time" onClick={closeMenu}>Time</a></li>
          <li><a href="/#roadmap" onClick={closeMenu}>Roadmap</a></li>
          <li><a href="/metodologia" onClick={closeMenu}>Metodologia</a></li>
          <li><a href="https://blog.doubledyn.com" onClick={closeMenu}>Blog</a></li>
          <li><a href="/dashboard" className="nav-cta" onClick={closeMenu}>Dashboard</a></li>
          <li><a href="/#contato" className="nav-cta" onClick={closeMenu}>Fale Conosco</a></li>
        </ul>
        <button
          className={`nav-toggle${isMenuOpen ? ' active' : ''}`}
          id="navToggle"
          aria-label="Menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
}
