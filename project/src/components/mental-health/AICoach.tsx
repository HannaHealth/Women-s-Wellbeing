import React from 'react';
import { motion } from 'framer-motion';

const AICoach: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center space-x-4 mb-6">
        <img 
          src="https://res.cloudinary.com/dkb6nc8tk/image/upload/v1729149945/hanna_ai_coach_wlpc02.png"
          alt="Hanna™ AI Coach"
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Meet Your AI Coach</h2>
          <p className="text-gray-600">I'm Hanna™, your personal mental wellness guide</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 rounded-lg p-6 mb-6"
      >
        <p className="text-blue-800 mb-4">
          "Let's work together on your mental wellbeing. I'm here to listen, support, and guide you through mindfulness exercises and stress management techniques."
        </p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Start Conversation
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="font-medium text-purple-800 mb-2">Today's Focus</h3>
          <p className="text-purple-600">Mindful breathing and stress reduction</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-medium text-green-800 mb-2">Progress</h3>
          <p className="text-green-600">7 days of consistent practice</p>
        </div>
      </div>
    </div>
  );
};

export default AICoach;