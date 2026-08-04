'use client';
import { useState } from 'react';

export default function AdminDashboard() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // Auth form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            // 1. Autentica e pega o JWT
            const loginRes = await fetch(process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/login` : '/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const loginData = await loginRes.json();
            
            if (!loginRes.ok) {
                throw new Error(loginData.error || 'Credenciais inválidas');
            }
            
            const jwtToken = loginData.token;

            // 2. Busca os leads com o Bearer token
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/leads` : '/api/leads', {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            
            if (!res.ok) {
                if (res.status === 401) throw new Error('Sessão expirada. Faça login novamente.');
                throw new Error('Erro ao buscar leads do servidor');
            }
            
            const data = await res.json();
            setLeads(data);
            setIsAuthenticated(true);
            
            // Opcional: salva o token para carregar a página sem login dnv
            localStorage.setItem('admin_token', jwtToken);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'sans-serif' }}>
                <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                    <h2 style={{ color: '#0F2B20', borderBottom: '2px solid #5DD98C', paddingBottom: '10px', marginBottom: '20px', textAlign: 'center' }}>DoubleDyn Admin</h2>
                    {error && <div style={{ backgroundColor: '#f8d7da', color: '#842029', padding: '10px', borderRadius: '4px', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>Usuário</label>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>Senha</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                        </div>
                        <button type="submit" disabled={loading} style={{ backgroundColor: '#5DD98C', color: '#0F2B20', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px' }}>
                            {loading ? 'Autenticando...' : 'Acessar Central'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #5DD98C', paddingBottom: '10px' }}>
                <h1 style={{ color: '#0F2B20', margin: 0 }}>DoubleDyn - Central de Leads B2B</h1>
                <button onClick={() => { setIsAuthenticated(false); setLeads([]); setPassword(''); }} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Sair</button>
            </div>
            
            <div style={{ marginTop: '30px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#0F2B20', color: '#fff', textAlign: 'left' }}>
                            <th style={{ padding: '15px' }}>Data</th>
                            <th style={{ padding: '15px' }}>Empresa</th>
                            <th style={{ padding: '15px' }}>Email / Tel</th>
                            <th style={{ padding: '15px' }}>Selo DQS</th>
                            <th style={{ padding: '15px' }}>Emissões</th>
                            <th style={{ padding: '15px' }}>Custo Est.</th>
                            <th style={{ padding: '15px' }}>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map((lead) => (
                            <tr key={lead.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '15px' }}>{new Date(lead.created_at).toLocaleDateString('pt-BR')}</td>
                                <td style={{ padding: '15px', fontWeight: 'bold' }}>{lead.company_name}</td>
                                <td style={{ padding: '15px' }}>{lead.email}<br/><small>{lead.phone}</small></td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                                        backgroundColor: lead.pcr_seal === 'Ouro' ? '#f1c40f' : lead.pcr_seal === 'Prata' ? '#bdc3c7' : '#cd7f32',
                                        color: '#111'
                                    }}>
                                        {lead.pcr_seal || 'N/A'} ({lead.dqs_score || 0})
                                    </span>
                                </td>
                                <td style={{ padding: '15px', color: '#dc3545' }}>{lead.emissions} t</td>
                                <td style={{ padding: '15px', color: '#198754' }}>R$ {lead.estimated_cost}</td>
                                <td style={{ padding: '15px' }}>
                                    <a href={`/admin/report/${lead.id}`} target="_blank" style={{
                                        backgroundColor: '#5DD98C', color: '#0F2B20', padding: '6px 12px', 
                                        borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem'
                                    }}>📄 Relatório</a>
                                </td>
                            </tr>
                        ))}
                        {leads.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#666' }}>Nenhum lead captado ainda.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
