import { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Share, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { FavorisService } from '../../services/FavorisService';
import BottomNavBar from '../../components/BottomNavBar';
import { getImageUrl } from '../../config/api';

export default function WishlistScreen() {
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const [favoris, setFavoris] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shareCode, setShareCode] = useState(null);

  useEffect(() => {
    loadFavoris();
  }, []);

  const loadFavoris = async () => {
    try {
      setLoading(true);
      const data = await FavorisService.getFavoris(user.id);
      setFavoris(data);
      // Générer un code de partage
      const code = `WISH-${user.id}-${Date.now().toString(36).toUpperCase()}`;
      setShareCode(code);
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const message = `Découvrez ma wishlist de parfums! 🌹\n\nCode: ${shareCode}\n\nParfums: ${favoris.map(f => f.nom).join(', ')}\n\nTélécharge l'app ParfumsApp pour voir ma sélection!`;
      
      await Share.share({
        message,
        title: 'Ma Wishlist de Parfums',
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager');
    }
  };

  const handleCopyCode = () => {
    // Copier le code dans le presse-papiers
    Alert.alert('Code copié!', `${shareCode} a été copié`);
  };

  const renderParfum = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Image
        source={{ uri: getImageUrl(item.image_url) }}
        style={styles.image}
      />
      <View style={styles.cardContent}>
        <Text style={[styles.nom, { color: colors.text }]} numberOfLines={2}>{item.nom}</Text>
        <Text style={[styles.marque, { color: colors.textSecondary }]}>{item.marque}</Text>
        <Text style={[styles.prix, { color: colors.primary }]}>{parseFloat(item.prix).toFixed(2)} DH</Text>
      </View>
    </View>
  );

  return (
    <>
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>❤️ Ma Wishlist</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{favoris.length} parfum(s)</Text>
      </View>

      {/* Partage */}
      <View style={[styles.shareSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.shareContent}>
          <Ionicons name="share-social" size={24} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.shareTitle, { color: colors.text }]}>Partager ma wishlist</Text>
            <Text style={[styles.shareCode, { color: colors.textSecondary }]}>Code: {shareCode}</Text>
          </View>
        </View>
        <View style={styles.shareButtons}>
          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: colors.primary }]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: colors.primary }]}
            onPress={handleCopyCode}
          >
            <Ionicons name="copy" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{favoris.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Parfums</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {favoris.reduce((sum, f) => sum + parseFloat(f.prix), 0).toFixed(0)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>DH Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {(favoris.reduce((sum, f) => sum + parseFloat(f.prix), 0) / favoris.length).toFixed(0)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Moy.</Text>
        </View>
      </View>

      {/* Liste */}
      {favoris.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Aucun favori</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={favoris}
            renderItem={renderParfum}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            scrollEnabled={false}
          />
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
  shareSection: {
    margin: 15,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shareContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  shareCode: {
    fontSize: 12,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
  },
  listContainer: {
    paddingHorizontal: 10,
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
    borderWidth: 1,
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
    marginBottom: 4,
  },
  marque: {
    fontSize: 11,
    marginBottom: 6,
  },
  prix: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
  },
});
