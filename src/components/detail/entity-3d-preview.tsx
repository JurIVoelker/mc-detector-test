"use client";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TextureLoader } from "three";
import * as THREE from "three/webgpu";
import { useState } from "react";
import { Button } from "../ui/button";

const Entity3DPreview = () => {
  const blockData: { position: [number, number, number]; itemId: number }[] = [
    { position: [0, 0, 0], itemId: 0 },
    { position: [1, 0, 0], itemId: 54 },
    { position: [0, 0, 0], itemId: 54 },
    { position: [0, -1, 0], itemId: 3 },
    { position: [1, -1, 0], itemId: 3 },
    { position: [-1, -1, 0], itemId: 3 },
    { position: [2, -1, 0], itemId: 3 },
    { position: [0, 1, 0], itemId: 44 },
  ];

  const [enableOpacity, setEnableOpacity] = useState(false);

  return (
    <>
      <Canvas style={{ height: "400px", width: "100%" }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />
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
  const propertiesMap: Record<
    number,
    {
      texture: string | number;
      geometry?: [number, number, number];
      positionOffset?: [number, number, number];
      opacity?: number;
    }
  > = {
    54: {
      geometry: [0.9, 0.9, 0.9],
      texture: 54,
      positionOffset: [0, -0.05, 0],
    },
    44: {
      geometry: [1, 0.5, 1],
      texture: 1,
      positionOffset: [0, -0.25, 0],
      opacity: 0.5,
    },
    3: {
      texture: 3,
      opacity: 0.5,
    },
  };

  const geometry = propertiesMap[itemId]?.geometry || [1, 1, 1];
  const positionOffset = propertiesMap[itemId]?.positionOffset || [0, 0, 0];
  const texture = propertiesMap[itemId]?.texture
    ? "/textures/" + propertiesMap[itemId]?.texture + ".png"
    : "/textures/default.png";
  const opacity = enableOpacity ? propertiesMap[itemId]?.opacity ?? 1 : 1;

  const colorMap = useLoader(TextureLoader, texture);

  if (colorMap) {
    colorMap.magFilter = THREE.NearestFilter;
    colorMap.minFilter = THREE.NearestFilter;
  }

  if (itemId === 0) {
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
