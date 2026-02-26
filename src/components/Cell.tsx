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

const TRAY_WALL = '#3a3a5e';

function CellComponent({ cell, color, capacity, isHit, justSolidified }: CellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const state = getCellState(cell);

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

  const fillPercent = capacity > 0 ? (cell.hits / capacity) * 100 : 0;
  const isPartOfShape = cell.layer > 0;

  let bg: string;
  let outline: string | undefined;
  let boxShadow: string | undefined;
  let opacity: number | undefined;
  let borderRadius = '4px';

  if (!isPartOfShape) {
    // Empty cell — fully transparent, invisible
    bg = 'transparent';
  } else {
    // All shape cells get the tray wall outline
    outline = `1.5px solid ${TRAY_WALL}`;

    switch (state) {
      case 'hidden':
        bg = '#18182e';
        boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.6)';
        opacity = 0.5;
        break;
      case 'unfilled':
        bg = '#0e0e1e';
        boxShadow = `inset 0 2px 6px rgba(0,0,0,0.7), inset 0 0 0 1.5px ${color ? color.hex + '30' : 'transparent'}`;
        break;
      case 'filling':
        bg = color
          ? `linear-gradient(to top, ${color.hex} ${fillPercent}%, #0e0e1e ${fillPercent}%)`
          : '#0e0e1e';
        boxShadow = `inset 0 1px 3px rgba(0,0,0,0.4), 0 0 8px ${color?.glow ?? 'transparent'}`;
        break;
      case 'solidified':
        bg = color
          ? `linear-gradient(135deg, ${color.hex} 40%, rgba(255,255,255,0.6) 120%)`
          : '#fff';
        boxShadow = `0 0 10px ${color?.glow ?? 'transparent'}, 0 1px 3px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)`;
        break;
      default:
        bg = 'transparent';
    }
  }

  return (
    <div
      ref={ref}
      className="transition-[background,box-shadow,opacity] duration-150"
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        background: bg,
        outline,
        boxShadow,
        opacity,
        borderRadius,
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
