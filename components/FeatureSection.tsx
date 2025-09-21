
import React from 'react';

interface FeatureSectionProps {
  label: string;
  title: string;
  description: string;
  imageUrl: string;
  reverse?: boolean;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ label, title, description, imageUrl, reverse = false }) => {
  const direction = reverse ? 'md:flex-row-reverse' : 'md:flex-row';

  return (
    <section className={`flex flex-col ${direction} items-center gap-12 md:gap-24`}>
      <div className="md:w-1/2">
        <p className="text-gray-400 mb-2">{label}</p>
        <h2 className="text-4xl font-medium text-white tracking-tight mb-4">{title}</h2>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
      <div className="md:w-1/2 w-full">
        <div className="aspect-[4/3] bg-zinc-800 rounded-2xl overflow-hidden">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
