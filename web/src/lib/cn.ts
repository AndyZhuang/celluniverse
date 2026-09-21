// CellUniverse - shared utility helpers
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const HCL_PALETTE = [
  '#7cf5c8', '#9b8cff', '#ffb86b', '#ff7a8a',
  '#4ade80', '#34d399', '#60a5fa', '#fbbf24',
  '#facc15', '#a3a3a3', '#94a3b8', '#f472b6',
];

export function paletteColor(i: number): string {
  return HCL_PALETTE[i % HCL_PALETTE.length];
}

/** 给定 code (任意整数) → codebook bin 颜色 (CellVQ 12-bit code) */
export function codeToColor(code: number): string {
  const hue = (code * 137.508) % 360;  // golden angle
  return `hsl(${hue.toFixed(0)}, 70%, 60%)`;
}

/** cluster 名 → 颜色 (回退到 hue palette) */
export function clusterColor(cluster: string, palette: Record<string, string>): string {
  return palette[cluster] ?? '#888';
}

/** 给定 cell 编号 → 该 cell 在 dense 数组里的索引(快速索引) */
export function indexById<T extends { id: number }>(items: T[]): Map<number, T> {
  const m = new Map<number, T>();
  for (const it of items) m.set(it.id, it);
  return m;
}
