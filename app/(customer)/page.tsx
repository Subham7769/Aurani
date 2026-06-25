import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

export const revalidate = 60;

export const metadata = {
  title: "Aurani — Quietly traditional. Quietly modern.",
  description: "Curated women's lifestyle brand from India. Clothing, jewellery, and home essentials.",
};

export default async function HomePage() {
  let featured: Array<{
    id: string;
    title: string;
    priceMin: { toString(): string };
    priceMax: { toString(): string };
    media: Array<{ cloudinaryUrl: string }>;
  }> = [];

  try {
    featured = await db.product.findMany({
      where: { status: "ACTIVE" },
      include: { media: { orderBy: { order: "asc" }, take: 1 } },
      orderBy: { publishedAt: "desc" },
      take: 3,
    });
  } catch {
    // DB not connected — use mock data
  }

  // Fall back to mock products when DB is empty or unavailable
  const displayProducts =
    featured.length > 0
      ? featured.map((p: typeof featured[number]) => ({
          id: p.id,
          title: p.title,
          priceMin: p.priceMin.toString(),
          priceMax: p.priceMax.toString(),
          imageUrl: p.media[0]?.cloudinaryUrl ?? "",
        }))
      : MOCK_PRODUCTS.slice(0, 3).map((p) => ({
          id: p.id,
          title: p.title,
          priceMin: String(p.priceMin),
          priceMax: String(p.priceMax),
          imageUrl: p.coverImageUrl,
        }));

  return (
    <main>
      {/* Hero */}
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground">
          New arrivals
        </p>
        <h1 className="mt-4 font-serif text-5xl font-light leading-tight text-foreground md:text-7xl">
          Quietly traditional.<br />Quietly modern.
        </h1>
        <p className="mt-6 max-w-md font-sans text-base text-muted-foreground">
          Handpicked clothing, jewellery, and home essentials — curated for the Indian woman.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex items-center rounded-md bg-primary px-8 py-3 font-sans text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Shop Now
        </Link>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 font-serif text-2xl text-foreground">New Arrivals</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group flex flex-col gap-3"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground font-sans text-xs">
                    No image
                  </div>
                )}
              </div>
              <div>
                <p className="font-serif text-lg text-foreground">{product.title}</p>
                <p className="mt-0.5 font-sans text-sm text-muted-foreground">
                  ₹{product.priceMin}
                  {product.priceMin !== product.priceMax ? ` – ₹${product.priceMax}` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/products"
            className="font-sans text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            View all products →
          </Link>
        </div>
      </section>
    </main>
  );
}
