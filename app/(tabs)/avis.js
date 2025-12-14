import { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AuthContext } from '../../contexts/AuthContext';
import { AvisService } from '../../services/AvisService';
import BottomNavBar from '../../components/BottomNavBar';

export default function AvisScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const params = useLocalSearchParams();
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(false);

  const parfumId = params.parfumId;
  const parfumNom = params.parfumNom;
  const parfumImage = params.parfumImage;

  useEffect(() => {
    if (parfumId) {
      loadAvis();
    }
  }, [parfumId]);

  const loadAvis = async () => {
    try {
      setLoading(true);
      const data = await AvisService.getAvisByParfum(parfumId);
      setAvis(data);
    } catch (error) {
      console.error('Erreur chargement avis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAvis = async () => {
    if (note === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner une note');
      return;
    }

    try {
      await AvisService.addAvis(user.id, parfumId, note, commentaire);
      Alert.alert('Succès', 'Votre avis a été ajouté!');
      setNote(0);
      setCommentaire('');
      loadAvis();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'avis');
    }
  };

  const renderStar = (index) => (
    <TouchableOpacity key={index} onPress={() => setNote(index + 1)}>
      <Ionicons
        name={index < note ? 'star' : 'star-outline'}
        size={32}
        color={index < note ? '#FFD700' : '#ccc'}
      />
    </TouchableOpacity>
  );

  const renderAvis = ({ item }) => (
    <View style={styles.avisCard}>
      <View style={styles.avisHeader}>
        <Text style={styles.avisAuteur}>{item.nom_utilisateur}</Text>
        <View style={styles.avisStars}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < item.note ? 'star' : 'star-outline'}
              size={14}
              color="#FFD700"
            />
          ))}
        </View>
      </View>
      <Text style={styles.avisCommentaire}>{item.commentaire}</Text>
      <Text style={styles.avisDate}>{new Date(item.date_avis).toLocaleDateString('fr-FR')}</Text>
    </View>
  );

  return (
    <>
    <ScrollView style={styles.container}>
      {/* Produit */}
      <View style={styles.productSection}>
        <Image
          source={{ uri: parfumImage }}
          style={styles.productImage}
        />
        <Text style={styles.productName}>{parfumNom}</Text>
      </View>

      {/* Formulaire d'avis */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Donnez votre avis</Text>

        <View style={styles.starsContainer}>
          {[...Array(5)].map((_, i) => renderStar(i))}
        </View>

        <TextInput
          style={styles.commentInput}
          placeholder="Votre commentaire..."
          placeholderTextColor="#ccc"
          value={commentaire}
          onChangeText={setCommentaire}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitAvis}>
          <Text style={styles.submitBtnText}>Envoyer l'avis</Text>
        </TouchableOpacity>
      </View>

      {/* Avis existants */}
      <View style={styles.avisSection}>
        <Text style={styles.sectionTitle}>Avis des clients ({avis.length})</Text>
        <FlatList
          data={avis}
          renderItem={renderAvis}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
    <BottomNavBar />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  productSection: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productImage: {
    width: 120,
    height: 150,
    borderRadius: 10,
    marginBottom: 15,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  submitBtn: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  avisSection: {
    padding: 20,
  },
  avisCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  avisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  avisAuteur: {
    fontWeight: 'bold',
    color: '#333',
  },
  avisStars: {
    flexDirection: 'row',
    gap: 2,
  },
  avisCommentaire: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  avisDate: {
    color: '#999',
    fontSize: 12,
  },
});
