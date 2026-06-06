import { notFound } from 'next/navigation';
import {
    getRestaurantBySlug,
    listMenuItems,
    getDeliveryZone,
} from '@/lib/direct-ordering/repository';
import RestaurantClient from '@/components/direct-ordering/RestaurantClient';

type Params = { params: Promise<{ slug: string }> };

export default async function RestaurantPage({ params }: Params) {
    const { slug } = await params;
    const restaurant = await getRestaurantBySlug(slug);
    if (!restaurant) notFound();

    const [menuItems, zone] = await Promise.all([
        listMenuItems(restaurant.id),
        getDeliveryZone(restaurant.id),
    ]);

    return <RestaurantClient restaurant={restaurant} menuItems={menuItems} zone={zone} />;
}

export async function generateMetadata({ params }: Params) {
    const { slug } = await params;
    const restaurant = await getRestaurantBySlug(slug);
    if (!restaurant) return { title: 'Restaurant not found' };
    return {
        title: `${restaurant.name} — Order directly`,
        description: restaurant.description,
    };
}
