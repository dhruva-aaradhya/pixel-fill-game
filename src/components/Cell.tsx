'use client';

import { memo, useEffect, useRef } from 'react';
import { Cell as CellType, ColorConfig, GameMode, LayerEdges, TrackSide } from '@/types/game';
import { getCellState } from '@/utils/gameLogic';
import { CELL_SIZE } from '@/utils/trackPositions';

interface CellProps {
  cell: CellType;
  color: ColorConfig | null;
  capacity: number;
  hitSide: TrackSide | null;
  solidifySide: TrackSide | null;
  layerEdges: LayerEdges;
  mode: GameMode;
}

const FILL_ANIM_MAP: Record<TrackSide, string> = {
  left: 'animate-fill-from-right',
  right: 'animate-fill-from-left',
  top: 'animate-fill-from-bottom',
  bottom: 'animate-fill-from-top',
};

const FLAP_ANIM_MAP: Record<TrackSide, string> = {
  left: 'animate-flap-from-left',
  right: 'animate-flap-from-right',
  top: 'animate-flap-from-top',
  bottom: 'animate-flap-from-bottom',
};

const DOMINO_ANIM_MAP: Record<TrackSide, string> = {
  left: 'animate-domino-fall-left',
  right: 'animate-domino-fall-right',
  top: 'animate-domino-fall-top',
  bottom: 'animate-domino-fall-bottom',
};

const SEPARATOR = '#0d0d20';

const OPPOSITE: Record<TrackSide, TrackSide> = {
  left: 'right',
  right: 'left',
  top: 'bottom',
  bottom: 'top',
};

function CellComponent({ cell, color, capacity, hitSide, solidifySide, layerEdges, mode }: CellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const state = getCellState(cell);

  useEffect(() => {
    if (!solidifySide) return;
    if (mode === 'fill' && ref.current) {
      const cls = FILL_ANIM_MAP[solidifySide];
      ref.current.classList.remove('animate-sparkle', ...Object.values(FILL_ANIM_MAP));
      void ref.current.offsetWidth;
      ref.current.classList.add(cls);
    }
    if (mode === 'flap' && flapRef.current) {
      const cls = FLAP_ANIM_MAP[solidifySide];
      flapRef.current.classList.remove(...Object.values(FLAP_ANIM_MAP));
      void flapRef.current.offsetWidth;
      flapRef.current.classList.add(cls);
    }
    if (mode === 'domino' && flapRef.current) {
      const cls = DOMINO_ANIM_MAP[solidifySide];
      flapRef.current.classList.remove(...Object.values(DOMINO_ANIM_MAP));
      void flapRef.current.offsetWidth;
      flapRef.current.classList.add(cls);
    }
  }, [solidifySide, mode]);

  useEffect(() => {
    if (hitSide && ref.current && state !== 'solidified') {
      ref.current.classList.remove('animate-hit');
      void ref.current.offsetWidth;
      ref.current.classList.add('animate-hit');
    }
  }, [hitSide, state]);

  const isPartOfShape = cell.layer > 0;
  if (!isPartOfShape) {
    return (
      <div style={{ width: CELL_SIZE, height: CELL_SIZE, background: 'transparent' }} />
    );
  }

  const hex = color?.hex ?? '#fff';

  if (mode === 'fill') {
    return renderFillMode(ref, cell, state, hex, color, capacity, layerEdges);
  }
  if (mode === 'flap') {
    return renderFlapMode(ref, flapRef, cell, state, hex, color, layerEdges);
  }
  return renderDominoMode(ref, flapRef, cell, state, hex, color, layerEdges);
}

function renderFillMode(
  ref: React.RefObject<HTMLDivElement | null>,
  cell: CellType,
  state: string,
  hex: string,
  color: ColorConfig | null,
  capacity: number,
  layerEdges: LayerEdges
) {
  let bg: string;
  let boxShadow: string | undefined;
  let opacity: number | undefined;
  let borderRadius = '4px';
  let borderStyle: React.CSSProperties = {};
  const fillPercent = capacity > 0 ? (cell.hits / capacity) * 100 : 0;

  switch (state) {
    case 'hidden':
      bg = `${hex}18`;
      boxShadow = `0 0 0 1px ${hex}20`;
      borderRadius = '1px';
      opacity = 0.6;
      break;
    case 'unfilled': {
      bg = `${hex}15`;
      const innerBorder = `2px solid ${hex}60`;
      const edgeBorder = `2.5px solid ${SEPARATOR}`;
      borderStyle = {
        borderTop: layerEdges.top ? edgeBorder : innerBorder,
        borderRight: layerEdges.right ? edgeBorder : innerBorder,
        borderBottom: layerEdges.bottom ? edgeBorder : innerBorder,
        borderLeft: layerEdges.left ? edgeBorder : innerBorder,
      };
      boxShadow = `inset 0 2px 6px rgba(0,0,0,0.5), inset 0 0 10px ${hex}25`;
      break;
    }
    case 'filling': {
      bg = `linear-gradient(to top, ${hex} ${fillPercent}%, #0e0e1e ${fillPercent}%)`;
      const innerBorder = `2px solid ${hex}60`;
      const edgeBorder = `2.5px solid ${SEPARATOR}`;
      borderStyle = {
        borderTop: layerEdges.top ? edgeBorder : innerBorder,
        borderRight: layerEdges.right ? edgeBorder : innerBorder,
        borderBottom: layerEdges.bottom ? edgeBorder : innerBorder,
        borderLeft: layerEdges.left ? edgeBorder : innerBorder,
      };
      boxShadow = `inset 0 1px 3px rgba(0,0,0,0.4), 0 0 8px ${color?.glow ?? 'transparent'}`;
      break;
    }
    case 'solidified': {
      bg = `linear-gradient(135deg, ${hex} 40%, rgba(255,255,255,0.25) 120%)`;
      const shadowParts: string[] = [];
      if (!layerEdges.top) shadowParts.push(`0 -2px 0 0 ${hex}`);
      if (!layerEdges.bottom) shadowParts.push(`0 2px 0 0 ${hex}`);
      if (!layerEdges.left) shadowParts.push(`-2px 0 0 0 ${hex}`);
      if (!layerEdges.right) shadowParts.push(`2px 0 0 0 ${hex}`);
      boxShadow = shadowParts.length > 0 ? shadowParts.join(', ') : 'none';
      borderStyle = {
        borderTop: layerEdges.top ? `2.5px solid ${SEPARATOR}` : 'none',
        borderRight: layerEdges.right ? `2.5px solid ${SEPARATOR}` : 'none',
        borderBottom: layerEdges.bottom ? `2.5px solid ${SEPARATOR}` : 'none',
        borderLeft: layerEdges.left ? `2.5px solid ${SEPARATOR}` : 'none',
      };
      borderRadius = '1px';
      break;
    }
    default:
      bg = 'transparent';
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

function renderFlapMode(
  ref: React.RefObject<HTMLDivElement | null>,
  flapRef: React.RefObject<HTMLDivElement | null>,
  cell: CellType,
  state: string,
  hex: string,
  color: ColorConfig | null,
  layerEdges: LayerEdges
) {
  const validSide = cell.validSide ?? 'left';
  const hingeSide = OPPOSITE[validSide];

  if (state === 'solidified') {
    const bg = `linear-gradient(135deg, ${hex} 40%, rgba(255,255,255,0.25) 120%)`;
    const shadowParts: string[] = [];
    if (!layerEdges.top) shadowParts.push(`0 -2px 0 0 ${hex}`);
    if (!layerEdges.bottom) shadowParts.push(`0 2px 0 0 ${hex}`);
    if (!layerEdges.left) shadowParts.push(`-2px 0 0 0 ${hex}`);
    if (!layerEdges.right) shadowParts.push(`2px 0 0 0 ${hex}`);
    const boxShadow = shadowParts.length > 0 ? shadowParts.join(', ') : 'none';
    return (
      <div
        ref={ref}
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          background: bg,
          boxShadow,
          borderRadius: '1px',
          boxSizing: 'border-box',
          borderTop: layerEdges.top ? `2.5px solid ${SEPARATOR}` : 'none',
          borderRight: layerEdges.right ? `2.5px solid ${SEPARATOR}` : 'none',
          borderBottom: layerEdges.bottom ? `2.5px solid ${SEPARATOR}` : 'none',
          borderLeft: layerEdges.left ? `2.5px solid ${SEPARATOR}` : 'none',
        }}
      />
    );
  }

  if (state === 'hidden') {
    return (
      <div
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          background: `${hex}18`,
          boxShadow: `0 0 0 1px ${hex}20`,
          borderRadius: '1px',
          opacity: 0.6,
          boxSizing: 'border-box',
        }}
      />
    );
  }

  const hingeBorder = `3px solid ${hex}90`;
  const thinBorder = `1px solid ${hex}30`;
  const chevronPositions = getChevronStyle(validSide, hex);

  return (
    <div
      ref={ref}
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        position: 'relative',
        perspective: '300px',
      }}
    >
      {/* Base: color revealed underneath */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `${hex}20`,
          borderRadius: '2px',
        }}
      />
      {/* The flap itself */}
      <div
        ref={flapRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, ${hex}40 0%, ${hex}20 100%)`,
          borderRadius: '3px',
          borderTop: hingeSide === 'top' ? hingeBorder : thinBorder,
          borderRight: hingeSide === 'right' ? hingeBorder : thinBorder,
          borderBottom: hingeSide === 'bottom' ? hingeBorder : thinBorder,
          borderLeft: hingeSide === 'left' ? hingeBorder : thinBorder,
          boxShadow: `0 2px 4px rgba(0,0,0,0.4), inset 0 0 8px ${hex}15`,
          boxSizing: 'border-box',
          transformOrigin: `${hingeSide} center`,
          backfaceVisibility: 'hidden',
        }}
      >
        {/* Directional chevron */}
        <div style={chevronPositions} />
      </div>
    </div>
  );
}

function renderDominoMode(
  ref: React.RefObject<HTMLDivElement | null>,
  flapRef: React.RefObject<HTMLDivElement | null>,
  cell: CellType,
  state: string,
  hex: string,
  color: ColorConfig | null,
  layerEdges: LayerEdges
) {
  const validSide = cell.validSide ?? 'left';
  const isVertical = validSide === 'left' || validSide === 'right';

  if (state === 'solidified') {
    const bg = `linear-gradient(135deg, ${hex} 40%, rgba(255,255,255,0.25) 120%)`;
    const shadowParts: string[] = [];
    if (!layerEdges.top) shadowParts.push(`0 -2px 0 0 ${hex}`);
    if (!layerEdges.bottom) shadowParts.push(`0 2px 0 0 ${hex}`);
    if (!layerEdges.left) shadowParts.push(`-2px 0 0 0 ${hex}`);
    if (!layerEdges.right) shadowParts.push(`2px 0 0 0 ${hex}`);
    const boxShadow = shadowParts.length > 0 ? shadowParts.join(', ') : 'none';
    return (
      <div
        ref={ref}
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          background: bg,
          boxShadow,
          borderRadius: '1px',
          boxSizing: 'border-box',
          borderTop: layerEdges.top ? `2.5px solid ${SEPARATOR}` : 'none',
          borderRight: layerEdges.right ? `2.5px solid ${SEPARATOR}` : 'none',
          borderBottom: layerEdges.bottom ? `2.5px solid ${SEPARATOR}` : 'none',
          borderLeft: layerEdges.left ? `2.5px solid ${SEPARATOR}` : 'none',
        }}
      />
    );
  }

  if (state === 'hidden') {
    return (
      <div
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          background: `${hex}18`,
          boxShadow: `0 0 0 1px ${hex}20`,
          borderRadius: '1px',
          opacity: 0.6,
          boxSizing: 'border-box',
        }}
      />
    );
  }

  const tileWidth = isVertical ? CELL_SIZE * 0.45 : CELL_SIZE;
  const tileHeight = isVertical ? CELL_SIZE : CELL_SIZE * 0.45;
  const tileLeft = isVertical ? (CELL_SIZE - tileWidth) / 2 : 0;
  const tileTop = isVertical ? 0 : (CELL_SIZE - tileHeight) / 2;

  const coloredSideBorder = `3px solid ${hex}`;
  const darkSideBorder = '3px solid #2a2a3a';
  const thinBorder = '1px solid #3a3a50';

  const borderTop = validSide === 'top' ? coloredSideBorder : (validSide === 'bottom' ? darkSideBorder : thinBorder);
  const borderBottom = validSide === 'bottom' ? coloredSideBorder : (validSide === 'top' ? darkSideBorder : thinBorder);
  const borderLeft = validSide === 'left' ? coloredSideBorder : (validSide === 'right' ? darkSideBorder : thinBorder);
  const borderRight = validSide === 'right' ? coloredSideBorder : (validSide === 'left' ? darkSideBorder : thinBorder);

  const topEdgeH = isVertical ? 3 : tileHeight;
  const topEdgeW = isVertical ? tileWidth : 3;

  return (
    <div
      ref={ref}
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        position: 'relative',
        perspective: '300px',
      }}
    >
      {/* Floor shadow */}
      <div
        style={{
          position: 'absolute',
          bottom: isVertical ? 0 : 'auto',
          left: isVertical ? '50%' : 0,
          right: isVertical ? 'auto' : 0,
          top: isVertical ? 'auto' : (validSide === 'top' ? 0 : 'auto'),
          transform: isVertical ? 'translateX(-50%)' : 'none',
          width: isVertical ? tileWidth + 4 : CELL_SIZE,
          height: isVertical ? 4 : 4,
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '50%',
          filter: 'blur(2px)',
        }}
      />
      {/* Domino tile */}
      <div
        ref={flapRef}
        style={{
          position: 'absolute',
          left: tileLeft,
          top: tileTop,
          width: tileWidth,
          height: tileHeight,
          background: `linear-gradient(${validSide === 'left' || validSide === 'top' ? '135deg' : '315deg'}, ${hex}50 0%, #1a1a2e 60%)`,
          borderRadius: '3px',
          borderTop,
          borderRight,
          borderBottom,
          borderLeft,
          boxShadow: `0 1px 3px rgba(0,0,0,0.5)`,
          boxSizing: 'border-box',
          transformOrigin: OPPOSITE[validSide],
        }}
      >
        {/* Top edge of standing domino */}
        <div
          style={{
            position: 'absolute',
            ...getDominoEdgePosition(validSide),
            width: topEdgeW,
            height: topEdgeH,
            background: `${hex}40`,
            borderRadius: '1px',
          }}
        />
      </div>
    </div>
  );
}

function getDominoEdgePosition(side: TrackSide): React.CSSProperties {
  switch (side) {
    case 'left': return { top: -1, left: -1 };
    case 'right': return { top: -1, right: -1 };
    case 'top': return { top: -1, left: -1 };
    case 'bottom': return { bottom: -1, left: -1 };
  }
}

function getChevronStyle(validSide: TrackSide, hex: string): React.CSSProperties {
  const size = 5;
  const base: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    opacity: 0.7,
  };
  switch (validSide) {
    case 'left':
      return {
        ...base,
        left: 2,
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: `${size}px ${size}px ${size}px 0`,
        borderColor: `transparent ${hex} transparent transparent`,
      };
    case 'right':
      return {
        ...base,
        right: 2,
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: `${size}px 0 ${size}px ${size}px`,
        borderColor: `transparent transparent transparent ${hex}`,
      };
    case 'top':
      return {
        ...base,
        top: 2,
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: `0 ${size}px ${size}px ${size}px`,
        borderColor: `transparent transparent ${hex} transparent`,
      };
    case 'bottom':
      return {
        ...base,
        bottom: 2,
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: `${size}px ${size}px 0 ${size}px`,
        borderColor: `${hex} transparent transparent transparent`,
      };
  }
}

export default memo(CellComponent, (prev, next) => {
  return (
    prev.cell.hits === next.cell.hits &&
    prev.cell.solidified === next.cell.solidified &&
    prev.cell.exposed === next.cell.exposed &&
    prev.hitSide === next.hitSide &&
    prev.solidifySide === next.solidifySide &&
    prev.layerEdges === next.layerEdges &&
    prev.mode === next.mode
  );
});
