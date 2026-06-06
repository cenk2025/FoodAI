import { notFound } from 'next/navigation';
import {
    getRestaurantBySlug,
    listMenuItems,
    getDeliveryZone,
} from '@/lib/direct-ordering/repository';
import CheckoutClient from './CheckoutClient';

type Params = { params: Promise<{ slug: string }> };

export default async function CheckoutPage({ params }: Params) {
    const { slug } = await params;
    const restaurant = await getRestaurantBySlug(slug);
    if (!restaurant) notFound();

    const [menuItems, zone] = await Promise.all([
        listMenuItems(restaurant.id),
        getDeliveryZone(restaurant.id),
    ]);

    return (
        <CheckoutClient
            restaurant={restaurant}
            menuItems={menuItems}
            zone={zone}
        />
    );
}

export const metadata = { title: 'Checkout' };
