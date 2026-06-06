import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const tokenStore = {
  get access() { return localStorage.getItem('ih_access'); },
  get refresh() { return localStorage.getItem('ih_refresh'); },
  set({ accessToken, refreshToken }) {
    if (accessToken) localStorage.setItem('ih_access', accessToken);
    if (refreshToken) localStorage.setItem('ih_refresh', refreshToken);
  },
  clear() {
    localStorage.removeItem('ih_access');
    localStorage.removeItem('ih_refresh');
  },
};

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = tokenStore.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Single-flight refresh: on a 401, try to refresh once, then replay the request.
let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && !original._retry && tokenStore.refresh && !original.url.includes('/auth/')) {
      original._retry = true;
      try {
        refreshing =
          refreshing ||
          axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: tokenStore.refresh });
        const { data } = await refreshing;
        refreshing = null;
        tokenStore.set(data);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (e) {
        refreshing = null;
        tokenStore.clear();
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

// Normalizes axios errors into a plain message for the UI.
export function apiError(err) {
  return err?.response?.data?.error?.message || err?.message || 'Something went wrong';
}
