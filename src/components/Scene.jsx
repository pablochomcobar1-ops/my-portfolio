import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";

// true on phones and tablets (touch screens)
const isTouch = window.matchMedia("(pointer: coarse)").matches;

function Blob({ calm }) {
  const ref = useRef();

  useFrame((state) => {
    let x, y;
    if (isTouch) {
      // No mouse on phones: drift slowly on its own
      const t = state.clock.elapsedTime;
      x = calm ? 0 : Math.sin(t * 0.4) * 0.8;
      y = calm ? 0 : Math.cos(t * 0.3) * 0.5;
    } else {
      x = state.pointer.x;
      y = state.pointer.y;
    }
    ref.current.rotation.y += (x * 0.6 - ref.current.rotation.y) * 0.05;
    ref.current.rotation.x += (-y * 0.4 - ref.current.rotation.x) * 0.05;
  });

  return (
    <Float speed={calm ? 0 : 2} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={ref} scale={1.7}>
        <icosahedronGeometry args={[1, isTouch ? 32 : 64]} />
        <MeshDistortMaterial
          color="#ffb547"
          distort={0.35}
          speed={calm ? 0 : 2}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

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
      dpr={isTouch ? [1, 1.5] : [1, 2]}
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
        count={isTouch ? 30 : 60}
        scale={8}
        size={2}
        speed={calm ? 0 : 0.4}
        color="#e9e7f2"
      />
    </Canvas>
  );
}
