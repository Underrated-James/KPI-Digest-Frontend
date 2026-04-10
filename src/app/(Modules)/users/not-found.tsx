import GenericNotFound from "@/components/GenericNotFound";

export default function UserNotFound() {
  return (
    <GenericNotFound
      title="User Not Found"
      message="We couldn't find the user you're looking for."
      buttonText="Back to Users"
      buttonHref="/users"
    />
  );
}
