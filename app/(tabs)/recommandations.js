import { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { RecommendationService } from '../../services/RecommendationService';
import { PanierService } from '../../services/PanierService';
import BottomNavBar from '../../components/BottomNavBar';
import { getImageUrl } from '../../config/api';

export default function RecommandationsScreen() {
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recsData, trendingData] = await Promise.all([
        RecommendationService.getRecommendations(user.id),
        RecommendationService.getTrending(),
      ]);
      setRecommendations(recsData);
      setTrending(trendingData);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (parfum) => {
    try {
      await PanierService.addToPanier(user.id, parfum.id, 1);
      alert(`${parfum.nom} ajouté au panier!`);
    } catch (error) {
      alert('Erreur lors de l\'ajout au panier');
    }
  };

  const renderParfum = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Image
        source={{ uri: getImageUrl(item.image_url) }}
        style={styles.image}
      />
      <View style={styles.cardContent}>
        <Text style={[styles.nom, { color: colors.text }]} numberOfLines={2}>{item.nom}</Text>
        <Text style={[styles.prix, { color: colors.primary }]}>{parseFloat(item.prix).toFixed(2)} DH</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => handleAddToCart(item)}
        >
          <Ionicons name="cart" size={14} color="#fff" />
          <Text style={styles.addBtnText}>Ajouter</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Recommandations</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Basées sur vos préférences</Text>
      </View>

      {/* Recommandations personnalisées */}
      {recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>💡 Pour vous</Text>
          <FlatList
            data={recommendations}
            renderItem={renderParfum}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Tendances */}
      {trending.length > 0 && (
        <View style={styles.section}>
          <View style={styles.trendingHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🔥 Tendances</Text>
            <Ionicons name="flame" size={20} color="#ff6b6b" />
          </View>
          <FlatList
            data={trending}
            renderItem={renderParfum}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Message vide */}
      {recommendations.length === 0 && trending.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="sparkles" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Aucune recommandation</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Explorez plus de parfums pour obtenir des recommandations
          </Text>
        </View>
      )}
    </ScrollView>
    <BottomNavBar />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 5,
    marginBottom: 10,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0',
  },
  cardContent: {
    padding: 10,
  },
  nom: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  prix: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  addBtn: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
