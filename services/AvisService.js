import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.API_URL;

export const AvisService = {
  // Ajouter un avis
  addAvis: async (userId, parfumId, note, commentaire) => {
    try {
      const response = await fetch(`${API_URL}/avis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, parfum_id: parfumId, note, commentaire }),
      });
      if (!response.ok) throw new Error('Erreur lors de l\'ajout de l\'avis');
      return await response.json();
    } catch (error) {
      console.error('Erreur AvisService.addAvis:', error);
      throw error;
    }
  },

  // Récupérer les avis d'un parfum
  getAvisByParfum: async (parfumId) => {
    try {
      const response = await fetch(`${API_URL}/avis/parfum/${parfumId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement des avis');
      return await response.json();
    } catch (error) {
      console.error('Erreur AvisService.getAvisByParfum:', error);
      throw error;
    }
  },

  // Récupérer la note moyenne d'un parfum
  getNoteMoyenne: async (parfumId) => {
    try {
      const response = await fetch(`${API_URL}/avis/moyenne/${parfumId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement de la note');
      return await response.json();
    } catch (error) {
      console.error('Erreur AvisService.getNoteMoyenne:', error);
      throw error;
    }
  },
};

