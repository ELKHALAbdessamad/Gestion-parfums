import { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ScrollView, ActivityIndicator, Alert, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { SmartRecommendationService } from '../../services/SmartRecommendationService';
import { PanierService } from '../../services/PanierService';
import AnimatedCard from '../../components/AnimatedCard';
import BottomNavBar from '../../components/BottomNavBar';
import { getImageUrl } from '../../config/api';

const { width } = Dimensions.get('window');

export default function PromotionsScreen() {
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const [promotions, setPromotions] = useState([]);
  const [newParfums, setNewParfums] = useState([]);
  const [loading, setLoading] = useState(true);
  const scaleAnim = new Animated.Value(0.9);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [promoData, newData] = await Promise.all([
        SmartRecommendationService.getPromotionalParfums(),
        SmartRecommendationService.getNewParfums(),
      ]);
      setPromotions(promoData);
      setNewParfums(newData);
    } catch (error) {
      console.error('Erreur chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (parfum) => {
    try {
      // Calculer le prix final avec vérification des valeurs
      const originalPrice = parseFloat(parfum.prix || 0);
      const discount = parseFloat(parfum.discount_percentage || parfum.reduction || 0);
      
      let prixFinal;
      if (parfum.prix_final && !isNaN(parseFloat(parfum.prix_final))) {
        prixFinal = parseFloat(parfum.prix_final);
      } else if (parfum.has_active_promotion && discount > 0) {
        prixFinal = originalPrice * (1 - discount / 100);
      } else {
        prixFinal = originalPrice;
      }
      
      await PanierService.addToPanier(user.id, parfum.id, 1, prixFinal);
      
      const message = (parfum.has_active_promotion || discount > 0)
        ? `${parfum.nom} ajouté au panier avec promotion (-${discount}%)!`
        : `${parfum.nom} ajouté au panier!`;
      
      Alert.alert('Succès', message);
    } catch (error) {
      console.error('Erreur ajout panier:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter au panier');
    }
  };

  const renderPromoCard = ({ item, index }) => (
    <AnimatedCard delay={index * 100}>
      <View style={[styles.promoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.promoImageContainer}>
          <Image
            source={{ uri: getImageUrl(item.image_url) }}
            style={styles.promoImage}
          />
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discount_percentage || item.reduction || 0}%</Text>
          </View>
        </View>

        <View style={styles.promoContent}>
          <Text style={[styles.promoNom, { color: colors.text }]} numberOfLines={2}>{item.nom}</Text>
          <Text style={[styles.promoMarque, { color: colors.textSecondary }]}>{item.marque}</Text>

          <View style={styles.priceRow}>
            <Text style={[styles.oldPrice, { color: colors.textSecondary }]}>
              {parseFloat(item.prix || 0).toFixed(2)} DH
            </Text>
            <Text style={[styles.newPrice, { color: '#e74c3c' }]}>
              {(() => {
                const originalPrice = parseFloat(item.prix || 0);
                const discount = parseFloat(item.discount_percentage || item.reduction || 0);
                const finalPrice = item.prix_final ? parseFloat(item.prix_final) : (originalPrice * (1 - discount / 100));
                return isNaN(finalPrice) ? originalPrice.toFixed(2) : finalPrice.toFixed(2);
              })()} DH
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => handleAddToCart(item)}
          >
            <Ionicons name="cart" size={16} color="#fff" />
            <Text style={styles.addBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedCard>
  );



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
      <Animated.View style={[styles.heroHeader, { backgroundColor: colors.primary, opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroIcon}>🎉</Text>
          <Text style={styles.heroTitle}>Promotions & Nouveautés</Text>
          <Text style={styles.heroSubtitle}>Découvrez nos meilleures offres exclusives</Text>
        </View>
      </Animated.View>

      {/* Promotions */}
      {promotions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🔥 En Promotion</Text>
            <Ionicons name="flame" size={20} color="#ff6b6b" />
          </View>
          <FlatList
            data={promotions}
            renderItem={({ item, index }) => renderPromoCard({ item, index })}
            keyExtractor={(item) => `promo-${item.id}`}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}

      {/* Nouveautés */}
      {newParfums.length > 0 && (
        <View style={styles.nouveautesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>✨ Nouveautés</Text>
            <Ionicons name="sparkles" size={20} color="#ffd700" />
          </View>
          <FlatList
            data={newParfums}
            renderItem={({ item }) => (
              <View style={styles.nouveauteCard}>
                <View style={styles.nouveauBadge}>
                  <Text style={styles.nouveauBadgeText}>🆕 NOUVEAU</Text>
                </View>
                <Image
                  source={{ uri: getImageUrl(item.image_url) }}
                  style={styles.nouveauImage}
                />
                <View style={styles.nouveauContent}>
                  <Text style={[styles.nouveauNom, { color: colors.text }]} numberOfLines={2}>{item.nom}</Text>
                  <Text style={[styles.nouveauMarque, { color: colors.textSecondary }]}>{item.marque}</Text>
                  <Text style={[styles.nouveauPrice, { color: colors.primary }]}>{parseFloat(item.prix).toFixed(2)} DH</Text>
                  <TouchableOpacity
                    style={[styles.nouveauAddBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleAddToCart(item)}
                  >
                    <Ionicons name="cart" size={12} color="#fff" />
                    <Text style={styles.nouveauAddBtnText}>Ajouter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={(item) => `new-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            style={{ marginVertical: 10 }}
          />
        </View>
      )}

      {/* Message vide */}
      {promotions.length === 0 && newParfums.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="gift-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Aucune promotion</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Revenez bientôt pour découvrir nos offres
          </Text>
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
    paddingVertical: 40,
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
    fontSize: 50,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
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
  section: {
    paddingHorizontal: 8, // Padding horizontal réduit
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#8B4513',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  listContent: {
    gap: 4, // Espace minimal entre les rangées
  },
  promoCard: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  promoImageContainer: {
    position: 'relative',
    width: 130,
    height: 160,
  },
  promoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  promoContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  promoNom: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  promoMarque: {
    fontSize: 12,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  oldPrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  newPrice: {
    fontSize: 16,
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
    fontSize: 13,
    fontWeight: '600',
  },
  // Nouveaux styles pour les nouveautés compactes
  nouveautesSection: {
    paddingVertical: 15,
  },

  nouveauteCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  nouveauBadge: {
    backgroundColor: '#ffd700',
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  nouveauBadgeText: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#333',
  },
  nouveauImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  nouveauContent: {
    padding: 8,
  },
  nouveauNom: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  nouveauMarque: {
    fontSize: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  nouveauPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  nouveauAddBtn: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  nouveauAddBtnText: {
    color: '#fff',
    fontSize: 10,
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
