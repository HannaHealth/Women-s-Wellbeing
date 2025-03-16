import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Sparkles, 
  Heart, 
  Globe, 
  MessageCircle,
  Activity,
  Users,
  CheckCircle,
  Utensils
} from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const features = [
    {
      icon: <Utensils className="h-7 w-7" />,
      title: "Culturally-Aware Nutrition",
      description: "Get meal suggestions that respect your dietary preferences and cultural traditions.",
      color: "from-brand-500 to-brand-600",
      benefits: [
        "Local ingredient options",
        "Traditional recipes",
        "Dietary restrictions support"
      ]
    },
    {
      icon: <Globe className="h-7 w-7" />,
      title: "Regional Adaptation",
      description: "Health advice tailored to your local climate, resources, and lifestyle.",
      color: "from-purple-500 to-purple-600",
      benefits: [
        "Climate-appropriate activities",
        "Local health resources",
        "Community support"
      ]
    },
    {
      icon: <MessageCircle className="h-7 w-7" />,
      title: "24/7 AI Support",
      description: "Chat with Hanna™ in your language about health concerns anytime.",
      color: "from-green-500 to-green-600",
      benefits: [
        "Multilingual support",
        "Cultural sensitivity",
        "Privacy focused"
      ]
    }
  ];

  return (
    <div ref={ref} id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center bg-brand-100 text-brand-600 rounded-full px-4 py-2 mb-4">
            <Sparkles className="h-5 w-5 mr-2" />
            <span className="font-medium">Culturally Intelligent</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Health Support That Understands You
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Personalized guidance that respects your culture, traditions, and local context.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <div className={`bg-gradient-to-br ${feature.color} text-white rounded-2xl w-14 h-14 flex items-center justify-center mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;