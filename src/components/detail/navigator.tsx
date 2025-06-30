"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Bookmark } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";

const Navigator = ({
  prevId,
  currentId,
  defaultSaved,
  regionId,
  nextId,
}: {
  prevId: number;
  currentId: number;
  defaultSaved: boolean;
  nextId: number;
  regionId: number | null;
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

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
      push(`/entity-detail/${prevId}`);
    } else if (
      event.key === "ArrowRight" ||
      event.key === "d" ||
      event.key === "D"
    ) {
      push(`/entity-detail/${nextId}`);
    } else if (
      event.key === "s" ||
      event.key === "S" ||
      event.key === " " ||
      event.key === "Enter"
    ) {
      handleSave();
    } else if (event.key === "Escape") {
      push(`/detail/${regionId}`);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevId, nextId, currentId, isSaved]);

  return (
    <div className="relative flex justify-center flex-1 w-auto">
      <div className="fixed bottom-4 flex gap-2">
        <Button
          variant="outline"
          onClick={() => push(`/entity-detail/${prevId}`)}
          disabled={prevId === currentId}
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
          disabled={nextId === currentId}
        >
          Nächstes
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
};

export default Navigator;
