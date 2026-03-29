import GenericNotFound from "@/components/GenericNotFound";

export default function NotFound() {
  return (
    <GenericNotFound
      title="404"
      message="Page Not Found"
      buttonText="Go Home"
      buttonHref="/"
    />
  );
}