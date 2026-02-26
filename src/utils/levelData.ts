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
 * Container layout for the heart (10 containers):
 *   C1  Red Left Lobe   (21) — upper-left red, rows 1-5
 *   C2  Red Right Lobe  (21) — upper-right red, rows 1-5
 *   C3  Red Bridge      ( 3) — 3 center cells connecting the lobes (row 5)
 *   C4  Red Tip         (15) — bottom red, rows 9-12
 *   C5  Red Left Flank  ( 9) — left-side red, rows 6-8
 *   C6  Red Right Flank ( 9) — right-side red, rows 6-8
 *   C7  Purple Left     ( 7) — purple inside left lobe
 *   C8  Purple Right    ( 7) — purple inside right lobe
 *   C9  Purple Center   (13) — central purple band
 *   C10 Gold            ( 3) — gold core
 */
export const HEART_CONTAINER_MAP: number[][] = [
  [ 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [ 0,  0,  1,  1,  1,  0,  0,  0,  0,  0,  2,  2,  2,  0,  0],
  [ 0,  1,  1,  1,  1,  1,  0,  0,  0,  2,  2,  2,  2,  2,  0],
  [ 1,  1,  1,  7,  1,  1,  1,  0,  2,  2,  2,  8,  2,  2,  2],
  [ 1,  1,  7,  7,  7,  1,  1,  0,  2,  2,  8,  8,  8,  2,  2],
  [ 1,  1,  1,  7,  7,  7,  3,  3,  3,  8,  8,  8,  2,  2,  2],
  [ 0,  5,  5,  5,  9,  9,  9,  9,  9,  9,  9,  6,  6,  6,  0],
  [ 0,  0,  5,  5,  5,  9,  9, 10,  9,  9,  6,  6,  6,  0,  0],
  [ 0,  0,  0,  5,  5,  5,  9, 10,  9,  6,  6,  6,  0,  0,  0],
  [ 0,  0,  0,  0,  4,  4,  4, 10,  4,  4,  4,  0,  0,  0,  0],
  [ 0,  0,  0,  0,  0,  4,  4,  4,  4,  4,  0,  0,  0,  0,  0],
  [ 0,  0,  0,  0,  0,  0,  4,  4,  4,  0,  0,  0,  0,  0,  0],
  [ 0,  0,  0,  0,  0,  0,  0,  4,  0,  0,  0,  0,  0,  0,  0],
  [ 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [ 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
];

export const HEART_CONTAINERS: ContainerDef[] = [
  { id: 1,  layer: 3, name: 'Red Left' },
  { id: 2,  layer: 3, name: 'Red Right' },
  { id: 3,  layer: 3, name: 'Red Bridge' },
  { id: 4,  layer: 3, name: 'Red Tip' },
  { id: 5,  layer: 3, name: 'Red Left Flank' },
  { id: 6,  layer: 3, name: 'Red Right Flank' },
  { id: 7,  layer: 2, name: 'Purple Left' },
  { id: 8,  layer: 2, name: 'Purple Right' },
  { id: 9,  layer: 2, name: 'Purple Center' },
  { id: 10, layer: 1, name: 'Gold' },
];

export const HEART_CONTAINER_DEPS: Record<number, number[]> = {
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  7: [1],
  8: [2],
  9: [3],
  10: [4, 9],
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
