import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FeatureSection from './components/FeatureSection';
import ProjectsSection from './components/ProjectsSection';
import PricingCalculator from './components/PricingCalculator';
import ApiSection from './components/ApiSection';
import ModelsSection from './components/ModelsSection';
import CtaFooter from './components/CtaFooter';
import Footer from './components/Footer';
import Modal from './components/Modal';
import Chatbot from './components/Chatbot';
import { GitHubIcon } from './components/Icons';

const ContactForm: React.FC = () => (
  <div>
    <h2 id="modal-title" className="text-3xl font-medium text-white mb-4">Get in Touch</h2>
    <p className="text-gray-400 mb-6">Have a project in mind, or just want to connect? Feel free to send me a message. You can reach me directly at <a href="mailto:akhi.yusuf@example.com" className="text-sky-400 hover:underline">akhi.yusuf@example.com</a>.</p>
    <form className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
        <input type="text" name="name" id="name" className="mt-1 block w-full bg-[#2a2a2a] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" placeholder="Your Name" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
        <input type="email" name="email" id="email" className="mt-1 block w-full bg-[#2a2a2a] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" placeholder="you@example.com" />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-300">Message</label>
        <textarea id="message" name="message" rows={4} className="mt-1 block w-full bg-[#2a2a2a] border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" placeholder="Your message..."></textarea>
      </div>
      <button type="submit" onClick={(e) => e.preventDefault()} className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
        Send Message (Simulation)
      </button>
    </form>
  </div>
);

const GitHubModalContent: React.FC = () => (
    <div>
        <h2 id="modal-title" className="text-3xl font-medium text-white mb-4">View on GitHub</h2>
        <p className="text-gray-400 mb-6">This button will take you to my GitHub profile where you can see the source code for my projects, including this portfolio itself!</p>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
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
  
  const handleDiscussWithAI = (scopeSummary: string) => {
    setChatInitialMessage(scopeSummary);
    setIsChatbotOpen(true);
  };

  return (
    <div className="bg-[#131314] text-gray-300 font-sans antialiased">
      <Header onContactClick={() => openModal('contact')} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Hero onProjectsClick={scrollToProjects} onContactClick={() => openModal('contact')} />
        <div id="services" className="space-y-24 md:space-y-32 py-24">
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
        <div id="projects">
          <ProjectsSection />
        </div>
        <div id="calculator">
            <PricingCalculator onDiscussWithAI={handleDiscussWithAI} />
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
      />
    </div>
  );
};

export default App;