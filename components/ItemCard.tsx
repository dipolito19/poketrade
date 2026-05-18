'use client'

import { ItemAd } from '@/lib/supabase'

export default function ItemCard({ ad, onClick }: { ad: ItemAd; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-poke-card border border-poke-border rounded-xl p-4 hover:border-poke-yellow/50 hover:shadow-poke transition-all duration-200 group animate-fade-in flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white group-hover:text-poke-yellow transition-colors truncate">
            {ad.name}
          </p>
          {ad.description && (
            <p className="text-poke-muted text-sm mt-1 line-clamp-3 leading-relaxed">
              {ad.description}
            </p>
          )}
        </div>
        {/* Image or fallback icon */}
        <div className="shrink-0 w-14 h-14 rounded-lg bg-poke-border/60 overflow-hidden flex items-center justify-center text-2xl group-hover:bg-poke-yellow/10 transition-colors">
          {ad.image_url
            ? <img src={ad.image_url} alt={ad.name} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '&#9670;' }} />
            : <span>&#9670;</span>
          }
        </div>
      </div>

      {(ad.price != null || ad.contact) && (
        <div className="flex items-center justify-between pt-2 border-t border-poke-border">
          {ad.contact && (
            <span className="text-poke-muted text-xs truncate">{ad.contact}</span>
          )}
          {ad.price != null && (
            <span className="text-poke-yellow font-bold text-sm ml-auto">
              {ad.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          )}
        </div>
      )}
    </button>
  )
}
