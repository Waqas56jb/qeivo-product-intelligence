import type { Metadata } from "next";
import { Suspense } from "react";
import { AskQeivoRoute } from "./ask-qeivo-route";

export const metadata: Metadata = {
  title: "Ask Qeivo",
  description: "Evidence-backed answers about any product, built from manuals, lab tests and owner reviews — every statement classified and cited.",
};

export default function AskQeivoPage() {
  return (
    <>
      <h1 className="sr-only">Ask Qeivo</h1>
      <Suspense fallback={null}>
        <AskQeivoRoute />
      </Suspense>
    </>
  );
}
