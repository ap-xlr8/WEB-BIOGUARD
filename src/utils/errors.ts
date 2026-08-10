import axios from 'axios';

interface NormalizedApiError {
  message?: string;
  status?: number;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as NormalizedApiError).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

export function getErrorStatus(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) return error.response?.status;
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as NormalizedApiError).status;
    return typeof status === 'number' ? status : undefined;
  }
  return undefined;
}
