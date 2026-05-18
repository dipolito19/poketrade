import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function isAdmin(req: NextRequest) {
  const cookie = req.cookies.get('admin_auth')?.value
  return cookie === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const tier = searchParams.get('tier') ?? ''

  let query = supabase
    .from('pokemon_ads')
    .select('*')
    .order('created_at', { ascending: false })

  if (q) {
    query = query.or(`name.ilike.%${q}%,ability.ilike.%${q}%`)
  }
  if (tier) {
    query = query.eq('tier', tier)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase.from('pokemon_ads').insert([body]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
