import React from 'react';
import Header from './Header';
import TopNav from './TopNav';
import { LocationProvider } from '../../contexts/LocationContext';
import { AuthProvider } from '../../contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <AuthProvider>
      <LocationProvider>
        <div className="min-h-screen bg-gradient-radial from-white via-gray-50 to-gray-100">
          <Header />
          <TopNav />
          <main className="flex-1 pt-36 transition-all duration-300 overflow-x-hidden animate-fade-in backdrop-blur-sm">
            <div className="max-w-full mx-auto px-5 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </LocationProvider>
    </AuthProvider>
  );
};

export default MainLayout;