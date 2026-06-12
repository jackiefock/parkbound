// Thin wrapper around fetch. Adds the base URL, JSON headers, and the
// auth token (read from localStorage), and turns API errors into thrown
// Errors so callers can try/catch.

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function apiFetch(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('pb_token');

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Some responses (rare) may have no body.
  }

  if (!res.ok) {
    // The API returns either { error: "..." } or { errors: ["...", ...] }.
    const message =
      data?.error || (data?.errors && data.errors.join(', ')) || 'Request failed';
    throw new Error(message);
  }

  return data;
}
