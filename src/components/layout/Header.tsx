import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu, User, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-glass ${
        isScrolled ? 'bg-white/90 shadow-glass border-b border-gray-200/50' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center hover:scale-105 transition-all duration-300 group">
                <span className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-700">CHAIN</span>
                <span className="text-accent-600 text-2xl font-bold mx-0.5 group-hover:text-accent-500 transition-colors duration-300">|</span>
                <span className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary-600 to-secondary-700">Q</span>
                <span className="text-xs font-medium text-gray-500 ml-2 tracking-wider">SIMPLY SMART</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/50 backdrop-blur-sm transition-all duration-200 hover:border-primary-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <button className="text-gray-500 hover:text-gray-700 relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-accent-500 ring-2 ring-white"></span>
            </button>

            <div className="border-l border-gray-200 h-6 mx-2"></div>

            <div className="flex items-center group p-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
              <img
                src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120"
                alt="User profile"
                className="h-9 w-9 rounded-full ring-2 ring-white shadow-sm"
              />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-800 group-hover:text-primary-700 transition-colors duration-200">
                  {user?.name || 'Roberto Ostojic'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role || 'Legal Admin'}
                </p>
              </div>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-xl animate-slide-up">
          <div className="px-4 pt-3 pb-4 space-y-2 sm:px-4">
            <a
              href="#dashboard"
              className="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200"
            >
              Dashboard
            </a>
            <a
              href="#contracts"
              className="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200"
            >
              Contracts
            </a>
            <a
              href="#compliance"
              className="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200"
            >
              Compliance
            </a>
            <a
              href="#collaboration"
              className="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200"
            >
              Collaboration
            </a>
          </div>
          <div className="pt-4 pb-4 border-t border-gray-200">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <img
                  src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120"
                  alt="User profile"
                  className="h-10 w-10 rounded-full ring-2 ring-white shadow-sm"
                />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-900">
                  {user?.name || 'Roberto Ostojic'}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {user?.email || 'john@legaldocs.com'}
                </div>
              </div>
              <button className="ml-auto flex-shrink-0 p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-200">
                <Bell className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3 px-2 space-y-2">
              <a
                href="#profile"
                className="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200"
              >
                Your Profile
              </a>
              <a
                href="#settings"
                className="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200"
              >
                Settings
              </a>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;