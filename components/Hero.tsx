import React from 'react';
import { BriefcaseIcon, MailIcon } from './Icons';

interface HeroProps {
  onProjectsClick: () => void;
  onContactClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onProjectsClick, onContactClick }) => {
  return (
    <div className="relative pt-48 pb-24 text-center">
      <div 
        className="absolute inset-0 bg-repeat"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      ></div>
      <div className="relative z-10">
        <h1 className="text-6xl md:text-8xl font-medium text-white tracking-tighter">Frontend Developer</h1>
        <p className="mt-4 text-xl md:text-2xl text-gray-400">Want a project with double the quality, in half the time and cost? Look no further.</p>
        
        <div className="mt-12 max-w-5xl mx-auto">
          <div className="aspect-video bg-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            <img src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1280&auto=format&fit=crop" alt="Clean and modern developer workspace" className="w-full h-full object-cover" />
          </div>
        </div>

        <p className="max-w-3xl mx-auto mt-8 text-gray-400">
          I specialize in crafting beautiful, high-performance websites and applications. With a keen eye for design and a passion for clean code, I transform complex problems into elegant, user-friendly solutions that drive results.
        </p>

        <div className="mt-8 flex justify-center items-center space-x-4">
          <button 
            onClick={onProjectsClick}
            className="flex items-center space-x-2 bg-transparent border border-gray-600 hover:border-gray-400 text-gray-200 font-medium py-2 px-4 rounded-md transition-all duration-200">
            <BriefcaseIcon />
            <span>View My Work</span>
          </button>
          <button 
            onClick={onContactClick}
            className="flex items-center space-x-2 bg-transparent border border-gray-600 hover:border-gray-400 text-gray-200 font-medium py-2 px-4 rounded-md transition-all duration-200">
            <MailIcon />
            <span>Get in Touch</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;