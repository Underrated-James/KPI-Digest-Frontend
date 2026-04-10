"use client";

import { Button } from "@/components/ui/button";
import { extractErrorMessage } from "@/lib/api-error";

interface ProjectPageErrorStateProps {
  error: unknown;
  onRetry: () => void;
}

export function ProjectPageErrorState({
  error,
  onRetry,
}: ProjectPageErrorStateProps) {
  const errorMessage = extractErrorMessage(error);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center sm:p-8">
        <h2 className="text-xl font-semibold text-destructive">
          We couldn&apos;t load the projects table
        </h2>
        <p className="mt-3 text-sm text-foreground sm:text-base">
          Please check the connection and try again in a moment.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {errorMessage || "An unexpected error occurred while fetching projects."}
        </p>
        <Button onClick={onRetry} className="mt-5" variant="outline">
          Try Again
        </Button>
      </div>
    </div>
  );
}
