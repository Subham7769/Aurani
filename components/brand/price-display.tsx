import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  className?: string;
}

export function PriceDisplay({ className }: PriceDisplayProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="font-sans text-sm font-medium text-[#25D366]">
        Get your personalized price
      </span>
      <span className="font-sans text-xs text-muted-foreground">
        Connect with seller on WhatsApp
      </span>
    </div>
  );
}
