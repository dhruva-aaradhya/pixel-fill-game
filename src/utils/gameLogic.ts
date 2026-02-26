import {
  Cell,
  ConveyorShooter,
  GameState,
  Level,
  Shooter,
  ShooterColor,
} from '@/types/game';
import { getTrackFiringRule, TRACK_LENGTH, TICK_MS, MAX_CONVEYOR, MAX_HOLDING } from './trackPositions';

let nextId = 0;
function genId(): string {
  return `s${nextId++}`;
}

export function resetIdCounter(): void {
  nextId = 0;
}

export function createGameState(level: Level, levelNumber: number): GameState {
  resetIdCounter();

  const grid: Cell[][] = [];
  let totalCells = 0;

  for (let r = 0; r < level.gridSize; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < level.gridSize; c++) {
      const layer = level.pixelMap[r][c];
      if (layer > 0) totalCells++;
      row.push({
        row: r,
        col: c,
        layer,
        hits: 0,
        solidified: false,
        exposed: layer === level.layerOrder[0],
      });
    }
    grid.push(row);
  }

  const queues = generateShooterQueues(grid, level);

  return {
    grid,
    exposedLayers: [level.layerOrder[0]],
    queues,
    holding: Array(MAX_HOLDING).fill(null),
    conveyor: [],
    status: 'playing',
    levelNumber,
    capacity: level.capacity,
    layerOrder: level.layerOrder,
    stats: {
      shootersDeployed: 0,
      lapsCompleted: 0,
      elapsedMs: 0,
      cellsSolidified: 0,
      totalCells,
    },
    recentHits: [],
    recentSolidified: [],
  };
}

function generateShooterQueues(
  grid: Cell[][],
  level: Level
): Record<ShooterColor, Shooter[]> {
  const cellCounts: Record<number, number> = {};

  for (const row of grid) {
    for (const cell of row) {
      if (cell.layer > 0) {
        cellCounts[cell.layer] = (cellCounts[cell.layer] || 0) + 1;
      }
    }
  }

  const queues: Record<string, Shooter[]> = {};

  for (const [layerStr, count] of Object.entries(cellCounts)) {
    const layer = parseInt(layerStr);
    const total = count * level.capacity;
    const color = level.colors[layer].name;

    const shooters: Shooter[] = [];
    let remaining = total;

    while (remaining > 0) {
      const maxAmmo = Math.min(40, remaining);
      const minAmmo = Math.min(10, remaining);
      // Skewed towards higher values: pow(random, 0.5) clusters near 1.0
      const range = maxAmmo - minAmmo;
      const ammo = range > 0
        ? minAmmo + Math.floor(range * Math.pow(Math.random(), 0.5))
        : remaining;
      shooters.push({ id: genId(), color, layer, ammo });
      remaining -= ammo;
    }

    // Shuffle within each color queue
    for (let i = shooters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shooters[i], shooters[j]] = [shooters[j], shooters[i]];
    }

    queues[color] = shooters;
  }

  // Ensure all colors have a queue (even if empty)
  for (const layerNum of level.layerOrder) {
    const color = level.colors[layerNum].name;
    if (!queues[color]) queues[color] = [];
  }

  return queues as Record<ShooterColor, Shooter[]>;
}

export function deployFromQueue(
  state: GameState,
  color: ShooterColor
): GameState {
  if (state.conveyor.length >= MAX_CONVEYOR) return state;
  if (state.status !== 'playing') return state;

  const queue = state.queues[color];
  if (!queue || queue.length === 0) return state;

  const [shooter, ...rest] = queue;
  const convShooter: ConveyorShooter = { ...shooter, trackPos: -1 };

  return {
    ...state,
    queues: { ...state.queues, [color]: rest },
    conveyor: [...state.conveyor, convShooter],
    stats: {
      ...state.stats,
      shootersDeployed: state.stats.shootersDeployed + 1,
    },
  };
}

export function deployFromHolding(
  state: GameState,
  shooterId: string
): GameState {
  if (state.conveyor.length >= MAX_CONVEYOR) return state;
  if (state.status !== 'playing') return state;

  const idx = state.holding.findIndex((s) => s !== null && s.id === shooterId);
  if (idx === -1) return state;

  const shooter = state.holding[idx]!;
  const newHolding = [...state.holding];
  newHolding[idx] = null;

  const convShooter: ConveyorShooter = { ...shooter, trackPos: -1 };

  return {
    ...state,
    holding: newHolding,
    conveyor: [...state.conveyor, convShooter],
    stats: {
      ...state.stats,
      shootersDeployed: state.stats.shootersDeployed + 1,
    },
  };
}

function getTargetAtPosition(
  grid: Cell[][],
  trackPos: number,
  layer: number
): { row: number; col: number } | null {
  const rule = getTrackFiringRule(trackPos);
  if (!rule) return null;

  const { side, rowOrCol } = rule;
  const size = grid.length;

  switch (side) {
    case 'left':
      for (let c = 0; c < size; c++) {
        const cell = grid[rowOrCol][c];
        if (cell.layer === layer && cell.exposed && !cell.solidified) {
          return { row: rowOrCol, col: c };
        }
      }
      return null;

    case 'right':
      for (let c = size - 1; c >= 0; c--) {
        const cell = grid[rowOrCol][c];
        if (cell.layer === layer && cell.exposed && !cell.solidified) {
          return { row: rowOrCol, col: c };
        }
      }
      return null;

    case 'top':
      for (let r = 0; r < size; r++) {
        const cell = grid[r][rowOrCol];
        if (cell.layer === layer && cell.exposed && !cell.solidified) {
          return { row: r, col: rowOrCol };
        }
      }
      return null;

    case 'bottom':
      for (let r = size - 1; r >= 0; r--) {
        const cell = grid[r][rowOrCol];
        if (cell.layer === layer && cell.exposed && !cell.solidified) {
          return { row: r, col: rowOrCol };
        }
      }
      return null;
  }
}

export function processConveyorTick(state: GameState): GameState {
  if (state.status !== 'playing') return state;

  if (state.conveyor.length === 0) {
    return {
      ...state,
      recentHits: [],
      recentSolidified: [],
      stats: { ...state.stats, elapsedMs: state.stats.elapsedMs + TICK_MS },
    };
  }

  const grid = state.grid.map((row) => row.map((cell) => ({ ...cell })));

  const sorted = [...state.conveyor].sort((a, b) => b.trackPos - a.trackPos);

  const newConveyor: ConveyorShooter[] = [];
  const toHolding: Shooter[] = [];
  const hits: { row: number; col: number }[] = [];
  const newlySolidified: { row: number; col: number }[] = [];

  for (const shooter of sorted) {
    const newPos = shooter.trackPos + 1;

    if (newPos >= TRACK_LENGTH) {
      toHolding.push({
        id: shooter.id,
        color: shooter.color,
        layer: shooter.layer,
        ammo: shooter.ammo,
      });
      continue;
    }

    let ammo = shooter.ammo;

    if (newPos >= 0) {
      const target = getTargetAtPosition(grid, newPos, shooter.layer);
      if (target) {
        const cell = grid[target.row][target.col];
        cell.hits++;
        ammo--;
        hits.push(target);

        if (cell.hits >= state.capacity && !cell.solidified) {
          cell.solidified = true;
          newlySolidified.push(target);
        }
      }
    }

    if (ammo <= 0) continue;

    newConveyor.push({ ...shooter, trackPos: newPos, ammo });
  }

  let exposedLayers = [...state.exposedLayers];
  let layerChanged = true;
  while (layerChanged) {
    layerChanged = false;
    const currentFront = exposedLayers[exposedLayers.length - 1];
    const currentIdx = state.layerOrder.indexOf(currentFront);

    if (currentIdx < state.layerOrder.length - 1) {
      const allDone = grid.every((row) =>
        row.every((cell) => cell.layer !== currentFront || cell.solidified)
      );
      if (allDone) {
        const nextLayer = state.layerOrder[currentIdx + 1];
        exposedLayers = [...exposedLayers, nextLayer];
        for (const row of grid) {
          for (const cell of row) {
            if (cell.layer === nextLayer) cell.exposed = true;
          }
        }
        layerChanged = true;
      }
    }
  }

  const newHolding = [...state.holding];
  let lost = false;
  let lapsAdded = 0;

  for (const shooter of toHolding) {
    const slot = newHolding.findIndex((s) => s === null);
    if (slot === -1) {
      lost = true;
      break;
    }
    newHolding[slot] = shooter;
    lapsAdded++;
  }

  const solidifiedCount =
    state.stats.cellsSolidified + newlySolidified.length;
  const won = solidifiedCount >= state.stats.totalCells;

  return {
    ...state,
    grid,
    exposedLayers,
    conveyor: newConveyor,
    holding: newHolding,
    status: lost ? 'lost' : won ? 'won' : 'playing',
    recentHits: hits,
    recentSolidified: newlySolidified,
    stats: {
      ...state.stats,
      elapsedMs: state.stats.elapsedMs + TICK_MS,
      cellsSolidified: solidifiedCount,
      lapsCompleted: state.stats.lapsCompleted + lapsAdded,
    },
  };
}

export function getCellState(cell: Cell): 'empty' | 'hidden' | 'unfilled' | 'filling' | 'solidified' {
  if (cell.layer === 0) return 'empty';
  if (!cell.exposed) return 'hidden';
  if (cell.solidified) return 'solidified';
  if (cell.hits > 0) return 'filling';
  return 'unfilled';
}
