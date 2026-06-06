import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, Sphere, MeshDistortMaterial, Environment } from "@react-three/drei";
import { Suspense, useRef } from "react";
import type { Mesh } from "three";

function Brain() {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const pulse = 1 + Math.sin(t * 1.4) * 0.04;
    ref.current.scale.setScalar(pulse);
    ref.current.rotation.y = t * 0.15;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
      <Sphere ref={ref} args={[1.3, 96, 96]}>
        <MeshDistortMaterial
          color="#ff9a8b"
          emissive="#ffb199"
          emissiveIntensity={0.35}
          distort={0.42}
          speed={1.6}
          roughness={0.15}
          metalness={0.1}
        />
      </Sphere>
      <Sphere args={[1.6, 64, 64]}>
        <meshBasicMaterial color="#ffd2c2" transparent opacity={0.08} />
      </Sphere>
    </Float>
  );
}

function FloatingOrb({ position, color, scale = 0.3 }: { position: [number, number, number]; color: string; scale?: number }) {
  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={1.2}>
      <Sphere args={[scale, 32, 32]} position={position}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.2} />
      </Sphere>
    </Float>
  );
}

export function WellnessUniverse({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={1.2} color="#ffb199" />
          <pointLight position={[-5, -3, 2]} intensity={0.8} color="#c9b6ff" />
          <pointLight position={[0, 4, -3]} intensity={0.5} color="#a8d8ff" />

          <Brain />

          <FloatingOrb position={[-2.6, 1.4, -1]} color="#c9b6ff" scale={0.25} />
          <FloatingOrb position={[2.4, -1.2, -0.5]} color="#a8d8ff" scale={0.32} />
          <FloatingOrb position={[2.8, 1.8, -2]} color="#ffd6a5" scale={0.2} />
          <FloatingOrb position={[-2.2, -1.6, -1.5]} color="#ffb6c1" scale={0.28} />
          <FloatingOrb position={[0, 2.4, -2.5]} color="#b8e6c8" scale={0.18} />

          <Sparkles count={120} scale={[10, 6, 6]} size={2.4} speed={0.35} color="#ffd2c2" />
          <Sparkles count={80} scale={[12, 8, 8]} size={1.6} speed={0.2} color="#c9b6ff" />

          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
}
