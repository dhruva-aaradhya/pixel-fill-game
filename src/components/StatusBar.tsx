'use client';

import { GameStatus } from '@/types/game';
import { MAX_CONVEYOR } from '@/utils/trackPositions';

interface StatusBarProps {
  status: GameStatus;
  conveyorCount: number;
  conveyorFull: boolean;
  containerNotice: string | null;
  queuesEmpty: boolean;
  holdingHasShooters: boolean;
}

export default function StatusBar({
  status,
  conveyorCount,
  conveyorFull,
  containerNotice,
  queuesEmpty,
  holdingHasShooters,
}: StatusBarProps) {
  let message: string;

  if (status === 'won') {
    message = 'Picture Complete!';
  } else if (status === 'lost') {
    message = 'Holding zone full — Game Over!';
  } else if (containerNotice) {
    message = `${containerNotice} unlocked!`;
  } else if (conveyorFull) {
    message = `Conveyor full (${conveyorCount}/${MAX_CONVEYOR}) — wait for a shooter to finish`;
  } else if (queuesEmpty && holdingHasShooters) {
    message = 'Tap a shooter in the holding zone to re-deploy it!';
  } else if (queuesEmpty && conveyorCount > 0) {
    message = 'Shooters completing their laps...';
  } else {
    message = 'Tap a shooter to send it around the board';
  }

  return (
    <div className="text-center text-sm h-6 text-[#e0aaff]/70 font-medium select-none">
      {message}
    </div>
  );
}
