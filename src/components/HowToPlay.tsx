'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, Layers, Target, ArrowRight, Gem, AlertTriangle } from 'lucide-react';

export default function HowToPlay() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-white/50 hover:text-white/80">
          <HelpCircle className="w-4 h-4" />
          How to Play
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a2e] border-[#2a2a4a] text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[#e0aaff]">How to Play</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-white/70">
          <Section icon={<Gem className="w-4 h-4 text-[#ff3355]" />} title="The Board">
            A pixel art picture made of colored gem cells. Fill every cell to reveal the picture.
          </Section>
          <Section icon={<Layers className="w-4 h-4 text-[#c0192c]" />} title="Layers">
            Cells are layered front-to-back. You must solidify the outer layer (red) before the
            inner layer (crimson) becomes accessible, and so on.
          </Section>
          <Section icon={<Target className="w-4 h-4 text-[#ff6eb4]" />} title="Shooters">
            Each shooter has a color and ammo count. Tap it to send it around the board on the
            conveyor track. It fires at matching cells as it passes.
          </Section>
          <Section icon={<ArrowRight className="w-4 h-4 text-[#e0aaff]" />} title="The Conveyor">
            Shooters travel clockwise around the board. If a shooter runs out of ammo mid-loop, it
            vanishes. If it has ammo left after a full loop, it moves to the holding zone.
          </Section>
          <Section icon={<AlertTriangle className="w-4 h-4 text-yellow-400" />} title="Don't Overflow!">
            The holding zone has 5 slots. If a shooter finishes its loop and the holding zone is
            full, the game is over. Deploy the right colors at the right time!
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <div className="font-semibold text-white/90 mb-0.5">{title}</div>
        <div>{children}</div>
      </div>
    </div>
  );
}
