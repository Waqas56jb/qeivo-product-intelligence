import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in", description: "Sign in to Qeivo or explore the demo as a customer, manufacturer, supplier or creator." };

export default function LoginPage() {
  return <LoginForm />;
}
