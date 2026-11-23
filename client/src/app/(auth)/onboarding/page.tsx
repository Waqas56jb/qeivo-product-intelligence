import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = { title: "Personalise Qeivo", description: "Tell Qeivo about your home, budget and priorities to personalise every suitability score." };

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
