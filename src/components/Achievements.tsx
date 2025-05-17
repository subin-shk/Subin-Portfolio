import { motion } from "framer-motion";
import { Award, Trophy, Mic, FileText } from "lucide-react";
import { achievements } from "../data/portfolioData";
import { useAnimatedElement } from "../hooks/useAnimatedElement";

const iconMap: Record<string, React.ReactNode> = {
  award: <Award size={36} className="text-primary-500" />,
  trophy: <Trophy size={36} className="text-primary-500" />,
  mic: <Mic size={36} className="text-primary-500" />,
  "file-text": <FileText size={36} className="text-primary-500" />,
};

const Achievements: React.FC = () => {
  const { ref, hasAnimated } = useAnimatedElement();

  return (
    <section
      id="achievements"
      className="section bg-slate-100 dark:bg-slate-800/50"
    >
      <div className="container">
        <div className="section-heading">
          <h2>Achievements</h2>
          <p>Recognition and notable accomplishments</p>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
        >
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card p-6 group hover:border-primary-500 hover:border-2"
            >
              <div className="mb-4 p-4 rounded-full bg-primary-100 dark:bg-primary-900/30 w-max group-hover:bg-primary-200 dark:group-hover:bg-primary-800/30 transition-colors">
                {iconMap[achievement.icon]}
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {achievement.title}
              </h3>

              <p className="text-slate-600 dark:text-slate-300">
                {achievement.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Achievements;
