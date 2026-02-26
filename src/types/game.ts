export type ShooterColor = 'red' | 'crimson' | 'pink';

export type CellState = 'empty' | 'hidden' | 'unfilled' | 'filling' | 'solidified';

export type GameStatus = 'playing' | 'won' | 'lost';

export type ScreenState = 'lobby' | 'game';

export type TrackSide = 'left' | 'top' | 'right' | 'bottom';

export interface ColorConfig {
  layer: number;
  hex: string;
  name: ShooterColor;
  glow: string;
}

export interface Cell {
  row: number;
  col: number;
  layer: number;
  hits: number;
  solidified: boolean;
  exposed: boolean;
}

export interface Shooter {
  id: string;
  color: ShooterColor;
  layer: number;
  ammo: number;
}

export interface ConveyorShooter extends Shooter {
  trackPos: number;
}

export interface GameState {
  grid: Cell[][];
  exposedLayers: number[];
  line: Shooter[];
  holding: (Shooter | null)[];
  conveyor: ConveyorShooter[];
  status: GameStatus;
  levelNumber: number;
  stats: GameStats;
  capacity: number;
  layerOrder: number[];
  recentHits: { row: number; col: number }[];
  recentSolidified: { row: number; col: number }[];
}

export interface GameStats {
  shootersDeployed: number;
  lapsCompleted: number;
  elapsedMs: number;
  cellsSolidified: number;
  totalCells: number;
}

export interface Level {
  name: string;
  gridSize: number;
  pixelMap: number[][];
  colors: Record<number, ColorConfig>;
  capacity: number;
  layerOrder: number[];
}

export interface TrackPosition {
  index: number;
  side: TrackSide;
  rowOrCol: number;
  x: number;
  y: number;
}

export interface PlayerProgress {
  highestLevel: number;
  bestStats: Record<number, GameStats>;
}
