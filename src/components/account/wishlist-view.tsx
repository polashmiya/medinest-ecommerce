"use client";

import { routes } from "@/lib/routes";
import { useT } from "@/lib/use-t";
import { toast, useCartStore, useWishlistStore } from "@/stores";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/display";
import { Icon } from "@/components/ui/icon";
import { ProductCard } from "@/components/product/product-card";
import { AccountHeading } from "./account-shell";

export function WishlistView() {
  const t = useT();
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);
  const clear = useWishlistStore((s) => s.clear);
  const add = useCartStore((s) => s.add);

  const addAll = () => {
    const added = items.filter((p) => add(p, 1).ok).length;
    toast({ tone: added ? "success" : "error", title: added ? `${added} item${added > 1 ? "s" : ""} added to cart` : "Nothing could be added", action: added ? { label: "View cart", href: routes.cart() } : undefined });
  };

  return (
    <div>
      <AccountHeading
        title={t("account.wishlist")}
        subtitle={items.length ? `${items.length} saved ${items.length === 1 ? "item" : "items"}` : undefined}
        action={
          items.length ? (
            <div className="flex gap-2">
              <Button size="sm" onClick={addAll}>
                <Icon name="shopping-bag" className="size-4" /> Add all to cart
              </Button>
              <Button size="sm" variant="ghost" onClick={clear}>
                {t("common.clearAll")}
              </Button>
            </div>
          ) : null
        }
      />
      {items.length ? (
        <div className="product-grid">
          {items.map((p) => (
            <div key={p.id} className="flex flex-col gap-1.5">
              <ProductCard product={p} className="flex-1" />
              <button type="button" onClick={() => remove(p.id)} className="inline-flex items-center justify-center gap-1.5 rounded-lg py-1 text-xs font-semibold text-fg-subtle hover:bg-danger/8 hover:text-danger" aria-label={`Remove ${p.name} from wishlist`}>
                <Icon name="trash" className="size-3.5" /> {t("common.remove")}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <EmptyState icon="heart" title={t("account.noWishlist")} text="Tap the heart on any product to save it here for later." action={<ButtonLink href={routes.categories()}>Discover products</ButtonLink>} />
        </div>
      )}
    </div>
  );
}
