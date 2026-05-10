import React, { useEffect, useState } from 'react';

interface Driver  { id: string; name: string; phone: string; email: string; vehicleId: string; companyId: string; }
interface Vehicle { id: string; registrationPlate: string; }

const s = {
  wrap:  { padding: '1.5rem' } as React.CSSProperties,
  h1:    { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.25rem' } as React.CSSProperties,
  h2:    { fontSize: '1.1rem', fontWeight: 600, color: '#334155', margin: '1.75rem 0 0.75rem' } as React.CSSProperties,
  table: { width: '100%', borderCollapse: 'collapse' as const, background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,.07)' },
  th:    { padding: '0.75rem 1rem', background: '#f1f5f9', textAlign: 'left' as const, fontSize: '0.8rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' as const },
  td:    { padding: '0.75rem 1rem', borderTop: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#334155' },
  btn:   { padding: '0.4rem 0.9rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 } as React.CSSProperties,
  input: { padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem', width: '100%' } as React.CSSProperties,
};

function getUser() {
  try { return JSON.parse(localStorage.getItem('mf_user') ?? 'null') as { role: string } | null; } catch { return null; }
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', width: 440, boxShadow: '0 8px 40px rgba(0,0,0,.15)' }}>
        <h2 style={{ fontWeight: 700, marginBottom: '1.25rem', color: '#1e293b' }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

type DriverForm = Omit<Driver, 'id'>;
type VehicleForm = Omit<Vehicle, 'id'>;
const EMPTY_D: DriverForm  = { name: '', phone: '', email: '', vehicleId: '', companyId: '' };
const EMPTY_V: VehicleForm = { registrationPlate: '' };

export default function App() {
  const [drivers, setDrivers]   = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadD, setLoadD]       = useState(true);
  const [loadV, setLoadV]       = useState(true);
  const [dForm, setDForm]       = useState<DriverForm>(EMPTY_D);
  const [vForm, setVForm]       = useState<VehicleForm>(EMPTY_V);
  const [editD, setEditD]       = useState<Driver | null>(null);
  const [editV, setEditV]       = useState<Vehicle | null>(null);
  const [showD, setShowD]       = useState(false);
  const [showV, setShowV]       = useState(false);

  const isManager = getUser()?.role === 'MANAGER';

  async function loadDrivers() {
    setLoadD(true);
    const r = await fetch('/api/drivers', { credentials: 'include' });
    setDrivers(await r.json() as Driver[]);
    setLoadD(false);
  }
  async function loadVehicles() {
    setLoadV(true);
    const r = await fetch('/api/vehicles', { credentials: 'include' });
    setVehicles(await r.json() as Vehicle[]);
    setLoadV(false);
  }

  useEffect(() => { void loadDrivers(); void loadVehicles(); }, []);

  async function saveDriver(e: React.FormEvent) {
    e.preventDefault();
    const url = editD ? `/api/drivers/${editD.id}` : '/api/drivers';
    const r   = await fetch(url, { method: editD ? 'PUT' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dForm) });
    if (!r.ok) { alert('Save failed'); return; }
    setShowD(false); void loadDrivers();
  }

  async function saveVehicle(e: React.FormEvent) {
    e.preventDefault();
    const url = editV ? `/api/vehicles/${editV.id}` : '/api/vehicles';
    const r   = await fetch(url, { method: editV ? 'PUT' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(vForm) });
    if (!r.ok) { alert('Save failed'); return; }
    setShowV(false); void loadVehicles();
  }

  async function deleteDriver(id: string) {
    if (!confirm('Delete driver?')) return;
    await fetch(`/api/drivers/${id}`, { method: 'DELETE', credentials: 'include' });
    void loadDrivers();
  }

  async function deleteVehicle(id: string) {
    if (!confirm('Delete vehicle?')) return;
    await fetch(`/api/vehicles/${id}`, { method: 'DELETE', credentials: 'include' });
    void loadVehicles();
  }

  return (
    <div style={s.wrap}>
      <h1 style={s.h1}>Fleet Management</h1>

      {/* ── Drivers ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h2 style={{ ...s.h2, margin: 0 }}>Drivers</h2>
        {isManager && <button style={{ ...s.btn, background: '#3b82f6', color: '#fff' }} onClick={() => { setEditD(null); setDForm(EMPTY_D); setShowD(true); }}>+ Add Driver</button>}
      </div>
      {loadD ? <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Loading…</p> : (
        <table style={{ ...s.table, marginTop: '0.75rem' }}>
          <thead><tr>{['Name','Phone','Email','Vehicle','Company',...(isManager?['Actions']:[])].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {drivers.map(d => (
              <tr key={d.id}>
                <td style={s.td}>{d.name}</td><td style={s.td}>{d.phone}</td><td style={s.td}>{d.email}</td>
                <td style={s.td}><code style={{ fontSize: '0.75rem' }}>{d.vehicleId.slice(0, 8)}…</code></td>
                <td style={s.td}><code style={{ fontSize: '0.75rem' }}>{d.companyId.slice(0, 8)}…</code></td>
                {isManager && <td style={s.td}>
                  <button style={{ ...s.btn, background: '#e2e8f0', color: '#334155', marginRight: '0.5rem' }} onClick={() => { setEditD(d); setDForm({ name: d.name, phone: d.phone, email: d.email, vehicleId: d.vehicleId, companyId: d.companyId }); setShowD(true); }}>Edit</button>
                  <button style={{ ...s.btn, background: '#fef2f2', color: '#dc2626' }} onClick={() => deleteDriver(d.id)}>Delete</button>
                </td>}
              </tr>
            ))}
            {drivers.length === 0 && <tr><td colSpan={isManager ? 6 : 5} style={{ ...s.td, textAlign: 'center', color: '#94a3b8' }}>No drivers found.</td></tr>}
          </tbody>
        </table>
      )}

      {/* ── Vehicles ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.75rem' }}>
        <h2 style={{ ...s.h2, margin: 0 }}>Vehicles</h2>
        {isManager && <button style={{ ...s.btn, background: '#3b82f6', color: '#fff' }} onClick={() => { setEditV(null); setVForm(EMPTY_V); setShowV(true); }}>+ Add Vehicle</button>}
      </div>
      {loadV ? <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Loading…</p> : (
        <table style={{ ...s.table, marginTop: '0.75rem' }}>
          <thead><tr>{['Registration Plate',...(isManager?['Actions']:[])].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id}>
                <td style={s.td}>{v.registrationPlate}</td>
                {isManager && <td style={s.td}>
                  <button style={{ ...s.btn, background: '#e2e8f0', color: '#334155', marginRight: '0.5rem' }} onClick={() => { setEditV(v); setVForm({ registrationPlate: v.registrationPlate }); setShowV(true); }}>Edit</button>
                  <button style={{ ...s.btn, background: '#fef2f2', color: '#dc2626' }} onClick={() => deleteVehicle(v.id)}>Delete</button>
                </td>}
              </tr>
            ))}
            {vehicles.length === 0 && <tr><td colSpan={isManager ? 2 : 1} style={{ ...s.td, textAlign: 'center', color: '#94a3b8' }}>No vehicles found.</td></tr>}
          </tbody>
        </table>
      )}

      {/* Driver Modal */}
      {showD && (
        <Modal title={editD ? 'Edit Driver' : 'Add Driver'} onClose={() => setShowD(false)}>
          <form onSubmit={saveDriver}>
            {(['name','phone','email','vehicleId','companyId'] as (keyof DriverForm)[]).map(k => (
              <div key={k} style={{ marginBottom: '0.875rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.25rem' }}>{k}</label>
                <input style={s.input} type={k === 'email' ? 'email' : 'text'} value={dForm[k]} onChange={e => setDForm(f => ({ ...f, [k]: e.target.value }))} required />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" style={{ ...s.btn, background: '#e2e8f0', color: '#334155' }} onClick={() => setShowD(false)}>Cancel</button>
              <button type="submit" style={{ ...s.btn, background: '#3b82f6', color: '#fff' }}>Save</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Vehicle Modal */}
      {showV && (
        <Modal title={editV ? 'Edit Vehicle' : 'Add Vehicle'} onClose={() => setShowV(false)}>
          <form onSubmit={saveVehicle}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.25rem' }}>Registration Plate</label>
              <input style={s.input} type="text" value={vForm.registrationPlate} onChange={e => setVForm({ registrationPlate: e.target.value })} required />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" style={{ ...s.btn, background: '#e2e8f0', color: '#334155' }} onClick={() => setShowV(false)}>Cancel</button>
              <button type="submit" style={{ ...s.btn, background: '#3b82f6', color: '#fff' }}>Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
