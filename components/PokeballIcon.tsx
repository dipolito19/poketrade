export default function PokeballIcon({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      {/* Top half — red */}
      <path d="M 50 5 A 45 45 0 0 1 95 50 L 62 50 A 12 12 0 0 0 38 50 L 5 50 A 45 45 0 0 1 50 5 Z" fill="#CC0000" />
      {/* Bottom half — white */}
      <path d="M 5 50 A 45 45 0 0 0 95 50 L 62 50 A 12 12 0 0 1 38 50 Z" fill="#E8E8E8" />
      {/* Outer ring */}
      <circle cx="50" cy="50" r="45" fill="none" stroke="#111" strokeWidth="4" />
      {/* Center band */}
      <line x1="5" y1="50" x2="38" y2="50" stroke="#111" strokeWidth="4" />
      <line x1="62" y1="50" x2="95" y2="50" stroke="#111" strokeWidth="4" />
      {/* Center button ring */}
      <circle cx="50" cy="50" r="12" fill="#E8E8E8" stroke="#111" strokeWidth="4" />
      {/* Center button inner */}
      <circle cx="50" cy="50" r="6" fill="white" stroke="#888" strokeWidth="2" />
    </svg>
  )
}
