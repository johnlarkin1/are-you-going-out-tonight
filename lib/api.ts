import type { VotePayload, ResultsResponse } from './types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8787';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  deviceId: string,
  options: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': deviceId,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Unknown error', code: 'UNKNOWN' }));
      throw new ApiError(body.error ?? 'Request failed', res.status, body.code ?? 'UNKNOWN');
    }

    return await res.json() as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('No internet connection', 0, 'NETWORK_ERROR');
    }
    throw new ApiError('Network request failed', 0, 'NETWORK_ERROR');
  } finally {
    clearTimeout(timeout);
  }
}

export async function submitVote(
  payload: VotePayload,
  deviceId: string,
): Promise<{ success: boolean; id: number }> {
  return request('/api/vote', deviceId, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchResults(
  city: string,
  deviceId: string,
): Promise<ResultsResponse> {
  return request(`/api/results/${encodeURIComponent(city)}`, deviceId);
}
