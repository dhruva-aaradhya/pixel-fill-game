'use client';

import { useMemo } from 'react';
import { Cell as CellType, ContainerEdges, ConveyorShooter, ColorConfig, TrackSide } from '@/types/game';
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

function computeContainerEdges(grid: CellType[][]): ContainerEdges[][] {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const result: ContainerEdges[][] = [];

  for (let r = 0; r < rows; r++) {
    const row: ContainerEdges[] = [];
    for (let c = 0; c < cols; c++) {
      const cid = grid[r][c].containerId;
      if (cid === 0) {
        row.push({ top: false, right: false, bottom: false, left: false });
        continue;
      }
      row.push({
        top: r === 0 || grid[r - 1][c].containerId !== cid,
        right: c === cols - 1 || grid[r][c + 1].containerId !== cid,
        bottom: r === rows - 1 || grid[r + 1][c].containerId !== cid,
        left: c === 0 || grid[r][c - 1].containerId !== cid,
      });
    }
    result.push(row);
  }
  return result;
}

export default function Board({
  grid,
  conveyor,
  colors,
  capacity,
  recentHits,
  recentSolidified,
}: BoardProps) {
  const edgesGrid = useMemo(() => computeContainerEdges(grid), [grid]);

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
              containerEdges={edgesGrid[cell.row][cell.col]}
            />
          );
        })}
      </div>
    </div>
  );
}
