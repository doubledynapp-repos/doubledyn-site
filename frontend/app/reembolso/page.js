import LegalPage from '../components/LegalPage';

export const metadata = { title: 'Política de Reembolso — DoubleDyn' };

export default function ReembolsoPage() {
  return (
    <LegalPage titulo="Política de Reembolso" revisao="v1 · 03/08/2026 · CDC (Lei 8.078/1990)">
      <h2>1. Direito de arrependimento (Art. 49 CDC)</h2>
      <p>Para contratações online, o consumidor pode desistir em <strong>até 7 dias corridos</strong> da contratação, com reembolso integral — salvo quando o serviço já tiver sido executado com consentimento expresso (Art. 49, parágrafo único).</p>

      <h2>2. Planos de assinatura</h2>
      <ul>
        <li>Cancelamento a qualquer momento; acesso mantido até o fim do ciclo já pago</li>
        <li><strong>Reembolso integral se cancelado dentro de 7 dias</strong> (sem execução relevante)</li>
        <li>Após 7 dias: sem reembolso do ciclo corrente (serviço já prestado)</li>
      </ul>

      <h2>3. Compensação e certificado (serviços executados)</h2>
      <ul>
        <li><strong>Créditos já retirados / certificado já emitido</strong>: não reembolsáveis após a execução (com consentimento expresso no momento da compra — Art. 49, parágrafo único, CDC)</li>
        <li>Antes da execução (crédito não retirado): reembolso integral</li>
      </ul>

      <h2>4. Eventos (Evento Neutro)</h2>
      <ul>
        <li>Cancelamento <strong>antes da execução</strong>: reembolso integral</li>
        <li><strong>Após execução</strong> (certificado emitido): não reembolsável</li>
      </ul>

      <h2>5. Procedimento</h2>
      <p>Solicitar em [E-MAIL CONTATO] com os dados da compra; restituição em <strong>até 7 dias úteis</strong>, na mesma forma de pagamento.</p>

      <h2>6. Exceções</h2>
      <p>Cupons promocionais, taxas de intermediário já incorridas e casos de fraude são tratados caso a caso.</p>

      <p className="legal-disclaimer">* Minuta v1 — sujeita a revisão jurídica antes da publicação oficial.</p>
    </LegalPage>
  );
}
