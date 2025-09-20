export type RawItem = any;

export type Offer = {
  provider_slug: string;
  title: string;
  description?: string;
  original_price?: number;
  discounted_price: number;
  currency?: string;
  pickup?: boolean;
  delivery?: boolean;
  city?: string;
  deep_link: string;
  image_url?: string;
  tags?: string[];
};