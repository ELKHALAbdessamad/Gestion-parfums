import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier si l'utilisateur est déjà connecté au démarrage
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        const savedUser = await AsyncStorage.getItem('userData');
        
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error('Erreur lors de la récupération du token:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    user,
    token,
    isLoading,
    
    login: async (email, password) => {
      try {
        const response = await fetch(`${API_CONFIG.API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, mot_de_passe: password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Erreur de connexion');
        }

        await AsyncStorage.setItem('userToken', data.user.id.toString());
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        
        setToken(data.user.id.toString());
        setUser(data.user);
        
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    register: async (nom, email, password) => {
      try {
        const response = await fetch(`${API_CONFIG.API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nom, email, mot_de_passe: password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Erreur d\'inscription');
        }

        return { success: true, userId: data.userId };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    logout: async () => {
      try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        setToken(null);
        setUser(null);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};
