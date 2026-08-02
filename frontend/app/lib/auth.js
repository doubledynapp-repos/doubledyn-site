'use client';

import { useState, useEffect } from 'react';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Only run on client side
        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem('doubledyn_token');
            if (storedToken) {
                setToken(storedToken);
                try {
                    // Simples parse do JWT payload sem biblioteca pesada no client
                    const payload = JSON.parse(atob(storedToken.split('.')[1]));
                    setUser(payload);
                } catch (e) {
                    console.error('Invalid token format');
                    localStorage.removeItem('doubledyn_token');
                }
            }
            setLoading(false);
        }
    }, []);

    const login = (newToken) => {
        localStorage.setItem('doubledyn_token', newToken);
        setToken(newToken);
        try {
            const payload = JSON.parse(atob(newToken.split('.')[1]));
            setUser(payload);
        } catch (e) {
            console.error('Invalid token format');
        }
    };

    const logout = () => {
        localStorage.removeItem('doubledyn_token');
        setToken(null);
        setUser(null);
        window.location.href = '/login';
    };

    return { user, token, loading, login, logout };
}
