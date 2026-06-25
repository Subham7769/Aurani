import { cn } from "@/lib/utils";

interface WhatsAppCTAProps {
  phoneNumber: string;      // digits only, e.g. "919876543210"
  productTitle: string;
  productUrl: string;       // full URL, e.g. https://aurani.in/products/abc
  className?: string;
}

function buildMessage(productTitle: string, productUrl: string): string {
  return [
    `Hi! 👋 I saw this on Aurani and I'm interested:`,
    ``,
    `*${productTitle}*`,
    `${productUrl}`,
    ``,
    `Could you please share the price and availability? 🙏`,
  ].join("\n");
}

export function WhatsAppCTA({ phoneNumber, productTitle, productUrl, className }: WhatsAppCTAProps) {
  const digits = phoneNumber.replace(/\D/g, "");
  const message = buildMessage(productTitle, productUrl);
  const href = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5",
        "font-sans text-sm font-semibold text-white",
        "transition-all duration-200 hover:brightness-110 active:scale-[0.98]",
        "shadow-sm",
        className,
      )}
      style={{ backgroundColor: "#25D366" }}
    >
      <WhatsAppIcon className="h-5 w-5 shrink-0" />
      Connect with Seller
    </a>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.847L.057 23.882a.5.5 0 0 0 .612.611l6.079-1.457A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.897 0-3.67-.52-5.188-1.424l-.372-.22-3.862.927.949-3.777-.244-.389A10 10 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}
