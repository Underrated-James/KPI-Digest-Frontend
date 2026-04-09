import GenericNotFound from "@/components/GenericNotFound";

export default function SprintNotFound() {
  return (
    <GenericNotFound
      title="Sprint Not Found"
      message="We couldn't find the sprint you're looking for."
      buttonText="Back to Sprints"
      buttonHref="/sprints"
    />
  );
}
