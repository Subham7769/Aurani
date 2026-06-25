"use client";

import { useState } from "react";
import { Truck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Order { id: string; title: string; }

export function CreateShipmentButton({ orders }: { orders: Order[] }) {
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [weight, setWeight] = useState("0.5");
  const [length, setLength] = useState("10");
  const [breadth, setBreadth] = useState("10");
  const [height, setHeight] = useState("5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleCreate() {
    setError(null);
    if (!orderId || !address || !city || !state || !pincode) {
      setError("All address fields are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, customerAddress: address, customerCity: city, customerState: state, customerPincode: pincode, weight: Number(weight), length: Number(length), breadth: Number(breadth), height: Number(height) }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setOrderId(""); setAddress(""); setCity(""); setState(""); setPincode("");
    setWeight("0.5"); setLength("10"); setBreadth("10"); setHeight("5");
    setError(null); setDone(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-sans text-sm font-medium text-primary-foreground hover:bg-primary/90">
        <Truck className="h-4 w-4" /> Create Shipment
      </button>
      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif text-xl">Create Shipment</DialogTitle></DialogHeader>
          {done ? (
            <p className="py-4 font-sans text-sm text-success">Shipment created! Refresh to see it in the list.</p>
          ) : (
            <div className="flex flex-col gap-3 py-2">
              {error && <p className="font-sans text-xs text-destructive">{error}</p>}
              <div className="flex flex-col gap-1"><label className="font-sans text-sm font-medium">Order *</label>
                <Select value={orderId} onValueChange={(v) => setOrderId(v ?? "")}>
                  <SelectTrigger><SelectValue placeholder="Select order" /></SelectTrigger>
                  <SelectContent>{orders.map((o) => <SelectItem key={o.id} value={o.id}>{o.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Delivery address *" />
              <div className="grid grid-cols-3 gap-2">
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City *" />
                <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="State *" />
                <Input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Pincode *" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[["Weight (kg)", weight, setWeight], ["L (cm)", length, setLength], ["B (cm)", breadth, setBreadth], ["H (cm)", height, setHeight]].map(([label, val, setter]) => (
                  <div key={String(label)} className="flex flex-col gap-1">
                    <label className="font-sans text-xs text-muted-foreground">{String(label)}</label>
                    <Input type="number" min={0.1} step={0.1} value={String(val)} onChange={(e) => (setter as (v: string) => void)(e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <button onClick={handleClose} className="rounded-md border border-border px-4 py-2 font-sans text-sm text-foreground hover:bg-muted">{done ? "Done" : "Cancel"}</button>
            {!done && <button onClick={handleCreate} disabled={loading} className="rounded-md bg-primary px-4 py-2 font-sans text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{loading ? "Creating…" : "Book Shipment"}</button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
