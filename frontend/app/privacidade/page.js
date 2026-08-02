import Navbar from '../components/sections/Navbar';
import Footer from '../components/sections/Footer';

export default function Privacidade() {
    return (
        <>
            <Navbar />
            <main>
            <div className="legal-content">
                <h1>Política de Privacidade</h1>
                <span className="legal-date">Última atualização: 21 de Maio de 2026</span>

                <p>A <strong>DoubleDyn Ecotoken</strong> ("nós", "nosso") está comprometida com a proteção dos dados pessoais dos usuários de nosso site e serviços. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações, em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.</p>

                <h2>1. Dados que Coletamos</h2>
                <h3>1.1 Calculadora de Impacto Ambiental</h3>
                <p>Ao utilizar nossa calculadora, coletamos:</p>
                <ul>
                    <li><strong>Dados empresariais:</strong> CNPJ, nome da empresa, setor de atuação, número de funcionários, área das instalações, cidade/estado</li>
                    <li><strong>Dados operacionais:</strong> consumo de energia, combustíveis, água, resíduos, frota, viagens aéreas, climatização, papel</li>
                    <li><strong>Dados de contato:</strong> nome completo, e-mail corporativo, WhatsApp, cargo</li>
                </ul>

                <h3>1.2 Formulário de Contato</h3>
                <p>Nome, empresa, e-mail e mensagem enviados voluntariamente.</p>

                <h3>1.3 Dados Técnicos</h3>
                <p>Fontes externas carregadas (Google Fonts) podem coletar dados técnicos como endereço IP, tipo de navegador e idioma.</p>

                <h2>2. Finalidade do Tratamento</h2>
                <ul>
                    <li><strong>Geração do relatório:</strong> calcular o impacto ambiental estimado da sua empresa</li>
                    <li><strong>Contato comercial:</strong> enviar o relatório personalizado e oferecer consultoria ESG</li>
                    <li><strong>Melhoria do serviço:</strong> análise agregada de dados para aprimorar a calculadora</li>
                </ul>

                <h2>3. Base Legal</h2>
                <p>O tratamento dos dados é realizado com base no <strong>consentimento do titular</strong> (Art. 7º, I da LGPD) ao preencher voluntariamente a calculadora ou formulário de contato, e no <strong>legítimo interesse</strong> (Art. 7º, IX) para contato comercial B2B.</p>

                <h2>4. Compartilhamento de Dados</h2>
                <ul>
                    <li><strong>Nosso Backend Interno:</strong> os leads são armazenados de forma segura em nosso banco de dados.</li>
                    <li><strong>WhatsApp (Meta):</strong> ao clicar no botão WhatsApp, os dados da calculadora são enviados como mensagem pré-formatada.</li>
                    <li><strong>Google Fonts:</strong> fontes tipográficas carregadas do CDN do Google.</li>
                </ul>
                <p>Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins de marketing.</p>

                <h2>5. Armazenamento e Segurança</h2>
                <p>Os dados são salvos em nosso banco de dados interno sob rígida segurança. Adotamos medidas técnicas e administrativas para proteger os dados contra acesso não autorizado.</p>

                <h2>6. Direitos do Titular</h2>
                <p>Conforme a LGPD, você tem direito a:</p>
                <ul>
                    <li>Confirmar a existência de tratamento de seus dados</li>
                    <li>Acessar seus dados pessoais</li>
                    <li>Corrigir dados incompletos ou desatualizados</li>
                    <li>Solicitar a exclusão dos seus dados</li>
                    <li>Revogar o consentimento a qualquer momento</li>
                    <li>Obter informações sobre compartilhamento</li>
                </ul>

                <h2>7. Cookies</h2>
                <p>Nosso site não utiliza cookies próprios para rastreamento invasivo. Serviços de terceiros (Google Fonts) podem utilizar cookies técnicos necessários para seu funcionamento.</p>

                <h2>8. Contato do Encarregado (DPO)</h2>
                <p>Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato:</p>
                <ul>
                    <li><strong>E-mail:</strong> <a href="mailto:DoubleDynaapp@gmail.com">DoubleDynaapp@gmail.com</a></li>
                    <li><strong>WhatsApp:</strong> <a href="https://wa.me/5511924526590" target="_blank" rel="noopener noreferrer">+55 11 92452-6590</a></li>
                </ul>

                <h2>9. Alterações nesta Política</h2>
                <p>Esta política pode ser atualizada periodicamente. A data da última atualização será sempre indicada no topo desta página.</p>
            </div>
        </main>
        <Footer />
        </>
    );
}
