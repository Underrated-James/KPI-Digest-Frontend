import { Metadata } from "next";

type Props = {
    params: { teamsId: string };
}

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const id = (await params).teamsId;

  return { 
    title: `Team Detail ${id}`,
  }
}

export default async function teamDetails({ params }: Props) {
  const teamsId =  (await params).teamsId;
  return (
    <div>
      <h1>Team Detail {teamsId}</h1>
    </div>
  );
}
 