export default async function UpdateProjectPage({
  params,
}: {
  params: Promise<{ sprintId: string }>;
}) {
  const { sprintId } = await params;

  return (
    <div>
      <h1>Update Sprint {sprintId}</h1>
    </div>
  );
}
