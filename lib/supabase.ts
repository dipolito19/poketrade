import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars not set. Copy .env.local.example to .env.local and fill in values.')
  _client = createClient(url, key)
  return _client
}

// Convenience alias — use getSupabase() in API routes, supabase in client components
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export type PokemonAd = {
  id: string
  name: string
  shiny: boolean
  tier: string | null
  pokeball: string | null
  pokeball_bonus: string | null
  awaken: boolean
  seasonal_tag: string | null
  boost_level: number
  upgrade_level: number
  souls: number
  sex: string | null
  stat_hp: number | null
  stat_atk: number | null
  stat_def: number | null
  stat_spatk: number | null
  stat_spdef: number | null
  stat_speed: number | null
  bonus_hp: number
  bonus_atk: number
  bonus_def: number
  bonus_spatk: number
  bonus_spdef: number
  bonus_speed: number
  perfection: number | null
  ability: string | null
  ability_description: string | null
  abilities: string[]
  seal: string | null
  aura: string | null
  held_item: string | null
  held_level: string | null
  tms: { name: string; level: number }[]
  move_slots_used: number
  move_slots_total: number
  move_upgrades_count: string | null
  move_upgrades: { name: string; level: number }[]
  vitamins_used: number
  vitamins_total: number
  vitamin_details: string[]
  extra_infos: string[]
  evolution: string | null
  price: number | null
  contact: string | null
  description: string | null
  raw_text: string | null
  created_at: string
  updated_at: string
}
