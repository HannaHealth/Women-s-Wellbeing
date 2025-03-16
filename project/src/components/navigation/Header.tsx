import React, { useState } from 'react';
import { Menu, Search, X, Globe, LogOut } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import NotificationCenter from '../notifications/NotificationCenter';

const Header: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/dashboard', label: t('sidebar.dashboard') },
    { to: '/assessment', label: t('sidebar.assessment') },
    { to: '/care-plan', label: t('sidebar.carePlan') },
    { to: '/mental-health', label: t('sidebar.mentalHealth') },
    { to: '/chat', label: t('sidebar.chatAssistant') },
    { to: '/profile', label: t('sidebar.profile') },
    { to: '/nutrition', label: t('sidebar.nutrition') }
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const languageOptions = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
  ];

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 focus:outline-none"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className={`${searchOpen ? 'flex flex-1' : 'hidden md:flex md:flex-1'} mx-4`}>
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder={t('header.search')}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            {searchOpen && (
              <button 
                onClick={() => setSearchOpen(false)} 
                className="md:hidden absolute right-3 top-2.5 text-gray-400"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {!searchOpen && (
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden text-gray-500 focus:outline-none"
            >
              <Search size={20} />
            </button>
          )}

          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none bg-gray-100 border-none px-3 py-1.5 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languageOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.name}
                </option>
              ))}
            </select>
            <Globe className="absolute right-2 top-2 text-gray-500 pointer-events-none" size={16} />
          </div>

          <NotificationCenter />

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <img 
                  src="https://res.cloudinary.com/dkb6nc8tk/image/upload/v1729149945/logo_hibahealth_wlpc02.svg" 
                  alt="Hanna Health" 
                  className="h-8 w-auto"
                />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => 
                      `flex items-center px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`
                    }
                    onClick={() => setSidebarOpen(false)}
                    end
                  >
                    <span className="ml-3">{link.label}</span>
                  </NavLink>
                ))}
                <button
                  onClick={handleSignOut}
                  className="w-full mt-4 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-left flex items-center"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  {t('sidebar.signOut')}
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;