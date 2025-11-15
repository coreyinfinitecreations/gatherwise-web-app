const rawBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_GW_WEB_APP_URL ||
  "";

const normalizedBaseUrl = rawBaseUrl.endsWith("/")
  ? rawBaseUrl.slice(0, -1)
  : rawBaseUrl;

/**
 * Builds an absolute API URL using the configured production base URL.
 * Falls back to the relative path when no production URL is configured.
 */
export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!normalizedBaseUrl) {
    return normalizedPath;
  }

  return `${normalizedBaseUrl}${normalizedPath}`;
}

export function getApiBaseUrl() {
  return normalizedBaseUrl;
}
