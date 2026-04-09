"use client";

import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface SprintDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sprintName: string;
  isLoading: boolean;
}

export function SprintDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  sprintName,
  isLoading,
}: SprintDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <Card className="relative z-10 w-full max-w-md border border-destructive/35 shadow-2xl ring-1 ring-destructive/20 animate-in fade-in zoom-in duration-200">
        <CardHeader className="flex flex-row items-center gap-4 border-b border-destructive/15 pb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-destructive/25 bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Delete Sprint</CardTitle>
            <CardDescription className="text-destructive/80">
              This action cannot be undone.
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-5">
          <div className="rounded-xl border border-destructive/20 bg-destructive/8 p-4">
            <p className="text-sm font-medium text-foreground">
              You are about to permanently remove this sprint.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              This warning is here so accidental deletions are easier to spot before confirming.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-foreground">{sprintName}</span>? 
            All of their data will be permanently removed from our servers.
          </p>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-3 border-t border-destructive/15 bg-muted/25 pt-4">
          <Button
            variant="outline"
            className="hover:border-foreground/35 hover:bg-foreground/10 hover:text-foreground dark:hover:border-foreground/35 dark:hover:bg-foreground/15 dark:hover:text-foreground"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Sprint"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
