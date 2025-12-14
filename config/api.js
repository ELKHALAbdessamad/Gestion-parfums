// Configuration API centralisée
// Pour Expo Go sur téléphone physique, utiliser l'IP du réseau local
export const API_CONFIG = {
  // Utiliser l'adresse IP du réseau local pour Expo Go
  BASE_URL: 'http://192.168.11.105:3000',
  API_URL: 'http://192.168.11.105:3000/api'
};

// Fonction utilitaire pour construire les URLs d'images
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://via.placeholder.com/150?text=Parfum';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_CONFIG.BASE_URL}${imageUrl}`;
};