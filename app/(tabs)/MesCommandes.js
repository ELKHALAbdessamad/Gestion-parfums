import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavBar from '../../components/BottomNavBar';

import { API_CONFIG } from '../../config/api';

const API_URL = API_CONFIG.API_URL;

export default function MesCommandes() {
  const [userId, setUserId] = useState(null);
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
        fetchCommandes(user.id);
      }
    } catch (error) {
      console.error('[MesCommandes] Erreur chargement user:', error);
    }
  };

  const fetchCommandes = async (id) => {
    if (!id) return;
    
    try {
      setLoading(true);
      console.log("[MesCommandes] Chargement pour user:", id);

      const res = await fetch(`${API_URL}/commandes/${id}`);
      
      if (!res.ok) {
        throw new Error(`Erreur ${res.status}`);
      }

      const data = await res.json();
      console.log("[MesCommandes] Commandes reçues:", data.length);
      setCommandes(data || []);
    } catch (err) {
      console.error("[MesCommandes] Erreur:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (userId) fetchCommandes(userId);
  };

  const canCancelOrder = (statut) => {
    return statut === 'confirmee';
  };

  const cancelOrder = async (commandeId, statut) => {
    if (!canCancelOrder(statut)) {
      Alert.alert(
        "❌ Annulation impossible",
        "Cette commande ne peut pas être annulée car elle est déjà en cours de livraison ou livrée.",
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "🗑️ Annuler la commande",
      "Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible.",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui, annuler",
          style: "destructive",
          onPress: async () => {
            try {
              console.log(`[MesCommandes] Annulation commande #${commandeId}`);
              
              const response = await fetch(`${API_URL}/commandes/${userId}/${commandeId}`, {
                method: 'DELETE',
              });

              const result = await response.json();

              if (result.success) {
                Alert.alert(
                  "✅ Commande annulée",
                  "Votre commande a été annulée avec succès.",
                  [{ text: "OK" }]
                );
                // Recharger la liste des commandes
                fetchCommandes(userId);
              } else {
                Alert.alert(
                  "❌ Erreur",
                  result.message || "Impossible d'annuler la commande.",
                  [{ text: "OK" }]
                );
              }
            } catch (error) {
              console.error('[MesCommandes] Erreur annulation:', error);
              Alert.alert(
                "❌ Erreur",
                "Une erreur est survenue lors de l'annulation.",
                [{ text: "OK" }]
              );
            }
          }
        }
      ]
    );
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case "confirmee":
        return "#28a745";
      case "en_cours":
        return "#ffc107";
      case "livree":
        return "#007bff";
      case "annulee":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case "confirmee":
        return "✅ Confirmée";
      case "en_cours":
        return "🚚 En cours de livraison";
      case "livree":
        return "📦 Livrée";
      case "annulee":
        return "❌ Annulée";
      default:
        return "⏳ En attente";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderCommande = ({ item }) => (
    <View style={styles.commandeCard}>
      <View style={styles.commandeHeader}>
        <Text style={styles.commandeId}>Commande #{item.id}</Text>
        <View style={[styles.statutBadge, { backgroundColor: getStatutColor(item.statut) }]}>
          <Text style={styles.statutText}>{getStatutLabel(item.statut)}</Text>
        </View>
      </View>

      <View style={styles.commandeInfo}>
        <Text style={styles.infoLabel}>📅 Date</Text>
        <Text style={styles.infoValue}>{formatDate(item.date_commande)}</Text>
      </View>

      <View style={styles.commandeInfo}>
        <Text style={styles.infoLabel}>🛍️ Articles</Text>
        <Text style={styles.infoValue}>{item.items_count} produit(s)</Text>
      </View>

      <View style={styles.commandeInfo}>
        <Text style={styles.infoLabel}>💰 Total</Text>
        <Text style={styles.infoTotal}>{Number(item.total).toFixed(2)} DH</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.livraison}>
        <Text style={styles.livraisonTitle}>📍 Livraison</Text>
        <Text style={styles.livraisonText}>{item.nom}</Text>
        <Text style={styles.livraisonText}>{item.telephone}</Text>
        <Text style={styles.livraisonText}>
          {item.adresse}, {item.ville}
          {item.code_postal ? ` ${item.code_postal}` : ""}
        </Text>
      </View>

      <View style={styles.paiement}>
        <Text style={styles.paiementText}>
          💳 {item.mode_paiement === "livraison" ? "Paiement à la livraison" : "Paiement en ligne"}
        </Text>
      </View>

      {canCancelOrder(item.statut) && (
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => cancelOrder(item.id, item.statut)}
        >
          <Text style={styles.cancelButtonText}>🗑️ Annuler la commande</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <>
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📦 Mes Commandes</Text>
        <Text style={styles.subtitle}>{commandes.length} commande(s)</Text>
      </View>

      {loading && commandes.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : commandes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Aucune commande</Text>
          <Text style={styles.emptySubtext}>Vos commandes apparaîtront ici</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={() => userId && fetchCommandes(userId)}>
            <Text style={styles.refreshButtonText}>🔄 Actualiser</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={commandes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCommande}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#007bff"]} />
          }
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
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  list: {
    padding: 15,
    paddingBottom: 100,
  },
  commandeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  commandeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  commandeId: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statutBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statutText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  commandeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  infoTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28a745",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 12,
  },
  livraison: {
    marginBottom: 10,
  },
  livraisonTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  livraisonText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  paiement: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  paiementText: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
  },
  cancelButton: {
    marginTop: 12,
    backgroundColor: "#dc3545",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
