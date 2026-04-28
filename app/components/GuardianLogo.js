// GuardianLogo — Shield Clock SVG logo for Guardian
// Props:
//   size: number (default 32) — controls width/height
//   showText: bool (default false) — show "Guardian" wordmark next to icon
//   textColor: string (default '#e2e8f0')
//   textSize: number (default 17)

export default function GuardianLogo({
  size = 32,
  showText = false,
  textColor = '#e2e8f0',
  textSize = 17,
}) {
  const s = size;

  // Shield path scaled to a 56×60 internal viewport, then we use transform to scale to `size`
  const scale = s / 56;
  const h = Math.round(60 * scale);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(s * 0.28) }}>
      <svg
        width={s}
        height={h}
        viewBox="0 0 56 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Guardian logo"
      >
        {/* Shield body */}
        <path
          d="M28 2C28 2 6 9 6 9L6 30C6 44 16 55 28 59C40 55 50 44 50 30L50 9Z"
          fill="#0f1527"
          stroke="#818cf8"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Clock ring */}
        <circle cx="28" cy="32" r="14" stroke="#818cf8" strokeWidth="2" />

        {/* Tick marks — 12, 3, 6, 9 o'clock */}
        <line x1="28" y1="19" x2="28" y2="22.5" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
        <line x1="28" y1="41.5" x2="28" y2="45" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
        <line x1="15" y1="32" x2="18.5" y2="32" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
        <line x1="37.5" y1="32" x2="41" y2="32" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />

        {/* Hour hand (pointing ~10 o'clock) */}
        <line x1="28" y1="32" x2="22" y2="25" stroke="white" strokeWidth="2.5" strokeLinecap="round" />

        {/* Minute hand (pointing ~2 o'clock) */}
        <line x1="28" y1="32" x2="35" y2="26" stroke="white" strokeWidth="1.8" strokeLinecap="round" />

        {/* Center dot */}
        <circle cx="28" cy="32" r="2.5" fill="#818cf8" />
      </svg>

      {showText && (
        <span style={{
          fontSize: textSize,
          fontWeight: 800,
          color: textColor,
          letterSpacing: '-0.3px',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          lineHeight: 1,
        }}>
          Guardian
        </span>
      )}
    </div>
  );
}
