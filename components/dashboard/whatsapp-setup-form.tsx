"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

interface Group {
  id: string;
  groupId: string;
  groupName: string;
  isSelected: boolean;
}

interface WhatsAppSetupFormProps {
  resellerId: string;
  defaultPhoneNumberId: string;
  defaultCatalogId: string;
  groups: Group[];
}

export function WhatsAppSetupForm({
  resellerId,
  defaultPhoneNumberId,
  defaultCatalogId,
  groups: initialGroups,
}: WhatsAppSetupFormProps) {
  const [phoneNumberId, setPhoneNumberId] = useState(defaultPhoneNumberId);
  const [accessToken, setAccessToken] = useState("");
  const [catalogId, setCatalogId] = useState(defaultCatalogId);
  const [groups, setGroups] = useState(initialGroups);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function toggleGroup(groupId: string) {
    setGroups((prev) =>
      prev.map((g) => (g.groupId === groupId ? { ...g, isSelected: !g.isSelected } : g)),
    );
  }

  async function handleSave() {
    setError(null);
    setSuccess(false);
    if (!phoneNumberId.trim()) {
      setError("Phone Number ID is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/reseller/${resellerId}/whatsapp`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumberId: phoneNumberId.trim(),
          accessToken: accessToken.trim() || undefined,
          catalogId: catalogId.trim() || undefined,
          selectedGroupIds: groups.filter((g) => g.isSelected).map((g) => g.groupId),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setSuccess(true);
      setAccessToken(""); // clear sensitive field
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-success/10 px-4 py-3 font-sans text-sm text-success">
          WhatsApp settings saved successfully.
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
        <h3 className="font-serif text-lg text-foreground">Meta Business Credentials</h3>
        <p className="font-sans text-xs text-muted-foreground">
          Generate a System User Access Token in Meta Business Suite and paste it below.
          It is stored encrypted and never shown again.
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium text-foreground">
            Phone Number ID *
          </label>
          <Input
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
            placeholder="1234567890123456"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium text-foreground">
            Access Token {defaultPhoneNumberId ? "(leave blank to keep existing)" : "*"}
          </label>
          <Input
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="EAA..."
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium text-foreground">
            Catalog ID (optional — for product catalog sync)
          </label>
          <Input
            value={catalogId}
            onChange={(e) => setCatalogId(e.target.value)}
            placeholder="9876543210987654"
          />
        </div>
      </div>

      {groups.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
          <h3 className="font-serif text-lg text-foreground">Broadcast Groups</h3>
          <p className="font-sans text-xs text-muted-foreground">
            Select which groups receive product broadcasts when you publish.
          </p>
          <div className="flex flex-col gap-2">
            {groups.map((g) => (
              <label
                key={g.groupId}
                className="flex items-center gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={g.isSelected}
                  onChange={() => toggleGroup(g.groupId)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <span className="font-sans text-sm text-foreground">{g.groupName}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="self-start inline-flex items-center rounded-md bg-primary px-5 py-2.5 font-sans text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
}
