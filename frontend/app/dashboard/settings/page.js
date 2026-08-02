'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { getApiUrl } from '../../lib/api';

const accent = '#c3ff00';
const bgCard = '#111a14';
const border = 'rgba(195, 255, 0, 0.08)';
const textDim = '#8fb898';
const textMuted = '#5a7a63';

const SECTORS = [
  { key: 'agro', label: 'Agronegócio & Pecuária' },
  { key: 'mineracao', label: 'Mineração & Siderurgia' },
  { key: 'industria', label: 'Indústria & Manufatura' },
  { key: 'logistica', label: 'Transporte & Logística' },
  { key: 'construcao', label: 'Construção Civil' },
  { key: 'servicos', label: 'Serviços & Tecnologia' },
  { key: 'comercio', label: 'Comércio & Varejo' },
  { key: 'outros', label: 'Outros' }
];

export default function SettingsPage() {
  const { token } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    emissions_total: 0, emissions_scope1: 0, emissions_scope2: 0, emissions_scope3: 0,
    sector: 'servicos', revenue_millions: 0, has_renewable: false, has_esg_policy: false
  });

  useEffect(() => {
    if (!token) return;
    fetch(getApiUrl('/api/tenant/profile'), { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setTenant(data);
        setForm({
          emissions_total: data.emissions_total || 0, emissions_scope1: data.emissions_scope1 || 0,
          emissions_scope2: data.emissions_scope2 || 0, emissions_scope3: data.emissions_scope3 || 0,
          sector: data.sector || 'servicos', revenue_millions: data.revenue_millions || 0,
          has_renewable: Boolean(data.has_renewable), has_esg_policy: Boolean(data.has_esg_policy)
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    try {
      const res = await fetch(getApiUrl('/api/tenant/emissions'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, has_renewable: form.has_renewable ? 1 : 0, has_esg_policy: form.has_esg_policy ? 1 : 0 })
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: textDim }}>Carregando...</div>;

  const inputStyle = {
    width: '100%', padding: '14px', borderRadius: '10px', background: '#0a0f0d', border: `1px solid ${border}`,
    color: '#e8efe8', fontSize: '15px', fontWeight: '600', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border 0.2s'
  };
  const labelStyle = { display: 'block', fontSize: '10px', fontWeight: '700', color: textMuted, marginBottom: '8px', letterSpacing: '1px' };

  return (
    <>
      <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#e8efe8', marginBottom: '6px' }}>Configurações</h1>
      <p style={{ color: textMuted, fontSize: '13px', marginBottom: '32px' }}>Atualize os dados de emissões e perfil ESG da sua empresa.</p>

      {/* Dados da Empresa */}
      <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#e8efe8', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Dados da Empresa
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>RAZÃO SOCIAL</label>
            <input type="text" value={tenant?.company_name || ''} disabled style={{ ...inputStyle, opacity: 0.4, cursor: 'not-allowed' }} />
          </div>
          <div>
            <label style={labelStyle}>CNPJ</label>
            <input type="text" value={tenant?.cnpj || ''} disabled style={{ ...inputStyle, opacity: 0.4, cursor: 'not-allowed' }} />
          </div>
          <div>
            <label style={labelStyle}>SETOR DE ATIVIDADE</label>
            <select value={form.sector} onChange={(e) => setForm(f => ({ ...f, sector: e.target.value }))} style={{ ...inputStyle, appearance: 'none' }}>
              {SECTORS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>FATURAMENTO ANUAL (R$ MILHÕES)</label>
            <input type="number" step="0.1" value={form.revenue_millions} onChange={(e) => setForm(f => ({ ...f, revenue_millions: Number(e.target.value) }))} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Emissões */}
      <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#e8efe8', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Emissões GHG (tCO₂e/ano)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>EMISSÕES TOTAIS</label>
            <input type="number" value={form.emissions_total} onChange={(e) => setForm(f => ({ ...f, emissions_total: Number(e.target.value) }))} style={{ ...inputStyle, fontSize: '22px', fontWeight: '800' }} />
          </div>
          <div>
            <label style={labelStyle}>ESCOPO 1 (DIRETAS)</label>
            <input type="number" value={form.emissions_scope1} onChange={(e) => setForm(f => ({ ...f, emissions_scope1: Number(e.target.value) }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>ESCOPO 2 (ENERGIA)</label>
            <input type="number" value={form.emissions_scope2} onChange={(e) => setForm(f => ({ ...f, emissions_scope2: Number(e.target.value) }))} style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>ESCOPO 3 (CADEIA)</label>
            <input type="number" value={form.emissions_scope3} onChange={(e) => setForm(f => ({ ...f, emissions_scope3: Number(e.target.value) }))} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Boas Práticas */}
      <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: '16px', padding: '28px', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#e8efe8', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Boas Práticas ESG
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { key: 'has_renewable', label: 'Energia Renovável', desc: 'Utiliza solar, eólica ou outra fonte renovável (+50 pts DQS)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> },
            { key: 'has_esg_policy', label: 'Política ESG Formalizada', desc: 'Inventário de emissões estruturado ou política ESG (+50 pts DQS)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> }
          ].map(item => (
            <label key={item.key} style={{ 
              display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', padding: '16px',
              background: form[item.key] ? `${accent}06` : 'transparent',
              border: form[item.key] ? `1px solid ${accent}18` : `1px solid ${border}`,
              borderRadius: '12px', transition: 'all 0.15s'
            }}>
              <input type="checkbox" checked={form[item.key]} onChange={(e) => setForm(f => ({ ...f, [item.key]: e.target.checked }))} style={{ width: '18px', height: '18px', accentColor: accent }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {item.icon}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#e8efe8' }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: textMuted }}>{item.desc}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Salvar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={handleSave} disabled={saving} style={{
          padding: '14px 32px', background: accent, color: '#0a0f0d', border: 'none', borderRadius: '10px',
          fontWeight: '900', fontSize: '15px', cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.7 : 1, fontFamily: 'inherit', transition: 'all 0.2s'
        }}>
          {saving ? 'Salvando…' : 'Salvar Alterações'}
        </button>
        {saved && <span style={{ color: '#2ecc71', fontWeight: '700', fontSize: '14px' }}>✓ Dados atualizados</span>}
      </div>
    </>
  );
}
