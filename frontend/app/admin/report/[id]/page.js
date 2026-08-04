'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ReportPage() {
    const params = useParams();
    const id = params.id;
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLead = async () => {
            try {
                const token = localStorage.getItem('admin_token');
                if (!token) throw new Error('Acesso negado. Faça login no painel admin.');

                const res = await fetch(process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/leads/${id}` : `/api/leads/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Não autorizado ou lead não encontrado');
                const data = await res.json();
                setLead(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchLead();
    }, [id]);

    if (loading) return <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>Carregando relatório...</div>;
    if (!lead) return <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>Lead não encontrado.</div>;

    const dataReport = new Date(lead.created_at).toLocaleDateString('pt-BR');
    
    let sealColor = '#cd7f32'; // bronze
    if (lead.pcr_seal === 'Ouro') sealColor = '#f1c40f';
    else if (lead.pcr_seal === 'Prata') sealColor = '#bdc3c7';

    return (
        <div className="report-container">
            <style jsx global>{`
                body { background-color: #f4f4f4; margin: 0; padding: 0; }
                .report-container { max-width: 21cm; margin: 20px auto; background: white; min-height: 29.7cm; padding: 2cm; box-shadow: 0 0 10px rgba(0,0,0,0.1); font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; }
                .report-header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #0F2B20; padding-bottom: 20px; margin-bottom: 30px; }
                .logo-text { font-size: 24px; font-weight: 800; color: #0F2B20; }
                .logo-accent { color: #5DD98C; }
                .report-meta { text-align: right; font-size: 12px; color: #666; }
                
                .report-title { text-align: center; font-size: 28px; font-weight: bold; margin-bottom: 40px; color: #0F2B20; }
                
                .section { margin-bottom: 40px; }
                .section-title { font-size: 18px; color: #0F2B20; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
                
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .info-box { background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #5DD98C; }
                .info-label { font-size: 11px; text-transform: uppercase; color: #777; margin-bottom: 5px; }
                .info-value { font-size: 18px; font-weight: bold; color: #111; }
                
                .highlight-box { background: #0F2B20; color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 40px 0; display: flex; align-items: center; justify-content: space-around; }
                .hl-item { text-align: center; }
                .hl-value { font-size: 32px; font-weight: 800; color: #5DD98C; margin-bottom: 5px; }
                .hl-label { font-size: 14px; opacity: 0.9; }
                
                .seal-box { border: 2px dashed ${sealColor}; padding: 20px; text-align: center; border-radius: 12px; margin-bottom: 40px; }
                .seal-badge { display: inline-block; background: ${sealColor}; color: #111; padding: 8px 16px; border-radius: 30px; font-weight: bold; margin-bottom: 10px; font-size: 18px; text-transform: uppercase; letter-spacing: 2px;}
                
                .footer { margin-top: 80px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
                .signature-line { width: 250px; border-bottom: 1px solid #333; margin: 40px auto 10px; }

                .btn-print { display: block; width: 200px; margin: 20px auto; padding: 15px; background: #5DD98C; color: #0F2B20; font-weight: bold; text-align: center; border-radius: 8px; cursor: pointer; border: none; font-size: 16px; }

                @media print {
                    body { background: white; }
                    .report-container { box-shadow: none; margin: 0; padding: 0; width: 100%; max-width: 100%; min-height: auto; }
                    .btn-print { display: none !important; }
                    @page { size: A4; margin: 2cm; }
                }
            `}</style>

            <button className="btn-print" onClick={() => window.print()}>🖨️ Imprimir PDF</button>

            <div className="report-header">
                <div className="logo-text">Double<span className="logo-accent">Dyn</span></div>
                <div className="report-meta">
                    <strong>Relatório Oficial de Diagnóstico</strong><br/>
                    ID: #{lead.id.toString().padStart(6, '0')}<br/>
                    Data: {dataReport}
                </div>
            </div>

            <h1 className="report-title">Inventário Preliminar de Emissões</h1>

            <div className="section">
                <h2 className="section-title">1. Dados da Empresa</h2>
                <div className="info-grid">
                    <div className="info-box">
                        <div className="info-label">Razão Social / Nome</div>
                        <div className="info-value">{lead.company_name}</div>
                    </div>
                    <div className="info-box">
                        <div className="info-label">Contato</div>
                        <div className="info-value">{lead.email}</div>
                    </div>
                </div>
            </div>

            <div className="highlight-box">
                <div className="hl-item">
                    <div className="hl-value">{lead.emissions} t</div>
                    <div className="hl-label">Emissões Totais (CO₂e/ano)</div>
                </div>
                <div className="hl-item">
                    <div className="hl-value">R$ {lead.estimated_cost}</div>
                    <div className="hl-label">Passivo Ambiental Estimado</div>
                </div>
            </div>

            <div className="section">
                <h2 className="section-title">2. DoubleDyn Quality Score (DQS)</h2>
                <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '20px' }}>
                    O DQS é o rating proprietário da DoubleDyn que mede a eficiência carbônica da empresa comparando sua 
                    intensidade de emissão com a média oficial do seu setor de atuação.
                </p>
                <div className="seal-box">
                    <div className="seal-badge">Selo {lead.pcr_seal || 'Bronze'}</div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: sealColor }}>{lead.dqs_score || 0} <span style={{ fontSize: '18px', color: '#999' }}>/1000</span></div>
                    <p style={{ marginTop: '15px', color: '#666', fontSize: '14px' }}>
                        {lead.pcr_seal === 'Ouro' ? 'A empresa demonstra altíssima eficiência, emitindo significativamente menos que a média do seu setor.' : 
                         lead.pcr_seal === 'Prata' ? 'A empresa está dentro da média nacional do seu setor, com oportunidades de melhoria contínua.' : 
                         'A empresa apresenta intensidade de emissões superior à média do seu setor, exigindo um plano de ação imediato.'}
                    </p>
                </div>
            </div>

            <div className="section">
                <h2 className="section-title">3. Próximos Passos (PCR)</h2>
                <ul style={{ lineHeight: '1.8', color: '#444' }}>
                    <li><strong>Auditoria Completa:</strong> Realizar inventário GHG Protocol Escopos 1, 2 e 3.</li>
                    <li><strong>Registro Legal:</strong> Adequação antecipada à Lei SBCE (15.042/2024).</li>
                    <li><strong>Certificação:</strong> Emissão do Selo PCR Oficial pós-compensação de passivos.</li>
                </ul>
            </div>

            <div className="footer">
                <div className="signature-line"></div>
                <strong>DoubleDyn ESG Solutions</strong><br/>
                Relatório gerado digitalmente. Não requer assinatura física.<br/>
                www.doubledyn.com
            </div>
        </div>
    );
}
