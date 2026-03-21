'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, User, LogOut, Settings, ChevronDown, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/context'
import { useLocation } from '@/lib/context/LocationContext'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Header() {
    const { t, locale, setLocale } = useLanguage()
    const { location, setLocation, setCity } = useLocation()
    const router = useRouter()
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [showDropdown, setShowDropdown] = useState(false)

    useEffect(() => {
        const supabase = createClient()
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })
        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        setShowDropdown(false)
        router.push('/')
        router.refresh()
    }

    const getUserDisplayName = () => {
        if (!user) return ''
        return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    }

    const [isDetecting, setIsDetecting] = useState(false)

    const detectLocation = () => {
        if (!navigator.geolocation) {
            alert('Selaimesi ei tue sijainnin tunnistusta.')
            return
        }

        setIsDetecting(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                try {
                    // Use Server Action for reliable geocoding with User-Agent
                    const { getLocationFromCoords } = await import('@/app/actions/location')
                    const result = await getLocationFromCoords(latitude, longitude)

                    if (result.success) {
                        setLocation(result.location || 'Helsinki')
                        setCity(result.city || 'Helsinki')
                    } else {
                        // Fallback mechanism or alert
                        console.warn('Geocoding failed:', result.error)
                        setLocation('Sijaintia ei löytynyt')
                    }
                } catch (error) {
                    console.error('Location detection error:', error)
                    setLocation('Virhe sijainnissa')
                } finally {
                    setIsDetecting(false)
                }
            },
            (error) => {
                console.error('Geolocation error:', error)
                let errorMsg = 'Virhe sijainnin haussa.'
                if (error.code === error.PERMISSION_DENIED) {
                    errorMsg = 'Sijaintitiedot evätty. Salli sijainti selaimen asetuksista.'
                }
                alert(errorMsg)
                setIsDetecting(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        )
    }

    return (
        <header className="z-50 w-full relative">
            {/* Top Bar: Location & Language (Tier 1) */}
            <div className="location-bar-bg px-4 py-2 flex items-center justify-between text-[#3d1d11]">
                <div className="flex items-center gap-2">
                    <button
                        onClick={detectLocation}
                        className="w-8 h-8 rounded-full bg-[#3d1d11]/10 flex items-center justify-center hover:bg-[#3d1d11]/20 transition-all active:scale-95"
                    >
                        <MapPin className={`w-4 h-4 text-[#3d1d11] ${isDetecting ? 'animate-bounce' : ''}`} />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold tracking-tight opacity-60">Toimitusosoite</span>
                        <div className="flex items-center gap-2 cursor-pointer hover:opacity-70 group transition-all" onClick={detectLocation}>
                            <span className="text-xs font-black">{location}</span>
                            <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
                            {isDetecting && (
                                <span className="text-[9px] bg-[#3d1d11] text-white px-1.5 py-0.5 rounded-md animate-pulse">Etsitään...</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Language Segmented Control */}
                <div className="bg-[#3d1d11]/10 p-1 rounded-xl flex items-center gap-1">
                    <button
                        onClick={() => setLocale('fi')}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${locale === 'fi' ? 'bg-[#3d1d11] text-white shadow-sm' : 'text-[#3d1d11]/60 hover:text-[#3d1d11]'}`}
                    >
                        FI
                    </button>
                    <button
                        onClick={() => setLocale('en')}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${locale === 'en' ? 'bg-[#3d1d11] text-white shadow-sm' : 'text-[#3d1d11]/60 hover:text-[#3d1d11]'}`}
                    >
                        EN
                    </button>
                </div>
            </div>

            {/* Main Header (Tier 2) */}
            <div className="bg-white px-4 h-16 flex items-center justify-between border-b border-[#f1ebd8]">
                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-10 h-10 rounded-2xl bg-[#3d1d11] flex items-center justify-center shadow-md transform group-hover:rotate-3 transition-transform">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 5V19M17 19L20 16M17 19L14 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7 5V19M7 5L4 8M7 5L10 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="text-xl font-black tracking-tight text-[#3d1d11]">
                        Food<span className="text-[#d35400]">AI</span>
                    </span>
                </Link>

                {/* User Profile / Auth */}
                <div className="flex items-center gap-4">
                    {!loading && (
                        <div className="relative">
                            {user ? (
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="w-10 h-10 rounded-2xl bg-[#fdf2e2] flex items-center justify-center border border-[#3d1d11]/5 hover:bg-[#faebda] transition-colors app-shadow"
                                >
                                    <User className="w-5 h-5 text-[#3d1d11]" />
                                </button>
                            ) : (
                                <Link href="/login">
                                    <button className="text-xs font-black text-[#3d1d11] uppercase tracking-wider hover:text-[#d35400] transition-colors">
                                        {t.header.signin}
                                    </button>
                                </Link>
                            )}

                            {showDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl card-shadow border border-[#f1ebd8] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                        <div className="px-5 py-4 border-b border-[#f1ebd8] bg-[#fdf2e2]/30">
                                            <p className="text-sm font-black text-[#3d1d11]">{getUserDisplayName()}</p>
                                            <p className="text-[10px] text-[#a08a7e] truncate font-medium">{user?.email}</p>
                                        </div>
                                        <div className="p-2">
                                            <Link href="/profile" onClick={() => setShowDropdown(false)} className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold text-[#3d1d11] hover:bg-[#fdf2e2]/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <User className="w-4 h-4 text-[#a08a7e]" />
                                                    Profiili
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-[#a08a7e]/50" />
                                            </Link>
                                            <Link href="/settings" onClick={() => setShowDropdown(false)} className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold text-[#3d1d11] hover:bg-[#fdf2e2]/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Settings className="w-4 h-4 text-[#a08a7e]" />
                                                    Asetukset
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-[#a08a7e]/50" />
                                            </Link>
                                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[#e74c3c] hover:bg-[#e74c3c]/5 transition-colors">
                                                <LogOut className="w-4 h-4" />
                                                Kirjaudu ulos
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
