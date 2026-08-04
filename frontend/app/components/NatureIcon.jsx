// ===== NatureIcons — simbologia orgânica do propósito (humanização visual) =====
// Ícones desenhados à mão (traço orgânico, pontas arredondadas) no lugar de
// ícones genéricos de biblioteca — folhas, árvore, gota, sol, vento, montanha.
// Uso: <NatureIcon name="leaf" size={30} />  (herda currentColor)
const PATHS = {
  leaf: (
    <>
      <path d="M12 3C7.5 7.5 4.5 12 4.5 16a7.5 7.5 0 0015 0C19.5 12 16.5 7.5 12 3z" />
      <path d="M12 6.5c-2 2.8-3 5-3 8a3 3 0 006 0c0-3-1-5.2-3-8z" />
    </>
  ),
  tree: (
    <>
      <path d="M12 21v-6" />
      <path d="M12 15c-3.5-1-5.5-3.5-5.5-6.5 2.5-.8 5 .2 5.5 2.5.5-2.3 3-3.3 5.5-2.5C17.5 11.5 15.5 14 12 15z" />
      <path d="M12 13c-2.5-.8-4-2.5-4-4.8 1.9-.6 3.7.2 4 1.9.4-1.7 2.2-2.5 4-1.9 0 2.3-1.5 4-4 4.8z" />
    </>
  ),
  droplet: (
    <>
      <path d="M12 3.5c3.8 4.6 6 7.6 6 10.7a6 6 0 11-12 0c0-3.1 2.2-6.1 6-10.7z" />
      <path d="M9.5 13.5a3 3 0 002.5 3" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M5.9 5.9l1.6 1.6M16.5 16.5l1.6 1.6M18.1 5.9l-1.6 1.6M7.5 16.5l-1.6 1.6" />
    </>
  ),
  wind: (
    <>
      <path d="M3 8.5h10.5a2.5 2.5 0 10-2.4-3.2" />
      <path d="M3 12.5h14a2.5 2.5 0 11-2.4 3.2" />
      <path d="M3 16.5h7" />
    </>
  ),
  mountain: (
    <>
      <path d="M3.5 18.5L9 9l3.5 5.5L15 11l5.5 7.5z" />
      <path d="M15 8.5c1-1 2-1.5 3-1.5" />
      <circle cx="6.5" cy="6.5" r="1.6" />
    </>
  ),
  sprout: (
    <>
      <path d="M12 21v-7" />
      <path d="M12 14c-3.5-1-5.5-3.8-5-7.5 3.5.2 5.8 2.2 6 5.5.2-3.3 2.5-5.3 6-5.5.5 3.7-1.5 6.5-5 7.5z" />
    </>
  ),
  shieldLeaf: (
    <>
      <path d="M12 3l7 2.8v5c0 4.6-3 8-7 10-4-2-7-5.4-7-10v-5L12 3z" />
      <path d="M12 7.5c-2 2.2-3 3.9-3 6a3 3 0 006 0c0-2.1-1-3.8-3-6z" />
    </>
  ),
  eyeLeaf: (
    <>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 10.2c-1.3 1.4-1.9 2.6-1.9 4a1.9 1.9 0 003.8 0c0-1.4-.6-2.6-1.9-4z" />
    </>
  ),
  docLeaf: (
    <>
      <path d="M7 3h7l4 4v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
      <path d="M14 3v4h4" />
      <path d="M9.5 13.5c-1.2 1.3-1.7 2.4-1.7 3.6a1.7 1.7 0 003.4 0c0-1.2-.5-2.3-1.7-3.6z" />
    </>
  ),
  handSprout: (
    <>
      <path d="M8 13.5V8.5a1.5 1.5 0 013 0v3" />
      <path d="M11 11.5v-1.5a1.5 1.5 0 013 0v2.5" />
      <path d="M14 12.5V9a1.5 1.5 0 013 0v4.5" />
      <path d="M8 13.5l-1.8 1.6a1.5 1.5 0 00-.4 1.9 7 7 0 006.4 3.5h1.4a5.5 5.5 0 004.9-3l1.3-2.8" />
      <path d="M17 12.5c-.2-1.3-.8-2.1-1.8-2.5" />
    </>
  ),
  recycleLeaf: (
    <>
      <path d="M7 8.5L4.5 13a3.2 3.2 0 002.8 4.8h3" />
      <path d="M13.5 19.5H9.5a3.2 3.2 0 01-2.7-4.9L9 11.5" />
      <path d="M12.5 3.5l-3 5.2a3.2 3.2 0 002.8 4.8h6a3.2 3.2 0 002.7-4.9l-3-5.1z" />
      <path d="M12.6 6.4c-1 1-1.4 1.8-1.4 2.8a1.4 1.4 0 002.8 0c0-1-.4-1.8-1.4-2.8z" />
    </>
  ),
};

export default function NatureIcon({ name, size = 24, strokeWidth = 1.7, ...rest }) {
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
      {...rest}
    >
      {PATHS[name] || PATHS.leaf}
    </svg>
  );
}
