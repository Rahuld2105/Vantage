const runtimeConfiguredApiUrl =
  typeof window !== 'undefined' ? window.__APP_CONFIG__?.API_URL?.trim() : '';
const configuredApiUrl = runtimeConfiguredApiUrl || import.meta.env.VITE_API_URL?.trim();
const isDev = import.meta.env.DEV;

const DEFAULT_API_BASES = isDev
  ? [configuredApiUrl || '/api']
  : [configuredApiUrl || '/api'];

const FALLBACK_API_BASES = configuredApiUrl
  ? []
  : isDev
    ? ['http://localhost:6000/api', 'http://localhost:5000/api']
    : [];

const API_BASES = [...new Set([...DEFAULT_API_BASES, ...FALLBACK_API_BASES])];
const NETWORK_RETRY_DELAYS_MS = [800, 1500];

const getPrimaryApiBase = () => API_BASES[0] || '/api';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const resolveBackendUrl = (path = '') => {
  if (!path) {
    return new URL(getPrimaryApiBase(), window.location.origin).toString();
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const backendOrigin = new URL(getPrimaryApiBase(), window.location.origin).origin;
  return new URL(path, backendOrigin).toString();
};

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json()
    : { message: await res.text() };

  if (!res.ok) {
    const validationMessage = Array.isArray(data.errors)
      ? data.errors[0]?.message
      : null;
    const error = new Error(validationMessage || data.message || `Error: ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
};

const request = async (path, options = {}) => {
  for (const base of API_BASES) {
    for (let attempt = 0; attempt <= NETWORK_RETRY_DELAYS_MS.length; attempt += 1) {
      try {
        const res = await fetch(`${base}${path}`, options);
        return await handleResponse(res);
      } catch (err) {
        // Retry network-level failures to tolerate Render cold starts.
        if (!(err instanceof TypeError)) {
          throw err;
        }

        if (attempt < NETWORK_RETRY_DELAYS_MS.length) {
          await wait(NETWORK_RETRY_DELAYS_MS[attempt]);
          continue;
        }
      }
    }
  }

  const attemptedBases = API_BASES.join(', ');
  throw new Error(
    `Unable to reach the backend. Checked: ${attemptedBases}. ` +
    `Make sure the backend server is running and VITE_API_URL is correct.`
  );
};

// AUTH ENDPOINTS
export const authAPI = {
  register: async ({ name, email, password, charityId, charityPercent }) => {
    return request('/auth/register', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password, charityId, charityPercent }),
    });
  },

  login: async (email, password) => {
    return request('/auth/login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
  },

  getMe: async () => {
    return request('/auth/me', {
      method: 'GET',
      headers: getHeaders(),
    });
  },
};

export const userAPI = {
  getProfile: async () => {
    return request('/users', {
      method: 'GET',
      headers: getHeaders(),
    });
  },

  updateProfile: async (payload) => {
    return request('/users', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
  },
};

// SCORE ENDPOINTS
export const scoreAPI = {
  getScores: async () => {
    return request('/scores', {
      method: 'GET',
      headers: getHeaders(),
    });
  },

  addScore: async (value, date) => {
    return request('/scores', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ value, date }),
    });
  },

  replaceScores: async (scores) => {
    return request('/scores', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ scores }),
    });
  },
};

// CHARITY ENDPOINTS
export const charityAPI = {
  getAll: async (category = null, search = null, page = 1) => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    params.append('page', page);

    return request(`/charities?${params}`, {
      method: 'GET',
      headers: getHeaders(),
    });
  },

  getById: async (id) => {
    return request(`/charities/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
  },

  create: async (payload) => {
    return request('/charities', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
  },

  update: async (id, payload) => {
    return request(`/charities/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
  },

  remove: async (id) => {
    return request(`/charities/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  },

  donate: async (id, payload) => {
    return request(`/charities/${id}/donations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
  },
};

// SUBSCRIPTION ENDPOINTS
export const subscriptionAPI = {
  createCheckout: async (plan, billing, charityId, charityPercent) => {
    return request('/subscriptions/checkout', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        plan,
        billing,
        charityId,
        charityPercent,
      }),
    });
  },

  confirmCheckout: async (sessionId) => {
    return request('/subscriptions/confirm-checkout', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sessionId }),
    });
  },

  getMySubscription: async () => {
    return request('/subscriptions', {
      method: 'GET',
      headers: getHeaders(),
    });
  },

  updateCharity: async (charityId, charityPercent) => {
    return request('/subscriptions/charity', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ charityId, charityPercent }),
    });
  },

  cancel: async () => {
    return request('/subscriptions', {
      method: 'DELETE',
      headers: getHeaders(),
    });
  },
};

// DRAW ENDPOINTS
export const drawAPI = {
  getHistory: async (page = 1) => {
    return request(`/draws/history?page=${page}`, {
      method: 'GET',
      headers: getHeaders(),
    });
  },

  getDraft: async () => {
    return request('/draws/draft', {
      method: 'GET',
      headers: getHeaders(),
    });
  },

  simulate: async (id, logic) => {
    return request(`/draws/${id}/simulate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ logic }),
    });
  },

  publish: async (id) => {
    return request(`/draws/${id}/publish`, {
      method: 'POST',
      headers: getHeaders(),
    });
  },
};

// WINNER ENDPOINTS
export const winnerAPI = {
  getMyWinnings: async () => {
    return request('/winners', {
      method: 'GET',
      headers: getHeaders(),
    });
  },

  uploadProof: async (winnerId, file) => {
    const formData = new FormData();
    formData.append('proof', file);

    const token = localStorage.getItem('token');
    return request(`/winners/${winnerId}/proof`, {
      method: 'POST',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    });
  },
};

// ADMIN ENDPOINTS
export const adminAPI = {
  getStats: async () => {
    return request('/admin/stats', {
      method: 'GET',
      headers: getHeaders(),
    });
  },

  getUsers: async (page = 1, limit = 10, search = '') => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (search.trim()) {
      params.append('search', search.trim());
    }

    return request(`/admin/users?${params}`, {
      method: 'GET',
      headers: getHeaders(),
    });
  },

  updateUser: async (id, payload) => {
    return request(`/admin/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
  },

  getSubscriptions: async () => {
    return request('/admin/subscriptions', {
      method: 'GET',
      headers: getHeaders(),
    });
  },

  updateSubscription: async (id, payload) => {
    return request(`/admin/subscriptions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
  },

  getUserScores: async (id) => {
    return request(`/admin/users/${id}/scores`, {
      method: 'GET',
      headers: getHeaders(),
    });
  },

  replaceUserScores: async (id, scores) => {
    return request(`/admin/users/${id}/scores`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ scores }),
    });
  },

  getWinners: async (status = '') => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    return request(`/admin/winners?${params}`, {
      method: 'GET',
      headers: getHeaders(),
    });
  },

  verifyWinner: async (winnerId, action, adminNotes = '') => {
    return request(`/admin/winners/${winnerId}/verify`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ action, adminNotes }),
    });
  },
};
