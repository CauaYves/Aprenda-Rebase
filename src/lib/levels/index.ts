import { level1 } from "./level-1";
import { level2 } from "./level-2";
import { level3 } from "./level-3";
import { level4 } from "./level-4";
import { level5 } from "./level-5";
import type { Level } from "./types";

export const levels: Level[] = [level1, level2, level3, level4, level5];

export function getLevel(id: number): Level | undefined {
  return levels.find((l) => l.id === id);
}

export type { Level } from "./types";
