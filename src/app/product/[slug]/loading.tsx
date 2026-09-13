import { Skeleton } from "@/components/ui/display";

/**
 * Shown while a product that was not prerendered renders on first request.
 * Kept route-level (not in app/) because most routes are static and a generic
 * root fallback would flash a mismatched layout on fast navigations.
 */
export default function Loading() {
  return (
    <div className="container-app pb-10 pt-4 md:pt-6" aria-busy="true" aria-label="Loading product">
      <Skeleton className="h-4 w-64" />
      <div className="mt-4 grid gap-6 lg:grid-cols-12 lg:gap-8">
        <Skeleton className="aspect-square rounded-2xl lg:col-span-5 xl:col-span-4" />
        <div className="space-y-3 lg:col-span-7 xl:col-span-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="mt-4 h-72 rounded-2xl" />
        </div>
        <div className="hidden space-y-4 xl:col-span-3 xl:block">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
