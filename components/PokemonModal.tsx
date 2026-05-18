'use client'

import { useEffect } from 'react'
import { PokemonAd } from '@/lib/supabase'
import TierBadge from './TierBadge'

function StatRow({ label, val, bonus }: { label: string; val: number | null; bonus: number }) {
  const pct = val != null ? Math.round((val / 31) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-poke-muted text-sm font-mono text-right">{label}</span>
      <div className="flex-1 h-2 bg-poke-border rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-poke-yellow" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right text-white font-mono text-sm">{val ?? '?'}</span>
      {bonus > 0 && (
        <span className="text-emerald-400 text-sm font-mono w-16">+{bonus}</span>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="text-xs uppercase tracking-widest text-poke-muted mb-2 border-b border-poke-border pb-1">
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function PokemonModal({ ad, onClose }: { ad: PokemonAd; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${getPokemonId(ad.name)}.png`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-poke-card border border-poke-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-poke animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="sticky top-0 bg-poke-card border-b border-poke-border px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-white">{ad.name}</h2>
            <TierBadge tier={ad.tier} />
            {ad.awaken && (
              <span className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded px-2 py-0.5">
                Awakened
              </span>
            )}
            {ad.seasonal_tag && (
              <span className="text-xs bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded px-2 py-0.5">
                {ad.seasonal_tag}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-poke-muted hover:text-white transition-colors text-2xl leading-none"
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          {/* Hero */}
          <div className="flex gap-6 mb-6">
            <img
              src={spriteUrl}
              alt={ad.name}
              className="w-32 h-32 object-contain drop-shadow-lg"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className="flex-1 space-y-2">
              {ad.pokeball && (
                <div>
                  <span className="text-poke-muted text-xs">Pokébola</span>
                  <p className="text-white font-medium">{ad.pokeball}</p>
                  {ad.pokeball_bonus && (
                    <p className="text-amber-400 text-sm">{ad.pokeball_bonus}</p>
                  )}
                </div>
              )}
              <div className="flex gap-4 flex-wrap">
                {ad.sex && (
                  <span className="text-sm">
                    <span className="text-poke-muted">Sexo:</span>{' '}
                    <span className={ad.sex === 'female' ? 'text-pink-400' : ad.sex === 'male' ? 'text-blue-400' : 'text-gray-400'}>
                      {ad.sex}
                    </span>
                  </span>
                )}
                {ad.boost_level > 0 && (
                  <span className="text-sm">
                    <span className="text-poke-muted">Boost:</span>{' '}
                    <span className="text-poke-yellow">+{ad.boost_level}</span>
                  </span>
                )}
                {ad.upgrade_level > 0 && (
                  <span className="text-sm">
                    <span className="text-poke-muted">Upgrade:</span>{' '}
                    <span className="text-purple-400">[{ad.upgrade_level}]</span>
                  </span>
                )}
                {ad.souls > 0 && (
                  <span className="text-sm">
                    <span className="text-poke-muted">Souls:</span>{' '}
                    <span className="text-indigo-400">{ad.souls}</span>
                  </span>
                )}
              </div>
              {ad.perfection != null && (
                <div>
                  <span className="text-poke-muted text-xs">Perfection</span>
                  <p className="text-amber-400 font-bold font-mono text-lg">{ad.perfection.toFixed(3)}%</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <Section title="Stats">
            <div className="space-y-2">
              <StatRow label="HP"     val={ad.stat_hp}    bonus={ad.bonus_hp} />
              <StatRow label="ATK"    val={ad.stat_atk}   bonus={ad.bonus_atk} />
              <StatRow label="DEF"    val={ad.stat_def}   bonus={ad.bonus_def} />
              <StatRow label="SP.ATK" val={ad.stat_spatk} bonus={ad.bonus_spatk} />
              <StatRow label="SP.DEF" val={ad.stat_spdef} bonus={ad.bonus_spdef} />
              <StatRow label="SPEED"  val={ad.stat_speed} bonus={ad.bonus_speed} />
            </div>
          </Section>

          {/* Ability & Held Item */}
          {(ad.ability || ad.held_item) && (
            <Section title="Habilidade & Item">
              <div className="flex gap-4 flex-wrap">
                {ad.ability && (
                  <div className="bg-poke-border/50 rounded-lg px-4 py-2">
                    <p className="text-xs text-poke-muted">Special Ability</p>
                    <p className="text-white font-medium">{ad.ability}</p>
                  </div>
                )}
                {ad.held_item && (
                  <div className="bg-poke-border/50 rounded-lg px-4 py-2">
                    <p className="text-xs text-poke-muted">Held Item</p>
                    <p className="text-white font-medium">{ad.held_item}</p>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* TMs */}
          {ad.tms?.length > 0 && (
            <Section title="TMs">
              <div className="flex flex-wrap gap-2">
                {ad.tms.map((tm, i) => (
                  <span key={i} className="bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-lg px-3 py-1 text-sm">
                    {tm.name}
                    <span className="text-blue-500 ml-1">({tm.level})</span>
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Move Upgrades */}
          {ad.move_upgrades?.length > 0 && (
            <Section title={`Move Upgrades · Slots ${ad.move_slots_used}/${ad.move_slots_total} · ${ad.move_upgrades_count ?? ''}`}>
              <div className="flex flex-wrap gap-2">
                {ad.move_upgrades.map((m, i) => (
                  <span key={i} className="bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg px-3 py-1 text-sm">
                    {m.name}
                    <span className="text-purple-500 ml-1">[{m.level}]</span>
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Vitamins */}
          {ad.vitamins_total > 0 && (
            <Section title={`Vitamins (${ad.vitamins_used}/${ad.vitamins_total})`}>
              <div className="flex flex-wrap gap-2">
                {(ad.vitamin_details ?? []).map((v, i) => (
                  <span key={i} className="bg-green-500/10 border border-green-500/20 text-green-300 rounded-lg px-3 py-1 text-sm">
                    {v}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Description */}
          {ad.description && (
            <Section title="Descrição">
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{ad.description}</p>
            </Section>
          )}

          {/* Price & Contact */}
          <div className="mt-6 pt-4 border-t border-poke-border flex items-center justify-between flex-wrap gap-4">
            {ad.price != null && (
              <div>
                <p className="text-poke-muted text-xs">Preço</p>
                <p className="text-poke-yellow font-bold text-2xl">
                  {ad.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            )}
            {ad.contact && (
              <div className="text-right">
                <p className="text-poke-muted text-xs">Contato</p>
                <p className="text-white font-medium">{ad.contact}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const NAME_MAP: Record<string, number> = {
  bulbasaur: 1, ivysaur: 2, venusaur: 3, charmander: 4, charmeleon: 5, charizard: 6,
  squirtle: 7, wartortle: 8, blastoise: 9, pikachu: 25, raichu: 26, mewtwo: 150,
  mew: 151, sawsbuck: 586, eevee: 133, umbreon: 197, espeon: 196, gengar: 94,
  garchomp: 445, lucario: 448, dragonite: 149, tyranitar: 248, salamence: 373,
  metagross: 376, rayquaza: 384, dialga: 483, palkia: 484, giratina: 487,
  arceus: 493, zekrom: 644, reshiram: 643, kyurem: 646,
}

function getPokemonId(name: string): number {
  return NAME_MAP[name.toLowerCase()] ?? 0
}
