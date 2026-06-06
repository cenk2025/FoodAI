'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart, formatEUR } from '@/lib/direct-ordering/CartContext';

// Floating "View cart" button shown on the restaurant page once the cart has
// at least one item (mirrors Wolt's persistent CTA).

export default function CartFab() {
    const { itemCount, subtotalCents, openCart } = useCart();

    if (itemCount === 0) return null;

    return (
        <div className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <button
                type="button"
                onClick={openCart}
                className="pointer-events-auto bg-[#3d1d11] hover:bg-[#d35400] text-white rounded-full pl-3 pr-6 py-3 flex items-center gap-4 shadow-2xl transition-colors group font-black uppercase text-xs tracking-[0.15em]"
            >
                <span className="w-9 h-9 rounded-full bg-[#f3d179] text-[#3d1d11] flex items-center justify-center relative">
                    <ShoppingBag className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#d35400] text-white text-[10px] flex items-center justify-center border-2 border-[#3d1d11]">
                        {itemCount}
                    </span>
                </span>
                <span>View cart</span>
                <span className="opacity-80">{formatEUR(subtotalCents)}</span>
            </button>
        </div>
    );
}
