import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PKMD Trade',
  description: 'Compre e venda Pokémons e items raros.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-poke-dark antialiased">
        <header className="border-b border-poke-border bg-poke-card sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">&#9670;</span>
              <a href="/" className="text-xl font-bold text-poke-yellow tracking-wide hover:opacity-80 transition-opacity">
                PKMD Trade
              </a>
            </div>
            <nav className="flex items-center gap-1">
              <a href="/" className="text-sm text-poke-muted hover:text-white px-3 py-1.5 rounded-lg hover:bg-poke-border/50 transition-all">
                Pokémons
              </a>
              <a href="/items" className="text-sm text-poke-muted hover:text-white px-3 py-1.5 rounded-lg hover:bg-poke-border/50 transition-all">
                Items
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-poke-border mt-16 py-6 text-center text-poke-muted text-sm">
          PKMD Trade &mdash; {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  )
}
