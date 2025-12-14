import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../contexts/ThemeContext';
import BottomNavBar from '../../components/BottomNavBar';

import { API_CONFIG } from '../../config/api';

const API_URL = API_CONFIG.API_URL;

export default function Profile() {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [favorisCount, setFavorisCount] = useState(0);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setUser(user);
        fetchFavorisCount(user.id);
      }
    } catch (error) {
      console.error('Erreur chargement user:', error);
    }
  };

  const fetchFavorisCount = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/favoris/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setFavorisCount(data.length);
      }
    } catch (error) {
      console.error('Erreur chargement favoris count:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userData');
            await AsyncStorage.removeItem('userToken');
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <>
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={60} color="#8e44ad" />
        </View>
        
        <Text style={styles.name}>{user?.nom}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Section Menu */}
      <View style={styles.menuSection}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/Favoris')}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="heart" size={24} color="#e74c3c" />
            </View>
            <View>
              <Text style={styles.menuItemTitle}>Mes Favoris</Text>
              <Text style={styles.menuItemSubtitle}>
                {favorisCount} {favorisCount > 1 ? 'parfums' : 'parfum'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#b2bec3" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/MesCommandes')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#e3f2fd' }]}>
              <Ionicons name="receipt" size={24} color="#2196f3" />
            </View>
            <View>
              <Text style={styles.menuItemTitle}>Mes Commandes</Text>
              <Text style={styles.menuItemSubtitle}>Historique d'achats</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#b2bec3" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/panier')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#f3e5f5' }]}>
              <Ionicons name="cart" size={24} color="#9c27b0" />
            </View>
            <View>
              <Text style={styles.menuItemTitle}>Mon Panier</Text>
              <Text style={styles.menuItemSubtitle}>Articles en attente</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#b2bec3" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <Text style={styles.logoutButtonText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
    <BottomNavBar />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0e6f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
