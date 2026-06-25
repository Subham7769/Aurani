import { cn } from "@/lib/utils";
import { ProductCard, ProductCardSkeleton, type ProductCardData } from "./product-card";

interface ProductGridProps {
  products: ProductCardData[];
  isLoading?: boolean;
  className?: string;
}

const SKELETON_COUNT = 8;

export function ProductGrid({ products, isLoading, className }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className={cn(gridClass, className)}>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-serif text-2xl text-muted-foreground">No products found</p>
        <p className="mt-2 font-sans text-sm text-muted-foreground">
          Try selecting a different category or check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className={cn(gridClass, className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

const gridClass =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
