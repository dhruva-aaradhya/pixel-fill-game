'use client';

import { memo, useEffect, useRef } from 'react';
import { Cell as CellType, ColorConfig, TrackSide } from '@/types/game';
import { getCellState } from '@/utils/gameLogic';
import { CELL_SIZE } from '@/utils/trackPositions';

interface CellProps {
  cell: CellType;
  color: ColorConfig | null;
  capacity: number;
  hitSide: TrackSide | null;
  solidifySide: TrackSide | null;
}

const TRAY_WALL = '#3a3a5e';

const FILL_ANIM_MAP: Record<TrackSide, string> = {
  left: 'animate-fill-from-right',
  right: 'animate-fill-from-left',
  top: 'animate-fill-from-bottom',
  bottom: 'animate-fill-from-top',
};

function CellComponent({ cell, color, capacity, hitSide, solidifySide }: CellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const state = getCellState(cell);

  useEffect(() => {
    if (solidifySide && ref.current) {
      const cls = FILL_ANIM_MAP[solidifySide];
      ref.current.classList.remove('animate-sparkle', ...Object.values(FILL_ANIM_MAP));
      void ref.current.offsetWidth;
      ref.current.classList.add(cls);
    }
  }, [solidifySide]);

  useEffect(() => {
    if (hitSide && ref.current && state !== 'solidified') {
      ref.current.classList.remove('animate-hit');
      void ref.current.offsetWidth;
      ref.current.classList.add('animate-hit');
    }
  }, [hitSide, state]);

  const fillPercent = capacity > 0 ? (cell.hits / capacity) * 100 : 0;
  const isPartOfShape = cell.layer > 0;

  let bg: string;
  let outline: string | undefined;
  let boxShadow: string | undefined;
  let opacity: number | undefined;
  const borderRadius = '4px';

  if (!isPartOfShape) {
    bg = 'transparent';
  } else {
    outline = `1.5px solid ${TRAY_WALL}`;

    switch (state) {
      case 'hidden':
        bg = color ? `${color.hex}10` : '#18182e';
        outline = `1.5px solid ${color ? color.hex + '25' : TRAY_WALL}`;
        boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.6)';
        opacity = 0.45;
        break;
      case 'unfilled':
        bg = color ? `${color.hex}18` : '#0e0e1e';
        outline = `1.5px solid ${color ? color.hex + '55' : TRAY_WALL}`;
        boxShadow = `inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 8px ${color ? color.hex + '20' : 'transparent'}`;
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
    prev.hitSide === next.hitSide &&
    prev.solidifySide === next.solidifySide
  );
});
