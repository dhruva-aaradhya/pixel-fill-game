'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Shooter, ColorConfig } from '@/types/game';
import ShooterIcon from './ShooterIcon';
import { MAX_HOLDING } from '@/utils/trackPositions';

interface HoldingZoneProps {
  holding: (Shooter | null)[];
  colors: Record<number, ColorConfig>;
  onDeploy: (shooterId: string) => void;
  conveyorFull: boolean;
}

export default function HoldingZone({
  holding,
  colors,
  onDeploy,
  conveyorFull,
}: HoldingZoneProps) {
  const occupied = holding.filter(Boolean).length;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs text-white/40 uppercase tracking-wider font-medium">
        Holding {occupied}/{MAX_HOLDING}
      </div>
      <div className="flex gap-3 items-center justify-center min-h-[46px]">
        {holding.map((shooter, i) => (
          <div key={i} className="relative">
            <AnimatePresence mode="wait">
              {shooter ? (
                <motion.div
                  key={shooter.id}
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.3, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ShooterIcon
                    shooter={shooter}
                    colors={colors}
                    disabled={conveyorFull}
                    onClick={() => onDeploy(shooter.id)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={`empty-${i}`}
                  className="rounded-full border-2 border-dashed border-[#2a2a4a]"
                  style={{ width: 38, height: 38 }}
                />
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
