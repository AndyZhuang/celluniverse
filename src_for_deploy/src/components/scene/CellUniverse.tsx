'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import Cells from './Cells';
import { useExplorer } from '@/store/useExplorer';

export default function CellUniverse() {
  const dataset = useExplorer(s => s.dataset);
  const bbox = useMemo(() => {
    if (!dataset) return { r: 4 };
    let max = 0;
    for (const c of dataset.cells) {
      const d2 = c.x * c.x + c.y * c.y + c.z * c.z;
      if (d2 > max) max = d2;
    }
    return { r: Math.sqrt(max) * 1.4 + 0.5 };
  }, [dataset]);

  return (
    <Canvas
      camera={{ position: [0, 0, bbox.r * 1.6], fov: 60, near: 0.01, far: 200 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#06080f']} />
      <fog attach="fog" args={['#06080f', bbox.r * 2.5, bbox.r * 6]} />

      <ambientLight intensity={0.55} />
      <pointLight position={[10, 10, 10]} intensity={1.0} color="#9b8cff" />
      <pointLight position={[-10, -8, -5]} intensity={0.6} color="#7cf5c8" />

      <Suspense fallback={null}>
        <Stars radius={bbox.r * 4} depth={50} count={1200} factor={3} fade speed={0.3} />
        <Cells />
      </Suspense>

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
        minDistance={bbox.r * 0.3}
        maxDistance={bbox.r * 6}
      />
    </Canvas>
  );
}
