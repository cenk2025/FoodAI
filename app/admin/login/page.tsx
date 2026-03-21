'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [forgotMode, setForgotMode] = useState(false)
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotLoading, setForgotLoading] = useState(false)
    const [forgotMessage, setForgotMessage] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const response = await fetch('/api/admin/auth', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type': 'application/json' },
        })

        if (response.ok) {
            router.push('/admin')
            router.refresh()
        } else {
            setError('Virheellinen sähköposti tai salasana')
        }
    }

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setForgotLoading(true)
        setForgotMessage('')
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
                redirectTo: 'https://foodai.fi/reset-password',
            })
            if (error) throw error
            setForgotMessage('✓ Palautuslinkki lähetetty sähköpostiisi!')
        } catch {
            setForgotMessage('Virhe: Yritä uudelleen')
        } finally {
            setForgotLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#fffcf8] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-[2rem] app-shadow border border-[#f1ebd8] w-full max-w-md text-center">
                <div className="bg-[#fffcf8] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-[#3d1d11]" />
                </div>
                <h1 className="text-2xl font-black text-[#3d1d11] mb-2">Admin Kirjautuminen</h1>
                <p className="text-[#a08a7e] mb-8">Tämä alue on tarkoitettu vain hallinnoijille.</p>

                {forgotMode ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d0c0b0]" />
                            <input
                                type="email"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                placeholder="Sähköpostiosoite"
                                required
                                className="w-full pl-12 pr-5 py-4 bg-[#fffcf8] border border-[#f1ebd8] rounded-xl outline-none focus:border-[#3d1d11] font-bold text-[#3d1d11] placeholder:text-[#d0c0b0] transition-colors"
                            />
                        </div>
                        {forgotMessage && (
                            <p className={`text-sm font-bold ${forgotMessage.startsWith('✓') ? 'text-green-600' : 'text-[#e74c3c]'}`}>
                                {forgotMessage}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={forgotLoading}
                            className="w-full bg-[#3d1d11] text-white py-4 rounded-xl font-black uppercase tracking-wider hover:bg-[#d35400] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {forgotLoading ? 'Lähetetään...' : 'Lähetä palautuslinkki'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setForgotMode(false)
                                setForgotMessage('')
                                setError('')
                            }}
                            className="w-full text-[#3d1d11] py-2 font-bold hover:underline"
                        >
                            Takaisin kirjautumiseen
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d0c0b0]" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Sähköpostiosoite"
                                required
                                className="w-full pl-12 pr-5 py-4 bg-[#fffcf8] border border-[#f1ebd8] rounded-xl outline-none focus:border-[#3d1d11] font-bold text-[#3d1d11] placeholder:text-[#d0c0b0] transition-colors"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d0c0b0]" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Salasana"
                                required
                                className="w-full pl-12 pr-5 py-4 bg-[#fffcf8] border border-[#f1ebd8] rounded-xl outline-none focus:border-[#3d1d11] font-bold text-[#3d1d11] placeholder:text-[#d0c0b0] transition-colors"
                            />
                        </div>

                        {error && (
                            <p className="text-[#e74c3c] text-sm font-bold">{error}</p>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-[#3d1d11] text-white py-4 rounded-xl font-black uppercase tracking-wider hover:bg-[#d35400] transition-colors shadow-lg"
                        >
                            Kirjaudu Sisään
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setForgotMode(true)
                                setError('')
                            }}
                            className="w-full text-[#3d1d11] py-2 font-bold hover:underline"
                        >
                            Unohditko salasanasi?
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
