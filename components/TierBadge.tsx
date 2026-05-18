'use client'

const TIER_COLORS: Record<string, string> = {
  'S++': 'text-red-400 border-red-400',
  'S+':  'text-orange-400 border-orange-400',
  'S':   'text-yellow-400 border-yellow-400',
  'A++': 'text-lime-400 border-lime-400',
  'A+':  'text-green-400 border-green-400',
  'A':   'text-emerald-400 border-emerald-400',
  'B++': 'text-sky-400 border-sky-400',
  'B+':  'text-blue-400 border-blue-400',
  'B':   'text-indigo-400 border-indigo-400',
  'C':   'text-purple-400 border-purple-400',
}

export default function TierBadge({ tier }: { tier: string | null }) {
  if (!tier) return null
  const cls = TIER_COLORS[tier] ?? 'text-gray-400 border-gray-400'
  return (
    <span className={`inline-block text-xs font-bold border rounded px-1.5 py-0.5 ${cls}`}>
      {tier}
    </span>
  )
}
