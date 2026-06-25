import { whatsappFetch } from "./client";

export interface CatalogProduct {
  name: string;
  description: string;
  price: number; // in paise (INR cents)
  currency: string;
  imageUrl: string;
  retailerId: string; // our product ID
  availability: "in stock" | "out of stock";
}

export async function syncProductToCatalog(
  catalogId: string,
  accessToken: string,
  product: CatalogProduct,
): Promise<string> {
  const payload = {
    requests: [
      {
        method: "CREATE",
        retailer_id: product.retailerId,
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          currency: product.currency,
          image_url: product.imageUrl,
          availability: product.availability,
          condition: "new",
        },
      },
    ],
  };

  const result = await whatsappFetch(
    `/${catalogId}/batch`,
    accessToken,
    { method: "POST", body: JSON.stringify(payload) },
  ) as { handles: string[] };

  return result.handles?.[0] ?? "";
}
