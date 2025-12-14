import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('darkMode');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Erreur chargement thème:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newValue = !isDarkMode;
      setIsDarkMode(newValue);
      await AsyncStorage.setItem('darkMode', JSON.stringify(newValue));
    } catch (error) {
      console.error('Erreur sauvegarde thème:', error);
    }
  };

  const colors = isDarkMode ? {
    background: '#2d1b2e',
    surface: '#3d2b3e',
    text: '#fce4ec',
    textSecondary: '#f8bbd9',
    primary: '#ec407a',
    secondary: '#f48fb1',
    accent: '#e91e63',
    border: '#4d3b4e',
    card: '#3d2b3e',
  } : {
    background: '#fce4ec',
    surface: '#ffffff',
    text: '#2d1b2e',
    textSecondary: '#4a2c4a',
    primary: '#ec407a',
    secondary: '#f48fb1',
    accent: '#e91e63',
    border: '#f8bbd9',
    card: '#ffffff',
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};
