import { useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import Nav from './components/Nav.jsx';
import Auth from './pages/Auth.jsx';
import Planner from './pages/Planner.jsx';
import Plans from './pages/Plans.jsx';
import PlanDetail from './pages/PlanDetail.jsx';

export default function App() {
  const { user } = useAuth();

  // Lightweight view router kept in state. view = { name, planId? }
  const [view, setView] = useState({ name: 'planner' });

  // Logged out: only the auth screen.
  if (!user) return <Auth />;

  // Logged in: nav + the active view (conditional rendering).
  return (
    <>
      <Nav view={view} setView={setView} />
      {view.name === 'planner' && <Planner setView={setView} />}
      {view.name === 'plans' && <Plans setView={setView} />}
      {view.name === 'planDetail' && <PlanDetail planId={view.planId} setView={setView} />}
    </>
  );
}
