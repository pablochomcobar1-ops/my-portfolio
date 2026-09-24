import { skills } from "../data/portfolio";
import Magnetic from "./Magnetic";

// Turns [{ items: [...] }, { items: [...] }] into one flat list of all skills
const allSkills = skills.flatMap((group) => group.items);

export default function Skills() {
  return (
    <section id="skills" className="py-20 md:py-48 overflow-hidden">
      {/* Moving ribbon */}
      <div className="w-[110%] -ml-[5%] -rotate-2 bg-glow text-ink py-4 mb-16 md:mb-32">
        <div className="flex w-max animate-marquee motion-reduce:animate-none">
          {[...allSkills, ...allSkills].map((skill, i) => (
            <span
              key={i}
              aria-hidden={i >= allSkills.length}
              className="font-display font-extrabold text-2xl md:text-5xl px-6 whitespace-nowrap"
            >
              {skill}
              <span className="text-ink/40 pl-12">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Grouped skills */}
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-mint text-lg mb-10">Skills</h2>

        <div className="border-t border-white/10">
          {skills.map((group) => (
            <div
              key={group.group}
              className="grid md:grid-cols-[200px_1fr] gap-4 md:gap-8 py-6 md:py-8 border-b border-white/10"
            >
              <h3 className="font-display text-2xl font-bold">{group.group}</h3>

              <div className="flex flex-wrap gap-3">
                {group.items.map((item) => (
                  <Magnetic
                    key={item}
                    className="rounded-full border border-white/15 px-5 py-2 text-paper/80 hover:border-glow hover:text-glow transition-colors"
                  >
                    {item}
                  </Magnetic>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
