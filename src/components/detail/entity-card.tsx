"use client";
import { FoundEntities } from "@prisma/client";
import { Card, CardContent } from "../ui/card";
import { useRouter } from "next/navigation";
import EntityCard3DPreview from "./entity-card-3d-preview";
import { FoundBlockSphere } from "@/lib/executionQueue";

const EntityCard = ({ entity, ...props }: { entity: FoundEntities }) => {
  const { push } = useRouter();
  return (
    <Card
      {...props}
      onClick={() => push(`/entity-detail/${entity.id}`)}
      className="cursor-pointer hover:opacity-60 transition-opacity"
    >
      {entity.data3d && entity.data3d.length > 0 && (
        <EntityCard3DPreview
          data3d={JSON.parse(entity.data3d) as FoundBlockSphere[]}
        />
      )}
      <CardContent className="flex flex-col justify-between items-center">
        <span>{entity.data}</span>
      </CardContent>
    </Card>
  );
};

export default EntityCard;
