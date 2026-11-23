"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Loader2, MailCheck, RotateCw } from "lucide-react";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, wait } from "@/components/account/fields";
import { AuthCard, AuthHeading } from "./auth-bits";

const schema = z.object({ email: z.string().trim().min(1, "Enter your email address").pipe(z.email("Enter a valid email address")) });
type Values = z.infer<typeof schema>;
const RESEND_SECONDS = 30;

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [resending, setResending] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "" }, mode: "onTouched" });

  useEffect(() => {
    if (seconds <= 0) return;
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [seconds]);

  const onSubmit = async (v: Values) => {
    await wait(700);
    setSentTo(v.email);
    setSeconds(RESEND_SECONDS);
  };

  const resend = async () => {
    setResending(true);
    await wait(600);
    setResending(false);
    setSeconds(RESEND_SECONDS);
    toast.success("Reset request repeated (demo)", { description: "No email was sent — this build has no mail service." });
  };

  if (sentTo) {
    return (
      <AuthCard>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} role="status">
          <span className="mb-6 grid size-14 place-items-center rounded-[16px] bg-brand-soft text-brand-soft-foreground">
            <MailCheck className="size-7" />
          </span>
          <AuthHeading title="Check your inbox" description={<>If an account exists for <strong className="break-all font-medium text-foreground">{sentTo}</strong>, we&apos;d send a link to reset your password. It would expire in 30 minutes.</>} />
          <div className="rounded-[14px] border border-dashed border-brand/40 bg-brand-soft/30 p-4 text-[13px] leading-relaxed text-muted-foreground">
            <strong className="font-semibold text-foreground">Demo:</strong> no email is sent. Qeivo&apos;s demo build has no accounts or mail service, so you can go straight back and sign in with any credentials.
          </div>
          <div className="mt-6 space-y-3">
            <Button asChild size="lg" variant="brand" className="w-full">
              <Link href={routes.login}>Back to sign in</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full" disabled={seconds > 0 || resending} onClick={resend}>
              {resending ? <Loader2 className="animate-spin" /> : <RotateCw />}
              {seconds > 0 ? (
                <span>
                  Resend in <span className="tabular">0:{String(seconds).padStart(2, "0")}</span>
                </span>
              ) : (
                "Resend link"
              )}
            </Button>
          </div>
          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            Wrong address?{" "}
            <button
              type="button"
              className="font-semibold text-foreground hover:text-brand-soft-foreground hover:underline"
              onClick={() => {
                setSentTo(null);
                setSeconds(0);
                reset({ email: "" });
              }}
            >
              Use a different email
            </button>
          </p>
        </motion.div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <Link href={routes.login} className="mb-8 inline-flex h-10 w-fit items-center gap-1.5 rounded-[10px] text-[13px] font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to sign in
      </Link>
      <AuthHeading eyebrow="Account recovery" title="Reset your password" description="Enter the email you signed up with and we'll send you a secure reset link." />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Field id="fp-email" label="Email" error={errors.email?.message}>
          <Input type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" autoFocus {...register("email")} />
        </Field>
        <Button type="submit" size="lg" variant="brand" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> Requesting link…
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>
      <p className="mt-6 text-[13px] leading-relaxed text-muted-foreground">For your security we never confirm whether an email address has an account.</p>
    </AuthCard>
  );
}
