'use client';
import { useState } from 'react';

export default function ImageUploader({ onDone }: { onDone: (url:string)=>void }) {
  const [busy,setBusy]=useState(false);
  const [url,setUrl]=useState<string>('');
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true);
    const fd = new FormData(); fd.set('file', f);
    const r = await fetch('/api/admin/upload-image', { method: 'POST', body: fd });
    const j = await r.json();
    setBusy(false);
    if (j.ok) { setUrl(j.url); onDone(j.url); } else alert(j.error || 'Upload failed');
  };
  return (
    <div className="grid gap-2">
      <input type="file" accept="image/*" onChange={upload} disabled={busy} />
      {url && <img src={url} alt="preview" className="w-full max-w-xs rounded-xl border" />}
    </div>
  );
}