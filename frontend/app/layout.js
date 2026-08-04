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
  title: "DoubleDyn — Plataforma de Confiança Ambiental | Meça, Compense, Comprove",
  description: "Plataforma de confiança ambiental: meça emissões com metodologia auditada (GHG Protocol, MCTI/SIRENE), compense com rastreabilidade on-chain e comprove com certificado verificável. Compliance com a Lei 15.042/2024 (SBCE).",
  keywords: ['calculadora carbono', 'impacto ambiental empresa', 'SBCE', 'compliance ESG', 'crédito de carbono', 'compensação on-chain', 'certificado NFT', 'DoubleDyn'],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: 'DoubleDyn — Plataforma de Confiança Ambiental',
    description: 'Meça com método auditado, compense com rastreabilidade on-chain e comprove com certificado verificável.',
    url: 'https://doubledyn.com',
    siteName: 'DoubleDyn',
    images: [{ url: '/assets/og-image.png', width: 1200, height: 630 }],
    locale: 'pt_BR',
    type: 'website',
  },
};

// Dados estruturados (JSON-LD) — ajuda o Google a entender o negócio
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'DoubleDyn',
  url: 'https://doubledyn.com',
  logo: 'https://doubledyn.com/assets/og-image.png',
  description: 'Plataforma de confiança ambiental: inventário de GEE, cálculo de emissões, compensação on-chain e certificação verificável.',
  sameAs: [],
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable} ${playfair.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://blog.doubledyn.com" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
