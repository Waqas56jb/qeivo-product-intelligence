"use client";

import { useSyncExternalStore } from "react";
import { useAppStore } from "@/store/app-store";

const subscribe = (cb: () => void) => useAppStore.persist.onFinishHydration(cb);

/** True once persisted demo state has been restored from localStorage. */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => useAppStore.persist.hasHydrated(),
    () => false,
  );
}
