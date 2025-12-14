import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.API_URL;

export const ParfumService = {
  // Récupérer tous les parfums
  getParfums: async () => {
    try {
      const response = await fetch(`${API_URL}/parfums`);
      if (!response.ok) throw new Error('Erreur lors du chargement des parfums');
      return await response.json();
    } catch (error) {
      console.error('Erreur ParfumService.getParfums:', error);
      throw error;
    }
  },

  // Rechercher des parfums
  searchParfums: async (query) => {
    try {
      const response = await fetch(`${API_URL}/parfums/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Erreur lors de la recherche');
      return await response.json();
    } catch (error) {
      console.error('Erreur ParfumService.searchParfums:', error);
      throw error;
    }
  },

  // Récupérer un parfum par ID
  getParfumById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/parfums/${id}`);
      if (!response.ok) throw new Error('Parfum non trouvé');
      return await response.json();
    } catch (error) {
      console.error('Erreur ParfumService.getParfumById:', error);
      throw error;
    }
  },
};

