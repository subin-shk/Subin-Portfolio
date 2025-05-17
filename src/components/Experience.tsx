import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { experiences } from '../data/portfolioData';
import { useAnimatedElement } from '../hooks/useAnimatedElement';

const Experience: React.FC = () => {
  const { ref, hasAnimated } = useAnimatedElement();

  return (
    <section id="experience" className="section">
      <div className="container">
        <div className="section-heading">
          <h2>Work Experience</h2>
          <p>My professional journey and career highlights</p>
        </div>
        
        <div ref={ref} className="max-w-3xl mx-auto">
          {experiences.map((experience, index) => (
            <motion.div
              key={experience.id}
              initial={{ opacity: 0, y: 20 }}
              animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="timeline-item"
            >
              <div className="timeline-dot">
                <Briefcase size={12} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              
              <div className="card p-6 ml-8">
                <div className="flex flex-wrap justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400">
                      {experience.role}
                    </h3>
                    <p className="text-lg font-medium">{experience.company}</p>
                  </div>
                  <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium">
                    {experience.duration}
                  </span>
                </div>
                
                <ul className="space-y-2 ml-5 list-disc text-slate-700 dark:text-slate-300">
                  {experience.description.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;