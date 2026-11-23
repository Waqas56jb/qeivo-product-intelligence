"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DemoRole, RegionCode, UserPreferences } from "@/types";
import type { Priorities, PriorityLevel } from "@/lib/scoring";
import type { ScoreFactorKey } from "@/types";

export const MAX_COMPARE = 4;
export const FREE_CHAT_LIMIT = 25;
export const PREMIUM_CHAT_LIMIT = 500;

export interface WatchItem {
  productId: string;
  targetPrice: number;
  createdAt: string;
}

export interface AppState {
  role: DemoRole;
  region: RegionCode;
  plan: "free" | "premium";
  saved: string[];
  compare: string[];
  recentlyViewed: string[];
  priorities: Priorities;
  watchlist: WatchItem[];
  alertPrefs: { email: boolean; push: boolean; threshold: number };
  helpful: Record<string, boolean>;
  reported: string[];
  votes: Record<string, 1 | -1>;
  checklists: Record<string, string[]>;
  readNotifications: string[];
  dismissedNotifications: string[];
  chatUsed: number;
  notes: Record<string, string>;
  savedVideos: string[];
  preferences: Partial<UserPreferences>;
  onboardingComplete: boolean;
  profile: { name: string; email: string; location: string; bio: string };

  setRole: (role: DemoRole) => void;
  setRegion: (region: RegionCode) => void;
  setPlan: (plan: "free" | "premium") => void;
  toggleSaved: (productId: string) => boolean;
  toggleCompare: (productId: string) => "added" | "removed" | "full";
  setCompare: (ids: string[]) => void;
  clearCompare: () => void;
  trackView: (productId: string) => void;
  setPriority: (key: ScoreFactorKey, level: PriorityLevel) => void;
  resetPriorities: () => void;
  addWatch: (productId: string, targetPrice: number) => void;
  removeWatch: (productId: string) => void;
  setAlertPrefs: (prefs: Partial<AppState["alertPrefs"]>) => void;
  toggleHelpful: (reviewId: string) => void;
  report: (id: string) => void;
  vote: (id: string, dir: 1 | -1) => void;
  toggleChecklist: (guideId: string, item: string) => void;
  resetChecklist: (guideId: string) => void;
  markRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
  dismissNotification: (id: string) => void;
  consumeChat: () => boolean;
  setNote: (productId: string, note: string) => void;
  toggleSavedVideo: (slug: string) => void;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  completeOnboarding: () => void;
  updateProfile: (p: Partial<AppState["profile"]>) => void;
  resetDemo: () => void;
}

const initial = {
  role: "customer" as DemoRole,
  region: "US" as RegionCode,
  plan: "premium" as const,
  saved: ["p-halden-precision-fd590", "p-nordvik-frostline-fd600", "p-ovea-eco-fd520", "p-brightwater-family-fd560", "p-maru-smartview-cd540", "p-halden-pureclean-w9"],
  compare: ["p-nordvik-frostline-fd600", "p-halden-precision-fd590", "p-ovea-eco-fd520"],
  recentlyViewed: ["p-nordvik-frostline-fd600", "p-halden-precision-fd590", "p-maru-smartview-fd620", "p-ovea-eco-bf370", "p-brightwater-family-fd560", "p-kestrel-everyday-fd580"],
  priorities: {} as Priorities,
  watchlist: [
    { productId: "p-halden-precision-fd590", targetPrice: 2899, createdAt: "2026-10-28" },
    { productId: "p-nordvik-frostline-fd600", targetPrice: 2299, createdAt: "2026-11-02" },
    { productId: "p-maru-smartview-fd620", targetPrice: 2499, createdAt: "2026-11-10" },
  ],
  alertPrefs: { email: true, push: true, threshold: 5 },
  helpful: {},
  reported: [],
  votes: {},
  checklists: {},
  readNotifications: [],
  dismissedNotifications: [],
  chatUsed: 37,
  notes: { "p-nordvik-frostline-fd600": "Check if the 730 mm depth works with the island gap — need at least 1,050 mm clear." },
  savedVideos: [],
  preferences: {},
  onboardingComplete: false,
  profile: { name: "Alex Morgan", email: "alex.morgan@example.com", location: "Portland, OR", bio: "Renovating a 1960s kitchen and researching appliances for a family of four." },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initial,
      setRole: (role) => set({ role }),
      setRegion: (region) => set({ region }),
      setPlan: (plan) => set({ plan }),
      toggleSaved: (id) => {
        const saved = get().saved;
        const isSaved = saved.includes(id);
        set({ saved: isSaved ? saved.filter((s) => s !== id) : [id, ...saved] });
        return !isSaved;
      },
      toggleCompare: (id) => {
        const compare = get().compare;
        if (compare.includes(id)) {
          set({ compare: compare.filter((c) => c !== id) });
          return "removed";
        }
        if (compare.length >= MAX_COMPARE) return "full";
        set({ compare: [...compare, id] });
        return "added";
      },
      setCompare: (ids) => set({ compare: ids.slice(0, MAX_COMPARE) }),
      clearCompare: () => set({ compare: [] }),
      trackView: (id) => set({ recentlyViewed: [id, ...get().recentlyViewed.filter((r) => r !== id)].slice(0, 12) }),
      setPriority: (key, level) => set({ priorities: { ...get().priorities, [key]: level } }),
      resetPriorities: () => set({ priorities: {} }),
      addWatch: (productId, targetPrice) =>
        set({ watchlist: [{ productId, targetPrice, createdAt: "2026-11-23" }, ...get().watchlist.filter((w) => w.productId !== productId)] }),
      removeWatch: (productId) => set({ watchlist: get().watchlist.filter((w) => w.productId !== productId) }),
      setAlertPrefs: (prefs) => set({ alertPrefs: { ...get().alertPrefs, ...prefs } }),
      toggleHelpful: (id) => set({ helpful: { ...get().helpful, [id]: !get().helpful[id] } }),
      report: (id) => set({ reported: get().reported.includes(id) ? get().reported : [...get().reported, id] }),
      vote: (id, dir) => {
        const votes = { ...get().votes };
        if (votes[id] === dir) delete votes[id];
        else votes[id] = dir;
        set({ votes });
      },
      toggleChecklist: (guideId, item) => {
        const list = get().checklists[guideId] ?? [];
        set({ checklists: { ...get().checklists, [guideId]: list.includes(item) ? list.filter((i) => i !== item) : [...list, item] } });
      },
      resetChecklist: (guideId) => set({ checklists: { ...get().checklists, [guideId]: [] } }),
      markRead: (id) => set({ readNotifications: get().readNotifications.includes(id) ? get().readNotifications : [...get().readNotifications, id] }),
      markAllRead: (ids) => set({ readNotifications: Array.from(new Set([...get().readNotifications, ...ids])) }),
      dismissNotification: (id) => set({ dismissedNotifications: [...get().dismissedNotifications, id] }),
      consumeChat: () => {
        const limit = get().plan === "premium" ? PREMIUM_CHAT_LIMIT : FREE_CHAT_LIMIT;
        if (get().chatUsed >= limit) return false;
        set({ chatUsed: get().chatUsed + 1 });
        return true;
      },
      setNote: (productId, note) => set({ notes: { ...get().notes, [productId]: note } }),
      toggleSavedVideo: (slug) => set({ savedVideos: get().savedVideos.includes(slug) ? get().savedVideos.filter((s) => s !== slug) : [...get().savedVideos, slug] }),
      setPreferences: (prefs) => set({ preferences: { ...get().preferences, ...prefs } }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      updateProfile: (p) => set({ profile: { ...get().profile, ...p } }),
      resetDemo: () => set({ ...initial }),
    }),
    {
      name: "qeivo-demo",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => {
        // persist data only, not actions
        const { setRole, setRegion, setPlan, toggleSaved, toggleCompare, setCompare, clearCompare, trackView, setPriority, resetPriorities, addWatch, removeWatch, setAlertPrefs, toggleHelpful, report, vote, toggleChecklist, resetChecklist, markRead, markAllRead, dismissNotification, consumeChat, setNote, toggleSavedVideo, setPreferences, completeOnboarding, updateProfile, resetDemo, ...data } = s;
        void [setRole, setRegion, setPlan, toggleSaved, toggleCompare, setCompare, clearCompare, trackView, setPriority, resetPriorities, addWatch, removeWatch, setAlertPrefs, toggleHelpful, report, vote, toggleChecklist, resetChecklist, markRead, markAllRead, dismissNotification, consumeChat, setNote, toggleSavedVideo, setPreferences, completeOnboarding, updateProfile, resetDemo];
        return data;
      },
    },
  ),
);
