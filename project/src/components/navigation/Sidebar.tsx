import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Heart, 
  MessageCircle, 
  UserCircle,
  Activity,
  Settings,
  LogOut,
  Utensils
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useHealthData } from '../../contexts/HealthDataContext';

const Sidebar: React.FC = () => {
  const { t } = useLanguage();
  const { signOut } = useAuth();
  const { healthProfile } = useHealthData();
  const navigate = useNavigate();
  
  const navLinks = [
    { to: '/dashboard', icon: <BarChart3 size={20} />, label: t('sidebar.dashboard') },
    { to: '/care-plan', icon: <Activity size={20} />, label: t('sidebar.carePlan') },
    { to: '/nutrition', icon: <Utensils size={20} />, label: 'Nutrition' },
    { to: '/mental-health', icon: <Heart size={20} />, label: t('sidebar.mentalHealth') },
    { to: '/profile', icon: <UserCircle size={20} />, label: t('sidebar.profile') },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <aside className="bg-white h-full w-64 hidden md:block shadow-md">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <img 
            src="https://res.cloudinary.com/dkb6nc8tk/image/upload/v1729149945/logo_hibahealth_wlpc02.svg" 
            alt="Hanna Health" 
            className="h-8 w-auto"
          />
        </div>
      </div>
      <nav className="mt-6">
        <ul>
          {navLinks.map((link) => (
            <li key={link.to} className="px-2">
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 my-1 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
                end
              >
                <span className="mr-3">{link.icon}</span>
                <span className="flex-1">{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="absolute bottom-0 w-64 p-6">
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <LogOut size={18} className="mr-2" />
          {t('sidebar.signOut')}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;