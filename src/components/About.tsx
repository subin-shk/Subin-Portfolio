import { motion } from "framer-motion";
import { MapPin, Mail, Linkedin, Github } from "lucide-react";
import { personalInfo } from "../data/portfolioData";
import { useAnimatedElement } from "../hooks/useAnimatedElement";
import myPhoto from "../images/subin.jpg";

const About: React.FC = () => {
  const { ref, hasAnimated } = useAnimatedElement();

  return (
    <section id="about" className="section bg-slate-100 dark:bg-slate-800/50">
      <div className="container">
        <div className="section-heading">
          <h2>About Me</h2>
          <p>Get to know me a little better</p>
        </div>

        <div ref={ref} className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={hasAnimated ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="w-full aspect-square rounded-2xl overflow-hidden">
              <img
                src={myPhoto}
                alt="Subin Shakya"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 h-48 w-48 border-8 border-white dark:border-slate-700 rounded-2xl bg-primary-500/10 backdrop-blur-sm"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={hasAnimated ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-2xl font-bold mb-4">
              Software{" "}
              <span className="text-primary-600 dark:text-primary-400">
                QA Engineer
              </span>
            </h3>
            <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
              {personalInfo.summary}
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center">
                <MapPin size={20} className="text-primary-500 mr-3" />
                <span className="text-slate-700 dark:text-slate-300">
                  {personalInfo.location}
                </span>
              </div>
              <div className="flex items-center">
                <Mail size={20} className="text-primary-500 mr-3" />
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="text-slate-700 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                >
                  {personalInfo.email}
                </a>
              </div>
              {/* <div className="flex items-center">
                <Phone size={20} className="text-primary-500 mr-3" />
                <a href={`tel:${personalInfo.phone}`} className="text-slate-700 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                  {personalInfo.phone}
                </a>
              </div> */}
            </div>

            <div className="flex items-center space-x-4">
              <a
                href={personalInfo.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-slate-200 dark:bg-slate-700 text-primary-500 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href={personalInfo.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-slate-200 dark:bg-slate-700 text-primary-500 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>

              <a href="#contact" className="ml-auto btn btn-primary">
                Get In Touch
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
