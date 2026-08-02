'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { getApiUrl } from '../../lib/api';

const accent = '#c3ff00';
const bgCard = '#111a14';
const border = 'rgba(195, 255, 0, 0.08)';
const textDim = '#8fb898';
const textMuted = '#5a7a63';

const PLANS = [
  {
    key: 'business',
    name: 'Business',
    price: 'R$ 490',
    period: '/mês',
    description: 'Para PMEs que precisam iniciar a gestão de carbono.',
    features: ['Dashboard DQS completo', 'Até 50 certificados NFT/ano', 'Widget HTML de selo', 'Relatório PDF mensal', 'Desconto de 15% na queima', 'Suporte por e-mail'],
    cta: 'Assinar Business',
    popular: false
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 'R$ 1.990',
    period: '/mês',
    description: 'Para indústrias e governos com alta demanda regulatória.',
    features: ['Tudo do Business +', 'Certificados NFT ilimitados', 'API de integração ERP', 'Relatório BNDES/SBCE oficial', 'Desconto de 25% na queima', 'Suporte prioritário WhatsApp', 'Onboarding com consultor'],
    cta: 'Assinar Enterprise',
    popular: true
  }
];

export default function BillingPage() {
  const { token } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch(getApiUrl('/api/tenant/profile'), { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setTenant(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const handleCheckout = async (planKey) => {
    setCheckoutLoading(planKey);
    try {
      const res = await fetch(getApiUrl('/api/checkout/session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: planKey })
      });
      const data = await res.json();
      if (data.url) window.open(data.url, '_blank');
      else alert('Configure a API Key do Asaas para ativar pagamentos.');
    } catch (e) { alert('Erro de conexão com o servidor.'); }
    finally { setCheckoutLoading(null); }
  };

  if (loading) return <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: textDim }}>Carregando...</div>;

  return (
    <>
      <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#e8efe8', marginBottom: '6px' }}>Assinatura & Faturas</h1>
      <p style={{ color: textMuted, fontSize: '13px', marginBottom: '32px' }}>Gerencie seu plano e histórico de cobranças.</p>

      {/* Current Plan */}
      <div style={{ 
        background: bgCard, border: `1px solid ${border}`, borderRadius: '14px', padding: '20px 24px', marginBottom: '32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <div style={{ fontSize: '10px', color: textMuted, fontWeight: '700', marginBottom: '6px', letterSpacing: '1px' }}>PLANO ATUAL</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: tenant?.plan === 'enterprise' || tenant?.plan === 'business' ? accent : textDim }}>
            {tenant?.plan === 'enterprise' ? 'Enterprise' : tenant?.plan === 'business' ? 'Business' : 'Free Trial'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ecc71', boxShadow: '0 0 6px #2ecc71' }} />
          <span style={{ fontSize: '12px', color: '#2ecc71', fontWeight: '700' }}>ATIVO</span>
        </div>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {PLANS.map((plan) => {
          const isCurrentPlan = tenant?.plan === plan.key;
          return (
            <div key={plan.key} style={{
              background: bgCard,
              border: plan.popular ? `1px solid rgba(195,255,0,0.15)` : `1px solid ${border}`,
              borderRadius: '16px', padding: '32px', position: 'relative', overflow: 'hidden'
            }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${accent}, transparent)` }} />
              )}
              {plan.popular && (
                <span style={{ position: 'absolute', top: '16px', right: '16px', background: accent, color: '#0a0f0d', padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', letterSpacing: '0.5px' }}>POPULAR</span>
              )}
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#e8efe8', margin: '0 0 6px' }}>{plan.name}</h3>
              <p style={{ fontSize: '13px', color: textMuted, margin: '0 0 20px' }}>{plan.description}</p>
              
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '36px', fontWeight: '900', color: '#e8efe8' }}>{plan.price}</span>
                <span style={{ fontSize: '14px', color: textMuted }}>{plan.period}</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {plan.features.map((feat, i) => (
                  <li key={i} style={{ fontSize: '13px', color: textDim, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => !isCurrentPlan && handleCheckout(plan.key)}
                disabled={isCurrentPlan || checkoutLoading === plan.key}
                style={{
                  width: '100%', padding: '14px', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '14px',
                  cursor: isCurrentPlan ? 'default' : 'pointer',
                  background: isCurrentPlan ? `${border}` : accent,
                  color: isCurrentPlan ? textMuted : '#0a0f0d',
                  fontFamily: 'inherit', transition: 'all 0.2s'
                }}
              >
                {isCurrentPlan ? '✓ Plano Atual' : checkoutLoading === plan.key ? 'Gerando link…' : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: '14px', padding: '20px 24px', fontSize: '13px', color: textMuted, lineHeight: '1.6' }}>
        Os pagamentos são processados pelo <strong style={{ color: textDim }}>Asaas</strong> com suporte a PIX, Boleto e Cartão. Cancelamento sem multa a qualquer momento.
      </div>
    </>
  );
}
