import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { initGoogleAuth, signIn as googleSignIn, signOut as googleSignOut } from '../services/googleAuthService';
import type { GoogleUser } from '../types';

interface AuthContextType {
  user: GoogleUser | null;
  isLoggedIn: boolean;
  isAuthReady: boolean;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const handleAuthChange = useCallback((newUser: GoogleUser | null) => {
    setUser(newUser);
    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    initGoogleAuth(handleAuthChange);
  }, [handleAuthChange]);

  const signIn = () => {
    googleSignIn();
  };

  const signOut = () => {
    googleSignOut();
    setUser(null);
  };
  
  const value = {
    user,
    isLoggedIn: !!user,
    isAuthReady,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
