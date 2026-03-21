'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft,
    User as UserIcon,
    Mail,
    Globe,
    Bell,
    Shield,
    Trash2,
    Save,
    Check,
    ChevronRight,
    Lock,
    Eye
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function SettingsPage() {
    const router = useRouter()
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Form states
    const [displayName, setDisplayName] = useState('')
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [priceAlerts, setPriceAlerts] = useState(true)
    const [newsletter, setNewsletter] = useState(false)

    // Password change states
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordSaving, setPasswordSaving] = useState(false)
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        const supabase = createClient()

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.push('/login')
                return
            }
            setUser(session.user)
            setDisplayName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '')
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push('/login')
                return
            }
            setUser(session.user)
        })

        return () => subscription.unsubscribe()
    }, [router])

    const handleSaveProfile = async () => {
        setSaving(true)
        setMessage(null)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.updateUser({
                data: { full_name: displayName }
            })

            if (error) throw error

            setMessage({ type: 'success', text: 'Profiili päivitetty onnistuneesti!' })
            setTimeout(() => setMessage(null), 3000)
        } catch (error) {
            console.error('Error updating profile:', error)
            setMessage({ type: 'error', text: 'Päivitys epäonnistui. Yritä uudelleen.' })
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = async () => {
        if (!newPassword || !confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Täytä kaikki kentät' })
            return
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Salasanat eivät täsmää' })
            return
        }
        if (newPassword.length < 8) {
            setPasswordMessage({ type: 'error', text: 'Salasanan on oltava vähintään 8 merkkiä pitkä' })
            return
        }
        setPasswordSaving(true)
        setPasswordMessage(null)
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.updateUser({ password: newPassword })
            if (error) throw error
            setPasswordMessage({ type: 'success', text: 'Salasana vaihdettu onnistuneesti!' })
            setNewPassword('')
            setConfirmPassword('')
            setTimeout(() => setPasswordMessage(null), 3000)
        } catch (error) {
            console.error('Error updating password:', error)
            setPasswordMessage({ type: 'error', text: 'Salasanan vaihto epäonnistui. Yritä uudelleen.' })
        } finally {
            setPasswordSaving(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!confirm('Oletko varma että haluat poistaa tilisi? Tätä toimintoa ei voi peruuttaa.')) {
            return
        }

        try {
            const supabase = createClient()
            await supabase.auth.signOut()
            router.push('/')
        } catch (error) {
            console.error('Error deleting account:', error)
            setMessage({ type: 'error', text: 'Poisto epäonnistui. Yritä uudelleen.' })
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fffcf8] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#d35400]/20 border-t-[#d35400] rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-[#fffcf8] font-outfit pb-24 md:pb-12">
            {/* Header */}
            <div className="bg-[#3d1d11] text-white pt-16 pb-32 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-[#d35400]/20 rounded-full blur-3xl transform rotate-12" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[150%] bg-[#f3d179]/10 rounded-full blur-3xl transform -rotate-12" />
                </div>

                <div className="container mx-auto px-6 relative z-10 max-w-4xl">
                    <Link href="/profile" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Takaisin profiiliin</span>
                    </Link>
                    <h1 className="text-4xl font-black mb-3">Asetukset</h1>
                    <p className="text-white/60 font-medium">Hallitse tiliäsi ja ilmoituksia</p>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-4xl -mt-16 relative z-20 space-y-8">
                {/* Status Message */}
                {message && (
                    <div className={`p-6 rounded-[2rem] border animate-in slide-in-from-top-4 duration-500 ${message.type === 'success'
                            ? 'bg-[#27ae60]/5 border-[#27ae60]/20 text-[#27ae60]'
                            : 'bg-[#e74c3c]/5 border-[#e74c3c]/20 text-[#e74c3c]'
                        }`}>
                        <div className="flex items-center gap-3">
                            {message.type === 'success' ? <Check className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                            <p className="font-black uppercase text-xs tracking-widest">{message.text}</p>
                        </div>
                    </div>
                )}

                {/* Profile Section */}
                <div className="bg-white rounded-[3rem] p-10 app-shadow border border-[#f1ebd8]">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-[#fff9f0] rounded-2xl flex items-center justify-center text-[#d35400]">
                            <UserIcon className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black text-[#3d1d11]">Profiilitiedot</h2>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#3d1d11] ml-2">Näyttönimi</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full bg-[#fdf2e2]/30 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#f3d179] transition-all font-medium"
                                placeholder="Nimesi"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#3d1d11] ml-2">Sähköposti</label>
                            <div className="relative">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a08a7e]" />
                                <input
                                    type="email"
                                    value={user.email || ''}
                                    disabled
                                    className="w-full bg-[#f1ebd8]/20 border border-[#f1ebd8] rounded-2xl py-4 pl-14 pr-6 text-sm text-[#a08a7e] cursor-not-allowed font-medium"
                                />
                            </div>
                            <p className="text-[10px] text-[#a08a7e] ml-2 font-medium italic">Sähköpostia ei voi vaihtaa</p>
                        </div>

                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="bg-[#3d1d11] text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#d35400] transition-all active:scale-95 shadow-xl flex items-center gap-3"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : <Save className="w-4 h-4" />}
                            Tallenna muutokset
                        </button>
                    </div>
                </div>

                {/* Password Change Section */}
                <div className="bg-white rounded-[3rem] p-10 app-shadow border border-[#f1ebd8]">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-[#fff9f0] rounded-2xl flex items-center justify-center text-[#d35400]">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black text-[#3d1d11]">Vaihda Salasana</h2>
                    </div>

                    {passwordMessage && (
                        <div className={`p-4 rounded-2xl border mb-6 flex items-center gap-3 ${
                            passwordMessage.type === 'success'
                                ? 'bg-[#27ae60]/5 border-[#27ae60]/20 text-[#27ae60]'
                                : 'bg-[#e74c3c]/5 border-[#e74c3c]/20 text-[#e74c3c]'
                        }`}>
                            {passwordMessage.type === 'success' ? <Check className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                            <p className="font-black uppercase text-xs tracking-widest">{passwordMessage.text}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#3d1d11] ml-2">Uusi salasana</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••  (min. 8 merkkiä)"
                                className="w-full bg-[#fdf2e2]/30 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#f3d179] transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#3d1d11] ml-2">Vahvista uusi salasana</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-[#fdf2e2]/30 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#f3d179] transition-all font-medium"
                            />
                        </div>
                        <button
                            onClick={handlePasswordChange}
                            disabled={passwordSaving}
                            className="bg-[#3d1d11] text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#d35400] transition-all active:scale-95 shadow-xl flex items-center gap-3 disabled:opacity-50"
                        >
                            {passwordSaving ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : <Lock className="w-4 h-4" />}
                            Vaihda salasana
                        </button>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="bg-white rounded-[3rem] p-10 app-shadow border border-[#f1ebd8]">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-[#fff0f0] rounded-2xl flex items-center justify-center text-[#e74c3c]">
                            <Bell className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black text-[#3d1d11]">Ilmoitukset</h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            { id: 'email', label: 'Sähköposti-ilmoitukset', desc: 'Saa päivityksiä tilistäsi', checked: emailNotifications, set: setEmailNotifications },
                            { id: 'price', label: 'Hintahälytykset', desc: 'Ilmoita kun hinnat laskevat', checked: priceAlerts, set: setPriceAlerts },
                            { id: 'news', label: 'Uutiskirje', desc: 'Viikoittaiset tarjoukset ja vinkit', checked: newsletter, set: setNewsletter }
                        ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-6 rounded-[2rem] bg-[#fdf2e2]/20 border border-[#f1ebd8]/50">
                                <div>
                                    <p className="font-black text-[#3d1d11] uppercase text-[11px] tracking-widest">{item.label}</p>
                                    <p className="text-[10px] text-[#a08a7e] font-medium mt-1">{item.desc}</p>
                                </div>
                                <button
                                    onClick={() => item.set(!item.checked)}
                                    className={`w-14 h-8 rounded-full relative transition-all duration-300 ${item.checked ? 'bg-[#27ae60]' : 'bg-[#a08a7e]/20'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${item.checked ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="bg-white rounded-[3rem] p-10 app-shadow border border-[#f1ebd8]">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-[#eff6ff] rounded-2xl flex items-center justify-center text-[#3b82f6]">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black text-[#3d1d11]">Asetukset</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#3d1d11] ml-2">Kieli</label>
                            <select className="w-full bg-[#fdf2e2]/30 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#f3d179] transition-all font-bold text-[#3d1d11] appearance-none cursor-pointer">
                                <option value="fi">Suomi (Finnish)</option>
                                <option value="en">English (UK)</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#3d1d11] ml-2">Oletuskaupunki</label>
                            <select className="w-full bg-[#fdf2e2]/30 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-[#f3d179] transition-all font-bold text-[#3d1d11] appearance-none cursor-pointer">
                                <option value="helsinki">Helsinki</option>
                                <option value="espoo">Espoo</option>
                                <option value="tampere">Tampere</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-[3rem] p-10 border-4 border-[#e74c3c]/10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-[#e74c3c]/10 rounded-2xl flex items-center justify-center text-[#e74c3c]">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[#3d1d11]">Vaara-alue</h2>
                            <p className="text-[10px] text-[#e74c3c] font-black uppercase tracking-widest mt-1">Poista tili ja tiedot</p>
                        </div>
                    </div>

                    <div className="bg-[#e74c3c]/5 p-8 rounded-[2.5rem] border border-[#e74c3c]/10">
                        <p className="text-sm text-[#3d1d11] font-medium leading-relaxed mb-6">
                            Kun poistat tilisi, kaikki tietosi, suosikkisi ja tilaushistoriasi poistetaan pysyvästi. Tätä toimintoa ei voi peruuttaa.
                        </p>
                        <button
                            onClick={handleDeleteAccount}
                            className="bg-[#e74c3c] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#c0392b] transition-all shadow-lg active:scale-95"
                        >
                            Poista tili pysyvästi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
