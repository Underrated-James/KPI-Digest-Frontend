import { Metadata } from "next";

type Props = {
    params: { sprintId: string };
}

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const id = (await params).sprintId;

  return { 
    title: `Sprint Detail ${id}`,
  }
}

export default async function sprintDetails({ params }: Props) {
  const sprintId =  (await params).sprintId;
  return (
    <div>
      <h1>Sprint Detail {sprintId}</h1>
    </div>
  );
}
 