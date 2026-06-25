import { whatsappFetch } from "./client";

export interface BroadcastMessage {
  phoneNumberId: string;
  accessToken: string;
  to: string; // group ID or individual phone number
  imageUrl: string;
  caption: string;
}

export async function sendImageMessage(msg: BroadcastMessage): Promise<string> {
  const payload = {
    messaging_product: "whatsapp",
    to: msg.to,
    type: "image",
    image: {
      link: msg.imageUrl,
      caption: msg.caption,
    },
  };

  const result = await whatsappFetch(
    `/${msg.phoneNumberId}/messages`,
    msg.accessToken,
    { method: "POST", body: JSON.stringify(payload) },
  ) as { messages: { id: string }[] };

  return result.messages?.[0]?.id ?? "";
}

export async function sendTextMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  text: string,
): Promise<string> {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text },
  };

  const result = await whatsappFetch(
    `/${phoneNumberId}/messages`,
    accessToken,
    { method: "POST", body: JSON.stringify(payload) },
  ) as { messages: { id: string }[] };

  return result.messages?.[0]?.id ?? "";
}
