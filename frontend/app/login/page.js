'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { getApiUrl } from '../lib/api';
import Navbar from '../components/sections/Navbar';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const router = useRouter();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(getApiUrl('/api/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if (data.success && data.token) {
                login(data.token);
                router.push('/dashboard');
            } else {
                setError(data.error || 'Erro ao realizar login.');
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
                    border: '1px solid rgba(93, 217, 140, 0.2)',
                    borderRadius: '24px',
                    padding: '40px',
                    maxWidth: '400px',
                    width: '100%',
                    backdropFilter: 'blur(10px)'
                }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', textAlign: 'center' }}>Portal B2B</h1>
                    <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>Acesse seu dashboard de emissões</p>
                    
                    {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', border: '1px solid #ef4444' }}>{error}</div>}
                    
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>E-MAIL CORPORATIVO</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ width: '100%', padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>SENHA</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
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
                            {loading ? 'Entrando...' : 'Entrar no Dashboard'}
                        </button>
                    </form>
                    
                    <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
                        Não possui conta? <a href="/register" style={{ color: '#c3ff00', textDecoration: 'underline' }}>Cadastre-se</a>
                    </div>
                    <div style={{ marginTop: '18px', paddingTop: '18px', borderTop: '1px solid rgba(195,255,0,0.15)', textAlign: 'center', fontSize: '13px', color: '#cbd5e1' }}>
                        Quer levar sua empresa para o próximo nível?<br />
                        <a href="/register" style={{ display: 'inline-block', marginTop: '8px', color: '#c3ff00', fontWeight: '800', textDecoration: 'none' }}>Assinar DoubleDyn Enterprise →</a>
                    </div>
                </div>
            </main>
        </div>
    );
}
