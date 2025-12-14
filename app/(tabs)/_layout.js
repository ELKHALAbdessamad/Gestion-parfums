import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="accueil" />
      <Tabs.Screen name="list-parfums" />
      <Tabs.Screen name="panier" />
      <Tabs.Screen name="MesCommandes" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="Favoris" />
      <Tabs.Screen name="avis" />
      <Tabs.Screen name="notifications" />
      <Tabs.Screen name="support" />
      <Tabs.Screen name="filtres" />
      <Tabs.Screen name="recommandations" />
      <Tabs.Screen name="wishlist" />
      <Tabs.Screen name="promotions" />
      <Tabs.Screen name="smart-recommendations" />
    </Tabs>
  );
}