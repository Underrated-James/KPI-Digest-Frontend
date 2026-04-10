import GenericNotFound from "@/components/GenericNotFound";

export default function TeamNotFound() {
  return (
    <GenericNotFound
      title="Team Not Found"
      message="We couldn't find the team you're looking for."
      buttonText="Back to Teams"
      buttonHref="/teams"
    />
  );
}
