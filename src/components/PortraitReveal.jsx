import { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { personal } from "../data/portfolio";

const isTouch = window.matchMedia("(pointer: coarse)").matches;

const REVEAL_SIZE = 110; // radius of the hover circle, in pixels
const RING_SCALE = 0.82; // where the gold ring sits, relative to the circle
const CENTER_X = 50; // where the full reveal starts (% of the photo)
const CENTER_Y = 45;

const hoverSpring = { type: "spring", stiffness: 200, damping: 25 };
const smoothEase = [0.65, 0, 0.35, 1]; // slow start, fast middle, slow end

const edgeFade =
  "radial-gradient(ellipse 70% 75% at 50% 45%, black 60%, transparent 100%)";
const shadowFilter = "grayscale(1) brightness(0.22) contrast(1.3)";

export default function PortraitReveal() {
  const stage = useRef(null);
  const reduce = useReducedMotion();
  const hovering = useRef(false);

  // While true, hover is ignored (during the animation, and while fully unmasked)
  const locked = useRef(false);
  const [unmasked, setUnmasked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [flashKey, setFlashKey] = useState(0);

  // Circle position, in %
  const x = useMotionValue(50);
  const y = useMotionValue(50);
  const smoothX = useSpring(x, { stiffness: 300, damping: 30 });
  const smoothY = useSpring(y, { stiffness: 300, damping: 30 });

  // Circle size in pixels: 0 = closed
  const radius = useMotionValue(0);

  const revealMask = useMotionTemplate`radial-gradient(circle ${radius}px at ${smoothX}% ${smoothY}%, transparent 0%, transparent 65%, black 100%)`;

  // Gold ring: fades in with the hover circle, then fades out as it flies outward
  const ringLeft = useMotionTemplate`${smoothX}%`;
  const ringTop = useMotionTemplate`${smoothY}%`;
  const ringSize = useTransform(radius, (r) => r * 2 * RING_SCALE);
  const ringOpacity = useTransform(
    radius,
    [0, REVEAL_SIZE, REVEAL_SIZE * 3, REVEAL_SIZE * 6],
    [0, 1, 0.8, 0],
  );

  // ---------- Gold dust ----------
  const [dust, setDust] = useState([]);
  const lastSpawn = useRef(0);
  const nextId = useRef(0);

  const addDust = (particles) => {
    setDust((all) => [...all, ...particles].slice(-60)); // keep at most 60
  };

  const removeDust = (id) => {
    setDust((all) => all.filter((p) => p.id !== id));
  };

  // One spark from the ring's edge (while hovering)
  const spawnDust = (px, py) => {
    const now = performance.now();
    if (reduce || now - lastSpawn.current < 45) return;
    lastSpawn.current = now;

    const angle = Math.random() * Math.PI * 2;
    const edge = REVEAL_SIZE * RING_SCALE;
    const distance = 20 + Math.random() * 30;

    addDust([
      {
        id: nextId.current++,
        x: px,
        y: py,
        offsetX: Math.cos(angle) * edge,
        offsetY: Math.sin(angle) * edge,
        driftX: Math.cos(angle) * distance,
        driftY: Math.sin(angle) * distance - 15,
        size: 2 + Math.random() * 3,
        duration: 0.9,
      },
    ]);
  };

  // Many sparks exploding from the center (for the full reveal)
  const burstDust = (count) => {
    if (reduce) return;
    addDust(
      Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 140;
        return {
          id: nextId.current++,
          x: CENTER_X,
          y: CENTER_Y,
          offsetX: 0,
          offsetY: 0,
          driftX: Math.cos(angle) * distance,
          driftY: Math.sin(angle) * distance,
          size: 2 + Math.random() * 4,
          duration: 1.2 + Math.random() * 0.6,
        };
      }),
    );
  };

  // ---------- Hover ----------
  const moveTo = (e) => {
    if (locked.current) return;
    const rect = stage.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    x.set(px);
    y.set(py);
    if (hovering.current) spawnDust(px, py);
  };

  const handleEnter = (e) => {
    if (locked.current) return;
    hovering.current = true;
    moveTo(e);
    smoothX.jump(x.get());
    smoothY.jump(y.get());
    animate(radius, REVEAL_SIZE, hoverSpring);
  };

  const handleLeave = (e) => {
    hovering.current = false;
    if (locked.current) return;
    const close = () => {
      if (!locked.current) animate(radius, 0, hoverSpring);
    };
    if (e.pointerType === "touch") setTimeout(close, 1500);
    else close();
  };

  // ---------- Button: full reveal and cover ----------

  // A circle big enough to uncover the whole photo, even the corners
  const fullRadius = () => {
    const rect = stage.current.getBoundingClientRect();
    return Math.hypot(rect.width, rect.height) / 0.65;
  };

  const reveal = async () => {
    locked.current = true;
    setBusy(true);
    setUnmasked(true);
    x.set(CENTER_X);
    y.set(CENTER_Y);

    if (reduce) {
      radius.set(fullRadius());
    } else {
      // 1. Gather: shrink slightly at the center
      await animate(radius, 55, { duration: 0.35, ease: "easeOut" });
      // 2. Burst: gold flash and dust
      setFlashKey((k) => k + 1);
      burstDust(36);
      // 3. Unveil: expand over the whole photo
      await animate(radius, fullRadius(), { duration: 1.3, ease: smoothEase });
    }
    setBusy(false);
  };

  const cover = async () => {
    setBusy(true);
    x.set(CENTER_X);
    y.set(CENTER_Y);

    if (reduce) {
      radius.set(0);
    } else {
      // The mask closes back in toward the center, then a small sparkle
      await animate(radius, 0, { duration: 1.1, ease: smoothEase });
      setFlashKey((k) => k + 1);
      burstDust(14);
    }
    setUnmasked(false);
    setBusy(false);
    locked.current = false;
  };

  return (
    <div className="relative h-full w-full">
      {/* ---------- The photo stage ---------- */}
      <motion.div
        ref={stage}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        onPointerEnter={handleEnter}
        onPointerMove={moveTo}
        onPointerLeave={handleLeave}
        className="relative h-full w-full select-none overflow-hidden"
        style={{ maskImage: edgeFade, WebkitMaskImage: edgeFade }}
      >
        {/* Bottom layer: the real you */}
        <motion.img
          src={personal.photo}
          alt={`Portrait of ${personal.name}`}
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
        />

        {/* Top layer: the masked figure, with a hole */}
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

        {/* Gold flash (replays every time flashKey changes) */}
        {flashKey > 0 && (
          <motion.div
            key={flashKey}
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${CENTER_X}% ${CENTER_Y}%, rgba(246, 231, 184, 0.55), transparent 60%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, times: [0, 0.25, 1] }}
          />
        )}

        {/* Gold ring */}
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
          <div className="absolute inset-0 rounded-full border border-glow/80 shadow-[0_0_20px_rgba(201,162,75,0.35)]" />

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
            transition={{ duration: p.duration, ease: "easeOut" }}
            onAnimationComplete={() => removeDust(p.id)}
          />
        ))}
      </motion.div>

      {/* ---------- Hint and button (outside the faded stage, so they stay sharp) ---------- */}
      <div className="absolute bottom-0 inset-x-0 flex flex-col items-center gap-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={unmasked ? "on" : "off"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="font-display italic text-lg text-mint/60"
          >
            {unmasked
              ? "The mask is off"
              : isTouch
                ? "Tap to reveal"
                : "Hover to reveal"}
          </motion.p>
        </AnimatePresence>

        <button
          onClick={unmasked ? cover : reveal}
          disabled={busy}
          aria-pressed={unmasked}
          className="group relative overflow-hidden rounded-full border border-glow/60 px-7 py-2 font-display text-lg italic text-mint transition-colors hover:text-ink disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-glow"
        >
          <span className="absolute inset-0 translate-y-full bg-glow transition-transform duration-300 group-hover:translate-y-0" />
          <span className="relative">{unmasked ? "Mask again" : "Unmask"}</span>
        </button>
      </div>
    </div>
  );
}
