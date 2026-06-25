import { db } from "@/lib/db";
import { decrypt, encrypt } from "@/lib/crypto";

const SHIPROCKET_BASE = "https://apiv2.shiprocket.in/v1/external";

export class ShiprocketApiError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = "ShiprocketApiError";
  }
}

async function authenticate(email: string, password: string): Promise<string> {
  const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new ShiprocketApiError("Shiprocket auth failed", res.status);
  const data = await res.json() as { token: string };
  return data.token;
}

export async function getShiprocketToken(resellerId: string): Promise<string> {
  const reseller = await db.reseller.findUnique({
    where: { id: resellerId },
    select: {
      shiprocketEmail: true,
      shiprocketPasswordEncrypted: true,
      shiprocketJwt: true,
      shiprocketJwtExpiresAt: true,
    },
  });

  if (!reseller?.shiprocketEmail || !reseller.shiprocketPasswordEncrypted) {
    throw new Error("Shiprocket credentials not configured");
  }

  const now = new Date();
  const expiresAt = reseller.shiprocketJwtExpiresAt;
  const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

  // Refresh if no token or expires within 30 minutes
  if (!reseller.shiprocketJwt || !expiresAt || expiresAt <= thirtyMinutesFromNow) {
    const password = decrypt(reseller.shiprocketPasswordEncrypted);
    const token = await authenticate(reseller.shiprocketEmail, password);
    const newExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h TTL

    await db.reseller.update({
      where: { id: resellerId },
      data: { shiprocketJwt: token, shiprocketJwtExpiresAt: newExpiry },
    });

    return token;
  }

  return reseller.shiprocketJwt;
}

export async function shiprocketFetch(
  path: string,
  resellerId: string,
  options: RequestInit = {},
): Promise<unknown> {
  const token = await getShiprocketToken(resellerId);
  const res = await fetch(`${SHIPROCKET_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = (body as { message?: string }).message ?? res.statusText;
    throw new ShiprocketApiError(msg, res.status);
  }
  return res.json();
}

export { encrypt };
