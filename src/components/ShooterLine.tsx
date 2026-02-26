'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Shooter, ColorConfig } from '@/types/game';
import ShooterIcon from './ShooterIcon';
import { Badge } from '@/components/ui/badge';
import { LINE_VISIBLE } from '@/utils/trackPositions';

interface ShooterLineProps {
  line: Shooter[];
  colors: Record<number, ColorConfig>;
  onDeploy: (shooterId: string) => void;
  conveyorFull: boolean;
}

export default function ShooterLine({
  line,
  colors,
  onDeploy,
  conveyorFull,
}: ShooterLineProps) {
  const visible = line.slice(0, LINE_VISIBLE);
  const remaining = Math.max(0, line.length - LINE_VISIBLE);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs text-white/40 uppercase tracking-wider font-medium">
        Queue {line.length} left
      </div>
      <div className="flex gap-3 items-center justify-center min-h-[46px]">
        <AnimatePresence>
          {visible.map((shooter) => (
            <motion.div
              key={shooter.id}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ShooterIcon
                shooter={shooter}
                colors={colors}
                disabled={conveyorFull}
                onClick={() => onDeploy(shooter.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {remaining > 0 && (
          <Badge variant="secondary" className="text-xs opacity-50">
            +{remaining}
          </Badge>
        )}

        {line.length === 0 && (
          <span className="text-sm text-white/30">Empty</span>
        )}
      </div>
    </div>
  );
}
