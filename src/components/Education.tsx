import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { educationHistory } from "../data/portfolioData";
import { useAnimatedElement } from "../hooks/useAnimatedElement";

const Education: React.FC = () => {
  const { ref, hasAnimated } = useAnimatedElement();

  return (
    <section id="education" className="section">
      <div className="container">
        <div className="section-heading">
          <h2>Education</h2>
          <p>Academic background and professional qualifications</p>
        </div>

        <div ref={ref} className="max-w-3xl mx-auto">
          {educationHistory.map((education, index) => (
            <motion.div
              key={education.id}
              initial={{ opacity: 0, y: 20 }}
              animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="timeline-item"
            >
              <div className="timeline-dot">
                <GraduationCap
                  size={12}
                  className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              </div>

              <div className="card p-6 ml-8 hover:border-primary-500 hover:border-2 group">
                <div className="relative mb-4">
                  {/* Duration badge fixed top right */}
                  <span className="absolute top-0 right-0 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium">
                    {education.duration}
                  </span>

                  {/* Text container with padding and max width to avoid overlap */}
                  <div className="pr-30 max-w-[calc(100%-7rem)]">
                    <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 break-words">
                      {education.degree}
                    </h3>
                    <p className="text-lg font-medium break-words">
                      {education.institution}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center space-x-2 text-lg text-primary-600 dark:text-primary-400">
                    <span className="font-semibold">{education.grade}</span>
                    {education.honors && (
                      <>
                        <span className="text-slate-400">•</span>
                        <span className="font-medium text-secondary-600 dark:text-secondary-400">
                          {education.honors}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;
