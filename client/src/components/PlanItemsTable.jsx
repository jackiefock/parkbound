// Renders a plan's saved shows as a table (the structured-data display).
// Takes an onRemove callback so each row can be deleted.

const TYPE_LABELS = {
  musical: 'Musical',
  live: 'Live Show',
  cast: 'Cast Meet',
  character: 'Character',
  parade: 'Parade',
  dining: 'Dining'
};

export default function PlanItemsTable({ items, onRemove }) {
  if (!items || items.length === 0) {
    return <p className="muted">No shows added to this plan yet.</p>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Time</th>
          <th>Show</th>
          <th>Type</th>
          <th>Location</th>
          {onRemove && <th></th>}
        </tr>
      </thead>
      <tbody>
        {items.map((it) => (
          <tr key={it.id}>
            <td>{it.event_time || '--'}</td>
            <td>{it.event_title}</td>
            <td>{TYPE_LABELS[it.event_type] || it.event_type || '--'}</td>
            <td>{it.location || '--'}</td>
            {onRemove && (
              <td>
                <button className="btn btn-ghost btn-sm" onClick={() => onRemove(it.id)}>
                  Remove
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
