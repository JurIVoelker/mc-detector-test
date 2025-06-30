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
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";

export function ConfirmDeleteAllDialog() {
  const { refresh } = useRouter();

  const handleClick = async () => {
    await fetch("/api/delete-all-regions", {
      method: "GET",
    });
    refresh();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="flex justify-start mb-1">
          <Trash className="text-muted-foreground" /> Alle Löschen
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Möchtest du wirklich alle löschen?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bist du sicher, dass du alle Regionen löschen möchtest? Dieser
            Vorgang kann nicht rückgängig gemacht werden. Deine gespeicherten
            Entities bleiben erhalten, aber alle Regionen werden entfernt.
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
