import { notFound } from "next/navigation";
import { requireResellerId } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/product/product-form";
import { PostStatus } from "@/components/dashboard/post-status";
import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id }, select: { title: true } });
  return { title: `${product?.title ?? "Product"} — Aurani Dashboard` };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resellerId = await requireResellerId();

  const product = await db.product.findUnique({
    where: { id },
    include: {
      media: { orderBy: { order: "asc" } },
      postJobs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!product || product.resellerId !== resellerId) notFound();

  const existingMedia = product.media.map((m: typeof product.media[number]) => ({
    id: m.id,
    cloudinaryUrl: m.cloudinaryUrl,
    cloudinaryPublicId: m.cloudinaryPublicId,
    mediaType: m.mediaType as "IMAGE" | "VIDEO",
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl text-foreground">{product.title}</h2>
        <p className="mt-1 font-sans text-sm text-muted-foreground capitalize">
          {product.status.toLowerCase()} · created {new Date(product.createdAt).toLocaleDateString("en-IN")}
        </p>
      </div>

      {product.postJobs.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 font-sans text-sm font-medium text-foreground">Post Status</h3>
          <div className="flex flex-col gap-2">
            {product.postJobs.map((job: typeof product.postJobs[number]) => {
              const platform = job.platform.startsWith("WHATSAPP_GROUP")
                ? "WHATSAPP_GROUP"
                : "WHATSAPP_CATALOG";
              return (
                <PostStatus
                  key={job.id}
                  platform={platform as "WHATSAPP_CATALOG" | "WHATSAPP_GROUP"}
                  status={job.status as "PENDING" | "SUCCESS" | "FAILED"}
                  errorMessage={job.errorMessage ?? undefined}
                />
              );
            })}
          </div>
        </div>
      )}

      <ProductForm
        productId={id}
        defaultValues={{
          title: product.title,
          description: product.description,
          category: product.category,
          priceMin: product.priceMin.toString(),
          priceMax: product.priceMax.toString(),
          status: product.status,
        }}
        existingMedia={existingMedia}
      />
    </div>
  );
}
