import type { Metadata } from "next";
import { KeysManager } from "@/components/developer";

export const metadata: Metadata = { title: "API keys · Qeivo Developer" };

export default function ApiKeysPage() {
  return <KeysManager />;
}
