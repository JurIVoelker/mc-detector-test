"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Bookmark } from "lucide-react";
import { useState } from "react";

const Navigator = ({
  prevId,
  currentId,
  defaultSaved,
  nextId,
}: {
  prevId: number;
  currentId: number;
  defaultSaved: boolean;
  nextId: number;
}) => {
  const { push } = useRouter();

  const [isSaved, setIsSaved] = useState(defaultSaved);

  const handleSave = async () => {
    const body = JSON.stringify({
      entity: currentId,
      isSaved: !isSaved,
    });

    const res = await fetch(`/api/entity/save`, {
      method: "POST",
      body,
    });

    const data = await res.json();

    setIsSaved(data.isSaved);
  };

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
        <Button variant="outline" size="icon" onClick={handleSave}>
          {isSaved && <Bookmark fill="currentColor" />}
          {!isSaved && <Bookmark />}
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
