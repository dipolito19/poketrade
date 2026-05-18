import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (password === process.env.ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('admin_auth', process.env.ADMIN_PASSWORD!, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8h
      path: '/',
    })
    return res
  }
  return NextResponse.json({ ok: false, error: 'Senha incorreta' }, { status: 401 })
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('admin_auth')
  return res
}
