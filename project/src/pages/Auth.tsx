import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Heart, Shield, Brain } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Auth: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, checkSession } = useAuth();
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const redirectIfLoggedIn = async () => {
      const isLoggedIn = await checkSession();
      if (isLoggedIn) {
        navigate('/');
      }
    };
    
    redirectIfLoggedIn();
  }, [checkSession, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignIn) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Welcome back!');
        navigate('/');
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        toast.success('Account created! Please complete your health profile.');
        navigate('/onboarding');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Heart className="h-6 w-6 text-accent-600" />,
      title: "Personalized Health Tracking",
      description: "Monitor your progress with tools designed for your needs"
    },
    {
      icon: <Brain className="h-6 w-6 text-brand-600" />,
      title: "AI-Powered Guidance",
      description: "Get personalized advice from Hanna™, your health assistant"
    },
    {
      icon: <Shield className="h-6 w-6 text-green-600" />,
      title: "Private & Secure",
      description: "Your health data is protected and encrypted"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-500 to-accent-500">
      <div className="container mx-auto px-4 py-8 h-screen flex items-center justify-center">
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-6xl">
          {/* Left Side - Auth Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-2xl shadow-xl"
          >
            <div className="flex justify-center mb-8">
              <img
                src="https://res.cloudinary.com/dkb6nc8tk/image/upload/v1729149945/logo_hibahealth_wlpc02.svg"
                alt="HannaHealth"
                className="h-12"
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
              {isSignIn ? 'Welcome Back!' : 'Create Your Account'}
            </h2>
            <p className="text-gray-600 text-center mb-8">
              {isSignIn 
                ? 'Sign in to continue your health journey with Hanna™'
                : 'Join thousands of women on their path to better health'
              }
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-8 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-all transform hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  <>
                    {isSignIn ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignIn(!isSignIn)}
                  className="text-brand-600 hover:text-brand-700 font-medium"
                >
                  {isSignIn ? "Need an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Right Side - Features */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:block"
          >
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-8">
                Your Journey to Better Health Starts Here
              </h2>

              <div className="space-y-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-white/10 rounded-lg">
                          {feature.icon}
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-white">
                          {feature.title}
                        </h3>
                        <p className="text-blue-100">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <p className="text-white text-sm">
                  By signing up, you agree to our Terms of Service and Privacy Policy. 
                  Your data is securely encrypted and handled in compliance with GDPR 
                  and HIPAA regulations.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;