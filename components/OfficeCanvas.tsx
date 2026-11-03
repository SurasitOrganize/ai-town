"use client";

import { useEffect, useRef } from 'react';

export function OfficeCanvas() {
  const gameRef = useRef<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    let game: { destroy: (removeCanvas: boolean) => void; scale: { refresh: () => void } } | null = null;
    let cancelled = false;

    // Dynamic import to avoid SSR issues with Phaser.
    // A cancelled flag covers React remounts that run before the import resolves.
    const initPhaser = async () => {
      const Phaser = await import('phaser');
      const { OfficeScene } = await import('@/lib/game/OfficeScene');
      if (cancelled || !containerRef.current) return;

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: 800,
        height: 600,
        backgroundColor: '#1c1915',
        pixelArt: true,
        antialias: false,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
          },
        },
        render: {
          pixelArt: true,
          antialias: false,
          roundPixels: true,
        },
        scene: OfficeScene,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      };

      game = new Phaser.Game(config);
      gameRef.current = game;
      requestAnimationFrame(() => {
        if (!cancelled) game?.scale.refresh();
      });
    };

    initPhaser();

    const onResize = () => game?.scale.refresh();
    window.addEventListener('resize', onResize);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      if (game) {
        game.destroy(true);
      }
      if (gameRef.current === game) {
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-900">
      <div ref={containerRef} className="office-canvas w-full h-full" />
    </div>
  );
}
