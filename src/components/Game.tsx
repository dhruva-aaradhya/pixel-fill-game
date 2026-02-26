'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { GameState, LayerEdges, Level } from '@/types/game';
import { createGameState, deployFromQueue, deployFromHolding, processConveyorTick } from '@/utils/gameLogic';
import { MAX_CONVEYOR, TICK_MS } from '@/utils/trackPositions';
import Board from './Board';
import HoldingZone from './HoldingZone';
import ShooterLine from './ShooterLine';
import StatusBar from './StatusBar';
import GameOverlay from './GameOverlay';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface GameProps {
  level: Level;
  levelNumber: number;
  onComplete: (stats: GameState['stats'], won: boolean) => void;
  onBack: () => void;
}

function computeLayerEdges(pixelMap: number[][]): LayerEdges[][] {
  const rows = pixelMap.length;
  const cols = rows > 0 ? pixelMap[0].length : 0;
  const result: LayerEdges[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: LayerEdges[] = [];
    for (let c = 0; c < cols; c++) {
      const layer = pixelMap[r][c];
      if (layer === 0) {
        row.push({ top: false, right: false, bottom: false, left: false });
      } else {
        row.push({
          top: r === 0 || pixelMap[r - 1][c] !== layer,
          right: c === cols - 1 || pixelMap[r][c + 1] !== layer,
          bottom: r === rows - 1 || pixelMap[r + 1][c] !== layer,
          left: c === 0 || pixelMap[r][c - 1] !== layer,
        });
      }
    }
    result.push(row);
  }
  return result;
}

export default function Game({ level, levelNumber, onComplete, onBack }: GameProps) {
  const stateRef = useRef<GameState>(createGameState(level, levelNumber));
  const layerEdges = useMemo(() => computeLayerEdges(level.pixelMap), [level]);
  const [, forceRender] = useReducer((x: number) => x + 1, 0);
  const [overlayStatus, setOverlayStatus] = useState<'won' | 'lost' | null>(null);
  const completedRef = useRef(false);
  const [layerNotice, setLayerNotice] = useState<string | null>(null);
  const prevExposedLayers = useRef<Set<number>>(
    new Set(stateRef.current.exposedLayers)
  );

  useEffect(() => {
    stateRef.current = createGameState(level, levelNumber);
    completedRef.current = false;
    prevExposedLayers.current = new Set(stateRef.current.exposedLayers);
    setOverlayStatus(null);
    setLayerNotice(null);
    forceRender();
  }, [level, levelNumber]);

  useEffect(() => {
    let last = 0;
    let acc = 0;
    let frameId: number;

    const MAX_TICKS_PER_FRAME = 3;

    const loop = (t: number) => {
      if (!last) last = t;
      acc += t - last;
      last = t;
      if (acc > TICK_MS * MAX_TICKS_PER_FRAME) acc = TICK_MS * MAX_TICKS_PER_FRAME;

      let ticked = false;
      while (acc >= TICK_MS) {
        stateRef.current = processConveyorTick(stateRef.current);
        acc -= TICK_MS;
        ticked = true;
      }

      if (ticked) {
        const s = stateRef.current;

        const newlyExposed = s.exposedLayers.filter(
          (l) => !prevExposedLayers.current.has(l)
        );
        if (newlyExposed.length > 0) {
          for (const l of s.exposedLayers) prevExposedLayers.current.add(l);
          const cfg = level.colors[newlyExposed[0]];
          if (cfg) {
            const name = cfg.name.charAt(0).toUpperCase() + cfg.name.slice(1);
            setLayerNotice(name);
            setTimeout(() => setLayerNotice(null), 2500);
          }
        }

        forceRender();

        if (!completedRef.current && (s.status === 'won' || s.status === 'lost')) {
          completedRef.current = true;
          const won = s.status === 'won';
          setTimeout(() => {
            setOverlayStatus(won ? 'won' : 'lost');
            onComplete(s.stats, won);
          }, won ? 600 : 300);
        }
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, levelNumber]);

  const handleDeployFromQueue = useCallback((queueIndex: number) => {
    if (stateRef.current.status !== 'playing') return;
    stateRef.current = deployFromQueue(stateRef.current, queueIndex);
    forceRender();
  }, []);

  const handleDeployFromHolding = useCallback((shooterId: string) => {
    if (stateRef.current.status !== 'playing') return;
    stateRef.current = deployFromHolding(stateRef.current, shooterId);
    forceRender();
  }, []);

  const handlePlayAgain = useCallback(() => {
    stateRef.current = createGameState(level, levelNumber);
    completedRef.current = false;
    setOverlayStatus(null);
    forceRender();
  }, [level, levelNumber]);

  const s = stateRef.current;
  const conveyorFull = s.conveyor.length >= MAX_CONVEYOR;

  const queuesEmpty = s.queues.every((q) => q.length === 0);
  const holdingHasShooters = s.holding.some((h) => h !== null);

  return (
    <div className="relative flex flex-col items-center gap-4 py-4 px-2 max-w-[520px] mx-auto select-none">
      <div className="w-full flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1 text-white/40 hover:text-white/70"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="text-sm text-white/30">
          {s.stats.cellsSolidified}/{s.stats.totalCells} filled
        </div>
      </div>

      <StatusBar
        status={s.status}
        conveyorCount={s.conveyor.length}
        conveyorFull={conveyorFull}
        layerNotice={layerNotice}
        queuesEmpty={queuesEmpty}
        holdingHasShooters={holdingHasShooters}
      />

      <Board
        grid={s.grid}
        conveyor={s.conveyor}
        colors={level.colors}
        capacity={s.capacity}
        recentHits={s.recentHits}
        recentSolidified={s.recentSolidified}
        layerEdges={layerEdges}
      />

      <HoldingZone
        holding={s.holding}
        colors={level.colors}
        onDeploy={handleDeployFromHolding}
        conveyorFull={conveyorFull}
        highlight={queuesEmpty && holdingHasShooters && s.status === 'playing'}
      />

      <ShooterLine
        queues={s.queues}
        colors={level.colors}
        onDeploy={handleDeployFromQueue}
        conveyorFull={conveyorFull}
      />

      <GameOverlay
        status={overlayStatus}
        stats={s.stats}
        onPlayAgain={handlePlayAgain}
        onLobby={onBack}
      />
    </div>
  );
}
