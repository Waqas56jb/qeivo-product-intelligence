"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type CodeLanguage = "bash" | "javascript" | "python" | "json" | "http";

export interface CodeExample {
  label: string;
  language: CodeLanguage;
  code: string;
}

const TOKEN =
  /((?:^|(?<=\s))(?:\/\/|#)[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b-?\d+(?:\.\d+)?\b)|(\b(?:const|let|await|async|import|from|export|def|return|new|with|as|for|in|if|else|print|curl)\b)|(\b(?:true|false|null|None|True|False)\b)|((?:^|(?<=\s))--?[a-zA-Z][\w-]*)/gm;

/** Tiny, dependency-free highlighter. Produces React nodes (no HTML injection). */
function highlight(code: string, language: CodeLanguage): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of code.matchAll(TOKEN)) {
    const start = m.index ?? 0;
    if (start > last) out.push(code.slice(last, start));
    const [text, comment, str, num, kw, lit, flag] = m;
    let cls = "";
    if (comment) cls = "text-white/40 italic";
    else if (str) {
      const isKey = language === "json" && /^\s*:/.test(code.slice(start + text.length));
      cls = isKey ? "text-teal-400" : "text-lime-500";
    } else if (num) cls = "text-warning";
    else if (kw) cls = language === "json" ? "" : "text-info";
    else if (lit) cls = "text-warning";
    else if (flag) cls = language === "bash" ? "text-info" : "";
    out.push(
      cls ? (
        <span key={i++} className={cls}>
          {text}
        </span>
      ) : (
        text
      ),
    );
    last = start + text.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export function CopyButton({ value, label = "Copy", className, toastMessage = "Copied to clipboard" }: { value: string; label?: string; className?: string; toastMessage?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success(toastMessage);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          toast.error("Clipboard unavailable", { description: "Select the text and copy it manually." });
        }
      }}
      aria-label={copied ? "Copied" : label}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-[8px] px-2.5 text-[12px] font-medium text-white/70 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-[3px] focus-visible:ring-teal-400/40",
        className,
      )}
    >
      {copied ? <Check className="size-3.5 text-teal-400" /> : <Copy className="size-3.5" />}
      <span className="hidden sm:inline">{copied ? "Copied" : label}</span>
    </button>
  );
}

const LANG_LABEL: Record<CodeLanguage, string> = { bash: "Shell", javascript: "JavaScript", python: "Python", json: "JSON", http: "HTTP" };

/** Dark code surface in both themes. Long lines scroll inside the block, never the page. */
export function CodeBlock({ code, language, title, className, maxHeight, showLineNumbers }: { code: string; language: CodeLanguage; title?: string; className?: string; maxHeight?: number; showLineNumbers?: boolean }) {
  const lines = code.split("\n");
  return (
    <div className={cn("min-w-0 overflow-hidden rounded-[14px] bg-navy-950 text-white ring-1 ring-black/5 dark:ring-white/10", className)}>
      <div className="flex h-11 items-center justify-between gap-3 border-b border-white/10 pl-4 pr-1.5">
        <span className="flex min-w-0 items-center gap-2 text-[12px] font-medium text-white/60">
          <span className="flex gap-1" aria-hidden>
            <span className="size-2 rounded-full bg-white/15" />
            <span className="size-2 rounded-full bg-white/15" />
            <span className="size-2 rounded-full bg-white/15" />
          </span>
          <span className="truncate">{title ?? LANG_LABEL[language]}</span>
        </span>
        <CopyButton value={code} />
      </div>
      <CodeBody lines={lines} code={code} language={language} maxHeight={maxHeight} showLineNumbers={showLineNumbers} />
    </div>
  );
}

function CodeBody({ code, language, maxHeight, showLineNumbers, lines }: { code: string; language: CodeLanguage; maxHeight?: number; showLineNumbers?: boolean; lines: string[] }) {
  return (
    <div className="scrollbar-thin overflow-auto" style={maxHeight ? { maxHeight } : undefined} tabIndex={0} role="region" aria-label={`${LANG_LABEL[language]} code`}>
      <pre className="flex min-w-max px-4 py-3.5 font-mono text-[12.5px] leading-[1.7]">
        {showLineNumbers && (
          <span aria-hidden className="mr-4 select-none text-right text-white/25">
            {lines.map((_, i) => (
              <span key={i} className="block">
                {i + 1}
              </span>
            ))}
          </span>
        )}
        <code>{highlight(code, language)}</code>
      </pre>
    </div>
  );
}

/** Language tabs (curl / JavaScript / Python) sharing one dark surface and one copy button. */
export function CodeTabs({ examples, title, className, maxHeight }: { examples: CodeExample[]; title?: string; className?: string; maxHeight?: number }) {
  const [active, setActive] = useState(examples[0]?.label ?? "");
  const current = examples.find((e) => e.label === active) ?? examples[0];
  return (
    <Tabs value={active} onValueChange={setActive} className={cn("min-w-0 overflow-hidden rounded-[14px] bg-navy-950 text-white ring-1 ring-black/5 dark:ring-white/10", className)}>
      <div className="flex h-11 items-center justify-between gap-2 border-b border-white/10 pl-2 pr-1.5">
        <TabsList variant="underline" className="h-11 gap-0 border-0" aria-label={title ?? "Code language"}>
          {examples.map((e) => (
            <TabsTrigger
              key={e.label}
              value={e.label}
              className="h-11 rounded-none px-2.5 text-[12px] text-white/55 hover:text-white data-[state=active]:text-white [[data-variant=underline]_&]:h-11 [[data-variant=underline]_&]:data-[state=active]:border-teal-400"
            >
              {e.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {title && <span className="hidden truncate text-[12px] text-white/40 md:block">{title}</span>}
        {current && <CopyButton value={current.code} />}
      </div>
      {examples.map((e) => (
        <TabsContent key={e.label} value={e.label} className="mt-0">
          <CodeBody code={e.code} lines={e.code.split("\n")} language={e.language} maxHeight={maxHeight} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
