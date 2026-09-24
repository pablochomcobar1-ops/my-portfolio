import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import { projects } from "../data/portfolio";
import Magnetic from "./Magnetic";

function TiltCard({ children }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  // Position of the light reflection, in %
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.18), transparent 60%)`;

  const handleMove = (e) => {
    if (reduce) return;
    const rect = ref.current.getBoundingClientRect();
    // Mouse position inside the card, from 0 to 1
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    rotateY.set((px - 0.5) * 14);
    rotateX.set((0.5 - py) * 14);
    glareX.set(px * 100);
    glareY.set(py * 100);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
  };

  return (
    <div style={{ perspective: 1000 }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        style={{ rotateX: springX, rotateY: springY }}
        className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40"
      >
        {children}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ background: glare }}
        />
      </motion.div>
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-32 md:py-48">
      <h2 className="text-mint text-lg mb-16">Projects</h2>

      <div className="flex flex-col gap-32">
        {projects.map((project, i) => (
          <motion.article
            key={project.title}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="grid md:grid-cols-2 gap-10 md:gap-16 items-center"
          >
            {/* Image side */}
            <div className={i % 2 === 1 ? "md:order-2" : ""}>
              <TiltCard>
                {project.image ? (
                  <motion.img
                    src={project.image}
                    alt={`Screenshot of ${project.title}`}
                    className="w-full aspect-[16/10] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[16/10] bg-ink-light flex items-center justify-center font-display text-3xl font-bold text-paper/30">
                    {project.title}
                  </div>
                )}
              </TiltCard>
            </div>

            {/* Text side */}
            <div>
              <h3 className="font-display text-4xl md:text-5xl font-extrabold">
                {project.title}
              </h3>

              <p className="mt-5 text-paper/70 leading-relaxed">
                {project.description}
              </p>

              <ul className="mt-6 flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <li
                    key={t}
                    className="text-sm text-mint border border-mint/30 rounded-full px-3 py-1"
                  >
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-4">
                {project.live && (
                  <Magnetic>
                    <motion.a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-full bg-glow px-6 py-3 font-bold text-ink hover:bg-paper transition-colors"
                    >
                      Visit live site
                    </motion.a>
                  </Magnetic>
                )}
                {project.github && (
                  <Magnetic>
                    <motion.a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-full border border-white/20 px-6 py-3 font-bold hover:border-glow transition-colors"
                    >
                      View code
                    </motion.a>
                  </Magnetic>
                )}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
