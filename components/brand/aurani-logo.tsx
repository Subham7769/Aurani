import { cn } from "@/lib/utils";

interface AuraniLogoProps {
  src?: string;
  alt?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-xl tracking-wide",
  md: "text-2xl tracking-wide",
  lg: "text-4xl tracking-wider",
} as const;

export function AuraniLogo({
  src,
  alt = "Aurani",
  className,
  size = "md",
}: AuraniLogoProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn("object-contain", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "font-serif font-medium text-foreground select-none",
        sizeClasses[size],
        className,
      )}
    >
      Aurani
    </span>
  );
}
