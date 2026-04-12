import type { Metadata } from "next";
import TicketPage from "@/features/tickets/presentation/components/ticket-page";

export const metadata: Metadata = {
  title: "Tickets",
  description: "Manage your tickets in KPI Digest",
};

export default function Tickets() {
  return <TicketPage />;
}
