import { useState, useCallback, useEffect } from "react";
import { View, Text, FlatList, Image, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, ScrollView } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../../components/BottomNavBar';

const { width } = Dimensions.get('window');

import { API_CONFIG, getImageUrl } from '../../config/api';

const API_URL = API_CONFIG.API_URL;

export default function ListParfumsScreen() {
  const { collection } = useLocalSearchParams();
  const [userId, setUserId] = useState(null);
  const [parfums, setParfums] = useState([]);
  const [favoris, setFavoris] = useState([]);
  const [quantites, setQuantites] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategorie, setSelectedCategorie] = useState(collection || "tous");
  const [sortOrder, setSortOrder] = useState("none");

  useEffect(() => {
    if (collection) {
      setSelectedCategorie(collection);
    }
  }, [collection]);

  useEffect(() => {
    if (userId) {
      fetchParfums();
    }
  }, [selectedCategorie]);

  useFocusEffect(
    useCallback(() => {
      loadUser();
      fetchParfums();
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
      console.error('[ListParfums] Erreur chargement user:', error);
    }
  };

  const fetchParfums = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/parfums`;
      if (selectedCategorie && selectedCategorie !== "tous") {
        url += `?categorie=${selectedCategorie}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setParfums(data || []);
    } catch (err) {
      console.error("[ListParfums] Erreur fetch:", err);
      Alert.alert("Erreur", "Impossible de charger les parfums");
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoris = async (uid) => {
    try {
      const res = await fetch(`${API_URL}/favoris/${uid}`);
      if (res.ok) {
        const data = await res.json();
        setFavoris(data.map(f => f.id));
      }
    } catch (err) {
      console.error("Erreur fetch favoris:", err);
    }
  };

  const toggleFavori = async (parfumId) => {
    if (!userId) {
      Alert.alert("Erreur", "Veuillez vous connecter");
      return;
    }

    const isFavori = favoris.includes(parfumId);

    try {
      if (isFavori) {
        const res = await fetch(`${API_URL}/favoris/${userId}/${parfumId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setFavoris(favoris.filter(id => id !== parfumId));
        }
      } else {
        const res = await fetch(`${API_URL}/favoris`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, parfum_id: parfumId }),
        });
        if (res.ok) {
          setFavoris([...favoris, parfumId]);
        }
      }
    } catch (err) {
      console.error("Erreur toggle favori:", err);
      Alert.alert("Erreur", "Impossible de modifier les favoris");
    }
  };

  const ajouterAuPanier = async (parfumId) => {
    if (!userId) {
      Alert.alert("Erreur", "Veuillez vous connecter");
      return;
    }

    try {
      const quantite = quantites[parfumId] || 1;
      const res = await fetch(`${API_URL}/panier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          parfum_id: parfumId,
          quantite,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Erreur ${res.status}`);
      }

      Alert.alert("Succès", data.message || "Parfum ajouté au panier !");
      setQuantites({ ...quantites, [parfumId]: 1 });
    } catch (err) {
      console.error("[ListParfums] Erreur ajout:", err);
      Alert.alert("Erreur", err.message || "Impossible d'ajouter au panier");
    }
  };

  // Filtrage et tri
  let parfumsFiltres = parfums.filter((parfum) => {
    const query = searchQuery.toLowerCase();
    const matchSearch = parfum.nom.toLowerCase().includes(query) || 
                       parfum.marque.toLowerCase().includes(query);
    
    const matchCategorie = selectedCategorie === "tous" || 
                          parfum.categorie === selectedCategorie;
    
    return matchSearch && matchCategorie;
  });

  // Tri par prix
  if (sortOrder === "asc") {
    parfumsFiltres.sort((a, b) => parseFloat(a.prix) - parseFloat(b.prix));
  } else if (sortOrder === "desc") {
    parfumsFiltres.sort((a, b) => parseFloat(b.prix) - parseFloat(a.prix));
  }

  return (
    <>
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✨ Collection Parfums</Text>
        <Text style={styles.headerSubtitle}>Découvrez nos fragrances exclusives</Text>
        
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un parfum..."
            placeholderTextColor="#b2bec3"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearBtn}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filtres de catégorie */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {["tous", "homme", "femme", "mixte"].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterBtn,
                selectedCategorie === cat && styles.filterBtnActive
              ]}
              onPress={() => setSelectedCategorie(cat)}
            >
              <Text style={[
                styles.filterBtnText,
                selectedCategorie === cat && styles.filterBtnTextActive
              ]}>
                {cat === "tous" ? "Tous" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tri par prix */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Trier par prix :</Text>
          <TouchableOpacity
            style={[styles.sortBtn, sortOrder === "asc" && styles.sortBtnActive]}
            onPress={() => setSortOrder(sortOrder === "asc" ? "none" : "asc")}
          >
            <Ionicons name="arrow-up" size={16} color={sortOrder === "asc" ? "#fff" : "#6c5ce7"} />
            <Text style={[styles.sortBtnText, sortOrder === "asc" && styles.sortBtnTextActive]}>
              Plus bas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sortOrder === "desc" && styles.sortBtnActive]}
            onPress={() => setSortOrder(sortOrder === "desc" ? "none" : "desc")}
          >
            <Ionicons name="arrow-down" size={16} color={sortOrder === "desc" ? "#fff" : "#6c5ce7"} />
            <Text style={[styles.sortBtnText, sortOrder === "desc" && styles.sortBtnTextActive]}>
              Plus élevé
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : parfumsFiltres.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🌸</Text>
          <Text style={styles.emptyTitle}>
            {searchQuery ? "Aucun résultat trouvé" : "Aucun parfum disponible"}
          </Text>
          {searchQuery && (
            <Text style={styles.emptySubtitle}>Essayez une autre recherche</Text>
          )}
        </View>
      ) : (
        <FlatList
          data={parfumsFiltres}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const imageUrl = getImageUrl(item.image_url);

            const isFavori = favoris.includes(item.id);

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

                  {/* Bouton favori */}
                  <TouchableOpacity 
                    style={styles.favorisBtn}
                    onPress={() => toggleFavori(item.id)}
                  >
                    <Ionicons 
                      name={isFavori ? "heart" : "heart-outline"} 
                      size={24} 
                      color={isFavori ? "#e74c3c" : "#fff"} 
                    />
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

                  <View style={styles.actions}>
                    <View style={styles.quantiteContainer}>
                      <TouchableOpacity 
                        style={styles.quantiteBtn}
                        onPress={() => {
                          const current = quantites[item.id] || 1;
                          if (current > 1) {
                            setQuantites({ ...quantites, [item.id]: current - 1 });
                          }
                        }}
                      >
                        <Text style={styles.quantiteBtnText}>−</Text>
                      </TouchableOpacity>
                      
                      <Text style={styles.quantiteValue}>{quantites[item.id] || 1}</Text>
                      
                      <TouchableOpacity 
                        style={styles.quantiteBtn}
                        onPress={() => {
                          const current = quantites[item.id] || 1;
                          setQuantites({ ...quantites, [item.id]: current + 1 });
                        }}
                      >
                        <Text style={styles.quantiteBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                      style={styles.boutonAjouter} 
                      onPress={() => ajouterAuPanier(item.id)}
                    >
                      <Text style={styles.boutonText}>🛒</Text>
                    </TouchableOpacity>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2d3436",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#636e72",
    fontStyle: "italic",
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 10,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#2d3436",
  },
  clearBtn: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#dfe6e9",
    borderRadius: 12,
  },
  clearText: {
    fontSize: 14,
    color: "#636e72",
    fontWeight: "bold",
  },
  filtersContainer: {
    marginTop: 15,
    marginBottom: 10,
  },
  filterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#dfe6e9",
  },
  filterBtnActive: {
    backgroundColor: "#6c5ce7",
    borderColor: "#6c5ce7",
  },
  filterBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#636e72",
  },
  filterBtnTextActive: {
    color: "#fff",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  sortLabel: {
    fontSize: 13,
    color: "#636e72",
    fontWeight: "600",
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#6c5ce7",
    gap: 5,
  },
  sortBtnActive: {
    backgroundColor: "#6c5ce7",
    borderColor: "#6c5ce7",
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6c5ce7",
  },
  sortBtnTextActive: {
    color: "#fff",
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
  favorisBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 36,
    height: 36,
    borderRadius: 18,
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
    marginBottom: 15,
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
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantiteContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 5,
  },
  quantiteBtn: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  quantiteBtnText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6c5ce7",
  },
  quantiteValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d3436",
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
  },
  boutonAjouter: {
    backgroundColor: "#6c5ce7",
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6c5ce7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  boutonText: {
    fontSize: 20,
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
  emptyText: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    color: "#636e72",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#b2bec3",
    textAlign: "center",
    marginTop: 8,
  },
});
