import { useAuth } from '../context/AuthContext.jsx';

// Top navigation. Receives the current view and a setter as props so it can
// switch views and highlight the active one.
export default function Nav({ view, setView }) {
  const { user, logout } = useAuth();

  return (
    <nav className="nav">
      <button className="brand" onClick={() => setView({ name: 'planner' })}>
        Park<span>Bound</span>
      </button>

      <div className="nav-links">
        <button
          className={view.name === 'planner' ? 'active' : ''}
          onClick={() => setView({ name: 'planner' })}
        >
          Planner
        </button>
        <button
          className={view.name === 'plans' || view.name === 'planDetail' ? 'active' : ''}
          onClick={() => setView({ name: 'plans' })}
        >
          My Plans
        </button>
        <span className="nav-user">Hi, {user.username}</span>
        <button onClick={logout}>Log out</button>
      </div>
    </nav>
  );
}
