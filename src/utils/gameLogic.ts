import {
  Cell,
  ConveyorShooter,
  GameState,
  Level,
  Shooter,
  TrackSide,
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

  const initialContainers = level.containers
    .filter((c) => (level.containerDeps[c.id] ?? []).length === 0)
    .map((c) => c.id);

  const exposedSet = new Set(initialContainers);

  const grid: Cell[][] = [];
  let totalCells = 0;

  for (let r = 0; r < level.gridSize; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < level.gridSize; c++) {
      const layer = level.pixelMap[r][c];
      const containerId = level.containerMap[r][c];
      if (layer > 0) totalCells++;
      row.push({
        row: r,
        col: c,
        layer,
        containerId,
        hits: 0,
        solidified: false,
        exposed: exposedSet.has(containerId),
      });
    }
    grid.push(row);
  }

  const queues = generateShooterQueues(grid, level);

  return {
    grid,
    exposedContainers: initialContainers,
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
): Shooter[][] {
  const cellCounts: Record<number, number> = {};

  for (const row of grid) {
    for (const cell of row) {
      if (cell.layer > 0) {
        cellCounts[cell.layer] = (cellCounts[cell.layer] || 0) + 1;
      }
    }
  }

  const allShooters: Shooter[] = [];

  for (const [layerStr, count] of Object.entries(cellCounts)) {
    const layer = parseInt(layerStr);
    const total = count * level.capacity;
    const color = level.colors[layer].name;

    let remaining = total;

    while (remaining > 0) {
      const maxAmmo = Math.min(12, remaining);
      const minAmmo = Math.min(4, remaining);
      const range = maxAmmo - minAmmo;
      const ammo = range > 0
        ? minAmmo + Math.floor(Math.random() * (range + 1))
        : remaining;
      allShooters.push({ id: genId(), color, layer, ammo });
      remaining -= ammo;
    }
  }

  for (let i = allShooters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allShooters[i], allShooters[j]] = [allShooters[j], allShooters[i]];
  }

  const queues: Shooter[][] = [[], [], []];
  for (let i = 0; i < allShooters.length; i++) {
    queues[i % 3].push(allShooters[i]);
  }

  return queues;
}

export function deployFromQueue(
  state: GameState,
  queueIndex: number
): GameState {
  if (state.conveyor.length >= MAX_CONVEYOR) return state;
  if (state.status !== 'playing') return state;

  const queue = state.queues[queueIndex];
  if (!queue || queue.length === 0) return state;

  const [shooter, ...rest] = queue;
  const convShooter: ConveyorShooter = { ...shooter, trackPos: -1 };

  const newQueues = state.queues.map((q, i) => (i === queueIndex ? rest : q));

  return {
    ...state,
    queues: newQueues,
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

function firstCellInPath(
  grid: Cell[][],
  rowOrCol: number,
  side: TrackSide
): Cell | null {
  const size = grid.length;
  switch (side) {
    case 'left':
      for (let c = 0; c < size; c++) {
        const cell = grid[rowOrCol][c];
        if (cell.layer > 0 && !cell.solidified) return cell;
      }
      return null;
    case 'right':
      for (let c = size - 1; c >= 0; c--) {
        const cell = grid[rowOrCol][c];
        if (cell.layer > 0 && !cell.solidified) return cell;
      }
      return null;
    case 'top':
      for (let r = 0; r < size; r++) {
        const cell = grid[r][rowOrCol];
        if (cell.layer > 0 && !cell.solidified) return cell;
      }
      return null;
    case 'bottom':
      for (let r = size - 1; r >= 0; r--) {
        const cell = grid[r][rowOrCol];
        if (cell.layer > 0 && !cell.solidified) return cell;
      }
      return null;
  }
}

function getTargetAtPosition(
  grid: Cell[][],
  trackPos: number,
  layer: number
): { row: number; col: number; side: TrackSide } | null {
  const rule = getTrackFiringRule(trackPos);
  if (!rule) return null;

  const { side, rowOrCol } = rule;
  const blocker = firstCellInPath(grid, rowOrCol, side);

  if (!blocker) return null;
  if (blocker.layer !== layer || !blocker.exposed) return null;

  return { row: blocker.row, col: blocker.col, side };
}

export function processConveyorTick(state: GameState, level: Level): GameState {
  if (state.status !== 'playing') return state;

  if (state.conveyor.length === 0) {
    return {
      ...state,
      recentHits: [],
      recentSolidified: [],
      stats: { ...state.stats, elapsedMs: state.stats.elapsedMs + TICK_MS },
    } as GameState;
  }

  const grid = state.grid.map((row) => row.map((cell) => ({ ...cell })));

  const sorted = [...state.conveyor].sort((a, b) => b.trackPos - a.trackPos);

  const newConveyor: ConveyorShooter[] = [];
  const toHolding: Shooter[] = [];
  const hits: { row: number; col: number; side: TrackSide }[] = [];
  const newlySolidified: { row: number; col: number; side: TrackSide }[] = [];

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
        hits.push({ row: target.row, col: target.col, side: target.side });

        if (cell.hits >= state.capacity && !cell.solidified) {
          cell.solidified = true;
          newlySolidified.push({ row: target.row, col: target.col, side: target.side });
        }
      }
    }

    if (ammo <= 0) continue;

    newConveyor.push({ ...shooter, trackPos: newPos, ammo });
  }

  const exposedSet = new Set(state.exposedContainers);

  const containerDone = new Map<number, boolean>();
  for (const cdef of level.containers) {
    containerDone.set(cdef.id, true);
  }
  for (const row of grid) {
    for (const cell of row) {
      if (cell.containerId > 0 && !cell.solidified) {
        containerDone.set(cell.containerId, false);
      }
    }
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const cdef of level.containers) {
      if (exposedSet.has(cdef.id)) continue;
      const deps = level.containerDeps[cdef.id] ?? [];
      const allDepsDone = deps.every((d) => containerDone.get(d) === true);
      if (allDepsDone) {
        exposedSet.add(cdef.id);
        for (const row of grid) {
          for (const cell of row) {
            if (cell.containerId === cdef.id) cell.exposed = true;
          }
        }
        changed = true;
      }
    }
  }

  const exposedContainers = Array.from(exposedSet);

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
    exposedContainers,
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
