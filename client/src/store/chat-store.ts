"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ChatMessage, Conversation } from "@/types";
import type { AskIntent } from "@/lib/ask-engine";

/** Chat message with Ask Qeivo extras. */
export interface AskMessage extends ChatMessage {
  intent?: AskIntent;
  intentLabel?: string;
  gaps?: string[];
  /** Assistant message that failed (simulated network error). */
  error?: boolean;
  /** For error messages: the question to retry. */
  retryOf?: string;
}

export interface AskConversation extends Omit<Conversation, "messages"> {
  messages: AskMessage[];
  /** Seed conversations are read from data; user ones live only in this store. */
  origin: "seed" | "user";
}

interface ChatState {
  /** User-created conversations and continued seed conversations (same id overrides the seed). */
  conversations: AskConversation[];
  /** Saved flag overrides for seed conversations that haven't been continued. */
  savedOverrides: Record<string, boolean>;
  /** Seed conversation ids the user deleted from history. */
  hidden: string[];
  /** Barcode lookups made on the scan screen (newest first). */
  recentScans: { code: string; productId: string | null; at: string }[];

  upsert: (c: AskConversation) => void;
  setSaved: (id: string, saved: boolean) => void;
  remove: (id: string) => void;
  addScan: (code: string, productId: string | null, at: string) => void;
  clearScans: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      savedOverrides: {},
      hidden: [],
      recentScans: [],
      upsert: (c) => set({ conversations: [c, ...get().conversations.filter((x) => x.id !== c.id)] }),
      setSaved: (id, saved) => {
        const existing = get().conversations.find((x) => x.id === id);
        if (existing) set({ conversations: get().conversations.map((x) => (x.id === id ? { ...x, saved } : x)) });
        else set({ savedOverrides: { ...get().savedOverrides, [id]: saved } });
      },
      remove: (id) => set({ conversations: get().conversations.filter((x) => x.id !== id), hidden: get().hidden.includes(id) ? get().hidden : [...get().hidden, id] }),
      addScan: (code, productId, at) => set({ recentScans: [{ code, productId, at }, ...get().recentScans.filter((s) => s.code !== code)].slice(0, 8) }),
      clearScans: () => set({ recentScans: [] }),
    }),
    {
      name: "qeivo-chat",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ conversations: s.conversations, savedOverrides: s.savedOverrides, hidden: s.hidden, recentScans: s.recentScans }),
    },
  ),
);

const subscribe = (cb: () => void) => useChatStore.persist.onFinishHydration(cb);

/** True once the chat store has been restored from localStorage. */
export function useChatHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => useChatStore.persist.hasHydrated(),
    () => false,
  );
}

let started = false;
/** Call from a client effect; safe to call repeatedly. */
export function rehydrateChatStore() {
  if (started) return;
  started = true;
  void useChatStore.persist.rehydrate();
}
