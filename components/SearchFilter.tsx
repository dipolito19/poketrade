'use client'

const TIERS = ['GOD', 'S++', 'S+', 'S', 'A++', 'A+', 'A', 'B++', 'B+', 'B', 'C']

type Props = {
  q: string
  tier: string
  onQ: (v: string) => void
  onTier: (v: string) => void
}

export default function SearchFilter({ q, tier, onQ, onTier }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Buscar por nome ou ability..."
          value={q}
          onChange={e => onQ(e.target.value)}
          className="w-full bg-poke-card border border-poke-border rounded-lg px-4 py-2.5 text-white placeholder-poke-muted focus:outline-none focus:border-poke-yellow/60 transition-colors pr-10"
        />
        {q && (
          <button
            onClick={() => onQ('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-poke-muted hover:text-white transition-colors"
          >
            &times;
          </button>
        )}
      </div>

      <select
        value={tier}
        onChange={e => onTier(e.target.value)}
        className="bg-poke-card border border-poke-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-poke-yellow/60 transition-colors min-w-[140px]"
      >
        <option value="">Todos os Tiers</option>
        {TIERS.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </div>
  )
}
