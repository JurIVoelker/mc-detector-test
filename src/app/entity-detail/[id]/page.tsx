import ContentLayout from "@/components/content-layout";
import CopyText from "@/components/copy-text";
import Entity3DPreview from "@/components/detail/entity-3d-preview";
import Navigator from "@/components/detail/navigator";
import Sidebar from "@/components/sidebar/sidebar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FoundBlockSphere } from "@/lib/executionQueue";
import { prisma } from "@/lib/prisma";
import { X } from "lucide-react";
import Link from "next/link";

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

  const allEntities = await prisma.foundEntities.findMany({
    where: { regionId: entity.regionId },
    orderBy: { id: "asc" },
  });

  const entityIndex = allEntities.findIndex((e) => e.id === entity.id);
  const prevIndex =
    entityIndex === 0 ? allEntities.length - 1 : entityIndex - 1;
  const nextIndex =
    entityIndex === allEntities.length - 1 ? 0 : entityIndex + 1;

  const entityTypeTranslations: Record<string, string> = {
    chest: "Doppelkiste",
    shulker_box: "Shulker Box",
  };

  return (
    <div className="flex h-full w-full">
      <Sidebar activeRegion={entity.regionId} />
      <ContentLayout className="relative">
        <h1 className="text-3xl font-semibold mb-6 flex items-center gap-2 justify-between">
          {entityTypeTranslations[entity.type] || entity.type}{" "}
          <span className="text-lg bg-slate-100 text-slate-400 font-normal px-2 rounded-2xl">
            Id: {entity.id}
          </span>
          <Link
            href={`/detail/${entity.regionId}`}
            className={buttonVariants({ variant: "secondary" })}
          >
            <X /> Zurück zur Regionsübersicht
          </Link>
        </h1>

        <Card>
          <CardContent className="w-full flex flex-col gap-4 md:flex-row">
            <CopyText
              value={entity.data}
              label="Koordinaten kopieren"
              className="w-full"
            />
            <CopyText
              value={"/tp " + entity.data}
              className="w-full"
              label="TP-Command kopieren"
            />
          </CardContent>
        </Card>
        {entity.data3d && (
          <Entity3DPreview
            data3d={JSON.parse(entity.data3d) as FoundBlockSphere[]}
          />
        )}
        <Navigator
          prevId={allEntities[prevIndex].id}
          nextId={allEntities[nextIndex].id}
          currentId={entity.id}
          defaultSaved={entity.isSaved}
          regionId={entity.regionId}
        />
      </ContentLayout>
    </div>
  );
};

export default DetailsPage;
