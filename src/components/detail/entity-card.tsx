"use client";
import { FoundEntities } from "@prisma/client";
import { Card, CardContent } from "../ui/card";
import { useRouter } from "next/navigation";

const EntityCard = ({ entity, ...props }: { entity: FoundEntities }) => {
  const { push } = useRouter();
  return (
    <Card
      {...props}
      onClick={() => push(`/entity-detail/${entity.id}`)}
      className="cursor-pointer hover:opacity-60 transition-opacity"
    >
      <img
        src={`/api/get-preview-image?image=${entity.regionId}-${entity.id}.png`}
        alt={entity.data}
      />
      <CardContent className="flex flex-col justify-between items-center">
        <span>{entity.data}</span>
      </CardContent>
    </Card>
  );
};

export default EntityCard;
