import React, { createContext, useContext, useState, useEffect } from 'react';
import { ImageSourcePropType } from 'react-native';
import { dbOperations } from '../services/database';

interface User {
  id: string;
  username: string;
  profileImage: string;
  biography: string;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseUser {
  id: string;
  username: string;
  profile_image: string | null;
  biography: string | null;
  created_at: string;
  updated_at: string;
}

interface UserContextType {
  user: User;
  updateUser: (newUser: Partial<User>) => Promise<void>;
}

const defaultUser: User = {
  id: '1',
  username: 'ee_person',
  profileImage: '',
  biography: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser);

  // Fetch user data from database on mount
  useEffect(() => {
    async function loadUserData() {
      try {
        const dbUser = await dbOperations.getUser(defaultUser.id) as DatabaseUser | null;
        if (dbUser) {
          setUser({
            id: dbUser.id,
            username: dbUser.username,
            profileImage: dbUser.profile_image || '',
            biography: dbUser.biography || '',
            createdAt: dbUser.created_at,
            updatedAt: dbUser.updated_at,
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }

    loadUserData();
  }, []);

  const updateUser = async (newUser: Partial<User>) => {
    try {
      // Update in database
      await dbOperations.updateUser(user.id, {
        username: newUser.username,
        profileImage: typeof newUser.profileImage === 'string' ? newUser.profileImage : undefined,
        biography: newUser.biography,
      });
      
      // Update in state
      setUser(prev => ({ ...prev, ...newUser }));
    } catch (error) {
      console.error('Error updating user:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 