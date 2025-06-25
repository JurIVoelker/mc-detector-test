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
      <CardContent className="flex justify-between items-center">
        <span>{entity.data}</span>
        {/* <Button variant="ghost" size="icon" onClick={() => setSaved(!saved)}>
          <Bookmark
            className={`size-5`}
            fill={saved ? "currentColor" : "none"}
          />
        </Button> */}
      </CardContent>
    </Card>
  );
};

export default EntityCard;
