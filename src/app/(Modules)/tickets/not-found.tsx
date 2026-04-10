import GenericNotFound from "@/components/GenericNotFound";

export default function TicketNotFound() {
  return (
    <GenericNotFound
      title="Ticket Not Found"
      message="We couldn't find the ticket you're looking for."
      buttonText="Back to Tickets"
      buttonHref="/tickets"
    />
  );
}
