'use client';
import { useEffect, useState } from 'react';

export default function CookieConsent() {
  const [seen, setSeen] = useState(true);
  useEffect(() => { setSeen(localStorage.getItem('cookie-ok') === '1'); }, []);
  if (seen) return null;
  return (
    <div className="fixed bottom-4 inset-x-4 bg-black text-white p-4 rounded-2xl">
      <p className="text-sm">Käytämme evästeitä. Voit sallia analytiikan.</p>
      <div className="mt-2 flex gap-2">
        <button className="btn" onClick={() => { localStorage.setItem('cookie-ok','1'); setSeen(true); }}>Ok</button>
        <button className="btn" onClick={() => { alert('Analytics disabled'); localStorage.setItem('cookie-ok','1'); setSeen(true); }}>Vain välttämättömät</button>
      </div>
    </div>
  );
}