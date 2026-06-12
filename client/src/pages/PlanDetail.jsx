import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client.js';
import PlanItemsTable from '../components/PlanItemsTable.jsx';

const PARK_NAMES = { mk: 'Magic Kingdom', ep: 'EPCOT', hs: 'Hollywood Studios', ak: 'Animal Kingdom' };

export default function PlanDetail({ planId, setView }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editable fields
  const [title, setTitle] = useState('');
  const [boundFilm, setBoundFilm] = useState('');
  const [notes, setNotes] = useState('');

  async function load() {
    setLoading(true);
    try {
      const d = await apiFetch(`/api/plans/${planId}`);
      setPlan(d.plan);
      setTitle(d.plan.title);
      setBoundFilm(d.plan.bound_film || '');
      setNotes(d.plan.notes || '');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [planId]);

  async function saveEdits(e) {
    e.preventDefault();
    try {
      await apiFetch(`/api/plans/${planId}`, {
        method: 'PUT',
        body: { title: title.trim(), bound_film: boundFilm, notes }
      });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeItem(itemId) {
    try {
      await apiFetch(`/api/plans/${planId}/items/${itemId}`, { method: 'DELETE' });
      setPlan((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== itemId) }));
    } catch (err) {
      setError(err.message);
    }
  }

  async function deletePlan() {
    if (!confirm('Delete this whole plan?')) return;
    try {
      await apiFetch(`/api/plans/${planId}`, { method: 'DELETE' });
      setView({ name: 'plans' });
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="wrap"><p className="muted">Loading...</p></div>;
  if (!plan) return <div className="wrap"><div className="error">{error || 'Plan not found.'}</div></div>;

  return (
    <div className="wrap">
      <button className="btn btn-ghost btn-sm" onClick={() => setView({ name: 'plans' })}>← Back to plans</button>

      <div className="card" style={{ marginTop: 16 }}>
        {!editing ? (
          <>
            <h1>{plan.title}</h1>
            <p className="muted">{PARK_NAMES[plan.park]} · {plan.visit_date?.slice(0, 10)}</p>
            {plan.bound_film && <p style={{ margin: '10px 0' }}>Bounding to <strong>{plan.bound_film}</strong></p>}
            {plan.notes && <p style={{ margin: '10px 0' }}>{plan.notes}</p>}
            {saved && <div className="success">Saved.</div>}
            <div className="row" style={{ marginTop: 14 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={deletePlan}>Delete plan</button>
            </div>
          </>
        ) : (
          <form onSubmit={saveEdits}>
            <div className="field">
              <label htmlFor="t">Title</label>
              <input id="t" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="bf">Bounding to</label>
              <input id="bf" type="text" value={boundFilm} onChange={(e) => setBoundFilm(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="n">Notes</label>
              <textarea id="n" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="row">
              <button className="btn btn-primary btn-sm" type="submit">Save</button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => { setEditing(false); load(); }}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      <div className="card">
        <h2>Shows in this plan</h2>
        <PlanItemsTable items={plan.items} onRemove={removeItem} />
      </div>

      {error && <div className="error">{error}</div>}
    </div>
  );
}
