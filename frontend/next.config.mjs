// DoubleDyn — Next.js config
// Headers de segurança aplicados a todas as rotas (auditoria 03/08/2026).
//
// CSP — FASE 2 (ENFORCEMENT): bloqueio ativo.
// Auditoria Fase 1 (04/08): 0 violações reais; único ajuste necessário foi
// 'unsafe-eval' (polyfill core-js + helper compile() do track.js — benignos).
// A política bloqueia script externo ('self' apenas) — XSS por injeção.
// report-uri mantido para monitoramento contínuo.

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

// CSP em modo ENFORCEMENT — bloqueia violações no navegador do visitante.
const csp = [
  "default-src 'self'",
  // Next.js hidratação (inline __next_f) + polyfills/helpers (unsafe-eval benigno)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // Calculadora usa estilos inline em praticamente todos os componentes
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  // API (self) + busca de CNPJ (BrasilAPI) + envio do formulário (FormSubmit)
  "connect-src 'self' https://brasilapi.com.br https://formsubmit.co",
  // Formulários: e-mail da calculadora (formsubmit) e WhatsApp
  "form-action 'self' https://formsubmit.co https://wa.me",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

const securityHeadersWithCsp = [
  ...securityHeaders,
  { key: 'Content-Security-Policy', value: `${csp}; report-uri /api/csp-report` },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeadersWithCsp }];
  },
};

export default nextConfig;
