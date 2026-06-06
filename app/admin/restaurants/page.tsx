import Link from 'next/link';
import { ArrowRight, Store } from 'lucide-react';
import { listRestaurants } from '@/lib/direct-ordering/repository';
import AddRestaurantButton from './AddRestaurantButton';

export const dynamic = 'force-dynamic';

export default async function AdminRestaurantsPage() {
    const restaurants = await listRestaurants();

    return (
        <div className="min-h-screen bg-[#fffcf8] py-16 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10 flex items-end justify-between gap-6 flex-wrap">
                    <div className="space-y-1">
                        <Link
                            href="/admin"
                            className="text-xs font-black uppercase tracking-[0.2em] text-[#a08a7e] hover:text-[#d35400] transition-colors"
                        >
                            ← Admin
                        </Link>
                        <h1 className="text-3xl font-black text-[#3d1d11] tracking-tight">
                            Restaurants (direct ordering)
                        </h1>
                        <p className="text-[#a08a7e] font-medium">
                            Manage menus and orders for restaurants selling directly through FoodAi.
                        </p>
                    </div>
                    <AddRestaurantButton />
                </div>

                {restaurants.length === 0 ? (
                    <div className="bg-white border border-[#f1ebd8] rounded-[2rem] p-12 text-center text-[#a08a7e]">
                        No restaurants yet.
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {restaurants.map((r) => (
                            <li key={r.id}>
                                <Link
                                    href={`/admin/restaurants/${r.id}`}
                                    className="group flex items-center gap-5 bg-white border border-[#f1ebd8] rounded-[2rem] p-6 app-shadow hover:border-[#d35400]/30 hover:-translate-y-0.5 transition-all"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-[#fdf2e2] text-[#d35400] flex items-center justify-center">
                                        <Store className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-lg font-black text-[#3d1d11] tracking-tight">
                                            {r.name}
                                        </h2>
                                        <p className="text-sm font-bold text-[#a08a7e]">
                                            {r.city} · /{r.slug}
                                        </p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-[#3d1d11] group-hover:text-[#d35400] transition-colors" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
