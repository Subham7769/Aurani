const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

export class WhatsAppApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: number,
  ) {
    super(message);
    this.name = "WhatsAppApiError";
  }
}

export async function whatsappFetch(
  path: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<unknown> {
  const url = `${GRAPH_API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const errorCode = (body as { error?: { code?: number } }).error?.code;
    const errorMsg =
      (body as { error?: { message?: string } }).error?.message ?? res.statusText;
    throw new WhatsAppApiError(errorMsg, res.status, errorCode);
  }

  return res.json();
}
