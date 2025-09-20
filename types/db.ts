// Add JSX and React type declarations
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare const process: {
  env: {
    [key: string]: string | undefined;
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  };
};

export type UUID = string;

export type Provider = {
  id: UUID;
  name: string;
  slug: string;
  website?: string | null;
};

export type OfferStatus = 'active' | 'inactive';

export type Offer = {
  id: UUID;
  provider_id: UUID;
  restaurant_id?: UUID | null;
  title: string;
  description?: string | null;
  city: string;
  cuisine?: string | null;
  original_price: number;
  discounted_price: number;
  discount_percent: number; // computed in view; keep for UI
  pickup: boolean;
  delivery: boolean;
  deep_link?: string | null;
  image_url?: string | null;
  status: OfferStatus;
  created_at: string; // timestamp
  provider_slug?: string | null; // from view
  restaurant_name?: string | null; // from view
};

export type OfferFilters = {
  city?: string;
  cuisine?: string;
  discount_min?: number;
  price_max?: number;
  pickup?: boolean;
  delivery?: boolean;
};

export type ClickRow = {
  offer_id: UUID;
  provider_id?: UUID;
  clicks?: number;
  unique_clicks?: number;
  revenue?: number;
  date?: string;
};

export type ClickInsert = {
  offer_id: UUID;
  provider_id: UUID;
  ua: string;
  ip: string;
};

export type ClickSummary = {
  cnt: number;
};