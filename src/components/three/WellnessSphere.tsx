import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import type { Mesh } from "three";

function Core({ score }: { score: number }) {
  const ref = useRef<Mesh>(null);
  // color from red (low) -> amber (mid) -> sage (high)
  const color = useMemo(() => {
    if (score >= 75) return "#9cd9b1";
    if (score >= 50) return "#ffd28a";
    return "#ff9a8b";
  }, [score]);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.rotation.y = t * 0.3;
    ref.current.rotation.x = Math.sin(t * 0.5) * 0.2;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.5}>
      <Sphere ref={ref} args={[1, 96, 96]}>
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          distort={0.35}
          speed={2}
          roughness={0.1}
        />
      </Sphere>
      <Sphere args={[1.35, 64, 64]}>
        <meshBasicMaterial color={color} transparent opacity={0.1} />
      </Sphere>
    </Float>
  );
}

export function WellnessSphere({ score, className }: { score: number; className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <pointLight position={[3, 3, 3]} intensity={1} color="#ffd2c2" />
          <pointLight position={[-3, -2, 2]} intensity={0.6} color="#c9b6ff" />
          <Core score={score} />
        </Suspense>
      </Canvas>
    </div>
  );
}
