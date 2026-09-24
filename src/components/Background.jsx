import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";

export default function Background() {
  const reduce = useReducedMotion();

  // scrollY = pixels scrolled, scrollYProgress = 0 at top, 1 at bottom
  const { scrollY, scrollYProgress } = useScroll();

  // Smooth version, so the lights glide instead of jumping
  const progress = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });

  // Light 1: starts top-left, moves right then down, amber → mint → amber
  const light1X = useTransform(progress, [0, 0.5, 1], ["-10vw", "40vw", "0vw"]);
  const light1Y = useTransform(
    progress,
    [0, 0.5, 1],
    ["-10vh", "30vh", "60vh"],
  );
  const light1Color = useTransform(
    progress,
    [0, 0.5, 1],
    ["#ffb547", "#5eead4", "#ffb547"],
  );

  // Light 2: starts bottom-right, moves the opposite way, mint → amber → mint
  const light2X = useTransform(progress, [0, 0.5, 1], ["60vw", "0vw", "50vw"]);
  const light2Y = useTransform(
    progress,
    [0, 0.5, 1],
    ["60vh", "20vh", "-10vh"],
  );
  const light2Color = useTransform(
    progress,
    [0, 0.5, 1],
    ["#5eead4", "#ffb547", "#5eead4"],
  );

  // Grid moves at 15% of scroll speed = parallax
  const gridY = useTransform(scrollY, (value) => -value * 0.15);
  const gridPosition = useMotionTemplate`0px ${gridY}px`;

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-glow origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Background layers */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      >
        {/* Dotted grid */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(233, 231, 242, 0.07) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            backgroundPosition: reduce ? "0px 0px" : gridPosition,
          }}
        />

        {/* Glowing light 1 */}
        <motion.div
          className="absolute w-[70vw] h-[70vw] md:w-[45vw] md:h-[45vw] rounded-full opacity-20 blur-[80px] md:blur-[120px]"
          style={{
            x: reduce ? 0 : light1X,
            y: reduce ? 0 : light1Y,
            backgroundColor: light1Color,
          }}
        />

        {/* Glowing light 2 */}
        <motion.div
          className="absolute w-[70vw] h-[70vw] md:w-[45vw] md:h-[45vw] rounded-full opacity-20 blur-[80px] md:blur-[120px]"
          style={{
            x: reduce ? "40vw" : light2X,
            y: reduce ? "50vh" : light2Y,
            backgroundColor: light2Color,
          }}
        />
      </div>
    </>
  );
}
