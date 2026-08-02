const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve(__dirname, 'site', 'index.html');
const jsxPath = path.resolve(__dirname, 'frontend', 'app', 'page.jsx');

let html = fs.readFileSync(htmlPath, 'utf-8');

// Extract body inner content
const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
if (!bodyMatch) {
    console.error("Could not find body tag");
    process.exit(1);
}
let bodyContent = bodyMatch[1];

// Convert HTML to JSX
let jsx = bodyContent.replace(/<script>[\s\S]*?<\/script>/gi, '')
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}')
    .replace(/<img([^>]*[^/])>/g, '<img$1 />')
    .replace(/<br>/g, '<br />')
    .replace(/<hr>/g, '<hr />')
    .replace(/<input([^>]*[^/])>/g, '<input$1 />')
    .replace(/style="([^"]*)"/g, (match, p1) => {
        const styleObj = p1.split(';').filter(Boolean).map(s => {
            let [key, val] = s.split(':');
            if(!key || !val) return '';
            key = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
            val = val.trim();
            return `"${key}": "${val}"`;
        }).filter(Boolean).join(', ');
        return `style={{ ${styleObj} }}`;
    });

// Wrap in component
const componentCode = `
'use client';
import { useEffect, useState } from 'react';
import './globals.css';

export default function Home() {
    
    // Form States
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const handleLeadSubmit = async (e, emissions, cost) => {
        e.preventDefault();
        try {
            const res = await fetch('http://179.197.65.206:3001/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company_name: companyName,
                    email: email,
                    phone: phone,
                    emissions: emissions,
                    estimated_cost: cost
                })
            });
            if(res.ok) {
                alert('Lead enviado com sucesso! Nossa equipe entrará em contato.');
            }
        } catch(err) {
            console.error(err);
        }
    };

    return (
        <>
            ${jsx}
        </>
    );
}
`;

fs.writeFileSync(jsxPath, componentCode, 'utf-8');
console.log("page.jsx generated successfully!");
