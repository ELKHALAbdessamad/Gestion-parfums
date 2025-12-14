import { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ScrollView, ActivityIndicator, Alert, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { SmartRecommendationService } from '../../services/SmartRecommendationService';
import { PanierService } from '../../services/PanierService';
import AnimatedCard from '../../components/AnimatedCard';
import { getImageUrl } from '../../config/api';
import BottomNavBar from '../../components/BottomNavBar';

const { width } = Dimensions.get('window');

export default function SmartRecommendationsScreen() {
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const [recommendations, setRecommendations] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await SmartRecommendationService.getCombinedRecommendations(user.id);
      
      // Si pas de données, utiliser les parfums tendance comme fallback
      if (!data.trending || data.trending.length === 0) {
        const fallbackData = await SmartRecommendationService.getTrendingParfums();
        setRecommendations({
          ...data,
          trending: fallbackData,
          byHistory: data.byHistory || fallbackData.slice(0, 3),
          byFavorites: data.byFavorites || fallbackData.slice(3, 6),
        });
      } else {
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      // En cas d'erreur, charger au moins les parfums tendance
      try {
        const fallbackData = await SmartRecommendationService.getTrendingParfums();
        setRecommendations({
          trending: fallbackData,
          byHistory: fallbackData.slice(0, 3),
          byFavorites: fallbackData.slice(3, 6),
          promotions: fallbackData.slice(0, 4),
          newParfums: fallbackData.slice(4, 8),
        });
      } catch (fallbackError) {
        Alert.alert('Erreur', 'Impossible de charger les recommandations');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (parfum) => {
    try {
      // Utiliser le prix final (avec promotion si applicable)
      const prixFinal = parfum.prix_final || parfum.prix;
      await PanierService.addToPanier(user.id, parfum.id, 1, prixFinal);
      
      const message = parfum.has_active_promotion 
        ? `${parfum.nom} ajouté au panier avec promotion (-${parfum.discount_percentage}%)!`
        : `${parfum.nom} ajouté au panier!`;
      
      Alert.alert('Succès', message);
    } catch (error) {
      console.error('Erreur ajout panier:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter au panier');
    }
  };

  const renderParfumCard = ({ item, index }) => (
    <AnimatedCard delay={index * 50}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Image
          source={{ uri: getImageUrl(item.image_url) }}
          style={styles.image}
        />
        <View style={styles.cardContent}>
          <Text style={[styles.nom, { color: colors.text }]} numberOfLines={2}>{item.nom}</Text>
          <Text style={[styles.marque, { color: colors.textSecondary }]}>{item.marque}</Text>
          <View style={styles.priceContainer}>
            {item.has_active_promotion ? (
              <>
                <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                  {parseFloat(item.prix).toFixed(2)} DH
                </Text>
                <Text style={[styles.promoPrice, { color: '#e74c3c' }]}>
                  {parseFloat(item.prix_final).toFixed(2)} DH
                </Text>
                <View style={styles.promoBadge}>
                  <Text style={styles.promoText}>-{item.discount_percentage}%</Text>
                </View>
              </>
            ) : (
              <Text style={[styles.prix, { color: colors.primary }]}>
                {parseFloat(item.prix_final || item.prix).toFixed(2)} DH
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => handleAddToCart(item)}
          >
            <Ionicons name="cart" size={14} color="#fff" />
            <Text style={styles.addBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedCard>
  );

  const tabs = [
    { id: 'history', label: '📊 Basé sur vos achats', icon: 'bar-chart' },
    { id: 'favorites', label: '❤️ Basé sur vos favoris', icon: 'heart' },
    { id: 'trending', label: '🔥 Tendances', icon: 'flame' },
    { id: 'promotions', label: '💰 Promotions', icon: 'pricetag' },
    { id: 'newParfums', label: '✨ Nouveautés', icon: 'sparkles' },
  ];

  const getActiveData = () => {
    switch (activeTab) {
      case 'history':
        return recommendations.byHistory || [];
      case 'favorites':
        return recommendations.byFavorites || [];
      case 'trending':
        return recommendations.trending || [];
      case 'promotions':
        return recommendations.promotions || [];
      case 'newParfums':
        return recommendations.newParfums || [];
      default:
        return [];
    }
  };

  const activeData = getActiveData();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
    >
      {/* Hero Header */}
      <View style={[styles.heroHeader, { backgroundColor: colors.primary }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroIcon}>🎯</Text>
          <Text style={styles.heroTitle}>Recommandations Intelligentes</Text>
          <Text style={styles.heroSubtitle}>Parfums sélectionnés spécialement pour vous</Text>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
        nestedScrollEnabled={true}
        decelerationRate="fast"
      >
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              { backgroundColor: colors.surface, borderColor: colors.border },
              activeTab === tab.id && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[
              styles.tabText,
              { color: colors.text },
              activeTab === tab.id && { color: '#fff', fontWeight: 'bold' },
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {activeData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Aucune recommandation</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Explorez plus de parfums pour obtenir des recommandations
          </Text>
        </View>
      ) : (
        <View style={styles.listWrapper}>
          <FlatList
            data={activeData}
            renderItem={({ item, index }) => renderParfumCard({ item, index })}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Footer Spacing */}
      <View style={{ height: 100 }} />
    </ScrollView>
    <BottomNavBar />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroHeader: {
    paddingVertical: 35,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabsContent: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1.5,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listWrapper: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  listContent: {
    gap: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 10,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 12,
  },
  nom: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  marque: {
    fontSize: 11,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  prix: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  promoPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  promoBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  promoText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addBtn: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    elevation: 3,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
