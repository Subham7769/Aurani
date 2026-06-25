"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string;
  title: string;
}

interface CreateOrderButtonProps {
  products: Product[];
}

export function CreateOrderButton({ products }: CreateOrderButtonProps) {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ paymentLinkUrl: string } | null>(null);

  async function handleCreate() {
    setError(null);
    if (!productId || !customerPhone || !amount) {
      setError("Product, customer phone, and amount are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/payments/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, customerPhone, customerName, amount: Number(amount) }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setProductId("");
    setCustomerPhone("");
    setCustomerName("");
    setAmount("");
    setError(null);
    setResult(null);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-sans text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" />
        Create Order
      </button>

      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Create Payment Link</DialogTitle>
          </DialogHeader>

          {result ? (
            <div className="flex flex-col gap-4 py-2">
              <p className="font-sans text-sm text-success">Payment link created!</p>
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted p-3">
                <span className="flex-1 truncate font-sans text-xs text-foreground">
                  {result.paymentLinkUrl}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(result.paymentLinkUrl)}
                  className="shrink-0 font-sans text-xs text-primary underline"
                >
                  Copy
                </button>
              </div>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Pay here: ${result.paymentLinkUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center rounded-md px-4 py-2 font-sans text-sm font-medium text-white"
                style={{ backgroundColor: "#25D366" }}
              >
                Share via WhatsApp
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-2">
              {error && (
                <p className="font-sans text-xs text-destructive">{error}</p>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-sm font-medium">Product *</label>
                <Select value={productId} onValueChange={(v) => setProductId(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-sm font-medium">Customer Phone *</label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-sm font-medium">Customer Name</label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Priya Sharma"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-sm font-medium">Amount (₹) *</label>
                <Input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1299"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              onClick={handleClose}
              className="rounded-md border border-border px-4 py-2 font-sans text-sm text-foreground hover:bg-muted"
            >
              {result ? "Done" : "Cancel"}
            </button>
            {!result && (
              <button
                onClick={handleCreate}
                disabled={loading}
                className="rounded-md bg-primary px-4 py-2 font-sans text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Creating…" : "Generate Link"}
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
