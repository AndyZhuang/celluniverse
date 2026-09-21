'use client';

import { useMemo, useState } from 'react';
import { useExplorer } from '@/store/useExplorer';
import { cn } from '@/lib/cn';

export default function GenePanel() {
  const dataset = useExplorer(s => s.dataset);
  const selected = useExplorer(s => s.selectedGenes);
  const toggle = useExplorer(s => s.toggleGene);
  const selectedPathway = useExplorer(s => s.selectedPathway);
  const setPathway = useExplorer(s => s.setSelectedPathway);
  const [filter, setFilter] = useState('');

  const filteredGenes = useMemo(() => {
    if (!dataset) return [];
    const q = filter.trim().toLowerCase();
    if (!q) return dataset.genes.slice(0, 60);
    return dataset.genes.filter((g) => g.symbol.toLowerCase().includes(q)).slice(0, 60);
  }, [dataset, filter]);

  if (!dataset) return null;
  const selectedSet = new Set(selected);

  return (
    <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-cyan-300/60 mb-2">Pathways</div>
        <div className="flex flex-wrap gap-1.5">
          <button
            className={cn(
              'text-[10px] px-2 py-1 rounded border',
              selectedPathway === null
                ? 'border-cyan-300/60 bg-cyan-300/15 text-cyan-100'
                : 'border-cyan-300/15 text-cyan-100/50 hover:bg-white/5',
            )}
            onClick={() => setPathway(null)}
          >
            None
          </button>
          {dataset.pathways.map((p) => (
            <button
              key={p.hall_mark}
              className={cn(
                'text-[10px] px-2 py-1 rounded border',
                selectedPathway === p.name
                  ? 'border-cyan-300/60 bg-cyan-300/15 text-cyan-100'
                  : 'border-cyan-300/15 text-cyan-100/50 hover:bg-white/5',
              )}
              onClick={() => setPathway(selectedPathway === p.name ? null : p.name)}
              title={p.hall_mark}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-widest text-cyan-300/60 mb-2 flex items-center justify-between">
          <span>Genes</span>
          <span className="text-cyan-100/40">{selected.length}/20 selected</span>
        </div>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="搜索 gene (e.g. CD8A)"
          className="w-full bg-white/5 border border-cyan-300/10 rounded px-2 py-1 text-xs text-cyan-100 placeholder:text-cyan-100/30 focus:outline-none focus:border-cyan-300/40 mb-2"
        />
        <div className="grid grid-cols-4 gap-1">
          {filteredGenes.map((g) => {
            const isOn = selectedSet.has(g.symbol);
            return (
              <button
                key={g.symbol}
                onClick={() => toggle(g.symbol)}
                className={cn(
                  'text-[10px] font-mono py-1 px-1 rounded border transition',
                  isOn
                    ? 'border-cyan-300/60 bg-cyan-300/15 text-cyan-100'
                    : 'border-cyan-300/8 text-cyan-100/50 hover:bg-white/5',
                )}
                title={isOn ? 'click to remove' : 'click to add'}
              >
                {g.symbol}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
