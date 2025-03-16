import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const HeroSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div 
      ref={ref}
      className="relative bg-gradient-to-br from-brand-600 to-accent-600 text-white overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom right, rgba(0, 98, 255, 0.92), rgba(225, 29, 72, 0.92)), url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <motion.div 
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <motion.div 
          variants={itemVariants}
          className="inline-flex items-center bg-blue-800/30 rounded-full px-4 py-2 text-blue-100 backdrop-blur-sm mb-6"
        >
          <Star className="h-5 w-5 mr-2" />
          <span>UNICEF FemTech Initiative</span>
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
        >
          Your Personal AI Health
          <span className="block text-blue-200">Assistant for Women</span>
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-xl md:text-2xl text-blue-100 leading-relaxed mb-8 max-w-2xl"
        >
          Join thousands of women using Hanna™'s AI-powered guidance for better health. 
          Personalized support that understands your culture, lifestyle, and needs.
        </motion.p>
        
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            to="/auth"
            className="inline-flex items-center px-8 py-4 bg-white text-brand-600 font-semibold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
          >
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center px-8 py-4 bg-brand-700/40 text-white rounded-lg hover:bg-brand-700/50 transition-all backdrop-blur-sm border border-white/20"
          >
            Learn More
          </a>
        </motion.div>

        {/* Floating Elements */}
        <motion.div 
          className="absolute top-1/4 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute bottom-1/4 left-0 w-48 h-48 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </motion.div>

      {/* Wave SVG */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M0 200L48 185.2C96 170.3 192 140.7 288 140.7C384 140.7 480 170.3 576 155.3C672 140.3 768 81 864 66C960 51 1056 81 1152 96C1248 111 1344 111 1392 111L1440 111V200H1392C1344 200 1248 200 1152 200C1056 200 960 200 864 200C768 200 672 200 576 200C480 200 384 200 288 200C192 200 96 200 48 200H0Z" 
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;