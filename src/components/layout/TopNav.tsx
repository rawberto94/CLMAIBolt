import React, { useState } from 'react';
import { useLocation } from '../../contexts/LocationContext';
import { LayoutDashboard, FileText, Shield, Users, Building2, BarChart2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useEffect } from 'react';

const TopNav: React.FC = () => {
  const { currentLocation, updateLocation } = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    // Get initial location from hash
    const hash = window.location.hash.slice(1);
    const mainRoute = hash.split('/')[0] || 'dashboard';
    updateLocation(mainRoute);

    // Listen for hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const mainRoute = hash.split('/')[0] || 'dashboard';
      updateLocation(mainRoute);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [updateLocation]);

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      href: '#dashboard', 
      icon: LayoutDashboard,
    },
    { 
      id: 'contracts', 
      label: 'Contracts', 
      href: '#contracts', 
      icon: FileText,
    },
    {
      id: 'tools',
      label: 'Tools',
      href: '#tools',
      icon: BarChart2,
    },
    { 
      id: 'compliance', 
      label: 'Compliance', 
      href: '#compliance', 
      icon: Shield,
    },
    { 
      id: 'collaboration', 
      label: 'Collaboration', 
      href: '#collaboration', 
      icon: Users,
    },
    { 
      id: 'suppliers', 
      label: 'Suppliers', 
      href: '#suppliers', 
      icon: Building2,
    },
  ];

  return (
    <div className="fixed top-[4.5rem] left-1/2 transform -translate-x-1/2 z-40 hidden md:block w-auto min-w-[800px] max-w-[calc(100vw-2rem)] transition-all duration-300">
      <nav className="bg-white/95 shadow-glass hover:shadow-glass-hover transition-all duration-300 rounded-2xl backdrop-blur-glass border border-gray-200/30 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-50/10 via-primary-100/10 to-primary-50/10 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
        <ul className="flex items-center p-2">
          {navItems.map((item) => (
            <li key={item.id} className="px-1 flex-shrink-0">
              <a
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  "relative flex items-center px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 group whitespace-nowrap",
                  currentLocation === item.id
                    ? "text-primary-700 bg-primary-50/80 shadow-sm"
                    : "text-gray-600 hover:text-primary-700 hover:bg-primary-50/60 hover:shadow-sm"
                )}
              >
                <div className={cn(
                  "absolute inset-0 rounded-xl transition-opacity duration-300",
                  currentLocation === item.id
                    ? "opacity-100 bg-gradient-to-r from-primary-50/40 via-primary-100/40 to-primary-50/40"
                    : "opacity-0 bg-gradient-to-r from-primary-50/30 via-primary-100/30 to-primary-50/30",
                    hoveredItem === item.id && "opacity-100"
                )}></div>
                <item.icon className={cn(
                  "relative h-5 w-5 mr-3 transition-all duration-300 transform-gpu",
                  currentLocation === item.id
                    ? 'text-primary-500' 
                    : 'text-gray-400',
                    hoveredItem === item.id && "scale-110 rotate-6 text-primary-500"
                )} />
                <span className={cn(
                  "relative font-medium transition-all duration-300 tracking-wide",
                  hoveredItem === item.id && "translate-x-0.5 text-primary-600"
                )}>{item.label}</span>
                <span className={cn(
                  "absolute bottom-1.5 left-1/2 w-1.5 h-1.5 rounded-full bg-primary-500 transform -translate-x-1/2 transition-all duration-300",
                  currentLocation === item.id ? "scale-100 opacity-100" :
                  hoveredItem === item.id ? "scale-100 opacity-100" : "scale-0 opacity-0"
                )}></span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default TopNav;