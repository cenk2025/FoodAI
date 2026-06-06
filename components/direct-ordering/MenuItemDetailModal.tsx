'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import type { CustomizationGroup, MenuItem } from '@/lib/direct-ordering/types';
import { computeUnitPrice, formatEUR, useCart } from '@/lib/direct-ordering/CartContext';
import { useLanguage } from '@/lib/i18n/context';

type Props = {
    item: MenuItem | null;
    onClose: () => void;
};

// Selected option = {groupId, optionId}. Order within a group matters for
// freeQuantity pricing (first N are free), so we maintain insertion order.
type SelOpt = { groupId: string; optionId: string };

export default function MenuItemDetailModal({ item, onClose }: Props) {
    const { t } = useLanguage();
    const { addLine, openCart } = useCart();

    const [qty, setQty] = useState(1);
    const [sizeId, setSizeId] = useState<string | undefined>(undefined);
    const [selected, setSelected] = useState<SelOpt[]>([]);

    // Reset state every time the modal opens with a fresh item.
    useEffect(() => {
        if (!item) return;
        setQty(1);
        const firstSize = item.sizes?.[0]?.id;
        setSizeId(firstSize);
        // For 'single' groups, pre-select the first option so the form starts in
        // a valid state — matches Wolt UX where a base is always pre-checked.
        const initialPicks: SelOpt[] = [];
        for (const g of item.customizationGroups ?? []) {
            if (g.type === 'single' && g.options[0]) {
                initialPicks.push({ groupId: g.id, optionId: g.options[0].id });
            }
        }
        setSelected(initialPicks);
    }, [item]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (item) {
            window.addEventListener('keydown', onKey);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [item, onClose]);

    const unitPrice = useMemo(
        () => (item ? computeUnitPrice(item, sizeId, selected) : 0),
        [item, sizeId, selected],
    );

    // Validation: every group's minSelect must be met, maxSelect respected.
    const validation = useMemo(() => {
        if (!item) return { ok: true, firstError: null as null | { groupId: string; need: number } };
        for (const g of item.customizationGroups ?? []) {
            const count = selected.filter((s) => s.groupId === g.id).length;
            if (count < g.minSelect) {
                return { ok: false, firstError: { groupId: g.id, need: g.minSelect - count } };
            }
        }
        return { ok: true, firstError: null };
    }, [item, selected]);

    if (!item) return null;

    const toggleSingle = (groupId: string, optionId: string) => {
        setSelected((prev) => [
            ...prev.filter((s) => s.groupId !== groupId),
            { groupId, optionId },
        ]);
    };

    const toggleMulti = (group: CustomizationGroup, optionId: string) => {
        setSelected((prev) => {
            const has = prev.some((s) => s.groupId === group.id && s.optionId === optionId);
            if (has) return prev.filter((s) => !(s.groupId === group.id && s.optionId === optionId));
            // Cap on maxSelect.
            if (group.maxSelect != null) {
                const count = prev.filter((s) => s.groupId === group.id).length;
                if (count >= group.maxSelect) return prev;
            }
            return [...prev, { groupId: group.id, optionId }];
        });
    };

    const handleAdd = () => {
        if (!validation.ok) return;
        addLine({
            menuItemId: item.id,
            quantity: qty,
            sizeId,
            selectedOptions: selected,
        });
        onClose();
        setTimeout(() => openCart(), 60);
    };

    const isSelected = (groupId: string, optionId: string) =>
        selected.some((s) => s.groupId === groupId && s.optionId === optionId);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-6"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={item.name}
        >
            <div
                className="bg-white w-full sm:max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden app-shadow flex flex-col max-h-[92vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Sticky header (matches Wolt: title + close, always visible while scrolling) */}
                <header className="relative flex items-center justify-between px-6 py-4 border-b border-[#f1ebd8] bg-white z-10">
                    <h2 className="text-base font-black text-[#3d1d11] tracking-tight truncate pr-10">
                        {item.name}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white border border-[#f1ebd8] text-[#3d1d11] flex items-center justify-center hover:bg-[#fdf2e2] transition-colors"
                        aria-label={t.direct.item.close}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </header>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {/* Image */}
                    {item.imageUrl && (
                        <div className="relative h-48 sm:h-56 bg-[#fdf2e2]">
                            <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    <div className="p-6 sm:p-8 space-y-7">
                        {item.description && (
                            <p className="text-sm text-[#a08a7e] font-medium leading-relaxed">
                                {item.description}
                            </p>
                        )}

                        {/* Size group */}
                        {item.sizes && item.sizes.length > 0 && (
                            <Section title={t.direct.item.size}>
                                <ul className="divide-y divide-[#f1ebd8]">
                                    {item.sizes.map((s) => (
                                        <li key={s.id}>
                                            <label className="flex items-center justify-between py-3 cursor-pointer group">
                                                <span className="flex items-center gap-3">
                                                    <Radio checked={sizeId === s.id} />
                                                    <span className="font-bold text-[#3d1d11] group-hover:text-[#d35400] transition-colors">
                                                        {s.label}
                                                    </span>
                                                </span>
                                                <span className="text-sm font-black text-[#3d1d11]">
                                                    {formatEUR(s.priceCents)}
                                                </span>
                                                <input
                                                    type="radio"
                                                    name="size"
                                                    value={s.id}
                                                    checked={sizeId === s.id}
                                                    onChange={() => setSizeId(s.id)}
                                                    className="sr-only"
                                                />
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </Section>
                        )}

                        {/* Customization groups */}
                        {item.customizationGroups?.map((group) => (
                            <Section
                                key={group.id}
                                title={group.label}
                                helper={
                                    group.helperText ??
                                    helperFromGroup(group, t.direct.item.choose_at_least)
                                }
                            >
                                <ul className="divide-y divide-[#f1ebd8]">
                                    {group.options.map((opt) => {
                                        const checked = isSelected(group.id, opt.id);
                                        return (
                                            <li key={opt.id}>
                                                <label className="flex items-center justify-between py-3 cursor-pointer group">
                                                    <span className="flex items-center gap-3">
                                                        {group.type === 'single' ? (
                                                            <Radio checked={checked} />
                                                        ) : (
                                                            <Checkbox checked={checked} />
                                                        )}
                                                        <span
                                                            className={`font-bold transition-colors ${
                                                                checked
                                                                    ? 'text-[#3d1d11]'
                                                                    : 'text-[#3d1d11] group-hover:text-[#d35400]'
                                                            }`}
                                                        >
                                                            {opt.label}
                                                        </span>
                                                    </span>
                                                    <span
                                                        className={`text-sm font-black ${
                                                            opt.priceCents === 0
                                                                ? 'text-[#a08a7e]'
                                                                : 'text-[#3d1d11]'
                                                        }`}
                                                    >
                                                        {opt.priceCents === 0
                                                            ? '—'
                                                            : `+${formatEUR(opt.priceCents)}`}
                                                    </span>
                                                    <input
                                                        type={group.type === 'single' ? 'radio' : 'checkbox'}
                                                        name={group.id}
                                                        value={opt.id}
                                                        checked={checked}
                                                        onChange={() =>
                                                            group.type === 'single'
                                                                ? toggleSingle(group.id, opt.id)
                                                                : toggleMulti(group, opt.id)
                                                        }
                                                        className="sr-only"
                                                    />
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </Section>
                        ))}
                    </div>
                </div>

                {/* Sticky footer with quantity + add CTA */}
                <footer className="border-t border-[#f1ebd8] p-4 sm:p-5 flex items-center gap-3 bg-white">
                    {/* Qty stepper */}
                    <div className="flex items-center gap-2 bg-[#fdf2e2]/70 rounded-full px-2 py-1.5">
                        <button
                            type="button"
                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                            className="w-9 h-9 rounded-full bg-white text-[#3d1d11] flex items-center justify-center shadow-sm hover:bg-[#fdf2e2] transition-colors"
                            aria-label="-"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-7 text-center font-black text-[#3d1d11]">{qty}</span>
                        <button
                            type="button"
                            onClick={() => setQty((q) => q + 1)}
                            className="w-9 h-9 rounded-full bg-white text-[#3d1d11] flex items-center justify-center shadow-sm hover:bg-[#fdf2e2] transition-colors"
                            aria-label="+"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Add CTA */}
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={!validation.ok}
                        className={`flex-1 rounded-full py-4 px-5 font-black text-sm flex items-center justify-between gap-3 transition-colors shadow-lg ${
                            validation.ok
                                ? 'bg-[#3d1d11] hover:bg-[#d35400] text-white'
                                : 'bg-[#fdf2e2] text-[#a08a7e] cursor-not-allowed'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" />
                            {validation.ok
                                ? t.direct.item.add_to_cart
                                : t.direct.item.choose_at_least.replace(
                                      '{n}',
                                      String(validation.firstError?.need ?? 1),
                                  )}
                        </span>
                        <span>{formatEUR(unitPrice * qty)}</span>
                    </button>
                </footer>
            </div>
        </div>
    );
}

function Section({
    title,
    helper,
    children,
}: {
    title: string;
    helper?: string;
    children: React.ReactNode;
}) {
    return (
        <section>
            <header className="mb-1">
                <h3 className="text-base font-black text-[#3d1d11] tracking-tight">{title}</h3>
                {helper && (
                    <p className="text-xs font-bold text-[#a08a7e] mt-1">{helper}</p>
                )}
            </header>
            {children}
        </section>
    );
}

function Radio({ checked }: { checked: boolean }) {
    return (
        <span
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                checked ? 'border-[#d35400] bg-white' : 'border-[#a08a7e]'
            }`}
            aria-hidden="true"
        >
            {checked && <span className="w-2.5 h-2.5 rounded-full bg-[#d35400]" />}
        </span>
    );
}

function Checkbox({ checked }: { checked: boolean }) {
    return (
        <span
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                checked ? 'border-[#d35400] bg-[#d35400]' : 'border-[#a08a7e] bg-white'
            }`}
            aria-hidden="true"
        >
            {checked && (
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 12l5 5L20 7" />
                </svg>
            )}
        </span>
    );
}

function helperFromGroup(group: CustomizationGroup, tpl: string): string | undefined {
    if (group.minSelect > 0) return tpl.replace('{n}', String(group.minSelect));
    return undefined;
}
