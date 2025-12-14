import { useRouter } from 'expo-router';
import { useEffect, useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { token, isLoading } = useContext(AuthContext);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (token) {
          router.replace('/(tabs)/accueil');
        } else {
          router.replace('/login');
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, token]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
