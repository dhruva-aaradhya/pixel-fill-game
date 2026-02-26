'use client';

import { motion } from 'framer-motion';
import { Shooter, ColorConfig } from '@/types/game';

interface ShooterIconProps {
  shooter: Shooter;
  colors: Record<number, ColorConfig>;
  size?: 'sm' | 'md';
  disabled?: boolean;
  onClick?: () => void;
}

const SIZE_MAP = { sm: 22, md: 38 };

export default function ShooterIcon({
  shooter,
  colors,
  size = 'md',
  disabled = false,
  onClick,
}: ShooterIconProps) {
  const cfg = colors[shooter.layer];
  if (!cfg) return null;

  const px = SIZE_MAP[size];
  const fontSize = size === 'sm' ? 9 : 13;

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.12 } : undefined}
      whileTap={!disabled ? { scale: 0.92 } : undefined}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="relative flex items-center justify-center rounded-full border-0 font-bold select-none"
      style={{
        width: px,
        height: px,
        fontSize,
        background: disabled
          ? '#333'
          : `linear-gradient(135deg, ${cfg.hex} 40%, #fff8 100%)`,
        color: 'white',
        textShadow: '0 1px 3px rgba(0,0,0,0.6)',
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : `0 0 8px ${cfg.glow}`,
      }}
    >
      {shooter.ammo}
    </motion.button>
  );
}
