import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { personal } from "../data/portfolio";

const Scene = lazy(() => import("./ScenePortrait"));
const isTouch = window.matchMedia("(pointer: coarse)").matches;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Hero() {
  return (
    <section
      id="home"
      className="min-h-svh md:min-h-screen mx-auto max-w-6xl px-6 pt-24 md:pt-28 grid md:grid-cols-[1.3fr_1fr] items-center gap-2 md:gap-8"
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10"
      >
        <motion.p variants={item} className="text-mint text-lg mb-4">
          Hi, I'm
        </motion.p>

        <motion.h1
          variants={item}
          className="font-display font-extrabold text-5xl sm:text-6xl md:text-5xl lg:text-7xl leading-[0.9] tracking-tight"
        >
          {personal.name}
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-5 md:mt-6 text-xl md:text-2xl text-paper/90"
        >
          {personal.role}
        </motion.p>

        <motion.p variants={item} className="mt-3 max-w-md text-paper/60">
          {personal.tagline}
        </motion.p>

        <motion.div
          variants={item}
          className="mt-8 md:mt-10 flex flex-wrap gap-3 md:gap-4"
        >
          <motion.a
            href="#projects"
            className="rounded-full bg-glow px-7 py-3 font-bold text-ink hover:bg-paper transition-colors"
          >
            See my work
          </motion.a>
          <motion.a
            href="#contact"
            className="rounded-full border border-white/20 px-7 py-3 font-bold hover:border-glow transition-colors"
          >
            Get in touch
          </motion.a>
        </motion.div>
      </motion.div>

      <div className="relative h-[50vh] md:h-[75vh]">
        <Suspense fallback={null}>
          <Scene />
        </Suspense>

        <p className="absolute bottom-0 inset-x-0 text-center text-sm text-paper/40">
          {isTouch ? "Tap me to shatter" : "Hover to scatter, click to shatter"}
        </p>
      </div>
    </section>
  );
}
