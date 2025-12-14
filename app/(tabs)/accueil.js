import { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert, ScrollView, Dimensions, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { PanierService } from '../../services/PanierService';
import BottomNavBar from '../../components/BottomNavBar';
import { API_CONFIG, getImageUrl } from '../../config/api';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, token } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBestSellers();
  }, []);

  const loadBestSellers = async () => {
    try {
      setLoading(true);
      // Charger les parfums avec le moins de stock (les plus vendus)
      const response = await fetch(`${API_CONFIG.API_URL}/parfums`);
      const data = await response.json();
      // Trier par stock croissant pour avoir les plus vendus
      const sorted = data.sort((a, b) => a.stock - b.stock).slice(0, 6);
      setBestSellers(sorted);
    } catch (error) {
      console.error('Erreur chargement best sellers:', error);
      Alert.alert('Erreur', 'Impossible de charger les produits');
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionPress = (collection) => {
    router.push(`/(tabs)/list-parfums?collection=${collection}`);
  };

  const handleAddToCart = async (parfum) => {
    if (!token) {
      Alert.alert('Connexion requise', 'Veuillez vous connecter pour ajouter au panier', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se connecter', onPress: () => router.push('/login') }
      ]);
      return;
    }

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

  const renderBestSeller = ({ item }) => (
    <View style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: getImageUrl(item.image_url) }}
          style={styles.productImage}
        />
        {item.stock < 10 && (
          <View style={styles.lowStockBadge}>
            <Text style={styles.lowStockText}>Stock faible</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={[styles.productBrand, { color: colors.textSecondary }]}>{item.marque}</Text>
        <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{item.nom}</Text>
        <View style={styles.productPriceRow}>
          {item.has_active_promotion ? (
            <View style={styles.priceContainer}>
              <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                {parseFloat(item.prix).toFixed(2)} DH
              </Text>
              <Text style={[styles.promoPrice, { color: '#e74c3c' }]}>
                {parseFloat(item.prix_final).toFixed(2)} DH
              </Text>
              <View style={styles.promoBadge}>
                <Text style={styles.promoText}>-{item.discount_percentage}%</Text>
              </View>
            </View>
          ) : (
            <Text style={[styles.productPrice, { color: colors.primary }]}>
              {parseFloat(item.prix_final || item.prix).toFixed(2)} DH
            </Text>
          )}
          <Text style={[styles.productStock, { color: item.stock > 0 ? '#27ae60' : '#e74c3c' }]}>
            Stock: {item.stock}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addToCartBtn, { backgroundColor: colors.primary }, item.stock === 0 && styles.addToCartBtnDisabled]}
          onPress={() => handleAddToCart(item)}
          disabled={item.stock === 0}
        >
          <Ionicons name="cart" size={16} color="#fff" />
          <Text style={styles.addToCartText}>Ajouter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <ImageBackground 
        source={require('../../assets/index.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={[styles.container, {  justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size={60} color={colors.primary} />
        </View>
      </ImageBackground>
    );
  }

  return (
    <>
    <ImageBackground 
      source={require('../../assets/index.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Profile Icon Fixed Top Left */}
      <TouchableOpacity 
        style={[styles.profileIconFixed, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(tabs)/profile')}
      >
        <Ionicons name="person" size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView style={[styles.container, { backgroundColor: 'rgba(252, 228, 236, 0.9)' }]} showsVerticalScrollIndicator={false}>
        
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>Collection Parfums</Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>Découvrez nos collections exclusives</Text>
        </View>

        {/* Collections Section */}
        <View style={styles.collectionsSection}>
          <TouchableOpacity 
            style={[styles.collectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleCollectionPress('femme')}
          >
            <View style={styles.collectionImageContainer}>
              <Image 
                source={require('../../assets/femme.jpg')}
                style={styles.collectionImage}
                resizeMode="cover"
              />
            </View>
            <Text style={[styles.collectionTitle, { color: colors.text }]}>Parfums</Text>
            <Text style={[styles.collectionSubtitle, { color: colors.textSecondary }]}>Femmes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.collectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleCollectionPress('homme')}
          >
            <View style={styles.collectionImageContainer}>
              <Image 
                source={require('../../assets/homme.jpg')}
                style={styles.collectionImage}
                resizeMode="cover"
              />
            </View>
            <Text style={[styles.collectionTitle, { color: colors.text }]}>Parfums</Text>
            <Text style={[styles.collectionSubtitle, { color: colors.textSecondary }]}>Hommes</Text>
          </TouchableOpacity>
        </View>

        {/* Best Sellers Section */}
        <View style={styles.bestSellersSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>LES PLUS VENDUS</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Produits avec stock limité</Text>
          
          <FlatList
            data={bestSellers}
            renderItem={renderBestSeller}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.bestSellersRow}
            scrollEnabled={false}
            nestedScrollEnabled={false}
            style={styles.bestSellersList}
          />
        </View>

        {/* Footer Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </ImageBackground>
    <BottomNavBar />
    </>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  profileIconFixed: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  welcomeSection: {
    paddingTop: 120,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  collectionsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 40,
  },
  collectionCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  collectionImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  collectionImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  collectionSubtitle: {
    fontSize: 14,
  },
  bestSellersSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  bestSellersList: {
    marginTop: 10,
  },
  bestSellersRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  productCard: {
    width: (width - 50) / 2,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 10,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  lowStockBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  lowStockText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    alignItems: 'center',
  },
  productBrand: {
    fontSize: 12,
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  productPriceRow: {
    alignItems: 'center',
    marginBottom: 10,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  promoPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  promoBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 2,
  },
  promoText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  productStock: {
    fontSize: 12,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 5,
  },
  addToCartBtnDisabled: {
    backgroundColor: '#ccc',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});