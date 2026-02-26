'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Shooter, ColorConfig } from '@/types/game';
import ShooterIcon from './ShooterIcon';
import { Check } from 'lucide-react';

interface ShooterLineProps {
  queues: Shooter[][];
  colors: Record<number, ColorConfig>;
  onDeploy: (queueIndex: number) => void;
  conveyorFull: boolean;
}

export default function ShooterLine({
  queues,
  colors,
  onDeploy,
  conveyorFull,
}: ShooterLineProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs text-white/40 uppercase tracking-wider font-medium">
        Queues
      </div>
      <div className="flex gap-4 items-stretch justify-center">
        {queues.map((queue, laneIdx) => {
          const front = queue[0] ?? null;
          const second = queue[1] ?? null;
          const remaining = Math.max(0, queue.length - 2);
          const done = queue.length === 0;

          const frontCfg = front ? colors[front.layer] ?? null : null;
          const secondCfg = second ? colors[second.layer] ?? null : null;
          const borderColor = frontCfg ? frontCfg.hex + '30' : '#ffffff15';
          const bgColor = frontCfg ? `${frontCfg.hex}10` : '#ffffff08';

          return (
            <div
              key={laneIdx}
              className="flex flex-col items-center gap-1.5 min-w-[52px]"
            >
              <div
                className="w-full rounded-lg px-2 py-2 flex flex-col items-center gap-1.5"
                style={{
                  background: bgColor,
                  border: `1px solid ${borderColor}`,
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
                        onClick={() => onDeploy(laneIdx)}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-[38px] h-[38px] rounded-full flex items-center justify-center"
                      style={{ background: '#ffffff10' }}
                    >
                      <Check className="w-4 h-4 text-white/30" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {second && (
                  <div className="opacity-40 scale-75 -mt-1">
                    <ShooterIcon
                      shooter={second}
                      colors={colors}
                      disabled={true}
                      onClick={() => {}}
                    />
                  </div>
                )}
              </div>

              <span
                className="text-[10px] font-medium"
                style={{ color: done ? 'rgba(255,255,255,0.2)' : (frontCfg?.hex ?? '#fff') }}
              >
                {done ? 'Done' : remaining > 0 ? `+${remaining}` : second ? 'Last 2' : 'Last'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
