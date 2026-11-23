"use client";

import { toast } from "sonner";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InvoiceActions() {
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button
        variant="outline"
        onClick={() =>
          toast.info("Save as PDF from the print dialog", { description: "This demo doesn't generate PDF files — choose “Save as PDF” as the printer instead." })
        }
      >
        <Download /> Download PDF
      </Button>
      <Button onClick={() => window.print()}>
        <Printer /> Print
      </Button>
    </div>
  );
}

/** Hides the app chrome (sidebar, top bars, tab bar) when printing an invoice. Scoped to this page. */
export function InvoicePrintStyles() {
  return (
    <style>{`
      @media print {
        @page { margin: 16mm; }
        html, body { background: white !important; }
        body * { visibility: hidden; }
        .invoice-sheet, .invoice-sheet * { visibility: visible; }
        .invoice-sheet { position: absolute; left: 0; top: 0; width: 100%; color: black; }
      }
    `}</style>
  );
}
