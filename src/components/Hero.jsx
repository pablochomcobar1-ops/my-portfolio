import { motion } from "framer-motion";
import { personal } from "../data/portfolio";
import PortraitReveal from "./PortraitReveal";

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
        <motion.p
          variants={item}
          className="font-display italic text-mint text-2xl mb-2"
        >
          Hi, I'm
        </motion.p>

        <motion.h1
          variants={item}
          className="text-gold font-display text-6xl sm:text-7xl md:text-6xl lg:text-8xl leading-[0.95] pb-3"
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
        <PortraitReveal />
      </div>
    </section>
  );
}
