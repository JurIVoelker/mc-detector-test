"use client";
import { McRegion } from "@prisma/client";
import { Button, buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { Check, Globe, Loader2, Minus, Play } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const SidebarMcRegion = ({
  mcRegion,
  className,
  ...props
}: {
  mcRegion: McRegion;
  className?: string;
}) => {
  const [state, setState] = useState(mcRegion.status || "unprocessed");

  const handleProcess = async () => {
    setState("queued");
    const evtSource = new EventSource(
      "/api/process-mc-region?regionId=" + mcRegion.id
    );
    evtSource.addEventListener("message", (event) => {
      const data = event.data;
      if (data === "processing") {
        setState("processing");
      } else if (data === "processed") {
        setState("processed");
        evtSource.close();
      }
      console.log("Event received:", data);
    });
    evtSource.onerror = (err) => {
      console.error("EventSource failed:", err);
    };
  };

  const isUnprocessed = state === "unprocessed";
  const isProcessing = state === "processing";
  const isProcessed = state === "processed";
  const isQueued = state === "queued";
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
          buttonVariants({ variant: "ghost" }),
          "flex justify-start cursor-pointer flex-1",
          (isProcessing || isQueued) && "opacity-50"
        )}
      >
        <Globe className="text-muted-foreground " />
        {mcRegion.name}
      </Link>

      <Button
        variant="ghost"
        className={cn("opacity-0", isProcessing && "opacity-100")}
        size="icon"
        disabled={isProcessing || isQueued}
        onClick={handleProcess}
        style={isProcessed || isQueued ? { opacity: 1 } : {}}
      >
        {isUnprocessed && <Play />}
        {isQueued && <Minus className="text-muted-foreground" />}
        {isProcessing && (
          <Loader2 className="animate-spin text-muted-foreground" />
        )}
        {isProcessed && <Check className="text-emerald-600" />}
      </Button>
    </div>
  );
};

export default SidebarMcRegion;
