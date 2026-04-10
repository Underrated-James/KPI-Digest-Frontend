export default async function UpdateTicketsPage({
  params,
}: {
  params: Promise<{ ticketsId: string }>;
}) {
  const { ticketsId } = await params;

  return (
    <div>
      <h1>Update Tickets {ticketsId}</h1>
    </div>
  );
}
