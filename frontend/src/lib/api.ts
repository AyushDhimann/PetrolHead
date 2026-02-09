/**
 * API Client - Communicates with the PetrolHead FastAPI backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6055";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API Error ${res.status}: ${error}`);
  }

  return res.json();
}

// Types
export interface Demo {
  id: string;
  name: string;
  brand: string;
  location: string;
}

export interface DemoListResponse {
  demos: Demo[];
  count: number;
}

export interface DemoDashboardResponse {
  demo_id: string;
  data: Record<string, unknown>;
}

export interface ResearchStartResponse {
  session_id: string;
  status: string;
  message: string;
  provider: string;
}

export interface SessionStatus {
  session_id: string;
  query: string;
  status: string;
  provider: string | null;
  fallback_used: boolean;
  fallback_reason: string | null;
  progress_percent: number;
  current_message: string;
  thought_summaries: string[];
  started_at: string;
  completed_at: string | null;
  time_taken_seconds: number | null;
  has_result: boolean;
}

export interface SessionResult {
  session_id: string;
  has_result: boolean;
  json_data: Record<string, unknown> | null;
  raw_text: string | null;
  provider_used: string | null;
  fallback_used: boolean;
  fallback_reason: string | null;
  time_taken_seconds: number | null;
}

export interface HealthResponse {
  status: string;
  service: string;
  primary_provider: string;
  demo_mode: boolean;
}

export interface PastResearch {
  session_id: string;
  query: string;
  status: string;
  provider: string | null;
  fallback_used: boolean;
  progress_percent: number;
  has_result: boolean;
  started_at: string;
  completed_at: string | null;
  time_taken_seconds: number | null;
  created_at?: string;
}

// API Functions
export const api = {
  health: () => fetchApi<HealthResponse>("/api/health"),

  // Demos
  listDemos: () => fetchApi<DemoListResponse>("/api/dashboard/demos"),
  getDemoData: (id: string) => fetchApi<DemoDashboardResponse>(`/api/dashboard/demo/${id}`),

  // Research
  startResearch: (query: string) =>
    fetchApi<ResearchStartResponse>("/api/research/start", {
      method: "POST",
      body: JSON.stringify({ query }),
    }),

  // Session
  getSessionStatus: (sessionId: string) =>
    fetchApi<SessionStatus>(`/api/session/${sessionId}`),
  getSessionResult: (sessionId: string) =>
    fetchApi<SessionResult>(`/api/session/${sessionId}/result`),
  listSessions: () => fetchApi<{ sessions: SessionStatus[]; count: number }>("/api/session/list"),

  // Live dashboard
  getLiveDashboard: (sessionId: string) =>
    fetchApi<{ session_id: string; data: Record<string, unknown> }>(`/api/dashboard/live/${sessionId}`),

  // Past researches
  listPastResearches: () =>
    fetchApi<{ researches: PastResearch[]; count: number }>("/api/dashboard/past-researches"),

  // Extraction cache
  getCachedExtraction: (cacheKey: string) =>
    fetchApi<{ data: Record<string, unknown> | null }>(`/api/cache/get/${cacheKey}`).catch(() => ({ data: null })),
  setCachedExtraction: (cacheKey: string, section: string, textHash: string, data: Record<string, unknown>) =>
    fetchApi<{ success: boolean }>("/api/cache/set", {
      method: "POST",
      body: JSON.stringify({ cache_key: cacheKey, section, text_hash: textHash, data }),
    }).catch(() => ({ success: false })),
};
