"use client";
import { Skeleton } from "../ui/skeleton";

const canvasSize = "150px";

const EntityCard3DPreview = ({}) => {
  return (
    <>
      <div className="relative flex items-center justify-center">
        <Skeleton
          className={`h-[${canvasSize}] w-full absolute top-0 flex items-center justify-center`}
        />
      </div>
    </>
  );
};

export default EntityCard3DPreview;
