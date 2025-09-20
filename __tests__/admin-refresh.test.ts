import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../app/api/admin/refresh-index/route';
import { NextRequest } from 'next/server';

// Mock the Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    rpc: vi.fn().mockResolvedValue({ error: null })
  })
}));

describe('Admin Refresh Endpoint', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.CRON_TOKEN = 'test-token';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'test-url';
    process.env.SUPABASE_SERVICE_ROLE = 'test-key';
  });

  it('should return 401 when token is missing', async () => {
    const req = {
      headers: {
        get: vi.fn().mockReturnValue(null)
      }
    } as unknown as NextRequest;
    
    const response = await POST(req);
    const json = await response.json();
    
    expect(response.status).toBe(401);
    expect(json.ok).toBe(false);
  });

  it('should return 401 when token is invalid', async () => {
    const req = {
      headers: {
        get: vi.fn().mockReturnValue('invalid-token')
      }
    } as unknown as NextRequest;
    
    const response = await POST(req);
    const json = await response.json();
    
    expect(response.status).toBe(401);
    expect(json.ok).toBe(false);
  });

  it('should refresh materialized view when token is valid', async () => {
    const req = {
      headers: {
        get: vi.fn().mockReturnValue('test-token')
      }
    } as unknown as NextRequest;
    
    const response = await POST(req);
    const json = await response.json();
    
    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
  });
});