import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import { Database } from '@/types/supabase';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File;
    if (!file) return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 });

    // Check file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return NextResponse.json({ ok: false, error: 'Invalid file type. Please upload a CSV file.' }, { status: 400 });
    }

    const csv = await file.text();
    const rows = parse(csv, { columns: true, skip_empty_lines: true });

    // Validate required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
      return NextResponse.json({ ok: false, error: 'Missing Supabase environment variables' }, { status: 500 });
    }

    const admin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    );
    
    const payload = rows.map((r: any) => ({
      external_conversion_id: r.conversion_id,
      provider_id: r.provider_id,
      offer_id: r.offer_id || null,
      clickout_id: r.clickout_id ? Number(r.clickout_id) : null,
      gross_amount: Number(r.gross_amount || 0),
      commission_amount: Number(r.commission_amount || 0),
      currency: r.currency || 'EUR',
      status: (r.status || 'pending') as any,
      occurred_at: r.occurred_at ? new Date(r.occurred_at).toISOString() : null
    }));

    const { error } = await admin.from('commissions').upsert(payload as any, { 
      onConflict: 'provider_id,external_conversion_id' 
    });
    
    if (error) {
      console.error('Error importing commissions:', error);
      return NextResponse.redirect(new URL(`/admin/commissions/import?error=${encodeURIComponent(error.message)}`, process.env.NEXT_PUBLIC_SITE_URL), 302);
    }

    // Set a cookie to show success message
    const response = NextResponse.redirect(new URL('/admin', process.env.NEXT_PUBLIC_SITE_URL), 302);
    response.cookies.set('import_success', 'true', { 
      maxAge: 60,
      httpOnly: true,
      path: '/'
    });
    return response;
  } catch (error: any) {
    console.error('Error processing CSV import:', error);
    const errorMessage = error.message || 'Internal server error';
    return NextResponse.redirect(new URL(`/admin/commissions/import?error=${encodeURIComponent(errorMessage)}`, process.env.NEXT_PUBLIC_SITE_URL), 302);
  }
}