import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { SavedResearch } from "@/components/research/saved-research";

export const metadata: Metadata = { title: "Saved research" };

export default function SavedPage() {
  return (
    <PageContainer size="wide">
      <PageHeader
        title="Saved research"
        description="Your saved products, research folders, notes and comparison snapshots."
        actions={
          <Button asChild variant="outline">
            <Link href={routes.products}>
              <Compass /> Find more
            </Link>
          </Button>
        }
      />
      <SavedResearch />
    </PageContainer>
  );
}
