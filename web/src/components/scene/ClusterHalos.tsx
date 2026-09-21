'use client';

import { useExplorer } from '@/store/useExplorer';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * 每个 cluster 一个透明球壳 (halo) — 缓慢呼吸 + 高亮 cluster 亮起
 */
export default function ClusterHalos() {
  const dataset = useExplorer(s => s.dataset);
  const highlightCluster = useExplorer(s => s.highlightCluster);
  const visibleClusters = useExplorer(s => s.visibleClusters);
  const meshRefs = useRef<Map<string, THREE.Mesh>>(new Map());

  // 算每个 cluster 的 centroid + radius
  const clusterBounds = useMemo(() => {
    const out: { name: string; cx: number; cy: number; cz: number; radius: number; color: string }[] = [];
    if (!dataset) return out;
    const allClusters = Object.entries(dataset.clusters);
    for (const [name, info] of allClusters) {
      if (visibleClusters.size > 0 && !visibleClusters.has(name)) continue;
      const cells = dataset.cells.filter((c) => c.cluster === name);
      if (!cells.length) continue;
      let cx = 0, cy = 0, cz = 0;
      for (const c of cells) {
        cx += c.x; cy += c.y; cz += c.z;
      }
      cx /= cells.length; cy /= cells.length; cz /= cells.length;
      let maxD = 0;
      for (const c of cells) {
        const dx = c.x - cx, dy = c.y - cy, dz = c.z - cz;
        const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (d > maxD) maxD = d;
      }
      out.push({ name, cx, cy, cz, radius: maxD + 0.15, color: info.color });
    }
    return out;
  }, [dataset, visibleClusters]);

  // breathing pulse
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (const m of meshRefs.current.values()) {
      const s = 1 + Math.sin(t * 0.8) * 0.04;
      m.scale.setScalar(s);
    }
  });

  return (
    <group>
      {clusterBounds.map((b) => {
        const isHi = highlightCluster === null || highlightCluster === b.name;
        return (
          <mesh
            key={b.name}
            ref={(m) => {
              if (m) meshRefs.current.set(b.name, m);
              else meshRefs.current.delete(b.name);
            }}
            position={[b.cx, b.cy, b.cz]}
            renderOrder={-1}
            visible={isHi}
          >
            <sphereGeometry args={[b.radius, 24, 16]} />
            <meshBasicMaterial
              color={b.color}
              transparent
              opacity={0.08}
              depthWrite={false}
              side={2 /* BackSide */}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}
    </group>
  );
}
