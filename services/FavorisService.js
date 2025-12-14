import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.API_URL;

export const FavorisService = {
  // Récupérer les favoris
  getFavoris: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/favoris/${userId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement des favoris');
      return await response.json();
    } catch (error) {
      console.error('Erreur FavorisService.getFavoris:', error);
      throw error;
    }
  },

  // Ajouter aux favoris
  addFavori: async (userId, parfumId) => {
    try {
      const response = await fetch(`${API_URL}/favoris`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, parfum_id: parfumId }),
      });
      if (!response.ok) throw new Error('Erreur lors de l\'ajout aux favoris');
      return await response.json();
    } catch (error) {
      console.error('Erreur FavorisService.addFavori:', error);
      throw error;
    }
  },

  // Retirer des favoris
  removeFavori: async (userId, parfumId) => {
    try {
      const response = await fetch(`${API_URL}/favoris/${userId}/${parfumId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      return await response.json();
    } catch (error) {
      console.error('Erreur FavorisService.removeFavori:', error);
      throw error;
    }
  },

  // Vérifier si un parfum est en favori
  isFavori: async (userId, parfumId) => {
    try {
      const response = await fetch(`${API_URL}/favoris/${userId}/${parfumId}`);
      if (!response.ok) throw new Error('Erreur lors de la vérification');
      const data = await response.json();
      return data.isFavorite;
    } catch (error) {
      console.error('Erreur FavorisService.isFavori:', error);
      throw error;
    }
  },
};

