import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { personal } from "../data/portfolio";
import Magnetic from "./Magnetic";

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(personal.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // If copying isn't allowed, open the email app instead
      window.location.href = `mailto:${personal.email}`;
    }
  };

  // Only show links that are filled in
  const socials = [
    { label: "GitHub", href: personal.github },
    { label: "LinkedIn", href: personal.linkedin },
  ].filter((s) => s.href && !s.href.startsWith("["));

  return (
    <section
      id="contact"
      className="mx-auto max-w-6xl px-6 pt-20 md:pt-48 pb-16"
    >
      <h2 className="text-mint text-lg mb-10">Contact</h2>

      <p className="font-display font-extrabold text-4xl md:text-8xl leading-[0.95] tracking-tight max-w-4xl">
        Have an idea? Let's build it together.
      </p>

      <div className="mt-12 flex flex-wrap items-center gap-4">
        <Magnetic>
          <motion.a
            href={`mailto:${personal.email}`}
            className="inline-block rounded-full bg-glow px-8 py-4 text-base md:text-lg font-bold text-ink break-all hover:bg-paper transition-colors"
          >
            {personal.email}
          </motion.a>
        </Magnetic>

        <button
          onClick={copyEmail}
          aria-live="polite"
          className="min-w-[150px] rounded-full border border-white/20 px-6 py-4 font-bold hover:border-glow transition-colors"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={copied ? "copied" : "copy"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="block"
            >
              {copied ? "Copied!" : "Copy email"}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <ul className="mt-12 flex gap-8">
        {socials.map((s) => (
          <li key={s.label}>
            <motion.a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg text-paper/60 hover:text-glow transition-colors"
            >
              {s.label}
            </motion.a>
          </li>
        ))}
      </ul>

      <footer className="mt-20 md:mt-32 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-sm text-paper/40">
        <p>
          © {new Date().getFullYear()} {personal.name}
        </p>
        <p>Built with React, Three.js and Framer Motion</p>
      </footer>
    </section>
  );
}
