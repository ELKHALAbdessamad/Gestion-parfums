import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState, useContext } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../../contexts/ThemeContext';
import BottomNavBar from '../../components/BottomNavBar';

import { API_CONFIG, getImageUrl } from '../../config/api';

const API_URL = API_CONFIG.API_URL;
const IMAGE_BASE_URL = API_CONFIG.BASE_URL;

export default function PanierScreen() {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);
  const [userId, setUserId] = useState(null);
  const [panier, setPanier] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      console.log('[Panier] Screen focused');
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.id);
        fetchPanier(user.id);
      }
    } catch (error) {
      console.error('[Panier] Erreur chargement user:', error);
    }
  };

  const fetchPanier = async (id) => {
    if (!id) return;
    
    try {
      setLoading(true);
      console.log('[Panier] Chargement pour user:', id);
      
      const res = await fetch(`${API_URL}/panier/${id}`);
      console.log('[Panier] Status:', res.status);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || `Erreur ${res.status}`);
      }

      console.log('[Panier] Items reçus:', data.length);
      setPanier(data || []);
    } catch (err) {
      console.error('[Panier] Erreur:', err.message);
      
      Alert.alert(
        "Erreur de chargement", 
        `Impossible de charger le panier.\n\nDétails: ${err.message}`,
        [
          { text: "Réessayer", onPress: () => fetchPanier(id) },
          { text: "Annuler", style: "cancel" }
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (userId) fetchPanier(userId);
  };

  const supprimerDuPanier = async (id, nom) => {
    Alert.alert(
      "Confirmation",
      `Voulez-vous retirer "${nom}" du panier ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/panier/${id}`, {
                method: "DELETE",
              });

              if (!res.ok) {
                throw new Error(`Erreur ${res.status}`);
              }

              Alert.alert("Supprimé", "Produit retiré du panier.");
              if (userId) fetchPanier(userId);
            } catch (err) {
              console.error('[Panier] Erreur suppression:', err);
              Alert.alert("Erreur", "Impossible de supprimer.");
            }
          }
        }
      ]
    );
  };

  const allerVersConfirmation = () => {
    if (panier.length === 0) {
      Alert.alert("Panier vide", "Ajoutez des produits avant de commander.");
      return;
    }

    router.push({
      pathname: "/ConfirmationCommande",
      params: {
        total: total.toFixed(2),
        itemsCount: panier.length,
        userId: userId.toString()
      }
    });
  };

  const total = panier.reduce((sum, item) => {
    const prix = item.prix_unitaire || item.prix_original || item.prix || 0;
    return sum + item.quantite * Number(prix);
  }, 0);

  const renderItem = ({ item }) => {
    const imageUrl = item.image_url 
      ? (item.image_url.startsWith('http') 
          ? item.image_url
          : `${IMAGE_BASE_URL}${item.image_url}`)
      : null;

    return (
      <View style={styles.item}>
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.image}
            onError={(e) => console.log('[Panier] Erreur image:', imageUrl)}
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}
        
        <View style={styles.details}>
          <Text style={styles.nom}>{item.nom}</Text>
          <Text style={styles.marque}>{item.marque}</Text>
          <Text style={styles.quantite}>Quantité: {item.quantite}</Text>
          <Text style={styles.prix}>
            {(() => {
              const prix = item.prix_unitaire || item.prix_original || item.prix || 0;
              const total = Number(prix) * item.quantite;
              return isNaN(total) ? '0.00' : total.toFixed(2);
            })()} DH
          </Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => supprimerDuPanier(item.panier_id, item.nom)}
        >
          <Text style={styles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Mon Panier</Text>

      {loading && panier.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={{ marginTop: 10 }}>Chargement...</Text>
        </View>
      ) : panier.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>🛍️</Text>
          <Text style={styles.emptySubtext}>Votre panier est vide</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={() => userId && fetchPanier(userId)}>
            <Text style={styles.refreshButtonText}>🔄 Actualiser</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={panier}
            keyExtractor={(item) => item.panier_id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#007bff']}
              />
            }
          />

          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>{total.toFixed(2)} DH</Text>
            </View>

            <TouchableOpacity
              style={styles.commanderButton}
              onPress={allerVersConfirmation}
            >
              <Text style={styles.commanderText}>✅ Commander</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
    <BottomNavBar />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  list: {
    padding: 10,
    paddingBottom: 100,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: 70,
    height: 90,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  nom: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  marque: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  quantite: {
    fontSize: 13,
    color: '#888',
    marginBottom: 3,
  },
  prix: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  deleteButton: {
    padding: 10,
  },
  deleteText: {
    fontSize: 24,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
  },
  commanderButton: {
  backgroundColor: '#28a745',
  padding: 16,
  borderRadius: 10,
  alignItems: 'center',
  position: 'absolute',  // fixe le bouton
  left: 20,              // distance depuis le côté gauche
  right: 20,             // distance depuis le côté droit
  bottom: 150,            // distance depuis le bas (modifiable)
  zIndex: 10,            // pour être sûr qu'il soit au-dessus des autres éléments
},
  commanderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
