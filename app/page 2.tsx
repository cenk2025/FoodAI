import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const DealChat = dynamic(() => import('@/components/ai/chat'), { ssr: false });

export default async function Home() {
  const t = await getTranslations();
  
  return (
    <div className="p-6 space-y-8">
      <section className="max-w-2xl">
        <h1 className="text-4xl font-extrabold">{t('home.headline')}</h1>
        <p className="mt-2 opacity-80">{t('home.tagline')}</p>
        <form action="/offers" className="mt-6 flex gap-2">
          <input name="q" placeholder={t('home.search')} className="flex-1 border rounded-2xl px-4 py-3" />
          <button className="btn btn-primary">Etsi</button>
        </form>
      </section>
      
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/offers?city=Helsinki" className="block p-6 rounded-3xl border bg-[hsl(45_100%_50%)]">
          <h3 className="text-xl font-bold">Helsinki 🔥</h3>
          <p>Päivän kuumat diilit</p>
        </Link>
        <Link href="/offers?city=Jyväskylä" className="block p-6 rounded-3xl border bg-[hsl(5_90%_55%)] text-white">
          <h3 className="text-xl font-bold">Jyväskylä</h3>
          <p>Nopeat noudot & edulliset</p>
        </Link>
        <Link href="/offers?pickup=true" className="block p-6 rounded-3xl border">
          <h3 className="text-xl font-bold">Nouto -50%</h3>
          <p>Säästä heti</p>
        </Link>
      </section>
      
      <section className="mt-10">
        <h2 className="text-2xl font-bold mb-3">FoodAi Chatbot</h2>
        <DealChat />
      </section>
    </div>
  );
}