import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client.js';

const PARK_NAMES = { mk: 'Magic Kingdom', ep: 'EPCOT', hs: 'Hollywood Studios', ak: 'Animal Kingdom' };

export default function Plans({ setView }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterPark, setFilterPark] = useState('all');     // filtering
  const [sortDir, setSortDir] = useState('desc');          // sorting by date

  async function load() {
    setLoading(true);
    try {
      const d = await apiFetch('/api/plans');
      setPlans(d.plans);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    if (!confirm('Delete this plan?')) return;
    try {
      await apiFetch(`/api/plans/${id}`, { method: 'DELETE' });
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  // Apply the filter, then the sort. Derived from state on each render.
  const visible = plans
    .filter((p) => filterPark === 'all' || p.park === filterPark)
    .sort((a, b) => {
      const cmp = new Date(a.visit_date) - new Date(b.visit_date);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  if (loading) return <div className="wrap"><p className="muted">Loading your plans...</p></div>;

  return (
    <div className="wrap">
      <h1 style={{ margin: '10px 0 18px' }}>My Plans</h1>

      <div className="toolbar">
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="filter">Filter by park</label>
          <select id="filter" value={filterPark} onChange={(e) => setFilterPark(e.target.value)}>
            <option value="all">All parks</option>
            {Object.entries(PARK_NAMES).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}>
          Date {sortDir === 'asc' ? '↑ oldest first' : '↓ newest first'}
        </button>
        <div className="spacer" />
        <button className="btn btn-primary btn-sm" onClick={() => setView({ name: 'planner' })}>+ New plan</button>
      </div>

      {error && <div className="error">{error}</div>}

      {visible.length === 0 ? (
        <div className="card"><p className="muted">No plans yet. Head to the planner and build one.</p></div>
      ) : (
        <div className="grid">
          {visible.map((p) => (
            <div className="card" key={p.id} style={{ marginBottom: 0 }}>
              <h2>{p.title}</h2>
              <p className="muted">{PARK_NAMES[p.park]} · {p.visit_date?.slice(0, 10)}</p>
              {p.bound_film && <p style={{ margin: '6px 0' }}>Bounding to <strong>{p.bound_film}</strong></p>}
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setView({ name: 'planDetail', planId: p.id })}>View</button>
                <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
