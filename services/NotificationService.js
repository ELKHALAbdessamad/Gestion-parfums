import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.API_URL;

export const NotificationService = {
  // Récupérer les notifications
  getNotifications: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${userId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement des notifications');
      return await response.json();
    } catch (error) {
      console.error('Erreur NotificationService.getNotifications:', error);
      throw error;
    }
  },

  // Marquer comme lue
  markAsRead: async (notificationId) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      return await response.json();
    } catch (error) {
      console.error('Erreur NotificationService.markAsRead:', error);
      throw error;
    }
  },

  // Supprimer une notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      return await response.json();
    } catch (error) {
      console.error('Erreur NotificationService.deleteNotification:', error);
      throw error;
    }
  },
};

