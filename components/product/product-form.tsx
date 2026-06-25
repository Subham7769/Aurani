"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadZone } from "@/components/dashboard/upload-zone";

export interface MediaItem {
  id?: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  mediaType: "IMAGE" | "VIDEO";
}

interface ProductFormProps {
  productId?: string;
  defaultValues?: {
    title?: string;
    description?: string;
    category?: string;
    priceMin?: string;
    priceMax?: string;
    status?: string;
  };
  existingMedia?: MediaItem[];
}

const CATEGORIES = [
  { value: "CLOTHING", label: "Clothing" },
  { value: "JEWELLERY", label: "Jewellery" },
  { value: "HOME_ESSENTIALS", label: "Home Essentials" },
] as const;

export function ProductForm({ productId, defaultValues = {}, existingMedia = [] }: ProductFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(defaultValues.title ?? "");
  const [description, setDescription] = useState(defaultValues.description ?? "");
  const [category, setCategory] = useState(defaultValues.category ?? "");
  const [priceMin, setPriceMin] = useState(defaultValues.priceMin ?? "");
  const [priceMax, setPriceMax] = useState(defaultValues.priceMax ?? "");
  const [currentMedia, setCurrentMedia] = useState<MediaItem[]>(existingMedia);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);

  async function uploadFiles(files: File[]): Promise<MediaItem[]> {
    const results: MediaItem[] = [];
    for (const file of files) {
      const type = file.type.startsWith("video/") ? "video" : "image";
      const sigRes = await fetch(`/api/upload?type=${type}`);
      if (!sigRes.ok) throw new Error("Failed to get upload signature");
      const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json();

      const form = new FormData();
      form.append("file", file);
      form.append("signature", signature);
      form.append("timestamp", String(timestamp));
      form.append("api_key", apiKey);
      form.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`,
        { method: "POST", body: form },
      );
      if (!uploadRes.ok) throw new Error("Upload failed");
      const data = await uploadRes.json();
      results.push({
        cloudinaryUrl: data.secure_url,
        cloudinaryPublicId: data.public_id,
        mediaType: type === "video" ? "VIDEO" : "IMAGE",
      });
    }
    return results;
  }

  async function handleDeleteMedia(mediaId: string) {
    if (!productId) return;
    setDeletingMediaId(mediaId);
    try {
      const res = await fetch(`/api/products/${productId}/media/${mediaId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setCurrentMedia((prev) => prev.filter((m) => m.id !== mediaId));
    } catch {
      setError("Failed to delete image. Try again.");
    } finally {
      setDeletingMediaId(null);
    }
  }

  async function handleSave(publish = false) {
    setError(null);
    if (!title.trim()) { setError("Title is required"); return; }
    if (!category) { setError("Category is required"); return; }
    if (!priceMin || !priceMax) { setError("Price range is required"); return; }
    if (Number(priceMin) > Number(priceMax)) { setError("Min price cannot exceed max price"); return; }

    publish ? setPublishing(true) : setSaving(true);
    try {
      let newMedia: MediaItem[] = [];
      if (pendingFiles.length > 0) {
        newMedia = await uploadFiles(pendingFiles);
      }

      let savedId = productId;
      if (productId) {
        const res = await fetch(`/api/products/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            category,
            priceMin: Number(priceMin),
            priceMax: Number(priceMax),
            newMedia,
          }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            category,
            priceMin: Number(priceMin),
            priceMax: Number(priceMax),
            media: newMedia,
          }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Create failed");
        const created = await res.json();
        savedId = created.id;
      }

      if (publish && savedId) {
        const pubRes = await fetch(`/api/products/${savedId}/publish`, { method: "POST" });
        if (!pubRes.ok) throw new Error((await pubRes.json()).error ?? "Publish failed");
      }

      router.push("/dashboard/products");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  }

  async function handleDeleteProduct() {
    if (!productId) return;
    if (!confirm("Delete this product permanently? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Delete failed");
      router.push("/dashboard/products");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setDeleting(false);
    }
  }

  async function handleToggleStatus() {
    if (!productId) return;
    const newStatus = defaultValues.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Status update failed");
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-foreground">Title *</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Handwoven cotton saree" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-foreground">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the product — fabric, occasion, care instructions..."
          rows={4}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-foreground">Category *</label>
        <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium text-foreground">Min Price (₹) *</label>
          <Input type="number" min={0} value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="999" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium text-foreground">Max Price (₹) *</label>
          <Input type="number" min={0} value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="1499" />
        </div>
      </div>

      {/* Existing media */}
      {currentMedia.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="font-sans text-sm font-medium text-foreground">Uploaded Media</label>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-6">
            {currentMedia.map((m) => (
              <div key={m.id ?? m.cloudinaryPublicId} className="group relative aspect-square overflow-hidden rounded border border-border bg-muted">
                {m.mediaType === "VIDEO" ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground font-sans text-xs">▶ Video</div>
                ) : (
                  <Image src={m.cloudinaryUrl} alt="Product media" fill sizes="96px" className="object-cover" />
                )}
                {m.id && (
                  <button
                    onClick={() => handleDeleteMedia(m.id!)}
                    disabled={deletingMediaId === m.id}
                    aria-label="Remove image"
                    className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100 disabled:opacity-50"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New media upload */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-foreground">
          {currentMedia.length > 0 ? "Add More Media" : "Media (up to 10 images or videos)"}
        </label>
        <UploadZone onFilesSelected={setPendingFiles} />
      </div>

      {/* Save actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={() => handleSave(false)}
          disabled={saving || publishing || deleting}
          className="inline-flex items-center rounded-md border border-border px-5 py-2.5 font-sans text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Draft"}
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving || publishing || deleting}
          className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 font-sans text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {publishing ? "Publishing…" : "Save & Publish"}
        </button>

        {/* Status toggle — only on edit page */}
        {productId && (
          <button
            onClick={handleToggleStatus}
            disabled={saving || publishing || deleting}
            className="inline-flex items-center rounded-md border border-border px-5 py-2.5 font-sans text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            {defaultValues.status === "ACTIVE" ? "Deactivate" : "Activate"}
          </button>
        )}

        {/* Delete product — only on edit page */}
        {productId && (
          <button
            onClick={handleDeleteProduct}
            disabled={saving || publishing || deleting}
            className="ml-auto inline-flex items-center gap-2 rounded-md border border-destructive/40 px-5 py-2.5 font-sans text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting…" : "Delete Product"}
          </button>
        )}
      </div>
    </div>
  );
}
