'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Utensils, ArrowRight, Github, Mail, Lock, User as UserIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [forgotMode, setForgotMode] = useState(false)
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotLoading, setForgotLoading] = useState(false)
    const [forgotMessage, setForgotMessage] = useState<string | null>(null)

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            router.push('/')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'An error occurred during login')
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setForgotLoading(true)
        setForgotMessage(null)
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
                redirectTo: 'https://foodai.fi/reset-password',
            })
            if (error) throw error
            setForgotMessage('Salasanan palautuslinkki lähetetty sähköpostiisi!')
        } catch (err: any) {
            setForgotMessage('Virhe: ' + (err.message || 'Yritä uudelleen'))
        } finally {
            setForgotLoading(false)
        }
    }

    const handleOAuthLogin = async (provider: 'github' | 'google') => {
        setLoading(true)
        setError(null)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) throw error
        } catch (err: any) {
            setError(err.message || 'An error occurred during OAuth login')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#fffcf8] flex flex-col items-center justify-center p-6 relative overflow-hidden font-outfit">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#f3d179]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#d35400]/5 rounded-full blur-3xl" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-3 mb-12 justify-center group">
                    <div className="w-12 h-12 rounded-2xl bg-[#3d1d11] flex items-center justify-center shadow-xl transform group-hover:rotate-3 transition-transform">
                        <Utensils className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-black tracking-tight text-[#3d1d11]">
                        Food<span className="text-[#d35400]">AI</span>
                    </span>
                </Link>

                <div className="bg-white rounded-[3rem] p-10 app-shadow border border-[#f1ebd8]">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-[#3d1d11] mb-3 tracking-tight">Tervetuloa takaisin</h1>
                        <p className="text-[#a08a7e] font-medium">Kirjaudu sisään säästääksesi vielä enemmän</p>
                    </div>

                {forgotMode ? (
                        /* Forgot Password Form */
                        <form className="space-y-6" onSubmit={handleForgotPassword}>
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-black text-[#3d1d11] mb-3 tracking-tight">Unohditko salasanan?</h1>
                                <p className="text-[#a08a7e] font-medium">Syötä sähköpostisi niin lähetämme palautuslinkin.</p>
                            </div>

                            {forgotMessage && (
                                <div className={`p-4 rounded-2xl border text-center ${
                                    forgotMessage.startsWith('Virhe')
                                        ? 'bg-[#e74c3c]/5 border-[#e74c3c]/20'
                                        : 'bg-[#27ae60]/5 border-[#27ae60]/20'
                                }`}>
                                    <p className={`text-sm font-bold ${
                                        forgotMessage.startsWith('Virhe') ? 'text-[#e74c3c]' : 'text-[#27ae60]'
                                    }`}>{forgotMessage}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#3d1d11] ml-2">Sähköposti</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a08a7e] group-focus-within:text-[#d35400] transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="nimi@esimerkki.com"
                                        className="w-full bg-[#fdf2e2]/50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#f3d179] transition-all font-medium placeholder:text-[#a08a7e]/50"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        disabled={forgotLoading}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#3d1d11] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-[#d35400] transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3"
                                disabled={forgotLoading}
                            >
                                {forgotLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : 'Lähetä palautuslinkki'}
                            </button>

                            <button
                                type="button"
                                onClick={() => { setForgotMode(false); setForgotMessage(null) }}
                                className="w-full text-[#a08a7e] text-xs font-bold uppercase tracking-wider hover:text-[#3d1d11] transition-colors"
                            >
                                ← Takaisin kirjautumiseen
                            </button>
                        </form>
                    ) : (
                    /* Login Form */
                    <form className="space-y-6" onSubmit={handleEmailLogin}>
                        {error && (
                            <div className="p-4 rounded-2xl bg-[#e74c3c]/5 border border-[#e74c3c]/20">
                                <p className="text-sm text-[#e74c3c] font-bold text-center">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#3d1d11] ml-2">
                                Sähköposti
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a08a7e] group-focus-within:text-[#d35400] transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="nimi@esimerkki.com"
                                    className="w-full bg-[#fdf2e2]/50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#f3d179] transition-all font-medium placeholder:text-[#a08a7e]/50"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#3d1d11]">
                                    Salasana
                                </label>
                                <button
                                    type="button"
                                    onClick={() => { setForgotMode(true); setForgotEmail(email) }}
                                    className="text-[10px] text-[#3d1d11]/60 hover:text-[#d35400] font-black uppercase tracking-wider transition-colors"
                                >
                                    Unohditko?
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a08a7e] group-focus-within:text-[#d35400] transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-[#fdf2e2]/50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#f3d179] transition-all font-medium placeholder:text-[#a08a7e]/50"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#3d1d11] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-[#d35400] transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Kirjaudu Sisään
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                    )}

                    <div className="relative my-10">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#f1ebd8]"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px]">
                            <span className="px-4 bg-white text-[#a08a7e] font-black uppercase tracking-widest">Tai Kirjaudu</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            className="flex items-center justify-center gap-3 bg-[#fdf2e2]/50 hover:bg-[#fdf2e2] py-4 rounded-2xl border border-[#f1ebd8] transition-all group"
                            onClick={() => handleOAuthLogin('github')}
                            disabled={loading}
                        >
                            <Github className="w-5 h-5 text-[#3d1d11] group-hover:scale-110 transition-transform" />
                            <span className="text-[11px] font-black text-[#3d1d11] uppercase tracking-wider">Github</span>
                        </button>
                        <button
                            className="flex items-center justify-center gap-3 bg-[#fdf2e2]/50 hover:bg-[#fdf2e2] py-4 rounded-2xl border border-[#f1ebd8] transition-all group"
                            onClick={() => handleOAuthLogin('google')}
                            disabled={loading}
                        >
                            <Mail className="w-5 h-5 text-[#3d1d11] group-hover:scale-110 transition-transform" />
                            <span className="text-[11px] font-black text-[#3d1d11] uppercase tracking-wider">Google</span>
                        </button>
                    </div>

                    <div className="mt-10 text-center">
                        <p className="text-[11px] font-medium text-[#a08a7e]">
                            Eikö sinulla ole tiliä? {' '}
                            <Link href="/signup" className="text-[#3d1d11] font-black uppercase tracking-wider hover:text-[#d35400] underline underline-offset-4 decoration-2 decoration-[#d35400]/20 hover:decoration-[#d35400]">
                                Luo tili
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
