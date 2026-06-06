'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import type { DirectRestaurant } from '@/lib/direct-ordering/types';
import { adminUpsertRestaurant, type AdminRestaurantFormResult } from './actions';

// Restaurant create / edit modal. Same UI for both flows — passing an
// `initial` restaurant switches it into edit mode (id hidden field set,
// fields prefilled, redirect skipped because we're already on the detail).

const JYVASKYLA = { lat: 62.2426, lon: 25.7473 };

type Props = {
    open: boolean;
    onClose: () => void;
    initial?: DirectRestaurant | null;
    /** When true, redirect to the new restaurant's detail page on success. */
    redirectOnCreate?: boolean;
};

export default function RestaurantFormModal({
    open, onClose, initial = null, redirectOnCreate = false,
}: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<AdminRestaurantFormResult | null>(null);

    const [nameDraft, setNameDraft] = useState(initial?.name ?? '');
    const [slugDraft, setSlugDraft] = useState(initial?.slug ?? '');

    if (!open) return null;
    const isEdit = !!initial;
    const slugPreview = slugDraft.trim() || autoSlug(nameDraft);

    return (
        <div
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => !isPending && onClose()}
        >
            <div
                className="bg-white rounded-[2rem] w-full max-w-xl overflow-hidden app-shadow flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between px-6 py-5 border-b border-[#f1ebd8]">
                    <h3 className="text-lg font-black text-[#3d1d11] tracking-tight">
                        {isEdit ? 'Edit restaurant' : 'Add restaurant'}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="w-9 h-9 rounded-full bg-[#fdf2e2] hover:bg-[#f1ebd8] text-[#3d1d11] flex items-center justify-center transition-colors disabled:opacity-50"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </header>

                <form
                    className="p-6 space-y-4 overflow-y-auto"
                    action={(fd) => {
                        if (isEdit && initial) fd.set('id', initial.id);
                        setServerError(null);
                        startTransition(async () => {
                            const result = await adminUpsertRestaurant(fd);
                            if (result.ok) {
                                onClose();
                                if (!isEdit && redirectOnCreate) {
                                    router.push(`/admin/restaurants/${result.id}`);
                                }
                                router.refresh();
                            } else {
                                setServerError(result);
                            }
                        });
                    }}
                >
                    <Field label="Name" required>
                        <input
                            name="name"
                            required
                            value={nameDraft}
                            onChange={(e) => setNameDraft(e.target.value)}
                            placeholder="e.g. Sushi Tampere"
                            className="form-input"
                        />
                    </Field>

                    <Field
                        label="Slug"
                        helper={`URL: /restaurant/${slugPreview || '…'}  ·  Auto-generated from name when empty`}
                    >
                        <input
                            name="slug"
                            value={slugDraft}
                            onChange={(e) => setSlugDraft(e.target.value)}
                            placeholder="auto"
                            className="form-input"
                        />
                    </Field>

                    <Field label="Description">
                        <textarea
                            name="description"
                            rows={2}
                            defaultValue={initial?.description ?? ''}
                            placeholder="Short tagline shown on the homepage banner / restaurant cover."
                            className="form-input"
                        />
                    </Field>

                    <div className="grid sm:grid-cols-2 gap-3">
                        <Field label="City">
                            <input
                                name="cityName"
                                defaultValue={initial?.city ?? 'Jyväskylä'}
                                className="form-input"
                            />
                        </Field>
                        <Field label="Address">
                            <input
                                name="address"
                                defaultValue={initial?.address ?? ''}
                                placeholder="e.g. Kauppakatu 25, 40100 Jyväskylä"
                                className="form-input"
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Latitude" required>
                            <input
                                name="lat"
                                type="number"
                                step="0.000001"
                                required
                                defaultValue={initial?.lat ?? JYVASKYLA.lat}
                                className="form-input"
                            />
                        </Field>
                        <Field label="Longitude" required>
                            <input
                                name="lon"
                                type="number"
                                step="0.000001"
                                required
                                defaultValue={initial?.lon ?? JYVASKYLA.lon}
                                className="form-input"
                            />
                        </Field>
                    </div>

                    <Field label="Logo URL">
                        <input
                            name="logoUrl"
                            defaultValue={initial?.logoUrl ?? ''}
                            placeholder="/images/restaurant-logo.svg"
                            className="form-input"
                        />
                    </Field>
                    <Field label="Cover image URL">
                        <input
                            name="coverUrl"
                            defaultValue={initial?.coverUrl ?? '/images/pizza.jpg'}
                            className="form-input"
                        />
                    </Field>

                    <div className="grid grid-cols-3 gap-3">
                        <Field label="Rating">
                            <input
                                name="rating"
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                defaultValue={initial?.rating ?? 4.5}
                                className="form-input"
                            />
                        </Field>
                        <Field label="ETA min (min)">
                            <input
                                name="etaMin"
                                type="number"
                                step="1"
                                min="0"
                                defaultValue={initial?.etaMin ?? 25}
                                className="form-input"
                            />
                        </Field>
                        <Field label="ETA max (min)">
                            <input
                                name="etaMax"
                                type="number"
                                step="1"
                                min="0"
                                defaultValue={initial?.etaMax ?? 40}
                                className="form-input"
                            />
                        </Field>
                    </div>

                    <label className="flex items-center gap-3 text-sm font-bold text-[#3d1d11]">
                        <input
                            type="checkbox"
                            name="isActive"
                            defaultChecked={initial?.isActive ?? true}
                            className="w-4 h-4"
                        />
                        Active (visible on the public site)
                    </label>

                    {!isEdit && (
                        <p className="text-xs text-[#a08a7e] bg-[#fdf2e2]/60 rounded-xl p-3">
                            A default delivery zone is provisioned around the restaurant
                            coordinates (5 km radius, 2,90 € fee, 15 € minimum). You can fine-tune
                            it later from the Settings tab.
                        </p>
                    )}

                    {serverError && !serverError.ok && (
                        <p className="text-sm font-bold text-red-600">
                            {serverError.message ?? `Could not save (${serverError.error}).`}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-3 border-t border-[#f1ebd8]">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-[#a08a7e] hover:text-[#3d1d11] disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="bg-[#3d1d11] hover:bg-[#d35400] disabled:bg-[#a08a7e] text-white rounded-xl px-6 py-3 text-xs font-black uppercase tracking-[0.2em] transition-colors"
                        >
                            {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create restaurant'}
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

function autoSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}
