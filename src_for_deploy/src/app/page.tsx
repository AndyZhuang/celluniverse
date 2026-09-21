'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#06080f] text-cyan-50 flex items-center justify-center p-8">
      <div className="max-w-3xl text-center space-y-8">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-300 via-violet-400 to-pink-400 animate-pulse" />
          <h1 className="text-4xl font-semibold tracking-tight">
            Helia<span className="text-cyan-300">Cell</span>
          </h1>
        </div>
        <p className="text-base text-cyan-100/60 max-w-xl mx-auto leading-relaxed">
          Interactive <strong className="text-cyan-100">3D cell universe</strong> for single-cell foundation models.
          Wander through 1.12×10⁸ cells, click any cell to see its cluster, ontology, CellVQ code and top markers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {[
            {
              t: 'CellVQ / ChrisCell',
              d: 'Soft-VQ quantization turns each cell into a discrete code. We plot the 12-bit code as a binary string you can read.',
              c: '#7cf5c8',
            },
            {
              t: 'TranscriptFormer',
              d: '1.12 × 10⁸ cells × 12 species cross-species generative atlas. We start here as the embedding backbone.',
              c: '#9b8cff',
            },
            {
              t: 'Your own h5ad',
              d: 'Drop your AnnData file, run CellVQ inference in the browser, walk through its cell universe.',
              c: '#ffb86b',
            },
          ].map((b) => (
            <div
              key={b.t}
              className="p-4 rounded-xl border border-cyan-300/10 bg-black/30 hover:bg-black/50 transition"
              style={{ borderTopColor: b.c, borderTopWidth: '2px' }}
            >
              <div className="font-semibold mb-2" style={{ color: b.c }}>{b.t}</div>
              <div className="text-xs text-cyan-100/55 leading-relaxed">{b.d}</div>
            </div>
          ))}
        </div>

        <Link
          href="/explorer"
          className="inline-block mt-2 px-8 py-3 rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-50 hover:bg-cyan-300/20 hover:border-cyan-300 transition font-medium text-sm"
        >
          进入 3D Cell Universe →
        </Link>

        <footer className="text-[10px] text-cyan-100/35 pt-12">
          合曜 AI · science-frontier 探索 · 数据走 CellVQ / TranscriptFormer / UCE / scGPT MIT-licensed 开源模型
        </footer>
      </div>
    </main>
  );
}
