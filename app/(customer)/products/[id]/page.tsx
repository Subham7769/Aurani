import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getMockProduct, MOCK_PRODUCTS } from "@/lib/mock-data";
import { MediaGallery } from "@/components/product/media-gallery";
import { WhatsAppInquiryForm } from "@/components/brand/whatsapp-inquiry-form";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const products = await db.product.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
    });
    return [
      ...products.map((p: { id: string }) => ({ id: p.id })),
      ...MOCK_PRODUCTS.map((p: { id: string }) => ({ id: p.id })),
    ];
  } catch {
    return MOCK_PRODUCTS.map((p: { id: string }) => ({ id: p.id }));
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await db.product.findUnique({
      where: { id, status: "ACTIVE" },
      include: { media: { take: 1, orderBy: { order: "asc" } } },
    });
    if (product) {
      return {
        title: `${product.title} — Aurani`,
        description: product.description.slice(0, 160),
        openGraph: {
          title: product.title,
          description: product.description.slice(0, 160),
          images: product.media[0] ? [{ url: product.media[0].cloudinaryUrl }] : [],
        },
      };
    }
  } catch {
    // fall through to mock
  }

  const mock = getMockProduct(id);
  if (mock) {
    return {
      title: `${mock.title} — Aurani`,
      description: mock.description.slice(0, 160),
      openGraph: {
        title: mock.title,
        description: mock.description.slice(0, 160),
        images: [{ url: mock.coverImageUrl }],
      },
    };
  }
  return { title: "Product not found — Aurani" };
}

const CATEGORY_LABELS: Record<string, string> = {
  CLOTHING: "Clothing",
  JEWELLERY: "Jewellery",
  HOME_ESSENTIALS: "Home Essentials",
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://aurani.in";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Try DB first
  try {
    const product = await db.product.findUnique({
      where: { id, status: "ACTIVE" },
      include: {
        media: { orderBy: { order: "asc" } },
        reseller: { select: { whatsappPhone: true, user: { select: { email: true } } } },
      },
    });

    if (product) {
      const mediaItems = product.media.map((m, i) => ({
        url: m.cloudinaryUrl,
        mediaType: m.mediaType as "IMAGE" | "VIDEO",
        alt: product.title,
        order: i,
      }));

      const productUrl = `${APP_URL}/products/${id}`;
      const sellerPhone = product.reseller.whatsappPhone ?? "";
      const sellerName = `Aurani — ${product.reseller.user.email.split("@")[0]}`;
      const productCode = id.slice(0, 8).toUpperCase();

      return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr]">
            <MediaGallery media={mediaItems} productTitle={product.title} />
            <div className="flex flex-col gap-6">
              <div>
                <Badge variant="secondary" className="mb-3">
                  {CATEGORY_LABELS[product.category] ?? product.category}
                </Badge>
                <h1 className="font-serif text-3xl text-foreground">{product.title}</h1>
              </div>

              {/* Pricing CTA */}
              {sellerPhone ? (
                <WhatsAppInquiryForm
                  sellerPhone={sellerPhone}
                  productTitle={product.title}
                  productCategory={product.category}
                  productDescription={product.description}
                  productUrl={productUrl}
                  productCode={productCode}
                />
              ) : (
                <div className="rounded-xl border border-border p-5">
                  <p className="font-serif text-xl text-foreground">Get your personalized price</p>
                  <p className="mt-1 font-sans text-sm text-muted-foreground italic">WhatsApp contact not set up yet.</p>
                </div>
              )}

              {product.description && (
                <div className="flex flex-col gap-2">
                  <h2 className="font-sans text-sm font-semibold uppercase tracking-widest text-muted-foreground">Description</h2>
                  <p className="font-sans text-sm leading-relaxed text-foreground whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              <p className="font-sans text-xs text-muted-foreground">GST inclusive · All orders via WhatsApp</p>
            </div>
          </div>
        </div>
      );
    }
  } catch {
    // fall through to mock
  }

  // Fall back to mock product
  const mock = getMockProduct(id);
  if (!mock) notFound();

  const mediaItems = mock.media.map((m, i) => ({
    url: m.cloudinaryUrl,
    mediaType: m.mediaType as "IMAGE" | "VIDEO",
    alt: mock.title,
    order: i,
  }));

  const productUrl = `${APP_URL}/products/${id}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr]">
        <MediaGallery media={mediaItems} productTitle={mock.title} />
        <div className="flex flex-col gap-6">
          <div>
            <Badge variant="secondary" className="mb-3">
              {CATEGORY_LABELS[mock.category] ?? mock.category}
            </Badge>
            <h1 className="font-serif text-3xl text-foreground">{mock.title}</h1>
          </div>

          {/* Pricing CTA */}
          <WhatsAppInquiryForm
            sellerPhone="919999999999"
            productTitle={mock.title}
            productCategory={mock.category}
            productDescription={mock.description}
            productUrl={productUrl}
            productCode={id.slice(0, 8).toUpperCase()}
          />

          <div className="flex flex-col gap-2">
            <h2 className="font-sans text-sm font-semibold uppercase tracking-widest text-muted-foreground">Description</h2>
            <p className="font-sans text-sm leading-relaxed text-foreground whitespace-pre-line">
              {mock.description}
            </p>
          </div>

          <p className="font-sans text-xs text-muted-foreground">GST inclusive · All orders via WhatsApp</p>
        </div>
      </div>
    </div>
  );
}
