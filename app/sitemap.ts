import {MetadataRoute} from 'next';
import {createSupabaseServer} from '@/lib/supabase/server';
import type {Offer} from '@/types/db';

// Define the type for the specific query result
type OfferIndexSitemap = Pick<Offer, 'id' | 'city' | 'provider_slug' | 'created_at'>;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sb = createSupabaseServer();
  const {data} = await sb
    .from('offer_index')
    .select('id,city,provider_slug,created_at')
    .limit(1000);

  const rows = (data ?? []) as OfferIndexSitemap[];

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  
  // Static pages for both locales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${base}/fi`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
      alternates: {
        languages: {
          en: `${base}/en`
        }
      }
    },
    {
      url: `${base}/en`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
      alternates: {
        languages: {
          fi: `${base}/fi`
        }
      }
    }
  ];

  // Offer pages for both locales
  const offerPages: MetadataRoute.Sitemap = rows.flatMap((r) => [
    {
      url: `${base}/fi/go/${r.id}`,
      lastModified: r.created_at ? new Date(r.created_at) : new Date(),
      changeFrequency: 'hourly',
      priority: 0.7,
      alternates: {
        languages: {
          en: `${base}/en/go/${r.id}`
        }
      }
    },
    {
      url: `${base}/en/go/${r.id}`,
      lastModified: r.created_at ? new Date(r.created_at) : new Date(),
      changeFrequency: 'hourly',
      priority: 0.7,
      alternates: {
        languages: {
          fi: `${base}/fi/go/${r.id}`
        }
      }
    }
  ]);

  return [...staticPages, ...offerPages];
}