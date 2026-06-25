"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

interface Group {
  id: string;
  groupId: string;
  groupName: string;
  isSelected: boolean;
}

interface SettingsFormProps {
  resellerId: string;
  whatsapp: { phoneNumberId: string; catalogId: string; groups: Group[]; phone: string };
  telegram: { chatId: string };
  instagram: { accountId: string };
  facebook: { pageId: string };
  razorpay: { accountId: string };
  shiprocket: { email: string };
}

function SectionFeedback({ saved, error }: { saved: boolean; error: string | null }) {
  if (error) return (
    <div className="rounded-md bg-destructive/10 px-4 py-2.5 font-sans text-sm text-destructive">{error}</div>
  );
  if (saved) return (
    <div className="rounded-md bg-primary/10 px-4 py-2.5 font-sans text-sm text-primary">Saved successfully.</div>
  );
  return null;
}

function SaveButton({ saving, label = "Save", onClick }: { saving: boolean; label?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="self-start inline-flex items-center rounded-md bg-primary px-5 py-2 font-sans text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
    >
      {saving ? "Saving…" : label}
    </button>
  );
}

export function SettingsForm({
  resellerId,
  whatsapp,
  telegram,
  instagram,
  facebook,
  razorpay,
  shiprocket,
}: SettingsFormProps) {

  // ── WhatsApp ──────────────────────────────────────────────────────────────
  const [waPhone, setWaPhone] = useState(whatsapp.phone);
  const [waSaving, setWaSaving] = useState(false);
  const [waSaved, setWaSaved] = useState(false);
  const [waError, setWaError] = useState<string | null>(null);

  async function saveWhatsApp() {
    setWaError(null); setWaSaved(false);
    if (!waPhone.trim()) { setWaError("Your WhatsApp number is required."); return; }
    setWaSaving(true);
    try {
      const res = await fetch(`/api/reseller/${resellerId}/whatsapp`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumberId: "placeholder",
          whatsappPhone: waPhone.trim(),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setWaSaved(true);
    } catch (e) { setWaError(e instanceof Error ? e.message : "Save failed"); }
    finally { setWaSaving(false); }
  }

  // ── Telegram ──────────────────────────────────────────────────────────────
  const [tgBotToken, setTgBotToken] = useState("");
  const [tgChatId, setTgChatId] = useState(telegram.chatId);
  const [tgSaving, setTgSaving] = useState(false);
  const [tgSaved, setTgSaved] = useState(false);
  const [tgError, setTgError] = useState<string | null>(null);

  async function saveTelegram() {
    setTgError(null); setTgSaved(false);
    setTgSaving(true);
    try {
      const res = await fetch(`/api/reseller/${resellerId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramBotToken: tgBotToken || undefined, telegramChatId: tgChatId }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setTgSaved(true); setTgBotToken("");
    } catch (e) { setTgError(e instanceof Error ? e.message : "Save failed"); }
    finally { setTgSaving(false); }
  }

  // ── Instagram ─────────────────────────────────────────────────────────────
  const [igToken, setIgToken] = useState("");
  const [igAccountId, setIgAccountId] = useState(instagram.accountId);
  const [igSaving, setIgSaving] = useState(false);
  const [igSaved, setIgSaved] = useState(false);
  const [igError, setIgError] = useState<string | null>(null);

  async function saveInstagram() {
    setIgError(null); setIgSaved(false);
    setIgSaving(true);
    try {
      const res = await fetch(`/api/reseller/${resellerId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instagramAccessToken: igToken || undefined, instagramAccountId: igAccountId }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setIgSaved(true); setIgToken("");
    } catch (e) { setIgError(e instanceof Error ? e.message : "Save failed"); }
    finally { setIgSaving(false); }
  }

  // ── Facebook ──────────────────────────────────────────────────────────────
  const [fbToken, setFbToken] = useState("");
  const [fbPageId, setFbPageId] = useState(facebook.pageId);
  const [fbSaving, setFbSaving] = useState(false);
  const [fbSaved, setFbSaved] = useState(false);
  const [fbError, setFbError] = useState<string | null>(null);

  async function saveFacebook() {
    setFbError(null); setFbSaved(false);
    setFbSaving(true);
    try {
      const res = await fetch(`/api/reseller/${resellerId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facebookPageToken: fbToken || undefined, facebookPageId: fbPageId }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setFbSaved(true); setFbToken("");
    } catch (e) { setFbError(e instanceof Error ? e.message : "Save failed"); }
    finally { setFbSaving(false); }
  }

  // ── Razorpay ──────────────────────────────────────────────────────────────
  const [rzAccountId, setRzAccountId] = useState(razorpay.accountId);
  const [rzSaving, setRzSaving] = useState(false);
  const [rzSaved, setRzSaved] = useState(false);
  const [rzError, setRzError] = useState<string | null>(null);

  async function saveRazorpay() {
    setRzError(null); setRzSaved(false);
    setRzSaving(true);
    try {
      const res = await fetch(`/api/reseller/${resellerId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ razorpayAccountId: rzAccountId }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setRzSaved(true);
    } catch (e) { setRzError(e instanceof Error ? e.message : "Save failed"); }
    finally { setRzSaving(false); }
  }

  // ── Shiprocket ────────────────────────────────────────────────────────────
  const [srEmail, setSrEmail] = useState(shiprocket.email);
  const [srPassword, setSrPassword] = useState("");
  const [srSaving, setSrSaving] = useState(false);
  const [srSaved, setSrSaved] = useState(false);
  const [srError, setSrError] = useState<string | null>(null);

  async function saveShiprocket() {
    setSrError(null); setSrSaved(false);
    setSrSaving(true);
    try {
      const res = await fetch(`/api/reseller/${resellerId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shiprocketEmail: srEmail, shiprocketPassword: srPassword || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setSrSaved(true); setSrPassword("");
    } catch (e) { setSrError(e instanceof Error ? e.message : "Save failed"); }
    finally { setSrSaving(false); }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* WhatsApp */}
      <section className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">💬</span>
          <div>
            <h3 className="font-serif text-lg text-foreground">WhatsApp</h3>
            <p className="font-sans text-xs text-muted-foreground">Buyers will be connected to this number when they click "Connect with Seller" on any product.</p>
          </div>
        </div>
        <SectionFeedback saved={waSaved} error={waError} />
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium">Your WhatsApp Number *</label>
          <Input value={waPhone} onChange={(e) => setWaPhone(e.target.value)} placeholder="+91 98765 43210" />
          <p className="font-sans text-xs text-muted-foreground">Include country code. Works with personal WhatsApp or WhatsApp Business app.</p>
        </div>
        <SaveButton saving={waSaving} label="Save WhatsApp" onClick={saveWhatsApp} />
      </section>

      {/* Telegram */}
      <section className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">✈️</span>
          <div>
            <h3 className="font-serif text-lg text-foreground">Telegram</h3>
            <p className="font-sans text-xs text-muted-foreground">Post products to your Telegram channel or group via a bot.</p>
          </div>
        </div>
        <SectionFeedback saved={tgSaved} error={tgError} />
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-sm font-medium">Bot Token {tgChatId ? "(leave blank to keep existing)" : ""}</label>
            <Input type="password" value={tgBotToken} onChange={(e) => setTgBotToken(e.target.value)} placeholder="1234567890:ABCdef..." />
            <p className="font-sans text-xs text-muted-foreground">Create a bot via @BotFather on Telegram. Stored encrypted.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-sm font-medium">Channel / Chat ID</label>
            <Input value={tgChatId} onChange={(e) => setTgChatId(e.target.value)} placeholder="@yourchannel or -1001234567890" />
            <p className="font-sans text-xs text-muted-foreground">Use @username for public channels or numeric ID for groups.</p>
          </div>
        </div>
        <SaveButton saving={tgSaving} label="Save Telegram" onClick={saveTelegram} />
      </section>

      {/* Instagram */}
      <section className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">📸</span>
          <div>
            <h3 className="font-serif text-lg text-foreground">Instagram</h3>
            <p className="font-sans text-xs text-muted-foreground">Auto-post product images to your Instagram Business account.</p>
          </div>
        </div>
        <SectionFeedback saved={igSaved} error={igError} />
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-sm font-medium">Access Token {instagram.accountId ? "(leave blank to keep existing)" : ""}</label>
            <Input type="password" value={igToken} onChange={(e) => setIgToken(e.target.value)} placeholder="EAA..." />
            <p className="font-sans text-xs text-muted-foreground">Long-lived Page Access Token from Meta Graph API. Stored encrypted.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-sm font-medium">Instagram Account ID</label>
            <Input value={igAccountId} onChange={(e) => setIgAccountId(e.target.value)} placeholder="17841400000000000" />
            <p className="font-sans text-xs text-muted-foreground">Found in Meta Business Suite → Instagram Account settings.</p>
          </div>
        </div>
        <SaveButton saving={igSaving} label="Save Instagram" onClick={saveInstagram} />
      </section>

      {/* Facebook */}
      <section className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">📘</span>
          <div>
            <h3 className="font-serif text-lg text-foreground">Facebook</h3>
            <p className="font-sans text-xs text-muted-foreground">Post products directly to your Facebook Business Page.</p>
          </div>
        </div>
        <SectionFeedback saved={fbSaved} error={fbError} />
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-sm font-medium">Page Access Token {facebook.pageId ? "(leave blank to keep existing)" : ""}</label>
            <Input type="password" value={fbToken} onChange={(e) => setFbToken(e.target.value)} placeholder="EAA..." />
            <p className="font-sans text-xs text-muted-foreground">Page-level token from Meta Graph API Explorer. Stored encrypted.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-sm font-medium">Facebook Page ID</label>
            <Input value={fbPageId} onChange={(e) => setFbPageId(e.target.value)} placeholder="123456789012345" />
            <p className="font-sans text-xs text-muted-foreground">Found in Facebook Page → About → Page transparency.</p>
          </div>
        </div>
        <SaveButton saving={fbSaving} label="Save Facebook" onClick={saveFacebook} />
      </section>

      {/* Razorpay */}
      <section className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">💳</span>
          <div>
            <h3 className="font-serif text-lg text-foreground">Razorpay</h3>
            <p className="font-sans text-xs text-muted-foreground">Receive commission payouts via Razorpay Route.</p>
          </div>
        </div>
        <SectionFeedback saved={rzSaved} error={rzError} />
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium">Linked Account ID</label>
          <Input value={rzAccountId} onChange={(e) => setRzAccountId(e.target.value)} placeholder="acc_XXXXXXXXXXXXXXXXX" />
          <p className="font-sans text-xs text-muted-foreground">Razorpay Dashboard → Route → Linked Accounts.</p>
        </div>
        <SaveButton saving={rzSaving} label="Save Razorpay" onClick={saveRazorpay} />
      </section>

      {/* Shiprocket */}
      <section className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">🚚</span>
          <div>
            <h3 className="font-serif text-lg text-foreground">Shiprocket</h3>
            <p className="font-sans text-xs text-muted-foreground">Book and track shipments for paid orders.</p>
          </div>
        </div>
        <SectionFeedback saved={srSaved} error={srError} />
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-sm font-medium">Email</label>
            <Input type="email" value={srEmail} onChange={(e) => setSrEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-sm font-medium">Password</label>
            <Input type="password" value={srPassword} onChange={(e) => setSrPassword(e.target.value)} placeholder="Leave blank to keep existing" />
            <p className="font-sans text-xs text-muted-foreground">Stored encrypted. Used to auto-refresh your Shiprocket JWT.</p>
          </div>
        </div>
        <SaveButton saving={srSaving} label="Save Shiprocket" onClick={saveShiprocket} />
      </section>

    </div>
  );
}
