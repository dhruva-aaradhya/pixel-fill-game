'use client';

import { useCallback, useEffect, useState } from 'react';
import { PlayerProgress, ScreenState, GameStats } from '@/types/game';
import { LEVELS } from '@/utils/levelData';
import Lobby from '@/components/Lobby';
import Game from '@/components/Game';

const STORAGE_KEY = 'pixel-fill-progress';

function loadProgress(): PlayerProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProgress(p: PlayerProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch { /* ignore */ }
}

export default function Home() {
  const [screen, setScreen] = useState<ScreenState>('lobby');
  const [levelIndex, setLevelIndex] = useState(0);
  const [progress, setProgress] = useState<PlayerProgress | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const handlePlay = useCallback((idx: number) => {
    setLevelIndex(idx);
    setScreen('game');
  }, []);

  const handleBack = useCallback(() => {
    setScreen('lobby');
  }, []);

  const handleComplete = useCallback(
    (stats: GameStats, won: boolean) => {
      if (!won) return;

      const prev = loadProgress();
      const best = prev?.bestStats?.[levelIndex];
      const isBetter =
        !best || stats.shootersDeployed < best.shootersDeployed;

      const updated: PlayerProgress = {
        highestLevel: Math.max(prev?.highestLevel ?? 0, levelIndex + 1),
        bestStats: {
          ...(prev?.bestStats ?? {}),
          [levelIndex]: isBetter ? stats : best!,
        },
      };

      saveProgress(updated);
      setProgress(updated);
    },
    [levelIndex]
  );

  const level = LEVELS[levelIndex];
  if (!level) return null;

  if (screen === 'lobby') {
    return (
      <Lobby
        levels={LEVELS}
        progress={progress}
        onPlay={handlePlay}
      />
    );
  }

  return (
    <Game
      level={level}
      levelNumber={levelIndex + 1}
      onComplete={handleComplete}
      onBack={handleBack}
    />
  );
}
