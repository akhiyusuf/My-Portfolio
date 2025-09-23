import React from 'react';

interface FooterProps {
  onContactClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onContactClick }) => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-100 dark:bg-gray-950 text-gray-600 dark:text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
             <h3 className="text-gray-800 dark:text-white font-medium">Akhi Yusuf</h3>
             <p className="text-sm mt-2">© {new Date().getFullYear()} Akhi Yusuf. All Rights Reserved.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-white mb-4">Socials</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">GitHub</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">LinkedIn</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Twitter / X</a></li>
            </ul>
          </div>
           <div>
            <h4 className="font-medium text-gray-800 dark:text-white mb-4">Navigate</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-gray-900 dark:hover:text-white">Home</a></li>
              <li><a href="#services" onClick={(e) => handleNavClick(e, 'services')} className="hover:text-gray-900 dark:hover:text-white">Services</a></li>
              <li><a href="#projects" onClick={(e) => handleNavClick(e, 'projects')} className="hover:text-gray-900 dark:hover:text-white">Projects</a></li>
               <li><a href="#calculator" onClick={(e) => handleNavClick(e, 'calculator')} className="hover:text-gray-900 dark:hover:text-white">Calculator</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={onContactClick} className="bg-transparent border-none p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-left cursor-pointer transition-colors duration-200">Get in Touch</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Terms</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Privacy</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;