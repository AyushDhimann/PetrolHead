/**
 * Get the API base URL depending on context (SSR vs browser, dev vs prod)
 */

export function getApiBase(): string {
  // Explicit URL set (development override)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Server-side (SSR) - always use localhost
  if (typeof window === 'undefined') {
    return 'http://localhost:6055';
  }

  // Client-side in production - use relative URLs (nginx proxies /api/)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '';
  }

  // Client-side in development
  return 'http://localhost:6055';
}

// Export as constant for convenience
export const API_BASE = getApiBase();
