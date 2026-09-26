import { motion } from "framer-motion";
import { useSound } from "./SoundProvider";

const bars = [
  { heights: [0.3, 1, 0.5, 0.8, 0.3], duration: 1.1 },
  { heights: [0.8, 0.4, 1, 0.3, 0.8], duration: 0.9 },
  { heights: [0.5, 0.9, 0.3, 1, 0.5], duration: 1.3 },
  { heights: [0.9, 0.3, 0.7, 0.5, 0.9], duration: 1.0 },
];

export default function SoundToggle() {
  const { enabled, toggle } = useSound();

  return (
    <button
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Turn sound off" : "Turn sound on"}
      className="flex h-9 items-center gap-2 rounded-full border border-glow/40 px-3 hover:border-glow transition-colors"
    >
      <span className="flex h-4 items-end gap-[3px]">
        {bars.map((bar, i) => (
          <motion.span
            key={i}
            className="block h-full w-[3px] origin-bottom rounded-full bg-glow"
            animate={{ scaleY: enabled ? bar.heights : 0.25 }}
            transition={
              enabled
                ? {
                    duration: bar.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
                : { duration: 0.3 }
            }
          />
        ))}
      </span>
      <span className="hidden sm:inline text-xs font-bold text-paper/70">
        {enabled ? "Sound on" : "Sound off"}
      </span>
    </button>
  );
}
