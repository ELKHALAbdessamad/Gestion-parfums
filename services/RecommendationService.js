import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.API_URL;

export const RecommendationService = {
  // Récupérer les recommandations
  getRecommendations: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/recommandations/${userId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      return await response.json();
    } catch (error) {
      console.error('Erreur RecommendationService.getRecommendations:', error);
      throw error;
    }
  },

  // Récupérer les parfums similaires
  getSimilarParfums: async (parfumId) => {
    try {
      const response = await fetch(`${API_URL}/parfums/similaires/${parfumId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      return await response.json();
    } catch (error) {
      console.error('Erreur RecommendationService.getSimilarParfums:', error);
      throw error;
    }
  },

  // Récupérer les tendances
  getTrending: async () => {
    try {
      const response = await fetch(`${API_URL}/parfums/tendances`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      return await response.json();
    } catch (error) {
      console.error('Erreur RecommendationService.getTrending:', error);
      throw error;
    }
  },
};

