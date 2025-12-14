import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.API_URL;

export const CommandeService = {
  // Créer une commande
  createCommande: async (userId, nom, telephone, adresse, ville, codePostal, modePaiement) => {
    try {
      const response = await fetch(`${API_URL}/achat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          nom,
          telephone,
          adresse,
          ville,
          code_postal: codePostal,
          mode_paiement: modePaiement,
        }),
      });
      if (!response.ok) throw new Error('Erreur lors de la création de la commande');
      return await response.json();
    } catch (error) {
      console.error('Erreur CommandeService.createCommande:', error);
      throw error;
    }
  },

  // Récupérer l'historique des commandes
  getCommandes: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/commandes/${userId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement des commandes');
      return await response.json();
    } catch (error) {
      console.error('Erreur CommandeService.getCommandes:', error);
      throw error;
    }
  },
};

