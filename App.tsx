import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FeatureSection from './components/FeatureSection';
import ProjectsSection from './components/ProjectsSection';
import PricingCalculator from './components/PricingCalculator';
import { Selections, initialSelections } from './components/pricing';
import ApiSection from './components/ApiSection';
import ModelsSection from './components/ModelsSection';
import CtaFooter from './components/CtaFooter';
import Footer from './components/Footer';
import Modal from './components/Modal';
import Chatbot from './components/Chatbot';
import { GitHubIcon } from './components/Icons';

const ContactForm: React.FC = () => (
  <div>
    <h2 id="modal-title" className="text-3xl font-medium text-gray-900 dark:text-white mb-4">Get in Touch</h2>
    <p className="text-gray-600 dark:text-gray-400 mb-6">Have a project in mind, or just want to connect? Feel free to send me a message. You can reach me directly at <a href="mailto:akhi.yusuf@example.com" className="text-sky-500 hover:underline">akhi.yusuf@example.com</a>.</p>
    <form className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
        <input type="text" name="name" id="name" className="mt-1 block w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" placeholder="Your Name" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
        <input type="email" name="email" id="email" className="mt-1 block w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" placeholder="you@example.com" />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
        <textarea id="message" name="message" rows={4} className="mt-1 block w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" placeholder="Your message..."></textarea>
      </div>
      <button type="submit" onClick={(e) => e.preventDefault()} className="w-full bg-gray-900 hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
        Send Message (Simulation)
      </button>
    </form>
  </div>
);

const GitHubModalContent: React.FC = () => (
    <div>
        <h2 id="modal-title" className="text-3xl font-medium text-gray-900 dark:text-white mb-4">View on GitHub</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">This button will take you to my GitHub profile where you can see the source code for my projects, including this portfolio itself!</p>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 bg-gray-900 hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
            <GitHubIcon />
            <span>Continue to GitHub</span>
        </a>
    </div>
);

const App: React.FC = () => {
  const features = [
    {
      label: 'App Development & Design',
      title: 'Tool of the Successful: Custom App Solutions',
      description: 'Empowering your business with high-performance applications that thrive in your clients\' pockets and browsers, ensuring your brand speaks for itself.',
      imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=800&auto=format&fit=crop',
      reverse: false,
    },
    {
      label: 'Frontend Development',
      title: 'Engaging Websites & Web Applications',
      description: 'From static landing pages to complex web applications, I build responsive, fast, and intuitive user interfaces that capture and retain user attention using modern technologies.',
      imageUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&auto=format&fit=crop',
      reverse: true,
    },
    {
      label: 'eCommerce & CMS Solutions',
      title: 'Powerful eCommerce & Content Platforms',
      description: 'I create robust eCommerce solutions and integrate powerful Content Management Systems (CMS) to give you full control over your digital storefront and content, driving sales and engagement.',
      imageUrl: 'https://images.unsplash.com/photo-1561715276-a2d02e7706d5?q=80&w=800&auto=format&fit=crop',
      reverse: false,
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState<string>('');
  const [calculatorSelections, setCalculatorSelections] = useState<Selections>(initialSelections);

  // State for services carousel on mobile
  const [servicesCurrentIndex, setServicesCurrentIndex] = useState(0);
  const [servicesTouchStart, setServicesTouchStart] = useState<number | null>(null);
  const [servicesTouchEnd, setServicesTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onServicesTouchStart = (e: React.TouchEvent) => {
    setServicesTouchEnd(null);
    setServicesTouchStart(e.targetTouches[0].clientX);
  };

  const onServicesTouchMove = (e: React.TouchEvent) => {
    setServicesTouchEnd(e.targetTouches[0].clientX);
  };

  const onServicesTouchEnd = () => {
    if (!servicesTouchStart || !servicesTouchEnd) return;
    const distance = servicesTouchStart - servicesTouchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setServicesCurrentIndex(prev => Math.min(prev + 1, features.length - 1));
    }
    if (isRightSwipe) {
      setServicesCurrentIndex(prev => Math.max(prev - 1, 0));
    }
    setServicesTouchStart(null);
    setServicesTouchEnd(null);
  };

  const openModal = (contentKey: 'contact' | 'github') => {
    switch(contentKey) {
        case 'contact':
            setModalContent(<ContactForm />);
            break;
        case 'github':
            setModalContent(<GitHubModalContent />);
            break;
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleDiscussWithAi = (summary: string) => {
    setChatInitialMessage(summary);
    setIsChatbotOpen(true);
  };

  const handleViewCalculatorClick = () => {
    setIsChatbotOpen(false);
    // Wait for chat closing animation to finish before scrolling
    setTimeout(() => {
        document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-sans antialiased">
      <Header onContactClick={() => openModal('contact')} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Hero onProjectsClick={scrollToProjects} onContactClick={() => openModal('contact')} />
        <div id="services" className="py-24">
           {/* Mobile Carousel */}
          <div className="md:hidden">
            <div 
              className="overflow-hidden"
              onTouchStart={onServicesTouchStart}
              onTouchMove={onServicesTouchMove}
              onTouchEnd={onServicesTouchEnd}
            >
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${servicesCurrentIndex * 100}%)` }}
              >
                {features.map((feature, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <FeatureSection
                      label={feature.label}
                      title={feature.title}
                      description={feature.description}
                      imageUrl={feature.imageUrl}
                      reverse={feature.reverse}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center items-center space-x-3 mt-8">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setServicesCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    servicesCurrentIndex === index ? 'bg-gray-800 dark:bg-white scale-110' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  aria-label={`Go to service ${index + 1}`}
                />
              ))}
            </div>
          </div>
          {/* Desktop View */}
          <div className="hidden md:block space-y-24 md:space-y-32">
            {features.map((feature, index) => (
              <FeatureSection
                key={index}
                label={feature.label}
                title={feature.title}
                description={feature.description}
                imageUrl={feature.imageUrl}
                reverse={feature.reverse}
              />
            ))}
          </div>
        </div>
        <div id="projects">
          <ProjectsSection />
        </div>
        <div id="calculator">
            <PricingCalculator 
              selections={calculatorSelections}
              onSelectionsChange={setCalculatorSelections}
              onDiscussWithAi={handleDiscussWithAi}
            />
        </div>
        <ApiSection onGitHubClick={() => openModal('github')} />
        <ModelsSection />
      </main>
      <div id="contact">
        <CtaFooter onContactClick={() => openModal('contact')} />
      </div>
      <Footer onContactClick={() => openModal('contact')} />
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {modalContent}
      </Modal>
      <Chatbot 
        isOpen={isChatbotOpen} 
        setIsOpen={setIsChatbotOpen} 
        initialMessage={chatInitialMessage}
        clearInitialMessage={() => setChatInitialMessage('')}
        onViewCalculatorClick={handleViewCalculatorClick}
      />
    </div>
  );
};

export default App;