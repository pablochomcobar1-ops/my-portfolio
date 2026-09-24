import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";

function Blob({ calm }) {
  const ref = useRef();

  // Runs every frame (about 60 times per second)
  useFrame((state) => {
    const { x, y } = state.pointer; // mouse position from -1 to 1
    // Move part of the way toward the target each frame = smooth easing
    ref.current.rotation.y += (x * 0.6 - ref.current.rotation.y) * 0.05;
    ref.current.rotation.x += (-y * 0.4 - ref.current.rotation.x) * 0.05;
  });

  return (
    <Float speed={calm ? 0 : 2} rotationIntensity={0.4} floatIntensity={1.2}>
      {/* The liquid shape */}
      <mesh ref={ref} scale={1.7}>
        <icosahedronGeometry args={[1, 64]} />
        <MeshDistortMaterial
          color="#ffb547"
          distort={0.35}
          speed={calm ? 0 : 2}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* Wireframe shell around it */}
      <mesh scale={2.6}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#5eead4"
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>
    </Float>
  );
}

export default function Scene() {
  const calm = useReducedMotion();

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 2]}
      eventSource={document.getElementById("root")}
      eventPrefix="client"
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 3, 5]} intensity={2} />
      <directionalLight
        position={[-3, -2, 2]}
        intensity={1.5}
        color="#5eead4"
      />

      <Blob calm={calm} />
      <Sparkles
        count={60}
        scale={8}
        size={2}
        speed={calm ? 0 : 0.4}
        color="#e9e7f2"
      />
    </Canvas>
  );
}
