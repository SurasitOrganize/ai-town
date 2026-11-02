"use client";

import { useEffect, useRef } from 'react';

export function OfficeCanvas() {
  const gameRef = useRef<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    // Dynamic import to avoid SSR issues with Phaser
    const initPhaser = async () => {
      const Phaser = await import('phaser');
      const { OfficeScene } = await import('@/lib/game/OfficeScene');

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current!,
        width: 800,
        height: 600,
        backgroundColor: '#2d2d2d',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
          },
        },
        scene: OfficeScene,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      };

      gameRef.current = new Phaser.Game(config);
    };

    initPhaser();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-900">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
