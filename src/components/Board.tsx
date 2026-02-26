'use client';

import { Cell as CellType, ConveyorShooter, ColorConfig } from '@/types/game';
import CellComponent from './Cell';
import ConveyorTrack from './ConveyorTrack';
import { CELL_SIZE, GAP, GRID_SIZE, TRACK_MARGIN, WRAPPER_SIZE } from '@/utils/trackPositions';

interface BoardProps {
  grid: CellType[][];
  conveyor: ConveyorShooter[];
  colors: Record<number, ColorConfig>;
  capacity: number;
  recentHits: { row: number; col: number }[];
  recentSolidified: { row: number; col: number }[];
}

function isInSet(set: { row: number; col: number }[], row: number, col: number): boolean {
  return set.some((s) => s.row === row && s.col === col);
}

export default function Board({
  grid,
  conveyor,
  colors,
  capacity,
  recentHits,
  recentSolidified,
}: BoardProps) {
  return (
    <div
      className="relative mx-auto"
      style={{ width: WRAPPER_SIZE, height: WRAPPER_SIZE }}
    >
      <ConveyorTrack conveyor={conveyor} colors={colors} />

      <div
        className="absolute rounded-lg bg-[#0d0d1a]"
        style={{
          top: TRACK_MARGIN,
          left: TRACK_MARGIN,
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          gap: GAP,
          padding: 0,
        }}
      >
        {grid.flat().map((cell) => {
          const colorCfg = cell.layer > 0 ? colors[cell.layer] ?? null : null;
          return (
            <CellComponent
              key={`${cell.row}-${cell.col}`}
              cell={cell}
              color={colorCfg}
              capacity={capacity}
              isHit={isInSet(recentHits, cell.row, cell.col)}
              justSolidified={isInSet(recentSolidified, cell.row, cell.col)}
            />
          );
        })}
      </div>
    </div>
  );
}
