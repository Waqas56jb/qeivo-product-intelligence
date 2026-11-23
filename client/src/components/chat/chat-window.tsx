"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bookmark, BookmarkCheck, ExternalLink, History, MessageSquarePlus, MoreHorizontal, ShieldCheck, Sparkles, Trash2, Unplug, Zap } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { conversations as seedConversations } from "@/data/conversations/conversations";
import { getProduct } from "@/data/products";
import { getBrand } from "@/data/products/brands";
import { currentUser } from "@/data/users/customers";
import { routes } from "@/config/routes";
import { answerDelay, answerQuestion, suggestedQuestionsFor } from "@/lib/ask-engine";
import { cn, DEMO_NOW, hash } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { rehydrateChatStore, useChatHydrated, useChatStore, type AskConversation, type AskMessage } from "@/store/chat-store";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/menus";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ClaimLegend } from "@/components/analysis/claims";
import { EvidenceCoverage, SuitabilityScore } from "@/components/analysis/score";
import { SponsoredTag } from "@/components/analysis/warnings";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { BrandLabel, keySpecs, ProductPrice } from "@/components/product/product-bits";
import { HideCompareTray } from "@/components/mobile/hide-compare-tray";
import { ChatInput, type ChatInputHandle } from "./chat-input";
import { ChatMessage } from "./chat-message";
import { ConversationSidebar } from "./conversation-sidebar";
import { ProductContextPicker } from "./product-context-picker";
import { SuggestedQuestions } from "./suggested-questions";
import { QeivoMark, TypingIndicator } from "./typing-indicator";
import { useChatUsage } from "./usage-indicator";

const iso = (offsetSec: number) => new Date(DEMO_NOW.getTime() + offsetSec * 1000).toISOString();

function researchSteps(p: Product | undefined): string[] {
  if (!p) return ["Understanding your question…", "Searching the catalogue…", "Ranking by evidence…", "Writing the answer…"];
  return [
    "Understanding your question…",
    `Reading the ${p.model} manual and spec sheet…`,
    `Checking lab measurements and ${p.reviewCount.toLocaleString("en-US")} owner reviews…`,
    "Classifying claims and attaching sources…",
  ];
}

function ContextPanel({ product }: { product: Product }) {
  const specs = keySpecs(product);
  return (
    <aside aria-label="Product in context" className="hidden w-[300px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-surface/60 p-5 scrollbar-thin 2xl:flex">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">Researching</p>
      <div className="overflow-hidden rounded-[16px] border border-border bg-card">
        <ImageWithFallback src={product.images[0]} alt={product.name} aspect="aspect-[4/3] bg-gradient-to-b from-surface-2 to-card" sizes="300px" className="p-4" />
        <div className="space-y-1 p-4 pt-2">
          <div className="flex items-center gap-2">
            <BrandLabel brandId={product.brandId} />
            {product.sponsored && <SponsoredTag />}
          </div>
          <p className="font-semibold leading-snug">{product.model}</p>
          <p className="text-[12px] text-muted-foreground">{product.modelNumber}</p>
          <ProductPrice product={product} size="sm" className="pt-1" />
        </div>
      </div>
      <div className="flex items-center gap-4 rounded-[16px] border border-border bg-card p-4">
        <SuitabilityScore score={product.suitabilityScore} size="sm" label={false} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Suitability</p>
          <EvidenceCoverage coverage={product.evidenceCoverage} className="mt-2" />
        </div>
      </div>
      <dl className="grid grid-cols-3 gap-2">
        {specs.map((s) => (
          <div key={s.label} className="rounded-[10px] bg-surface-2 px-2 py-2">
            <dt className="truncate text-[10px] font-medium uppercase tracking-wider text-subtle-foreground">{s.label}</dt>
            <dd className="mt-0.5 truncate text-[12px] font-semibold tabular">{s.value}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-2">
        <Button asChild variant="outline" size="sm" className="h-10 justify-between">
          <Link href={routes.productAnalysis(product.slug)}>
            Full analysis <ArrowRight />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="h-10 justify-between">
          <Link href={routes.productCompatibility(product.slug)}>
            Compatibility checker <ArrowRight />
          </Link>
        </Button>
      </div>
      <div className="mt-auto rounded-[14px] bg-surface-2 p-3.5">
        <p className="mb-2 text-[12px] font-semibold">How to read answers</p>
        <ClaimLegend compact className="gap-x-3" />
      </div>
    </aside>
  );
}

function EmptyConversation({ product, onPick, onChangeProduct, disabled }: { product: Product | undefined; onPick: (q: string) => void; onChangeProduct: (id: string | null) => void; disabled?: boolean }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-1 pb-6 pt-6 text-center sm:pt-12">
      <div className="relative">
        <div aria-hidden className="absolute inset-0 scale-[2.2] rounded-full bg-brand/15 blur-2xl" />
        <QeivoMark size="lg" className="relative" />
      </div>
      <h2 className="mt-5 text-[22px] font-semibold leading-tight sm:text-[26px]">{product ? <>What would you like to know about the {product.model}?</> : "What are you researching today?"}</h2>
      <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-muted-foreground">
        {product
          ? `Answers come only from this product's manual, spec sheet, lab tests, ${product.reviewCount.toLocaleString("en-US")} owner reviews and tracked offers — every statement labelled and cited.`
          : "Pick a product for evidence-backed answers about fit, running costs and owner complaints — or ask a general question to get a shortlist."}
      </p>
      {product ? (
        <div className="mt-5 flex w-full max-w-md items-center gap-3 rounded-[16px] border border-border bg-card p-2.5 pr-3 text-left shadow-xs">
          <ImageWithFallback src={product.images[0]} alt="" aspect="size-14 shrink-0 rounded-[11px] bg-gradient-to-b from-surface-2 to-surface-3/60" sizes="56px" className="p-1.5" />
          <div className="min-w-0 flex-1">
            <BrandLabel brandId={product.brandId} className="text-[10px]" />
            <p className="truncate text-[14px] font-semibold">{product.model}</p>
            <p className="truncate text-[12px] text-muted-foreground tabular">
              {product.suitabilityScore.toFixed(1)}/10 suitability · {product.evidenceCoverage}% evidence
            </p>
          </div>
          <ProductContextPicker value={product.id} onChange={onChangeProduct} trigger="link" />
        </div>
      ) : (
        <ProductContextPicker value={null} onChange={onChangeProduct} className="mt-5" />
      )}
      <SuggestedQuestions questions={suggestedQuestionsFor(product)} onPick={onPick} disabled={disabled} className="mt-7 w-full" />
      <div className="mt-6 flex flex-col items-center gap-2">
        <ClaimLegend compact className="justify-center gap-x-3" />
        <p className="inline-flex items-center gap-1.5 text-[12px] text-subtle-foreground">
          <ShieldCheck className="size-3.5 text-brand" /> Sponsored placements never influence answers.
        </p>
      </div>
    </div>
  );
}

function LimitCard({ plan, onRestore }: { plan: "free" | "premium"; onRestore: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} role="alert" className="bg-navy-sheen relative overflow-hidden rounded-[20px] p-5 text-white shadow-md sm:p-6">
      <div aria-hidden className="absolute -right-16 -top-16 size-48 rounded-full bg-teal-500/25 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-white/10">
          <Zap className="size-5 text-teal-400" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold">You&apos;ve used all your {plan === "free" ? "free" : "Premium"} questions this month</p>
          <p className="mt-1 text-[13px] leading-relaxed text-white/70">
            {plan === "free" ? "The free plan includes 25 Ask Qeivo questions a month. Premium includes 500, plus personalised suitability and price alerts." : "Your allowance resets on 14 Dec."} Your conversation is saved.
          </p>
        </div>
      </div>
      <div className="relative mt-4 flex flex-wrap gap-2">
        <Button asChild variant="brand">
          <Link href={routes.billing}>
            <Sparkles /> Upgrade to Premium
          </Link>
        </Button>
        {plan === "free" && (
          <Button variant="ghost" className="text-white hover:bg-white/10" onClick={onRestore}>
            Demo: switch back to Premium
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export interface ChatWindowProps {
  initialProduct?: string | null;
  initialQuestion?: string | null;
  initialConversation?: string | null;
}

/** Ask Qeivo — full conversational research workspace. */
export function ChatWindow({ initialProduct, initialQuestion, initialConversation }: ChatWindowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const chatHydrated = useChatHydrated();
  const stored = useChatStore((s) => s.conversations);
  const savedOverrides = useChatStore((s) => s.savedOverrides);
  const hidden = useChatStore((s) => s.hidden);
  const upsert = useChatStore((s) => s.upsert);
  const setSavedFlag = useChatStore((s) => s.setSaved);
  const removeConversation = useChatStore((s) => s.remove);

  const region = useAppStore((s) => s.region);
  const prefs = useAppStore((s) => s.preferences);
  const setPlan = useAppStore((s) => s.setPlan);
  const consumeChat = useAppStore((s) => s.consumeChat);
  const usage = useChatUsage();

  const initialSeed = initialConversation ? seedConversations.find((c) => c.id === initialConversation) : undefined;
  const [activeId, setActiveId] = useState<string | null>(initialConversation ?? null);
  const [contextId, setContextId] = useState<string | null>(() => {
    const fromParam = initialProduct ? getProduct(initialProduct)?.id : undefined;
    return fromParam ?? initialSeed?.productIds[0] ?? null;
  });
  const [pending, setPending] = useState<{ convId: string; question: string } | null>(null);
  const [limitHit, setLimitHit] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [live, setLive] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const inputRef = useRef<ChatInputHandle>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoSent = useRef(false);

  useEffect(() => {
    rehydrateChatStore();
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  const all: AskConversation[] = useMemo(() => {
    const byId = new Map<string, AskConversation>();
    for (const c of seedConversations) byId.set(c.id, { ...c, saved: savedOverrides[c.id] ?? c.saved, origin: "seed" });
    if (chatHydrated) for (const c of stored) byId.set(c.id, c);
    return [...byId.values()].filter((c) => !hidden.includes(c.id)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id));
  }, [stored, savedOverrides, hidden, chatHydrated]);

  const active = activeId ? all.find((c) => c.id === activeId) : undefined;
  const product = contextId ? getProduct(contextId) : undefined;
  const messages = active?.messages ?? [];
  const busy = pending !== null;

  // Keep the newest message in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, pending, limitHit]);

  const space = prefs.space ?? currentUser.preferences.space;
  const householdSize = prefs.householdSize ?? currentUser.preferences.householdSize;

  const deliver = useCallback(
    (conv: AskConversation, question: string, opts: { retry?: boolean } = {}) => {
      setPending({ convId: conv.id, question });
      const t = setTimeout(() => {
        const latest = useChatStore.getState().conversations.find((c) => c.id === conv.id) ?? conv;
        const stamp = iso(latest.messages.length * 20 + 12);
        if (!opts.retry && /error test/i.test(question)) {
          const err: AskMessage = { id: `${conv.id}-m${latest.messages.length + 1}`, role: "assistant", content: "", error: true, retryOf: question, createdAt: stamp };
          upsert({ ...latest, messages: [...latest.messages, err], updatedAt: stamp });
          setLive("Qeivo couldn't answer: simulated network error. Use Try again to retry.");
          setPending(null);
          return;
        }
        if (!consumeChat()) {
          setLimitHit(true);
          setPending(null);
          return;
        }
        const cleaned = question.replace(/error test[:\s-]*/i, "").trim() || question;
        const ctxIds = latest.productIds.length ? latest.productIds : [];
        const a = answerQuestion(cleaned, { productIds: ctxIds, region, space, householdSize });
        const msg: AskMessage = {
          id: `${conv.id}-m${latest.messages.length + 1}`,
          role: "assistant",
          content: a.blocks.map((b) => b.text).join(" "),
          blocks: a.blocks,
          sourceIds: a.sourceIds,
          productIds: a.productIds,
          followUps: a.followUps,
          intent: a.intent,
          intentLabel: a.intentLabel,
          gaps: a.gaps,
          createdAt: stamp,
        };
        const productIds = latest.productIds.length ? Array.from(new Set([...latest.productIds, ...(a.intent === "compare" ? a.productIds : [])])) : a.productIds.slice(0, 1);
        upsert({ ...latest, productIds, messages: [...latest.messages, msg], updatedAt: stamp });
        if (!latest.productIds.length && a.productIds[0] && a.intent !== "discover") setContextId(a.productIds[0]);
        setLive(`Qeivo answered: ${a.blocks[0]?.text ?? ""}`);
        setPending(null);
      }, answerDelay(question));
      timers.current.push(t);
    },
    [consumeChat, householdSize, region, space, upsert],
  );

  const send = useCallback(
    (raw: string) => {
      const question = raw.trim();
      if (!question || pending) return;
      if (usage.atLimit) {
        setLimitHit(true);
        return;
      }
      setLimitHit(false);
      const base: AskConversation =
        active ??
        ({
          id: `ask-${hash(`${question}|${stored.length}|${all.length}`).toString(36)}`,
          title: question.length > 64 ? `${question.slice(0, 61).trimEnd()}…` : question,
          productIds: contextId ? [contextId] : [],
          createdAt: iso(0),
          updatedAt: iso(0),
          saved: false,
          messages: [],
          origin: "user",
        } satisfies AskConversation);
      const productIds = contextId ? [contextId, ...base.productIds.filter((x) => x !== contextId)] : base.productIds;
      const userMsg: AskMessage = { id: `${base.id}-m${base.messages.length + 1}`, role: "user", content: question, createdAt: iso(base.messages.length * 20) };
      const next: AskConversation = { ...base, productIds, messages: [...base.messages, userMsg], updatedAt: userMsg.createdAt };
      upsert(next);
      setActiveId(next.id);
      deliver(next, question);
    },
    [active, all.length, contextId, deliver, pending, stored.length, upsert, usage.atLimit],
  );

  const retry = (question: string, errorId: string) => {
    if (!active || pending) return;
    const next = { ...active, messages: active.messages.filter((m) => m.id !== errorId) };
    upsert(next);
    deliver(next, question, { retry: true });
  };

  // Auto-send ?q= once, after persisted state is restored.
  useEffect(() => {
    if (autoSent.current || !initialQuestion || !chatHydrated || !usage.hydrated) return;
    autoSent.current = true;
    send(initialQuestion);
    const params = new URLSearchParams();
    if (contextId) params.set("product", getProduct(contextId)?.slug ?? contextId);
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false });
  }, [initialQuestion, chatHydrated, usage.hydrated, send, contextId, pathname, router]);

  const newConversation = () => {
    setActiveId(null);
    setLimitHit(false);
    setHistoryOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const selectConversation = (id: string) => {
    const c = all.find((x) => x.id === id);
    setActiveId(id);
    setLimitHit(false);
    if (c?.productIds[0]) setContextId(c.productIds[0]);
    setHistoryOpen(false);
  };

  const toggleSave = (id: string) => {
    const c = all.find((x) => x.id === id);
    if (!c) return;
    setSavedFlag(id, !c.saved);
    toast.success(c.saved ? "Removed from saved conversations" : "Conversation saved", { description: c.title });
  };

  const changeContext = (id: string | null) => {
    setContextId(id);
    if (active && id && !active.productIds.includes(id)) setActiveId(null);
    const p = id ? getProduct(id) : undefined;
    router.replace(p ? `${pathname}?product=${p.slug}` : pathname, { scroll: false });
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const sidebar = <ConversationSidebar conversations={all} activeId={activeId} onSelect={selectConversation} onNew={newConversation} onToggleSave={toggleSave} />;
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] top-14 z-20 flex bg-background lg:bottom-0 lg:left-[264px] lg:top-16">
      <HideCompareTray />
      <div aria-live="polite" className="sr-only">
        {live}
      </div>

      {/* History — desktop panel */}
      <aside aria-label="Conversations" className="hidden w-[288px] shrink-0 border-r border-border bg-surface-2/40 lg:block">
        {sidebar}
      </aside>
      {/* History — mobile sheet */}
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="left" className="w-[min(340px,92%)] bg-background p-0">
          <SheetTitle className="border-b border-border px-4 py-3.5 text-[15px]">Conversations</SheetTitle>
          <div className="min-h-0 flex-1">{sidebar}</div>
        </SheetContent>
      </Sheet>

      {/* Chat column */}
      <section aria-label="Ask Qeivo chat" className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[60px] shrink-0 items-center gap-2 border-b border-border bg-background/85 px-2 backdrop-blur-xl sm:px-4">
          <Button variant="ghost" size="icon" className="size-11 lg:hidden" aria-label="Open conversation history" onClick={() => setHistoryOpen(true)}>
            <History className="size-5" />
          </Button>
          <ProductContextPicker value={contextId} onChange={changeContext} className="min-w-0 flex-1 sm:max-w-[320px] sm:flex-none" />
          <div className="hidden min-w-0 flex-1 px-2 md:block">
            <p className="truncate text-[13px] font-semibold">{active?.title ?? "New conversation"}</p>
            <p className="truncate text-[11px] text-muted-foreground">{active ? `${active.messages.filter((m) => m.role === "user").length} questions · ${active.saved ? "Saved" : "Not saved"}` : "Ask a question to start"}</p>
          </div>
          <UsageIndicatorCompact />
          {active && (
            <Button variant="ghost" size="icon" className="hidden size-11 sm:inline-flex" aria-pressed={active.saved} aria-label={active.saved ? "Unsave conversation" : "Save conversation"} onClick={() => toggleSave(active.id)}>
              {active.saved ? <BookmarkCheck className="size-5 text-brand" /> : <Bookmark className="size-5" />}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-11" aria-label="Conversation options">
                <MoreHorizontal className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <DropdownMenuItem onSelect={newConversation}>
                <MessageSquarePlus /> New conversation
              </DropdownMenuItem>
              {active && (
                <DropdownMenuItem onSelect={() => toggleSave(active.id)}>
                  {active.saved ? <BookmarkCheck /> : <Bookmark />} {active.saved ? "Unsave conversation" : "Save conversation"}
                </DropdownMenuItem>
              )}
              {product && (
                <DropdownMenuItem onSelect={() => router.push(routes.product(product.slug))}>
                  <ExternalLink /> Open {product.model}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Demo controls</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={usage.plan === "free"}
                onCheckedChange={(v) => {
                  setPlan(v ? "free" : "premium");
                  setLimitHit(false);
                  toast(v ? "Using free-plan limits" : "Premium limits restored", { description: v ? "25 questions a month — you're already past it, so the next question shows the upgrade state." : "500 questions a month." });
                }}
              >
                Demo: use free-plan limits
              </DropdownMenuCheckboxItem>
              <DropdownMenuItem onSelect={() => send("error test: what are its biggest weaknesses?")} disabled={busy}>
                <Unplug /> Simulate network error
              </DropdownMenuItem>
              {active && active.origin === "user" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    destructive
                    onSelect={() => {
                      removeConversation(active.id);
                      newConversation();
                      toast("Conversation deleted", { description: "Removed from this browser's demo history." });
                    }}
                  >
                    <Trash2 /> Delete conversation
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto w-full max-w-3xl px-3 sm:px-6">
            {messages.length === 0 && !busy ? (
              <EmptyConversation product={product} onPick={send} onChangeProduct={changeContext} disabled={busy} />
            ) : (
              <div className="space-y-6 py-6">
                {active?.origin === "seed" && (
                  <p className="text-center text-[11px] font-medium uppercase tracking-[0.12em] text-subtle-foreground">
                    Saved research · {getBrandList(active.productIds)}
                  </p>
                )}
                {messages.map((m) => (
                  <ChatMessage key={m.id} message={m} isLatest={m.id === lastAssistant?.id && !busy} onFollowUp={send} onRetry={retry} busy={busy} />
                ))}
                <AnimatePresence>{busy && <TypingIndicator key="typing" steps={researchSteps(product)} />}</AnimatePresence>
              </div>
            )}
            {limitHit && (
              <div className="pb-6">
                <LimitCard
                  plan={usage.plan}
                  onRestore={() => {
                    setPlan("premium");
                    setLimitHit(false);
                    toast.success("Premium limits restored", { description: "Demo only — no payment was taken." });
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-border bg-background/90 px-3 pb-2.5 pt-2.5 backdrop-blur-xl sm:px-6 sm:pb-4">
          <div className="mx-auto max-w-3xl">
            <ChatInput ref={inputRef} onSend={send} disabled={busy} contextLabel={product?.name} placeholder={product ? `Ask about the ${product.model}…` : "Ask about a product, or pick one above…"} />
          </div>
        </div>
      </section>

      {product && <ContextPanel product={product} />}
    </div>
  );
}

function getBrandList(ids: string[]) {
  return ids
    .map((id) => getProduct(id))
    .filter((p): p is Product => Boolean(p))
    .map((p) => `${getBrand(p.brandId).name} ${p.model}`)
    .join(" · ");
}

function UsageIndicatorCompact() {
  const { used, limit, plan, atLimit } = useChatUsage();
  return (
    <Link
      href={routes.billing}
      className={cn(
        "hidden h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium sm:inline-flex",
        atLimit ? "border-danger/30 bg-danger-soft text-danger-foreground" : "border-border bg-surface text-muted-foreground hover:text-foreground",
      )}
      aria-label={`${used} of ${limit} questions used this month on the ${plan} plan`}
    >
      <Zap className="size-3.5" />
      <span className="tabular">
        {used}/{limit}
      </span>
      {plan === "free" && <span className="rounded-full bg-surface-2 px-1.5 text-[10px] uppercase tracking-wider">Free</span>}
    </Link>
  );
}
