import Razorpay from "razorpay";

let _client: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (!_client) {
    _client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return _client;
}
