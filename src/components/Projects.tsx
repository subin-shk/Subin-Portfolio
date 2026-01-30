import { motion } from 'framer-motion';
import { Github, ExternalLink, PlayCircle, X } from 'lucide-react';
import { useState } from 'react';
import { useAnimatedElement } from '../hooks/useAnimatedElement';
import { projects } from '../data/portfolioData'; // Import from separate data file

// Helper function to get YouTube embed URL
const getYouTubeEmbedUrl = (url: string) => {
  const videoId = url.split('v=')[1]?.split('&')[0];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
};

const Projects: React.FC = () => {
  const { ref, hasAnimated } = useAnimatedElement();
  const [activeTab, setActiveTab] = useState<'automation' | 'web' | 'others'>('automation');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');

  const categories = [
    { key: 'automation' as const, title: 'QA' },
    { key: 'web' as const, title: 'Web' },
    { key: 'others' as const, title: 'Others' },
  ];

  const openModal = (videoUrl: string) => {
    setCurrentVideoUrl(getYouTubeEmbedUrl(videoUrl));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentVideoUrl('');
  };

  return (
    <section id="projects" className="section bg-slate-100 dark:bg-slate-800/50">
      <div className="container">
        <div className="section-heading">
          <h2>Projects</h2>
          <p>My projects in QA, Web, and Others</p>
        </div>
        
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-800 rounded-full p-1">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveTab(category.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === category.key
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>
        
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects[activeTab].map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={hasAnimated ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card p-6 hover:shadow-lg transition-shadow"
            >
              {/* Project Image - Only render if image exists */}
              {project.image && (
                <div className="mb-4">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-48 object-contain rounded-lg"
                  />
                </div>
              )}
              
              <div className="mb-4">
                <h4 className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  {project.name}
                </h4>
                <p className="text-slate-700 dark:text-slate-300 mt-2">
                  {project.description}
                </p>
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {project.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex flex-wrap gap-4 mt-4">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                  >
                    <Github size={16} />
                    GitHub
                  </a>
                )}
                {project.visit && (
                  <a
                    href={project.visit}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    <ExternalLink size={16} />
                    Visit
                  </a>
                )}
                {project.video && (
                  <button
                    onClick={() => openModal(project.video)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <PlayCircle size={16} />
                    Watch Demo
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white z-10"
            >
              <X size={24} />
            </button>
            <div className="aspect-video">
              <iframe
                src={currentVideoUrl}
                title="Demo Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;