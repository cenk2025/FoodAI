'use client';

import React, {
    createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import type { CartLine, MenuItem } from './types';

// One cart per restaurant. The active restaurant slug is set by the
// restaurant page; switching to a different restaurant's page leaves the
// previous cart intact in localStorage (Wolt parity).

type CartState = Record<string /* restaurantSlug */, CartLine[]>;

const STORAGE_KEY = 'foodai_direct_carts_v2';   // bumped from v1 — schema changed

type SelectedOption = { groupId: string; optionId: string };

type CartContextValue = {
    /** active restaurant slug (set by the restaurant page) */
    activeRestaurantSlug: string | null;
    setActiveRestaurantSlug: (slug: string | null) => void;

    /** lines for the active restaurant */
    lines: CartLine[];
    itemCount: number;

    /** menu items currently visible — used to resolve names/prices for the cart panel */
    menuById: Record<string, MenuItem>;
    setMenu: (items: MenuItem[]) => void;

    /** Add a configured item (with size + option choices). Same combination collapses into one line. */
    addLine: (input: {
        menuItemId: string;
        quantity?: number;
        sizeId?: string;
        selectedOptions?: SelectedOption[];
    }) => void;
    updateLineQty: (lineId: string, qty: number) => void;
    removeLine: (lineId: string) => void;
    clearCart: () => void;

    /** Money helpers, both in cents. Delivery fee is resolved at checkout, not here. */
    subtotalCents: number;

    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

/**
 * Stable, deterministic key for a (menuItem, size, options) combination.
 * Two cart adds with the same selections collapse into one line; any change
 * — different size, different topping, etc. — produces a new line.
 */
export function computeLineKey(
    menuItemId: string,
    sizeId: string | undefined,
    selectedOptions: SelectedOption[],
): string {
    const optionPart = [...selectedOptions]
        .map((o) => `${o.groupId}=${o.optionId}`)
        .sort()
        .join(',');
    return `${menuItemId}|${sizeId ?? '-'}|${optionPart}`;
}

/**
 * Per-unit price for a configured item: base/size price + sum of selected
 * option surcharges (with freeQuantity for multi groups).
 *
 * Pricing rules:
 *   - If the item has sizes[], the chosen size's priceCents replaces the
 *     base price. If no size is chosen yet, falls back to item.priceCents.
 *   - For each customization group:
 *       single → the picked option's surcharge is added in full.
 *       multi  → options are charged in selection order, with the first
 *                `freeQuantity` (if any) treated as 0 €.
 */
export function computeUnitPrice(
    item: MenuItem,
    sizeId: string | undefined,
    selectedOptions: SelectedOption[],
): number {
    let total = item.priceCents;
    if (item.sizes && item.sizes.length > 0) {
        const size = item.sizes.find((s) => s.id === sizeId) ?? item.sizes[0];
        total = size.priceCents;
    }

    for (const group of item.customizationGroups ?? []) {
        const picksInGroup = selectedOptions.filter((o) => o.groupId === group.id);
        if (picksInGroup.length === 0) continue;
        const free = group.type === 'multi' ? (group.freeQuantity ?? 0) : 0;
        picksInGroup.forEach((pick, idx) => {
            const opt = group.options.find((o) => o.id === pick.optionId);
            if (!opt) return;
            if (group.type === 'multi' && idx < free) return;
            total += opt.priceCents;
        });
    }
    return total;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [allCarts, setAllCarts] = useState<CartState>({});
    const [activeRestaurantSlug, setActiveRestaurantSlug] = useState<string | null>(null);
    const [menuById, setMenuById] = useState<Record<string, MenuItem>>({});
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    // Hydrate from localStorage on mount.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) setAllCarts(JSON.parse(raw));
        } catch {
            /* corrupt storage — ignore, start clean */
        }
        setHydrated(true);
    }, []);

    // Persist on every change after hydration.
    useEffect(() => {
        if (!hydrated || typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(allCarts));
        } catch {
            /* storage quota / privacy mode — silent */
        }
    }, [allCarts, hydrated]);

    const lines = useMemo<CartLine[]>(() => {
        if (!activeRestaurantSlug) return [];
        return allCarts[activeRestaurantSlug] ?? [];
    }, [allCarts, activeRestaurantSlug]);

    const setLines = useCallback(
        (updater: (prev: CartLine[]) => CartLine[]) => {
            if (!activeRestaurantSlug) return;
            setAllCarts((prev) => {
                const next = { ...prev };
                const prevLines = prev[activeRestaurantSlug] ?? [];
                const newLines = updater(prevLines);
                if (newLines.length === 0) {
                    delete next[activeRestaurantSlug];
                } else {
                    next[activeRestaurantSlug] = newLines;
                }
                return next;
            });
        },
        [activeRestaurantSlug],
    );

    const addLine = useCallback<CartContextValue['addLine']>(
        ({ menuItemId, quantity = 1, sizeId, selectedOptions = [] }) => {
            const lineId = computeLineKey(menuItemId, sizeId, selectedOptions);
            setLines((prev) => {
                const idx = prev.findIndex((l) => l.lineId === lineId);
                if (idx === -1) {
                    return [...prev, { lineId, menuItemId, quantity, sizeId, selectedOptions }];
                }
                const copy = [...prev];
                copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + quantity };
                return copy;
            });
        },
        [setLines],
    );

    const updateLineQty = useCallback(
        (lineId: string, qty: number) => {
            setLines((prev) => {
                if (qty <= 0) return prev.filter((l) => l.lineId !== lineId);
                return prev.map((l) => (l.lineId === lineId ? { ...l, quantity: qty } : l));
            });
        },
        [setLines],
    );

    const removeLine = useCallback(
        (lineId: string) => {
            setLines((prev) => prev.filter((l) => l.lineId !== lineId));
        },
        [setLines],
    );

    const clearCart = useCallback(() => setLines(() => []), [setLines]);

    const setMenu = useCallback((items: MenuItem[]) => {
        const map: Record<string, MenuItem> = {};
        for (const it of items) map[it.id] = it;
        setMenuById(map);
    }, []);

    const itemCount = useMemo(
        () => lines.reduce((acc, l) => acc + l.quantity, 0),
        [lines],
    );

    const subtotalCents = useMemo(
        () =>
            lines.reduce((acc, l) => {
                const item = menuById[l.menuItemId];
                if (!item) return acc;
                return acc + computeUnitPrice(item, l.sizeId, l.selectedOptions) * l.quantity;
            }, 0),
        [lines, menuById],
    );

    const value: CartContextValue = {
        activeRestaurantSlug,
        setActiveRestaurantSlug,
        lines,
        itemCount,
        menuById,
        setMenu,
        addLine,
        updateLineQty,
        removeLine,
        clearCart,
        subtotalCents,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within a CartProvider');
    return ctx;
}

export function formatEUR(cents: number): string {
    return (cents / 100).toLocaleString('fi-FI', { style: 'currency', currency: 'EUR' });
}
