"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

interface CommissionFormProps {
  resellerId: string;
  currentCommission: number; // decimal 0–0.5
  isActive: boolean;
}

export function CommissionForm({ resellerId, currentCommission, isActive }: CommissionFormProps) {
  const [commission, setCommission] = useState(
    (currentCommission * 100).toFixed(0),
  );
  const [active, setActive] = useState(isActive);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setError(null);
    setSuccess(false);
    const pct = Number(commission);
    if (isNaN(pct) || pct < 0 || pct > 50) {
      setError("Commission must be 0–50%");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/resellers/${resellerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionRate: pct / 100, isActive: active }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4 max-w-md">
      <h3 className="font-serif text-lg text-foreground">Account Settings</h3>

      {error && (
        <p className="font-sans text-xs text-destructive">{error}</p>
      )}
      {success && (
        <p className="font-sans text-xs text-success">Settings saved.</p>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-foreground">
          Commission Rate (%)
        </label>
        <Input
          type="number"
          min={0}
          max={50}
          value={commission}
          onChange={(e) => setCommission(e.target.value)}
          placeholder="10"
        />
        <p className="font-sans text-xs text-muted-foreground">
          Aurani earns this percentage on each sale. 0–50%.
        </p>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        <span className="font-sans text-sm text-foreground">Account active</span>
      </label>

      <button
        onClick={handleSave}
        disabled={saving}
        className="self-start inline-flex items-center rounded-md bg-primary px-4 py-2 font-sans text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
}
