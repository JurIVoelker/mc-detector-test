"use client";
import { McRegion } from "@prisma/client";
import SidebarMcRegion from "./sidebar-mc-region";
import { useEffect, useState } from "react";
import { Status } from "@/types/types";

const SidebarMcRegionsList = ({ mcRegions }: { mcRegions: McRegion[] }) => {
  const [regionsStatus, setRegionsStatus] = useState(
    mcRegions.map((region) => ({
      id: region.id,
      status: region.status as Status,
    }))
  );

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

  return (
    <div>
      {mcRegions.map((region) => (
        <SidebarMcRegion
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
