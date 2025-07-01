"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { FoundBlocks } from "@/lib/executionQueue";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Block } from "./block";

const Entity3DPreview = ({
  data3d,
  rawPreview,
}: {
  data3d: FoundBlocks[];
  rawPreview?: boolean;
}) => {
  const blockData = data3d.map((blockId, index) => ({
    position: [
      (index % 16) - 8,
      Math.floor(index / 256) - 8, // Adjusted to fit a 16x16x16 cube
      (Math.floor(index / 16) % 16) - 8,
    ] as [number, number, number], // Explicitly type as [number, number, number]
    itemId: Number(blockId) || 0, // Convert blockId to a number, default to 0 if not present
  })) as {
    position: [number, number, number];
    itemId: number;
  }[];

  const [enableOpacity, setEnableOpacity] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (["h", "H", "o", "O"].includes(event.key)) {
      setEnableOpacity((prev) => !prev);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <div className="relative">
        <Canvas
          style={{ height: "800px", width: rawPreview ? "800px" : "100%" }}
          camera={{ position: rawPreview ? [0, 8, 16] : [16, 16, 16] }}
          onCreated={() => {
            setLoaded(true);
          }}
          className={cn(!loaded && "opacity-0")}
        >
          <ambientLight intensity={0.75} />
          <OrbitControls />
          <directionalLight position={[10, 10, 10]} castShadow intensity={4} />
          {blockData.map((block, index) => (
            <Block
              key={index}
              position={block.position}
              itemId={block.itemId}
              enableOpacity={enableOpacity}
            />
          ))}
        </Canvas>
        {!loaded && (
          <div
            className={cn(
              "w-[100%] h-[32px] relative top-[-216px] flex items-center justify-center"
            )}
          >
            <Loader2 className="animate-spin" />
          </div>
        )}
        {!rawPreview && (
          <Button
            onClick={() => setEnableOpacity(!enableOpacity)}
            className="absolute top-4 right-0"
            variant="outline"
          >
            {enableOpacity && <Eye />}
            {!enableOpacity && <EyeOff />}
            Durchsichtige Blöcke
          </Button>
        )}
      </div>
    </>
  );
};

export default Entity3DPreview;
