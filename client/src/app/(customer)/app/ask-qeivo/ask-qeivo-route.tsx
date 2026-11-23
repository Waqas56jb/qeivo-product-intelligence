"use client";

import { useSearchParams } from "next/navigation";
import { ChatWindow } from "@/components/chat/chat-window";

/** Reads ?product=, ?q= and ?c= once and hands them to the chat. */
export function AskQeivoRoute() {
  const params = useSearchParams();
  return <ChatWindow initialProduct={params.get("product")} initialQuestion={params.get("q")} initialConversation={params.get("c")} />;
}
