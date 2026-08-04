// ===== Icon — sistema de ícones moderno (anti-emoji-genérico) =====
// Traço orgânico consistente (stroke 1.6, pontas redondas), desenhado à mão.
// Substitui emojis genéricos na UI. Uso: <Icon name="bolt" size={16} inline />
const P = {
  // ── Energia / clima ──
  bolt: <path d="M13 2.5L5 13.5h5l-1.5 8L17 10.5h-5L13 2.5z" />,
  flame: <><path d="M12 3.5c1.5 2.5 4.5 5 4.5 9a4.5 4.5 0 11-9 0c0-2 1.2-3.8 2.4-5.4.3 1.4 1 2.3 2.1 2.9-.5-2.2-.3-4.6 0-6.5z" /></>,
  fuel: <><path d="M4 20h9" /><path d="M5.5 20V6a1.5 1.5 0 011.5-1.5H13A1.5 1.5 0 0114.5 6v14" /><path d="M14.5 9.5h2.5a1.5 1.5 0 011.5 1.5v5a1.5 1.5 0 01-3 0V12" /><path d="M8 7.5h3" /></>,
  snow: <><path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9" /><path d="M12 3l-1.8 1.8M12 3l1.8 1.8M12 21l-1.8-1.8M12 21l1.8-1.8" /><path d="M4.5 7.5l2.5.4M4.5 7.5l-.4 2.5M19.5 7.5l-2.5.4M19.5 7.5l.4 2.5M4.5 16.5l2.5-.4M4.5 16.5l-.4-2.5M19.5 16.5l-2.5-.4M19.5 16.5l.4-2.5" /></>,
  droplet: <><path d="M12 3.5c3.8 4.6 6 7.6 6 10.7a6 6 0 11-12 0c0-3.1 2.2-6.1 6-10.7z" /><path d="M9.5 13.5a3 3 0 002.5 3" /></>,
  wind: <><path d="M3 8.5h10.5a2.5 2.5 0 10-2.4-3.2" /><path d="M3 12.5h14a2.5 2.5 0 11-2.4 3.2" /><path d="M3 16.5h7" /></>,
  sun: <><circle cx="12" cy="12" r="4.5" /><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M5.9 5.9l1.6 1.6M16.5 16.5l1.6 1.6M18.1 5.9l-1.6 1.6M7.5 16.5l-1.6 1.6" /></>,
  mountain: <><path d="M3.5 18.5L9 9l3.5 5.5L15 11l5.5 7.5z" /><path d="M15 8.5c1-1 2-1.5 3-1.5" /><circle cx="6.5" cy="6.5" r="1.6" /></>,
  // ── Natureza ──
  leaf: <><path d="M12 3C7.5 7.5 4.5 12 4.5 16a7.5 7.5 0 0015 0C19.5 12 16.5 7.5 12 3z" /><path d="M12 6.5c-2 2.8-3 5-3 8a3 3 0 006 0c0-3-1-5.2-3-8z" /></>,
  tree: <><path d="M12 21v-6" /><path d="M12 15c-3.5-1-5.5-3.5-5.5-6.5 2.5-.8 5 .2 5.5 2.5.5-2.3 3-3.3 5.5-2.5C17.5 11.5 15.5 14 12 15z" /></>,
  sprout: <><path d="M12 21v-7" /><path d="M12 14c-3.5-1-5.5-3.8-5-7.5 3.5.2 5.8 2.2 6 5.5.2-3.3 2.5-5.3 6-5.5.5 3.7-1.5 6.5-5 7.5z" /></>,
  wheat: <><path d="M12 21V6.5" /><path d="M12 6.5C9.5 7 8 9 8.5 11.5c2.5-.6 4-.8 3.5-3.4M12 6.5C14.5 7 16 9 15.5 11.5c-2.5-.6-4-.8-3.5-3.4" /><path d="M12 13.5c-2.2.6-3.4 2.4-2.9 4.5 2-.5 3.2-.6 2.9-3.4M12 13.5c2.2.6 3.4 2.4 2.9 4.5-2-.5-3.2-.6-2.9-3.4" /></>,
  recycleLeaf: <><path d="M7 8.5L4.5 13a3.2 3.2 0 002.8 4.8h3" /><path d="M13.5 19.5H9.5a3.2 3.2 0 01-2.7-4.9L9 11.5" /><path d="M12.5 3.5l-3 5.2a3.2 3.2 0 002.8 4.8h6a3.2 3.2 0 002.7-4.9l-3-5.1z" /><path d="M12.6 6.4c-1 1-1.4 1.8-1.4 2.8a1.4 1.4 0 002.8 0c0-1-.4-1.8-1.4-2.8z" /></>,
  shieldLeaf: <><path d="M12 3l7 2.8v5c0 4.6-3 8-7 10-4-2-7-5.4-7-10v-5L12 3z" /><path d="M12 7.5c-2 2.2-3 3.9-3 6a3 3 0 006 0c0-2.1-1-3.8-3-6z" /></>,
  eyeLeaf: <><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  docLeaf: <><path d="M7 3h7l4 4v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" /><path d="M14 3v4h4" /><path d="M9.5 13.5c-1.2 1.3-1.7 2.4-1.7 3.6a1.7 1.7 0 003.4 0c0-1.2-.5-2.3-1.7-3.6z" /></>,
  handSprout: <><path d="M8 13.5V8.5a1.5 1.5 0 013 0v3" /><path d="M11 11.5v-1.5a1.5 1.5 0 013 0v2.5" /><path d="M14 12.5V9a1.5 1.5 0 013 0v4.5" /><path d="M8 13.5l-1.8 1.6a1.5 1.5 0 00-.4 1.9 7 7 0 006.4 3.5h1.4a5.5 5.5 0 004.9-3l1.3-2.8" /></>,
  // ── Transporte ──
  car: <><path d="M4.5 16.5L6 11.2a2 2 0 011.9-1.4h8.2a2 2 0 011.9 1.4l1.5 5.3" /><path d="M3.5 16.5h17v2.5a1 1 0 01-1 1h-1.5a1 1 0 01-1-1V19h-10v.5a1 1 0 01-1 1H4.5a1 1 0 01-1-1v-3z" /><circle cx="7.5" cy="17" r="1" /><circle cx="16.5" cy="17" r="1" /></>,
  plane: <><path d="M10.5 13.5L3 9l2.5-2 6 1.5L17.5 4a1.8 1.8 0 012.5 2.5L14 12.5l1.5 6-2 2.5-4.5-7.5z" /></>,
  // ── Escritório / operação ──
  building: <><path d="M4 20.5V5a1.5 1.5 0 011.5-1.5h9A1.5 1.5 0 0116 5v15.5" /><path d="M16 9.5h2.5a1.5 1.5 0 011.5 1.5v9.5" /><path d="M3 20.5h18" /><path d="M7 7h2.5M12 7h2.5M7 10.5h2.5M12 10.5h2.5M7 14h2.5M12 14h2.5" /></>,
  briefcase: <><rect x="3.5" y="7.5" width="17" height="11" rx="2" /><path d="M9 7.5V6a2 2 0 012-2h2a2 2 0 012 2v1.5" /><path d="M3.5 12.5h17" /></>,
  // ── UI / conceitos ──
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>,
  chart: <><path d="M4 20.5V4" /><path d="M4 20.5h16" /><path d="M8.5 16v-5M12.5 16V7.5M16.5 16v-8" /></>,
  trend: <><path d="M4 17l5-5 3.5 3.5L20 8" /><path d="M15 8h5v5" /></>,
  bulb: <><path d="M9.5 17.5h5" /><path d="M10 20h4" /><path d="M12 3.5a6.5 6.5 0 00-3.8 11.7c.8.6 1.3 1.4 1.3 2.3h5c0-.9.5-1.7 1.3-2.3A6.5 6.5 0 0012 3.5z" /><path d="M12 6.5c-1.3.9-2 2-2 3.5" /></>,
  alert: <><path d="M10.3 3.9L2.7 17a2 2 0 001.7 3h15.2a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /><path d="M12 9v4.5M12 17h.01" /></>,
  lock: <><rect x="5" y="10.5" width="14" height="9.5" rx="2" /><path d="M8 10.5V8a4 4 0 018 0v2.5" /><circle cx="12" cy="15" r="1.2" /></>,
  check: <><path d="M4.5 12.5l5 5L19.5 7" /></>,
  checkCircle: <><circle cx="12" cy="12" r="8.5" /><path d="M8 12.5l3 3 5.5-6" /></>,
  x: <><path d="M6 6l12 12M18 6L6 18" /></>,
  mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="M4 7l8 6 8-6" /></>,
  chat: <><path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H9l-4.5 3.5V6z" /></>,
  gem: <><path d="M7 4h10l4 5-9 11L3 9l4-5z" /><path d="M3 9h18M9.5 9L12 20M14.5 9L12 20M8 4l2.5 5M16 4l-2.5 5" /></>,
  clipboard: <><path d="M9 4.5h6" /><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9.5 11.5l2 2 3.5-4" /></>,
  sparkle: <><path d="M12 3.5c.8 4 2.5 5.7 6.5 6.5-4 .8-5.7 2.5-6.5 6.5-.8-4-2.5-5.7-6.5-6.5 4-.8 5.7-2.5 6.5-6.5z" /></>,
  scale: <><path d="M12 4v16M7 20h10" /><path d="M4.5 7h15" /><path d="M5.5 7l-2 5.5a2.8 2.8 0 005.9 0L7.5 7" /><path d="M16.5 7l-2 5.5a2.8 2.8 0 005.9 0l-2-5.5" /></>,
  download: <><path d="M12 3.5V15" /><path d="M7.5 10.5L12 15l4.5-4.5" /><path d="M4.5 19.5h15" /></>,
  share: <><circle cx="18" cy="5.5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="18.5" r="2.5" /><path d="M8.2 10.8l7.6-4M8.2 13.2l7.6 4" /></>,
  refresh: <><path d="M20 12a8 8 0 11-2.3-5.7" /><path d="M20 3.5V8h-4.5" /></>,
  arrowRight: <><path d="M4 12h15M13.5 6l6 6-6 6" /></>,
  arrowLeft: <><path d="M20 12H5M10.5 6l-6 6 6 6" /></>,
  star: <><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5z" /></>,
  medal: <><circle cx="12" cy="14.5" r="5.5" /><path d="M9 10L7 3.5l3.5 2L12 2.5l1.5 3 3.5-2L15 10" /><path d="M10.5 14.5l1 1 2-2.3" /></>,
  phone: <><path d="M5 3.5h3.5l1.5 4-2 1.5a13 13 0 006.5 6.5l1.5-2 4 1.5V19a2 2 0 01-2 2A16.5 16.5 0 013 5a2 2 0 012-1.5z" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 19.5c.8-3.5 3.5-5.5 6.5-5.5s5.7 2 6.5 5.5" /><path d="M16 4.8a3.5 3.5 0 010 6.4M18.5 14.4c1.6.9 2.6 2.5 3 4.6" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17" /><path d="M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.2-3.8-8.5s1.3-6.2 3.8-8.5z" /></>,
  play: <><path d="M8 5.5v13l10-6.5L8 5.5z" /></>,
};

export default function Icon({ name, size = 18, strokeWidth = 1.6, inline = false, className = '', ...rest }) {
  const path = P[name] || P.leaf;
  const style = inline ? { display: 'inline-flex', verticalAlign: '-0.22em', marginRight: '6px', flexShrink: 0 } : undefined;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
      {...rest}
    >
      {path}
    </svg>
  );
}
