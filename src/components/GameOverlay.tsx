'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { GameStats } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Home } from 'lucide-react';

interface GameOverlayProps {
  status: 'won' | 'lost' | null;
  stats: GameStats;
  onPlayAgain: () => void;
  onLobby: () => void;
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function GameOverlay({
  status,
  stats,
  onPlayAgain,
  onLobby,
}: GameOverlayProps) {
  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl p-8 flex flex-col items-center gap-5 max-w-[280px] shadow-2xl"
          >
            {status === 'won' ? (
              <>
                <div className="w-14 h-14 rounded-full bg-[#7b2fff]/20 flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-[#e0aaff]" />
                </div>
                <h2 className="text-2xl font-bold text-[#e0aaff]">
                  Picture Complete!
                </h2>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-red-900/30 flex items-center justify-center">
                  <RotateCcw className="w-7 h-7 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-red-400">
                  Game Over
                </h2>
                <p className="text-sm text-white/50 -mt-3">Holding zone overflowed</p>
              </>
            )}

            <div className="text-sm text-white/60 space-y-1 text-center">
              <div>Shooters deployed: {stats.shootersDeployed}</div>
              <div>Cells filled: {stats.cellsSolidified}/{stats.totalCells}</div>
              <div>Time: {formatTime(stats.elapsedMs)}</div>
            </div>

            <div className="flex gap-3 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onLobby}
                className="gap-1.5"
              >
                <Home className="w-4 h-4" />
                Lobby
              </Button>
              <Button
                size="sm"
                onClick={onPlayAgain}
                className="gap-1.5 bg-[#7b2fff] hover:bg-[#6b1fff] text-white"
              >
                <RotateCcw className="w-4 h-4" />
                {status === 'won' ? 'Play Again' : 'Try Again'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
