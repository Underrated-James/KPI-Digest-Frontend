import { Metadata } from "next";

type Props = {
    params: { userId: string };
}

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const id = (await params).userId;

  return { 
    title: `User Detail ${id}`,
  }
}

export default async function userDetails({ params }: Props) {
  const userid =  (await params).userId;
  return (
    <div>
      <h1>User Detail {userid}</h1>
    </div>
  );
}
 