"use client";
import { McRegion } from "@prisma/client";
import SidebarMcRegion from "./sidebar-mc-region";
import { useEffect, useState } from "react";
import { Status } from "@/types/types";
import { Button } from "../ui/button";
import { Eye, EyeOff } from "lucide-react";
import { usePathname } from "next/navigation";

const SidebarMcRegionsList = ({ mcRegions }: { mcRegions: McRegion[] }) => {
  const [regionsStatus, setRegionsStatus] = useState(
    mcRegions.map((region) => ({
      id: region.id,
      status: region.status as Status,
    }))
  );

  const pathname = usePathname();
  const currentId = pathname.startsWith("/detail/")
    ? parseInt(pathname.split("/").pop() || "") || null
    : null;

  const [processedHidden, setFinishedHidden] = useState(false);

  const queueItem = (regionId: number) => {
    setRegionsStatus((prevRegionsStatus) => {
      const filteredRegions = prevRegionsStatus.filter(
        (region) => regionId !== region.id
      );
      return [...filteredRegions, { id: regionId, status: "queued" as Status }];
    });
  };

  useEffect(() => {
    const evtSource = new EventSource("/api/sync-progress");
    evtSource.addEventListener("message", (event) => {
      const data = event.data;
      const parsedData = JSON.parse(data);
      setRegionsStatus(parsedData);
    });

    return () => {
      evtSource.close();
    };
  }, []);

  let filteredMcRegions = [];
  if (processedHidden) {
    filteredMcRegions = mcRegions.filter(
      (region) => region.status !== "processed"
    );
  } else {
    filteredMcRegions = mcRegions;
  }

  return (
    <div className="space-y-1">
      <Button
        variant="secondary"
        className="flex justify-start w-full"
        onClick={() => setFinishedHidden(!processedHidden)}
      >
        {!processedHidden && (
          <>
            <Eye className="text-muted-foreground" />
            Fertige Sichtbar
          </>
        )}
        {processedHidden && (
          <>
            <EyeOff className="text-muted-foreground" />
            Fertige Versteckt
          </>
        )}
      </Button>
      {filteredMcRegions.map((region) => (
        <SidebarMcRegion
          isActive={currentId === region.id}
          mcRegion={region}
          key={region.id}
          queueItem={queueItem}
          status={(function getStatus() {
            const queuedStatus = regionsStatus.find(
              (regionStatus) => regionStatus.id === region.id
            );
            if (queuedStatus) return queuedStatus.status as Status;
            return region.status as Status;
          })()}
        />
      ))}
    </div>
  );
};

export default SidebarMcRegionsList;
