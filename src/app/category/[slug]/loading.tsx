import { ProductCardSkeleton } from "@/components/product/product-card";

export default function Loading() {
  return (
    <div className="container-app py-8" aria-busy="true" aria-label="Loading products">
      <div className="skeleton mb-3 h-4 w-48" />
      <div className="skeleton mb-6 h-36 rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-[15.5rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)]">
        <div className="skeleton hidden h-[32rem] rounded-2xl lg:block" />
        <div className="product-grid">
          {Array.from({ length: 12 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
