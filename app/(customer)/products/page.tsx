import { Suspense } from "react";
import { db } from "@/lib/db";
import { ProductGrid } from "@/components/product/product-grid";
import { CategoryFilter } from "@/components/product/category-filter";
import { getMockProducts } from "@/lib/mock-data";
import type { ProductCardData } from "@/components/product/product-card";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Products — Aurani",
  description: "Browse all clothing, jewellery, and home essentials from Aurani.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const categoryFilter =
    category === "CLOTHING" || category === "JEWELLERY" || category === "HOME_ESSENTIALS"
      ? category
      : undefined;

  let cards: ProductCardData[] = [];

  try {
    const products = await db.product.findMany({
      where: {
        status: "ACTIVE",
        ...(categoryFilter ? { category: categoryFilter } : {}),
      },
      include: { media: { orderBy: { order: "asc" }, take: 1 } },
      orderBy: { publishedAt: "desc" },
    });

    cards = products.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category as ProductCardData["category"],
      priceMin: Number(p.priceMin),
      priceMax: Number(p.priceMax),
      coverImageUrl: p.media[0]?.cloudinaryUrl ?? "",
      slug: p.id,
    }));
  } catch {
    // DB not connected — use mock data
  }

  // Fall back to mock products when DB is empty or unavailable
  if (cards.length === 0) {
    const mocks = getMockProducts(categoryFilter);
    cards = mocks.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      priceMin: p.priceMin,
      priceMax: p.priceMax,
      coverImageUrl: p.coverImageUrl,
      slug: p.id,
    }));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-foreground">All Products</h1>
        <p className="font-sans text-sm text-muted-foreground">{cards.length} items</p>
      </div>
      <Suspense>
        <CategoryFilter />
      </Suspense>
      <div className="mt-8">
        <ProductGrid products={cards} />
      </div>
    </div>
  );
}
