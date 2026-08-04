import LegalPage from '../components/LegalPage';

export const metadata = { title: 'Política de Privacidade (LGPD) — DoubleDyn' };

export default function PrivacidadePage() {
  return (
    <LegalPage titulo="Política de Privacidade" revisao="v1 · 03/08/2026 · LGPD (Lei 13.709/2018)">
      <h2>1. Controlador</h2>
      <p>DoubleDyn — CNPJ [CNPJ], [ENDEREÇO], [CIDADE]-MG. Contato: [E-MAIL CONTATO].</p>

      <h2>2. Dados coletados</h2>
      <ul>
        <li><strong>Cadastro</strong>: nome, e-mail, empresa, CNPJ, telefone</li>
        <li><strong>Diagnóstico</strong>: dados de consumo informados (energia, combustível, viagens, água, resíduos etc.)</li>
        <li><strong>Pagamento</strong>: processado integralmente pelo Asaas — a DoubleDyn <strong>não armazena dados de cartão</strong></li>
        <li><strong>Navegação</strong>: dados técnicos (IP, dispositivo, páginas) e preferências locais (localStorage do diagnóstico)</li>
      </ul>

      <h2>3. Finalidades e base legal</h2>
      <table className="legal-table">
        <thead><tr><th>Finalidade</th><th>Base legal (art. 7º)</th></tr></thead>
        <tbody>
          <tr><td>Prestação dos serviços (calculadora, plano, certificado)</td><td>Execução de contrato (VII)</td></tr>
          <tr><td>Recibos e comunicações contratuais</td><td>Execução de contrato (VII)</td></tr>
          <tr><td>Marketing (com consentimento)</td><td>Consentimento (I)</td></tr>
          <tr><td>Obrigações fiscais</td><td>Obrigação legal (II)</td></tr>
          <tr><td>Melhoria de produto (dados anônimos)</td><td>Legítimo interesse (IX)</td></tr>
        </tbody>
      </table>

      <h2>4. Compartilhamento</h2>
      <p>Asaas (pagamentos), provedor de e-mail transacional (recibos) e analítica (dados anônimos/consentidos). <strong>Não vendemos dados pessoais.</strong></p>

      <h2>5. Direitos do titular (art. 18)</h2>
      <p>Acesso, correção, anonimização/eliminação, portabilidade, informação sobre compartilhamento e revogação de consentimento. Exercer em: [E-MAIL CONTATO].</p>

      <h2>6. Retenção</h2>
      <p>Dados de cadastro e contratuais: enquanto durar a relação e prazos legais (fiscal: 5 anos). Dados de diagnóstico: enquanto a conta existir; eliminados a pedido.</p>

      <h2>7. Segurança</h2>
      <p>Medidas técnicas e organizacionais (criptografia em trânsito, controle de acesso). Incidentes comunicados ao titular e à ANPD conforme a lei.</p>

      <h2>8. Encarregado (DPO)</h2>
      <p>[NOME/DPO] — [E-MAIL ENCARREGADO].</p>

      <h2>9. Menores</h2>
      <p>Plataforma destinada a maiores de 18 anos.</p>

      <h2>10. Alterações</h2>
      <p>A versão vigente será publicada com data de revisão. Veja também a <a href="/cookies">Política de Cookies</a>.</p>

      <p className="legal-disclaimer">* Minuta v1 — sujeita a revisão jurídica antes da publicação oficial.</p>
    </LegalPage>
  );
}
