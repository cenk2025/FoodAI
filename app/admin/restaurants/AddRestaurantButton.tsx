'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import RestaurantFormModal from './RestaurantFormModal';

// Thin wrapper: button + create-mode modal. Lives on the restaurant list page.

export default function AddRestaurantButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 bg-[#3d1d11] hover:bg-[#d35400] text-white rounded-xl px-5 py-3 text-xs font-black uppercase tracking-[0.2em] transition-colors"
            >
                <Plus className="w-4 h-4" />
                Add restaurant
            </button>

            <RestaurantFormModal
                open={open}
                onClose={() => setOpen(false)}
                redirectOnCreate
            />
        </>
    );
}
