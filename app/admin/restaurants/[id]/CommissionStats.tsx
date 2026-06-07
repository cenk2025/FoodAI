'use client';

import { useMemo } from 'react';
import { Coins, TrendingUp, ReceiptText, BarChart3 } from 'lucide-react';
import type { Order } from '@/lib/direct-ordering/types';
import { formatEUR } from '@/lib/direct-ordering/CartContext';

// Restaurant detail stat strip — rollups of FoodAi's commission on this
// restaurant's orders. Cancelled orders are excluded from every total
// (they generated no actual revenue). Numbers are computed client-side
// from the same orders array the Orders tab renders, so they always
// reconcile.

const MS_PER_DAY = 86_400_000;

export default function CommissionStats({ orders }: { orders: Order[] }) {
    const stats = useMemo(() => {
        const counted = orders.filter((o) => o.status !== 'cancelled');
        const grossCents = counted.reduce((acc, o) => acc + o.subtotalCents, 0);
        const commissionCents = counted.reduce((acc, o) => acc + o.commissionCents, 0);
        const last7 = Date.now() - 7 * MS_PER_DAY;
        const last7Commission = counted
            .filter((o) => Date.parse(o.createdAt) >= last7)
            .reduce((acc, o) => acc + o.commissionCents, 0);
        const avgRateBps =
            counted.length === 0
                ? 0
                : Math.round(
                      counted.reduce((acc, o) => acc + o.commissionRateBps, 0) /
                          counted.length,
                  );
        return {
            orderCount: counted.length,
            grossCents,
            commissionCents,
            last7Commission,
            avgRateBps,
        };
    }, [orders]);

    return (
        <div className="bg-white border border-[#f1ebd8] rounded-[2rem] p-6 app-shadow">
            <div className="flex items-end justify-between gap-4 mb-5">
                <div>
                    <h2 className="text-lg font-black text-[#3d1d11] tracking-tight">
                        FoodAi commission
                    </h2>
                    <p className="text-xs font-bold text-[#a08a7e]">
                        {stats.avgRateBps
                            ? `${(stats.avgRateBps / 100).toFixed(1)}% per order — snapshotted at order time`
                            : 'No completed orders yet'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<ReceiptText className="w-5 h-5" />}
                    label="Orders (excl. cancelled)"
                    value={String(stats.orderCount)}
                    accent="#3d1d11"
                />
                <StatCard
                    icon={<BarChart3 className="w-5 h-5" />}
                    label="Gross food sales"
                    value={formatEUR(stats.grossCents)}
                    sub="Subtotal sum"
                    accent="#3d1d11"
                />
                <StatCard
                    icon={<Coins className="w-5 h-5" />}
                    label="Commission earned"
                    value={formatEUR(stats.commissionCents)}
                    sub="All time"
                    accent="#d35400"
                />
                <StatCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="Last 7 days"
                    value={formatEUR(stats.last7Commission)}
                    sub="Commission this week"
                    accent="#d35400"
                />
            </div>
        </div>
    );
}

function StatCard({
    icon, label, value, sub, accent,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
    accent: string;
}) {
    return (
        <div className="bg-[#fffcf8] border border-[#f1ebd8] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
                <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: accent }}
                >
                    {icon}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#a08a7e]">
                    {label}
                </span>
            </div>
            <div>
                <p className="text-2xl font-black tracking-tight" style={{ color: accent }}>
                    {value}
                </p>
                {sub && <p className="text-[10px] font-bold text-[#a08a7e] mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}
