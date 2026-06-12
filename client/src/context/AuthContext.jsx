import { createContext, useContext, useState } from 'react';
import { apiFetch } from '../api/client.js';

// Global auth state via the Context API. Persists the token and user to
// localStorage so a page refresh keeps you logged in.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize from localStorage so a refresh restores the session.
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('pb_user');
    return raw ? JSON.parse(raw) : null;
  });

  function persist(token, userObj) {
    localStorage.setItem('pb_token', token);
    localStorage.setItem('pb_user', JSON.stringify(userObj));
    setUser(userObj);
  }

  async function register(username, email, password) {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: { username, email, password }
    });
    persist(data.token, data.user);
  }

  async function login(email, password) {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    persist(data.token, data.user);
  }

  function logout() {
    localStorage.removeItem('pb_token');
    localStorage.removeItem('pb_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Convenience hook so components can read auth state without importing the context.
export function useAuth() {
  return useContext(AuthContext);
}
