import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, USER_KEY } from '../constants';
import { clearAccessToken, getAccessToken, setAccessToken } from './session';

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Helper function para leer cookies:
function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null;
    return null;
}

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.headers) {
      config.headers['X-XSRF-TOKEN'] = getCookie('XSRF-TOKEN') ?? '';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export function clearSession() {
  clearAccessToken();
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event('bioguard:unauthorized'));
}

let refreshPromise: Promise<string | null> | null = null;

export async function tryRefreshToken(): Promise<string | null> {
  try {
    const { data } = await axios.post<{ accessToken: string }>(
      `${API_BASE_URL}/api/Auth/refresh`,
      {},
      { withCredentials: true, timeout: 15000 }
    );
    if (!data?.accessToken) return null;
    setAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (status === 401 && original && !original._retry && !original.url?.includes('/api/Auth/')) {
      original._retry = true;
      if (!refreshPromise) {
        refreshPromise = tryRefreshToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      if (newToken && original.headers) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return httpClient(original);
      }
      clearSession();
    }

    const rawMessage = error.response?.data?.message || error.message || 'Error de conexión';
    const isInternalTrace = /(exception|stacktrace|sql|mongo|internal server error|at BioGuard\.)/i.test(rawMessage);
    const message = isInternalTrace
      ? 'Error de comunicación con el servidor. Por favor intente nuevamente.'
      : rawMessage;

    return Promise.reject({ message, status });
  }
);

export default httpClient;
