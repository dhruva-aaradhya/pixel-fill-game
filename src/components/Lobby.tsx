'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Gem, Play, Trophy, PaintBucket, FlipVertical, RectangleVertical } from 'lucide-react';
import { PlayerProgress, Level, GameMode } from '@/types/game';
import HowToPlay from './HowToPlay';

interface LobbyProps {
  levels: Level[];
  progress: PlayerProgress | null;
  onPlay: (levelIndex: number, mode: GameMode) => void;
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

const MODE_OPTIONS: { value: GameMode; label: string; icon: typeof PaintBucket; desc: string }[] = [
  { value: 'fill', label: 'Fill', icon: PaintBucket, desc: 'Color cells from any side' },
  { value: 'flap', label: 'Flap', icon: FlipVertical, desc: 'Knock down flaps from one side' },
  { value: 'domino', label: 'Domino', icon: RectangleVertical, desc: 'Tip over tiles from one side' },
];

export default function Lobby({ levels, progress, onPlay }: LobbyProps) {
  const level = levels[0];
  const best = progress?.bestStats?.[0] ?? null;
  const [selectedMode, setSelectedMode] = useState<GameMode>('fill');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#7b2fff]/20 flex items-center justify-center">
          <Gem className="w-9 h-9 text-[#e0aaff]" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#e0aaff] to-[#7b2fff] bg-clip-text text-transparent">
          Pixel Fill
        </h1>
        <p className="text-white/40 text-sm text-center max-w-[260px]">
          Fill gem containers to reveal the hidden picture
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="w-full max-w-[320px] space-y-4"
      >
        <Card className="bg-[#0d0d1a] border-[#2a2a4a]">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Level 1</span>
              <span className="text-[#e0aaff] font-medium">{level.name}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-white/40">
              <span>{countCells(level)} cells</span>
              <span>{level.layerOrder.length} layers</span>
            </div>

            {best && (
              <div className="pt-2 border-t border-[#2a2a4a] space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#e0aaff]/70">
                  <Trophy className="w-3.5 h-3.5" />
                  Best Run
                </div>
                <div className="flex justify-between text-xs text-white/50">
                  <span>{best.shootersDeployed} shooters</span>
                  <span>{formatTime(best.elapsedMs)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mode selector */}
        <div className="space-y-2">
          <div className="text-xs text-white/40 text-center uppercase tracking-wider">Game Mode</div>
          <div className="flex gap-2">
            {MODE_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSelectedMode(value)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border transition-all duration-200 ${
                  selectedMode === value
                    ? 'bg-[#7b2fff]/20 border-[#7b2fff] text-[#e0aaff]'
                    : 'bg-[#0d0d1a] border-[#2a2a4a] text-white/40 hover:text-white/60 hover:border-[#3a3a5a]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-white/30 text-center">
            {MODE_OPTIONS.find(m => m.value === selectedMode)?.desc}
          </p>
        </div>

        <Button
          onClick={() => onPlay(0, selectedMode)}
          className="w-full h-12 text-lg font-semibold bg-[#7b2fff] hover:bg-[#6b1fff] text-white gap-2 animate-pulse-glow"
          style={{ '--glow-color': 'rgba(123,47,255,0.4)' } as React.CSSProperties}
        >
          <Play className="w-5 h-5" />
          Play
        </Button>

        <div className="flex justify-center">
          <HowToPlay />
        </div>
      </motion.div>
    </div>
  );
}

function countCells(level: Level): number {
  let n = 0;
  for (const row of level.pixelMap) for (const v of row) if (v > 0) n++;
  return n;
}
