'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ItemAd } from '@/lib/supabase'

type FormData = Omit<ItemAd, 'id' | 'created_at' | 'updated_at'>

const DEFAULT: FormData = { name: '', description: null, image_url: null, price: null, contact: null }

const inputCls = 'w-full bg-poke-dark border border-poke-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-poke-yellow/60 transition-colors'

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs text-poke-muted mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function AdminItemsPage() {
  const [ads, setAds] = useState<ItemAd[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ItemAd | null>(null)
  const [form, setForm] = useState<FormData>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  const fetchAds = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/items')
      if (res.status === 401) { router.push('/admin'); return }
      const data = await res.json()
      setAds(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchAds() }, [fetchAds])

  function openCreate() {
    setEditing(null)
    setForm(DEFAULT)
    setError('')
    setShowForm(true)
  }

  function openEdit(ad: ItemAd) {
    setEditing(ad)
    setForm({ name: ad.name, description: ad.description, image_url: ad.image_url, price: ad.price, contact: ad.contact })
    setError('')
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const method = editing ? 'PUT' : 'POST'
      const url = editing ? `/api/items/${editing.id}` : '/api/items'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Erro ao salvar')
      }
      fetchAds()
      setShowForm(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este anúncio?')) return
    setDeleting(id)
    try {
      await fetch(`/api/items/${id}`, { method: 'DELETE' })
      setAds(a => a.filter(x => x.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Items</h1>
          <p className="text-poke-muted text-sm">{ads.length} anúncio{ads.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={openCreate}
            className="bg-poke-yellow text-black font-bold px-5 py-2 rounded-lg hover:bg-yellow-400 transition-colors text-sm">
            + Novo Item
          </button>
          <a href="/admin/dashboard" className="border border-poke-border text-poke-muted hover:text-white hover:border-white/30 px-4 py-2 rounded-lg transition-colors text-sm">
            ← Pokémons
          </a>
          <a href="/items" className="border border-poke-border text-poke-muted hover:text-white hover:border-white/30 px-4 py-2 rounded-lg transition-colors text-sm">
            Ver Página
          </a>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-poke-card border border-poke-border rounded-xl p-5 mb-6 space-y-4">
          <h3 className="text-white font-semibold">{editing ? `Editar: ${editing.name}` : 'Novo Item'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nome *" required>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className={inputCls} />
            </Field>
            <Field label="Preço (R$)">
              <input type="number" step="0.01" min={0} value={form.price ?? ''}
                onChange={e => setForm(f => ({ ...f, price: e.target.value ? Number(e.target.value) : null }))}
                className={inputCls} />
            </Field>
            <Field label="Contato">
              <input value={form.contact ?? ''} onChange={e => setForm(f => ({ ...f, contact: e.target.value || null }))}
                placeholder="Discord, WhatsApp, etc." className={inputCls} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="URL da Imagem">
                <input
                  value={form.image_url ?? ''}
                  onChange={e => setForm(f => ({ ...f, image_url: e.target.value || null }))}
                  placeholder="https://i.imgur.com/..."
                  className={inputCls}
                />
                {form.image_url && (
                  <img src={form.image_url} alt="preview" className="mt-2 h-24 object-contain rounded-lg border border-poke-border" onError={e => (e.currentTarget.style.display = 'none')} />
                )}
              </Field>
            </div>
          </div>
          <Field label="Descrição">
            <textarea value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value || null }))}
              rows={4} className={inputCls + ' resize-y'} />
          </Field>
          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</p>
          )}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-lg border border-poke-border text-poke-muted hover:text-white transition-colors text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-lg bg-poke-yellow text-black font-bold hover:bg-yellow-400 transition-colors text-sm disabled:opacity-50">
              {saving ? 'Salvando…' : editing ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-poke-card border border-poke-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : ads.length === 0 ? (
        <div className="text-center py-16 text-poke-muted">Nenhum item cadastrado.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-poke-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-poke-card border-b border-poke-border">
                <th className="text-left text-poke-muted font-medium px-4 py-3">Nome</th>
                <th className="text-left text-poke-muted font-medium px-4 py-3">Descrição</th>
                <th className="text-left text-poke-muted font-medium px-4 py-3">Preço</th>
                <th className="text-left text-poke-muted font-medium px-4 py-3">Criado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad, i) => (
                <tr key={ad.id} className={`border-b border-poke-border hover:bg-poke-card/50 transition-colors ${i % 2 === 0 ? 'bg-poke-dark' : 'bg-poke-card/30'}`}>
                  <td className="px-4 py-3 text-white font-medium">{ad.name}</td>
                  <td className="px-4 py-3 text-poke-muted max-w-xs truncate">{ad.description ?? '—'}</td>
                  <td className="px-4 py-3 text-poke-yellow font-mono">
                    {ad.price != null ? ad.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-poke-muted text-xs">
                    {new Date(ad.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(ad)}
                        className="text-xs border border-poke-border text-poke-muted hover:text-white hover:border-white/30 px-3 py-1 rounded-lg transition-colors">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(ad.id)} disabled={deleting === ad.id}
                        className="text-xs border border-red-500/30 text-red-400 hover:border-red-400 px-3 py-1 rounded-lg transition-colors disabled:opacity-50">
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
