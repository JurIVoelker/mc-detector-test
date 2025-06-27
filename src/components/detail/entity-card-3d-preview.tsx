"use client";
import { Canvas } from "@react-three/fiber";

import { useState } from "react";
import { FoundBlockSphere } from "@/lib/executionQueue";

import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { Block } from "./block";

const canvasSize = "150px";

const EntityCard3DPreview = ({ data3d }: { data3d: FoundBlockSphere[] }) => {
  const blockData = data3d.map((block) => ({
    position: block.local,
    itemId: block.item_id || 0, // Default to 0 if item_id is not present
  }));

  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <div className="relative flex items-center justify-center">
        <Canvas
          style={{ height: canvasSize, width: "200px" }}
          camera={{ position: [0, 2, 6] }}
          onCreated={() => {
            setLoaded(true);
          }}
          className={cn(!loaded && "opacity-0")}
        >
          <ambientLight intensity={0.75} />
          <directionalLight position={[10, 10, 10]} castShadow intensity={4} />
          {blockData.map((block, index) => (
            <Block
              key={index}
              position={block.position}
              itemId={block.itemId}
              enableOpacity={false}
            />
          ))}
        </Canvas>
        {!loaded && (
          <Skeleton
            className={`h-[${canvasSize}] w-full absolute top-0 flex items-center justify-center`}
          />
        )}
      </div>
    </>
  );
};

export default EntityCard3DPreview;
