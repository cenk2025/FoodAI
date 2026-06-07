'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { useLocation } from '@/lib/context/LocationContext';
import { fetchActiveDirectRestaurants } from '@/app/actions/direct-restaurants';
import type { DirectRestaurant } from '@/lib/direct-ordering/types';

// Renders one banner per active direct-order restaurant in the user's current
// city. Returns null when no restaurant matches — so e.g. switching the city
// to Helsinki hides the Jyväskylä-only PizzaPizza banner instead of letting
// users click into a non-deliverable restaurant.

export default function HomepageDirectRestaurants() {
    const [restaurants, setRestaurants] = useState<DirectRestaurant[]>([]);
    const { city } = useLocation();

    useEffect(() => {
        let cancelled = false;
        fetchActiveDirectRestaurants().then((list) => {
            if (!cancelled) setRestaurants(list);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const visible = restaurants.filter(
        (r) => r.city.toLowerCase() === city.toLowerCase(),
    );
    if (visible.length === 0) return null;

    return (
        <div className="space-y-6">
            {visible.map((r) => (
                <DirectRestaurantBanner key={r.id} restaurant={r} />
            ))}
        </div>
    );
}

function DirectRestaurantBanner({ restaurant }: { restaurant: DirectRestaurant }) {
    const { t } = useLanguage();
    const cover = restaurant.coverUrl || '/images/pizza.jpg';

    return (
        <section className="relative">
            <Link
                href={`/restaurant/${restaurant.slug}`}
                className="group block overflow-hidden rounded-[2.5rem] border border-[#f1ebd8] app-shadow bg-white"
            >
                <div className="grid md:grid-cols-[1fr_1.2fr]">
                    {/* Copy */}
                    <div className="p-8 md:p-12 flex flex-col justify-center space-y-5">
                        <span className="inline-flex items-center gap-2 bg-[#d35400]/10 text-[#d35400] text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#d35400] animate-pulse" />
                            {t.direct.homepage_card_badge}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-[#3d1d11] tracking-tight leading-none">
                            {restaurant.name} {restaurant.city}
                        </h2>
                        {restaurant.description && (
                            <p className="text-[#a08a7e] font-medium leading-relaxed max-w-md">
                                {restaurant.description}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-3 pt-2">
                            <span className="inline-flex items-center gap-2 bg-[#fdf2e2] text-[#3d1d11] text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-xl">
                                <Clock className="w-3.5 h-3.5" />
                                {restaurant.etaMin}–{restaurant.etaMax} min
                            </span>
                            <span className="inline-flex items-center gap-2 bg-[#fdf2e2] text-[#3d1d11] text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-xl">
                                <MapPin className="w-3.5 h-3.5" />
                                {restaurant.city}
                            </span>
                        </div>

                        <span className="inline-flex items-center gap-3 bg-[#3d1d11] group-hover:bg-[#d35400] transition-colors text-white rounded-2xl px-6 py-4 font-black uppercase text-xs tracking-[0.2em] w-fit mt-2">
                            {t.direct.homepage_card_cta}
                            <ArrowRight className="w-4 h-4" />
                        </span>
                    </div>

                    {/* Image */}
                    <div className="relative h-56 md:h-auto md:min-h-[320px] bg-[#3d1d11]">
                        <Image
                            src={cover}
                            alt={restaurant.name}
                            fill
                            sizes="(min-width: 768px) 50vw, 100vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/0 md:to-white/40" />
                    </div>
                </div>
            </Link>
        </section>
    );
}
