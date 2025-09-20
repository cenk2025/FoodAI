import { describe, it, expect, vi } from 'vitest';
import { allowIp } from '../lib/rate-limit';

describe('Rate Limiting', () => {
  it('should allow requests within the limit', () => {
    const ip = '192.168.1.1';
    
    // Allow 10 requests
    for (let i = 0; i < 10; i++) {
      expect(allowIp(ip)).toBe(true);
    }
  });

  it('should block requests exceeding the limit', () => {
    const ip = '192.168.1.2';
    
    // Allow 10 requests
    for (let i = 0; i < 10; i++) {
      allowIp(ip);
    }
    
    // Block the 11th request
    expect(allowIp(ip)).toBe(false);
  });

  it('should allow requests again after the window expires', () => {
    const ip = '192.168.1.3';
    
    // Mock Date.now to control time
    const now = Date.now();
    vi.useFakeTimers();
    vi.setSystemTime(now);
    
    // Allow 10 requests
    for (let i = 0; i < 10; i++) {
      allowIp(ip);
    }
    
    // Block the 11th request
    expect(allowIp(ip)).toBe(false);
    
    // Advance time by 1 minute
    vi.advanceTimersByTime(60001);
    
    // Allow requests again
    expect(allowIp(ip)).toBe(true);
    
    vi.useRealTimers();
  });
});