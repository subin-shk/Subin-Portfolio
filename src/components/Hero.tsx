import { ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { personalInfo } from "../data/portfolioData";
import subinShakya from "../images/subin.jpg";

const Hero: React.FC = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-800 dark:to-primary-950"
    >
      <div className="container">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-left"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium mb-4">
              Software Quality Assurance
            </span>
            <h1 className="mb-4 font-cursive">
              Hi, I'm{" "}
              <span className="text-primary-600 dark:text-primary-400">
                {personalInfo.name}
              </span>
            </h1>
            <h2 className="text-2xl md:text-3xl mb-6 text-slate-600 dark:text-slate-300">
              {personalInfo.title}
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto md:mx-0 text-slate-600 dark:text-slate-300">
              Ensuring software quality through comprehensive testing
              strategies, automation, and best practices.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <a href="#contact" className="btn btn-primary w-full sm:w-auto">
                Contact Me
              </a>
              <a href="#about" className="btn btn-outline w-full sm:w-auto">
                Learn More
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative hidden md:block"
          >
            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden group">
              <img
                src={subinShakya}
                alt="Professional workspace"
                className="w-full h-full object-cover"
              />
              {/* <div className="absolute inset-0 backdrop-blur-sm transition-all duration-300 group-hover:backdrop-blur-0"></div> */}
            </div>


            <div className="absolute -bottom-6 -right-6 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 rounded-full bg-primary-500 animate-pulse"></div>
                <p className="font-medium">Available for new opportunities</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="absolute bottom-12 left-1/2 lg:left-1/4 -translate-x-1/2"
        >
          <a
            href="#about"
            className="flex flex-col items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
            aria-label="Scroll down"
          >
            <span className="text-sm font-medium mb-2">Scroll Down</span>
            <ArrowDown size={24} className="animate-bounce-slow" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
