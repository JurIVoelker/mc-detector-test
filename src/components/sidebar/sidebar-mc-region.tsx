"use client";
import { McRegion } from "@prisma/client";
import { Button, buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { Check, Globe, Loader2, Minus, Play, X } from "lucide-react";
import Link from "next/link";
import { ConfirmRescanDialog } from "./confirm-rescan-dialog";
import { Status } from "@/types/types";

const SidebarMcRegion = ({
  isActive,
  mcRegion,
  className,
  queueItem,
  status = "unprocessed",
  ...props
}: {
  isActive?: boolean;
  mcRegion: McRegion;
  className?: string;
  status?: Status;
  queueItem: (regionId: number) => void;
}) => {
  const handleProcess = async () => {
    queueItem(mcRegion.id);
    const res = await fetch(`/api/process-mc-region?regionId=${mcRegion.id}`, {
      method: "GET",
    });

    if (!res.ok) {
      console.error("Failed to process region:", mcRegion.id);
      return;
    }
  };

  const isUnprocessed = status === "unprocessed";
  const isProcessing = status === "processing";
  const isProcessed = status === "processed";
  const isQueued = status === "queued";
  const isFailed = status === "error";
  return (
    <div
      className={cn(
        "flex items-center justify-start w-full hover-show-second-button",
        className
      )}
      {...props}
    >
      <Link
        href={`/detail/${mcRegion.id}`}
        className={cn(
          buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
          "flex justify-start cursor-pointer flex-1",
          (isProcessing || isQueued) && "opacity-50",
          "mr-1"
        )}
      >
        <Globe className="text-muted-foreground " />
        {mcRegion.name}
      </Link>

      {!isProcessed && (
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn("opacity-0", isProcessing && "opacity-100")}
          size="icon"
          disabled={isProcessing || isQueued}
          onClick={handleProcess}
          style={isProcessed || isQueued || isFailed ? { opacity: 1 } : {}}
        >
          {isUnprocessed && <Play />}
          {isQueued && <Minus className="text-muted-foreground" />}
          {isProcessing && (
            <Loader2 className="animate-spin text-muted-foreground" />
          )}
          {isProcessed && <Check className="text-emerald-600" />}
          {isFailed && <X className="text-red-600" />}
        </Button>
      )}
      {isProcessed && (
        <ConfirmRescanDialog onConfirm={handleProcess} isActive={isActive} />
      )}
    </div>
  );
};

export default SidebarMcRegion;
