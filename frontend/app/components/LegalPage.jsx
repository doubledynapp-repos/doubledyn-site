// Layout compartilhado das páginas legais (Termos, Privacidade, Reembolso, Cookies)
export default function LegalPage({ titulo, revisao, children }) {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <a href="/" className="legal-back">← Voltar para a DoubleDyn</a>
          <h1 className="legal-title">{titulo}</h1>
          <p className="legal-meta">Revisão: {revisao} · Minuta para revisão jurídica</p>
        </header>
        <div className="legal-body">{children}</div>
      </div>
    </main>
  );
}
