'use client';

import { Instance, Instances } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useExplorer } from '@/store/useExplorer';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import ClusterHalos from './ClusterHalos';
import MolecularParticles from './MolecularParticles';

/**
 * Cell Universe - 3D cell visualization
 *
 * 每个 cell 是三层结构:
 *   1. cytoplasm — 不规则椭球(细胞主体),用 InstancedMesh 缩放 + 旋转
 *   2. nucleus — 内部小球(细胞核),组成 "nucleus inside" 的生物直觉
 *   3. cilia — 12 根 ovoid 倒刺(伸出细胞边缘,表现细胞活态)
 *
 * 同时每个 cluster 有一个 halo(透明 radial glow)。
 * 背景是 mRNA molecular particles 的稀疏点云。
 */
export default function Cells() {
  const dataset = useExplorer(s => s.dataset);
  const selected = useExplorer(s => s.selectedId);
  const setSelected = useExplorer(s => s.setSelected);
  const visibleClusters = useExplorer(s => s.visibleClusters);
  const highlightCluster = useExplorer(s => s.highlightCluster);

  // per-cell 形状参数 (固定一次,在 mount 时用)
  const cellShape = useMemo(() => {
    if (!dataset) return [] as Float32Array[];
    return dataset.cells.map((c) => {
      const h = ((c.id * 7919 + 13) % 97) / 97;
      const r = ((c.id * 4057 + 31) % 97) / 97;
      // 椭球参数 — y 轴略长(蛋形),x/z 各异以让 cluster 内形状多变
      const ax = 0.06 + r * 0.025;
      const ay = 0.09 + h * 0.04;
      const az = 0.06 + (r + h * 0.5) * 0.025;
      return new Float32Array([
        ax, ay, az,
        h * Math.PI * 2, r * Math.PI * 2, (h + r) * Math.PI,
      ]);
    });
  }, [dataset]);

  const visible = useMemo(() => {
    if (!dataset) return [];
    return dataset.cells.filter(
      (c) => visibleClusters.size === 0 || visibleClusters.has(c.cluster),
    );
  }, [dataset, visibleClusters]);

  if (!dataset) return null;

  const isHi = (cluster: string) =>
    highlightCluster === null || highlightCluster === cluster;

  return (
    <group>
      {/* 每个 cluster 透明光晕 (虚 HaloSphere) */}
      <ClusterHalos />

      {/* 背景 mRNA 粒子 */}
      <MolecularParticles />

      {/* 细胞主群 — 椭球 cytoplasm + 内部 nucleus */}
      {visible.map((c) => {
        const cluster = dataset.clusters[c.cluster];
        const hi = isHi(c.cluster);
        const color = hi ? cluster?.color ?? '#888' : '#1a2030';
        const accent = brightenColor(color, 1.7);
        const dim = dimmerColor(color, 0.5);
        const params = cellShape[c.id];
        const scale = selected === c.id ? 1.6 : 1.0;
        return (
          <SingleCell
            key={c.id}
            position={[c.x, c.y, c.z]}
            rotation={params ? [params[3], params[4], params[5]] : [0, 0, 0]}
            ax={params ? params[0] * scale : 0.08}
            ay={params ? params[1] * scale : 0.1}
            az={params ? params[2] * scale : 0.08}
            color={color}
            accent={accent}
            dim={dim}
            highlight={hi}
            isSelected={c.id === selected}
            onClick={() => setSelected(c.id)}
          />
        );
      })}
    </group>
  );
}

function SingleCell({
  position,
  rotation,
  ax,
  ay,
  az,
  color,
  accent,
  dim,
  highlight,
  isSelected,
  onClick,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  ax: number;
  ay: number;
  az: number;
  color: string;
  accent: string;
  dim: string;
  highlight: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const ciliaRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 纤毛(cilia) — 12 个小突刺围绕细胞表面
  const CILIA_COUNT = 8;

  // 微旋转让细胞感觉活着
  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.05;
    }
  });

  // 在 mount 时把 cilia instances set 上去
  const ciliaReady = useRef(false);
  const setCilia = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh || ciliaReady.current) return;
    for (let i = 0; i < CILIA_COUNT; i++) {
      const angle = (i / CILIA_COUNT) * Math.PI * 2;
      const r = Math.max(ax, ay, az) * 1.05;
      dummy.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      dummy.scale.setScalar(0.012 + (isSelected ? 0.006 : 0));
      dummy.lookAt(Math.cos(angle) * r * 4, 0, Math.sin(angle) * r * 4);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    ciliaReady.current = true;
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* 细胞质(椭球)— 主体 */}
      <mesh scale={[ax * 2, ay * 2, az * 2]}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshStandardMaterial
          color={highlight ? color : dim}
          roughness={0.35}
          metalness={0.25}
          emissive={isSelected ? color : '#000'}
          emissiveIntensity={isSelected ? 0.4 : 0}
          transparent={!highlight}
          opacity={highlight ? 0.92 : 0.25}
        />
      </mesh>

      {/* 细胞核(内嵌小椭球) */}
      <mesh scale={[ax * 0.85, ay * 0.65, az * 0.85]}>
        <sphereGeometry args={[1, 14, 12]} />
        <meshStandardMaterial
          color={highlight ? accent : '#0a0e16'}
          roughness={0.5}
          metalness={0.15}
          emissive={highlight ? accent : '#000'}
          emissiveIntensity={highlight ? 0.25 : 0}
        />
      </mesh>

      {/* 纤毛(cilia)— 8 个 ovoid 短刺 */}
      <instancedMesh
        ref={setCilia}
        args={[undefined, undefined, CILIA_COUNT]}
      >
        <coneGeometry args={[0.4, 1, 6]} />
        <meshStandardMaterial
          color={accent}
          roughness={0.6}
          metalness={0.1}
        />
      </instancedMesh>
    </group>
  );
}

/* color 工具 */
function brightenColor(hex: string, k: number): string {
  const c = new THREE.Color(hex);
  c.r = Math.min(1, c.r * k);
  c.g = Math.min(1, c.g * k);
  c.b = Math.min(1, c.b * k);
  return `#${c.getHexString()}`;
}

function dimmerColor(hex: string, k: number): string {
  const c = new THREE.Color(hex);
  c.r = c.r * k;
  c.g = c.g * k;
  c.b = c.b * k;
  return `#${c.getHexString()}`;
}
