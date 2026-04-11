"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import type { SprintTeamMember } from "../../hooks/use-sprint-teams-page";

interface SprintTeamsRemoveDialogProps {
  member: SprintTeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function SprintTeamsRemoveDialog({
  member,
  open,
  onOpenChange,
  onConfirm,
}: SprintTeamsRemoveDialogProps) {
  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/15">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <DialogTitle className="text-base">
              Remove {member.name}?
            </DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-sm leading-relaxed">
            Removing this member will delete them from this sprint&apos;s team.
            This action will take effect when you save the team.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Remove from Team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
