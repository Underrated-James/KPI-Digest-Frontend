import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

interface GenericNotFoundProps {
  title?: string;
  message?: string;
  buttonText?: string;
  buttonHref?: string;
}

export default function GenericNotFound({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved.",
  buttonText = "Go Home",
  buttonHref = "/",
}: GenericNotFoundProps) {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="rounded-full bg-muted p-6">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <p className="text-lg text-muted-foreground max-w-[500px]">
          {message}
        </p>
      </div>
      <Button asChild size="lg">
        <Link href={buttonHref}>{buttonText}</Link>
      </Button>
    </div>
  );
}
