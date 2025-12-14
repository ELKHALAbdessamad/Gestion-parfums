import { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { SupportService } from '../../services/SupportService';
import BottomNavBar from '../../components/BottomNavBar';

export default function SupportScreen() {
  const { user } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await SupportService.getMessages(user.id);
      setMessages(data);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Erreur', 'Veuillez écrire un message');
      return;
    }

    try {
      await SupportService.sendMessage(user.id, message);
      Alert.alert('Succès', 'Votre message a été envoyé!');
      setMessage('');
      loadMessages();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageCard, item.statut === 'repondu' && styles.messageCardReplied]}>
      <View style={styles.messageHeader}>
        <Text style={styles.messageStatus}>
          {item.statut === 'repondu' ? '✓ Répondu' : '⏳ En attente'}
        </Text>
        <Text style={styles.messageDate}>
          {new Date(item.date_message).toLocaleDateString('fr-FR')}
        </Text>
      </View>

      <Text style={styles.messageText}>{item.message}</Text>

      {item.reponse && (
        <View style={styles.replyBox}>
          <Text style={styles.replyLabel}>Réponse du support:</Text>
          <Text style={styles.replyText}>{item.reponse}</Text>
        </View>
      )}
    </View>
  );

  return (
    <>
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Support Client</Text>
        <Text style={styles.subtitle}>Nous sommes là pour vous aider 24/7</Text>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        scrollEnabled={true}
      />

      {/* Formulaire */}
      <View style={styles.formSection}>
        <TextInput
          style={styles.messageInput}
          placeholder="Écrivez votre message..."
          placeholderTextColor="#ccc"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
          <Ionicons name="send" size={20} color="#fff" />
          <Text style={styles.sendBtnText}>Envoyer</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#8B4513" />
          <Text style={styles.infoText}>
            Temps de réponse moyen: 2-4 heures
          </Text>
        </View>
      </View>
    </View>
    <BottomNavBar />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  messagesList: {
    padding: 15,
    flexGrow: 1,
  },
  messageCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  messageCardReplied: {
    borderLeftColor: '#28a745',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  messageStatus: {
    fontWeight: 'bold',
    color: '#333',
  },
  messageDate: {
    color: '#999',
    fontSize: 12,
  },
  messageText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  replyBox: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
  },
  replyLabel: {
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 5,
  },
  replyText: {
    color: '#666',
    fontSize: 13,
    lineHeight: 18,
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  sendBtn: {
    backgroundColor: '#8B4513',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0e6f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    color: '#8B4513',
    fontSize: 13,
    flex: 1,
  },
});
