import { Metadata } from "next";

type Props = {
    params: { projectId: string };
}

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const id = (await params).projectId;

  return { 
    title: `Project Detail ${id}`,
  }
}

export default async function projectDetails({ params }: Props) {
  const projectId =  (await params).projectId;
  return (
    <div>
      <h1>Project Detail {projectId}</h1>
    </div>
  );
}
 