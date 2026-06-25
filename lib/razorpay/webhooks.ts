import { createHmac, timingSafeEqual } from "crypto";

export function verifyRazorpaySignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
