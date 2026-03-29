import { notFound } from "next/navigation";

export default async function Page({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = (await params);

    // Example logic to trigger notFound()
    // if (userId === '404') {
    //   notFound();
    // }

  return (
    <div>
      <h1>User Detail {userId}</h1>
    </div>
  );
}