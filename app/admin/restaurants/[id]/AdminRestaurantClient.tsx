'use client';

import { useState, useTransition } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import type { MenuItem, Order } from '@/lib/direct-ordering/types';
import { formatEUR } from '@/lib/direct-ordering/CartContext';
import {
    adminUpsertMenuItem,
    adminDeleteMenuItem,
} from '../actions';

type Props = {
    restaurantId: string;
    menuItems: MenuItem[];
    orders: Order[];
};

type Tab = 'menu' | 'orders';

export default function AdminRestaurantClient({ restaurantId, menuItems, orders }: Props) {
    const [tab, setTab] = useState<Tab>('menu');
    const [editing, setEditing] = useState<MenuItem | 'new' | null>(null);
    const [isPending, startTransition] = useTransition();

    return (
        <div className="space-y-8">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-[#f1ebd8]">
                <TabButton active={tab === 'menu'} onClick={() => setTab('menu')}>
                    Menu ({menuItems.length})
                </TabButton>
                <TabButton active={tab === 'orders'} onClick={() => setTab('orders')}>
                    Orders ({orders.length})
                </TabButton>
            </div>

            {tab === 'menu' && (
                <section className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setEditing('new')}
                            className="inline-flex items-center gap-2 bg-[#3d1d11] hover:bg-[#d35400] text-white rounded-xl px-5 py-3 text-xs font-black uppercase tracking-[0.2em] transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add item
                        </button>
                    </div>

                    {menuItems.length === 0 ? (
                        <p className="text-center text-[#a08a7e] py-12 bg-white rounded-2xl border border-[#f1ebd8]">
                            No menu items yet.
                        </p>
                    ) : (
                        <ul className="bg-white border border-[#f1ebd8] rounded-[2rem] divide-y divide-[#f1ebd8] overflow-hidden">
                            {menuItems.map((item) => (
                                <li
                                    key={item.id}
                                    className="p-5 flex items-center gap-5 hover:bg-[#fffcf8] transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-[#3d1d11] truncate">
                                            {item.name}
                                        </h3>
                                        <p className="text-sm font-medium text-[#a08a7e] line-clamp-1">
                                            {item.description}
                                        </p>
                                    </div>
                                    <span className="text-sm font-black text-[#3d1d11]">
                                        {formatEUR(item.priceCents)}
                                    </span>
                                    <span
                                        className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                                            item.isAvailable
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-red-50 text-red-700'
                                        }`}
                                    >
                                        {item.isAvailable ? 'Available' : 'Hidden'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setEditing(item)}
                                        className="w-9 h-9 rounded-full bg-[#fdf2e2] hover:bg-[#f1ebd8] text-[#3d1d11] flex items-center justify-center transition-colors"
                                        aria-label="Edit"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <form
                                        action={(fd) => {
                                            fd.set('restaurantId', restaurantId);
                                            fd.set('id', item.id);
                                            startTransition(() => {
                                                adminDeleteMenuItem(fd);
                                            });
                                        }}
                                    >
                                        <button
                                            type="submit"
                                            className="w-9 h-9 rounded-full hover:bg-red-50 text-red-600 flex items-center justify-center transition-colors"
                                            aria-label="Delete"
                                            disabled={isPending}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </form>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}

            {tab === 'orders' && (
                <section>
                    {orders.length === 0 ? (
                        <p className="text-center text-[#a08a7e] py-12 bg-white rounded-2xl border border-[#f1ebd8]">
                            No orders yet.
                        </p>
                    ) : (
                        <div className="bg-white border border-[#f1ebd8] rounded-[2rem] overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-[#fdf2e2]/60 text-xs font-black uppercase tracking-widest text-[#a08a7e]">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Customer</th>
                                        <th className="px-6 py-4 text-left">Address</th>
                                        <th className="px-6 py-4 text-left">Items</th>
                                        <th className="px-6 py-4 text-right">Total</th>
                                        <th className="px-6 py-4 text-left">Status</th>
                                        <th className="px-6 py-4 text-left">Placed</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f1ebd8]">
                                    {orders.map((o) => (
                                        <tr key={o.id} className="hover:bg-[#fffcf8]">
                                            <td className="px-6 py-4 font-bold text-[#3d1d11]">
                                                {o.customerName}
                                                <div className="text-xs font-medium text-[#a08a7e]">
                                                    {o.customerPhone}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[#3d1d11] font-medium">
                                                {o.deliveryAddress}
                                                <div className="text-xs text-[#a08a7e]">
                                                    {o.deliveryPostalCode}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[#3d1d11] font-medium">
                                                <ul className="space-y-1">
                                                    {o.items.map((i, idx) => (
                                                        <li key={idx}>
                                                            <span className="font-bold">
                                                                {i.quantity}× {i.nameSnapshot}
                                                                {i.sizeLabel ? ` (${i.sizeLabel})` : ''}
                                                            </span>
                                                            {i.options.length > 0 && (
                                                                <span className="block text-xs text-[#a08a7e] font-medium">
                                                                    + {i.options.map((o) => o.optionLabel).join(', ')}
                                                                </span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-[#3d1d11]">
                                                {formatEUR(o.totalCents)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest bg-[#fdf2e2] text-[#3d1d11] px-2 py-1 rounded-lg">
                                                    {o.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-[#a08a7e] font-medium">
                                                {new Date(o.createdAt).toLocaleString('fi-FI')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            {editing && (
                <ItemFormModal
                    restaurantId={restaurantId}
                    item={editing === 'new' ? null : editing}
                    onClose={() => setEditing(null)}
                    onSubmitting={(p) => startTransition(p)}
                />
            )}
        </div>
    );
}

function TabButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-5 py-3 text-xs font-black uppercase tracking-[0.2em] border-b-2 transition-colors ${
                active
                    ? 'border-[#d35400] text-[#3d1d11]'
                    : 'border-transparent text-[#a08a7e] hover:text-[#3d1d11]'
            }`}
        >
            {children}
        </button>
    );
}

function ItemFormModal({
    restaurantId,
    item,
    onClose,
    onSubmitting,
}: {
    restaurantId: string;
    item: MenuItem | null;
    onClose: () => void;
    onSubmitting: (p: () => void) => void;
}) {
    return (
        <div
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden app-shadow"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between px-6 py-5 border-b border-[#f1ebd8]">
                    <h3 className="text-lg font-black text-[#3d1d11] tracking-tight">
                        {item ? 'Edit item' : 'Add item'}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-[#fdf2e2] hover:bg-[#f1ebd8] text-[#3d1d11] flex items-center justify-center transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </header>

                <form
                    className="p-6 space-y-4"
                    action={(fd) => {
                        fd.set('restaurantId', restaurantId);
                        if (item) fd.set('id', item.id);
                        onSubmitting(async () => {
                            await adminUpsertMenuItem(fd);
                            onClose();
                        });
                    }}
                >
                    <Field label="Name" required>
                        <input
                            name="name"
                            required
                            defaultValue={item?.name ?? ''}
                            className="form-input"
                        />
                    </Field>
                    <Field label="Description">
                        <textarea
                            name="description"
                            rows={3}
                            defaultValue={item?.description ?? ''}
                            className="form-input"
                        />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Price (€)" required>
                            <input
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                defaultValue={item ? (item.priceCents / 100).toFixed(2) : ''}
                                className="form-input"
                            />
                        </Field>
                        <Field label="Sort order">
                            <input
                                name="sortOrder"
                                type="number"
                                step="1"
                                min="0"
                                defaultValue={item?.sortOrder ?? 99}
                                className="form-input"
                            />
                        </Field>
                    </div>
                    <Field label="Image URL">
                        <input
                            name="imageUrl"
                            defaultValue={item?.imageUrl ?? '/images/pizza.jpg'}
                            className="form-input"
                        />
                    </Field>
                    <Field label="Category">
                        <input
                            name="category"
                            defaultValue={item?.category ?? 'Pizza'}
                            className="form-input"
                        />
                    </Field>
                    <label className="flex items-center gap-3 text-sm font-bold text-[#3d1d11]">
                        <input
                            type="checkbox"
                            name="isAvailable"
                            defaultChecked={item?.isAvailable ?? true}
                            className="w-4 h-4"
                        />
                        Available
                    </label>

                    <div className="flex justify-end gap-3 pt-3 border-t border-[#f1ebd8]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-[#a08a7e] hover:text-[#3d1d11]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-[#3d1d11] hover:bg-[#d35400] text-white rounded-xl px-6 py-3 text-xs font-black uppercase tracking-[0.2em] transition-colors"
                        >
                            Save
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
