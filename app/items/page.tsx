'use client'

import { useState, useEffect, useCallback } from 'react'
import { ItemAd } from '@/lib/supabase'
import ItemCard from '@/components/ItemCard'
import ItemModal from '@/components/ItemModal'

export default function ItemsPage() {
  const [ads, setAds] = useState<ItemAd[]>([])
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<ItemAd | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAds = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    try {
      const res = await fetch(`/api/items?${params}`)
      const data = await res.json()
      setAds(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [q])

  useEffect(() => {
    const t = setTimeout(fetchAds, 300)
    return () => clearTimeout(t)
  }, [fetchAds])

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          Anúncios de <span className="text-poke-yellow">Items</span>
        </h1>
        <p className="text-poke-muted">
          {ads.length} item{ads.length !== 1 ? 'ns' : ''} disponíve{ads.length !== 1 ? 'is' : 'l'}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-8">
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={q}
          onChange={e => setQ(e.target.value)}
          className="w-full bg-poke-card border border-poke-border rounded-lg px-4 py-2.5 text-white placeholder-poke-muted focus:outline-none focus:border-poke-yellow/60 transition-colors pr-10"
        />
        {q && (
          <button
            onClick={() => setQ('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-poke-muted hover:text-white transition-colors"
          >
            &times;
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-36 bg-poke-card border border-poke-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : ads.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">&#9670;</p>
          <p className="text-poke-muted text-lg">Nenhum item encontrado</p>
          {q && (
            <button onClick={() => setQ('')} className="mt-4 text-poke-yellow hover:underline text-sm">
              Limpar busca
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ads.map(ad => (
            <ItemCard key={ad.id} ad={ad} onClick={() => setSelected(ad)} />
          ))}
        </div>
      )}

      {selected && <ItemModal ad={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
