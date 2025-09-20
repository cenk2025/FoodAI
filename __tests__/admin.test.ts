import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../app/api/admin/commissions/import/route';
import { NextRequest } from 'next/server';

// Mock the Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: null })
    })
  })
}));

// Mock csv-parse
vi.mock('csv-parse/sync', () => ({
  parse: vi.fn().mockReturnValue([
    {
      conversion_id: 'test_1',
      provider_id: 'prov_1',
      offer_id: 'offer_1',
      clickout_id: '1001',
      gross_amount: '25.99',
      commission_amount: '2.60',
      currency: 'EUR',
      status: 'approved',
      occurred_at: '2025-09-15 14:30:00'
    }
  ])
}));

describe('Admin CSV Import API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'test-url';
    process.env.SUPABASE_SERVICE_ROLE = 'test-key';
  });

  it('should return error when no file is provided', async () => {
    const formData = new FormData();
    
    const req = {
      formData: vi.fn().mockResolvedValue(formData)
    } as unknown as NextRequest;
    
    const response = await POST(req);
    const json = await response.json();
    
    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(json.error).toBe('No file provided');
  });

  it('should process CSV file successfully', async () => {
    const formData = new FormData();
    formData.append('file', new File(['test,content\n1,2'], 'test.csv', { type: 'text/csv' }));
    
    const req = {
      formData: vi.fn().mockResolvedValue(formData)
    } as unknown as NextRequest;
    
    const response = await POST(req);
    
    expect(response.status).toBe(302);
  });
});