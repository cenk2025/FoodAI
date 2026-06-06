import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
    getRestaurantById,
    listMenuItems,
    listOrders,
} from '@/lib/direct-ordering/repository';
import AdminRestaurantClient from './AdminRestaurantClient';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export default async function AdminRestaurantDetailPage({ params }: Params) {
    const { id } = await params;
    const restaurant = await getRestaurantById(id);
    if (!restaurant) notFound();

    const [menuItems, orders] = await Promise.all([
        listMenuItems(restaurant.id),
        listOrders(restaurant.id),
    ]);

    return (
        <div className="min-h-screen bg-[#fffcf8] py-12 px-6">
            <div className="max-w-6xl mx-auto">
                <Link
                    href="/admin/restaurants"
                    className="text-xs font-black uppercase tracking-[0.2em] text-[#a08a7e] hover:text-[#d35400] transition-colors"
                >
                    ← Restaurants
                </Link>
                <header className="mt-3 mb-10 flex items-end justify-between gap-6 flex-wrap">
                    <div>
                        <h1 className="text-3xl font-black text-[#3d1d11] tracking-tight">
                            {restaurant.name}
                        </h1>
                        <p className="text-[#a08a7e] font-medium">
                            {restaurant.city} · /{restaurant.slug}
                        </p>
                    </div>
                    <Link
                        href={`/restaurant/${restaurant.slug}`}
                        target="_blank"
                        className="text-xs font-black uppercase tracking-[0.2em] bg-[#fdf2e2] text-[#3d1d11] hover:bg-[#f1ebd8] px-4 py-3 rounded-xl transition-colors"
                    >
                        Open public page ↗
                    </Link>
                </header>

                <AdminRestaurantClient
                    restaurantId={restaurant.id}
                    menuItems={menuItems}
                    orders={orders}
                />
            </div>
        </div>
    );
}
