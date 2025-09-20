'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapContainerProps, TileLayerProps, MarkerProps, PopupProps } from 'react-leaflet';

// Dynamically import the components
const MapContainer = dynamic<MapContainerProps>(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic<TileLayerProps>(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic<MarkerProps>(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic<PopupProps>(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

type Item = { 
  id: string; 
  title: string; 
  lat: number; 
  lon: number; 
  discounted_price: number; 
  discount_percent: number; 
};

export default function Nearby() {
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (p) => {
      const lat = p.coords.latitude;
      const lon = p.coords.longitude;
      setPos([lat, lon]);
      
      try {
        const r = await fetch(`/api/offers/nearby?lat=${lat}&lon=${lon}&km=5`);
        const j = await r.json();
        setItems(j.results || []);
      } catch (error) {
        console.error('Error fetching nearby offers:', error);
      }
    });
  }, []);

  if (!pos) return <div className="p-6">Haetaan sijaintia…</div>;
  
  return (
    <div className="p-0">
      <MapContainer center={pos} zoom={13} style={{ height: '70vh' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {items.map((o) => (
          <Marker key={o.id} position={[o.lat, o.lon]}>
            <Popup>
              <div className="space-y-1">
                <div className="font-bold">{o.title}</div>
                <div>
                  {o.discounted_price?.toFixed(2)} € 
                  {o.discount_percent ? ` (-${o.discount_percent}%)` : ''}
                </div>
                <a className="link" href={`/go/${o.id}`}>Avaa tarjous</a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}