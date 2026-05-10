import React, { useEffect, useState } from 'react';

interface Product  { id: string; name: string; sku: string; description: string; weight: number; categoryId: string; }
interface Category { id: string; name: string; description: string | null; }
type ProductForm  = Omit<Product, 'id'>;
type CategoryForm = Omit<Category, 'id'>;

const s = {
  wrap:  { padding: '1.5rem' } as React.CSSProperties,
  h1:    { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem' } as React.CSSProperties,
  h2:    { fontSize: '1.1rem', fontWeight: 600, color: '#334155' } as React.CSSProperties,
  table: { width: '100%', borderCollapse: 'collapse' as const, background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,.07)' },
  th:    { padding: '0.75rem 1rem', background: '#f1f5f9', textAlign: 'left' as const, fontSize: '0.8rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' as const },
  td:    { padding: '0.75rem 1rem', borderTop: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#334155' },
  btn:   { padding: '0.4rem 0.9rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 } as React.CSSProperties,
  input: { padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem', width: '100%' } as React.CSSProperties,
};

function getUser() {
  try { return JSON.parse(localStorage.getItem('mf_user') ?? 'null') as { role: string } | null; } catch { return null; }
}

const EMPTY_P: ProductForm  = { name: '', sku: '', description: '', weight: 0, categoryId: '' };
const EMPTY_C: CategoryForm = { name: '', description: '' };

export default function App() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadP, setLoadP]           = useState(true);
  const [loadC, setLoadC]           = useState(true);
  const [pForm, setPForm]           = useState<ProductForm>(EMPTY_P);
  const [cForm, setCForm]           = useState<CategoryForm>(EMPTY_C);
  const [editP, setEditP]           = useState<Product | null>(null);
  const [showP, setShowP]           = useState(false);
  const [showC, setShowC]           = useState(false);
  const [tab, setTab]               = useState<'products' | 'categories'>('products');

  const isManager = getUser()?.role === 'MANAGER';

  async function loadProducts() {
    setLoadP(true);
    const r = await fetch('/api/products', { credentials: 'include' });
    setProducts(await r.json() as Product[]);
    setLoadP(false);
  }
  async function loadCategories() {
    setLoadC(true);
    const r = await fetch('/api/categories', { credentials: 'include' });
    setCategories(await r.json() as Category[]);
    setLoadC(false);
  }

  useEffect(() => { void loadProducts(); void loadCategories(); }, []);

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    const url = editP ? `/api/products/${editP.id}` : '/api/products';
    const r   = await fetch(url, { method: editP ? 'PUT' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pForm) });
    if (!r.ok) { alert('Save failed'); return; }
    setShowP(false); void loadProducts();
  }

  async function saveCategory(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch('/api/categories', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cForm) });
    if (!r.ok) { alert('Save failed'); return; }
    setShowC(false); void loadCategories();
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'include' });
    void loadProducts();
  }

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontWeight: active ? 600 : 400, fontSize: '0.9rem',
    background: active ? '#3b82f6' : '#e2e8f0', color: active ? '#fff' : '#475569',
  });

  const catName = (id: string) => categories.find(c => c.id === id)?.name ?? id.slice(0, 8) + '…';

  return (
    <div style={s.wrap}>
      <h1 style={s.h1}>Products & Categories</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button style={tabBtn(tab === 'products')}   onClick={() => setTab('products')}>Products</button>
        <button style={tabBtn(tab === 'categories')} onClick={() => setTab('categories')}>Categories</button>
      </div>

      {/* Products tab */}
      {tab === 'products' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <h2 style={s.h2}>Products</h2>
            {isManager && <button style={{ ...s.btn, background: '#3b82f6', color: '#fff' }} onClick={() => { setEditP(null); setPForm(EMPTY_P); setShowP(true); }}>+ New Product</button>}
          </div>
          {loadP ? <p style={{ color: '#64748b' }}>Loading…</p> : (
            <table style={s.table}>
              <thead><tr>{['Name','SKU','Category','Weight','Desc',...(isManager?['Actions']:[])].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td style={s.td}>{p.name}</td>
                    <td style={s.td}><code style={{ fontSize: '0.8rem' }}>{p.sku}</code></td>
                    <td style={s.td}>{catName(p.categoryId)}</td>
                    <td style={s.td}>{p.weight} kg</td>
                    <td style={s.td} title={p.description}>{p.description.slice(0, 30)}{p.description.length > 30 ? '…' : ''}</td>
                    {isManager && <td style={s.td}>
                      <button style={{ ...s.btn, background: '#e2e8f0', color: '#334155', marginRight: '0.5rem' }} onClick={() => { setEditP(p); setPForm({ name: p.name, sku: p.sku, description: p.description, weight: p.weight, categoryId: p.categoryId }); setShowP(true); }}>Edit</button>
                      <button style={{ ...s.btn, background: '#fef2f2', color: '#dc2626' }} onClick={() => deleteProduct(p.id)}>Delete</button>
                    </td>}
                  </tr>
                ))}
                {products.length === 0 && <tr><td colSpan={isManager ? 6 : 5} style={{ ...s.td, textAlign: 'center', color: '#94a3b8' }}>No products found.</td></tr>}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Categories tab */}
      {tab === 'categories' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <h2 style={s.h2}>Categories</h2>
            {isManager && <button style={{ ...s.btn, background: '#3b82f6', color: '#fff' }} onClick={() => { setCForm(EMPTY_C); setShowC(true); }}>+ New Category</button>}
          </div>
          {loadC ? <p style={{ color: '#64748b' }}>Loading…</p> : (
            <table style={s.table}>
              <thead><tr>{['Name','Description'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td style={s.td}>{c.name}</td>
                    <td style={s.td}>{c.description ?? '—'}</td>
                  </tr>
                ))}
                {categories.length === 0 && <tr><td colSpan={2} style={{ ...s.td, textAlign: 'center', color: '#94a3b8' }}>No categories found.</td></tr>}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Product Modal */}
      {showP && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', width: 460, boxShadow: '0 8px 40px rgba(0,0,0,.15)', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1.25rem', color: '#1e293b' }}>{editP ? 'Edit Product' : 'New Product'}</h2>
            <form onSubmit={saveProduct}>
              {(['name','sku','description'] as (keyof ProductForm)[]).map(k => (
                <div key={k} style={{ marginBottom: '0.875rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.25rem' }}>{k}</label>
                  <input style={s.input} type="text" value={pForm[k] as string} onChange={e => setPForm(f => ({ ...f, [k]: e.target.value }))} required={k !== 'description'} />
                </div>
              ))}
              <div style={{ marginBottom: '0.875rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.25rem' }}>Weight (kg)</label>
                <input style={s.input} type="number" step="0.01" min={0} value={pForm.weight} onChange={e => setPForm(f => ({ ...f, weight: +e.target.value }))} required />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.25rem' }}>Category</label>
                <select style={s.input} value={pForm.categoryId} onChange={e => setPForm(f => ({ ...f, categoryId: e.target.value }))} required>
                  <option value="">Select category…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" style={{ ...s.btn, background: '#e2e8f0', color: '#334155' }} onClick={() => setShowP(false)}>Cancel</button>
                <button type="submit" style={{ ...s.btn, background: '#3b82f6', color: '#fff' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showC && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', width: 420, boxShadow: '0 8px 40px rgba(0,0,0,.15)' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1.25rem', color: '#1e293b' }}>New Category</h2>
            <form onSubmit={saveCategory}>
              <div style={{ marginBottom: '0.875rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.25rem' }}>Name</label>
                <input style={s.input} type="text" value={cForm.name} onChange={e => setCForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.25rem' }}>Description</label>
                <input style={s.input} type="text" value={cForm.description ?? ''} onChange={e => setCForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" style={{ ...s.btn, background: '#e2e8f0', color: '#334155' }} onClick={() => setShowC(false)}>Cancel</button>
                <button type="submit" style={{ ...s.btn, background: '#3b82f6', color: '#fff' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
