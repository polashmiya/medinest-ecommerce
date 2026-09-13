"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { siteConfig } from "@/config/site.config";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/use-t";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/display";
import { Icon } from "@/components/ui/icon";
import { AccountHeading } from "./account-shell";

const WELCOME_FLAG = "medinest.inbox-seeded.v1";

export function InboxView() {
  const t = useT();
  const items = useNotificationStore((s) => s.items);
  const push = useNotificationStore((s) => s.push);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const clear = useNotificationStore((s) => s.clear);
  const seeded = useRef(false);
  const unread = items.filter((n) => !n.read).length;

  // First visit with an empty inbox: add a one-time welcome message.
  useEffect(() => {
    if (seeded.current || items.length) return;
    seeded.current = true;
    try {
      if (localStorage.getItem(WELCOME_FLAG)) return;
      localStorage.setItem(WELCOME_FLAG, "1");
    } catch {
      return;
    }
    push({ title: `Welcome to ${siteConfig.name}`, body: "Order updates, prescription reviews and offers will appear here.", href: routes.account() });
  }, [items.length, push]);

  return (
    <div>
      <AccountHeading
        title={t("account.inbox")}
        subtitle={unread ? `${unread} unread` : "You're all caught up"}
        action={
          items.length ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={markAllRead} disabled={!unread}>
                <Icon name="check" className="size-4" /> Mark all read
              </Button>
              <Button size="sm" variant="ghost" onClick={clear}>
                {t("common.clearAll")}
              </Button>
            </div>
          ) : null
        }
      />
      {items.length ? (
        <ul className="card divide-y divide-line overflow-hidden">
          {items.map((n) => {
            const body = (
              <>
                <span className={cn("mt-1 size-2.5 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-primary")} aria-hidden />
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary-600 dark:text-primary-300">
                  <Icon name={/order/i.test(n.title) ? "package" : "bell"} className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm", n.read ? "font-medium text-fg-muted" : "font-bold text-fg")}>{n.title}</span>
                  <span className="block text-sm text-fg-muted">{n.body}</span>
                  <span className="mt-1 block text-xs text-fg-subtle">{formatDate(n.createdAt, true)}</span>
                </span>
                {n.href ? <Icon name="chevron-right" className="size-5 shrink-0 self-center text-fg-subtle" /> : null}
              </>
            );
            const cls = "flex w-full items-start gap-3 p-4 text-left transition hover:bg-muted/50";
            return (
              <li key={n.id}>
                {n.href ? (
                  <Link href={n.href} onClick={() => markRead(n.id)} className={cls}>
                    {body}
                  </Link>
                ) : (
                  <button type="button" onClick={() => markRead(n.id)} className={cls}>
                    {body}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="card">
          <EmptyState icon="inbox" title={t("account.noMessages")} />
        </div>
      )}
    </div>
  );
}
