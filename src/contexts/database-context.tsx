import React, { createContext, useContext, useEffect, useState } from 'react';
import { initDatabase } from '../services/database';
import * as SQLite from 'expo-sqlite';

interface DatabaseContextType {
  isInitialized: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isInitialized: false,
  error: null,
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initializeDatabase() {
      try {
        await initDatabase();
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize database'));
      }
    }

    initializeDatabase();
  }, []);

  return (
    <DatabaseContext.Provider value={{ isInitialized, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
} 