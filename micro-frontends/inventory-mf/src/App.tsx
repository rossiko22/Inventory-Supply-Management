import React, { useEffect, useState } from 'react';

interface InventoryItem { id: string; productId: string; warehouseId: string; quantity: number; }
interface CreateForm { productId: string; warehouseId: string; quantity: number; }

const API = '/api/inventory';
const s = {
  wrap:  { padding: '1.5rem' } as React.CSSProperties,
  h1:    { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem' } as React.CSSProperties,
  table: { width: '100%', borderCollapse: 'collapse' as const, background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,.07)' },
  th:    { padding: '0.75rem 1rem', background: '#f1f5f9', textAlign: 'left' as const, fontSize: '0.8rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' as const },
  td:    { padding: '0.75rem 1rem', borderTop: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#334155' },
  btn:   { padding: '0.4rem 0.9rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 } as React.CSSProperties,
  input: { padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem', width: '100%' } as React.CSSProperties,
};

export default function App() {
  const [items, setItems]     = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState<CreateForm>({ productId: '', warehouseId: '', quantity: 1 });

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(API, { credentials: 'include' });
      if (!r.ok) throw new Error('Failed to load inventory');
      setItems(await r.json() as InventoryItem[]);
    } catch (e) { setError(String(e)); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await fetch(API, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error('Create failed');
      setShowForm(false);
      void load();
    } catch (e) { alert(String(e)); }
  }

  return (
    <div style={s.wrap}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h1 style={s.h1}>Stock / Inventory</h1>
        <button style={{ ...s.btn, background: '#3b82f6', color: '#fff' }} onClick={() => setShowForm(true)}>+ Add Stock</button>
      </div>

      {error && <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>}
      {loading && <p style={{ color: '#64748b' }}>Loading…</p>}

      {!loading && !error && (
        <table style={s.table}>
          <thead>
            <tr>
              {['Product ID', 'Warehouse ID', 'Quantity'].map(h => <th key={h} style={s.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={s.td}><code style={{ fontSize: '0.8rem', color: '#6366f1' }}>{item.productId}</code></td>
                <td style={s.td}><code style={{ fontSize: '0.8rem', color: '#6366f1' }}>{item.warehouseId}</code></td>
                <td style={s.td}>
                  <span style={{ fontWeight: 600, color: item.quantity < 10 ? '#dc2626' : '#16a34a' }}>{item.quantity}</span>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={3} style={{ ...s.td, textAlign: 'center', color: '#94a3b8' }}>No inventory records.</td></tr>}
          </tbody>
        </table>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', width: 420, boxShadow: '0 8px 40px rgba(0,0,0,.15)' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1.25rem', color: '#1e293b' }}>Add Stock</h2>
            <form onSubmit={handleCreate}>
              {([['productId', 'Product ID'], ['warehouseId', 'Warehouse ID']] as [keyof CreateForm, string][]).map(([k, lbl]) => (
                <div key={k} style={{ marginBottom: '0.875rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.25rem' }}>{lbl}</label>
                  <input style={s.input} type="text" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} required placeholder="UUID" />
                </div>
              ))}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.25rem' }}>Quantity</label>
                <input style={s.input} type="number" min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" style={{ ...s.btn, background: '#e2e8f0', color: '#334155' }} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" style={{ ...s.btn, background: '#3b82f6', color: '#fff' }}>Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
