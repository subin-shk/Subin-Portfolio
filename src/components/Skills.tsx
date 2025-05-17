import { useState } from "react";
import { motion } from "framer-motion";
import { skills } from "../data/portfolioData";
import { useAnimatedElement } from "../hooks/useAnimatedElement";

type Category = "all" | "technical" | "tools" | "soft";

const Skills: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const { ref, hasAnimated } = useAnimatedElement();

  const filteredSkills =
    activeCategory === "all"
      ? skills
      : skills.filter((skill) => skill.category === activeCategory);

  return (
    <section id="skills" className="section bg-slate-100 dark:bg-slate-800/50">
      <div className="container">
        <div className="section-heading">
          <h2>Skills</h2>
          <p>Technical abilities and expertise</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {["all", "technical", "tools", "soft"].map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category as Category)}
              className={`px-5 py-2 rounded-full transition-all duration-200 ${
                activeCategory === category
                  ? "bg-primary-600 text-white"
                  : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div
          ref={ref}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {filteredSkills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-sm text-slate-800 dark:text-white">
                  {skill.name}
                </h3>
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  {skill.level}%
                </span>
              </div>

              <div className="skill-bar h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={hasAnimated ? { width: `${skill.level}%` } : {}}
                  transition={{ duration: 1, delay: index * 0.05 }}
                  className="skill-progress h-full bg-primary-600 dark:bg-primary-400 rounded-full"
                ></motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
