import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { personal } from "../data/portfolio";

const REVEAL_SIZE = 110; // radius of the reveal circle, in pixels
const RING_SCALE = 0.82; // where the gold ring sits, relative to the circle

const edgeFade =
  "radial-gradient(ellipse 70% 75% at 50% 45%, black 60%, transparent 100%)";
const shadowFilter = "grayscale(1) brightness(0.22) contrast(1.3)";

export default function PortraitReveal() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const hovering = useRef(false);

  // Mouse position inside the photo, in %
  const x = useMotionValue(50);
  const y = useMotionValue(50);
  const smoothX = useSpring(x, { stiffness: 300, damping: 30 });
  const smoothY = useSpring(y, { stiffness: 300, damping: 30 });

  // Size of the reveal circle: 0 = closed
  const radius = useSpring(0, { stiffness: 200, damping: 25 });

  // The hole in the top image
  const revealMask = useMotionTemplate`radial-gradient(circle ${radius}px at ${smoothX}% ${smoothY}%, transparent 0%, transparent 65%, black 100%)`;

  // Gold ring: follows the circle and grows/fades with it
  const ringLeft = useMotionTemplate`${smoothX}%`;
  const ringTop = useMotionTemplate`${smoothY}%`;
  const ringSize = useTransform(radius, (r) => r * 2 * RING_SCALE);
  const ringOpacity = useTransform(radius, [0, REVEAL_SIZE], [0, 1]);

  // Gold dust particles
  const [dust, setDust] = useState([]);
  const lastSpawn = useRef(0);
  const nextId = useRef(0);

  const spawnDust = (px, py) => {
    const now = performance.now();
    if (reduce || now - lastSpawn.current < 45) return; // at most ~22 per second
    lastSpawn.current = now;

    const angle = Math.random() * Math.PI * 2;
    const edge = REVEAL_SIZE * RING_SCALE;
    const distance = 20 + Math.random() * 30;

    const particle = {
      id: nextId.current++,
      x: px,
      y: py,
      offsetX: Math.cos(angle) * edge, // start on the ring's edge
      offsetY: Math.sin(angle) * edge,
      driftX: Math.cos(angle) * distance, // then drift outward
      driftY: Math.sin(angle) * distance - 15, // and a little upward
      size: 2 + Math.random() * 3,
    };
    setDust((all) => [...all.slice(-24), particle]); // keep at most 25
  };

  const removeDust = (id) => {
    setDust((all) => all.filter((p) => p.id !== id));
  };

  const moveTo = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    x.set(px);
    y.set(py);
    if (hovering.current) spawnDust(px, py);
  };

  const handleEnter = (e) => {
    hovering.current = true;
    moveTo(e);
    smoothX.jump(x.get());
    smoothY.jump(y.get());
    radius.set(REVEAL_SIZE);
  };

  const handleLeave = (e) => {
    hovering.current = false;
    if (e.pointerType === "touch") {
      setTimeout(() => radius.set(0), 1500);
    } else {
      radius.set(0);
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      onPointerEnter={handleEnter}
      onPointerMove={moveTo}
      onPointerLeave={handleLeave}
      className="relative h-full w-full select-none overflow-hidden"
      style={{ maskImage: edgeFade, WebkitMaskImage: edgeFade }}
    >
      {/* Bottom layer: the real you, with lens zoom */}
      <motion.img
        src={personal.photo}
        alt={`Portrait of ${personal.name}`}
        draggable={false}
        className="absolute inset-0 h-full w-full object-contain"
      />

      {/* Top layer: the masked figure, with a hole where the cursor is */}
      <motion.img
        src={personal.photoMasked || personal.photo}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 h-full w-full object-contain"
        style={{
          maskImage: revealMask,
          WebkitMaskImage: revealMask,
          filter: personal.photoMasked ? "none" : shadowFilter,
        }}
      />

      {/* Gold ring around the reveal */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: ringLeft,
          top: ringTop,
          width: ringSize,
          height: ringSize,
          x: "-50%",
          y: "-50%",
          opacity: ringOpacity,
        }}
      >
        {/* Solid inner ring */}
        <div className="absolute inset-0 rounded-full border border-glow/80 shadow-[0_0_20px_rgba(201,162,75,0.35)]" />

        {/* Rotating dotted ring with four diamonds */}
        <div className="absolute -inset-3 animate-[spin_14s_linear_infinite] motion-reduce:animate-none">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="#e2cc98"
              strokeWidth="0.8"
              strokeDasharray="0.5 4"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-glow" />
          <span className="absolute left-1/2 bottom-0 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45 bg-glow" />
          <span className="absolute top-1/2 left-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-glow" />
          <span className="absolute top-1/2 right-0 h-2 w-2 translate-x-1/2 -translate-y-1/2 rotate-45 bg-glow" />
        </div>
      </motion.div>

      {/* Gold dust */}
      {dust.map((p) => (
        <motion.span
          key={p.id}
          aria-hidden
          className="pointer-events-none absolute rounded-full bg-glow"
          style={{
            left: `calc(${p.x}% + ${p.offsetX}px)`,
            top: `calc(${p.y}% + ${p.offsetY}px)`,
            width: p.size,
            height: p.size,
            boxShadow: "0 0 6px #c9a24b",
          }}
          initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          animate={{ opacity: 0, scale: 0, x: p.driftX, y: p.driftY }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          onAnimationComplete={() => removeDust(p.id)}
        />
      ))}
    </motion.div>
  );
}
