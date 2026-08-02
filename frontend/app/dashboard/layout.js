'use client';

import { useAuth } from '../lib/auth';
import { getApiUrl } from '../lib/api';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Ícones SVG inline da identidade DoubleDyn
const Icons = {
  logo: (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#c3ff00"/>
      <path d="M8 10h6c3.3 0 6 2.7 6 6s-2.7 6-6 6H8V10z" fill="#0a0f0d" stroke="#0a0f0d" strokeWidth="1.5"/>
      <path d="M18 10h6c3.3 0 6 2.7 6 6s-2.7 6-6 6h-6" fill="none" stroke="#0a0f0d" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  certificate: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  billing: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  home: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

export default function DashboardLayout({ children }) {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [tenantPlan, setTenantPlan] = useState('free');

  useEffect(() => {
    setMounted(true);
    if (!loading && (!user || !token)) {
      router.push('/login');
    }
  }, [user, token, loading, router]);

  useEffect(() => {
    if (!token) return;
    fetch(getApiUrl('/api/tenant/profile'), {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.company_name) setTenantName(data.company_name);
        if (data.plan) setTenantPlan(data.plan);
      })
      .catch(() => {});
  }, [token]);

  if (!mounted || loading || (!user && !loading)) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0f0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c3ff00' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(195, 255, 0, 0.15)', borderTop: '3px solid #c3ff00', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ fontWeight: '700', fontSize: '13px', letterSpacing: '2px', fontFamily: "'DM Sans', sans-serif", color: '#8fb898' }}>CARREGANDO...</div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Visão Geral', path: '/dashboard', icon: Icons.dashboard },
    { name: 'Certificados NFT', path: '/dashboard/certificados', icon: Icons.certificate },
    { name: 'Assinatura', path: '/dashboard/billing', icon: Icons.billing },
    { name: 'Configurações', path: '/dashboard/settings', icon: Icons.settings }
  ];

  const planConfig = {
    enterprise: { color: '#c3ff00', label: 'ENTERPRISE' },
    business: { color: '#8ab800', label: 'BUSINESS' },
    free: { color: '#8fb898', label: 'FREE TRIAL' }
  };
  const plan = planConfig[tenantPlan] || planConfig.free;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0f0d', color: '#e8efe8', fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* ─── SIDEBAR ─── */}
      <aside style={{
        width: '260px',
        background: '#0a0f0d',
        borderRight: '1px solid rgba(195, 255, 0, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 50
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 22px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/assets/logo-icon.png" alt="DoubleDyn" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
          <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px', color: '#e8efe8' }}>DoubleDyn</span>
        </div>

        {/* Tenant Card */}
        <div style={{ padding: '0 14px', marginBottom: '24px' }}>
          <div style={{ background: '#111a14', border: '1px solid rgba(195, 255, 0, 0.08)', borderRadius: '14px', padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#e8efe8', marginBottom: '8px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {tenantName || `Conta #${user?.tenantId}`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                background: `${plan.color}15`, 
                color: plan.color, 
                padding: '3px 10px', 
                borderRadius: '6px', 
                fontSize: '10px', 
                fontWeight: '800',
                letterSpacing: '0.5px'
              }}>
                {plan.label}
              </span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ecc71', boxShadow: '0 0 6px #2ecc71' }} />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#8fb898', padding: '0 14px 10px', letterSpacing: '1.5px', opacity: 0.6 }}>WORKSPACE</div>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(195, 255, 0, 0.06)' : 'transparent',
                  color: isActive ? '#c3ff00' : '#8fb898',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '14px',
                  transition: 'all 0.15s ease',
                  border: isActive ? '1px solid rgba(195, 255, 0, 0.1)' : '1px solid transparent',
                  cursor: 'pointer'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 10px', borderTop: '1px solid rgba(195, 255, 0, 0.04)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '10px 14px', borderRadius: '10px', color: '#8fb898', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s', cursor: 'pointer' }}>
              <span style={{ display: 'flex' }}>{Icons.home}</span> Voltar ao Site
            </div>
          </Link>
          <button onClick={logout} style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'transparent',
            color: '#e74c3c',
            border: 'none',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}>
            <span style={{ display: 'flex' }}>{Icons.logout}</span> Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <main style={{ flex: 1, marginLeft: '260px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '280px', background: 'radial-gradient(ellipse at top right, rgba(195, 255, 0, 0.04), transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
        
        <div style={{ position: 'relative', zIndex: 1, padding: '36px 40px', maxWidth: '1300px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
