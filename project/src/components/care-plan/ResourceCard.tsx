import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ResourceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  backgroundColor?: string;
  textColor?: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  title,
  description,
  icon,
  link,
  backgroundColor = 'bg-blue-50',
  textColor = 'text-blue-800'
}) => {
  return (
    <a
      href={link}
      className={`block ${backgroundColor} rounded-xl p-5 transform transition-transform hover:scale-105`}
    >
      <div className="flex items-start">
        <div className={`p-3 rounded-full ${backgroundColor} ${textColor} mb-3 mr-4`}>
          {icon}
        </div>
        <div>
          <h3 className={`font-semibold ${textColor} text-lg mb-2`}>{title}</h3>
          <p className={`${textColor} opacity-80 text-sm mb-3`}>{description}</p>
          <div className="flex items-center mt-auto">
            <span className={`${textColor} text-sm font-medium`}>Learn more</span>
            <ArrowRight className={`h-4 w-4 ml-1 ${textColor}`} />
          </div>
        </div>
      </div>
    </a>
  );
};

export default ResourceCard;