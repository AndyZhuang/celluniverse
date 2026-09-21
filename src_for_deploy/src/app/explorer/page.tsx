'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import TopNav from '@/components/layout/TopNav';
import ClusterLegend from '@/components/panels/ClusterLegend';
import CellDetail from '@/components/panels/CellDetail';
import GenePanel from '@/components/panels/GenePanel';
import { useExplorer } from '@/store/useExplorer';

// 三维场景只能在 client 渲染;ssr=false
const CellUniverse = dynamic(() => import('@/components/scene/CellUniverse'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-cyan-300/40 text-sm">
      加载 3D scene...
    </div>
  ),
});

export default function ExplorerPage() {
  const dataset = useExplorer((s) => s.dataset);
  const loading = useExplorer((s) => s.loading);
  const error = useExplorer((s) => s.error);
  const loadDataset = useExplorer((s) => s.loadDataset);

  useEffect(() => {
    if (!dataset) loadDataset('pbmc-demo');
  }, [dataset, loadDataset]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#06080f] text-cyan-50 overflow-hidden">
      <TopNav />
      <main className="flex-1 flex overflow-hidden">
        {/* 左:cluster legend */}
        <aside className="w-56 border-r border-cyan-300/10 bg-black/20 overflow-hidden">
          <ClusterLegend />
        </aside>

        {/* 中:3D scene */}
        <section className="flex-1 relative">
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-red-400 text-sm">
              数据加载失败: {error}
            </div>
          )}
          {loading && !dataset && (
            <div className="absolute inset-0 flex items-center justify-center text-cyan-300/60 text-sm">
              加载 PBMC demo...
            </div>
          )}
          <CellUniverse />
          <div className="absolute bottom-3 left-3 text-[10px] text-cyan-100/40 font-mono bg-black/40 px-2 py-1 rounded">
            Drag = rotate · Scroll = zoom · Click cell = select
          </div>
        </section>

        {/* 右:detail + gene panel 分两栏 */}
        <aside className="w-72 border-l border-cyan-300/10 bg-black/20 flex flex-col">
          <div className="flex-1 border-b border-cyan-300/5 overflow-hidden">
            <CellDetail />
          </div>
          <div className="h-72 overflow-hidden">
            <GenePanel />
          </div>
        </aside>
      </main>
    </div>
  );
}
