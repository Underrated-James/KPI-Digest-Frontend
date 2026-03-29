export default async function Page({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = (await params);
  return (
    <div>
      <h1>Update User {userId}</h1>
    </div>
  );
} 