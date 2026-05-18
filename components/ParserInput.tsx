'use client'

import { useState } from 'react'
import { parsePokemonText, ParsedPokemon } from '@/lib/parser'

type Props = {
  onParsed: (data: ParsedPokemon) => void
}

export default function ParserInput({ onParsed }: Props) {
  const [raw, setRaw] = useState('')

  function handleParse() {
    const result = parsePokemonText(raw)
    onParsed(result)
  }

  return (
    <div className="bg-poke-card border border-poke-border rounded-xl p-5 mb-6">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <span className="text-poke-yellow">&#9650;</span> Parser Automático
      </h3>
      <p className="text-poke-muted text-sm mb-3">
        Cole o texto bruto do Pokémon abaixo e clique em Parsear para preencher o formulário automaticamente.
      </p>
      <textarea
        value={raw}
        onChange={e => setRaw(e.target.value)}
        rows={10}
        placeholder={`You see a inuse hogwarts ball (25% ATK/DEF Dark/Ghost).\nSawsbuck (P) (S++) (A)(YULE) (Level 100) [+200] Upgrade: [5].\nSex: female\nHp: 28 (+500)\n...`}
        className="w-full bg-poke-dark border border-poke-border rounded-lg p-3 text-sm text-gray-300 font-mono focus:outline-none focus:border-poke-yellow/60 transition-colors resize-y"
      />
      <button
        onClick={handleParse}
        disabled={!raw.trim()}
        className="mt-3 bg-poke-yellow text-black font-bold px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Parsear Texto
      </button>
    </div>
  )
}
