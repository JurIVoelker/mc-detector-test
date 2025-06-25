export const HIDDEN_TEXTURES = [0, 50, 63, 55, 65, 68];

const unmodifiedTextures = [1, 2, 3, 4, 61, 154, 152];
const shulkerRange = [219, 234];

export const RENDER_ITEM_PROPERTIES: Record<
  number,
  {
    texture: string | number;
    geometry?: [number, number, number];
    positionOffset?: [number, number, number];
    noOpacity?: boolean;
  }
> = {
  ...Object.fromEntries(unmodifiedTextures.map((n) => [n, { texture: n }])),
  44: {
    geometry: [1, 0.5, 1],
    texture: 1,
    positionOffset: [0, -0.25, 0],
  },
  54: {
    geometry: [0.9, 0.9, 0.9],
    texture: 54,
    positionOffset: [0, -0.05, 0],
    noOpacity: true,
  },
  146: {
    geometry: [0.9, 0.9, 0.9],
    texture: 54,
    positionOffset: [0, -0.05, 0],
    noOpacity: true,
  },
  149: {
    geometry: [1, 0.2, 1],
    texture: 149,
    positionOffset: [0, -0.4, 0],
  },
  ...Object.fromEntries(
    Array.from({ length: shulkerRange[1] - shulkerRange[0] + 1 }, (_, i) => [
      shulkerRange[0] + i,
      {
        geometry: [1, 1, 1],
        texture: "219-234",
      },
    ])
  ),
};
