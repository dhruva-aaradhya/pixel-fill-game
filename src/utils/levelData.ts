import { Level, ColorConfig, TrackSide } from '@/types/game';

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

function buildDirectionMap(pixelMap: number[][]): TrackSide[][] {
  const size = pixelMap.length;
  const result: TrackSide[][] = [];
  for (let r = 0; r < size; r++) {
    const row: TrackSide[] = [];
    for (let c = 0; c < size; c++) {
      if (pixelMap[r][c] === 0) {
        row.push('left');
        continue;
      }
      let topDist = Infinity;
      let bottomDist = Infinity;
      let leftDist = Infinity;
      let rightDist = Infinity;
      for (let rr = r - 1; rr >= 0; rr--) { if (pixelMap[rr][c] === 0) { topDist = r - rr; break; } }
      if (r === 0) topDist = 1;
      for (let rr = r + 1; rr < size; rr++) { if (pixelMap[rr][c] === 0) { bottomDist = rr - r; break; } }
      if (r === size - 1) bottomDist = 1;
      for (let cc = c - 1; cc >= 0; cc--) { if (pixelMap[r][cc] === 0) { leftDist = c - cc; break; } }
      if (c === 0) leftDist = 1;
      for (let cc = c + 1; cc < size; cc++) { if (pixelMap[r][cc] === 0) { rightDist = cc - c; break; } }
      if (c === size - 1) rightDist = 1;

      const min = Math.min(topDist, bottomDist, leftDist, rightDist);
      if (min === leftDist) row.push('left');
      else if (min === rightDist) row.push('right');
      else if (min === topDist) row.push('top');
      else row.push('bottom');
    }
    result.push(row);
  }
  return result;
}

export const HEART_DIRECTION_MAP: TrackSide[][] = buildDirectionMap(HEART_MAP);

export const LEVELS: Level[] = [
  {
    name: 'Heart',
    gridSize: 15,
    pixelMap: HEART_MAP,
    colors: COLORS,
    capacity: 1,
    layerOrder: [3, 2, 1],
    directionMap: HEART_DIRECTION_MAP,
  },
];
