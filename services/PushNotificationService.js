import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.API_URL;

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const PushNotificationService = {
  // Initialiser les notifications
  initializePushNotifications: async () => {
    try {
      if (!Device.isDevice) {
        console.log('Les notifications push ne fonctionnent que sur les appareils physiques');
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission de notification refusée');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      return token.data;
    } catch (error) {
      console.error('Erreur initialisation notifications:', error);
      return null;
    }
  },

  // Enregistrer le token push
  registerPushToken: async (userId, token) => {
    try {
      const response = await fetch(`${API_URL}/push-tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, token }),
      });
      if (!response.ok) throw new Error('Erreur lors de l\'enregistrement');
      return await response.json();
    } catch (error) {
      console.error('Erreur PushNotificationService.registerPushToken:', error);
      throw error;
    }
  },

  // Envoyer une notification locale
  sendLocalNotification: async (title, body, data = {}) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
          badge: 1,
        },
        trigger: { seconds: 2 },
      });
    } catch (error) {
      console.error('Erreur envoi notification locale:', error);
    }
  },

  // Activer/désactiver les notifications
  updateNotificationPreferences: async (userId, enabled) => {
    try {
      const response = await fetch(`${API_URL}/preferences/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications_actives: enabled }),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      return await response.json();
    } catch (error) {
      console.error('Erreur PushNotificationService.updateNotificationPreferences:', error);
      throw error;
    }
  },

  // Écouter les notifications reçues
  addNotificationListener: (callback) => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      callback(response.notification);
    });
    return subscription;
  },
};

