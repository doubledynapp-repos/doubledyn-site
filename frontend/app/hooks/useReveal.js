'use client';
import { useEffect, useRef } from 'react';

/**
 * Hook React para substituir o initReveal() do Vanilla JS.
 * Observa elementos com `data-reveal` e adiciona classe `revealed` ao entrar na viewport.
 */
export function useRevealOnScroll() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('[data-reveal]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

/**
 * Hook para animar contadores numéricos de dados que chegam via IntersectionObserver.
 * @param {string} selector - Seletor CSS do container com elementos [data-count]
 */
export function useCounterAnimation(selector) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('[data-count]').forEach((c) => {
              const target = parseInt(c.dataset.count);
              const duration = 2000;
              const start = performance.now();
              function update(now) {
                const p = Math.min((now - start) / duration, 1);
                c.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3)));
                if (p < 1) requestAnimationFrame(update);
              }
              requestAnimationFrame(update);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    const el = selector ? document.querySelector(selector) : null;
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, [selector]);
}
