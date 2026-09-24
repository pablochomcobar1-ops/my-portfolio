import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { personal } from "../data/portfolio";

const isTouch = window.matchMedia("(pointer: coarse)").matches;
const SAMPLES = isTouch ? 90 : 140; // dots across the photo's width
const HEIGHT = 4; // portrait height in 3D units
const INFLUENCE = 0.6; // how close the mouse must be to scatter dots
const BRIGHTEN = 1.3; // makes the photo brighter on the dark background

// Reads the photo and turns every visible pixel into a dot
function usePortrait(src) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const w = SAMPLES;
      const h = Math.round((SAMPLES * img.height) / img.width);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      const pixels = ctx.getImageData(0, 0, w, h).data;

      const spacing = HEIGHT / h;
      const positions = [];
      const colors = [];
      const color = new THREE.Color();

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          if (pixels[i + 3] < 128) continue; // skip transparent pixels

          const r = pixels[i] / 255;
          const g = pixels[i + 1] / 255;
          const b = pixels[i + 2] / 255;
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

          positions.push(
            (x - w / 2) * spacing,
            (h / 2 - y) * spacing,
            (brightness - 0.5) * 0.4,
          );
          color.setRGB(
            Math.min(r * BRIGHTEN, 1),
            Math.min(g * BRIGHTEN, 1),
            Math.min(b * BRIGHTEN, 1),
            THREE.SRGBColorSpace,
          );
          colors.push(color.r, color.g, color.b);
        }
      }

      setData({
        home: new Float32Array(positions),
        colors: new Float32Array(colors),
        count: positions.length / 3,
        width: w * spacing,
        spacing,
      });
    };
    img.onerror = () => console.warn(`Could not load photo: ${src}`);
  }, [src]);

  return data;
}

function Portrait({ data, calm }) {
  const group = useRef();
  const points = useRef();
  const plane = useRef();
  const { viewport } = useThree();
  const { home, colors, count, width, spacing } = data;

  const scale = Math.min(
    (viewport.height * 0.85) / HEIGHT,
    (viewport.width * 0.9) / width,
  );

  const scatter = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < arr.length; i++) arr[i] = (Math.random() - 0.5) * 10;
    return arr;
  }, [count]);

  const current = useMemo(
    () => (calm ? home.slice() : scatter.slice()),
    [home, scatter, calm],
  );

  // Real mouse position on the page, straight from the browser
  const mouse = useRef({ x: -9999, y: -9999, time: 0, active: false });
  const tmp = useMemo(
    () => ({ ndc: new THREE.Vector2(), local: new THREE.Vector3() }),
    [],
  );

  useEffect(() => {
    const m = mouse.current;
    const onMove = (e) => {
      m.x = e.clientX;
      m.y = e.clientY;
      m.time = performance.now();
    };
    const onLeave = () => {
      m.x = -9999;
      m.y = -9999;
    };
    const onClick = () => {
      // Shatter only if the click is on the photo
      if (m.active && !calm) {
        points.current.geometry.attributes.position.array.set(scatter);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onMove);
    window.addEventListener("click", onClick);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("click", onClick);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [calm, scatter]);

  useFrame((state) => {
    const { camera, raycaster, gl, clock } = state;
    const t = clock.elapsedTime;
    const g = group.current;
    const m = mouse.current;

    // Mouse position relative to the 3D box: -1 = left/bottom edge, 1 = right/top edge
    const rect = gl.domElement.getBoundingClientRect();
    const hasMouse = m.x > -9999;
    const nx = ((m.x - rect.left) / rect.width) * 2 - 1;
    const ny = -((m.y - rect.top) / rect.height) * 2 + 1;

    // Turn toward the mouse, limited so it never turns too far
    const px = hasMouse ? THREE.MathUtils.clamp(nx, -1, 1) : 0;
    const py = hasMouse ? THREE.MathUtils.clamp(ny, -1, 1) : 0;
    const targetY = isTouch ? (calm ? 0 : Math.sin(t * 0.5) * 0.25) : px * 0.35;
    const targetX = isTouch ? 0 : -py * 0.2;
    g.rotation.y += (targetY - g.rotation.y) * 0.05;
    g.rotation.x += (targetX - g.rotation.x) * 0.05;
    g.updateMatrixWorld();

    // Check 1: is the mouse inside the 3D box at all?
    // Check 2: does a line from the camera through the mouse really hit the photo?
    let active = false;
    const recent = !isTouch || performance.now() - m.time < 1500;
    if (hasMouse && recent && Math.abs(nx) <= 1 && Math.abs(ny) <= 1) {
      tmp.ndc.set(nx, ny);
      raycaster.setFromCamera(tmp.ndc, camera);
      const hit = raycaster.intersectObject(plane.current, false)[0];
      if (hit) {
        tmp.local.copy(hit.point);
        g.worldToLocal(tmp.local); // convert to the photo's own coordinates
        active = true;
      }
    }
    m.active = active;

    const mx = active ? tmp.local.x : 9999;
    const my = active ? tmp.local.y : 9999;

    const pos = points.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const bx = home[i3],
        by = home[i3 + 1],
        bz = home[i3 + 2];
      let x = bx,
        y = by,
        z = bz;

      if (!calm) z += Math.sin(t * 1.5 + bx * 2 + by) * 0.03;

      const dx = bx - mx;
      const dy = by - my;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < INFLUENCE && d > 0.0001) {
        const s = 1 - d / INFLUENCE;
        x += (dx / d) * s * 0.8;
        y += (dy / d) * s * 0.8;
        z += s * 0.3;
      }

      pos[i3] += (x - pos[i3]) * 0.08;
      pos[i3 + 1] += (y - pos[i3 + 1]) * 0.08;
      pos[i3 + 2] += (z - pos[i3 + 2]) * 0.08;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group ref={group} scale={scale}>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[current, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={spacing * scale * 1.5}
          vertexColors
          sizeAttenuation
        />
      </points>

      {/* Invisible surface the size of the photo, used to test if the mouse is on it */}
      <mesh ref={plane}>
        <planeGeometry args={[width, HEIGHT]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function ScenePortrait() {
  const calm = useReducedMotion();
  const data = usePortrait(personal.photo);

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={isTouch ? [1, 1.5] : [1, 2]}
    >
      {data && <Portrait data={data} calm={calm} />}
    </Canvas>
  );
}
