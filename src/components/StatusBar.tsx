'use client';

import { GameStatus } from '@/types/game';
import { MAX_CONVEYOR } from '@/utils/trackPositions';

interface StatusBarProps {
  status: GameStatus;
  conveyorCount: number;
  conveyorFull: boolean;
  layerJustOpened: string | null;
}

export default function StatusBar({
  status,
  conveyorCount,
  conveyorFull,
  layerJustOpened,
}: StatusBarProps) {
  let message: string;

  if (status === 'won') {
    message = 'Picture Complete!';
  } else if (status === 'lost') {
    message = 'Holding zone full — Game Over!';
  } else if (layerJustOpened) {
    message = `${layerJustOpened} layer unlocked!`;
  } else if (conveyorFull) {
    message = `Conveyor full (${conveyorCount}/${MAX_CONVEYOR}) — wait for a shooter to finish`;
  } else {
    message = 'Tap a shooter to send it around the board';
  }

  return (
    <div className="text-center text-sm h-6 text-[#e0aaff]/70 font-medium select-none">
      {message}
    </div>
  );
}
