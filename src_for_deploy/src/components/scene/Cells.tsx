'use client';

import { Instance, Instances } from '@react-three/drei';
import { useExplorer } from '@/store/useExplorer';

/**
 * HeliaCell - cell sphere visualization
 * 用 drei <Instances> 包装:解决 InstancedMesh setColorAt 的 timing issue
 */
export default function Cells() {
  const dataset = useExplorer(s => s.dataset);
  const selected = useExplorer(s => s.selectedId);
  const setSelected = useExplorer(s => s.setSelected);
  const visibleClusters = useExplorer(s => s.visibleClusters);
  const highlightCluster = useExplorer(s => s.highlightCluster);

  if (!dataset) return null;

  const cellScale = (id: number, cluster: string) => {
    const isSel = id === selected;
    return isSel ? 0.14 : 0.07;
  };

  return (
    <Instances limit={dataset.cells.length} range={dataset.cells.length}>
      <sphereGeometry args={[1, 14, 14]} />
      <meshStandardMaterial roughness={0.4} metalness={0.1} />
      {dataset.cells.map((c) => {
        const cluster = dataset.clusters[c.cluster];
        const isVisible = visibleClusters.size === 0 || visibleClusters.has(c.cluster);
        if (!isVisible) return null;
        const isHi = highlightCluster === null || highlightCluster === c.cluster;
        const color = isHi ? cluster?.color ?? '#888' : '#1a2030';
        const isSel = c.id === selected;
        return (
          <Instance
            key={c.id}
            position={[c.x, c.y, c.z]}
            scale={cellScale(c.id, c.cluster)}
            color={color}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(c.id);
            }}
            // 简化:不接 onPointerOver,选中高亮由 setSelected 触发
          />
        );
      })}
    </Instances>
  );
}
