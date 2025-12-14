import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

export default function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useContext(ThemeContext);

  const tabs = [
    {
      name: 'Accueil',
      route: '/(tabs)',
      icon: 'home',
      iconOutline: 'home-outline',
    },
    {
      name: 'Parfums',
      route: '/(tabs)/list-parfums',
      icon: 'flask',
      iconOutline: 'flask-outline',
    },
    {
      name: 'Promo',
      route: '/(tabs)/promotions',
      icon: 'flame',
      iconOutline: 'flame-outline',
    },
    {
      name: 'Recomm.',
      route: '/(tabs)/smart-recommendations',
      icon: 'sparkles',
      iconOutline: 'sparkles-outline',
    },
    {
      name: 'Panier',
      route: '/(tabs)/panier',
      icon: 'cart',
      iconOutline: 'cart-outline',
    },
  ];

  const isActive = (route) => {
    // Gestion spéciale pour la route index
    if (route === '/(tabs)') {
      return pathname === '/(tabs)' || pathname === '/(tabs)/';
    }
    return pathname === route;
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {tabs.map((tab, index) => {
          const active = isActive(tab.route);
          return (
            <TouchableOpacity
              key={index}
              style={styles.tabButton}
              onPress={() => router.push(tab.route)}
            >
              <View style={[styles.iconContainer, active && styles.activeIconContainer]}>
                <Ionicons
                  name={active ? tab.icon : tab.iconOutline}
                  size={24}
                  color={active ? '#8e44ad' : '#95a5a6'}
                />
              </View>
              <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingBottom: 20,
    paddingHorizontal: 10,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: '#f0e6f6',
  },
  tabLabel: {
    fontSize: 11,
    color: '#95a5a6',
    fontWeight: '600',
    marginTop: 2,
  },
  activeTabLabel: {
    color: '#8e44ad',
    fontWeight: 'bold',
  },
});