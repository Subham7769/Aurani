export interface MockProduct {
  id: string;
  title: string;
  description: string;
  category: "CLOTHING" | "JEWELLERY" | "HOME_ESSENTIALS";
  priceMin: number;
  priceMax: number;
  coverImageUrl: string;
  media: Array<{ cloudinaryUrl: string; mediaType: "IMAGE"; order: number }>;
  reseller: { whatsappPhoneNumberId: string | null };
  publishedAt: Date;
  status: "ACTIVE";
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "mock-1",
    title: "Handwoven Chanderi Kurta",
    description:
      "Crafted from pure Chanderi silk cotton, this kurta features delicate zari work at the hem and cuffs. The lightweight weave makes it ideal for warm Indian weather while keeping you elegantly dressed for any occasion.",
    category: "CLOTHING",
    priceMin: 2800,
    priceMax: 3200,
    coverImageUrl: "https://picsum.photos/seed/kurta1/600/800",
    media: [{ cloudinaryUrl: "https://picsum.photos/seed/kurta1/600/800", mediaType: "IMAGE", order: 0 }],
    reseller: { whatsappPhoneNumberId: null },
    publishedAt: new Date("2026-06-01"),
    status: "ACTIVE",
  },
  {
    id: "mock-2",
    title: "Block Print Cotton Saree",
    description:
      "Hand block-printed in Jaipur using natural dyes, this cotton saree celebrates India's rich textile heritage. Comes with an unstitched matching blouse piece. Machine washable.",
    category: "CLOTHING",
    priceMin: 3500,
    priceMax: 4200,
    coverImageUrl: "https://picsum.photos/seed/saree2/600/800",
    media: [
      { cloudinaryUrl: "https://picsum.photos/seed/saree2/600/800", mediaType: "IMAGE", order: 0 },
      { cloudinaryUrl: "https://picsum.photos/seed/saree2b/600/800", mediaType: "IMAGE", order: 1 },
    ],
    reseller: { whatsappPhoneNumberId: null },
    publishedAt: new Date("2026-06-03"),
    status: "ACTIVE",
  },
  {
    id: "mock-3",
    title: "Embroidered Silk Dupatta",
    description:
      "Pure silk dupatta with hand-done chikankari embroidery from Lucknow. The delicate floral motifs are worked by master artisans over several days. Pairs beautifully with both ethnic and fusion outfits.",
    category: "CLOTHING",
    priceMin: 1800,
    priceMax: 2200,
    coverImageUrl: "https://picsum.photos/seed/dupatta3/600/800",
    media: [{ cloudinaryUrl: "https://picsum.photos/seed/dupatta3/600/800", mediaType: "IMAGE", order: 0 }],
    reseller: { whatsappPhoneNumberId: null },
    publishedAt: new Date("2026-06-05"),
    status: "ACTIVE",
  },
  {
    id: "mock-4",
    title: "Kundan Jhumka Earrings",
    description:
      "Traditional Kundan jhumkas set in gold-plated silver with intricate meenakari work on the reverse. These statement earrings feature cascading pearl drops and are lightweight enough for all-day wear.",
    category: "JEWELLERY",
    priceMin: 1200,
    priceMax: 1500,
    coverImageUrl: "https://picsum.photos/seed/jhumka4/600/800",
    media: [{ cloudinaryUrl: "https://picsum.photos/seed/jhumka4/600/800", mediaType: "IMAGE", order: 0 }],
    reseller: { whatsappPhoneNumberId: null },
    publishedAt: new Date("2026-06-07"),
    status: "ACTIVE",
  },
  {
    id: "mock-5",
    title: "Oxidised Silver Bangle Set",
    description:
      "Set of 6 oxidised silver bangles crafted by Rajasthani artisans. Each bangle features a unique tribal motif — no two sets are identical. Adjustable opening for easy wearing.",
    category: "JEWELLERY",
    priceMin: 800,
    priceMax: 1000,
    coverImageUrl: "https://picsum.photos/seed/bangles5/600/800",
    media: [{ cloudinaryUrl: "https://picsum.photos/seed/bangles5/600/800", mediaType: "IMAGE", order: 0 }],
    reseller: { whatsappPhoneNumberId: null },
    publishedAt: new Date("2026-06-09"),
    status: "ACTIVE",
  },
  {
    id: "mock-6",
    title: "Meenakari Maang Tikka",
    description:
      "Handcrafted Meenakari maang tikka in vibrant peacock blue and green enamel work over gold-plated base. A perfect bridal or festive hair accessory.",
    category: "JEWELLERY",
    priceMin: 650,
    priceMax: 900,
    coverImageUrl: "https://picsum.photos/seed/tikka6/600/800",
    media: [{ cloudinaryUrl: "https://picsum.photos/seed/tikka6/600/800", mediaType: "IMAGE", order: 0 }],
    reseller: { whatsappPhoneNumberId: null },
    publishedAt: new Date("2026-06-11"),
    status: "ACTIVE",
  },
  {
    id: "mock-7",
    title: "Hand-blocked Printed Bedsheet",
    description:
      "100% pure cotton bedsheet printed with traditional ajrakh block patterns from Kutch. King size (108 x 108 inches) with 2 matching pillow covers. Pre-washed for softness.",
    category: "HOME_ESSENTIALS",
    priceMin: 2200,
    priceMax: 2800,
    coverImageUrl: "https://picsum.photos/seed/bedsheet7/600/800",
    media: [{ cloudinaryUrl: "https://picsum.photos/seed/bedsheet7/600/800", mediaType: "IMAGE", order: 0 }],
    reseller: { whatsappPhoneNumberId: null },
    publishedAt: new Date("2026-06-13"),
    status: "ACTIVE",
  },
  {
    id: "mock-8",
    title: "Brass Diya Set",
    description:
      "Set of 5 hand-cast brass diyas in varying sizes, each with a floral base design. Perfect for Puja, festival decoration, or everyday home ambience. Develops a beautiful patina over time.",
    category: "HOME_ESSENTIALS",
    priceMin: 450,
    priceMax: 600,
    coverImageUrl: "https://picsum.photos/seed/diya8/600/800",
    media: [{ cloudinaryUrl: "https://picsum.photos/seed/diya8/600/800", mediaType: "IMAGE", order: 0 }],
    reseller: { whatsappPhoneNumberId: null },
    publishedAt: new Date("2026-06-15"),
    status: "ACTIVE",
  },
  {
    id: "mock-9",
    title: "Kalamkari Table Runner",
    description:
      "Hand-painted Kalamkari table runner from Andhra Pradesh depicting scenes from Indian mythology. Made using natural dyes on pure cotton. Size: 14 x 72 inches.",
    category: "HOME_ESSENTIALS",
    priceMin: 1100,
    priceMax: 1400,
    coverImageUrl: "https://picsum.photos/seed/runner9/600/800",
    media: [{ cloudinaryUrl: "https://picsum.photos/seed/runner9/600/800", mediaType: "IMAGE", order: 0 }],
    reseller: { whatsappPhoneNumberId: null },
    publishedAt: new Date("2026-06-17"),
    status: "ACTIVE",
  },
];

export function getMockProduct(id: string): MockProduct | null {
  return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
}

export function getMockProducts(category?: string): MockProduct[] {
  if (!category) return MOCK_PRODUCTS;
  return MOCK_PRODUCTS.filter((p) => p.category === category);
}
