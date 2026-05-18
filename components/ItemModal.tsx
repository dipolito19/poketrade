'use client'

import { useEffect } from 'react'
import { ItemAd } from '@/lib/supabase'

export default function ItemModal({ ad, onClose }: { ad: ItemAd; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-poke-card border border-poke-border rounded-2xl max-w-lg w-full shadow-poke animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-poke-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">&#9670;</span>
            <h2 className="text-xl font-bold text-white">{ad.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-poke-muted hover:text-white transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-5">
          {ad.description && (
            <div>
              <p className="text-xs text-poke-muted uppercase tracking-widest mb-2">Descrição</p>
              <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                {ad.description}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-poke-border flex-wrap gap-4">
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
