import { Suspense } from "react";
import type { Metadata } from "next";
import TicketPage from "@/features/ticket_Mode/presentation/components/ticket-page";

export const metadata: Metadata = {
  title: "Ticket Mode",
  description: "Static ticket mode view in Agile Digest",
};

export const dynamic = "force-static";

export default function Tickets() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading ticket mode...</div>}>
      <TicketPage />
    </Suspense>
  );
}
