// api/client.js
// Single axios instance for the whole app.
//
// - Base URL comes from the environment, so switching ports or deploying no
//   longer means editing dozens of hardcoded localhost URLs.
// - A request interceptor attaches the bearer token, so call sites never
//   build Authorization headers by hand.
// - A response interceptor clears a dead session on 401 and sends the user
//   back to the login page.
import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE_URL
});

export const TOKEN_KEY = 'token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response && error.response.status;

    // An expired or invalid token should not leave the app in a half
    // logged-in state. Clear it and bounce to login, unless we are already
    // on an auth screen (a failed login attempt is a normal 401).
    if (status === 401) {
      const onAuthPage = ['/login', '/register'].includes(window.location.pathname);
      if (!onAuthPage) {
        setToken(null);
        localStorage.removeItem('user');
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
