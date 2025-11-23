// src/api.js
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) },
    credentials: 'include',
    ...opts
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'API error');
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return null;
}

export const Users = {
  list: () => request('/users'),
  create: (payload) => request('/users', { method: 'POST', body: JSON.stringify(payload) }),
};

export const Teams = {
  list: () => request('/teams'),
  create: (payload) => request('/teams', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/teams/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  del: (id) => request(`/teams/${id}`, { method: 'DELETE' })
};

export const Players = {
  list: () => request('/players'),
  create: (payload) => request('/players', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/players/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  del: (id) => request(`/players/${id}`, { method: 'DELETE' })
};

export const Tournaments = {
  list: () => request('/tournaments'),
  create: (payload) => request('/tournaments', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/tournaments/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  del: (id) => request(`/tournaments/${id}`, { method: 'DELETE' })
};

export const Matches = {
  list: () => request('/matches'),
  create: (payload) => request('/matches', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/matches/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  del: (id) => request(`/matches/${id}`, { method: 'DELETE' })
};

export const Results = {
  list: () => request('/results'),
  create: (payload) => request('/results', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/results/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  del: (id) => request(`/results/${id}`, { method: 'DELETE' })
};

export const Stats = {
  list: () => request('/stats'),
  create: (payload) => request('/stats', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/stats/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  del: (id) => request(`/stats/${id}`, { method: 'DELETE' })
};

// expose the low-level request helper for internal use (AuthProvider)
export { request };
