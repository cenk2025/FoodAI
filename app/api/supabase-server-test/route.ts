// app/api/supabase-server-test/route.ts
import { createSupabaseServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createSupabaseServer();
    
    // Try a simple query to test the connection
    const { data, error } = await supabase
      .from('offer_index')
      .select('id, title')
      .limit(1);
    
    if (error) {
      return NextResponse.json({
        error: error.message,
        message: "Failed to query Supabase"
      }, { status: 500 });
    }
    
    return NextResponse.json({
      data: data || [],
      message: "Successfully connected to Supabase"
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      message: "Failed to create Supabase client"
    }, { status: 500 });
  }
}