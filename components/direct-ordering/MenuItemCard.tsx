'use client';

import Image from 'next/image';
import { Plus } from 'lucide-react';
import type { MenuItem } from '@/lib/direct-ordering/types';
import { formatEUR } from '@/lib/direct-ordering/CartContext';
import { useLanguage } from '@/lib/i18n/context';

// Wolt-style menu item card: image on the right, title + description + price
// on the left, "+" pill that opens the detail modal.

type Props = {
    item: MenuItem;
    onOpen: () => void;
};

export default function MenuItemCard({ item, onOpen }: Props) {
    const { t } = useLanguage();
    const disabled = !item.isAvailable;

    return (
        <button
            type="button"
            onClick={onOpen}
            disabled={disabled}
            className={`group relative w-full text-left bg-white rounded-[2rem] p-5 border border-[#f1ebd8]/70 app-shadow flex gap-5 items-center transition-all duration-300 ${
                disabled
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:-translate-y-0.5 hover:shadow-2xl hover:border-[#d35400]/30'
            }`}
            aria-label={`${item.name} — ${formatEUR(item.priceCents)}`}
        >
            <div className="flex-1 min-w-0 space-y-2">
                <h3 className="text-lg font-black text-[#3d1d11] tracking-tight line-clamp-1">
                    {item.name}
                </h3>
                {item.description && (
                    <p className="text-sm text-[#a08a7e] font-medium line-clamp-2 leading-relaxed">
                        {item.description}
                    </p>
                )}
                <div className="flex items-center gap-3 pt-1">
                    <span className="text-base font-black text-[#3d1d11]">
                        {item.sizes && item.sizes.length > 0
                            ? `${t.direct.item.from} ${formatEUR(item.sizes[0].priceCents)}`
                            : formatEUR(item.priceCents)}
                    </span>
                    {disabled && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#a08a7e] bg-[#fdf2e2] px-2 py-1 rounded-lg">
                            {t.direct.item.unavailable}
                        </span>
                    )}
                </div>
            </div>

            <div className="relative flex-shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#fdf2e2]">
                    {item.imageUrl ? (
                        <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={112}
                            height={112}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : null}
                </div>
                {!disabled && (
                    <span
                        className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#3d1d11] text-white flex items-center justify-center shadow-lg group-hover:bg-[#d35400] transition-colors"
                        aria-hidden="true"
                    >
                        <Plus className="w-5 h-5" />
                    </span>
                )}
            </div>
        </button>
    );
}
