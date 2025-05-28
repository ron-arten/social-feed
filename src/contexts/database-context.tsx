import React, { createContext, useContext, useEffect, useState } from 'react';
import { initDatabase, closeDatabase } from '../services/database';
import * as SQLite from 'expo-sqlite';

interface DatabaseContextType {
  isInitialized: boolean;
  error: Error | null;
  isInitializing: boolean;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isInitialized: false,
  error: null,
  isInitializing: false,
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initializeDatabase() {
      if (isInitializing) return;
      
      setIsInitializing(true);
      setError(null);
      
      try {
        await initDatabase();
        if (isMounted) {
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('Database initialization error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize database'));
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }

    initializeDatabase();

    // Cleanup function
    return () => {
      isMounted = false;
      // Close database connection when component unmounts
      closeDatabase().catch(console.error);
    };
  }, []); // Empty dependency array means this runs once when the app starts

  return (
    <DatabaseContext.Provider value={{ isInitialized, error, isInitializing }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
} 