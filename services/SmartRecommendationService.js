import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.API_URL;

export const SmartRecommendationService = {
  // Obtenir les recommandations basées sur l'historique d'achat
  getRecommendationsByPurchaseHistory: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/recommendations/purchase-history/${userId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      return await response.json();
    } catch (error) {
      console.error('Erreur SmartRecommendationService.getRecommendationsByPurchaseHistory:', error);
      throw error;
    }
  },

  // Obtenir les recommandations basées sur les favoris
  getRecommendationsByFavorites: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/recommendations/favorites/${userId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      return await response.json();
    } catch (error) {
      console.error('Erreur SmartRecommendationService.getRecommendationsByFavorites:', error);
      throw error;
    }
  },

  // Obtenir les parfums similaires
  getSimilarParfums: async (parfumId) => {
    try {
      const response = await fetch(`${API_URL}/parfums/similaires/${parfumId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      return await response.json();
    } catch (error) {
      console.error('Erreur SmartRecommendationService.getSimilarParfums:', error);
      throw error;
    }
  },

  // Obtenir les parfums tendance
  getTrendingParfums: async () => {
    try {
      const response = await fetch(`${API_URL}/parfums/trending`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      return await response.json();
    } catch (error) {
      console.error('Erreur SmartRecommendationService.getTrendingParfums:', error);
      throw error;
    }
  },

  // Obtenir les parfums en promotion
  getPromotionalParfums: async () => {
    try {
      const response = await fetch(`${API_URL}/parfums`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const allParfums = await response.json();
      // Filtrer seulement ceux qui ont des promotions actives et vérifier les données
      return allParfums.filter(p => {
        const hasPromo = p.has_active_promotion === 1 || p.has_active_promotion === true;
        const hasValidPrice = p.prix && !isNaN(parseFloat(p.prix));
        const hasValidDiscount = p.discount_percentage && !isNaN(parseFloat(p.discount_percentage)) && parseFloat(p.discount_percentage) > 0;
        const hasValidFinalPrice = p.prix_final && !isNaN(parseFloat(p.prix_final));
        return hasPromo && hasValidPrice && hasValidDiscount && hasValidFinalPrice;
      });
    } catch (error) {
      console.error('Erreur SmartRecommendationService.getPromotionalParfums:', error);
      throw error;
    }
  },

  // Obtenir les nouveaux parfums
  getNewParfums: async () => {
    try {
      const response = await fetch(`${API_URL}/parfums/new`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      return await response.json();
    } catch (error) {
      console.error('Erreur SmartRecommendationService.getNewParfums:', error);
      throw error;
    }
  },

  // Obtenir les recommandations combinées
  getCombinedRecommendations: async (userId) => {
    try {
      const [byHistory, byFavorites, trending, promotions, newParfums] = await Promise.all([
        SmartRecommendationService.getRecommendationsByPurchaseHistory(userId).catch(() => []),
        SmartRecommendationService.getRecommendationsByFavorites(userId).catch(() => []),
        SmartRecommendationService.getTrendingParfums().catch(() => []),
        SmartRecommendationService.getPromotionalParfums().catch(() => []),
        SmartRecommendationService.getNewParfums().catch(() => []),
      ]);

      // Si certaines sections sont vides, utiliser les parfums tendance comme fallback
      const fallbackData = trending.length > 0 ? trending : [];
      
      return {
        byHistory: byHistory.length > 0 ? byHistory : fallbackData.slice(0, 6),
        byFavorites: byFavorites.length > 0 ? byFavorites : fallbackData.slice(6, 12),
        trending: trending.length > 0 ? trending : fallbackData,
        promotions: promotions.length > 0 ? promotions : [],
        newParfums: newParfums.length > 0 ? newParfums : fallbackData.slice(12, 18),
      };
    } catch (error) {
      console.error('Erreur SmartRecommendationService.getCombinedRecommendations:', error);
      throw error;
    }
  },
};

