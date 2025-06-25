"use client";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TextureLoader } from "three";
import * as THREE from "three/webgpu";
import { useState } from "react";
import { Button } from "../ui/button";
import { FoundBlockSphere } from "@/lib/executionQueue";
import {
  HIDDEN_TEXTURES,
  RENDER_ITEM_PROPERTIES,
} from "@/lib/renderItemProperties";

const Entity3DPreview = ({ data3d }: { data3d: FoundBlockSphere[] }) => {
  const blockData = data3d.map((block) => ({
    position: block.local,
    itemId: block.item_id || 0, // Default to 0 if item_id is not present
  }));

  const [enableOpacity, setEnableOpacity] = useState(false);

  return (
    <>
      <Canvas
        style={{ height: "400px", width: "100%" }}
        camera={{ position: [0, 0, 8] }}
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
      <Button onClick={() => setEnableOpacity(!enableOpacity)}>Opacity</Button>
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
