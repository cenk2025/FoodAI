import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
    getRestaurantById,
    listMenuItems,
    listOrders,
    getDeliveryZone,
} from '@/lib/direct-ordering/repository';
import AdminRestaurantClient from './AdminRestaurantClient';
import RestaurantHeader from './RestaurantHeader';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export default async function AdminRestaurantDetailPage({ params }: Params) {
    const { id } = await params;
    const restaurant = await getRestaurantById(id);
    if (!restaurant) notFound();

    const [menuItems, orders, zone] = await Promise.all([
        listMenuItems(restaurant.id),
        listOrders(restaurant.id),
        getDeliveryZone(restaurant.id),
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
                <RestaurantHeader restaurant={restaurant} />

                <AdminRestaurantClient
                    restaurant={restaurant}
                    menuItems={menuItems}
                    orders={orders}
                    zone={zone}
                />
            </div>
        </div>
    );
}
