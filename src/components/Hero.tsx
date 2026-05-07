import { ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { personalInfo } from "../data/portfolioData";
import PixelCursorTrail from "./PixelCursorTrail";

const Hero: React.FC = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-800 dark:to-primary-950"
    >
      <PixelCursorTrail />
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium mb-4">
            Software Quality Assurance 
          </span>
          <h1 className="mb-4 font-cursive text-4xl md:text-5xl leading-tight">
            Hi, I'm{" "}
            <span className="text-primary-600 dark:text-primary-400">
              {personalInfo.name}
            </span>
          </h1>
          <h2 className="text-2xl md:text-3xl mb-6 text-slate-600 dark:text-slate-300">
            {personalInfo.title}
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-slate-600 dark:text-slate-300">
            Ensuring software quality through comprehensive testing strategies,
            automation, and best practices.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a href="#contact" className="btn btn-primary w-full sm:w-auto">
              Contact Me
            </a>
            <a href="#about" className="btn btn-outline w-full sm:w-auto">
              Learn More
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        >
          <a
            href="#about"
            className="flex flex-col items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
            aria-label="Scroll down"
          >
            <span className="text-sm font-medium mb-2 animate-bounce-slow">Scroll Down</span>
            <ArrowDown size={24} className="animate-bounce-slow" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
