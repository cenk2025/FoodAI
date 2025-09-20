import { describe, it, expect, beforeEach, vi } from 'vitest';
import { assertAdmin } from '../app/(guards)/admin/guard';
import { assertAuth } from '../app/(guards)/auth/guard';

// Mock next/navigation
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: mockRedirect
}));

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServer: vi.fn().mockReturnValue({
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    })
  })
}));

describe('Route Guards', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('assertAuth', () => {
    it('should redirect to signin when user is not authenticated', async () => {
      const { createSupabaseServer } = await import('@/lib/supabase/server');
      (createSupabaseServer as any).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } })
        }
      });

      await assertAuth();
      expect(mockRedirect).toHaveBeenCalledWith('/auth/signin');
    });

    it('should not redirect when user is authenticated', async () => {
      const { createSupabaseServer } = await import('@/lib/supabase/server');
      (createSupabaseServer as any).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-id' } } })
        }
      });

      await assertAuth();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('assertAdmin', () => {
    it('should redirect to signin when user is not authenticated', async () => {
      const { createSupabaseServer } = await import('@/lib/supabase/server');
      (createSupabaseServer as any).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } })
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      });

      await assertAdmin();
      expect(mockRedirect).toHaveBeenCalledWith('/auth/signin');
    });

    it('should redirect to dashboard when user is not admin', async () => {
      const { createSupabaseServer } = await import('@/lib/supabase/server');
      (createSupabaseServer as any).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-id' } } })
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { is_admin: false }, error: null })
        })
      });

      await assertAdmin();
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
    });

    it('should not redirect when user is admin', async () => {
      const { createSupabaseServer } = await import('@/lib/supabase/server');
      (createSupabaseServer as any).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-id' } } })
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { is_admin: true }, error: null })
        })
      });

      await assertAdmin();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });
});