import GenericNotFound from "@/components/GenericNotFound";

export default function ProjectNotFound() {
  return (
    <GenericNotFound
      title="Project Not Found"
      message="We couldn't find the project you're looking for."
      buttonText="Back to Projects"
      buttonHref="/projects"
    />
  );
}
