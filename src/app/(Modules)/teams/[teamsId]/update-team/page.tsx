export default async function UpdateTeamPage({
  params,
}: {
  params: Promise<{ teamsId: string }>;
}) {
  const { teamsId } = await params;

  return (
    <div>
      <h1>Update Team {teamsId}</h1>
    </div>
  );
}
