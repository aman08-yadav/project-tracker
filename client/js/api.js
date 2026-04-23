// ═══════════════════════════════════════════════════════════
//  API.JS — Typed API Client for ProjectHub
// ═══════════════════════════════════════════════════════════

const BASE = '/api/v1';

function getToken() {
  return localStorage.getItem('token');
}

async function request(method, path, body = null, isFormData = false) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const options = { method, headers };
  if (body) options.body = isFormData ? body : JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, options);

  // Handle 401 — redirect to login (skip for auth endpoints)
  if (res.status === 401 && !path.includes('/auth/login') && !path.includes('/auth/register')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!window.location.pathname.includes('login') && !window.location.pathname.includes('signup')) {
      window.location.href = '/html/login.html';
    }
    throw new Error('Session expired. Please log in again.');
  }

  let data;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = { success: res.ok };
  }

  if (!res.ok) {
    const msg = data?.message || data?.errors?.[0]?.msg || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export const ApiClient = {
  get:    (path)           => request('GET',    path),
  post:   (path, body)     => request('POST',   path, body),
  patch:  (path, body)     => request('PATCH',  path, body),
  put:    (path, body)     => request('PUT',    path, body),
  delete: (path)           => request('DELETE', path),
  upload: (path, formData) => request('POST',   path, formData, true),
};
