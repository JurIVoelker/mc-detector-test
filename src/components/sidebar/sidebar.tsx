import { prisma } from "@/lib/prisma";
import { Bookmark, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";
import { Separator } from "../ui/separator";
import Link from "next/link";
import { ConfirmScannAllDialog } from "./confirm-scan-all-dialog";
import SidebarMcRegionsList from "./sidebar-mc-regions-list";

const Sidebar = async () => {
  const mcRegions = await prisma.mcRegion.findMany();
  return (
    <div
      className="h-full w-70 min-h-screen p-4 overflow-y-scroll border-r pt-8 flex flex-col gap-2 shrink-0"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
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
      <Link
        href={`/add-region`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "w-full flex items-center justify-start space-x-2"
        )}
      >
        <Plus className="text-muted-foreground" fill="currentColor" />
        Region hinzufügen
      </Link>
      <ConfirmScannAllDialog />
      <Separator />
      <SidebarMcRegionsList mcRegions={mcRegions} />

      {mcRegions.length === 0 && (
        <div className="text-muted-foreground text-sm">
          No regions found. Please add a region to get started.
        </div>
      )}
    </div>
  );
};

export default Sidebar;
