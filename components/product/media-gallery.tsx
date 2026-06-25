"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface MediaItem {
  url: string;
  alt?: string;
  mediaType: "IMAGE" | "VIDEO";
  order: number;
}

interface MediaGalleryProps {
  media: MediaItem[];
  productTitle: string;
}

export function MediaGallery({ media, productTitle }: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const sorted = [...media].sort((a, b) => a.order - b.order);
  const active = sorted[activeIndex];

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + sorted.length) % sorted.length);
  }, [sorted.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % sorted.length);
  }, [sorted.length]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prev, next]);

  if (!active) return null;

  return (
    <>
      {/* Main media slot */}
      <div className="flex flex-col gap-3">
        <div
          className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-muted cursor-zoom-in"
          onClick={() => active.mediaType === "IMAGE" && setLightboxOpen(true)}
        >
          {active.mediaType === "VIDEO" ? (
            <video
              key={active.url}
              src={active.url}
              controls
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <Image
              src={active.url}
              alt={active.alt ?? productTitle}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover"
              priority={activeIndex === 0}
            />
          )}

          {/* Prev / Next arrows */}
          {sorted.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 text-foreground shadow backdrop-blur-sm hover:bg-background"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 text-foreground shadow backdrop-blur-sm hover:bg-background"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {sorted.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sorted.map((item, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`View media ${i + 1}`}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded border-2 transition-all",
                  i === activeIndex
                    ? "border-primary"
                    : "border-transparent opacity-60 hover:opacity-100",
                )}
              >
                {item.mediaType === "VIDEO" ? (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-xs">
                    ▶
                  </div>
                ) : (
                  <Image
                    src={item.url}
                    alt={item.alt ?? `${productTitle} ${i + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-background border-0">
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
            className="absolute right-3 top-3 z-10 rounded-full bg-background/80 p-1.5 text-foreground shadow backdrop-blur-sm hover:bg-background"
          >
            <X className="h-5 w-5" />
          </button>
          {active.mediaType === "IMAGE" && (
            <div className="relative aspect-[4/5] w-full">
              <Image
                src={active.url}
                alt={active.alt ?? productTitle}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
