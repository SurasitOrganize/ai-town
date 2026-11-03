export const TILE = 16;
export const MAP_W = 42;
export const MAP_H = 30;

export type TilePoint = { x: number; y: number };

/** Walkable tile in front of each desk. New agents are placed on a free one. */
export const desks: TilePoint[] = [
  { x: 3, y: 5 },
  { x: 9, y: 5 },
  { x: 15, y: 5 },
  { x: 21, y: 5 },
  { x: 3, y: 11 },
  { x: 9, y: 11 },
  { x: 15, y: 11 },
  { x: 21, y: 11 },
  { x: 3, y: 17 },
  { x: 9, y: 17 },
  { x: 15, y: 17 },
];

export const meetingSpots: TilePoint[] = [
  { x: 31, y: 6 },
  { x: 32, y: 6 },
  { x: 30, y: 7 },
  { x: 33, y: 7 },
  { x: 31, y: 8 },
  { x: 32, y: 8 },
];

export const loungeSpots: TilePoint[] = [
  { x: 4, y: 25 },
  { x: 13, y: 25 },
  { x: 25, y: 25 },
  { x: 34, y: 25 },
];

export const playerSpawn: TilePoint = { x: 12, y: 12 };

export const VARIANTS = ['green', 'red', 'purple', 'worker', 'beard', 'band'] as const;

const AVATAR_INDEX: Record<string, number> = {
  green: 0,
  red: 1,
  purple: 2,
  worker: 3,
  beard: 4,
  band: 5,
  '👩‍💻': 1,
  '🧑': 0,
  '👩‍🎨': 1,
  '👩': 1,
  '👔': 2,
  '👨': 2,
  '👨‍💼': 4,
  '📊': 5,
  '👨‍🎨': 3,
};

export function tileToWorld(point: TilePoint) {
  return {
    x: point.x * TILE + TILE / 2,
    y: point.y * TILE + TILE / 2,
  };
}

export function worldToTile(x: number, y: number): TilePoint | null {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  if (x <= MAP_W && y <= MAP_H) return { x: Math.round(x), y: Math.round(y) };
  return { x: Math.round(x / TILE), y: Math.round(y / TILE) };
}

export function emptyDesk(occupied: TilePoint[]): TilePoint {
  const taken = new Set(occupied.map((point) => `${point.x},${point.y}`));
  return desks.find((desk) => !taken.has(`${desk.x},${desk.y}`)) ?? desks[occupied.length % desks.length];
}

/** Avatar strings from the picker or older emoji values select a character. */
export function variantIndex(avatar: string | undefined, index: number) {
  if (avatar && avatar !== '🤖' && AVATAR_INDEX[avatar] !== undefined) {
    return AVATAR_INDEX[avatar];
  }
  return (index % 5) + 1;
}

export function targetTile(agent: { x?: number; y?: number; taskStatus: string }, index: number): TilePoint {
  if (agent.taskStatus === 'meeting') return meetingSpots[index % meetingSpots.length];
  if (agent.taskStatus === 'idle') return loungeSpots[index % loungeSpots.length];
  const tile = agent.x != null && agent.y != null ? worldToTile(agent.x, agent.y) : null;
  if (tile && desks.some((desk) => desk.x === tile.x && desk.y === tile.y)) return tile;
  return desks[index % desks.length];
}
