import ContentLayout from "@/components/content-layout";
import EntityCard from "@/components/detail/entity-card";
import Sidebar from "@/components/sidebar/sidebar";
import { prisma } from "@/lib/prisma";

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
    <div className="flex h-full w-full gap-4">
      <Sidebar />
      <ContentLayout>
        <h1 className="text-3xl font-semibold mb-6">{mcRegion.name}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {mcRegion.entities.map((entity) => (
            <EntityCard key={entity.id} entity={entity} />
          ))}
        </div>
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
