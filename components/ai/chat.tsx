'use client';
import { useState } from 'react';

export default function DealChat() {
  const [q, setQ] = useState('Helsinki sushi -30%');
  const [ans, setAns] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!q.trim()) return;
    
    setLoading(true);
    setAns('...');
    
    try {
      const r = await fetch('/api/ai', {
        method: 'POST',
        body: JSON.stringify({ q }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const j = await r.json();
      setAns(j.answer || 'Ei vastausta.');
    } catch (error) {
      setAns('Virhe viestin lähetyksessä.');
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask();
  };

  return (
    <div className="max-w-2xl space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          className="border rounded-2xl px-3 py-2 flex-1" 
          value={q} 
          onChange={e => setQ(e.target.value)} 
          placeholder="Kysy alennuksista..." 
          disabled={loading}
        />
        <button 
          type="submit"
          onClick={ask} 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Lähetetään...' : 'Kysy'}
        </button>
      </form>
      <div className="rounded-2xl border p-4 whitespace-pre-wrap min-h-24">
        {ans || 'Kirjoita kysymys yllä ja paina "Kysy" saadaksesi vastauksen.'}
      </div>
    </div>
  );
}