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

              <div className="card p-6 ml-8 border-2 border-transparent group hover:border-primary-500 transition-all duration-200 relative">
                {/* Container for degree + duration */}
                <div
                  className="
                    flex flex-col
                    lg:flex-row lg:items-start
                    lg:relative
                  "
                >
                  {/* Degree */}
                  <h3
                    className="
                      text-xl font-bold text-primary-600 dark:text-primary-400
                      group-hover:text-primary-700 dark:group-hover:text-primary-300
                      break-words
                      lg:pr-32
                      max-w-full
                    "
                    style={{ wordBreak: "break-word" }} // Extra safety to break long words
                  >
                    {education.degree}
                  </h3>

                  {/* Duration */}
                  <span
                    className="
                      inline-flex
                      self-start  /* prevents stretching in column layout */
                      mt-1
                      lg:mt-0 lg:absolute lg:top-0 lg:right-0
                      px-3 py-1
                      bg-primary-100 dark:bg-primary-900/30
                      text-primary-600 dark:text-primary-400
                      rounded-full
                      text-sm font-medium
                      whitespace-nowrap
                      max-w-full
        
                    "
                  >
                    {education.duration}
                  </span>
                </div>

                {/* Institution below degree */}
                <p className="text-lg font-medium break-words mt-2">
                  {education.institution}
                </p>

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
