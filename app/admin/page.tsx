'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/admin/dashboard')
      } else {
        setError('Senha incorreta. Tente novamente.')
      }
    } catch {
      setError('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">&#9670;</div>
          <h1 className="text-2xl font-bold text-white">Painel Admin</h1>
          <p className="text-poke-muted text-sm mt-1">PokéTrade</p>
        </div>

        <form onSubmit={handleLogin} className="bg-poke-card border border-poke-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs text-poke-muted mb-1.5">Senha de administrador</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              required
              placeholder="••••••••"
              className="w-full bg-poke-dark border border-poke-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-poke-yellow/60 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-poke-yellow text-black font-bold py-2.5 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="text-center mt-4">
          <a href="/" className="text-poke-muted text-sm hover:text-white transition-colors">
            ← Voltar ao site
          </a>
        </p>
      </div>
    </div>
  )
}
