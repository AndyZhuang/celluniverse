'use client';

import { useExplorer } from '@/store/useExplorer';

export default function TopNav() {
  const dataset = useExplorer((s) => s.dataset);
  return (
    <nav className="flex items-center justify-between px-5 py-3 border-b border-cyan-300/10 backdrop-blur-md bg-black/30">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-300 to-violet-400" />
        <div className="font-semibold tracking-wide text-cyan-50">
          CellUniverse
        </div>
        <div className="text-[10px] uppercase tracking-widest text-cyan-300/50 ml-1">
          Cell Universe Explorer
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-cyan-100/60">
        {dataset && (
          <>
            <div>
              <span className="text-cyan-300/60">data</span> ·{' '}
              <span className="text-cyan-50">{dataset.summary.name}</span>
            </div>
            <div>
              <span className="text-cyan-300/60">cells</span> ·{' '}
              <span className="font-mono text-cyan-50">
                {dataset.summary.n_cells.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-cyan-300/60">backend</span> ·{' '}
              <span className="font-mono text-cyan-50 text-[10px]">
                {dataset.summary.generated_by}
              </span>
            </div>
          </>
        )}
        <a
          href="https://github.com/czi-ai/transcriptformer"
          target="_blank"
          rel="noopener"
          className="text-cyan-300/60 hover:text-cyan-100"
        >
          GitHub ↗
        </a>
      </div>
    </nav>
  );
}
