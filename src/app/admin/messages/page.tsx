import React from "react";
import { prisma } from "@/lib/prisma";
import MessagesClient from "./MessagesClient";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <MessagesClient initialMessages={JSON.parse(JSON.stringify(messages))} />
    </div>
  );
}
