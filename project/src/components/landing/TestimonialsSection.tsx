import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Fatima A.",
    location: "Dubai, UAE",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80",
    quote: "Hanna™ understands my dietary preferences during Ramadan and suggests perfect meal plans that keep my blood sugar stable.",
    rating: 5
  },
  {
    name: "Maria G.",
    location: "Mexico City, Mexico",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80",
    quote: "The app suggests affordable, healthy alternatives to traditional dishes that still taste great!",
    rating: 5
  },
  {
    name: "Priya S.",
    location: "Mumbai, India",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80",
    quote: "Finally, health advice that understands my vegetarian lifestyle and local ingredients.",
    rating: 5
  }
];

const TestimonialsSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <div ref={ref} className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Women Worldwide
          </h2>
          <p className="text-xl text-gray-600">
            Hear from our diverse community of users
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <Quote className="h-8 w-8 text-blue-100 mb-2" />
              <p className="text-gray-600 italic">{testimonial.quote}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;