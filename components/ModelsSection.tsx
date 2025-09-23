import React, { useState } from 'react';
import { ModelCardIcon1, ModelCardIcon2, ModelCardIcon3 } from './Icons';

const ModelCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col justify-between hover:border-gray-300 dark:hover:border-gray-700 transition-colors duration-200 min-h-[200px] h-full">
    <div>
      <h3 className="text-xl font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
    </div>
    <div className="self-end text-gray-400 dark:text-gray-600">
      {icon}
    </div>
  </div>
);

const ModelsSection: React.FC = () => {
  const modelData = [
    { 
      title: "Frontend",
      description: "Expertise in React, Next.js, TypeScript, and Tailwind CSS to build modern, responsive, and performant user interfaces.",
      icon: <ModelCardIcon1 />
    },
    {
      title: "Backend",
      description: "Skilled in connecting with backend services, working with REST APIs, GraphQL, and serverless functions using Node.js.",
      icon: <ModelCardIcon2 />
    },
    {
      title: "DevOps & Tooling",
      description: "Proficient with Git, Vercel, Docker, and CI/CD pipelines to ensure smooth, automated development and deployment workflows.",
      icon: <ModelCardIcon3 />
    }
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
      setCurrentIndex(prev => Math.min(prev + 1, modelData.length - 1));
    }
    if (isRightSwipe) {
      setCurrentIndex(prev => Math.max(prev - 1, 0));
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <section className="py-24">
      <h2 className="text-4xl font-medium text-gray-900 dark:text-white tracking-tight text-center mb-12">
        My Technology Stack
      </h2>
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
            {modelData.map((model, index) => (
              <div key={index} className="w-full flex-shrink-0 px-2">
                 <ModelCard {...model} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center items-center space-x-3 mt-8">
            {modelData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === index ? 'bg-gray-800 dark:bg-white scale-110' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to skill ${index + 1}`}
              />
            ))}
        </div>
      </div>
      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-8">
        <ModelCard 
          title="Frontend" 
          description="Expertise in React, Next.js, TypeScript, and Tailwind CSS to build modern, responsive, and performant user interfaces."
          icon={<ModelCardIcon1 />}
        />
        <ModelCard 
          title="Backend"
          description="Skilled in connecting with backend services, working with REST APIs, GraphQL, and serverless functions using Node.js."
          icon={<ModelCardIcon2 />}
        />
        <div className="md:col-span-2">
            <ModelCard 
                title="DevOps & Tooling" 
                description="Proficient with Git, Vercel, Docker, and CI/CD pipelines to ensure smooth, automated development and deployment workflows."
                icon={<ModelCardIcon3 />}
            />
        </div>
      </div>
    </section>
  );
};

export default ModelsSection;