"use client";

import { Button } from "@heroui/react";
import { XIcon } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useNotificationPermission } from "../lib/use-notification-permission";

const DISMISS_KEY = "notifications-banner-dismissed";

type Dismissed = boolean | null;

const dismissedListeners = new Set<() => void>();

function subscribeDismissed(onStoreChange: () => void) {
  dismissedListeners.add(onStoreChange);
  return () => {
    dismissedListeners.delete(onStoreChange);
  };
}

function getDismissedSnapshot(): Dismissed {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(DISMISS_KEY) === "true";
}

function getDismissedServerSnapshot(): Dismissed {
  return null;
}

function setDismissed(dismissed: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DISMISS_KEY, String(dismissed));
  dismissedListeners.forEach((listener) => listener());
}

export default function NotificationsPermission() {
  const { permission, requestPermission } = useNotificationPermission();
  const dismissed = useSyncExternalStore(
    subscribeDismissed,
    getDismissedSnapshot,
    getDismissedServerSnapshot,
  );

  if (permission !== "default") return null;
  if (dismissed) return null;

  return (
    <div className="w-full bg-yellow-500 text-black p-2 text-center flex flex-row justify-center items-center gap-4">
      <p>
        <b>Enable notifications </b> to get notified when new tickets arrive.
        (Keep your program&apos;s tab open to receive notifications for
        tickets!){" "}
      </p>
      <Button onClick={requestPermission} size="sm">
        Enable now
      </Button>
      <Button onClick={() => setDismissed(true)} size="sm" isIconOnly>
        <XIcon width={8} />
      </Button>
    </div>
  );
}
