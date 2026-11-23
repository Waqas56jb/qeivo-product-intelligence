"use client";

import { create } from "zustand";
import type { ApiKey } from "@/types";
import { apiKeys } from "@/data/api/keys";
import { DEMO_NOW } from "@/lib/utils";
import { maskedKey } from "./dev-data";

/** Session-only API key state shared by the developer overview and keys pages. */
interface ApiKeyState {
  keys: ApiKey[];
  seq: number;
  create: (input: { name: string; scopes: string[]; environment: ApiKey["environment"]; monthlyLimit: number }) => { key: ApiKey; masked: string };
  rotate: (id: string) => string;
  revoke: (id: string) => void;
}

const stamp = (seq: number) => new Date(DEMO_NOW.getTime() + seq * 60_000).toISOString();

export const useApiKeyStore = create<ApiKeyState>()((set, get) => ({
  keys: apiKeys,
  seq: 1,
  create: (input) => {
    const seq = get().seq;
    const m = maskedKey(input.environment, `${input.name}-${seq}`);
    const key: ApiKey = { id: `key-local-${seq}`, name: input.name, prefix: m.prefix, scopes: input.scopes, createdAt: stamp(seq), lastUsed: null, environment: input.environment, monthlyLimit: input.monthlyLimit, used: 0, status: "active" };
    set((s) => ({ keys: [key, ...s.keys], seq: s.seq + 1 }));
    return { key, masked: m.full };
  },
  rotate: (id) => {
    const seq = get().seq;
    const k = get().keys.find((x) => x.id === id);
    const m = maskedKey(k?.environment ?? "test", `${id}-rotated-${seq}`);
    set((s) => ({ seq: s.seq + 1, keys: s.keys.map((x) => (x.id === id ? { ...x, prefix: m.prefix, createdAt: stamp(seq) } : x)) }));
    return m.full;
  },
  revoke: (id) => set((s) => ({ keys: s.keys.map((x) => (x.id === id ? { ...x, status: "revoked" } : x)) })),
}));
