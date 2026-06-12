import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

// Single screen that flips between Login and Register modes.
export default function Auth() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Client-side validation (the server validates again, defense in depth).
  function validate() {
    if (mode === 'register' && username.trim().length < 3) {
      return 'Username must be at least 3 characters.';
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return 'Enter a valid email address.';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters.';
    }
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      // On success the AuthProvider sets the user and App swaps to the app shell.
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-logo">Park<span>Bound</span></div>
      <div className="auth-tagline">Plan your day in the parks, dressed for the occasion.</div>

      <div className="card">
        <h2>{mode === 'login' ? 'Log in' : 'Create an account'}</h2>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="jamie"
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="at least 8 characters"
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <div className="auth-toggle">
          {mode === 'login' ? (
            <>New here? <button onClick={() => { setMode('register'); setError(''); }}>Create an account</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setMode('login'); setError(''); }}>Log in</button></>
          )}
        </div>
      </div>
    </div>
  );
}
