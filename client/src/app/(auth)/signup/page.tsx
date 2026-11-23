import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Create account", description: "Create a Qeivo demo account to research products with evidence." };

export default function SignupPage() {
  return <SignupForm />;
}
