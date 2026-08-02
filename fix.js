const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('site/index.html', 'utf8');
const dom = new JSDOM(html);
const body = dom.window.document.body;

// Remove all script tags
Array.from(body.querySelectorAll('script')).forEach(s => s.remove());

// Convert innerHTML to JSX safe strings
let bodyContent = body.innerHTML;

// Fix self-closing tags
const selfClosingTags = ['img', 'input', 'br', 'hr', 'source', 'link', 'meta'];
selfClosingTags.forEach(tag => {
    const regex = new RegExp(`<${tag}([^>]*[^/])>`, 'gi');
    bodyContent = bodyContent.replace(regex, `<${tag}$1 />`);
});

// React attributes
bodyContent = bodyContent.replace(/class=/g, 'className=')
                         .replace(/for=/g, 'htmlFor=')
                         .replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

// Style to object
bodyContent = bodyContent.replace(/style="([^"]*)"/gi, (match, p1) => {
    const styleObj = p1.split(';').filter(Boolean).map(s => {
        let [key, val] = s.split(':');
        if(!key || !val) return '';
        key = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
        return '"' + key + '": "' + val.trim() + '"';
    }).join(', ');
    return 'style={{' + styleObj + '}}';
});

const out = `
'use client';
import { useEffect, useState } from 'react';
import './globals.css';

export default function Home() {
    return (
        <>
            ${bodyContent}
        </>
    );
}
`;

fs.writeFileSync('frontend/app/page.js', out);
console.log('Fixed page.js successfully!');
