import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../app/api/ai/route';
import { NextRequest } from 'next/server';

// Mock the Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: vi.fn().mockResolvedValue({ data: [], error: null })
    })
  })
}));

// Mock fetch for DeepSeek API
global.fetch = vi.fn();

describe('AI Chat API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'test-url';
    process.env.SUPABASE_SERVICE_ROLE = 'test-key';
    process.env.DEEPSEEK_API_KEY = 'test-key';
  });

  it('should return error when environment variables are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    const req = {
      json: vi.fn().mockResolvedValue({ q: 'test query' })
    } as unknown as NextRequest;
    
    const response = await POST(req);
    const json = await response.json();
    
    expect(response.status).toBe(500);
    expect(json.ok).toBe(false);
    expect(json.error).toBe('Missing Supabase environment variables');
  });

  it('should process query successfully', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: 'Test response' } }]
      })
    });
    
    const req = {
      json: vi.fn().mockResolvedValue({ q: 'sushi', city: 'Helsinki' })
    } as unknown as NextRequest;
    
    const response = await POST(req);
    const json = await response.json();
    
    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
  });
});