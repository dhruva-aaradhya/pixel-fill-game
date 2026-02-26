import { TrackSide } from '@/types/game';

export const CELL_SIZE = 26;
export const GAP = 2;
export const GRID_SIZE = 15;
export const CELL_STEP = CELL_SIZE + GAP; // 28
export const BOARD_PX = GRID_SIZE * CELL_SIZE + (GRID_SIZE - 1) * GAP; // 418
export const TRACK_MARGIN = 36;
export const TRACK_LENGTH = 60;
export const WRAPPER_SIZE = BOARD_PX + TRACK_MARGIN * 2; // 490

export const MAX_CONVEYOR = 5;
export const MAX_HOLDING = 5;
export const LINE_VISIBLE = 3;
export const TICK_MS = 100;

function cellCenter(index: number): number {
  return TRACK_MARGIN + index * CELL_STEP + CELL_SIZE / 2;
}

const ENTRY_EXIT: { x: number; y: number } = {
  x: TRACK_MARGIN / 2,
  y: TRACK_MARGIN + BOARD_PX + TRACK_MARGIN / 2,
};

export function getTrackCoords(trackPos: number): { x: number; y: number } {
  if (trackPos < 0 || trackPos >= TRACK_LENGTH) return ENTRY_EXIT;

  if (trackPos < 15) {
    return { x: TRACK_MARGIN / 2, y: cellCenter(14 - trackPos) };
  } else if (trackPos < 30) {
    return { x: cellCenter(trackPos - 15), y: TRACK_MARGIN / 2 };
  } else if (trackPos < 45) {
    return { x: TRACK_MARGIN + BOARD_PX + TRACK_MARGIN / 2, y: cellCenter(trackPos - 30) };
  } else {
    return { x: cellCenter(59 - trackPos), y: TRACK_MARGIN + BOARD_PX + TRACK_MARGIN / 2 };
  }
}

export function getTrackFiringRule(
  trackPos: number
): { side: TrackSide; rowOrCol: number } | null {
  if (trackPos < 0 || trackPos >= TRACK_LENGTH) return null;

  if (trackPos < 15) return { side: 'left', rowOrCol: 14 - trackPos };
  if (trackPos < 30) return { side: 'top', rowOrCol: trackPos - 15 };
  if (trackPos < 45) return { side: 'right', rowOrCol: trackPos - 30 };
  return { side: 'bottom', rowOrCol: 59 - trackPos };
}
