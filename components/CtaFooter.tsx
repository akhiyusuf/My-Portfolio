import React from 'react';
import { GetStartedIcon } from './Icons';

interface CtaFooterProps {
  onContactClick: () => void;
}

const CtaFooter: React.FC<CtaFooterProps> = ({ onContactClick }) => {
  return (
    <section className="text-center py-24 bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-5xl md:text-6xl font-medium text-white tracking-tighter">Akhi Yusuf</h2>
        <p className="mt-4 text-xl text-gray-400">Ready to bring your ideas to life? Let's collaborate.</p>
        <div className="mt-8">
          <button 
            onClick={onContactClick}
            className="flex items-center space-x-2 bg-transparent border border-gray-600 hover:border-gray-400 text-gray-200 font-medium py-2 px-4 rounded-md transition-all duration-200 mx-auto">
            <GetStartedIcon />
            <span>Let's Build Together</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CtaFooter;