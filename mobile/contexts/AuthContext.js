import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkLoginStatus = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const userData = await SecureStore.getItemAsync('userData');
        
        if (token && userData) {
          setCurrentUser(JSON.parse(userData));
          setIsAuthenticated(true);
          
          // Set the token in axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { token, ...userData } = response.data;
      
      // Store token and user data
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(userData));
      
      // Set auth state
      setCurrentUser(userData);
      setIsAuthenticated(true);
      
      // Set the token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      const { token, ...user } = response.data;
      
      // Store token and user data
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(user));
      
      // Set auth state
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      // Set the token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Clear stored data
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
      
      // Reset auth state
      setCurrentUser(null);
      setIsAuthenticated(false);
      
      // Remove token from axios headers
      delete api.defaults.headers.common['Authorization'];
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      const response = await api.put('/users/profile', updatedData);
      
      // Update stored user data
      const updatedUser = { ...currentUser, ...response.data };
      await SecureStore.setItemAsync('userData', JSON.stringify(updatedUser));
      
      // Update auth state
      setCurrentUser(updatedUser);
      
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        loading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
