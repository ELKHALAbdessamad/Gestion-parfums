import { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { NotificationService } from '../../services/NotificationService';
import BottomNavBar from '../../components/BottomNavBar';

export default function NotificationsScreen() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      loadNotifications();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de marquer comme lue');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      loadNotifications();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'commande':
        return 'cart';
      case 'promotion':
        return 'pricetag';
      case 'livraison':
        return 'truck';
      default:
        return 'notifications';
    }
  };

  const renderNotification = ({ item }) => (
    <View style={[styles.notifCard, !item.lue && styles.notifCardUnread]}>
      <View style={styles.notifIcon}>
        <Ionicons name={getIcon(item.type)} size={24} color="#8B4513" />
      </View>

      <View style={styles.notifContent}>
        <Text style={styles.notifTitle}>{item.titre}</Text>
        <Text style={styles.notifMessage}>{item.message}</Text>
        <Text style={styles.notifDate}>
          {new Date(item.date_notification).toLocaleDateString('fr-FR')}
        </Text>
      </View>

      <View style={styles.notifActions}>
        {!item.lue && (
          <TouchableOpacity onPress={() => handleMarkAsRead(item.id)}>
            <Ionicons name="checkmark-circle" size={24} color="#28a745" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash" size={24} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.settingsRow}>
          <Text style={styles.settingsLabel}>Activer les notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#ccc', true: '#8B4513' }}
          />
        </View>
      </View>

      {/* Notifications */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off" size={64} color="#ddd" />
          <Text style={styles.emptyText}>Aucune notification</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
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
    marginBottom: 15,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsLabel: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    padding: 15,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  notifCardUnread: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#8B4513',
  },
  notifIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0e6f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  notifMessage: {
    color: '#666',
    fontSize: 13,
    marginBottom: 6,
  },
  notifDate: {
    color: '#999',
    fontSize: 11,
  },
  notifActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
});
