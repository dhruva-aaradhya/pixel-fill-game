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
  let borderRadius = '4px';

  if (!isPartOfShape) {
    bg = 'transparent';
  } else {
    switch (state) {
      case 'hidden':
        bg = color ? `${color.hex}18` : '#18182e';
        outline = 'none';
        boxShadow = `0 0 0 1px ${color ? color.hex + '20' : '#3a3a5e20'}`;
        borderRadius = '1px';
        opacity = 0.6;
        break;
      case 'unfilled':
        bg = color ? `${color.hex}15` : '#0e0e1e';
        outline = `2px solid ${color ? color.hex + '60' : TRAY_WALL}`;
        boxShadow = `inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 10px ${color ? color.hex + '25' : 'transparent'}`;
        borderRadius = '4px';
        break;
      case 'filling':
        bg = color
          ? `linear-gradient(to top, ${color.hex} ${fillPercent}%, #0e0e1e ${fillPercent}%)`
          : '#0e0e1e';
        outline = `2px solid ${color ? color.hex + '60' : TRAY_WALL}`;
        boxShadow = `inset 0 1px 3px rgba(0,0,0,0.4), 0 0 8px ${color?.glow ?? 'transparent'}`;
        borderRadius = '4px';
        break;
      case 'solidified':
        bg = color
          ? `linear-gradient(135deg, ${color.hex} 40%, rgba(255,255,255,0.25) 120%)`
          : '#fff';
        outline = 'none';
        boxShadow = `0 0 0 2px ${color?.hex ?? '#fff'}`;
        borderRadius = '1px';
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
