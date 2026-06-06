'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, MapPin } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

// Standalone homepage banner pointing at PizzaPizza's direct-order page.
// Kept separate from the aggregator feed so the existing flow stays untouched.

export default function HomepagePizzaPizzaCard() {
    const { t } = useLanguage();

    return (
        <section className="relative">
            <Link
                href="/restaurant/pizzapizza"
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
                            {t.direct.homepage_card_title}
                        </h2>
                        <p className="text-[#a08a7e] font-medium leading-relaxed max-w-md">
                            {t.direct.homepage_card_subtitle}
                        </p>

                        <div className="flex flex-wrap gap-3 pt-2">
                            <span className="inline-flex items-center gap-2 bg-[#fdf2e2] text-[#3d1d11] text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-xl">
                                <Clock className="w-3.5 h-3.5" />
                                25–40 min
                            </span>
                            <span className="inline-flex items-center gap-2 bg-[#fdf2e2] text-[#3d1d11] text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-xl">
                                <MapPin className="w-3.5 h-3.5" />
                                Jyväskylä
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
                            src="/images/pizza.jpg"
                            alt="PizzaPizza"
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
