import React from 'react';
import { Users } from 'lucide-react';

const CommunitySection: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Community Support</h2>
        <Users className="h-5 w-5 text-blue-600" />
      </div>

      <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80"
          alt="Diverse community members"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
          <p className="text-white text-sm">
            Join our community of women supporting each other on their health journey
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="font-medium text-purple-800 mb-2">Success Stories</h3>
          <p className="text-purple-600 text-sm">
            Read inspiring stories from women who've achieved their health goals
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-medium text-green-800 mb-2">Local Support</h3>
          <p className="text-green-600 text-sm">
            Connect with others in your area for motivation and tips
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommunitySection;