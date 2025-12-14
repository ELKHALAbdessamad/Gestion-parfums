import { useState, useCallback } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, Dimensions } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../../components/BottomNavBar';

const { width } = Dimensions.get('window');

import { API_CONFIG, getImageUrl } from '../../config/api';

const API_URL = API_CONFIG.API_URL;

export default function FavorisScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [favoris, setFavoris] = useState([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.id);
        fetchFavoris(user.id);
      }
    } catch (error) {
      console.error('Erreur chargement user:', error);
    }
  };

  const fetchFavoris = async (uid) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/favoris/${uid}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setFavoris(data);
    } catch (err) {
      console.error("Erreur fetch favoris:", err);
      Alert.alert("Erreur", "Impossible de charger les favoris");
    } finally {
      setLoading(false);
    }
  };

  const retirerDesFavoris = async (parfumId) => {
    Alert.alert(
      "Retirer des favoris",
      "Voulez-vous vraiment retirer ce parfum de vos favoris ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Retirer",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/favoris/${userId}/${parfumId}`, {
                method: "DELETE",
              });
              
              if (res.ok) {
                setFavoris(favoris.filter(f => f.id !== parfumId));
                Alert.alert("Succès", "Parfum retiré des favoris");
              }
            } catch (err) {
              console.error("Erreur suppression favori:", err);
              Alert.alert("Erreur", "Impossible de retirer des favoris");
            }
          },
        },
      ]
    );
  };

  return (
    <>
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2d3436" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>❤️ Mes Favoris</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : favoris.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#dfe6e9" />
          <Text style={styles.emptyTitle}>Aucun favori</Text>
          <Text style={styles.emptySubtitle}>
            Ajoutez des parfums à vos favoris pour les retrouver facilement
          </Text>
          <TouchableOpacity 
            style={styles.browseBtn}
            onPress={() => router.push('/(tabs)/list-parfums')}
          >
            <Text style={styles.browseBtnText}>Découvrir les parfums</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favoris}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const imageUrl = getImageUrl(item.image_url);

            return (
              <View style={styles.card}>
                <View style={styles.imageContainer}>
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.image} />
                  ) : (
                    <View style={[styles.image, styles.placeholderImage]}>
                      <Text style={styles.placeholderText}>🌺</Text>
                    </View>
                  )}

                  {/* Badge catégorie */}
                  <View style={styles.categorieBadge}>
                    <Text style={styles.categorieText}>
                      {item.categorie === 'homme' ? '👨' : item.categorie === 'femme' ? '👩' : '👥'}
                    </Text>
                  </View>

                  {/* Bouton retirer */}
                  <TouchableOpacity 
                    style={styles.removeBtn}
                    onPress={() => retirerDesFavoris(item.id)}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>

                  <View style={styles.stockBadge}>
                    <Text style={styles.stockText}>{item.stock} en stock</Text>
                  </View>
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.marque}>{item.marque}</Text>
                  <Text style={styles.nom} numberOfLines={2}>{item.nom}</Text>
                  
                  <View style={styles.prixContainer}>
                    <Text style={styles.prix}>{item.prix}</Text>
                    <Text style={styles.devise}>DH</Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
    <BottomNavBar />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d3436",
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    padding: 15,
    paddingBottom: 100,
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    width: (width - 45) / 2,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 180,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    backgroundColor: "#a29bfe",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 40,
  },
  categorieBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  categorieText: {
    fontSize: 16,
  },
  removeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#e74c3c",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  stockBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  stockText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#00b894",
  },
  cardContent: {
    padding: 15,
  },
  marque: {
    fontSize: 11,
    color: "#b2bec3",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 5,
  },
  nom: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2d3436",
    marginBottom: 10,
    lineHeight: 20,
  },
  prixContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  prix: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6c5ce7",
  },
  devise: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6c5ce7",
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#636e72",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2d3436",
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#636e72",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  browseBtn: {
    backgroundColor: "#6c5ce7",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: "#6c5ce7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  browseBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
