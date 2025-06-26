"use client";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TextureLoader } from "three";
import * as THREE from "three/webgpu";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { FoundBlockSphere } from "@/lib/executionQueue";
import {
  HIDDEN_TEXTURES,
  RENDER_ITEM_PROPERTIES,
} from "@/lib/renderItemProperties";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const Entity3DPreview = ({ data3d }: { data3d: FoundBlockSphere[] }) => {
  const blockData = data3d.map((block) => ({
    position: block.local,
    itemId: block.item_id || 0, // Default to 0 if item_id is not present
  }));

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
          style={{ height: "400px", width: "100%" }}
          camera={{ position: [0, 0, 8] }}
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
        <Button
          onClick={() => setEnableOpacity(!enableOpacity)}
          className="absolute top-4 right-0"
          variant="outline"
        >
          {enableOpacity && <Eye />}
          {!enableOpacity && <EyeOff />}
          Durchsichtige Blöcke
        </Button>
      </div>
    </>
  );
};

export default Entity3DPreview;

function Block({
  rotation = [0, 0, 0],
  position = [0, 0, 0],
  itemId = 0,
  enableOpacity = false,
}: {
  rotation?: [number, number, number];
  position?: [number, number, number];
  itemId: number;
  enableOpacity?: boolean;
}) {
  const geometry = RENDER_ITEM_PROPERTIES[itemId]?.geometry || [1, 1, 1];
  const positionOffset = RENDER_ITEM_PROPERTIES[itemId]?.positionOffset || [
    0, 0, 0,
  ];
  if (
    !RENDER_ITEM_PROPERTIES[itemId]?.texture &&
    !HIDDEN_TEXTURES.includes(itemId)
  ) {
    console.warn(`No texture defined for itemId ${itemId}`);
  }
  const texture = RENDER_ITEM_PROPERTIES[itemId]?.texture
    ? "/textures/" + RENDER_ITEM_PROPERTIES[itemId]?.texture + ".png"
    : "/textures/default.png";
  const opacity =
    enableOpacity && !RENDER_ITEM_PROPERTIES[itemId]?.noOpacity ? 0.3 : 1;

  const colorMap = useLoader(TextureLoader, texture);

  if (colorMap) {
    colorMap.magFilter = THREE.NearestFilter;
    colorMap.minFilter = THREE.NearestFilter;
  }

  if (HIDDEN_TEXTURES.includes(itemId)) {
    return null;
  }

  return (
    <mesh
      rotation={rotation}
      position={
        position.map(
          (coord, index) => coord + (positionOffset[index] || 0)
        ) as [number, number, number]
      }
    >
      <boxGeometry args={geometry} />
      <meshStandardMaterial map={colorMap} transparent opacity={opacity} />
    </mesh>
  );
}
