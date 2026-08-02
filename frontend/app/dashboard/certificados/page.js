'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { getApiUrl } from '../../lib/api';

const accent = '#c3ff00';
const accentDim = '#8ab800';
const bgCard = '#111a14';
const border = 'rgba(195, 255, 0, 0.08)';
const textDim = '#8fb898';
const textMuted = '#5a7a63';

export default function CertificadosPage() {
  const { token } = useAuth();
  const [offsets, setOffsets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(getApiUrl('/api/tenant/offsets'), { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setOffsets(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: textDim }}>Carregando certificados...</div>;
  }

  return (
    <>
      <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#e8efe8', marginBottom: '6px' }}>Certificados NFT</h1>
      <p style={{ color: textMuted, fontSize: '13px', marginBottom: '32px' }}>
        Cada lote de neutralização gera um certificado imutável registrado na Polygon.
      </p>

      {offsets.length === 0 ? (
        <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: '16px', padding: '64px 24px', textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <h3 style={{ color: '#8fb898', fontWeight: '700', marginBottom: '8px', fontSize: '16px' }}>Nenhum certificado</h3>
          <p style={{ color: textMuted, fontSize: '13px' }}>Adquira seu primeiro lote de queima na Visão Geral.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {offsets.map((offset) => (
            <div key={offset.id} style={{
              background: bgCard,
              border: `1px solid ${border}`,
              borderRadius: '16px',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${accent}, ${accentDim})` }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: textMuted, fontWeight: '700', marginBottom: '4px', letterSpacing: '0.5px' }}>LOTE #{offset.id}</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#e8efe8' }}>{offset.tonnes} tCO₂e</div>
                </div>
                <span style={{ background: `${accent}0A`, color: accentDim, padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px' }}>ON-CHAIN</span>
              </div>

              <div style={{ fontSize: '13px', color: textDim, marginBottom: '6px' }}>{offset.description || 'Lote Padrão'}</div>
              <div style={{ fontSize: '12px', color: textMuted, marginBottom: '16px' }}>
                {new Date(offset.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>

              {offset.tx_hash && (
                <div style={{ background: '#0a0f0d', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px', border: `1px solid ${border}` }}>
                  <div style={{ fontSize: '9px', color: textMuted, fontWeight: '700', marginBottom: '4px', letterSpacing: '1px' }}>TX HASH</div>
                  <a href={`https://polygonscan.com/tx/${offset.tx_hash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#6eb5ff', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', textDecoration: 'none', wordBreak: 'break-all' }}>
                    {offset.tx_hash}
                  </a>
                </div>
              )}

              {offset.opensea_url && (
                <a href={offset.opensea_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'block', textAlign: 'center', padding: '10px',
                  background: 'rgba(32, 129, 226, 0.06)', border: '1px solid rgba(32, 129, 226, 0.15)',
                  borderRadius: '10px', color: '#2081E2', fontWeight: '700', fontSize: '13px', textDecoration: 'none'
                }}>
                  Ver no OpenSea ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
