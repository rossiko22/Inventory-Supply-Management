import React, { useEffect, useState } from 'react';

type OrderStatus = 'Requested' | 'Approved' | 'Delivered' | 'Closed';
interface Order {
  id: string; productId: string; companyId: string; warehouseId: string;
  driverId: string; quantity: number; status: number; deliveryDate?: string;
}
interface CreateForm { productId: string; companyId: string; warehouseId: string; driverId: string; quantity: number; deliveryDate: string; }
interface Option { id: string; label: string; }

const STATUS_MAP: Record<number, OrderStatus> = { 0: 'Requested', 1: 'Approved', 2: 'Delivered', 3: 'Closed' };
const STATUS_NEXT: Record<number, number>      = { 0: 1, 1: 2, 2: 3 };
const STATUS_COLOR: Record<number, string>     = { 0: '#f59e0b', 1: '#3b82f6', 2: '#10b981', 3: '#64748b' };

const API = '/api';
const s = {
  wrap:   { padding: '1.5rem' } as React.CSSProperties,
  h1:     { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem' } as React.CSSProperties,
  table:  { width: '100%', borderCollapse: 'collapse' as const, background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,.07)' },
  th:     { padding: '0.75rem 1rem', background: '#f1f5f9', textAlign: 'left' as const, fontSize: '0.8rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' as const },
  td:     { padding: '0.75rem 1rem', borderTop: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#334155' },
  btn:    { padding: '0.35rem 0.8rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 } as React.CSSProperties,
  input:  { padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' as const } as React.CSSProperties,
  select: { padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' as const, background: '#fff', cursor: 'pointer' } as React.CSSProperties,
  label:  { display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.25rem', fontWeight: 500 } as React.CSSProperties,
};

async function fetchOptions<T>(path: string, toOption: (item: T) => Option): Promise<Option[]> {
  try {
    const r = await fetch(`${API}${path}`, { credentials: 'include' });
    if (!r.ok) return [];
    return (await r.json() as T[]).map(toOption);
  } catch { return []; }
}

function nameById(options: Option[], id: string) {
  return options.find(o => o.id === id)?.label ?? id.slice(0, 8) + '…';
}

export default function App() {
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [form, setForm] = useState<CreateForm>({ productId: '', companyId: '', warehouseId: '', driverId: '', quantity: 1, deliveryDate: '' });

  const [products,   setProducts]   = useState<Option[]>([]);
  const [companies,  setCompanies]  = useState<Option[]>([]);
  const [warehouses, setWarehouses] = useState<Option[]>([]);
  const [drivers,    setDrivers]    = useState<Option[]>([]);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/orders`, { credentials: 'include' });
      if (!r.ok) throw new Error('Failed to load orders');
      setOrders(await r.json() as Order[]);
    } catch (e) { setError(String(e)); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    void load();
    void fetchOptions('/products',   (p: any) => ({ id: p.id, label: `${p.name} (${p.sku})` })).then(setProducts);
    void fetchOptions('/companies',  (c: any) => ({ id: c.id, label: c.name })).then(setCompanies);
    void fetchOptions('/warehouses', (w: any) => ({ id: w.id, label: `${w.name} — ${w.city}` })).then(setWarehouses);
    void fetchOptions('/drivers',    (d: any) => ({ id: d.id, label: d.name })).then(setDrivers);
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await fetch(`${API}/orders`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error('Create failed');
      setShowCreate(false);
      setForm({ productId: '', companyId: '', warehouseId: '', driverId: '', quantity: 1, deliveryDate: '' });
      void load();
    } catch (e) { alert(String(e)); }
  }

  async function advanceStatus(order: Order) {
    const next = STATUS_NEXT[order.status];
    if (next === undefined) return;
    try {
      const r = await fetch(`${API}/orders/status`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: order.id, status: next }) });
      if (!r.ok) throw new Error('Status update failed');
      void load();
    } catch (e) { alert(String(e)); }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile) return;
    const fd = new FormData();
    fd.append('file', uploadFile);
    try {
      const r = await fetch(`${API}/orders/upload-document`, { method: 'POST', credentials: 'include', body: fd });
      if (!r.ok) throw new Error('Upload failed');
      setShowUpload(false);
      setUploadFile(null);
      alert('Document uploaded successfully');
    } catch (e) { alert(String(e)); }
  }

  const field = (key: keyof CreateForm, label: string, options: Option[]) => (
    <div key={key} style={{ marginBottom: '0.875rem' }}>
      <label style={s.label}>{label}</label>
      <select
        style={s.select}
        value={form[key] as string}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        required
      >
        <option value="">— select —</option>
        {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <div style={s.wrap}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <h1 style={{ ...s.h1, marginBottom: 0 }}>Orders</h1>
        <button style={{ ...s.btn, background: '#3b82f6', color: '#fff' }} onClick={() => setShowCreate(true)}>+ New Order</button>
        <button style={{ ...s.btn, background: '#6366f1', color: '#fff' }} onClick={() => setShowUpload(true)}>Upload Document</button>
      </div>

      {error && <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>}
      {loading && <p style={{ color: '#64748b' }}>Loading…</p>}

      {!loading && !error && (
        <table style={s.table}>
          <thead>
            <tr>{['Product', 'Company', 'Warehouse', 'Driver', 'Qty', 'Status', 'Delivery', 'Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td style={s.td}>{nameById(products,   o.productId)}</td>
                <td style={s.td}>{nameById(companies,  o.companyId)}</td>
                <td style={s.td}>{nameById(warehouses, o.warehouseId)}</td>
                <td style={s.td}>{nameById(drivers,    o.driverId)}</td>
                <td style={s.td}>{o.quantity}</td>
                <td style={s.td}>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: 999, background: STATUS_COLOR[o.status] + '22', color: STATUS_COLOR[o.status], fontWeight: 600, fontSize: '0.8rem' }}>
                    {STATUS_MAP[o.status]}
                  </span>
                </td>
                <td style={s.td}>{o.deliveryDate ? o.deliveryDate.slice(0, 10) : '—'}</td>
                <td style={s.td}>
                  {STATUS_NEXT[o.status] !== undefined && (
                    <button style={{ ...s.btn, background: '#e0f2fe', color: '#0369a1' }} onClick={() => advanceStatus(o)}>
                      → {STATUS_MAP[STATUS_NEXT[o.status]]}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={8} style={{ ...s.td, textAlign: 'center', color: '#94a3b8' }}>No orders found.</td></tr>}
          </tbody>
        </table>
      )}

      {/* Create Order Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', width: 480, boxShadow: '0 8px 40px rgba(0,0,0,.15)', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1.25rem', color: '#1e293b' }}>Create Order</h2>
            <form onSubmit={handleCreate}>
              {field('productId',   'Product',   products)}
              {field('companyId',   'Company',   companies)}
              {field('warehouseId', 'Warehouse', warehouses)}
              {field('driverId',    'Driver',    drivers)}
              <div style={{ marginBottom: '0.875rem' }}>
                <label style={s.label}>Quantity</label>
                <input style={s.input} type="number" min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} required />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={s.label}>Delivery Date</label>
                <input style={s.input} type="date" value={form.deliveryDate} onChange={e => setForm(f => ({ ...f, deliveryDate: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" style={{ ...s.btn, background: '#e2e8f0', color: '#334155' }} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" style={{ ...s.btn, background: '#3b82f6', color: '#fff' }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUpload && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', width: 400, boxShadow: '0 8px 40px rgba(0,0,0,.15)' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1.25rem', color: '#1e293b' }}>Upload Document</h2>
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={s.label}>Select file</label>
                <input type="file" onChange={e => setUploadFile(e.target.files?.[0] ?? null)} required style={{ fontSize: '0.9rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" style={{ ...s.btn, background: '#e2e8f0', color: '#334155' }} onClick={() => setShowUpload(false)}>Cancel</button>
                <button type="submit" style={{ ...s.btn, background: '#6366f1', color: '#fff' }} disabled={!uploadFile}>Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
