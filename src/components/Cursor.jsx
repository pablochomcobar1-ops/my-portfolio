import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function Cursor() {
  // Only turn on for devices with a mouse
  const [enabled] = useState(
    () => window.matchMedia("(pointer: fine)").matches,
  );
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Exact mouse position (for the dot)
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // Delayed, springy position (for the ring)
  const springConfig = { stiffness: 300, damping: 28, mass: 0.5 };
  const ringX = useSpring(x, springConfig);
  const ringY = useSpring(y, springConfig);

  useEffect(() => {
    if (!enabled) return;

    const handleMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const handleOver = (e) => {
      setHovering(Boolean(e.target.closest("a, button, [data-hover]")));
    };
    const handleDown = () => setPressed(true);
    const handleUp = () => setPressed(false);
    const handleLeave = () => setVisible(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseover", handleOver);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    document.documentElement.addEventListener("mouseleave", handleLeave);

    // Cleanup: remove listeners when the component unmounts
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseover", handleOver);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* Ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[100] -ml-5 -mt-5 h-10 w-10 rounded-full border border-white mix-blend-difference"
        style={{ x: ringX, y: ringY }}
        animate={{
          scale: pressed ? 0.8 : hovering ? 1.8 : 1,
          opacity: visible ? 1 : 0,
          backgroundColor: hovering
            ? "rgba(255,255,255,1)"
            : "rgba(255,255,255,0)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />

      {/* Dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[100] -ml-1 -mt-1 h-2 w-2 rounded-full bg-glow"
        style={{ x, y }}
        animate={{ opacity: visible && !hovering ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
}
