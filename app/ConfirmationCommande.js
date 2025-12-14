import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.API_URL;

export default function ConfirmationCommande() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const total = params.total;
  const itemsCount = params.itemsCount;
  const userId = params.userId;

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ville, setVille] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [modePaiement, setModePaiement] = useState("livraison");
  const [loading, setLoading] = useState(false);

  const validerCommande = async () => {
    if (!nom || !telephone || !adresse || !ville) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (telephone.length < 10) {
      Alert.alert("Erreur", "Numéro de téléphone invalide");
      return;
    }

    try {
      setLoading(true);
      console.log("[ConfirmationCommande] Validation...");

      const res = await fetch(`${API_URL}/achat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(userId),
          nom,
          telephone,
          adresse,
          ville,
          code_postal: codePostal,
          mode_paiement: modePaiement,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Erreur ${res.status}`);
      }

      console.log("[ConfirmationCommande] Commande validée:", data);

      Alert.alert(
        "Commande validée ! 🎉",
        `Merci ${nom} !\n\nTotal: ${total} DH\nArticles: ${itemsCount}\nMode de paiement: ${modePaiement === "livraison" ? "À la livraison" : "En ligne"}\n\nVotre commande sera livrée à:\n${adresse}, ${ville}`,
        [
          {
            text: "Voir mes commandes",
            onPress: () => router.push("/MesCommandes"),
          },
          {
            text: "Retour",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err) {
      console.error("[ConfirmationCommande] Erreur:", err);
      Alert.alert("Erreur", err.message || "Impossible de valider la commande");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📦 Confirmation de commande</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>Articles: {itemsCount}</Text>
          <Text style={styles.summaryTotal}>Total: {total} DH</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Informations de livraison</Text>

        <Text style={styles.label}>Nom complet *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Ahmed Benali"
          value={nom}
          onChangeText={setNom}
        />

        <Text style={styles.label}>Téléphone *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 0612345678"
          value={telephone}
          onChangeText={setTelephone}
          keyboardType="phone-pad"
          maxLength={10}
        />

        <Text style={styles.label}>Adresse complète *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ex: 123 Rue Mohammed V, Apt 4"
          value={adresse}
          onChangeText={setAdresse}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Ville *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Casablanca"
          value={ville}
          onChangeText={setVille}
        />

        <Text style={styles.label}>Code postal (optionnel)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 20000"
          value={codePostal}
          onChangeText={setCodePostal}
          keyboardType="numeric"
          maxLength={5}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Mode de paiement</Text>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            modePaiement === "livraison" && styles.paymentOptionSelected,
          ]}
          onPress={() => setModePaiement("livraison")}
        >
          <View style={styles.radio}>
            {modePaiement === "livraison" && <View style={styles.radioSelected} />}
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>💵 Paiement à la livraison</Text>
            <Text style={styles.paymentDesc}>Payez en espèces lors de la réception</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            modePaiement === "enligne" && styles.paymentOptionSelected,
          ]}
          onPress={() => setModePaiement("enligne")}
        >
          <View style={styles.radio}>
            {modePaiement === "enligne" && <View style={styles.radioSelected} />}
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>💳 Paiement en ligne</Text>
            <Text style={styles.paymentDesc}>Carte bancaire / CMI (à venir)</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonTextSecondary}>← Retour au panier</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
          onPress={validerCommande}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonTextPrimary}>✅ Confirmer ({total} DH)</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    marginBottom: 15,
  },
  summaryCard: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryText: {
    fontSize: 16,
    color: "#666",
  },
  summaryTotal: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#28a745",
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  paymentOptionSelected: {
    borderColor: "#28a745",
    backgroundColor: "#f0f9f4",
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#28a745",
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  paymentDesc: {
    fontSize: 13,
    color: "#666",
  },
  footer: {
    padding: 20,
    gap: 10,
    marginBottom: 120,
  },
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: "#28a745",
  },
  buttonSecondary: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#28a745",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonTextPrimary: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonTextSecondary: {
    color: "#28a745",
    fontSize: 16,
    fontWeight: "bold",
  },
});
