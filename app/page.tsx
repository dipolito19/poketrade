'use client'

import { useState, useEffect, useCallback } from 'react'
import { PokemonAd } from '@/lib/supabase'
import PokemonCard from '@/components/PokemonCard'
import PokemonModal from '@/components/PokemonModal'
import SearchFilter from '@/components/SearchFilter'

export default function HomePage() {
  const [ads, setAds] = useState<PokemonAd[]>([])
  const [q, setQ] = useState('')
  const [tier, setTier] = useState('')
  const [selected, setSelected] = useState<PokemonAd | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAds = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (tier) params.set('tier', tier)
    try {
      const res = await fetch(`/api/ads?${params}`)
      const data = await res.json()
      setAds(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [q, tier])

  useEffect(() => {
    const t = setTimeout(fetchAds, 300)
    return () => clearTimeout(t)
  }, [fetchAds])

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          Anúncios de <span className="text-poke-yellow">Pokémon</span>
        </h1>
        <p className="text-poke-muted">
          {ads.length} anúncio{ads.length !== 1 ? 's' : ''} disponíve{ads.length !== 1 ? 'is' : 'l'}
        </p>
      </div>

      <SearchFilter q={q} tier={tier} onQ={setQ} onTier={setTier} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 bg-poke-card border border-poke-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : ads.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">&#9673;</p>
          <p className="text-poke-muted text-lg">Nenhum anúncio encontrado</p>
          {(q || tier) && (
            <button
              onClick={() => { setQ(''); setTier('') }}
              className="mt-4 text-poke-yellow hover:underline text-sm"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ads.map(ad => (
            <PokemonCard key={ad.id} ad={ad} onClick={() => setSelected(ad)} />
          ))}
        </div>
      )}

      {selected && (
        <PokemonModal ad={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
