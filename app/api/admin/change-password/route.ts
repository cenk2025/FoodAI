import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_EMAIL = 'cenk.yakinlar@hotmail.com'
const ADMIN_USER_ID = '805a6568-e5ef-41b9-8c86-2df6d79db571'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: Request) {
    // Check admin session
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')
    if (!adminSession) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword, confirmPassword } = body

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json({ error: 'Kaikki kentät ovat pakollisia' }, { status: 400 })
    }
    if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: 'Uudet salasanat eivät täsmää' }, { status: 400 })
    }
    if (newPassword.length < 8) {
        return NextResponse.json({ error: 'Salasanan on oltava vähintään 8 merkkiä pitkä' }, { status: 400 })
    }

    // Verify current password by trying to sign in with Supabase
    const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: currentPassword }),
    })

    if (!verifyRes.ok) {
        return NextResponse.json({ error: 'Nykyinen salasana on väärä' }, { status: 400 })
    }

    // Update password via Admin API
    const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${ADMIN_USER_ID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ password: newPassword }),
    })

    if (!updateRes.ok) {
        return NextResponse.json({ error: 'Salasanan päivitys epäonnistui' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Salasana vaihdettu onnistuneesti' })
}
