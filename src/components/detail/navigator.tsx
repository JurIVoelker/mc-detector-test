"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Bookmark } from "lucide-react";

const Navigator = ({ prevId, nextId }: { prevId: number; nextId: number }) => {
  const { push } = useRouter();
  return (
    <div className="relative flex justify-center flex-1 w-auto">
      <div className="fixed bottom-4 flex gap-2">
        <Button
          variant="outline"
          onClick={() => push(`/entity-detail/${prevId}`)}
        >
          <ArrowLeft />
          Vorheriges
        </Button>
        <Button variant="outline" size="icon">
          <Bookmark />
        </Button>
        <Button
          variant="outline"
          onClick={() => push(`/entity-detail/${nextId}`)}
        >
          Nächstes
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
};

export default Navigator;
