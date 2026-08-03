// DoubleDyn — Next.js config
// Headers de segurança aplicados a todas as rotas (auditoria 03/08/2026).
// CSP foi deixado de fora por enquanto: requer validação com o fluxo completo
// da calculadora (Next injeta estilos inline) — pendente de teste dedicado.

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
