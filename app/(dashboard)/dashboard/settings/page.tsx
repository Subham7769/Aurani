import { requireResellerId } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsForm } from "@/components/dashboard/settings-form";

export const metadata = { title: "Settings — Aurani Dashboard" };

export default async function SettingsPage() {
  const resellerId = await requireResellerId();

  const reseller = await db.reseller.findUnique({
    where: { id: resellerId },
    select: {
      whatsappPhoneNumberId: true,
      whatsappCatalogId: true,
      whatsappPhone: true,
      telegramChatId: true,
      instagramAccountId: true,
      facebookPageId: true,
      razorpayAccountId: true,
      shiprocketEmail: true,
      whatsAppGroups: { orderBy: { groupName: "asc" } },
    },
  });

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h2 className="font-serif text-2xl text-foreground">Settings</h2>
        <p className="mt-1 font-sans text-sm text-muted-foreground">
          Configure all your platform integrations in one place.
        </p>
      </div>

      <SettingsForm
        resellerId={resellerId}
        whatsapp={{
          phoneNumberId: reseller?.whatsappPhoneNumberId ?? "",
          catalogId: reseller?.whatsappCatalogId ?? "",
          phone: reseller?.whatsappPhone ?? "",
          groups: reseller?.whatsAppGroups ?? [],
        }}
        telegram={{
          chatId: reseller?.telegramChatId ?? "",
        }}
        instagram={{
          accountId: reseller?.instagramAccountId ?? "",
        }}
        facebook={{
          pageId: reseller?.facebookPageId ?? "",
        }}
        razorpay={{
          accountId: reseller?.razorpayAccountId ?? "",
        }}
        shiprocket={{
          email: reseller?.shiprocketEmail ?? "",
        }}
      />
    </div>
  );
}
