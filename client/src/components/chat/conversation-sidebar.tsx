"use client";

import { useMemo, useState } from "react";
import { MessageSquarePlus, Search, Star } from "lucide-react";
import type { Product } from "@/types";
import { getProduct } from "@/data/products";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AskConversation } from "@/store/chat-store";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/common/image-with-fallback";
import { UsageIndicator } from "./usage-indicator";

function Item({ c, active, onSelect, onToggleSave }: { c: AskConversation; active: boolean; onSelect: () => void; onToggleSave: () => void }) {
  const ps = c.productIds.map((id) => getProduct(id)).filter((p): p is Product => Boolean(p)).slice(0, 2);
  const questions = c.messages.filter((m) => m.role === "user").length;
  return (
    <li className="group relative">
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className={cn(
          "flex w-full items-start gap-2.5 rounded-[12px] py-2.5 pl-2.5 pr-11 text-left transition-colors",
          active ? "bg-surface shadow-sm ring-1 ring-border" : "hover:bg-surface/70",
        )}
      >
        <span className="relative mt-0.5 flex h-9 w-9 shrink-0">
          {ps.length ? (
            ps.map((p, i) => (
              <ImageWithFallback
                key={p.id}
                src={p.images[0]}
                alt=""
                aspect={cn("absolute size-7 rounded-[7px] border border-border bg-surface-2", i === 0 ? "left-0 top-0" : "bottom-0 right-0")}
                sizes="28px"
                className="p-0.5"
                shimmer={false}
              />
            ))
          ) : (
            <span className="grid size-9 place-items-center rounded-[9px] bg-surface-2 text-muted-foreground">
              <Search className="size-4" />
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("line-clamp-2 text-[13px] leading-snug", active ? "font-semibold" : "font-medium")}>{c.title}</span>
          <span className="mt-0.5 block text-[11px] text-subtle-foreground">
            <span className="tabular">{formatRelative(c.updatedAt)}</span> · {questions} {questions === 1 ? "question" : "questions"}
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={onToggleSave}
        aria-pressed={c.saved}
        aria-label={c.saved ? `Unsave “${c.title}”` : `Save “${c.title}”`}
        className={cn(
          "absolute right-1 top-1.5 grid size-10 place-items-center rounded-[10px] transition-colors hover:bg-surface-2",
          c.saved ? "text-warning" : "text-subtle-foreground opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100",
        )}
      >
        <Star className={cn("size-4", c.saved && "fill-current")} />
      </button>
    </li>
  );
}

/** Conversation history with saved/recent grouping and search. */
export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onToggleSave,
  className,
}: {
  conversations: AskConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onToggleSave: (id: string) => void;
  className?: string;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return conversations;
    return conversations.filter((c) => c.title.toLowerCase().includes(t) || c.messages.some((m) => m.content.toLowerCase().includes(t)));
  }, [conversations, q]);
  const saved = filtered.filter((c) => c.saved);
  const recent = filtered.filter((c) => !c.saved);

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="space-y-2.5 p-3">
        <Button onClick={onNew} variant="default" className="h-11 w-full justify-start gap-2.5">
          <MessageSquarePlus /> New conversation
        </Button>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
            className="h-11 w-full rounded-[10px] border border-input bg-surface pl-9 pr-3 text-[14px] outline-none transition-[border-color,box-shadow] placeholder:text-subtle-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 sm:h-10 sm:text-[13px]"
          />
        </div>
      </div>
      <nav aria-label="Conversation history" className="min-h-0 flex-1 space-y-4 overflow-y-auto px-2 pb-3 scrollbar-thin">
        {saved.length > 0 && (
          <section>
            <h3 className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">Saved</h3>
            <ul className="space-y-0.5">
              {saved.map((c) => (
                <Item key={c.id} c={c} active={c.id === activeId} onSelect={() => onSelect(c.id)} onToggleSave={() => onToggleSave(c.id)} />
              ))}
            </ul>
          </section>
        )}
        {recent.length > 0 && (
          <section>
            <h3 className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground">Recent</h3>
            <ul className="space-y-0.5">
              {recent.map((c) => (
                <Item key={c.id} c={c} active={c.id === activeId} onSelect={() => onSelect(c.id)} onToggleSave={() => onToggleSave(c.id)} />
              ))}
            </ul>
          </section>
        )}
        {!filtered.length && <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">No conversations match “{q}”.</p>}
      </nav>
      <div className="border-t border-border p-3">
        <UsageIndicator />
      </div>
    </div>
  );
}
