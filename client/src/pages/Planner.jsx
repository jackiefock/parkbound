import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client.js';
import DayCanvas from '../components/DayCanvas.jsx';

const TYPE_LABELS = {
  musical: 'Musical',
  live: 'Live Show',
  cast: 'Cast Meet',
  character: 'Character',
  parade: 'Parade & Spectacular',
  dining: 'Dining Event'
};

export default function Planner({ setView }) {
  const [parks, setParks] = useState([]);
  const [park, setPark] = useState('mk');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [day, setDay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Save-plan form state
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [boundFilm, setBoundFilm] = useState('');       // radio
  const [chosen, setChosen] = useState({});             // checkboxes, keyed by event index
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Load the park list once for the dropdown.
  useEffect(() => {
    apiFetch('/api/parks')
      .then((d) => setParks(d.parks))
      .catch((e) => setError(e.message));
  }, []);

  async function loadDay() {
    setLoading(true);
    setError('');
    try {
      const d = await apiFetch(`/api/days?park=${park}&date=${date}`);
      setDay(d);
      // Reset the save form for the new day.
      setTitle('');
      setNotes('');
      setBoundFilm(d.films[0] || '');
      setChosen({});
      setFormError('');
    } catch (e) {
      setError(e.message);
      setDay(null);
    } finally {
      setLoading(false);
    }
  }

  function toggleEvent(index) {
    setChosen((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  async function savePlan(e) {
    e.preventDefault();
    if (title.trim().length === 0) {
      setFormError('Give your plan a title.');
      return;
    }
    const items = day.events
      .filter((_, i) => chosen[i])
      .map((ev) => ({
        event_title: ev.title,
        event_time: ev.time,
        event_type: ev.type,
        location: ev.location
      }));

    if (items.length === 0) {
      setFormError('Pick at least one show to add to your plan.');
      return;
    }

    setFormError('');
    setSaving(true);
    try {
      await apiFetch('/api/plans', {
        method: 'POST',
        body: {
          title: title.trim(),
          park,
          visit_date: date,
          bound_film: boundFilm,
          notes,
          items
        }
      });
      setView({ name: 'plans' });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const parkName = parks.find((p) => p.id === park)?.name || '';

  return (
    <div className="wrap">
      <img className="hero-img" src="/park-map.svg" alt="Illustrated map of four theme-park lands connected by winding pathways" />

      <div className="card">
        <h2>Build your day</h2>
        <p className="muted">Pick a park and a date to see the lineup and the films to bound to.</p>

        <div className="field" style={{ marginTop: 16 }}>
          <label htmlFor="park">Park</label>
          <select id="park" value={park} onChange={(e) => setPark(e.target.value)}>
            {parks.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="row">
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="date">Date</label>
            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <button className="btn btn-primary" onClick={loadDay} disabled={loading}>
              {loading ? 'Loading...' : 'Plan my day'}
            </button>
          </div>
        </div>

        {error && <div className="error">{error}</div>}
      </div>

      {day && (
        <div className="card">
          <h2>{parkName} on {date}</h2>

          <DayCanvas events={day.events} />

          <div className="section-title">Featured films today</div>
          {day.films.length === 0 ? (
            <p className="muted">No film-based shows on this day.</p>
          ) : (
            <div className="films">
              {day.films.map((f) => (
                <div className="film" key={f}>
                  <div className="label">Bound to</div>
                  <div className="name">{f}</div>
                </div>
              ))}
            </div>
          )}

          <div className="section-title">Save this day as a plan</div>
          <form onSubmit={savePlan}>
            <div className="field">
              <label htmlFor="title">Plan title</label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Birthday trip" />
            </div>

            {day.films.length > 0 && (
              <div className="field">
                <label>Which film are you bounding to?</label>
                <div className="radio-row">
                  {day.films.map((f) => (
                    <label key={f} className={`choice ${boundFilm === f ? 'checked' : ''}`}>
                      <input
                        type="radio"
                        name="boundFilm"
                        value={f}
                        checked={boundFilm === f}
                        onChange={(e) => setBoundFilm(e.target.value)}
                      />
                      {f}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="field">
              <label>Pick the shows to include</label>
              <div className="checkbox-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                {day.events.map((ev, i) => (
                  <label key={i} className={`choice ${chosen[i] ? 'checked' : ''}`} style={{ justifyContent: 'flex-start' }}>
                    <input type="checkbox" checked={!!chosen[i]} onChange={() => toggleEvent(i)} />
                    <span>
                      <strong>{ev.time}</strong> &nbsp; {ev.title}
                      <span className="muted"> ({TYPE_LABELS[ev.type]})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="field">
              <label htmlFor="notes">Notes</label>
              <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Outfit ideas, who's coming, dining reservations..." />
            </div>

            {formError && <div className="error">{formError}</div>}

            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save plan'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
