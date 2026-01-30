import { useState } from "react";
import { motion } from "framer-motion";
import { skills } from "../data/portfolioData";
import { useAnimatedElement } from "../hooks/useAnimatedElement";
import { FaChrome, FaMobileAlt, FaRocket, FaRobot, FaLeaf, FaBolt, FaBug } from "react-icons/fa";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  FaChrome,
  FaMobileAlt,
  FaRocket,
  FaRobot,
  FaLeaf,
  FaBolt,
  FaBug,
};

const Skills: React.FC = () => {
  const { ref, hasAnimated } = useAnimatedElement();

  return (
    <section id="skills" className="section">
      <div className="container">
        <div className="section-heading">
          <h2>
            Skills
          </h2>
          <p>
            Technical abilities and expertise
          </p>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
        >
          {skills.map((skill, index) => {
            const IconComponent = iconMap[skill.icon];
            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={hasAnimated ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white dark:bg-slate-800 border-2 border-transparent p-6 rounded-2xl shadow-lg hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/20 transition-all duration-200 hover:border-primary-500 flex flex-col items-center justify-center text-center cursor-pointer group relative"
              >
                <motion.div
                  className="mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {IconComponent && (
                    <IconComponent
                      size={48}
                      className="text-slate-700 dark:text-slate-200 transition-colors duration-300"
                    />
                  )}
                </motion.div>
                <h3 className="font-bold text-xl text-slate-800 dark:text-white leading-tight">
                  {skill.name}
                </h3>

              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Skills;
