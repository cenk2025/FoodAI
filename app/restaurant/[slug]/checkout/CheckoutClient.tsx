'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type {
    DirectRestaurant,
    MenuItem,
    DeliveryZone,
} from '@/lib/direct-ordering/types';
import { computeUnitPrice, formatEUR, useCart } from '@/lib/direct-ordering/CartContext';
import { checkDeliveryZone, type ZoneCheckResult } from '@/lib/direct-ordering/delivery-zone';
import { useLanguage } from '@/lib/i18n/context';
import { placeOrder, type PlaceOrderResult } from './actions';

type Props = {
    restaurant: DirectRestaurant;
    menuItems: MenuItem[];
    zone: DeliveryZone | null;
};

export default function CheckoutClient({ restaurant, menuItems, zone }: Props) {
    const { t } = useLanguage();
    const router = useRouter();
    const { setActiveRestaurantSlug, setMenu, lines, subtotalCents, clearCart } = useCart();
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<PlaceOrderResult | null>(null);

    // Form state
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [street, setStreet] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [notes, setNotes] = useState('');
    const [zoneCheck, setZoneCheck] = useState<ZoneCheckResult | null>(null);

    // Wire the cart context to this restaurant on mount.
    useEffect(() => {
        setActiveRestaurantSlug(restaurant.slug);
        setMenu(menuItems);
    }, [restaurant.slug, menuItems, setActiveRestaurantSlug, setMenu]);

    const deliveryFee = useMemo(
        () => (zoneCheck?.inZone ? zoneCheck.feeCents : (zone?.feeCents ?? 0)),
        [zoneCheck, zone],
    );
    const total = subtotalCents + (zoneCheck?.inZone ? deliveryFee : 0);

    const minOrder = zone?.minOrderCents ?? 0;
    const belowMin = minOrder > 0 && subtotalCents < minOrder;

    const handleCheckZone = () => {
        const result = checkDeliveryZone(zone, { postalCode });
        setZoneCheck(result);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        // Re-check the zone right before submit to catch users who skipped the button.
        const zc = checkDeliveryZone(zone, { postalCode });
        setZoneCheck(zc);
        if (!zc.inZone) return;

        startTransition(async () => {
            const result = await placeOrder({
                slug: restaurant.slug,
                customerName,
                customerPhone,
                customerEmail: customerEmail || undefined,
                deliveryStreet: street,
                deliveryPostalCode: postalCode,
                notes: notes || undefined,
                cartLines: lines.map((l) => ({
                    menuItemId: l.menuItemId,
                    quantity: l.quantity,
                    sizeId: l.sizeId,
                    selectedOptions: l.selectedOptions,
                })),
            });

            if (result.ok) {
                clearCart();
                router.push(result.redirectUrl);
            } else {
                setServerError(result);
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#fffcf8] pb-32">
            <header className="bg-white border-b border-[#f1ebd8] px-6 py-5">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <Link
                        href={`/restaurant/${restaurant.slug}`}
                        className="w-10 h-10 rounded-full bg-[#fdf2e2] text-[#3d1d11] flex items-center justify-center hover:bg-[#f1ebd8] transition-colors"
                        aria-label={t.direct.restaurant.back}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d35400]">
                            {restaurant.name}
                        </p>
                        <h1 className="text-2xl font-black text-[#3d1d11] tracking-tight">
                            {t.direct.checkout.title}
                        </h1>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
                {/* Form column */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Contact */}
                    <fieldset className="bg-white rounded-[2rem] border border-[#f1ebd8] p-7 app-shadow space-y-4">
                        <legend className="text-xs font-black uppercase tracking-[0.2em] text-[#d35400] px-2">
                            {t.direct.checkout.contact}
                        </legend>
                        <Field label={t.direct.checkout.name} required>
                            <input
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                required
                                className="form-input"
                            />
                        </Field>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field label={t.direct.checkout.phone} required>
                                <input
                                    type="tel"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    required
                                    className="form-input"
                                />
                            </Field>
                            <Field label={t.direct.checkout.email}>
                                <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="form-input"
                                />
                            </Field>
                        </div>
                    </fieldset>

                    {/* Delivery */}
                    <fieldset className="bg-white rounded-[2rem] border border-[#f1ebd8] p-7 app-shadow space-y-4">
                        <legend className="text-xs font-black uppercase tracking-[0.2em] text-[#d35400] px-2">
                            {t.direct.checkout.delivery}
                        </legend>
                        <Field label={t.direct.checkout.street} required>
                            <input
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                required
                                className="form-input"
                            />
                        </Field>
                        <div className="grid sm:grid-cols-[1fr_1fr] gap-4">
                            <Field label={t.direct.checkout.postal_code} required>
                                <input
                                    value={postalCode}
                                    onChange={(e) => {
                                        setPostalCode(e.target.value);
                                        setZoneCheck(null);
                                    }}
                                    required
                                    inputMode="numeric"
                                    className="form-input"
                                />
                            </Field>
                            <Field label={t.direct.checkout.city}>
                                <input value={restaurant.city} disabled className="form-input" />
                            </Field>
                        </div>

                        <button
                            type="button"
                            onClick={handleCheckZone}
                            className="text-xs font-black uppercase tracking-[0.2em] text-[#d35400] hover:text-[#3d1d11] transition-colors"
                        >
                            {t.direct.checkout.check_zone}
                        </button>

                        {zoneCheck && (
                            <ZoneBanner result={zoneCheck} t={t} />
                        )}

                        <Field label={t.direct.checkout.notes}>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={t.direct.checkout.notes_placeholder}
                                rows={3}
                                className="form-input"
                            />
                        </Field>
                    </fieldset>

                    {/* CTA */}
                    <button
                        type="submit"
                        disabled={
                            isPending ||
                            lines.length === 0 ||
                            !zoneCheck?.inZone ||
                            belowMin
                        }
                        className="w-full bg-[#3d1d11] hover:bg-[#d35400] disabled:bg-[#a08a7e] disabled:cursor-not-allowed text-white rounded-2xl py-5 font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 transition-colors shadow-lg"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        {isPending ? t.direct.checkout.placing : t.direct.checkout.pay_with_shopify}
                    </button>

                    {belowMin && (
                        <p className="text-sm font-bold text-[#d35400] text-center">
                            {t.direct.checkout.error_min_order} ({formatEUR(minOrder)})
                        </p>
                    )}

                    {serverError && !serverError.ok && (
                        <p className="text-sm font-bold text-red-600 text-center">
                            {t.direct.checkout.error_generic}
                            {serverError.message ? ` (${serverError.message})` : ''}
                        </p>
                    )}
                </form>

                {/* Summary column */}
                <aside className="lg:sticky lg:top-8 self-start">
                    <div className="bg-white rounded-[2rem] border border-[#f1ebd8] p-7 app-shadow space-y-5">
                        <h2 className="text-lg font-black tracking-tight text-[#3d1d11]">
                            {t.direct.checkout.summary}
                        </h2>

                        {lines.length === 0 ? (
                            <p className="text-sm font-bold text-[#a08a7e]">{t.direct.cart.empty}</p>
                        ) : (
                            <ul className="space-y-3">
                                {lines.map((l) => {
                                    const item = menuItems.find((m) => m.id === l.menuItemId);
                                    if (!item) return null;
                                    const unit = computeUnitPrice(item, l.sizeId, l.selectedOptions);
                                    const sizeLabel = item.sizes?.find((s) => s.id === l.sizeId)?.label;
                                    const optionLabels = l.selectedOptions
                                        .map((sel) => {
                                            const g = item.customizationGroups?.find((x) => x.id === sel.groupId);
                                            return g?.options.find((o) => o.id === sel.optionId)?.label;
                                        })
                                        .filter((x): x is string => Boolean(x));
                                    return (
                                        <li
                                            key={l.lineId}
                                            className="flex justify-between gap-3 text-sm font-bold text-[#3d1d11]"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate">
                                                    {l.quantity}× {item.name}
                                                </p>
                                                {sizeLabel && (
                                                    <p className="text-xs font-medium text-[#a08a7e]">
                                                        {sizeLabel}
                                                    </p>
                                                )}
                                                {optionLabels.length > 0 && (
                                                    <p className="text-xs font-medium text-[#a08a7e] truncate">
                                                        + {optionLabels.join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="flex-shrink-0">{formatEUR(unit * l.quantity)}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        <div className="space-y-2 text-sm font-bold pt-3 border-t border-[#f1ebd8]">
                            <Row label={t.direct.cart.subtotal} value={formatEUR(subtotalCents)} />
                            <Row
                                label={t.direct.cart.delivery_fee}
                                value={
                                    zoneCheck?.inZone
                                        ? formatEUR(deliveryFee)
                                        : t.direct.cart.delivery_fee_at_checkout
                                }
                                muted={!zoneCheck?.inZone}
                            />
                            <Row
                                label={t.direct.cart.total}
                                value={formatEUR(total)}
                                bold
                            />
                        </div>
                    </div>
                </aside>
            </div>

            <style jsx>{`
                .form-input {
                    width: 100%;
                    background: #fffcf8;
                    border: 1px solid #f1ebd8;
                    border-radius: 1rem;
                    padding: 0.875rem 1rem;
                    font-size: 0.875rem;
                    color: #3d1d11;
                    transition: border-color 0.2s;
                }
                .form-input:focus {
                    outline: none;
                    border-color: #d35400;
                }
                .form-input:disabled {
                    background: #fdf2e2;
                    color: #a08a7e;
                }
            `}</style>
        </div>
    );
}

function Field({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <label className="block space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3d1d11]">
                {label}
                {required && <span className="text-[#d35400]"> *</span>}
            </span>
            {children}
        </label>
    );
}

function Row({
    label, value, muted, bold,
}: {
    label: string;
    value: string;
    muted?: boolean;
    bold?: boolean;
}) {
    return (
        <div
            className={`flex justify-between ${
                muted ? 'text-[#a08a7e]' : 'text-[#3d1d11]'
            } ${bold ? 'text-lg font-black pt-2 border-t border-[#f1ebd8]' : ''}`}
        >
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}

function ZoneBanner({
    result,
    t,
}: {
    result: ZoneCheckResult;
    t: ReturnType<typeof useLanguage>['t'];
}) {
    if (result.inZone) {
        return (
            <div className="flex items-center gap-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl px-4 py-3 text-sm font-bold">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                {t.direct.checkout.zone_in}
            </div>
        );
    }
    let msg = t.direct.checkout.zone_missing;
    if (result.reason === 'postal_code_not_allowed') msg = t.direct.checkout.zone_out_postal;
    else if (result.reason === 'out_of_radius') msg = t.direct.checkout.zone_out_radius;
    return (
        <div className="flex items-center gap-3 bg-red-50 text-red-800 border border-red-200 rounded-2xl px-4 py-3 text-sm font-bold">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            {msg}
        </div>
    );
}
