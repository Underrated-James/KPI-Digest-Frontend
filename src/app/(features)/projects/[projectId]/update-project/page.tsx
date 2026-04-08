export default async function UpdateProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div>
      <h1>Update Project {projectId}</h1>
    </div>
  );
}
