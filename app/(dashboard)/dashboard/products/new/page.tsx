import { ProductForm } from "@/components/product/product-form";

export const metadata = { title: "Add Product — Aurani Dashboard" };

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl text-foreground">Add Product</h2>
        <p className="mt-1 font-sans text-sm text-muted-foreground">
          Save as draft, or publish directly to WhatsApp.
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
