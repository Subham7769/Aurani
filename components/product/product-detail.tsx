import { MediaGallery, type MediaItem } from "./media-gallery";
import { PriceDisplay } from "@/components/brand/price-display";
import { WhatsAppCTA } from "@/components/brand/whatsapp-cta";

export interface ProductDetailData {
  id: string;
  title: string;
  description: string;
  category: "CLOTHING" | "JEWELLERY" | "HOME_ESSENTIALS";
  priceMin: number;
  priceMax: number;
  media: MediaItem[];
  resellerWhatsappPhone: string;
}

const categoryLabel: Record<ProductDetailData["category"], string> = {
  CLOTHING: "Clothing",
  JEWELLERY: "Jewellery",
  HOME_ESSENTIALS: "Home",
};

interface ProductDetailProps {
  product: ProductDetailData;
}

export function ProductDetail({ product }: ProductDetailProps) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr]">
      {/* Gallery — left 60% on desktop */}
      <MediaGallery media={product.media} productTitle={product.title} />

      {/* Details — right 40% on desktop */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="font-sans text-xs uppercase tracking-widest text-muted-foreground">
            {categoryLabel[product.category]}
          </span>
          <h1 className="font-serif text-3xl leading-tight text-foreground">
            {product.title}
          </h1>
        </div>

        <PriceDisplay
          priceMin={product.priceMin}
          priceMax={product.priceMax}
        />

        <p className="font-sans text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <WhatsAppCTA
          phoneNumber={product.resellerWhatsappPhone}
          productTitle={product.title}
          className="w-full justify-center sm:w-auto sm:justify-start"
        />

        <p className="font-sans text-xs text-muted-foreground">
          Tap above to chat directly with our team about sizing, availability,
          and payment options.
        </p>
      </div>
    </div>
  );
}
