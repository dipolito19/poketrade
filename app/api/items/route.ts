import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function isAdmin(req: NextRequest) {
  return req.cookies.get('admin_auth')?.value === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get('q') ?? ''
  let query = supabase.from('item_ads').select('*').order('created_at', { ascending: false })
  if (q) query = query.ilike('name', `%${q}%`)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const body = await req.json()
  const { data, error } = await supabase.from('item_ads').insert([body]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
