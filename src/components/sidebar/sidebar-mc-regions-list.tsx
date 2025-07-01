"use client";
import { McRegion } from "@prisma/client";
import SidebarMcRegion from "./sidebar-mc-region";
import { useEffect, useState } from "react";
import { Status } from "@/types/types";
import { Button } from "../ui/button";
import { Eye, EyeOff, SortDesc } from "lucide-react";
import { usePathname } from "next/navigation";
import { Separator } from "../ui/separator";
import { useMainStore } from "@/store/main-store";

const SidebarMcRegionsList = ({
  mcRegions,
  activeRegion,
}: {
  mcRegions: McRegion[];
  activeRegion?: number | null;
}) => {
  const [regionsStatus, setRegionsStatus] = useState(
    mcRegions.map((region) => ({
      id: region.id,
      status: region.status as Status,
    }))
  );

  const { finishedHidden, sortingType, toggleSortingType, setFinishedHidden } =
    useMainStore();

  const pathname = usePathname();
  const currentId = pathname.startsWith("/detail/")
    ? parseInt(pathname.split("/").pop() || "") || null
    : null;

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
  if (finishedHidden) {
    filteredMcRegions = mcRegions.filter(
      (region) => region.status !== "processed"
    );
  } else {
    filteredMcRegions = mcRegions;
  }

  filteredMcRegions.sort((a, b) => {
    if (sortingType === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortingType === "status") {
      return a.status.localeCompare(b.status);
    } else if (sortingType === "createdAt") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortingType === "updatedAt") {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    return 0;
  });

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        className="flex justify-start w-full"
        onClick={() => setFinishedHidden(!finishedHidden)}
      >
        {!finishedHidden && (
          <>
            <Eye className="text-muted-foreground" />
            Fertige Sichtbar
          </>
        )}
        {finishedHidden && (
          <>
            <EyeOff className="text-muted-foreground" />
            Fertige Versteckt
          </>
        )}
      </Button>
      <Button
        variant="ghost"
        className="flex justify-start w-full"
        onClick={toggleSortingType}
      >
        <SortDesc className="text-muted-foreground" />
        {sortingType === "name" && (
          <>
            <span>Name</span>
          </>
        )}
        {sortingType === "status" && (
          <>
            <span>Status</span>
          </>
        )}
        {sortingType === "createdAt" && (
          <>
            <span>Erstellungsdatum</span>
          </>
        )}
        {sortingType === "updatedAt" && (
          <>
            <span>Aktualisierungsdatum</span>
          </>
        )}
      </Button>
      <Separator className="my-2" />
      {filteredMcRegions.map((region) => (
        <SidebarMcRegion
          isActive={currentId === region.id || activeRegion === region.id}
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
