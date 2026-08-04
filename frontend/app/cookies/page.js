import LegalPage from '../components/LegalPage';

export const metadata = { title: 'Política de Cookies — DoubleDyn' };

export default function CookiesPage() {
  return (
    <LegalPage titulo="Política de Cookies" revisao="v1 · 03/08/2026">
      <h2>1. O que são cookies</h2>
      <p>Pequenos arquivos armazenados no navegador para funcionalidade, preferências e análise de uso.</p>

      <h2>2. O que a DoubleDyn usa</h2>
      <table className="legal-table">
        <thead><tr><th>Tipo</th><th>Finalidade</th><th>Consentimento</th></tr></thead>
        <tbody>
          <tr><td><strong>Essenciais</strong> (sessão, segurança)</td><td>Funcionamento do site e do login</td><td>Dispensado (necessários)</td></tr>
          <tr><td><strong>Preferências</strong> (localStorage)</td><td>Salvar diagnóstico em andamento no navegador</td><td>Informado nesta política</td></tr>
          <tr><td><strong>Analíticos/Marketing</strong> (GA4, Ads)</td><td>Entender uso e medir campanhas</td><td><strong>Consentimento via banner</strong></td></tr>
        </tbody>
      </table>

      <h2>3. Gestão</h2>
      <p>O usuário pode aceitar ou recusar cookies não essenciais no banner; pode limpar cookies nas configurações do navegador. A recusa não impede o uso das funções essenciais.</p>

      <h2>4. Contato</h2>
      <p>Dúvidas: [E-MAIL CONTATO].</p>

      <p className="legal-disclaimer">* Minuta v1 — sujeita a revisão jurídica antes da publicação oficial.</p>
    </LegalPage>
  );
}
