import React, { useState, useEffect } from 'react';
import { LogoIcon, GetStartedIcon, MenuIcon, XIcon } from './Icons';

interface HeaderProps {
  onContactClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onContactClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMenuOpen]);
  
  const closeMenu = () => setIsMenuOpen(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    closeMenu();
  };
  
  const handleMobileGetInTouch = () => {
    onContactClick();
    closeMenu();
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#131314]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 border-b border-gray-800">
            <div className="flex-shrink-0">
              <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center space-x-2 text-white">
                <LogoIcon />
                <span className="font-medium text-lg">Akhi Yusuf</span>
              </a>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#services" onClick={(e) => handleNavClick(e, 'services')} className="text-gray-300 hover:text-white transition-colors duration-200">Services</a>
              <a href="#projects" onClick={(e) => handleNavClick(e, 'projects')} className="text-gray-300 hover:text-white transition-colors duration-200">Projects</a>
              <a href="#calculator" onClick={(e) => handleNavClick(e, 'calculator')} className="text-gray-300 hover:text-white transition-colors duration-200">Calculator</a>
              <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="text-gray-300 hover:text-white transition-colors duration-200">Contact</a>
              <button 
                onClick={onContactClick}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
                <GetStartedIcon />
                <span>Get in Touch</span>
              </button>
            </nav>
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(true)} className="text-gray-300 hover:text-white" aria-label="Open menu">
                <MenuIcon />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[60] bg-[#131314] transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex justify-between items-center h-16 px-4 sm:px-6 border-b border-gray-800">
             <a href="#" onClick={(e) => { handleNavClick(e, 'root'); closeMenu();}} className="flex items-center space-x-2 text-white">
              <LogoIcon />
              <span className="font-medium text-lg">Akhi Yusuf</span>
            </a>
            <button onClick={closeMenu} className="text-gray-300 hover:text-white" aria-label="Close menu">
              <XIcon />
            </button>
          </div>
          <nav className="flex flex-col items-center justify-center h-[calc(100%-4rem)] p-8 space-y-6">
             <a href="#services" onClick={(e) => handleNavClick(e, 'services')} className="text-2xl text-gray-300 hover:text-white">Services</a>
             <a href="#projects" onClick={(e) => handleNavClick(e, 'projects')} className="text-2xl text-gray-300 hover:text-white">Projects</a>
             <a href="#calculator" onClick={(e) => handleNavClick(e, 'calculator')} className="text-2xl text-gray-300 hover:text-white">Calculator</a>
             <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="text-2xl text-gray-300 hover:text-white">Contact</a>
             <button onClick={handleMobileGetInTouch} className="flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-md transition-colors duration-200 mt-4 w-full max-w-xs text-lg">
                <GetStartedIcon />
                <span>Get in Touch</span>
            </button>
          </nav>
      </div>
    </>
  );
};

export default Header;