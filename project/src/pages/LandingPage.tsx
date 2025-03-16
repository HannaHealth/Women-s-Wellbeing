import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Shield, 
  Brain, 
  ArrowRight, 
  Globe, 
  MessageCircle,
  Activity,
  Sparkles,
  CheckCircle,
  Star,
  Zap,
  Menu,
  Utensils,
  Apple,
  Carrot,
  Search,
  Bot
} from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Food Assistant Focus */}
      <div 
        className="relative bg-gradient-to-br from-brand-600 to-accent-600 text-white overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom right, rgba(0, 98, 255, 0.92), rgba(225, 29, 72, 0.92)), url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Navigation Bar */}
        <div className="relative border-b border-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <img 
                src="https://res.cloudinary.com/dkb6nc8tk/image/upload/v1729149945/logo_hibahealth_wlpc02.svg"
                alt="HannaHealth"
                className="h-10 w-auto brightness-0 invert"
              />
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-blue-100 hover:text-white transition-colors font-medium">Features</a>
                <a href="#about" className="text-blue-100 hover:text-white transition-colors font-medium">About</a>
                <Link
                  to="/auth"
                  className="px-6 py-2.5 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
                >
                  Sign In
                </Link>
              </div>
              <button className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors">
                <Menu className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center bg-blue-800/30 rounded-full px-4 py-2 text-blue-100 backdrop-blur-sm"
              >
                <Star className="h-5 w-5 mr-2" />
                <span>UNICEF FemTech Initiative</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              >
                Your AI Health Assistant
                <span className="block text-blue-200">For Women's Wellbeing</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl md:text-2xl text-blue-100 leading-relaxed"
              >
                Experience personalized health guidance with Hanna™, your dedicated AI companion for managing diabetes, nutrition, and overall wellness.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
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
            </div>

            {/* Interactive AI Assistant Preview */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-2">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-brand-600" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-800">Chat with Hanna™</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <p className="text-gray-700">How can I manage my blood sugar during Ramadan?</p>
                  </div>
                  <div className="bg-brand-50 rounded-lg p-4">
                    <p className="text-brand-800">I'll help you create a meal plan that keeps your blood sugar stable while fasting. Let's start with some pre-dawn meal suggestions...</p>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="absolute -top-10 -right-10 bg-green-400 rounded-full p-4 shadow-lg"
              >
                <Apple className="h-8 w-8 text-white" />
              </motion.div>
              
              <motion.div 
                animate={{ 
                  y: [0, 10, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ 
                  duration: 3.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 0.5
                }}
                className="absolute -bottom-10 -left-10 bg-orange-400 rounded-full p-4 shadow-lg"
              >
                <Carrot className="h-8 w-8 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>

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

      {/* Features Section */}
      <div id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-brand-100 text-brand-600 rounded-full px-4 py-2 mb-4">
              <Sparkles className="h-5 w-5 mr-2" />
              <span className="font-medium">AI-Powered Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Better Health
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive health management powered by advanced AI technology and evidence-based guidance.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-2xl w-14 h-14 flex items-center justify-center mb-6">
                <Utensils className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Recipe Assistant</h3>
              <p className="text-gray-600 mb-4">
                Get personalized meal suggestions based on your available ingredients and health goals.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Culturally appropriate recipes
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Blood sugar friendly options
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Budget-conscious meals
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl w-14 h-14 flex items-center justify-center mb-6">
                <Brain className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Health Tracking</h3>
              <p className="text-gray-600 mb-4">
                Monitor your progress with easy-to-use tools designed for women's health needs.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Blood sugar monitoring
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Weight management
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Mood and stress tracking
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl w-14 h-14 flex items-center justify-center mb-6">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3">24/7 AI Support</h3>
              <p className="text-gray-600 mb-4">
                Get instant answers to your health questions from Hanna™, your personal AI health assistant.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Personalized guidance
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Evidence-based advice
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Cultural sensitivity
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Try It Now Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-50 rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h2 className="text-3xl font-bold text-brand-800 mb-4">
                Try Hanna™ Right Now
              </h2>
              <p className="text-xl text-brand-600">
                Tell me what ingredients you have, and I'll suggest healthy meals you can make.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="e.g., I have rice, beans, tomatoes..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <Link
                  to="/auth"
                  className="mt-4 w-full inline-flex items-center justify-center px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
                >
                  Get Meal Ideas
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UNICEF Partnership Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-blue-100 text-blue-600 rounded-full px-4 py-2 mb-4">
              <Globe className="h-5 w-5 mr-2" />
              <span className="font-medium">UNICEF FemTech Initiative</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Part of UNICEF's Women and Girls' Health Initiative
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              HannaHealth is an open-source project aligned with UNICEF's initiative for improving the health, wellbeing, and socio-economic participation of women and girls in low- and middle-income countries.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Open Source</h3>
              <p className="text-gray-600 mb-4">
                Freely available on GitHub for transparency, collaboration, and community-driven improvements.
              </p>
              <a 
                href="https://github.com/HannaHealth" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
              >
                View on GitHub
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-600 mb-4">
                Advanced artificial intelligence providing personalized health guidance and support.
              </p>
              <a 
                href="#features" 
                className="text-green-600 hover:text-green-800 font-medium inline-flex items-center"
              >
                Learn More
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Impact Focused</h3>
              <p className="text-gray-600 mb-4">
                Dedicated to improving women's health outcomes in underserved communities.
              </p>
              <a 
                href="https://www.unicef.org/innovation" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center"
              >
                See Impact
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-brand-600 to-accent-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Start Your Health Journey Today
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of women using Hanna™'s AI-powered guidance for better health.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center px-8 py-4 bg-white text-brand-600 font-semibold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-white font-semibold mb-4 text-lg">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-lg">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-lg">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-lg">Connect</h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-gray-800">
            <div className="text-center">
              <p className="text-gray-400">&copy; {new Date().getFullYear()} HannaHealth. All rights reserved.</p>
              <div className="mt-4 flex justify-center space-x-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;