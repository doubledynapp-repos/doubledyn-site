import { DM_Sans, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import "./globals.css";

// ── next/font: fontes carregadas no servidor, zero CLS, sem requisição externa do cliente ──
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://doubledyn.com'),
  title: "DoubleDyn Ecotoken — Calculadora de Impacto Ambiental Corporativo",
  description: "Descubra o impacto ambiental da sua empresa em 2 minutos. Calculadora gratuita de carbono para empresas. Relatório ESG personalizado, DQS Score e compliance com a Lei 15.042/2024 (SBCE).",
  keywords: ['calculadora carbono', 'impacto ambiental empresa', 'SBCE', 'compliance ESG', 'crédito de carbono', 'DoubleDyn'],
  openGraph: {
    title: 'DoubleDyn — Calculadora de Impacto Ambiental Corporativo',
    description: 'Descubra o impacto ambiental da sua empresa em 2 minutos e receba um plano de ação personalizado.',
    url: 'https://doubledyn.com',
    siteName: 'DoubleDyn Ecotoken',
    images: [{ url: '/assets/og-image.png', width: 1200, height: 630 }],
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable} ${playfair.variable} ${jetbrainsMono.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
