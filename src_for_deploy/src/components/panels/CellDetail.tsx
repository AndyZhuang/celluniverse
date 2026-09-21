'use client';

import { useMemo } from 'react';
import { useExplorer } from '@/store/useExplorer';
import { codeToColor } from '@/lib/cn';

export default function CellDetail() {
  const dataset = useExplorer(s => s.dataset);
  const selectedId = useExplorer(s => s.selectedId);
  const selectedGenes = useExplorer(s => s.selectedGenes);

  const cell = useMemo(() => {
    if (!dataset || selectedId === null) return null;
    return dataset.cells.find((c) => c.id === selectedId) ?? null;
  }, [dataset, selectedId]);

  if (!dataset || !cell) {
    return (
      <div className="p-5 text-cyan-100/60 text-sm">
        <div className="text-cyan-100/40 italic">Hover or click a cell in the 3D scene →</div>
        <div className="mt-2 text-xs text-cyan-100/30">
          Detail panel will show its cluster, ontology mapping, CellVQ code and top genes.
        </div>
      </div>
    );
  }

  const cluster = dataset.clusters[cell.cluster];
  const codeColor = codeToColor(cell.code);

  // 该 cell 上的基因表达(只显示 selected_genes; 否则显示 top-12)
  const genesToShow = selectedGenes.length > 0 ? selectedGenes : getTopGenes(dataset, cell.id, 12);
  const expression = dataset.expression;

  return (
    <div className="p-5 space-y-4 overflow-y-auto h-full">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-cyan-300/60 mb-1">
          Cell #{cell.id.toString().padStart(4, '0')}
        </div>
        <div
          className="text-2xl font-semibold leading-tight"
          style={{ color: cluster?.color }}
        >
          {cluster?.name ?? cell.cluster}
        </div>
        {cluster?.description && (
          <div className="text-xs text-cyan-100/50 mt-1 italic">{cluster.description}</div>
        )}
        <a
          href={`https://www.ebi.ac.uk/ols4/ontologies/cl/terms?iri=http://purl.obolibrary.org/obo/CL_${encodeURIComponent(cell.cell_type)}`}
          target="_blank"
          rel="noopener"
          className="text-[10px] text-cyan-300/50 hover:text-cyan-200 underline-offset-2 hover:underline mt-1 inline-block"
        >
          Cell Ontology ↗
        </a>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <Stat label="x" value={cell.x.toFixed(3)} />
        <Stat label="y" value={cell.y.toFixed(3)} />
        <Stat label="z" value={cell.z.toFixed(3)} />
      </div>

      <div className="p-3 rounded-lg" style={{ background: codeColor + '15', borderLeft: `3px solid ${codeColor}` }}>
        <div className="text-[10px] uppercase tracking-widest text-cyan-100/50">CellVQ Code</div>
        <div className="text-lg font-mono mt-1" style={{ color: codeColor }}>
          {(cell.code >>> 0).toString(2).padStart(12, '0')}
        </div>
        <div className="text-xs text-cyan-100/40 mt-1">code = {cell.code}</div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-widest text-cyan-100/50 mb-2">
          {selectedGenes.length > 0 ? `Selected ${genesToShow.length} genes` : `Top ${genesToShow.length} marker genes`}
        </div>
        <div className="space-y-1.5">
          {genesToShow.map((g) => {
            const v = expression[g]?.[cell.id] ?? 0;
            const pct = Math.min(1, Math.max(0, v));
            return (
              <div key={g} className="flex items-center gap-2 text-xs">
                <div className="w-16 text-cyan-100/70 font-mono truncate">{g}</div>
                <div className="flex-1 h-1.5 bg-white/5 rounded overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${pct * 100}%`,
                      background: `linear-gradient(90deg, #7cf5c8, #9b8cff)`,
                      opacity: 0.4 + pct * 0.6,
                    }}
                  />
                </div>
                <div className="w-10 text-right text-cyan-300/70 font-mono">{v.toFixed(2)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/3 rounded px-2 py-1.5 border border-cyan-300/10">
      <div className="text-[9px] uppercase text-cyan-100/40">{label}</div>
      <div className="font-mono text-cyan-200 text-xs">{value}</div>
    </div>
  );
}

function getTopGenes(dataset: any, cellId: number, k: number): string[] {
  const arr = dataset.genes as { symbol: string }[];
  const expr = dataset.expression as Record<string, number[]>;
  const scored = arr.map((g) => ({ g: g.symbol, v: expr[g.symbol]?.[cellId] ?? 0 }));
  scored.sort((a, b) => b.v - a.v);
  return scored.slice(0, k).map((s) => s.g);
}
