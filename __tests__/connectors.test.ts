import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Upserter } from '../lib/connectors/base';

// Mock the Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockImplementation(() => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'provider-id' }, error: null }),
      upsert: vi.fn().mockResolvedValue({ error: null })
    })
  }))
}));

describe('Provider Connectors', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'test-url';
    process.env.SUPABASE_SERVICE_ROLE = 'test-key';
  });

  it('should create Upserter instance', () => {
    const upserter = new Upserter();
    expect(upserter).toBeInstanceOf(Upserter);
  });

  it('should upsert offers successfully', async () => {
    const upserter = new Upserter();
    const offers = [
      {
        provider_slug: 'wolt',
        title: 'Test Offer',
        discounted_price: 10.99,
        deep_link: 'https://example.com/offer'
      }
    ];
    
    await expect(upserter.upsert('wolt', offers)).resolves.not.toThrow();
  });

  it('should handle empty offers array', async () => {
    const upserter = new Upserter();
    const offers: any[] = [];
    
    await expect(upserter.upsert('wolt', offers)).resolves.toBeUndefined();
  });
});