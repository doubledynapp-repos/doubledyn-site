import Icon from '../Icon';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo-row">
              <img src="/assets/images/logo-icon.png" alt="DoubleDyn" className="logo-img" />
              <span className="logo-text">DoubleDyn</span>
            </div>
            <p>Transformando cultura local em impacto ambiental real.</p>
          </div>
          <div className="footer-links">
            <a href="/#problema">O Problema</a>
            <a href="/#calculadora">Calculadora</a>
            <a href="/#como-funciona">Como Funciona</a>
            <a href="/#parceiros">Parceiros</a>
            <a href="/#contato">Contato</a>
            <a href="/metodologia">Nota Metodológica</a>
            <a href="https://blog.doubledyn.com">Blog</a>
            <a href="/privacidade">Privacidade</a>
            <a href="/termos">Termos</a>
            <a href="/reembolso">Reembolso</a>
            <a href="/cookies">Cookies</a>
            <a href="https://app.doubledyn.com" target="_blank" rel="noopener noreferrer" style={{color: 'rgba(255,255,255,0.3)', fontSize: '0.8em', marginTop: '10px'}}>
              <Icon name="lock" size={14} inline /> Acesso B2B
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 DoubleDyn Ecotoken. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
