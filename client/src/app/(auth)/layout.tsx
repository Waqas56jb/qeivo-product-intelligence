import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { routes } from "@/config/routes";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/common/controls";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

export const metadata: Metadata = { title: { default: "Account", template: "%s · Qeivo" } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[minmax(0,44%)_minmax(0,1fr)] xl:grid-cols-[600px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh lg:block" aria-label="About Qeivo">
        <AuthBrandPanel />
      </aside>

      <div className="relative flex min-h-dvh min-w-0 flex-col">
        <div aria-hidden className="bg-hero-glow pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-60 lg:hidden" />
        <header className="relative z-20 flex h-16 items-center justify-between gap-3 px-4 sm:px-8 lg:h-20 lg:px-12">
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
          <Link
            href={routes.home}
            className="group inline-flex h-11 items-center gap-1.5 rounded-[10px] px-2 text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/30 lg:-ml-2"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Back to site</span>
            <span className="sm:hidden">Site</span>
          </Link>
          <div className="flex items-center gap-1 lg:ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <main id="main" className="relative z-10 flex flex-1 flex-col">
          {children}
        </main>

        <footer className="relative z-10 px-4 pb-6 pt-4 sm:px-8 lg:px-12">
          <p className="mx-auto flex max-w-[440px] items-start justify-center gap-2 text-center text-[12px] leading-relaxed text-subtle-foreground">
            <FlaskConical className="mt-0.5 size-3.5 shrink-0" />
            <span>Demo build — no real accounts, emails or payments. Anything you enter stays in this browser.</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
