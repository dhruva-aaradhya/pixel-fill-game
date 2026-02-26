'use client';

import { memo, useEffect, useRef } from 'react';
import { Cell as CellType, ColorConfig, ContainerEdges, TrackSide } from '@/types/game';
import { getCellState } from '@/utils/gameLogic';
import { CELL_SIZE } from '@/utils/trackPositions';

interface CellProps {
  cell: CellType;
  color: ColorConfig | null;
  capacity: number;
  hitSide: TrackSide | null;
  solidifySide: TrackSide | null;
  containerEdges: ContainerEdges;
}

const FILL_ANIM_MAP: Record<TrackSide, string> = {
  left: 'animate-fill-from-right',
  right: 'animate-fill-from-left',
  top: 'animate-fill-from-bottom',
  bottom: 'animate-fill-from-top',
};

const SEPARATOR = '#0d0d20';

function buildBorders(
  edges: ContainerEdges,
  innerColor: string,
  innerWidth: string,
): React.CSSProperties {
  return {
    borderTop: edges.top ? `2.5px solid ${SEPARATOR}` : `${innerWidth} solid ${innerColor}`,
    borderRight: edges.right ? `2.5px solid ${SEPARATOR}` : `${innerWidth} solid ${innerColor}`,
    borderBottom: edges.bottom ? `2.5px solid ${SEPARATOR}` : `${innerWidth} solid ${innerColor}`,
    borderLeft: edges.left ? `2.5px solid ${SEPARATOR}` : `${innerWidth} solid ${innerColor}`,
  };
}

function CellComponent({ cell, color, capacity, hitSide, solidifySide, containerEdges }: CellProps) {
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
  let boxShadow: string | undefined;
  let opacity: number | undefined;
  let borderRadius = '4px';
  let borderStyle: React.CSSProperties = {};

  if (!isPartOfShape) {
    bg = 'transparent';
  } else {
    const hex = color?.hex ?? '#fff';

    switch (state) {
      case 'hidden':
        bg = color ? `${hex}18` : '#18182e';
        boxShadow = `0 0 0 1px ${hex}20`;
        borderRadius = '1px';
        opacity = 0.6;
        break;

      case 'unfilled':
        bg = color ? `${hex}15` : '#0e0e1e';
        borderStyle = buildBorders(containerEdges, `${hex}60`, '2px');
        boxShadow = `inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 10px ${hex}25`;
        borderRadius = '4px';
        break;

      case 'filling':
        bg = color
          ? `linear-gradient(to top, ${hex} ${fillPercent}%, #0e0e1e ${fillPercent}%)`
          : '#0e0e1e';
        borderStyle = buildBorders(containerEdges, `${hex}60`, '2px');
        boxShadow = `inset 0 1px 3px rgba(0,0,0,0.4), 0 0 8px ${color?.glow ?? 'transparent'}`;
        borderRadius = '4px';
        break;

      case 'solidified': {
        bg = color
          ? `linear-gradient(135deg, ${hex} 40%, rgba(255,255,255,0.25) 120%)`
          : '#fff';

        const shadowParts: string[] = [];
        if (!containerEdges.top) shadowParts.push(`0 -2px 0 0 ${hex}`);
        if (!containerEdges.bottom) shadowParts.push(`0 2px 0 0 ${hex}`);
        if (!containerEdges.left) shadowParts.push(`-2px 0 0 0 ${hex}`);
        if (!containerEdges.right) shadowParts.push(`2px 0 0 0 ${hex}`);
        boxShadow = shadowParts.length > 0 ? shadowParts.join(', ') : 'none';

        borderStyle = {
          borderTop: containerEdges.top ? `2.5px solid ${SEPARATOR}` : 'none',
          borderRight: containerEdges.right ? `2.5px solid ${SEPARATOR}` : 'none',
          borderBottom: containerEdges.bottom ? `2.5px solid ${SEPARATOR}` : 'none',
          borderLeft: containerEdges.left ? `2.5px solid ${SEPARATOR}` : 'none',
        };

        borderRadius = '1px';
        break;
      }
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
        boxShadow,
        opacity,
        borderRadius,
        boxSizing: 'border-box',
        ...borderStyle,
      }}
    />
  );
}

export default memo(CellComponent, (prev, next) => {
  return (
    prev.cell.hits === next.cell.hits &&
    prev.cell.solidified === next.cell.solidified &&
    prev.cell.exposed === next.cell.exposed &&
    prev.cell.containerId === next.cell.containerId &&
    prev.hitSide === next.hitSide &&
    prev.solidifySide === next.solidifySide &&
    prev.containerEdges === next.containerEdges
  );
});
