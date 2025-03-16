import React from 'react';
import { Utensils, Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AffordableFoodSection: React.FC = () => {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/nutrition', { state: { ingredients } });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Affordable Meal Ideas</h2>
        <Utensils className="h-5 w-5 text-blue-600" />
      </div>

      <div className="bg-blue-50 rounded-lg p-6 mb-6">
        <h3 className="font-medium text-blue-800 mb-2">Tell Hanna™ What You Have</h3>
        <p className="text-blue-600 mb-4">
          Share your available ingredients, and I'll suggest healthy, affordable meals you can make.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="e.g., rice, beans, tomatoes..."
              className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            Get Ideas
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">Budget-Friendly Staples</h4>
          <ul className="space-y-2 text-gray-600">
            <li>• Rice and beans (high in protein)</li>
            <li>• Lentils (great source of fiber)</li>
            <li>• Eggs (affordable protein)</li>
            <li>• Seasonal vegetables</li>
          </ul>
        </div>
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">Smart Shopping Tips</h4>
          <ul className="space-y-2 text-gray-600">
            <li>• Buy in bulk when possible</li>
            <li>• Choose frozen vegetables</li>
            <li>• Look for local produce</li>
            <li>• Compare unit prices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AffordableFoodSection;