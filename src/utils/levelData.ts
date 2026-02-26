import { Level, ColorConfig, ContainerDef } from '@/types/game';

export const COLORS: Record<number, ColorConfig> = {
  3: { layer: 3, hex: '#ff3355', name: 'red', glow: 'rgba(255,51,85,0.5)' },
  2: { layer: 2, hex: '#8b5cf6', name: 'purple', glow: 'rgba(139,92,246,0.5)' },
  1: { layer: 1, hex: '#fbbf24', name: 'gold', glow: 'rgba(251,191,36,0.5)' },
};

export const HEART_MAP: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0],
  [0, 3, 3, 3, 3, 3, 0, 0, 0, 3, 3, 3, 3, 3, 0],
  [3, 3, 3, 2, 3, 3, 3, 0, 3, 3, 3, 2, 3, 3, 3],
  [3, 3, 2, 2, 2, 3, 3, 0, 3, 3, 2, 2, 2, 3, 3],
  [3, 3, 3, 2, 2, 2, 3, 3, 3, 2, 2, 2, 3, 3, 3],
  [0, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 0],
  [0, 0, 3, 3, 3, 2, 2, 1, 2, 2, 3, 3, 3, 0, 0],
  [0, 0, 0, 3, 3, 3, 2, 1, 2, 3, 3, 3, 0, 0, 0],
  [0, 0, 0, 0, 3, 3, 3, 1, 3, 3, 3, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

/*
 * Container layout for the heart:
 *   C1 Red Left Lobe  (21 cells) — upper-left red
 *   C2 Red Right Lobe (21 cells) — upper-right red
 *   C3 Red Mid        (21 cells) — middle red (rows 5-8)
 *   C4 Red Tip        (15 cells) — bottom red (rows 9-12)
 *   C5 Purple Left    ( 7 cells) — purple inside left lobe
 *   C6 Purple Right   ( 7 cells) — purple inside right lobe
 *   C7 Purple Center  (13 cells) — central purple band
 *   C8 Gold           ( 3 cells) — gold core
 */
export const HEART_CONTAINER_MAP: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 0, 0, 2, 2, 2, 2, 2, 0],
  [1, 1, 1, 5, 1, 1, 1, 0, 2, 2, 2, 6, 2, 2, 2],
  [1, 1, 5, 5, 5, 1, 1, 0, 2, 2, 6, 6, 6, 2, 2],
  [1, 1, 1, 5, 5, 5, 3, 3, 3, 6, 6, 6, 2, 2, 2],
  [0, 3, 3, 3, 7, 7, 7, 7, 7, 7, 7, 3, 3, 3, 0],
  [0, 0, 3, 3, 3, 7, 7, 8, 7, 7, 3, 3, 3, 0, 0],
  [0, 0, 0, 3, 3, 3, 7, 8, 7, 3, 3, 3, 0, 0, 0],
  [0, 0, 0, 0, 4, 4, 4, 8, 4, 4, 4, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export const HEART_CONTAINERS: ContainerDef[] = [
  { id: 1, layer: 3, name: 'Red Left' },
  { id: 2, layer: 3, name: 'Red Right' },
  { id: 3, layer: 3, name: 'Red Mid' },
  { id: 4, layer: 3, name: 'Red Tip' },
  { id: 5, layer: 2, name: 'Purple Left' },
  { id: 6, layer: 2, name: 'Purple Right' },
  { id: 7, layer: 2, name: 'Purple Center' },
  { id: 8, layer: 1, name: 'Gold' },
];

export const HEART_CONTAINER_DEPS: Record<number, number[]> = {
  1: [],
  2: [],
  3: [],
  4: [],
  5: [1],
  6: [2],
  7: [3],
  8: [4, 7],
};

export const LEVELS: Level[] = [
  {
    name: 'Heart',
    gridSize: 15,
    pixelMap: HEART_MAP,
    containerMap: HEART_CONTAINER_MAP,
    containers: HEART_CONTAINERS,
    containerDeps: HEART_CONTAINER_DEPS,
    colors: COLORS,
    capacity: 1,
    layerOrder: [3, 2, 1],
  },
];
