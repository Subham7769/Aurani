import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "@/components/brand/price-display";

export interface ProductCardData {
  id: string;
  title: string;
  slug: string;
  category: "CLOTHING" | "JEWELLERY" | "HOME_ESSENTIALS";
  priceMin?: number;
  priceMax?: number;
  coverImageUrl: string;
  coverImageAlt?: string;
}

const categoryLabel: Record<ProductCardData["category"], string> = {
  CLOTHING: "Clothing",
  JEWELLERY: "Jewellery",
  HOME_ESSENTIALS: "Home",
};

interface ProductCardProps {
  product: ProductCardData;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg bg-card",
        "border border-border transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-md",
        className,
      )}
    >
      {/* Image — 70% of card height */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        <Image
          src={product.coverImageUrl}
          alt={product.coverImageAlt ?? product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1.5 p-4">
        <span className="font-sans text-xs uppercase tracking-widest text-muted-foreground">
          {categoryLabel[product.category]}
        </span>
        <h3 className="font-serif text-lg leading-snug text-foreground line-clamp-2">
          {product.title}
        </h3>
        <PriceDisplay className="mt-1" />
      </div>
    </Link>
  );
}

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-lg bg-card border border-border", className)}>
      <div className="aspect-[3/4] w-full animate-pulse bg-muted" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
