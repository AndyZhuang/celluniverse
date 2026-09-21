'use client';

import { useExplorer } from '@/store/useExplorer';
import { cn } from '@/lib/cn';

export default function ClusterLegend() {
  const dataset = useExplorer(s => s.dataset);
  const visible = useExplorer(s => s.visibleClusters);
  const highlightCluster = useExplorer(s => s.highlightCluster);
  const toggleVisible = useExplorer(s => s.toggleClusterVisible);
  const setHighlight = useExplorer(s => s.setHighlightCluster);

  if (!dataset) return null;
  const allNames = Object.keys(dataset.clusters);
  const allVisible = visible.size === 0;

  return (
    <div className="p-4 space-y-1.5 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-widest text-cyan-300/60">Clusters</div>
        <div className="text-[10px] text-cyan-100/40">{allNames.length} total</div>
      </div>
      {allNames.map((name) => {
        const info = dataset.clusters[name];
        const isVisible = allVisible || visible.has(name);
        const isHighlight = highlightCluster === name;
        return (
          <button
            key={name}
            className={cn(
              'flex items-center gap-2 w-full px-2 py-1.5 rounded text-left transition',
              isHighlight ? 'bg-white/8' : 'hover:bg-white/4',
              !isVisible && 'opacity-35',
            )}
            onClick={() => setHighlight(isHighlight ? null : name)}
            onContextMenu={(e) => {
              e.preventDefault();
              toggleVisible(name);
            }}
            title="Click to focus · right-click to toggle visibility"
          >
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ background: info.color, boxShadow: `0 0 8px ${info.color}80` }}
            />
            <span className="text-xs text-cyan-100 flex-1 truncate">{name}</span>
            <span className="text-[10px] text-cyan-100/40 font-mono">{info.ids.length}</span>
          </button>
        );
      })}
      <div className="mt-3 pt-2 border-t border-cyan-300/10 text-[10px] text-cyan-100/35 leading-relaxed">
        Left-click 一个 cluster = focus 其 cells<br />
        Right-click = 切换可见性
      </div>
    </div>
  );
}
