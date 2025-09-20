import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function bbox(lat: number, lon: number, km: number) {
  const dLat = km / 111.32;
  const dLon = km / (111.32 * Math.cos(lat * Math.PI/180));
  return { minLat: lat - dLat, maxLat: lat + dLat, minLon: lon - dLon, maxLon: lon + dLon };
}

function haversine(lat1:number, lon1:number, lat2:number, lon2:number) {
  const R = 6371, toRad = (d:number)=>d*Math.PI/180;
  const dLat = toRad(lat2-lat1), dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}

export async function GET(req: NextRequest) {
  const u = new URL(req.url);
  const lat = Number(u.searchParams.get('lat')); const lon = Number(u.searchParams.get('lon'));
  const km = Number(u.searchParams.get('km') || 5);
  if (!isFinite(lat) || !isFinite(lon)) return NextResponse.json({ ok:false, error:'bad coords' }, { status:400 });

  const box = bbox(lat, lon, km);
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);
  const { data } = await db.from('offer_index').select('*')
    .gte('lat', box.minLat).lte('lat', box.maxLat)
    .gte('lon', box.minLon).lte('lon', box.maxLon)
    .limit(100);

  const list = (data||[]).map((o:any)=>({ ...o, dist: haversine(lat,lon,o.lat,o.lon) }))
    .sort((a,b)=>a.dist-b.dist)
    .slice(0,50);
  return NextResponse.json({ ok:true, results:list });
}