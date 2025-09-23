import React, { useState } from 'react';
import { GitHubIcon, LinkIcon } from './Icons';

interface ProjectCardProps {
  title: string;
  description: string;
  imageUrl: string;
  liveUrl: string;
  codeUrl: string;
  tags: string[];
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, description, imageUrl, liveUrl, codeUrl, tags }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col group hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 h-full">
    <div className="aspect-video overflow-hidden">
      <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <h3 className="text-xl font-medium text-gray-900 dark:text-white">{title}</h3>
      <div className="flex flex-wrap gap-2 my-3">
        {tags.map(tag => (
          <span key={tag} className="text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded-full">{tag}</span>
        ))}
      </div>
      <p className="text-gray-600 dark:text-gray-400 flex-grow">{description}</p>
      <div className="mt-6 flex items-center space-x-4">
        <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 text-sm">
          <LinkIcon />
          <span>Live Demo</span>
        </a>
        <a href={codeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 text-sm">
          <GitHubIcon />
          <span>View Code</span>
        </a>
      </div>
    </div>
  </div>
);

const ProjectsSection: React.FC = () => {
  const projects = [
    {
      title: 'E-commerce Platform',
      description: 'A full-featured online store built with Next.js, featuring Stripe integration for payments and a Sanity.io backend for content management.',
      imageUrl: 'https://images.unsplash.com/photo-1561715276-a2d02e7706d5?q=80&w=800&auto=format&fit=crop',
      liveUrl: '#',
      codeUrl: '#',
      tags: ['Next.js', 'React', 'Stripe', 'Sanity.io', 'Tailwind CSS'],
    },
    {
      title: 'Task Management App',
      description: 'A responsive Kanban-style task board application that allows users to create, organize, and track their tasks with a drag-and-drop interface.',
      imageUrl: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?q=80&w=800&auto=format&fit=crop',
      liveUrl: '#',
      codeUrl: '#',
      tags: ['React', 'TypeScript', 'Framer Motion', 'Zustand'],
    },
    {
      title: 'Personal Portfolio',
      description: 'The very website you are browsing now. Designed to be a clean, modern, and performant showcase of my skills and services, featuring an AI chatbot.',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
      liveUrl: '#',
      codeUrl: '#',
      tags: ['React', 'Vite', 'Gemini API', 'Tailwind CSS'],
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentIndex(prev => Math.min(prev + 1, projects.length - 1));
    }
    if (isRightSwipe) {
      setCurrentIndex(prev => Math.max(prev - 1, 0));
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <section className="py-24">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-medium text-gray-900 dark:text-white tracking-tight">
          Featured Projects
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">A selection of my work demonstrating my skills in frontend development. More available on request or on my GitHub.</p>
      </div>
       {/* Mobile Carousel */}
      <div className="md:hidden">
        <div 
          className="overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {projects.map((project, index) => (
              <div key={index} className="w-full flex-shrink-0 px-2">
                 <ProjectCard {...project} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center items-center space-x-3 mt-8">
            {projects.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === index ? 'bg-gray-800 dark:bg-white scale-110' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to project ${index + 1}`}
              />
            ))}
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <ProjectCard key={index} {...project} />
        ))}
      </div>
    </section>
  );
};

export default ProjectsSection;