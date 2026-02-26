'use client';

import { memo, useEffect, useRef } from 'react';
import { Cell as CellType, ColorConfig } from '@/types/game';
import { getCellState } from '@/utils/gameLogic';
import { CELL_SIZE } from '@/utils/trackPositions';

interface CellProps {
  cell: CellType;
  color: ColorConfig | null;
  capacity: number;
  isHit: boolean;
  justSolidified: boolean;
}

function CellComponent({ cell, color, capacity, isHit, justSolidified }: CellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const state = getCellState(cell);
  const prevSolidified = useRef(cell.solidified);

  useEffect(() => {
    if (justSolidified && ref.current) {
      ref.current.classList.remove('animate-sparkle');
      void ref.current.offsetWidth;
      ref.current.classList.add('animate-sparkle');
    }
  }, [justSolidified]);

  useEffect(() => {
    if (isHit && ref.current && state !== 'solidified') {
      ref.current.classList.remove('animate-hit');
      void ref.current.offsetWidth;
      ref.current.classList.add('animate-hit');
    }
  }, [isHit, state]);

  useEffect(() => {
    prevSolidified.current = cell.solidified;
  }, [cell.solidified]);

  const fillPercent = capacity > 0 ? (cell.hits / capacity) * 100 : 0;

  let bg: string;
  let border: string | undefined;
  let boxShadow: string | undefined;
  let opacity: number | undefined;

  switch (state) {
    case 'empty':
      bg = '#1e1e3a';
      break;
    case 'hidden':
      bg = '#111122';
      opacity = 0.3;
      break;
    case 'unfilled':
      bg = '#0d0d1a';
      border = color ? `2px solid ${color.hex}44` : undefined;
      break;
    case 'filling':
      bg = color
        ? `linear-gradient(to top, ${color.hex} ${fillPercent}%, #0d0d1a ${fillPercent}%)`
        : '#0d0d1a';
      boxShadow = color ? `0 0 6px ${color.glow}` : undefined;
      break;
    case 'solidified':
      bg = color
        ? `linear-gradient(135deg, ${color.hex} 55%, rgba(255,255,255,0.7) 130%)`
        : '#fff';
      boxShadow = color ? `0 0 10px ${color.glow}, inset 0 0 4px rgba(255,255,255,0.3)` : undefined;
      break;
  }

  return (
    <div
      ref={ref}
      className="rounded-[4px] transition-[background,box-shadow,opacity] duration-150"
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        background: bg,
        border,
        boxShadow,
        opacity,
      }}
    />
  );
}

export default memo(CellComponent, (prev, next) => {
  return (
    prev.cell.hits === next.cell.hits &&
    prev.cell.solidified === next.cell.solidified &&
    prev.cell.exposed === next.cell.exposed &&
    prev.isHit === next.isHit &&
    prev.justSolidified === next.justSolidified
  );
});
