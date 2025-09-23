
import React from 'react';
import { ModelCardIcon1, ModelCardIcon2, ModelCardIcon3 } from './Icons';

const ModelCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
  <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 rounded-xl p-6 flex flex-col justify-between hover:border-slate-300 dark:hover:border-gray-600 transition-colors duration-200 min-h-[200px]">
    <div>
      <h3 className="text-xl font-medium text-slate-900 dark:text-white">{title}</h3>
      <p className="text-slate-600 dark:text-gray-400 mt-2">{description}</p>
    </div>
    <div className="self-end text-slate-400 dark:text-gray-600">
      {icon}
    </div>
  </div>
);

const ModelsSection: React.FC = () => {
  return (
    <section className="py-24">
      <h2 className="text-4xl font-medium text-slate-900 dark:text-white tracking-tight text-center mb-12">
        My Technology Stack
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
