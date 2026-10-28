const c = (name: string) => ({ fill: `var(--color-${name})` });

/** Small illustrated destination/room scenes drawn from tokens (stand-ins for supplier photography). */
export function Scene({ kind, className }: { kind: string; className?: string }) {
  return (
    <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      {kind === 'island' && (
        <g>
          <rect width="160" height="100" style={c('scene-sky')} />
          <circle cx="118" cy="26" r="10" style={c('shirt-sand')} />
          <rect y="66" width="160" height="34" style={c('scene-sky')} opacity="0.7" />
          <ellipse cx="80" cy="76" rx="42" ry="9" style={c('scene-sand')} />
          <rect x="79" y="46" width="3" height="30" style={c('scene-wood')} />
          <path d="M80 48c-14-2-22 4-26 10 10-5 18-5 26-2zM80 48c14-2 22 4 26 10-10-5-18-5-26-2z" style={c('accent')} />
        </g>
      )}
      {(kind === 'room' || kind === 'house' || kind === 'tea' || kind === 'food' || kind === 'rail') && (
        <g>
          <rect width="160" height="100" style={c('scene-room')} />
          <rect y="78" width="160" height="22" style={c('scene-sand')} />
          {kind === 'room' && (
            <g>
              <rect x="30" y="34" width="60" height="22" style={c('scene-wood')} />
              <rect x="22" y="54" width="82" height="20" rx="3" style={c('surface')} />
              <rect x="22" y="68" width="82" height="8" style={c('brand-soft')} />
              <rect x="112" y="24" width="30" height="42" rx="3" style={c('portrait-bg')} />
            </g>
          )}
          {kind === 'house' && (
            <g>
              <path d="M26 54L80 28l54 26z" style={c('scene-wood')} />
              <rect x="38" y="54" width="84" height="32" style={c('scene-wood')} />
              <rect x="70" y="62" width="20" height="24" style={c('scene-room')} />
              <circle cx="132" cy="66" r="5" style={c('danger-dot')} />
            </g>
          )}
          {kind === 'tea' && (
            <g>
              <ellipse cx="80" cy="74" rx="40" ry="8" style={c('scene-wood')} />
              <path d="M62 50h36l-4 22H66z" style={c('surface')} />
              <path d="M98 56c8 0 8 10 0 10" fill="none" style={{ stroke: 'var(--color-surface)' }} strokeWidth="3" />
              <rect x="64" y="52" width="32" height="5" style={c('accent')} />
            </g>
          )}
          {kind === 'food' && (
            <g>
              <circle cx="80" cy="56" r="26" style={c('surface')} />
              <circle cx="80" cy="56" r="18" style={c('warning-soft')} />
              <circle cx="72" cy="52" r="5" style={c('danger-dot')} />
              <circle cx="88" cy="60" r="5" style={c('accent')} />
              <circle cx="82" cy="50" r="4" style={c('warning-dot')} />
            </g>
          )}
          {kind === 'rail' && (
            <g>
              <rect x="20" y="40" width="120" height="30" rx="8" style={c('surface')} />
              <rect x="20" y="52" width="120" height="6" style={c('brand')} />
              <rect x="30" y="44" width="16" height="8" style={c('scene-sky')} />
              <rect x="52" y="44" width="16" height="8" style={c('scene-sky')} />
              <rect x="74" y="44" width="16" height="8" style={c('scene-sky')} />
              <rect x="10" y="74" width="140" height="3" style={c('fg-muted')} />
            </g>
          )}
        </g>
      )}
      {kind === 'desert' && (
        <g>
          <rect width="160" height="100" style={c('warning-soft')} />
          <circle cx="40" cy="30" r="12" style={c('warning-dot')} />
          <path d="M0 74c30-26 60-10 90-2s50 6 70-8v36H0z" style={c('scene-sand')} />
          <path d="M0 88c40-16 80-6 160-4v16H0z" style={c('shirt-sand')} />
        </g>
      )}
      {kind === 'car' && (
        <g>
          <rect width="160" height="100" style={c('portrait-bg')} />
          <rect y="74" width="160" height="26" style={c('fg-muted')} opacity="0.35" />
          <path d="M30 70V54c0-6 4-10 10-10h14l10-10h40c6 0 10 4 12 10l8 10c3 2 4 4 4 8v8z" style={c('brand')} />
          <circle cx="52" cy="72" r="9" style={c('fg')} />
          <circle cx="112" cy="72" r="9" style={c('fg')} />
          <rect x="70" y="38" width="22" height="12" style={c('scene-sky')} />
        </g>
      )}
      {kind === 'city' && (
        <g>
          <rect width="160" height="100" style={c('portrait-bg')} />
          <rect x="30" y="36" width="24" height="64" style={c('shirt-grey')} />
          <rect x="60" y="22" width="28" height="78" style={c('brand')} />
          <rect x="94" y="46" width="22" height="54" style={c('shirt-grey')} />
        </g>
      )}
    </svg>
  );
}
