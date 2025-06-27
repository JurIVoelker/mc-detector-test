import ContentLayout from "@/components/content-layout";
import EntityCard from "@/components/detail/entity-card";
import Sidebar from "@/components/sidebar/sidebar";
import { prisma } from "@/lib/prisma";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

const DetailsPage = async ({
  params,
}: {
  params: Promise<{
    id: string | undefined;
  }>;
}) => {
  const { id } = await params;

  if (!id || Array.isArray(id)) {
    return <div>Invalid ID</div>;
  }

  const mcRegion = await prisma.mcRegion.findUnique({
    where: { id: parseInt(id) },
    include: {
      entities: true, // Include found entities if needed
    },
  });

  if (!mcRegion) {
    return <div>Region not found</div>;
  }

  return (
    <div className="flex h-full w-full relative">
      <Sidebar />
      <ContentLayout>
        <h1 className="text-3xl font-semibold mb-6">{mcRegion.name}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {mcRegion.entities.map((entity) => (
            <EntityCard key={entity.id} entity={entity} />
          ))}
        </div>
        {mcRegion.entities.length === 0 && (
          <div>
            {mcRegion.status === "unprocessed" && (
              <div className="text-muted-foreground">
                Analyse noch nicht gestartet
              </div>
            )}
            {mcRegion.status === "processing" && (
              <div className="text-muted-foreground flex items-center gap-2">
                Analyse läuft <Loader2 className="animate-spin size-4" />
              </div>
            )}
            {mcRegion.status === "processed" && (
              <div className="text-muted-foreground">
                Keine Entities gefunden
              </div>
            )}
            {mcRegion.status === "queued" && (
              <div className="text-muted-foreground">
                Analyse in der Warteschlange
              </div>
            )}
          </div>
        )}
      </ContentLayout>
    </div>
  );
};

export async function generateStaticParams() {
  const mcRegions = await prisma.mcRegion.findMany({
    select: { id: true },
  });

  return mcRegions.map((region) => ({
    id: region.id.toString(),
  }));
}

export default DetailsPage;
