"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export function ConfirmScannAllDialog() {
  const handleClick = async () => {
    await fetch("/api/process-all-mc-regions", {
      method: "GET",
    });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="flex justify-start mb-1">
          <Play className="text-muted-foreground" /> Alle Scannen
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Möchtest du wirklich alle scannen?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bist du sicher, dass du alle noch nicht gescannten Regionen scannen
            möchtest? Dieser Vorgang kann einige Zeit in Anspruch nehmen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={handleClick}>
            Fortfahren
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
