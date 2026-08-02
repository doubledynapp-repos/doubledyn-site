'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { getApiUrl } from '../lib/api';
import Navbar from '../components/sections/Navbar';

export default function Register() {
    const [cnpj, setCnpj] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const router = useRouter();
    const { login } = useAuth();

    // Pré-preenchimento vindo da calculadora (fluxo product-led)
    useEffect(() => {
        try {
            const raw = localStorage.getItem('doubledyn_calc');
            if (raw) {
                const d = JSON.parse(raw);
                if (d.cnpj) setCnpj(d.cnpj);
                if (d.empresa) setCompanyName(d.empresa);
                if (d.emailContato) setEmail(d.emailContato);
            }
        } catch (e) {
            console.warn('Erro ao ler dados da calculadora', e);
        }
    }, []);

    const handleCnpjBlur = async () => {
        const cleanCnpj = cnpj.replace(/\D/g, '');
        if (cleanCnpj.length === 14) {
            try {
                const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.razao_social) {
                        setCompanyName(data.razao_social);
                    }
                }
            } catch (e) {
                console.error('Erro ao buscar CNPJ', e);
            }
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(getApiUrl('/api/auth/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cnpj, companyName, email, password })
            });
            const data = await res.json();
            
            if (data.success && data.token) {
                login(data.token);
                router.push('/dashboard');
            } else {
                setError(data.error || 'Erro ao realizar cadastro.');
            }
        } catch (err) {
            setError('Falha de conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#091410', color: '#ecfdf5', fontFamily: "'DM Sans', sans-serif" }}>
            <Navbar />
            <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '120px 24px 60px', minHeight: '80vh' }}>
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(195, 255, 0, 0.2)',
                    borderRadius: '24px',
                    padding: '40px',
                    maxWidth: '460px',
                    width: '100%',
                    backdropFilter: 'blur(10px)'
                }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', textAlign: 'center' }}>Crie sua Conta</h1>
                    <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>Comece a compensar suas emissões on-chain</p>
                    
                    {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', border: '1px solid #ef4444' }}>{error}</div>}
                    
                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>CNPJ (Somente Números)</label>
                            <input 
                                type="text" 
                                value={cnpj}
                                onChange={(e) => setCnpj(e.target.value)}
                                onBlur={handleCnpjBlur}
                                required
                                maxLength={14}
                                style={{ width: '100%', padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>RAZÃO SOCIAL</label>
                            <input 
                                type="text" 
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                required
                                style={{ width: '100%', padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>E-MAIL DO RESPONSÁVEL</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ width: '100%', padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>SENHA SEGURA</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                style={{ width: '100%', padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={loading}
                            style={{ 
                                marginTop: '16px', 
                                padding: '16px', 
                                background: '#c3ff00', 
                                color: '#0A0F0D', 
                                border: 'none', 
                                borderRadius: '10px', 
                                fontWeight: '800', 
                                fontSize: '15px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Criando conta...' : 'Cadastrar Empresa'}
                        </button>
                    </form>
                    
                    <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
                        Já possui conta? <a href="/login" style={{ color: '#c3ff00', textDecoration: 'underline' }}>Fazer Login</a>
                    </div>
                </div>
            </main>
        </div>
    );
}
