import Entity3DPreview from "@/components/detail/entity-3d-preview";
import { FoundBlocks } from "@/lib/executionQueue";
import { prisma } from "@/lib/prisma";

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

  const entity = await prisma.foundEntities.findUnique({
    where: { id: parseInt(id) },
  });

  if (!entity) {
    return <div>Region not found</div>;
  }

  const data3d = JSON.parse(entity.data3d || "[]") as FoundBlocks[];

  const filteredData3d = data3d.map((blockId, index, array) => {
    const neighborIds = [
      array[index - 1],
      array[index + 1],
      array[index - 16],
      array[index + 16],
      array[index - 256],
      array[index + 256],
    ];

    const isEdgeBlock =
      index % 16 === 0 ||
      index % 16 === 15 ||
      Math.floor(index / 16) % 16 === 0 ||
      Math.floor(index / 16) % 16 === 15 ||
      Math.floor(index / 256) % 16 === 0 ||
      Math.floor(index / 256) % 16 === 15;

    if (neighborIds.includes(0) || isEdgeBlock) {
      return blockId;
    }
    return 0;
  });

  return (
    <div className="flex h-full min-h-screen w-full items-start justify-center">
      {entity.data3d && (
        <Entity3DPreview data3d={filteredData3d as FoundBlocks[]} rawPreview />
      )}
    </div>
  );
};

export default DetailsPage;
