import { Metadata } from "next";

type Props = {
    params: { ticketsId: string };
}

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const id = (await params).ticketsId;

  return { 
    title: `Ticket Detail ${id}`,
  }
}

export default async function ticketDetails({ params }: Props) {
  const ticketsId =  (await params).ticketsId;
  return (
    <div>
      <h1>Ticket Detail {ticketsId}</h1>
    </div>
  );
}
 