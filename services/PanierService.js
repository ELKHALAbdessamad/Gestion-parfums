import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.API_URL;

export const PanierService = {
  // Récupérer le panier
  getPanier: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/panier/${userId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement du panier');
      return await response.json();
    } catch (error) {
      console.error('Erreur PanierService.getPanier:', error);
      throw error;
    }
  },

  // Ajouter au panier
  addToPanier: async (userId, parfumId, quantite, prixUnitaire = null) => {
    try {
      const body = { user_id: userId, parfum_id: parfumId, quantite };
      if (prixUnitaire) {
        body.prix_unitaire = prixUnitaire;
      }
      
      const response = await fetch(`${API_URL}/panier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Erreur lors de l\'ajout au panier');
      return await response.json();
    } catch (error) {
      console.error('Erreur PanierService.addToPanier:', error);
      throw error;
    }
  },

  // Modifier la quantité
  updateQuantite: async (panierId, quantite) => {
    try {
      const response = await fetch(`${API_URL}/panier/${panierId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantite }),
      });
      if (!response.ok) throw new Error('Erreur lors de la modification');
      return await response.json();
    } catch (error) {
      console.error('Erreur PanierService.updateQuantite:', error);
      throw error;
    }
  },

  // Retirer du panier
  removePanier: async (panierId) => {
    try {
      const response = await fetch(`${API_URL}/panier/${panierId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      return await response.json();
    } catch (error) {
      console.error('Erreur PanierService.removePanier:', error);
      throw error;
    }
  },
};

