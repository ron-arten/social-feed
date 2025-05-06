import React, { createContext, useContext, useState } from 'react';
import { ImageSourcePropType } from 'react-native';

interface User {
  username: string;
  profileImage: ImageSourcePropType;
  biography: string;
}

interface UserContextType {
  user: User;
  updateUser: (user: Partial<User>) => void;
}

const defaultUser: User = {
  username: 'ee_person',
  profileImage: require('../images/profileImage/christian-buehner-DItYlc26zVI-unsplash.jpg'),
  biography: 'What does it take to install PendoSDK?',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser);

  const updateUser = (newUser: Partial<User>) => {
    setUser(prev => ({ ...prev, ...newUser }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 