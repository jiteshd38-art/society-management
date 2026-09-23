import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  googleLogout,
  getAccessToken,
  setAccessToken
} from '../services/googleAuth';

interface GoogleAuthContextType {
  user: User | null;
  accessToken: string | null;
  isConnected: boolean;
  isLoggingIn: boolean;
  login: () => Promise<{ user: User; accessToken: string } | null>;
  logout: () => Promise<void>;
  error: string | null;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

export const GoogleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setToken(token);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setToken(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const login = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        return res;
      }
      return null;
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setError(err?.message || 'Failed to authenticate with Google');
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    await googleLogout();
    setUser(null);
    setToken(null);
    setError(null);
  };

  return (
    <GoogleAuthContext.Provider
      value={{
        user,
        accessToken,
        isConnected: !!(user && accessToken),
        isLoggingIn,
        login,
        logout,
        error
      }}
    >
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext);
  if (!context) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
  }
  return context;
};
