import { motion } from "framer-motion";
import { Mail, MapPin } from "lucide-react";
import { personalInfo } from "../data/portfolioData";
import ContactForm from "./ContactForm";
import { useAnimatedElement } from "../hooks/useAnimatedElement";

const ContactSection: React.FC = () => {
  const { ref, hasAnimated } = useAnimatedElement();

  return (
    <section id="contact" className="section bg-slate-100 dark:bg-slate-800/50">
      <div className="container">
        <div className="section-heading">
          <h2>Contact Me</h2>
          <p>Get in touch for opportunities or inquiries</p>
        </div>

        <div ref={ref} className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={hasAnimated ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-6">
              Let's{" "}
              <span className="text-primary-600 dark:text-primary-400">
                Connect
              </span>
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-8">
              Whether you're looking for a QA professional for your project or
              just want to say hello, feel free to reach out. I'm always open to
              discussing new opportunities and collaborations.
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Mail
                      className="text-primary-600 dark:text-primary-400"
                      size={24}
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-1">Email</h4>
                  <a
                    href={`mailto:${personalInfo.email}`}
                    className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {personalInfo.email}
                  </a>
                </div>
              </div>

              {/* <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Phone className="text-primary-600 dark:text-primary-400" size={24} />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-1">Phone</h4>
                  <a 
                    href={`tel:${personalInfo.phone}`}
                    className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {personalInfo.phone}
                  </a>
                </div>
              </div> */}

              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <MapPin
                      className="text-primary-600 dark:text-primary-400"
                      size={24}
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-1">Location</h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    {personalInfo.location}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <ContactForm />
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
