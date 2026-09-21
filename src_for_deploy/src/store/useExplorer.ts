'use client';

import { create } from 'zustand';
import type { Dataset } from '@/lib/types';

interface ExplorerState {
  dataset: Dataset | null;
  loading: boolean;
  error: string | null;
  selectedId: number | null;
  /** 选中的基因 (右侧 panel 高亮表达) */
  selectedGenes: string[];
  /** 选中的 pathway (高亮 cluster 上 color) */
  selectedPathway: string | null;
  /** 当前 hover 的 cluster (左侧 legend 联动) */
  highlightCluster: string | null;
  /** 当前可见 cluster 集合 (空 = 全部) */
  visibleClusters: Set<string>;

  loadDataset: (id: string) => Promise<void>;
  setSelected: (id: number | null) => void;
  setSelectedGenes: (g: string[]) => void;
  toggleGene: (g: string) => void;
  setSelectedPathway: (p: string | null) => void;
  setHighlightCluster: (c: string | null) => void;
  toggleClusterVisible: (c: string) => void;
}

export const useExplorer = create<ExplorerState>((set, get) => ({
  dataset: null,
  loading: false,
  error: null,
  selectedId: null,
  selectedGenes: [],
  selectedPathway: null,
  highlightCluster: null,
  visibleClusters: new Set(),

  loadDataset: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const url = `/data/${id}.json`;
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const ds = (await r.json()) as Dataset;
      set({ dataset: ds, loading: false, visibleClusters: new Set() });
    } catch (e) {
      set({ loading: false, error: String(e) });
    }
  },

  setSelected: (id) => set({ selectedId: id }),
  setSelectedGenes: (g) => set({ selectedGenes: g }),
  toggleGene: (g) =>
    set((s) => {
      const next = new Set(s.selectedGenes);
      next.has(g) ? next.delete(g) : next.add(g);
      return { selectedGenes: Array.from(next).slice(0, 20) };
    }),
  setSelectedPathway: (p) => set({ selectedPathway: p }),
  setHighlightCluster: (c) => set({ highlightCluster: c }),
  toggleClusterVisible: (c) =>
    set((s) => {
      const next = new Set(s.visibleClusters);
      if (s.visibleClusters.size === 0) {
        // currently all visible: build full set minus c
        for (const name of Object.keys(s.dataset?.clusters ?? {})) next.add(name);
        next.delete(c);
      } else {
        next.has(c) ? next.delete(c) : next.add(c);
      }
      // 全部可见 / 全部隐藏 / 部分可见 三态判断
      const all = new Set(Object.keys(s.dataset?.clusters ?? {}));
      if (next.size === all.size) next.clear(); // empty = all visible
      return { visibleClusters: next };
    }),
}));
