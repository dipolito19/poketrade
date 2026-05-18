'use client'

import { PokemonAd } from '@/lib/supabase'
import TierBadge from './TierBadge'
import PokeballIcon from './PokeballIcon'

function StatBar({ label, val, bonus }: { label: string; val: number | null; bonus: number }) {
  const pct = val != null ? Math.round((val / 31) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-12 text-poke-muted text-right font-mono">{label}</span>
      <div className="flex-1 h-1.5 bg-poke-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-poke-yellow transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right font-mono text-white/70">{val ?? '?'}</span>
      {bonus > 0 && (
        <span className="text-emerald-400 font-mono">+{bonus}</span>
      )}
    </div>
  )
}

export default function PokemonCard({ ad, onClick }: { ad: PokemonAd; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-poke-card border border-poke-border rounded-xl p-4 hover:border-poke-yellow/50 hover:shadow-poke transition-all duration-200 group animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            {ad.shiny && (
              <span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded px-1.5 py-0.5">
                ✦
              </span>
            )}
            <span className="font-bold text-white group-hover:text-poke-yellow transition-colors">
              {ad.name}
            </span>
            <TierBadge tier={ad.tier} />
            {ad.awaken && (
              <span className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded px-1.5 py-0.5">
                Awakened
              </span>
            )}
            {ad.seasonal_tag && (
              <span className="text-xs bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded px-1.5 py-0.5">
                {ad.seasonal_tag}
              </span>
            )}
          </div>
          {ad.pokeball && (
            <span className="text-xs text-poke-muted truncate max-w-[160px]" title={ad.pokeball}>
              {ad.pokeball}
              {ad.pokeball_bonus ? ` · ${ad.pokeball_bonus}` : ''}
            </span>
          )}
        </div>

        <PokeballIcon className="w-14 h-14 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-lg" />
      </div>

      {/* Stats mini */}
      <div className="space-y-1 mb-3">
        <StatBar label="HP"  val={ad.stat_hp}    bonus={ad.bonus_hp} />
        <StatBar label="ATK" val={ad.stat_atk}   bonus={ad.bonus_atk} />
        <StatBar label="DEF" val={ad.stat_def}   bonus={ad.bonus_def} />
        <StatBar label="SpA" val={ad.stat_spatk} bonus={ad.bonus_spatk} />
        <StatBar label="SpD" val={ad.stat_spdef} bonus={ad.bonus_spdef} />
        <StatBar label="SPD" val={ad.stat_speed} bonus={ad.bonus_speed} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-poke-border">
        <div className="flex gap-3 text-xs text-poke-muted">
          {ad.perfection != null && (
            <span className="text-amber-400 font-mono">{ad.perfection.toFixed(3)}%</span>
          )}
          {ad.seal && (
            <span className="text-rose-400 truncate max-w-[90px]" title={ad.seal}>seal</span>
          )}
          {!ad.seal && ad.ability && <span className="truncate max-w-[100px]">{ad.ability}</span>}
        </div>
        {ad.price != null && (
          <span className="text-poke-yellow font-bold text-sm">
            {ad.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        )}
      </div>
    </button>
  )
}

