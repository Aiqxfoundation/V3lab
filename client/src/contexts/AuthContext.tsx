import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthContextType {
  accessKey: string | null;
  isAuthenticated: boolean;
  setAccessKey: (key: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessKey, setAccessKeyState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aiqx_access_key');
    }
    return null;
  });

  const setAccessKey = (key: string | null) => {
    setAccessKeyState(key);
    if (key) {
      localStorage.setItem('aiqx_access_key', key);
    } else {
      localStorage.removeItem('aiqx_access_key');
    }
  };

  const logout = () => {
    setAccessKey(null);
  };

  const value = {
    accessKey,
    isAuthenticated: !!accessKey,
    setAccessKey,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
