"use client";

import { useCallback, useSyncExternalStore } from "react";

export type NotificationPermissionState = NotificationPermission | "unsupported";

const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function getSnapshot(): NotificationPermissionState {
  return "Notification" in window ? Notification.permission : "unsupported";
}

function getServerSnapshot(): NotificationPermissionState {
  return "unsupported";
}

export function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return Promise.resolve("unsupported" as NotificationPermissionState);
  }
  return Notification.requestPermission().then((result) => {
    listeners.forEach((listener) => listener());
    if (result === "granted") {
      new Notification("You've enabled notifications!");
    }
    return result as NotificationPermissionState;
  });
}

export function useNotificationPermission() {
  const permission = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const requestPermission = useCallback(() => {
    return requestNotificationPermission();
  }, []);

  return { permission, requestPermission };
}
