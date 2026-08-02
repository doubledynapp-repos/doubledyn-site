import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo-row">
              <img src="/assets/logo-icon.png" alt="DoubleDyn" className="logo-img" />
              <span className="logo-text">DoubleDyn</span>
            </div>
            <p>Transformando cultura local em impacto ambiental real.</p>
          </div>
          <div className="footer-links">
            <Link href="/#calculadora">Calculadora</Link>
            <Link href="/#como-funciona">Como Funciona</Link>
            <Link href="/#parceiros">Parceiros</Link>
            <Link href="/#contato">Contato</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/termos">Termos</Link>
            <Link href="/admin" target="_blank" rel="noopener noreferrer" style={{color: "rgba(255,255,255,0.3)", fontSize: "0.8em", marginTop: "10px"}}>🔒 Acesso B2B</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 DoubleDyn Ecotoken. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
