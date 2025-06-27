import {
  HIDDEN_TEXTURES,
  RENDER_ITEM_PROPERTIES,
} from "@/lib/renderItemProperties";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three/webgpu";
export function Block({
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
