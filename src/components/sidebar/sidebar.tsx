import { prisma } from "@/lib/prisma";
import SidebarMcRegion from "./sidebar-mc-region";
import { Bookmark, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";
import { Separator } from "../ui/separator";
import Link from "next/link";

const Sidebar = async () => {
  const mcRegions = await prisma.mcRegion.findMany();
  return (
    <div
      className="h-full w-full max-w-3xs min-h-screen p-4 overflow-y-scroll border-r pt-8 flex flex-col gap-2"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <Link
        href={`/`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "w-full flex items-center justify-start space-x-2"
        )}
      >
        <Home className="text-muted-foreground" />
        Home
      </Link>
      <Link
        href={`/`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "w-full flex items-center justify-start space-x-2"
        )}
      >
        <Bookmark className="text-muted-foreground" fill="currentColor" />
        Gespeichert
      </Link>
      <Separator />
      {mcRegions.map((region) => (
        <SidebarMcRegion mcRegion={region} key={region.id} />
      ))}
      {mcRegions.length === 0 && (
        <div className="text-muted-foreground text-sm">
          No regions found. Please add a region to get started.
        </div>
      )}
    </div>
  );
};

export default Sidebar;
