// Seal — medalhão/selo oficial (linguagem de certificação, anti-emoji)
// Anel externo + anel tracejado + disco preenchido + ícone central.
// Tons: green (accent da marca), gold (DQS/selo de mérito), neutral.
import Icon from './Icon';

const TONES = {
  green: '#c6dc0a',
  gold: '#d4af37',
  neutral: '#8fb898',
};

export default function Seal({ icon, size = 48, tone = 'green', label = null, strokeWidth = 1.7 }) {
  const color = TONES[tone] || TONES.green;
  return (
    <div
      className={`seal seal-${tone}`}
      style={{ width: size, height: size, ['--seal-color']: color }}
      role="img"
      aria-label={label || icon}
    >
      <svg viewBox="0 0 100 100" className="seal-svg" aria-hidden="true">
        <circle cx="50" cy="50" r="47" className="seal-r1" />
        <circle cx="50" cy="50" r="39" className="seal-r2" />
        <circle cx="50" cy="50" r="30" className="seal-disc" />
      </svg>
      <span className="seal-glyph">
        <Icon name={icon} size={Math.round(size * 0.36)} strokeWidth={strokeWidth} />
      </span>
      {label && <span className="seal-label">{label}</span>}
    </div>
  );
}
