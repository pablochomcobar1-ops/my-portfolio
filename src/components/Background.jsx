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
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });

  // Light 1: gold → wine → gold
  const light1X = useTransform(progress, [0, 0.5, 1], ["-10vw", "40vw", "0vw"]);
  const light1Y = useTransform(
    progress,
    [0, 0.5, 1],
    ["-10vh", "30vh", "60vh"],
  );
  const light1Color = useTransform(
    progress,
    [0, 0.5, 1],
    ["#c9a24b", "#6e1f2b", "#c9a24b"],
  );

  // Light 2: wine → gold → wine
  const light2X = useTransform(progress, [0, 0.5, 1], ["60vw", "0vw", "50vw"]);
  const light2Y = useTransform(
    progress,
    [0, 0.5, 1],
    ["60vh", "20vh", "-10vh"],
  );
  const light2Color = useTransform(
    progress,
    [0, 0.5, 1],
    ["#6e1f2b", "#c9a24b", "#6e1f2b"],
  );

  const gridY = useTransform(scrollY, (value) => -value * 0.15);
  const gridPosition = useMotionTemplate`0px ${gridY}px`;

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-glow origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <div
        aria-hidden
        className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      >
        {/* Faint gold dotted grid */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(226, 204, 152, 0.05) 1px, transparent 1px)",
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
          className="absolute w-[70vw] h-[70vw] md:w-[45vw] md:h-[45vw] rounded-full opacity-25 blur-[80px] md:blur-[120px]"
          style={{
            x: reduce ? "40vw" : light2X,
            y: reduce ? "50vh" : light2Y,
            backgroundColor: light2Color,
          }}
        />

        {/* Spotlight: darker edges, like studio lighting */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.6) 100%)",
          }}
        />
      </div>
    </>
  );
}
