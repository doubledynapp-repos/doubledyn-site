import LegalPage from '../components/LegalPage';

export const metadata = { title: 'Termos de Uso — DoubleDyn' };

export default function TermosPage() {
  return (
    <LegalPage titulo="Termos de Uso" revisao="v1 · 03/08/2026">
      <h2>1. Aceitação</h2>
      <p>Ao acessar ou utilizar a plataforma DoubleDyn (CNPJ [CNPJ], [ENDEREÇO]), o usuário declara que leu, entendeu e aceitou estes Termos de Uso.</p>

      <h2>2. Definições</h2>
      <p><strong>Plataforma</strong>: site doubledyn.com e serviços associados. <strong>Serviços</strong>: diagnóstico de emissões (calculadora), plano de ação, benchmark setorial, DQS (DoubleDyn Quality Score), compensação de emissões e certificação digital (NFT on-chain).</p>

      <h2>3. Serviços</h2>
      <p>3.1. A plataforma fornece <strong>estimativas de emissões de GEE</strong> baseadas em metodologias reconhecidas (GHG Protocol, MCTI/SIRENE, IPCC) e fatores de fontes oficiais.</p>
      <p>3.2. Os resultados são <strong>estimativas com finalidade informativa e de gestão</strong> — não substituem inventário formal, verificação por terceiros ou obrigações legais de relato (ex.: SBCE).</p>
      <p>3.3. O DQS é um <strong>índice proprietário</strong> da DoubleDyn, com metodologia pública disponível na plataforma.</p>
      <p>3.4. A compensação é realizada por créditos registrados on-chain; o certificado digital (NFT) documenta a compensação realizada.</p>

      <h2>4. Conta e cadastro</h2>
      <p>O usuário é responsável pela veracidade dos dados e pela confidencialidade do acesso. A DoubleDyn pode recusar ou encerrar contas com dados falsos ou uso indevido.</p>

      <h2>5. Pagamentos</h2>
      <p>Pagamentos processados por intermediário (Asaas) — Pix, cartão ou boleto. Planos de assinatura renovam automaticamente; o usuário pode cancelar a qualquer momento (vigência até o fim do ciclo pago). Inadimplência pode suspender o acesso.</p>

      <h2>6. Uso aceitável</h2>
      <p>É vedado: dados falsos, fraudes, reprodução indevida do conteúdo ou do índice DQS, ou afirmar certificação não emitida pela plataforma.</p>

      <h2>7. Propriedade intelectual</h2>
      <p>A plataforma, o DQS, a metodologia e os conteúdos são de propriedade da DoubleDyn, licenciados ao usuário conforme este Termo.</p>

      <h2>8. Limitação de responsabilidade</h2>
      <p>Os resultados são estimativas sujeitas a incerteza metodológica (declarada na plataforma). A DoubleDyn não responde por danos indiretos decorrentes do uso dos resultados fora do propósito informativo, nem por decisões regulatórias baseadas nas estimativas.</p>

      <h2>9. Cancelamento e rescisão</h2>
      <p>O usuário pode encerrar a conta a qualquer momento; a DoubleDyn pode encerrar contas em descumprimento destes Termos.</p>

      <h2>10. Alterações</h2>
      <p>Estes Termos podem ser atualizados; a versão vigente será publicada na plataforma com data de revisão.</p>

      <h2>11. Privacidade</h2>
      <p>O tratamento de dados é regido pela <a href="/privacidade">Política de Privacidade</a> (LGPD — Lei 13.709/2018).</p>

      <h2>12. Foro</h2>
      <p>Elege-se o foro da comarca de [CIDADE]-MG, com renúncia a qualquer outro.</p>

      <p className="legal-disclaimer">* Minuta v1 — sujeita a revisão jurídica antes da publicação oficial.</p>
    </LegalPage>
  );
}
