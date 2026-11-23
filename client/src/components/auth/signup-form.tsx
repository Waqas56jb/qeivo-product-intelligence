"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2, PartyPopper } from "lucide-react";
import { roleMeta } from "@/config/navigation";
import { routes } from "@/config/routes";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox, RadioCard, RadioGroup } from "@/components/ui/primitives";
import { Field, PasswordInput, PasswordStrength, wait } from "@/components/account/fields";
import { AuthCard, AuthHeading, GoogleButton, OrDivider, SIGNUP_ROLES } from "./auth-bits";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(80, "Keep your name under 80 characters"),
    email: z.string().trim().min(1, "Enter your email address").pipe(z.email("Enter a valid email address, e.g. name@example.com")),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/\d/, "Include at least one number"),
    confirm: z.string().min(1, "Confirm your password"),
    role: z.enum(["customer", "manufacturer", "supplier", "creator"]),
    terms: z.boolean().refine((v) => v, "Accept the terms to create a demo account"),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

type Values = z.infer<typeof schema>;

export function SignupForm() {
  const router = useRouter();
  const setRole = useAppStore((s) => s.setRole);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const [done, setDone] = useState<Values | null>(null);
  const [countdown, setCountdown] = useState(4);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirm: "", role: "customer", terms: false },
    mode: "onTouched",
  });
  const password = watch("password");

  const destination = done ? (done.role === "customer" ? routes.onboarding : roleMeta[done.role].home) : null;

  useEffect(() => {
    if (!destination) return;
    if (countdown <= 0) {
      router.push(destination);
      return;
    }
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [countdown, destination, router]);

  const onSubmit = async (v: Values) => {
    await wait(700);
    setRole(v.role);
    updateProfile({ name: v.name, email: v.email });
    setDone(v);
  };

  if (done && destination) {
    const meta = roleMeta[done.role];
    return (
      <AuthCard>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center" role="status">
          <div className="relative mx-auto mb-6 grid size-16 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-brand/20 [animation-iteration-count:2]" aria-hidden />
            <span className="relative grid size-16 place-items-center rounded-full bg-brand text-brand-foreground shadow-md">
              <PartyPopper className="size-7" />
            </span>
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight">Demo account ready</h1>
          <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
            Welcome, {done.name.split(" ")[0]}. <strong className="font-medium text-foreground">No real account was created</strong> — your name, email and role are kept only in this browser so the demo can personalise itself.
          </p>
          <dl className="mx-auto mt-6 max-w-sm divide-y divide-border rounded-[14px] border border-border bg-card text-left text-[13px] shadow-xs">
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate font-medium">{done.email}</dd>
            </div>
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-muted-foreground">Experience</dt>
              <dd className="font-medium">{meta.label}</dd>
            </div>
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-muted-foreground">Next</dt>
              <dd className="font-medium">{done.role === "customer" ? "Personalise your research" : `${meta.org} workspace`}</dd>
            </div>
          </dl>
          <Button size="lg" variant="brand" className="mt-6 w-full max-w-sm" onClick={() => router.push(destination)}>
            Continue now <ArrowRight />
          </Button>
          <p className="mt-3 text-[12.5px] text-muted-foreground" aria-live="polite">
            Redirecting in <span className="tabular font-medium text-foreground">{countdown}</span>s…
          </p>
        </motion.div>
      </AuthCard>
    );
  }

  return (
    <AuthCard wide>
      <AuthHeading eyebrow="Create account" title="Start researching with evidence" description="Free to start. Personal suitability scores, cited sources and honest data gaps." />

      <GoogleButton label="Sign up with Google" />
      <OrDivider label="or with email" />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="su-name" label="Full name" error={errors.name?.message}>
            <Input autoComplete="name" placeholder="Alex Morgan" {...register("name")} />
          </Field>
          <Field id="su-email" label="Email" error={errors.email?.message}>
            <Input type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
          </Field>
        </div>
        <Field id="su-password" label="Password" error={errors.password?.message}>
          <PasswordInput autoComplete="new-password" placeholder="At least 8 characters" {...register("password")} />
        </Field>
        <PasswordStrength value={password} className="-mt-2" />
        <Field id="su-confirm" label="Confirm password" error={errors.confirm?.message}>
          <PasswordInput autoComplete="new-password" placeholder="Repeat your password" {...register("confirm")} />
        </Field>

        <fieldset className="space-y-2.5">
          <legend className="mb-2.5 text-[13px] font-medium">I&apos;m joining as</legend>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange} className="grid-cols-1 gap-2.5 min-[420px]:grid-cols-2" aria-label="Account type">
                {SIGNUP_ROLES.map(({ role, icon: Icon, title, body }) => (
                  <RadioCard key={role} value={role} className="group items-center gap-3 p-3.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-muted-foreground transition-colors group-data-[state=checked]:bg-brand group-data-[state=checked]:text-brand-foreground">
                      <Icon className="size-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold leading-tight">{title}</span>
                      <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">{body}</span>
                    </span>
                    <Check className="size-4 shrink-0 text-brand opacity-0 transition-opacity group-data-[state=checked]:opacity-100" aria-hidden />
                  </RadioCard>
                ))}
              </RadioGroup>
            )}
          />
        </fieldset>

        <Controller
          control={control}
          name="terms"
          render={({ field }) => (
            <div>
              <div className={cn("flex items-start gap-3 rounded-[12px] border p-3.5 transition-colors", errors.terms ? "border-danger/60 bg-danger-soft/40" : "border-border bg-surface")}>
                <Checkbox
                  id="su-terms"
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(v === true)}
                  onBlur={field.onBlur}
                  aria-invalid={errors.terms ? true : undefined}
                  aria-describedby={errors.terms ? "su-terms-error" : undefined}
                  className="mt-0.5"
                />
                <label htmlFor="su-terms" className="text-[13px] leading-relaxed text-muted-foreground">
                  I agree to the demo <strong className="font-medium text-foreground">Terms of use</strong> and <strong className="font-medium text-foreground">Privacy notice</strong>, and understand this is a demonstration built on fictional data.
                </label>
              </div>
              {errors.terms && (
                <p id="su-terms-error" role="alert" className="mt-2 text-[12.5px] text-danger-foreground">
                  {errors.terms.message}
                </p>
              )}
            </div>
          )}
        />

        <Button type="submit" size="lg" variant="brand" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> Creating demo account…
            </>
          ) : (
            <>
              Create account <ArrowRight />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-[14px] text-muted-foreground">
        Already have an account?{" "}
        <Link href={routes.login} className="font-semibold text-foreground hover:text-brand-soft-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
