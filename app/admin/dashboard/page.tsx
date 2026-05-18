'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PokemonAd } from '@/lib/supabase'
import AdminForm from '@/components/AdminForm'
import TierBadge from '@/components/TierBadge'

type View = 'list' | 'create' | 'edit'

export default function AdminDashboard() {
  const [ads, setAds] = useState<PokemonAd[]>([])
  const [view, setView] = useState<View>('list')
  const [editing, setEditing] = useState<PokemonAd | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const router = useRouter()

  const fetchAds = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ads')
      if (res.status === 401) { router.push('/admin'); return }
      const data = await res.json()
      setAds(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchAds() }, [fetchAds])

  async function handleDelete(id: string) {
    if (!confirm('Excluir este anúncio?')) return
    setDeleting(id)
    try {
      await fetch(`/api/ads/${id}`, { method: 'DELETE' })
      setAds(a => a.filter(x => x.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin')
  }

  function handleSaved() {
    fetchAds()
    setView('list')
    setEditing(null)
  }

  const filtered = ads.filter(a => !q || a.name.toLowerCase().includes(q.toLowerCase()))

  if (view === 'create' || view === 'edit') {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => { setView('list'); setEditing(null) }}
            className="text-poke-muted hover:text-white transition-colors text-sm">
            ← Voltar
          </button>
          <h1 className="text-xl font-bold text-white">
            {view === 'create' ? 'Criar Anúncio' : `Editar: ${editing?.name}`}
          </h1>
        </div>
        <AdminForm
          initial={editing ?? undefined}
          onSaved={handleSaved}
          onCancel={() => { setView('list'); setEditing(null) }}
        />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Painel Admin</h1>
          <p className="text-poke-muted text-sm">{ads.length} anúncio{ads.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setView('create')}
            className="bg-poke-yellow text-black font-bold px-5 py-2 rounded-lg hover:bg-yellow-400 transition-colors text-sm">
            + Novo Anúncio
          </button>
          <button onClick={handleLogout}
            className="border border-poke-border text-poke-muted hover:text-white hover:border-white/30 px-4 py-2 rounded-lg transition-colors text-sm">
            Sair
          </button>
          <a href="/" className="border border-poke-border text-poke-muted hover:text-white hover:border-white/30 px-4 py-2 rounded-lg transition-colors text-sm">
            Ver Site
          </a>
        </div>
      </div>

      {/* Search */}
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Filtrar por nome…"
        className="w-full max-w-xs bg-poke-card border border-poke-border rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-poke-yellow/60 transition-colors mb-5"
      />

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-poke-card border border-poke-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-poke-muted">
          {ads.length === 0 ? 'Nenhum anúncio cadastrado.' : 'Nenhum resultado para o filtro.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-poke-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-poke-card border-b border-poke-border">
                <th className="text-left text-poke-muted font-medium px-4 py-3">Pokémon</th>
                <th className="text-left text-poke-muted font-medium px-4 py-3">Tier</th>
                <th className="text-left text-poke-muted font-medium px-4 py-3">Perfection</th>
                <th className="text-left text-poke-muted font-medium px-4 py-3">Preço</th>
                <th className="text-left text-poke-muted font-medium px-4 py-3">Criado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ad, i) => (
                <tr key={ad.id} className={`border-b border-poke-border hover:bg-poke-card/50 transition-colors ${i % 2 === 0 ? 'bg-poke-dark' : 'bg-poke-card/30'}`}>
                  <td className="px-4 py-3 text-white font-medium">
                    {ad.name}
                    {ad.awaken && <span className="ml-2 text-xs text-violet-400">(A)</span>}
                    {ad.seasonal_tag && <span className="ml-1 text-xs text-sky-400">({ad.seasonal_tag})</span>}
                  </td>
                  <td className="px-4 py-3">
                    <TierBadge tier={ad.tier} />
                  </td>
                  <td className="px-4 py-3 text-amber-400 font-mono">
                    {ad.perfection != null ? `${ad.perfection.toFixed(3)}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-poke-yellow font-mono">
                    {ad.price != null ? ad.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-poke-muted text-xs">
                    {new Date(ad.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setEditing(ad); setView('edit') }}
                        className="text-xs border border-poke-border text-poke-muted hover:text-white hover:border-white/30 px-3 py-1 rounded-lg transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        disabled={deleting === ad.id}
                        className="text-xs border border-red-500/30 text-red-400 hover:border-red-400 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deleting === ad.id ? '…' : 'Excluir'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
