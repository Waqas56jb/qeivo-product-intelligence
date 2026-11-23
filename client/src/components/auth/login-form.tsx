"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { routes } from "@/config/routes";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/primitives";
import { Field, PasswordInput, wait } from "@/components/account/fields";
import { AuthCard, AuthHeading, DemoRoleButtons, GoogleButton, OrDivider } from "./auth-bits";

const schema = z.object({
  email: z.string().trim().min(1, "Enter your email address").pipe(z.email("Enter a valid email address")),
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean(),
});
type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const setRole = useAppStore((s) => s.setRole);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "", remember: true }, mode: "onTouched" });

  const onSubmit = async (v: Values) => {
    await wait(650);
    setRole("customer");
    toast.success("Signed in to the demo", { description: `${v.email} · no credentials were checked${v.remember ? " · remembered in this browser" : ""}` });
    router.push(onboardingComplete ? routes.app : routes.onboarding);
  };

  return (
    <AuthCard>
      <AuthHeading eyebrow="Welcome back" title="Sign in to Qeivo" description="Pick up your research where you left off." />

      <GoogleButton />
      <OrDivider label="or with email" />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Field id="li-email" label="Email" error={errors.email?.message}>
          <Input type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
        </Field>
        <Field
          id="li-password"
          label="Password"
          error={errors.password?.message}
          labelAction={
            <Link href={routes.forgotPassword} className="rounded text-[13px] font-medium text-brand-soft-foreground hover:underline">
              Forgot password?
            </Link>
          }
        >
          <PasswordInput autoComplete="current-password" placeholder="Your password" {...register("password")} />
        </Field>
        <Controller
          control={control}
          name="remember"
          render={({ field }) => (
            <label htmlFor="li-remember" className="-my-1 flex min-h-11 w-fit cursor-pointer items-center gap-3 text-[14px]">
              <Checkbox id="li-remember" checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
              Remember me on this device
            </label>
          )}
        />
        <Button type="submit" size="lg" variant="brand" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Sign in <ArrowRight />
            </>
          )}
        </Button>
      </form>

      <OrDivider label="explore instantly" />
      <DemoRoleButtons />
      <p className="mt-3 text-center text-[12px] text-subtle-foreground">Demo shortcuts switch the experience — no accounts or permissions are created.</p>

      <p className="mt-7 text-center text-[14px] text-muted-foreground">
        New to Qeivo?{" "}
        <Link href={routes.signup} className="font-semibold text-foreground hover:text-brand-soft-foreground hover:underline">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
