// ===== Rastreio leve (client-side) — funil medível sem backend =====
// Eventos ficam em localStorage ('doubledyn_events') + console.debug.
// Quando a Fase 0 (API como fonte única) estiver no ar, o mesmo formato
// de evento é enviado ao endpoint — nada aqui depende de servidor.
const EVENTS_KEY = 'doubledyn_events';
const UTM_KEY = 'doubledyn_utm';

// Captura parâmetros UTM/ref da URL de entrada (uma vez por sessão)
export function initTracking() {
  try {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(UTM_KEY)) return;
    const p = new URLSearchParams(window.location.search);
    const utm = {};
    ['source', 'medium', 'campaign', 'content', 'term'].forEach((k) => {
      const v = p.get('utm_' + k);
      if (v) utm[k] = v;
    });
    const ref = p.get('ref');
    if (Object.keys(utm).length || ref) {
      if (ref) utm.ref = ref;
      utm.ts = Date.now();
      localStorage.setItem(UTM_KEY, JSON.stringify(utm));
    }
  } catch (e) { /* localStorage indisponível — segue sem rastreio */ }
}

// Registra um evento do funil (máx. 500 por navegador)
export function track(event, data = {}) {
  try {
    if (typeof window === 'undefined') return;
    let utm = {};
    try { utm = JSON.parse(localStorage.getItem(UTM_KEY)) || {}; } catch (e) { /* ignore */ }
    const entry = { event, ts: new Date().toISOString(), utm, ...data };
    const list = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
    list.push(entry);
    if (list.length > 500) list.splice(0, list.length - 500);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(list));
    if (process.env.NODE_ENV !== 'production') console.debug('[track]', event, data);
  } catch (e) { /* ignore */ }
}

// Leitura dos eventos (para exportação/diagnóstico)
export function getEvents() {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
  } catch (e) { return []; }
}
