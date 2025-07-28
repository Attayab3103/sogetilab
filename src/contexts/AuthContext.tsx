import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getMe();
          const userData = response.data.user;
          
          const userObject: User = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            credits: userData.credits,
            createdAt: new Date(),
          };
          
          setUser(userObject);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Don't throw error, just continue without authentication
        }
      }
      setLoading(false);
    };

    // Don't make API calls in development if backend is not running
    if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
      console.warn('No API URL configured, skipping auth check');
      setLoading(false);
      return;
    }

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // If no API URL configured, use mock authentication for development
      if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
        const mockUser: User = {
          id: 'mock-user-id',
          email,
          name: 'Demo User',
          credits: 100,
          createdAt: new Date(),
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return;
      }

      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      // Create user object
      const userObject: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        credits: userData.credits,
        createdAt: new Date(),
      };
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(userObject));
      setUser(userObject);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      // If no API URL configured, use mock authentication for development
      if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
        const mockUser: User = {
          id: 'mock-user-id',
          email,
          name,
          credits: 100,
          createdAt: new Date(),
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return;
      }

      const response = await authAPI.register({ name, email, password });
      const { token, user: userData } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      // Create user object
      const userObject: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        credits: userData.credits,
        createdAt: new Date(),
      };
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(userObject));
      setUser(userObject);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      window.location.replace('/login'); // Redirect to login page and prevent back navigation
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      if (updates.name) {
        await authAPI.updateProfile({ name: updates.name });
      }
      
      if (user) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      console.error('Update user error:', error);
      throw new Error(error.response?.data?.message || 'Update failed');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
            <p className="text-gray-500 mt-2">Initializing AI Interview Assistant</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
