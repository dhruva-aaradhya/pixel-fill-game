'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ConveyorShooter, ColorConfig } from '@/types/game';
import { getTrackCoords, TRACK_MARGIN, BOARD_PX } from '@/utils/trackPositions';

interface ConveyorTrackProps {
  conveyor: ConveyorShooter[];
  colors: Record<number, ColorConfig>;
}

const ICON_SIZE = 22;

export default function ConveyorTrack({ conveyor, colors }: ConveyorTrackProps) {
  return (
    <>
      {/* Track path outline */}
      <div
        className="absolute pointer-events-none rounded-lg border-2 border-[#2a2a4a]/60"
        style={{
          top: TRACK_MARGIN / 2 - 4,
          left: TRACK_MARGIN / 2 - 4,
          width: BOARD_PX + TRACK_MARGIN + 8,
          height: BOARD_PX + TRACK_MARGIN + 8,
        }}
      />

      {/* Shooter icons on track */}
      <AnimatePresence>
        {conveyor.map((s) => {
          const pos = getTrackCoords(s.trackPos);
          const cfg = colors[s.layer];
          if (!cfg) return null;

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                x: pos.x - ICON_SIZE / 2,
                y: pos.y - ICON_SIZE / 2,
                opacity: 1,
                scale: 1,
              }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{ x: { duration: 0.095, ease: 'linear' }, y: { duration: 0.095, ease: 'linear' }, opacity: { duration: 0.15 }, scale: { duration: 0.15 } }}
              className="absolute flex items-center justify-center rounded-full font-bold z-10 pointer-events-none"
              style={{
                width: ICON_SIZE,
                height: ICON_SIZE,
                fontSize: 9,
                background: `linear-gradient(135deg, ${cfg.hex} 40%, #fff8 100%)`,
                color: 'white',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                boxShadow: `0 0 10px ${cfg.glow}`,
              }}
            >
              {s.ammo}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </>
  );
}
