"use client";

interface WhatsAppInquiryFormProps {
  sellerPhone: string;
  productTitle: string;
  productCategory: string;
  productDescription: string;
  productUrl: string;
  productCode: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  CLOTHING: "Clothing",
  JEWELLERY: "Jewellery",
  HOME_ESSENTIALS: "Home Essentials",
};

function buildMessage(
  productTitle: string,
  productCategory: string,
  productDescription: string,
  productUrl: string,
  productCode: string,
  wantsBroadcast: boolean,
): string {
  const category = CATEGORY_LABELS[productCategory] ?? productCategory;
  const shortDesc = productDescription.length > 200
    ? productDescription.slice(0, 200).trimEnd() + "…"
    : productDescription;

  const lines = [
    `Hi! 👋 I'm interested in this product from Aurani:`,
    ``,
    `*${productTitle}*`,
    `Product Code: #${productCode}`,
    `Category: ${category}`,
    ``,
    shortDesc,
    ``,
    productUrl,
    ``,
    `Could you please share the price and availability? 🙏`,
  ];

  if (wantsBroadcast) {
    lines.push(``, `✅ Please add me to your broadcast list — I'd love to see new products!`);
  }

  return lines.join("\n");
}

function downloadVCard(phone: string, sellerName: string) {
  const e164 = `+${phone.replace(/\D/g, "")}`;
  const vcard = [`BEGIN:VCARD`, `VERSION:3.0`, `FN:${sellerName}`, `TEL;TYPE=CELL:${e164}`, `END:VCARD`].join("\r\n");
  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sellerName.replace(/\s+/g, "_")}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

import { useState } from "react";

export function WhatsAppInquiryForm({
  sellerPhone,
  productTitle,
  productCategory,
  productDescription,
  productUrl,
  productCode,
}: WhatsAppInquiryFormProps) {
  const [wantsBroadcast, setWantsBroadcast] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);

  function handleConnect() {
    const digits = sellerPhone.replace(/\D/g, "");
    const encoded = encodeURIComponent(
      buildMessage(productTitle, productCategory, productDescription, productUrl, productCode, wantsBroadcast),
    );
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `whatsapp://send?phone=${digits}&text=${encoded}`;
    } else {
      window.open(`https://wa.me/${digits}?text=${encoded}`, "_blank", "noopener,noreferrer");
    }
  }

  function handleSaveContact() {
    downloadVCard(sellerPhone, "Aurani");
    setContactSaved(true);
  }

  return (
    <div className="rounded-xl border border-[#25D366]/30 bg-[#25D366]/5 p-5 flex flex-col gap-4">
      <div>
        <p className="font-serif text-xl text-foreground">Get your personalized price</p>
        <p className="mt-1 font-sans text-sm text-muted-foreground">
          Connect with the seller directly on WhatsApp — get the best price and availability instantly.
        </p>
      </div>

      {/* Consent */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={wantsBroadcast}
          onChange={(e) => setWantsBroadcast(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#25D366]"
        />
        <span className="font-sans text-sm text-foreground leading-snug">
          Add me to the community for new product updates.{" "}
          <span className="text-muted-foreground">I can leave anytime by messaging <em>STOP</em>.</span>
        </span>
      </label>

      {/* Save contact */}
      <button
        type="button"
        onClick={handleSaveContact}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#25D366] px-5 py-3 font-sans text-sm font-medium text-[#25D366] transition-colors hover:bg-[#25D366]/10"
      >
        {contactSaved ? (
          <>✅ Saved — open your contacts app to confirm</>
        ) : (
          <><SaveIcon className="h-4 w-4 shrink-0" /> Save our contact to your phone</>
        )}
      </button>

      {/* Main CTA */}
      <button
        type="button"
        onClick={handleConnect}
        className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 font-sans text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-sm"
        style={{ backgroundColor: "#25D366" }}
      >
        <WhatsAppIcon className="h-5 w-5 shrink-0" />
        Get my personalized price
      </button>

      <p className="font-sans text-xs text-center text-muted-foreground">
        Your WhatsApp number will be visible to the seller when you send the message.
      </p>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.847L.057 23.882a.5.5 0 0 0 .612.611l6.079-1.457A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.897 0-3.67-.52-5.188-1.424l-.372-.22-3.862.927.949-3.777-.244-.389A10 10 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}
