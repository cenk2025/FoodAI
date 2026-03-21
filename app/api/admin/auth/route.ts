import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_EMAIL = 'cenk.yakinlar@hotmail.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export async function POST(request: Request) {
    const body = await request.json()
    const { email, password } = body

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const cookieStore = await cookies()
        cookieStore.set('admin_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        })

        return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Virheellinen sähköposti tai salasana' }, { status: 401 })
}
