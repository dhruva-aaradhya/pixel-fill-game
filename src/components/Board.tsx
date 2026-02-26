'use client';

import { Cell as CellType, ConveyorShooter, ColorConfig, TrackSide } from '@/types/game';
import CellComponent from './Cell';
import ConveyorTrack from './ConveyorTrack';
import { CELL_SIZE, GAP, GRID_SIZE, TRACK_MARGIN, WRAPPER_SIZE } from '@/utils/trackPositions';

interface BoardProps {
  grid: CellType[][];
  conveyor: ConveyorShooter[];
  colors: Record<number, ColorConfig>;
  capacity: number;
  recentHits: { row: number; col: number; side: TrackSide }[];
  recentSolidified: { row: number; col: number; side: TrackSide }[];
}

function findSide(
  set: { row: number; col: number; side: TrackSide }[],
  row: number,
  col: number
): TrackSide | null {
  const entry = set.find((s) => s.row === row && s.col === col);
  return entry ? entry.side : null;
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
        className="absolute rounded-lg"
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
              hitSide={findSide(recentHits, cell.row, cell.col)}
              solidifySide={findSide(recentSolidified, cell.row, cell.col)}
            />
          );
        })}
      </div>
    </div>
  );
}
