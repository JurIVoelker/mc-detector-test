import { prisma } from "@/lib/prisma";
import { Bookmark, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";
import { Separator } from "../ui/separator";
import Link from "next/link";
import { ConfirmScannAllDialog } from "./confirm-scan-all-dialog";
import SidebarMcRegionsList from "./sidebar-mc-regions-list";
import { ConfirmDeleteAllDialog } from "./confirm-delete-all";

const Sidebar = async ({ activeRegion }: { activeRegion?: number | null }) => {
  const mcRegions = await prisma.mcRegion.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div
      className="h-full w-70 min-h-screen p-4 overflow-y-scroll border-r pt-8 flex flex-col shrink-0 max-h-screen fixed z-10"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <Link
        href={`/add-region`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "w-full flex items-center justify-start space-x-2 mb-1"
        )}
      >
        <Plus className="text-muted-foreground" fill="currentColor" />
        Region hinzufügen
      </Link>
      <Link
        href={`/saved`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "w-full flex items-center justify-start space-x-2"
        )}
      >
        <Bookmark className="text-muted-foreground" fill="currentColor" />
        Gespeichert
      </Link>
      <Separator className="my-2" />
      <ConfirmScannAllDialog />
      <ConfirmDeleteAllDialog />
      <SidebarMcRegionsList mcRegions={mcRegions} activeRegion={activeRegion} />

      {mcRegions.length === 0 && (
        <div className="text-muted-foreground text-sm">
          No regions found. Please add a region to get started.
        </div>
      )}
    </div>
  );
};

export default Sidebar;
