import Navbar from '../components/sections/Navbar';
import Footer from '../components/sections/Footer';

export default function Termos() {
    return (
        <>
            <Navbar />
            <main>
            <div className="legal-content">
                <h1>Termos de Uso</h1>
                <span className="legal-date">Última atualização: 21 de Maio de 2026</span>

                <p>Ao acessar e utilizar o site da <strong>DoubleDyn Ecotoken</strong> ("DoubleDyn", "nós"), você concorda com os termos e condições descritos abaixo.</p>

                <h2>1. Sobre o Serviço</h2>
                <p>A DoubleDyn oferece uma <strong>calculadora gratuita de impacto ambiental corporativo</strong> e serviços de consultoria em compensação de emissões de carbono, com certificação via tecnologia blockchain.</p>

                <h2>2. Calculadora — Limitações</h2>
                <p>Os resultados gerados pela calculadora são <strong>estimativas baseadas em fatores de emissão reconhecidos</strong> (GHG Protocol, IPCC) e nos dados informados pelo usuário. Os cálculos:</p>
                <ul>
                    <li><strong>Não substituem</strong> uma consultoria profissional de inventário de emissões</li>
                    <li><strong>Não constituem</strong> relatório oficial para fins regulatórios (SBCE, ISO 14064)</li>
                    <li>São <strong>aproximações</strong> que incluem margem de segurança de 15% para emissões indiretas não mapeadas</li>
                    <li>Dependem da <strong>precisão dos dados</strong> informados pelo usuário</li>
                </ul>
                <p>Para um inventário oficial, recomendamos a contratação dos nossos serviços de consultoria.</p>

                <h2>3. Propriedade Intelectual</h2>
                <p>Todo o conteúdo do site — incluindo textos, gráficos, logos, ícones, imagens, código-fonte, design e a metodologia da calculadora — é propriedade da DoubleDyn e protegido por leis de propriedade intelectual brasileiras e internacionais.</p>
                <p>É proibida a reprodução, distribuição ou utilização comercial de qualquer conteúdo sem autorização prévia por escrito.</p>

                <h2>4. Uso Aceitável</h2>
                <p>Ao utilizar nosso site, você se compromete a:</p>
                <ul>
                    <li>Fornecer informações verdadeiras e precisas na calculadora</li>
                    <li>Não utilizar o site para fins ilícitos ou fraudulentos</li>
                    <li>Não tentar acessar áreas restritas do sistema</li>
                    <li>Não sobrecarregar nossos servidores com requisições automatizadas</li>
                </ul>

                <h2>5. Limitação de Responsabilidade</h2>
                <p>A DoubleDyn não se responsabiliza por:</p>
                <ul>
                    <li>Decisões empresariais tomadas com base nos resultados da calculadora</li>
                    <li>Indisponibilidade temporária do site ou de APIs de terceiros (BrasilAPI para CNPJ)</li>
                    <li>Precisão dos dados fornecidos por APIs externas</li>
                    <li>Perdas financeiras decorrentes do uso das informações do site</li>
                </ul>

                <h2>6. Links Externos</h2>
                <p>Nosso site pode conter links para sites de terceiros. Não nos responsabilizamos pelo conteúdo, políticas de privacidade ou práticas de sites externos.</p>

                <h2>7. Alterações nos Termos</h2>
                <p>Reservamo-nos o direito de alterar estes Termos de Uso a qualquer momento. As alterações entram em vigor imediatamente após a publicação no site.</p>

                <h2>8. Lei Aplicável</h2>
                <p>Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer questões decorrentes destes termos.</p>

                <h2>9. Contato</h2>
                <p>Para dúvidas sobre estes termos:</p>
                <ul>
                    <li><strong>E-mail:</strong> <a href="mailto:DoubleDynaapp@gmail.com">DoubleDynaapp@gmail.com</a></li>
                    <li><strong>WhatsApp:</strong> <a href="https://wa.me/5511924526590" target="_blank" rel="noopener noreferrer">+55 11 92452-6590</a></li>
                </ul>
            </div>
        </main>
        <Footer />
        </>
    );
}
