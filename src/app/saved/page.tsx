import ContentLayout from "@/components/content-layout";
import EntityCard from "@/components/detail/entity-card";
import Sidebar from "@/components/sidebar/sidebar";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SavedPage = async () => {
  const savedEntities = await prisma.foundEntities.findMany({
    where: { isSaved: true },
    orderBy: { id: "asc" },
  });

  return (
    <div className="flex h-full w-full gap-4">
      <Sidebar />
      <ContentLayout>
        <h1 className="text-3xl font-semibold mb-6">Gespeicherte Orte</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {savedEntities.map((entity) => (
            <EntityCard key={entity.id} entity={entity} />
          ))}
        </div>
      </ContentLayout>
    </div>
  );
};

export default SavedPage;
