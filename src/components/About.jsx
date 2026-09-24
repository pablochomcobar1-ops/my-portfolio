import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { personal } from "../data/portfolio";

function Word({ children, progress, range }) {
  // As scroll progress moves through this word's range, opacity goes from 0.15 to 1
  const opacity = useTransform(progress, range, [0.15, 1]);

  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.25em]">
      {children}
    </motion.span>
  );
}

export default function About() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.4"],
  });

  const words = personal.about.split(" ");

  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-32 md:py-48">
      <h2 className="text-mint text-lg mb-10">About me</h2>

      <p
        ref={ref}
        className="font-display font-bold text-3xl md:text-5xl leading-tight max-w-4xl"
      >
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          return (
            <Word key={i} progress={scrollYProgress} range={[start, end]}>
              {word}
            </Word>
          );
        })}
      </p>
    </section>
  );
}
