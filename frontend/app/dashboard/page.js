'use client';

import { useState, useMemo, useEffect } from 'react';
import { calculateDQS } from '../lib/dqsEngine';
import { useAuth } from '../lib/auth';
import { getApiUrl } from '../lib/api';

export default function DashboardOverview() {
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState(null);
  const [offsets, setOffsets] = useState([]);
  
  const [showOffsetModal, setShowOffsetModal] = useState(false);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [copiedWidget, setCopiedWidget] = useState(false);
  const [isProcessingOffset, setIsProcessingOffset] = useState(false);
  const [offsetSuccess, setOffsetSuccess] = useState(false);
  const [offsetQtyToBuy, setOffsetQtyToBuy] = useState(50);

  const [emissionsInput, setEmissionsInput] = useState(100);
  const [offsetInput, setOffsetInput] = useState(100);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const [profileRes, offsetsRes] = await Promise.all([
          fetch(getApiUrl('/api/tenant/profile'), { headers: { Authorization: `Bearer ${token}` } }),
          fetch(getApiUrl('/api/tenant/offsets'), { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setTenant(profile);
          setEmissionsInput(profile.emissions_total || 100);
        }
        if (offsetsRes.ok) {
          const offsetsData = await offsetsRes.json();
          setOffsets(offsetsData);
          const totalOffset = offsetsData.reduce((acc, curr) => acc + curr.tonnes, 0);
          setOffsetInput(totalOffset || 100);
        }
      } catch (err) {
        console.error('Erro ao buscar dados', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const dqsResult = useMemo(() => {
    if (!tenant) return null;
    return calculateDQS({
      emissionsTotal: Number(emissionsInput) || 0,
      emissionsScope1: tenant.emissions_scope1 || 0,
      emissionsScope2: tenant.emissions_scope2 || 0,
      emissionsScope3: tenant.emissions_scope3 || 0,
      revenueMillions: tenant.revenue_millions || 0,
      sectorKey: tenant.sector || 'servicos',
      offsetTonnes: Number(offsetInput) || 0,
      hasRenewableEnergy: Boolean(tenant.has_renewable),
      hasESGPolicy: Boolean(tenant.has_esg_policy)
    });
  }, [emissionsInput, offsetInput, tenant]);

  const handlePerformOffset = async () => {
    setIsProcessingOffset(true);
    try {
      const res = await fetch(getApiUrl('/api/tenant/offsets'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tonnes: Number(offsetQtyToBuy), description: 'Lote de Queima Extra (SaaS)' })
      });
      if (res.ok) {
        setOffsetInput(prev => Number(prev) + Number(offsetQtyToBuy));
        setOffsetSuccess(true);
        setTimeout(() => { setOffsetSuccess(false); setShowOffsetModal(false); window.location.reload(); }, 2000);
      }
    } catch (e) { console.error(e); }
    finally { setIsProcessingOffset(false); }
  };

  const handleDownloadPdf = async () => {
    try {
      const res = await fetch(getApiUrl('/api/tenant/report/pdf'), { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `relatorio_sbce_${tenant?.cnpj?.replace(/\D/g, '') || 'empresa'}.pdf`;
        a.click(); window.URL.revokeObjectURL(url);
      }
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '28px', height: '28px', border: '2.5px solid rgba(195,255,0,0.15)', borderTop: '2.5px solid #c3ff00', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: '12px', color: '#8fb898', fontWeight: '600', letterSpacing: '1px' }}>CARREGANDO MÉTRICAS</div>
        </div>
      </div>
    );
  }

  const widgetSnippetCode = `<script src="https://doubledyn.com/widget.js" data-cnpj="${tenant?.cnpj}" data-theme="dark" async></script>`;
  const copyWidgetCode = () => { navigator.clipboard.writeText(widgetSnippetCode); setCopiedWidget(true); setTimeout(() => setCopiedWidget(false), 2000); };

  // Design tokens alinhados com globals.css do site
  const accent = '#c3ff00';
  const accentDim = '#8ab800';
  const bgCard = '#111a14';
  const bgCardHover = '#152018';
  const border = 'rgba(195, 255, 0, 0.08)';
  const textDim = '#8fb898';
  const textMuted = '#5a7a63';

  const sealColors = {
    'Ouro': { color: '#c3ff00', bg: 'rgba(195,255,0,0.06)', gradient: 'linear-gradient(135deg, #8ab800, #c3ff00)' },
    'Prata': { color: '#bdc3c7', bg: 'rgba(189,195,199,0.06)', gradient: 'linear-gradient(135deg, #7f8c8d, #bdc3c7)' },
    'Bronze': { color: '#cd7f32', bg: 'rgba(205,127,50,0.06)', gradient: 'linear-gradient(135deg, #b87333, #e5a067)' }
  };
  const sealStyle = sealColors[dqsResult?.seal.level] || sealColors['Bronze'];

  const btnPrimary = { backgroundColor: accent, color: '#0a0f0d', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' };
  const btnSecondary = { backgroundColor: 'transparent', color: textDim, border: `1px solid ${border}`, padding: '10px 16px', borderRadius: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' };
  const btnAccentOutline = { backgroundColor: `${accent}08`, color: accent, border: `1px solid rgba(195,255,0,0.15)`, padding: '10px 16px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' };

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', margin: 0, color: '#e8efe8', fontFamily: "'DM Sans', sans-serif" }}>
              {tenant?.company_name}
            </h1>
            <span style={{ 
              backgroundColor: `${accent}12`, 
              color: accent, 
              padding: '3px 12px', 
              borderRadius: '6px', 
              fontSize: '10px', 
              fontWeight: '800',
              letterSpacing: '0.5px',
              border: `1px solid rgba(195,255,0,0.12)`
            }}>
              {tenant?.plan?.toUpperCase() || 'FREE'}
            </span>
          </div>
          <p style={{ margin: 0, color: textMuted, fontSize: '13px' }}>
            CNPJ {tenant?.cnpj} · Gestão de Emissões & Neutralização On-Chain
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={handleDownloadPdf} style={btnSecondary}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Relatório PDF
            </span>
          </button>
          <button onClick={() => setShowWidgetModal(true)} style={btnAccentOutline}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              Widget HTML
            </span>
          </button>
          <button onClick={() => setShowOffsetModal(true)} style={btnPrimary}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nova Queima
            </span>
          </button>
        </div>
      </div>

      {/* DQS Score Hero */}
      <div style={{
        background: bgCard,
        border: `1px solid ${border}`,
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '20px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: sealStyle.color, letterSpacing: '2px', marginBottom: '12px' }}>
            DOUBLEDYN QUALITY SCORE
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '72px', fontWeight: '900', color: sealStyle.color, lineHeight: 1, letterSpacing: '-4px', fontFamily: "'DM Sans', sans-serif" }}>
              {dqsResult?.dqsScore || 0}
            </span>
            <span style={{ fontSize: '18px', color: textMuted, fontWeight: '500' }}>/ 1000</span>
          </div>
          <div style={{ height: '4px', backgroundColor: 'rgba(195,255,0,0.06)', borderRadius: '2px', overflow: 'hidden', marginBottom: '16px', maxWidth: '280px' }}>
            <div style={{ height: '100%', width: `${(dqsResult?.dqsScore / 1000) * 100}%`, background: sealStyle.gradient, borderRadius: '2px', transition: 'width 0.8s ease' }} />
          </div>
          <span style={{
            display: 'inline-block',
            background: sealStyle.bg,
            color: sealStyle.color,
            border: `1px solid ${sealStyle.color}25`,
            padding: '5px 14px',
            borderRadius: '6px',
            fontWeight: '800',
            fontSize: '11px',
            letterSpacing: '1px'
          }}>
            SELO {dqsResult?.seal.level.toUpperCase()}
          </span>
        </div>
        <div>
          <p style={{ fontSize: '14px', color: '#8fb898', lineHeight: '1.7', margin: '0 0 20px' }}>
            {dqsResult?.seal.description}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {[
              { label: 'INTENSIDADE', value: dqsResult?.breakdown.intensityScore },
              { label: 'GESTÃO', value: dqsResult?.breakdown.managementScore },
              { label: 'OFFSET', value: dqsResult?.breakdown.offsetScore }
            ].map(item => (
              <div key={item.label} style={{ background: '#0a0f0d', padding: '12px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${border}` }}>
                <div style={{ fontSize: '9px', color: textMuted, fontWeight: '700', marginBottom: '4px', letterSpacing: '0.5px' }}>{item.label}</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#e8efe8' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          {
            label: 'EMISSÕES TOTAIS',
            value: `${emissionsInput}`,
            unit: 'tCO₂e',
            badge: dqsResult?.emissions.offsetPercentage >= 100 ? { text: 'NEUTRALIZADO', color: '#2ecc71' } : { text: `${dqsResult?.emissions.offsetPercentage}% OFFSET`, color: '#f39c12' },
            sub: `E1: ${dqsResult?.emissions.scope1}t · E2: ${dqsResult?.emissions.scope2}t · E3: ${dqsResult?.emissions.scope3}t`
          },
          {
            label: 'PASSIVO AMBIENTAL',
            value: `R$ ${dqsResult?.financial.remainingLiabilityBRL.toLocaleString('pt-BR')}`,
            unit: '',
            badge: dqsResult?.financial.remainingLiabilityBRL === 0 ? { text: 'QUITADO', color: '#2ecc71' } : { text: 'PENDENTE', color: '#e74c3c' },
            sub: `Risco: ${dqsResult?.sbceRisk.level}`
          },
          {
            label: 'CERTIFICADOS NFT',
            value: `${offsets.length}`,
            unit: 'lotes',
            badge: { text: 'POLYGON', color: '#8247e5' },
            sub: `Compensado: ${dqsResult?.emissions.offsetTonnes} tCO₂e`
          },
          {
            label: 'BENCHMARK SETOR',
            value: `${dqsResult?.sectorAvgDQS}`,
            unit: 'pts avg',
            badge: { text: dqsResult?.dqsScore >= dqsResult?.sectorAvgDQS ? 'ACIMA' : 'ABAIXO', color: dqsResult?.dqsScore >= dqsResult?.sectorAvgDQS ? '#2ecc71' : '#f39c12' },
            sub: dqsResult?.sector
          }
        ].map((card, i) => (
          <div key={i} style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: '14px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '10px', color: textMuted, fontWeight: '700', letterSpacing: '0.5px' }}>{card.label}</span>
              <span style={{ fontSize: '10px', color: card.badge.color, fontWeight: '800', background: `${card.badge.color}12`, padding: '2px 8px', borderRadius: '4px' }}>{card.badge.text}</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#e8efe8', letterSpacing: '-1px', lineHeight: 1.1 }}>
              {card.value} {card.unit && <span style={{ fontSize: '12px', color: textMuted, fontWeight: '500' }}>{card.unit}</span>}
            </div>
            <div style={{ marginTop: '12px', fontSize: '11px', color: textMuted }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabela Certificados */}
      <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#e8efe8', margin: 0 }}>Histórico de Neutralização</h3>
            <p style={{ fontSize: '12px', color: textMuted, margin: '4px 0 0' }}>Registros imutáveis na blockchain Polygon</p>
          </div>
          <span style={{ fontSize: '10px', color: accent, background: `${accent}0A`, padding: '4px 10px', borderRadius: '6px', fontWeight: '800', letterSpacing: '0.5px' }}>
            {offsets.length} LOTES
          </span>
        </div>

        {offsets.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: textMuted }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#5a7a63" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Nenhum certificado registrado. Adquira seu primeiro lote.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {['DATA', 'DESCRIÇÃO', 'VOLUME', 'TX HASH', 'VERIFICAÇÃO'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', color: textMuted, fontWeight: '700', fontSize: '10px', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {offsets.map((offset) => (
                  <tr key={offset.id} style={{ borderBottom: `1px solid rgba(195,255,0,0.03)` }}>
                    <td style={{ padding: '14px 12px', color: '#8fb898' }}>{new Date(offset.created_at).toLocaleDateString('pt-BR')}</td>
                    <td style={{ padding: '14px 12px', fontWeight: '600', color: '#e8efe8' }}>{offset.description || `Lote #${offset.id}`}</td>
                    <td style={{ padding: '14px 12px', color: accent, fontWeight: '800' }}>{offset.tonnes} tCO₂e</td>
                    <td style={{ padding: '14px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>
                      {offset.tx_hash ? (
                        <a href={`https://polygonscan.com/tx/${offset.tx_hash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#6eb5ff', textDecoration: 'none' }}>
                          {offset.tx_hash.substring(0, 14)}…
                        </a>
                      ) : <span style={{ color: textMuted }}>Processando…</span>}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      {offset.opensea_url ? (
                        <a href={offset.opensea_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2081E2', fontWeight: '700', textDecoration: 'none', fontSize: '12px' }}>OpenSea ↗</a>
                      ) : (
                        <span style={{ background: `${accent}0A`, color: accentDim, padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>ON-CHAIN</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── MODAIS ─── */}

      {/* Modal Offset */}
      {showOffsetModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10,15,13,0.9)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200, padding: '20px' }}>
          <div style={{ background: '#111a14', border: `1px solid rgba(195,255,0,0.15)`, borderRadius: '20px', padding: '32px', maxWidth: '440px', width: '100%', color: '#e8efe8' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 6px' }}>Nova Queima Adicional</h3>
            <p style={{ fontSize: '13px', color: textDim, margin: '0 0 24px' }}>
              Desconto de {tenant?.plan === 'enterprise' ? '25%' : '15%'} — Plano {tenant?.plan === 'enterprise' ? 'Enterprise' : 'Business'}.
            </p>

            {offsetSuccess ? (
              <div style={{ padding: '28px', background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: '14px', textAlign: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2.5" strokeLinecap="round" style={{ margin: '0 auto 10px', display: 'block' }}><polyline points="20 6 9 17 4 12"/></svg>
                <h4 style={{ margin: '0 0 4px', color: '#2ecc71', fontSize: '16px', fontWeight: '800' }}>Queima Executada!</h4>
                <p style={{ fontSize: '12px', color: textDim, margin: 0 }}>+{offsetQtyToBuy} tCO₂e neutralizadas na Polygon.</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: textMuted, marginBottom: '8px', letterSpacing: '1px' }}>TONELADAS (tCO₂e)</label>
                  <input type="number" value={offsetQtyToBuy} onChange={(e) => setOffsetQtyToBuy(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '10px', background: '#0a0f0d', border: `1px solid ${border}`, color: '#e8efe8', fontSize: '22px', fontWeight: '800', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
                <div style={{ background: '#0a0f0d', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '13px', border: `1px solid ${border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: textDim }}>
                    <span>Preço avulso:</span>
                    <span style={{ textDecoration: 'line-through', color: textMuted }}>R$ 65,00/ton</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#e8efe8' }}>
                    <span>Com desconto:</span>
                    <span style={{ color: accent, fontWeight: '800' }}>R$ {tenant?.plan === 'enterprise' ? '48,00' : '55,00'}/ton</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', borderTop: `1px solid ${border}`, paddingTop: '10px', color: accent, fontSize: '16px' }}>
                    <span>Total:</span>
                    <span>R$ {(offsetQtyToBuy * (tenant?.plan === 'enterprise' ? 48 : 55)).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowOffsetModal(false)} style={{ ...btnSecondary, flex: 1, padding: '14px' }}>Cancelar</button>
                  <button onClick={handlePerformOffset} disabled={isProcessingOffset} style={{ ...btnPrimary, flex: 2, padding: '14px', fontSize: '15px' }}>
                    {isProcessingOffset ? 'Processando…' : 'Confirmar Queima'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Widget */}
      {showWidgetModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10,15,13,0.9)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200, padding: '20px' }}>
          <div style={{ background: '#111a14', border: `1px solid ${border}`, borderRadius: '20px', padding: '32px', maxWidth: '520px', width: '100%', color: '#e8efe8' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 6px' }}>Embed Widget Selo</h3>
            <p style={{ fontSize: '13px', color: textDim, margin: '0 0 20px' }}>
              Cole este código no site da sua empresa para exibir o Selo DQS.
            </p>
            <div style={{ background: '#0a0f0d', border: `1px solid rgba(195,255,0,0.1)`, padding: '16px', borderRadius: '10px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: accent, wordBreak: 'break-all', marginBottom: '20px', lineHeight: '1.6' }}>
              {widgetSnippetCode}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowWidgetModal(false)} style={{ ...btnSecondary, flex: 1, padding: '14px' }}>Fechar</button>
              <button onClick={copyWidgetCode} style={{ ...btnPrimary, flex: 2, padding: '14px' }}>
                {copiedWidget ? '✓ Copiado' : 'Copiar Código'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
