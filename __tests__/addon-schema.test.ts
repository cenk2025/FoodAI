import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Supabase client for testing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

describe('Addon Schema Tests', () => {
  // Test data
  let testUserId: string;
  let testOfferId: string;
  let testProviderId: string;

  beforeAll(async () => {
    // Create test user
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email: 'test-addon@example.com',
      password: 'password123'
    });
    
    if (userError) throw userError;
    testUserId = userData.user?.id || '';
    
    // Create test provider
    const { data: providerData, error: providerError } = await supabase
      .from('providers')
      .insert([{
        name: 'Test Provider',
        slug: 'test-provider'
      }])
      .select()
      .single();
    
    if (providerError) throw providerError;
    testProviderId = providerData?.id;
    
    // Create test offer
    const { data: offerData, error: offerError } = await supabase
      .from('offers')
      .insert([{
        provider_id: testProviderId,
        title: 'Test Offer',
        discounted_price: 10.00
      }])
      .select()
      .single();
    
    if (offerError) throw offerError;
    testOfferId = offerData?.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testOfferId) {
      await supabase.from('offers').delete().eq('id', testOfferId);
    }
    if (testProviderId) {
      await supabase.from('providers').delete().eq('id', testProviderId);
    }
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  it('should create and read clickout', async () => {
    // Insert clickout
    const { data, error } = await supabase
      .from('clickouts')
      .insert([{
        offer_id: testOfferId,
        provider_id: testProviderId,
        user_id: testUserId,
        ip: '127.0.0.1',
        ua: 'test-agent'
      }])
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.offer_id).toBe(testOfferId);
    
    // Read clickout
    const { data: readData, error: readError } = await supabase
      .from('clickouts')
      .select('*')
      .eq('id', data?.id)
      .single();
    
    expect(readError).toBeNull();
    expect(readData).toBeDefined();
  });

  it('should create and manage favorite', async () => {
    // Insert favorite
    const { data, error } = await supabase
      .from('favorites')
      .insert([{
        user_id: testUserId,
        offer_id: testOfferId
      }])
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.user_id).toBe(testUserId);
    expect(data?.offer_id).toBe(testOfferId);
    
    // Read favorite
    const { data: readData, error: readError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', testUserId)
      .eq('offer_id', testOfferId)
      .single();
    
    expect(readError).toBeNull();
    expect(readData).toBeDefined();
    
    // Delete favorite
    const { error: deleteError } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', testUserId)
      .eq('offer_id', testOfferId);
    
    expect(deleteError).toBeNull();
  });

  it('should create and manage alert', async () => {
    // Insert alert
    const { data, error } = await supabase
      .from('alerts')
      .insert([{
        user_id: testUserId,
        city: 'Helsinki',
        cuisine: ['pizza', 'sushi'],
        discount_min: 20,
        price_max: 15.00,
        pickup: true,
        delivery: false
      }])
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.user_id).toBe(testUserId);
    expect(data?.city).toBe('Helsinki');
    expect(data?.cuisine).toEqual(['pizza', 'sushi']);
    
    // Read alert
    const { data: readData, error: readError } = await supabase
      .from('alerts')
      .select('*')
      .eq('id', data?.id)
      .single();
    
    expect(readError).toBeNull();
    expect(readData).toBeDefined();
    
    // Update alert
    const { data: updateData, error: updateError } = await supabase
      .from('alerts')
      .update({ active: false })
      .eq('id', data?.id)
      .select()
      .single();
    
    expect(updateError).toBeNull();
    expect(updateData?.active).toBe(false);
  });

  it('should create commission', async () => {
    // First create a clickout
    const { data: clickoutData, error: clickoutError } = await supabase
      .from('clickouts')
      .insert([{
        offer_id: testOfferId,
        provider_id: testProviderId,
        user_id: testUserId
      }])
      .select()
      .single();

    expect(clickoutError).toBeNull();
    
    // Insert commission
    const { data, error } = await supabase
      .from('commissions')
      .insert([{
        provider_id: testProviderId,
        external_conversion_id: 'test-conversion-123',
        clickout_id: clickoutData?.id,
        offer_id: testOfferId,
        gross_amount: 50.00,
        commission_amount: 5.00,
        currency: 'EUR',
        status: 'pending',
        occurred_at: new Date()
      }])
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.provider_id).toBe(testProviderId);
    expect(data?.commission_amount).toBe(5.00);
  });

  it('should call admin RPC functions', async () => {
    // Test admin_click_summary
    const { data: summaryData, error: summaryError } = await supabase
      .rpc('admin_click_summary');
    
    expect(summaryError).toBeNull();
    expect(summaryData).toBeDefined();
    
    // Test admin_clicks_by_provider
    const { data: providerData, error: providerError } = await supabase
      .rpc('admin_clicks_by_provider');
    
    expect(providerError).toBeNull();
    expect(providerData).toBeDefined();
    
    // Test admin_clicks_by_city
    const { data: cityData, error: cityError } = await supabase
      .rpc('admin_clicks_by_city');
    
    expect(cityError).toBeNull();
    expect(cityData).toBeDefined();
    
    // Test admin_revenue_30d
    const { data: revenueData, error: revenueError } = await supabase
      .rpc('admin_revenue_30d');
    
    expect(revenueError).toBeNull();
    expect(revenueData).toBeDefined();
  });
});