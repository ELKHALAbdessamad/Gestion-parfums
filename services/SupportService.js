import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.API_URL;

export const SupportService = {
  // Envoyer un message
  sendMessage: async (userId, message) => {
    try {
      const response = await fetch(`${API_URL}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, message }),
      });
      if (!response.ok) throw new Error('Erreur lors de l\'envoi');
      return await response.json();
    } catch (error) {
      console.error('Erreur SupportService.sendMessage:', error);
      throw error;
    }
  },

  // Récupérer les messages
  getMessages: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/support/${userId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      return await response.json();
    } catch (error) {
      console.error('Erreur SupportService.getMessages:', error);
      throw error;
    }
  },
};

