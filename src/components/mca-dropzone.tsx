"use client";

import type React from "react";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Upload, X, File } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface McaFile {
  file: File;
  id: string;
}

interface McaDropzoneProps {
  onFilesChange?: (files: McaFile[]) => void;
  maxFiles?: number;
  className?: string;
}

export function McaDropzone({
  onFilesChange,
  maxFiles = 99,
  className,
}: McaDropzoneProps) {
  const [files, setFiles] = useState<McaFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { refresh } = useRouter();

  const validateFile = (file: File): boolean => {
    if (!file.name.toLowerCase().endsWith(".mca")) {
      toast.error("Ungültiger Dateityp", {
        description: `${file.name} ist keine .mca-Datei`,
      });
      return false;
    }
    return true;
  };

  const filterDuplicates = (
    newFiles: File[],
    existingFiles: McaFile[]
  ): File[] => {
    const existingNames = new Set(
      existingFiles.map((f) => f.file.name.toLowerCase())
    );
    return newFiles.filter((file) => {
      if (existingNames.has(file.name.toLowerCase())) {
        toast.error("Doppelte Datei", {
          description: `${file.name} ist bereits vorhanden`,
        });
        return false;
      }
      return true;
    });
  };

  const processFiles = useCallback(
    (newFiles: File[]) => {
      const validFiles = newFiles.filter(validateFile);
      const uniqueFiles = filterDuplicates(validFiles, files);

      if (files.length + uniqueFiles.length > maxFiles) {
        toast.error("Zu viele Dateien", {
          description: `Maximal ${maxFiles} Dateien erlaubt`,
        });
        return;
      }

      const mcaFiles: McaFile[] = uniqueFiles.map((file) => ({
        file,
        id: `${file.name}-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      }));

      const updatedFiles = [...files, ...mcaFiles];
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);

      if (mcaFiles.length > 0) {
        toast.success("Dateien hinzugefügt", {
          description: `${mcaFiles.length} Datei(en) erfolgreich hinzugefügt`,
        });
      }
    },
    [files, maxFiles, onFilesChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    },
    [processFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      processFiles(selectedFiles);

      // Input-Wert zurücksetzen, um erneute Auswahl derselben Datei zu ermöglichen
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFiles]
  );

  const removeFile = useCallback(
    (id: string) => {
      const updatedFiles = files.filter((f) => f.id !== id);
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);

      toast.success("Datei entfernt", {
        description: "Die Datei wurde aus der Liste entfernt",
      });
    },
    [files, onFilesChange]
  );

  const clearAllFiles = useCallback(() => {
    setFiles([]);
    onFilesChange?.([]);

    toast.success("Alle Dateien gelöscht", {
      description: "Alle Dateien wurden entfernt",
    });
  }, [onFilesChange]);

  // Upload-Funktion, die extern aufgerufen werden kann
  const uploadFiles = useCallback(async (): Promise<boolean> => {
    if (files.length === 0) {
      toast.error("Keine Dateien zum Hochladen", {
        description: "Bitte wählen Sie zuerst Dateien aus",
      });
      return false;
    }

    setIsUploading(true);

    try {
      // Upload-Prozess simulieren - ersetzen Sie dies durch Ihre tatsächliche Upload-Logik
      const formData = new FormData();
      files.forEach((mcaFile) => {
        formData.append(mcaFile.file.name, mcaFile.file);
      });

      // Beispiel Upload-Anfrage - ersetzen Sie durch Ihren tatsächlichen Endpunkt
      const response = await fetch("/api/upload-mca", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      console.log("Upload result:", result);

      toast.success("Upload erfolgreich", {
        description: `${files.length} Datei(en) erfolgreich hochgeladen`,
      });

      // Dateien nach erfolgreichem Upload löschen
      setFiles([]);
      onFilesChange?.([]);
      refresh();

      return true;
    } catch {
      toast.error("Upload fehlgeschlagen", {
        description:
          "Fehler beim Hochladen der Dateien. Bitte versuchen Sie es erneut.",
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [files, onFilesChange]);

  // Upload-Funktion über Ref verfügbar machen oder zurückgeben
  const handleUpload = () => {
    uploadFiles();
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Dropzone */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer h-100",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25",
          "hover:border-primary/50 hover:bg-primary/5",
          "flex items-center justify-center"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <Upload
            className={cn(
              "h-12 w-12 mb-4",
              isDragOver ? "text-primary" : "text-muted-foreground"
            )}
          />
          <h3 className="text-lg font-semibold mb-2">
            Ziehe die .mca-Dateien hierher
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            oder klicke, um Dateien zu durchsuchen
          </p>
        </CardContent>
      </Card>

      {/* Versteckter Datei-Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".mca"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Dateiliste */}
      {files.length !== 0 && (
        <Card>
          <CardContent className="">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium">Ausgewählte Dateien</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFiles}
                className="text-destructive hover:text-destructive"
              >
                Alle löschen
              </Button>
            </div>

            <div className="space-y-2">
              {files.map((mcaFile) => (
                <div
                  key={mcaFile.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <File className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{mcaFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(mcaFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(mcaFile.id)}
                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload-Button */}
      {files.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="min-w-32"
          >
            {isUploading
              ? "Wird hochgeladen..."
              : `${files.length} Datei(en) hochladen`}
          </Button>
        </div>
      )}
    </div>
  );
}
