"use client";

import { createContext, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Lets content inside a route modal dismiss it the same way the X/Esc/overlay
 * do — `router.back()`, which restores the already-rendered underlying page
 * instantly (no server round-trip, unlike pushing a new URL). `null` outside a
 * modal (e.g. the full-page route), so consumers fall back to navigating.
 */
export const RouteModalContext = createContext<{ dismiss: () => void } | null>(
  null,
);

/**
 * Dialog wrapper for intercepting-route modals. Mounting it means the modal is
 * open; dismissing (X / overlay / Esc) calls `router.back()`, which unwinds the
 * intercepted URL and restores the underlying page. Radix supplies focus trap,
 * `aria-modal`, and scroll lock.
 */
export function RouteModal({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Next keeps the inactive @modal slot mounted (hidden) between navigations, so
  // the children's form state (typed inputs, Radix selects, controlled dates)
  // would survive a close and reappear on reopen. Bumping this key on every
  // dismiss remounts the subtree from scratch, guaranteeing a clean form next
  // time — covers all dismiss paths (Cancel, Esc, overlay, X) in one place.
  const [instance, setInstance] = useState(0);
  const dismiss = () => {
    // flushSync so the remount commits *while the node is still visible* — then
    // router.back() hides the now-clean form. Without it the state update is
    // batched and lost when Next freezes/hides the preserved slot, so reopening
    // restores the old DOM with the previous values.
    flushSync(() => setInstance((n) => n + 1));
    router.back();
  };

  // Controlled `open` (always true) rather than `defaultOpen`. Next keeps the
  // inactive @modal slot in the DOM (hidden) instead of unmounting it between
  // navigations, so with `defaultOpen` Radix's internal state — already flipped
  // to "closed" on the first dismiss — sticks, and re-showing the preserved node
  // leaves it closed: the modal silently won't re-open. Forcing `open` makes the
  // node always-open while present; the router hides it on close (navigate away,
  // via router.back) and reveals it again on the next interception.
  return (
    <RouteModalContext.Provider value={{ dismiss }}>
      <Dialog open onOpenChange={(open) => !open && dismiss()}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          <div key={instance}>{children}</div>
        </DialogContent>
      </Dialog>
    </RouteModalContext.Provider>
  );
}
