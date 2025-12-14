import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

function RootLayoutNav() {
  const { isLoading, token } = useContext(AuthContext);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          ...Ionicons.font,
        });
        setFontsLoaded(true);
      } catch (error) {
        console.warn('Erreur lors du chargement des polices:', error);
        setFontsLoaded(true); // Continue même en cas d'erreur
      }
    }
    loadFonts();
  }, []);

  if (isLoading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ animationEnabled: false }} />
      <Stack.Screen name="login" options={{ animationEnabled: false }} />
      <Stack.Screen name="register" options={{ animationEnabled: false }} />
      <Stack.Screen name="(tabs)" options={{ animationEnabled: false }} />
      <Stack.Screen name="ConfirmationCommande" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}