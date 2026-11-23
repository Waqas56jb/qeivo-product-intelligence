"use client";

import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatInputHandle {
  focus: () => void;
  setValue: (v: string) => void;
}

const MAX = 500;

/** Auto-growing composer. Enter sends, Shift+Enter adds a line. */
export const ChatInput = forwardRef<ChatInputHandle, { onSend: (text: string) => void; disabled?: boolean; placeholder?: string; contextLabel?: string; className?: string }>(function ChatInput(
  { onSend, disabled, placeholder = "Ask about fit, running costs, owner complaints…", contextLabel, className },
  ref,
) {
  const [value, setValue] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({ focus: () => taRef.current?.focus(), setValue: (v: string) => setValue(v) }), []);

  useLayoutEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, [value]);

  const submit = () => {
    const t = value.trim();
    if (!t || disabled) return;
    onSend(t);
    setValue("");
    taRef.current?.focus();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className={cn("w-full", className)}
    >
      <div className="flex items-end gap-2 rounded-[18px] border border-border-strong bg-surface p-1.5 pl-4 shadow-md transition-[box-shadow,border-color] focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
        <label htmlFor="ask-composer" className="sr-only">
          Ask Qeivo a question{contextLabel ? ` about ${contextLabel}` : ""}
        </label>
        <textarea
          id="ask-composer"
          ref={taRef}
          rows={1}
          value={value}
          maxLength={MAX}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          className="max-h-[168px] min-h-11 flex-1 resize-none bg-transparent py-2.5 text-[15px] leading-relaxed outline-none placeholder:text-subtle-foreground"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label="Send question"
          className="grid size-11 shrink-0 place-items-center rounded-[13px] bg-brand text-brand-foreground shadow-xs transition-all hover:bg-brand-strong active:scale-95 disabled:bg-surface-3 disabled:text-subtle-foreground"
        >
          <ArrowUp className="size-5" />
        </button>
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-3 px-1 text-[11px] text-subtle-foreground">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <ShieldCheck className="size-3.5 shrink-0 text-brand" />
          <span className="truncate">Answers cite manuals, lab tests and owner reviews — never sponsored content.</span>
        </span>
        <span className={cn("hidden shrink-0 tabular sm:inline", value.length > MAX - 80 && "text-warning-foreground")}>
          {value.length > MAX - 80 ? `${value.length}/${MAX}` : "Enter to send · Shift+Enter for a new line"}
        </span>
      </div>
    </form>
  );
});
