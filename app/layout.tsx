import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PokéTrade — Anúncios de Pokémon',
  description: 'Compre e venda Pokémons raros com stats, tier e detalhes completos.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-poke-dark antialiased">
        <header className="border-b border-poke-border bg-poke-card sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">&#9670;</span>
            <a href="/" className="text-xl font-bold text-poke-yellow tracking-wide hover:opacity-80 transition-opacity">
              PokéTrade
            </a>
            <span className="text-poke-muted text-sm hidden sm:block">
              Anúncios de Pokémon
            </span>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-poke-border mt-16 py-6 text-center text-poke-muted text-sm">
          PokéTrade &mdash; {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  )
}
