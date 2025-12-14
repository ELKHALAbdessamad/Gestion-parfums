-- ===================== TABLES PRINCIPALES =====================

-- Utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  telephone VARCHAR(20),
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parfums
CREATE TABLE IF NOT EXISTS parfums (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(255) NOT NULL,
  marque VARCHAR(255),
  categorie ENUM('homme', 'femme', 'mixte') DEFAULT 'mixte',
  prix DECIMAL(10, 2),
  description TEXT,
  image_url VARCHAR(255),
  stock INT DEFAULT 0,
  date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Panier
CREATE TABLE IF NOT EXISTS panier (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  parfum_id INT NOT NULL,
  quantite INT DEFAULT 1,
  date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parfum_id) REFERENCES parfums(id)
);

-- Commandes
CREATE TABLE IF NOT EXISTS commandes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  total DECIMAL(10, 2),
  items_count INT,
  nom VARCHAR(255),
  telephone VARCHAR(20),
  adresse TEXT,
  ville VARCHAR(255),
  code_postal VARCHAR(10),
  mode_paiement VARCHAR(50),
  statut VARCHAR(50) DEFAULT 'confirmee',
  date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Favoris
CREATE TABLE IF NOT EXISTS favoris (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  parfum_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favoris (user_id, parfum_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parfum_id) REFERENCES parfums(id)
);

-- ===================== TABLES ADDITIONNELLES =====================

-- Avis et Notations
CREATE TABLE IF NOT EXISTS avis (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  parfum_id INT NOT NULL,
  note INT CHECK (note >= 1 AND note <= 5),
  commentaire TEXT,
  date_avis TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parfum_id) REFERENCES parfums(id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type VARCHAR(50),
  titre VARCHAR(255),
  message TEXT,
  lue BOOLEAN DEFAULT FALSE,
  date_notification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Messages de support
CREATE TABLE IF NOT EXISTS messages_support (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  message TEXT,
  reponse TEXT,
  statut VARCHAR(50) DEFAULT 'en_attente',
  date_message TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Préférences utilisateur
CREATE TABLE IF NOT EXISTS preferences_utilisateur (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  mode_sombre BOOLEAN DEFAULT FALSE,
  notifications_actives BOOLEAN DEFAULT TRUE,
  langue VARCHAR(10) DEFAULT 'fr',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Promotions
CREATE TABLE IF NOT EXISTS promotions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parfum_id INT NOT NULL,
  discount_percentage INT NOT NULL CHECK (discount_percentage >= 1 AND discount_percentage <= 90),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parfum_id) REFERENCES parfums(id) ON DELETE CASCADE
);

-- Détails des commandes (items commandés)
CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  commande_id INT NOT NULL,
  parfum_id INT NOT NULL,
  parfum_nom VARCHAR(255) NOT NULL,
  parfum_marque VARCHAR(255) NOT NULL,
  parfum_image_url VARCHAR(255),
  prix_unitaire DECIMAL(10, 2) NOT NULL,
  quantite INT NOT NULL DEFAULT 1,
  total_item DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
  FOREIGN KEY (parfum_id) REFERENCES parfums(id)
);
