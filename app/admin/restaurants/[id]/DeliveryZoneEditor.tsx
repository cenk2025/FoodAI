'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { DeliveryZone } from '@/lib/direct-ordering/types';
import { adminUpsertDeliveryZone, type AdminDeliveryZoneResult } from '../actions';
import { UBER_EATS_DELIVERY_FEE_CENTS } from '@/lib/direct-ordering/constants';
import { formatEUR } from '@/lib/direct-ordering/CartContext';

// Settings-tab card: edit the delivery zone for this restaurant. Postal codes
// are entered as a comma- or newline-separated list; the server splits and
// dedupes them. Map / polygon editor is out of scope — we only expose the
// circular-zone fields the rest of the app currently uses.

const DEFAULTS = {
    centerLat: 62.2426,
    centerLon: 25.7473,
    radiusM: 5000,
    feeCents: 290,
    minOrderCents: 1500,
};

export default function DeliveryZoneEditor({
    restaurantId,
    zone,
}: {
    restaurantId: string;
    zone: DeliveryZone | null;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<AdminDeliveryZoneResult | null>(null);

    const initial = zone ?? { restaurantId, ...DEFAULTS, allowedPostalCodes: [] };

    return (
        <div className="bg-white border border-[#f1ebd8] rounded-[2rem] p-8 app-shadow space-y-5">
            <div>
                <h2 className="text-lg font-black text-[#3d1d11] tracking-tight">
                    Delivery zone
                </h2>
                <p className="text-sm text-[#a08a7e] font-medium">
                    Circular area around a center point. When postal codes are listed, the
                    checkout zone check uses them first; otherwise it falls back to the
                    Haversine radius.
                </p>
            </div>

            <form
                action={(fd) => {
                    fd.set('restaurantId', restaurantId);
                    setResult(null);
                    startTransition(async () => {
                        const r = await adminUpsertDeliveryZone(fd);
                        setResult(r);
                        if (r.ok) router.refresh();
                    });
                }}
                className="space-y-4"
            >
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Center latitude" required>
                        <input
                            name="centerLat"
                            type="number"
                            step="0.000001"
                            required
                            defaultValue={initial.centerLat}
                            className="form-input"
                        />
                    </Field>
                    <Field label="Center longitude" required>
                        <input
                            name="centerLon"
                            type="number"
                            step="0.000001"
                            required
                            defaultValue={initial.centerLon}
                            className="form-input"
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="Radius (m)" required>
                        <input
                            name="radiusM"
                            type="number"
                            step="100"
                            min="100"
                            required
                            defaultValue={initial.radiusM}
                            className="form-input"
                        />
                    </Field>
                    <Field label="Minimum order (€)" required>
                        <input
                            name="minOrderEuros"
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            defaultValue={(initial.minOrderCents / 100).toFixed(2)}
                            className="form-input"
                        />
                    </Field>
                </div>

                {/* Delivery fee no longer per-restaurant — kept for parity with
                    the existing zone shape but reported back as a read-only
                    info row. We still post the platform fee so the server keeps
                    the row in a consistent state. */}
                <input type="hidden" name="feeEuros" value={(UBER_EATS_DELIVERY_FEE_CENTS / 100).toFixed(2)} />
                <div className="bg-[#fdf2e2]/60 border border-[#f1ebd8] rounded-2xl px-4 py-3 text-xs font-bold text-[#3d1d11] space-y-0.5">
                    <p>
                        Delivery fee:{' '}
                        <span className="text-[#d35400]">
                            {formatEUR(UBER_EATS_DELIVERY_FEE_CENTS)}
                        </span>{' '}
                        — fixed by FoodAi (Uber Eats logistics)
                    </p>
                    <p className="font-medium text-[#a08a7e]">
                        Charged on top of the order subtotal. Restaurants don&apos;t set their own delivery fee.
                    </p>
                </div>

                <Field
                    label="Allowed postal codes"
                    helper="Comma- or newline-separated. Leave empty to fall back to the radius check only."
                >
                    <textarea
                        name="postalCodes"
                        rows={3}
                        defaultValue={initial.allowedPostalCodes.join(', ')}
                        placeholder="40100, 40200, 40500, 40700"
                        className="form-input"
                    />
                </Field>

                {result && (
                    result.ok ? (
                        <p className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                            Saved.
                        </p>
                    ) : (
                        <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            {result.message ?? `Could not save (${result.error}).`}
                        </p>
                    )
                )}

                <div className="flex justify-end pt-2 border-t border-[#f1ebd8]">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-[#3d1d11] hover:bg-[#d35400] disabled:bg-[#a08a7e] text-white rounded-xl px-6 py-3 text-xs font-black uppercase tracking-[0.2em] transition-colors"
                    >
                        {isPending ? 'Saving…' : 'Save delivery zone'}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .form-input {
                    width: 100%;
                    background: #fffcf8;
                    border: 1px solid #f1ebd8;
                    border-radius: 0.875rem;
                    padding: 0.75rem 1rem;
                    font-size: 0.875rem;
                    color: #3d1d11;
                }
                .form-input:focus {
                    outline: none;
                    border-color: #d35400;
                }
            `}</style>
        </div>
    );
}

function Field({
    label, required, helper, children,
}: {
    label: string;
    required?: boolean;
    helper?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3d1d11]">
                {label}
                {required && <span className="text-[#d35400]"> *</span>}
            </span>
            {children}
            {helper && (
                <span className="block text-[11px] font-medium text-[#a08a7e] mt-1">{helper}</span>
            )}
        </label>
    );
}
