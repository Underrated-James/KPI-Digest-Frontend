"use client";

import * as React from "react";
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

interface UserDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  isLoading: boolean;
}

export function UserDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  isLoading,
}: UserDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Light backdrop as requested */}
      <div 
        className="absolute inset-0 bg-background/20 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <Card className="relative z-10 w-full max-w-md shadow-2xl border-destructive/20 animate-in fade-in zoom-in duration-200">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Delete User</CardTitle>
            <CardDescription>This action cannot be undone.</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-foreground">{userName}</span>? 
            All of their data will be permanently removed from our servers.
          </p>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
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
            {isLoading ? "Deleting..." : "Delete User"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
