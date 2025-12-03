import { ArrowUp, Heart } from "lucide-react";
import { personalInfo, navigationItems } from "../data/portfolioData";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-6 md:mb-0">
            <a href="#home" className="text-3xl font-vibes  text-white">
              Subin<span className="text-secondary-400">Shakya.</span>
            </a>
            <p className="mt-2 text-slate-400 max-w-md">
              Software QA Engineer passionate about delivering
              high-quality software products.
            </p>
          </div>

          <nav className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-slate-300 hover:text-white transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col-reverse sm:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm mt-4 sm:mt-0">
            &copy; {currentYear} {personalInfo.name}. All rights reserved.
            <span className="inline-flex items-center ml-1">
              Made with <Heart size={16} className="text-red-500 mx-1" /> by
              Subin, Software QA Engineer
            </span>
          </p>

          <button
            onClick={scrollToTop}
            className="p-3 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-colors duration-200"
            aria-label="Scroll to top"
          >
            <ArrowUp size={20} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
