import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.API_URL;

export const SearchService = {
  // Sauvegarder une recherche
  saveSearch: async (userId, termeRecherche) => {
    try {
      const response = await fetch(`${API_URL}/historique-recherche`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, terme_recherche: termeRecherche }),
      });
      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
      return await response.json();
    } catch (error) {
      console.error('Erreur SearchService.saveSearch:', error);
      throw error;
    }
  },

  // Récupérer l'historique
  getHistorique: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/historique-recherche/${userId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      return await response.json();
    } catch (error) {
      console.error('Erreur SearchService.getHistorique:', error);
      throw error;
    }
  },

  // Récupérer les suggestions
  getSuggestions: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/suggestions/${userId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      return await response.json();
    } catch (error) {
      console.error('Erreur SearchService.getSuggestions:', error);
      throw error;
    }
  },
};

