"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, AlertCircle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILES = 10;
const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"];

interface PreviewFile {
  file: File;
  previewUrl: string;
  type: "image" | "video";
}

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  className?: string;
  disabled?: boolean;
}

export function UploadZone({ onFilesSelected, className, disabled }: UploadZoneProps) {
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateAndAdd(incoming: File[]) {
    setError(null);

    const oversized = incoming.filter(
      (f) => f.size > MAX_FILE_SIZE_MB * 1024 * 1024,
    );
    if (oversized.length > 0) {
      setError(`File too large — max ${MAX_FILE_SIZE_MB}MB per file.`);
      return;
    }

    const unsupported = incoming.filter((f) => !ACCEPTED_MIME.includes(f.type));
    if (unsupported.length > 0) {
      setError("Unsupported file type. Upload images (JPG/PNG/WebP) or videos (MP4/MOV).");
      return;
    }

    const combined = [...previews.map((p) => p.file), ...incoming];
    if (combined.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }

    const newPreviews: PreviewFile[] = incoming.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));

    const updated = [...previews, ...newPreviews];
    setPreviews(updated);
    onFilesSelected(updated.map((p) => p.file));
  }

  const remove = useCallback(
    (index: number) => {
      const updated = previews.filter((_, i) => i !== index);
      URL.revokeObjectURL(previews[index].previewUrl);
      setPreviews(updated);
      onFilesSelected(updated.map((p) => p.file));
    },
    [previews, onFilesSelected],
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files);
    validateAndAdd(files);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    validateAndAdd(files);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div className="text-center">
          <p className="font-sans text-sm font-medium text-foreground">
            Drop files here, or click to browse
          </p>
          <p className="mt-1 font-sans text-xs text-muted-foreground">
            Images (JPG, PNG, WebP) or videos (MP4, MOV) · Max {MAX_FILE_SIZE_MB}MB · Up to {MAX_FILES} files
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_MIME.join(",")}
          multiple
          className="sr-only"
          onChange={handleChange}
          disabled={disabled}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="font-sans text-xs">{error}</p>
        </div>
      )}

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-6">
          {previews.map((p, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded border border-border bg-muted">
              {p.type === "video" ? (
                <div className="flex h-full items-center justify-center text-muted-foreground font-sans text-xs">
                  ▶ Video
                </div>
              ) : (
                <Image
                  src={p.previewUrl}
                  alt={`Preview ${i + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              )}
              <button
                onClick={() => remove(i)}
                aria-label={`Remove file ${i + 1}`}
                className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
