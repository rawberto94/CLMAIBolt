import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LocationContextProps {
  currentLocation: string;
  updateLocation: (location: string) => void;
}

const LocationContext = createContext<LocationContextProps>({
  currentLocation: 'dashboard',
  updateLocation: () => {},
});

export const useLocation = () => useContext(LocationContext);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState('dashboard');
  
  const updateLocation = (location: string) => {
    // Remove any sub-paths to get the main route
    const mainRoute = location.split('/')[0];
    setCurrentLocation(mainRoute);
  };

  return (
    <LocationContext.Provider value={{ currentLocation, updateLocation }}>
      {children}
    </LocationContext.Provider>
  );
};