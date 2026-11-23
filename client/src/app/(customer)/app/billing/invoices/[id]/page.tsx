import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { routes } from "@/config/routes";
import { getInvoice, invoices, orgInvoices } from "@/data/subscriptions/invoices";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { InvoiceDocument } from "@/components/account/invoice-document";
import { InvoiceActions, InvoicePrintStyles } from "@/components/account/invoice-actions";

export function generateStaticParams() {
  return [...invoices, ...orgInvoices].map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const inv = getInvoice(id);
  return { title: inv ? `Invoice ${inv.number}` : "Invoice not found" };
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = getInvoice(id);
  if (!invoice) notFound();
  const isOrg = invoice.id.startsWith("inv-org");
  const back = isOrg ? routes.workspaceBilling : routes.billing;

  return (
    <PageContainer size="narrow" className="max-w-4xl">
      <InvoicePrintStyles />
      <div className="print:hidden">
        <Link href={back} className="mb-4 inline-flex h-10 items-center gap-1.5 rounded-[10px] text-[13px] font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> {isOrg ? "Workspace billing" : "Plan & billing"}
        </Link>
        <PageHeader
          breadcrumbs={false}
          title={`Invoice ${invoice.number}`}
          description={`${invoice.plan} · ${invoice.period}`}
          actions={<InvoiceActions />}
        />
      </div>
      <InvoiceDocument invoice={invoice} />
      <p className="mt-4 text-center text-[12px] text-subtle-foreground print:hidden">Print-friendly: app navigation is hidden automatically when printing.</p>
    </PageContainer>
  );
}
