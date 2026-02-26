'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Shooter, ShooterColor, ColorConfig } from '@/types/game';
import ShooterIcon from './ShooterIcon';
import { Check } from 'lucide-react';

interface ShooterLineProps {
  queues: Record<ShooterColor, Shooter[]>;
  colors: Record<number, ColorConfig>;
  onDeploy: (color: ShooterColor) => void;
  conveyorFull: boolean;
}

const QUEUE_ORDER: ShooterColor[] = ['red', 'purple', 'gold'];

export default function ShooterLine({
  queues,
  colors,
  onDeploy,
  conveyorFull,
}: ShooterLineProps) {
  const colorLookup: Record<ShooterColor, ColorConfig | undefined> = {
    red: colors[3],
    purple: colors[2],
    gold: colors[1],
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs text-white/40 uppercase tracking-wider font-medium">
        Queues
      </div>
      <div className="flex gap-4 items-stretch justify-center">
        {QUEUE_ORDER.map((color) => {
          const queue = queues[color] ?? [];
          const front = queue[0] ?? null;
          const remaining = Math.max(0, queue.length - 1);
          const cfg = colorLookup[color];
          const done = queue.length === 0;

          return (
            <div
              key={color}
              className="flex flex-col items-center gap-1.5 min-w-[52px]"
            >
              <div
                className="w-full rounded-lg px-2 py-2 flex flex-col items-center gap-1"
                style={{
                  background: cfg ? `${cfg.hex}10` : '#ffffff08',
                  border: `1px solid ${cfg ? cfg.hex + '30' : '#ffffff15'}`,
                }}
              >
                <AnimatePresence mode="wait">
                  {front ? (
                    <motion.div
                      key={front.id}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ShooterIcon
                        shooter={front}
                        colors={colors}
                        disabled={conveyorFull}
                        onClick={() => onDeploy(color)}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-[38px] h-[38px] rounded-full flex items-center justify-center"
                      style={{ background: cfg ? `${cfg.hex}20` : '#ffffff10' }}
                    >
                      <Check className="w-4 h-4 text-white/30" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <span
                className="text-[10px] font-medium"
                style={{ color: done ? 'rgba(255,255,255,0.2)' : (cfg?.hex ?? '#fff') }}
              >
                {done ? 'Done' : remaining > 0 ? `+${remaining}` : 'Last'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
