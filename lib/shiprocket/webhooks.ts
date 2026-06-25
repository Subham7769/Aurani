export interface ShiprocketWebhookPayload {
  awb: string;
  current_status: string;
  order_id: string | number;
  tracking_url?: string;
}
