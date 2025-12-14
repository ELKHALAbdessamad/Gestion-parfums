import { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Slider } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemeContext } from '../../contexts/ThemeContext';
import BottomNavBar from '../../components/BottomNavBar';

export default function FiltresScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useContext(ThemeContext);
  
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMarques, setSelectedMarques] = useState([]);
  const [inStock, setInStock] = useState(false);
  const [sortBy, setSortBy] = useState('populaire');

  const categories = ['Homme', 'Femme', 'Unisexe'];
  const marques = ['Dior', 'Gucci', 'Chanel', 'Yves Saint Laurent', 'Prada', 'Versace'];
  const sortOptions = [
    { id: 'populaire', label: '⭐ Populaire' },
    { id: 'prix-asc', label: '💰 Prix croissant' },
    { id: 'prix-desc', label: '💸 Prix décroissant' },
    { id: 'nouveau', label: '🆕 Nouveau' },
    { id: 'note', label: '⭐ Mieux noté' },
  ];

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleMarque = (marque) => {
    setSelectedMarques(prev =>
      prev.includes(marque)
        ? prev.filter(m => m !== marque)
        : [...prev, marque]
    );
  };

  const handleApplyFilters = () => {
    router.push({
      pathname: '/(tabs)/accueil',
      params: {
        priceMin: priceRange[0],
        priceMax: priceRange[1],
        categories: selectedCategories.join(','),
        marques: selectedMarques.join(','),
        inStock,
        sortBy,
      },
    });
  };

  const handleReset = () => {
    setPriceRange([0, 500]);
    setSelectedCategories([]);
    setSelectedMarques([]);
    setInStock(false);
    setSortBy('populaire');
  };

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    header: { backgroundColor: colors.surface, borderBottomColor: colors.border },
    section: { backgroundColor: colors.surface },
    text: { color: colors.text },
    textSecondary: { color: colors.textSecondary },
    button: { backgroundColor: colors.primary },
    filterItem: { borderColor: colors.border },
  };

  return (
    <>
    <ScrollView style={[styles.container, dynamicStyles.container]}>
      {/* Header */}
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, dynamicStyles.text]}>Filtres avancés</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Réinitialiser</Text>
        </TouchableOpacity>
      </View>

      {/* Prix */}
      <View style={[styles.section, dynamicStyles.section]}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>💰 Prix</Text>
        <View style={styles.priceDisplay}>
          <Text style={[styles.priceText, dynamicStyles.text]}>
            {priceRange[0].toFixed(0)} DH - {priceRange[1].toFixed(0)} DH
          </Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={500}
          step={10}
          value={priceRange[0]}
          onValueChange={(value) => setPriceRange([value, priceRange[1]])}
          minimumTrackTintColor={colors.primary}
        />
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={500}
          step={10}
          value={priceRange[1]}
          onValueChange={(value) => setPriceRange([priceRange[0], value])}
          minimumTrackTintColor={colors.primary}
        />
      </View>

      {/* Catégories */}
      <View style={[styles.section, dynamicStyles.section]}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>👥 Catégories</Text>
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterItem,
              dynamicStyles.filterItem,
              selectedCategories.includes(category) && styles.filterItemSelected,
            ]}
            onPress={() => toggleCategory(category)}
          >
            <Ionicons
              name={selectedCategories.includes(category) ? 'checkbox' : 'checkbox-outline'}
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.filterItemText, dynamicStyles.text]}>{category}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Marques */}
      <View style={[styles.section, dynamicStyles.section]}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>🏷️ Marques</Text>
        {marques.map(marque => (
          <TouchableOpacity
            key={marque}
            style={[
              styles.filterItem,
              dynamicStyles.filterItem,
              selectedMarques.includes(marque) && styles.filterItemSelected,
            ]}
            onPress={() => toggleMarque(marque)}
          >
            <Ionicons
              name={selectedMarques.includes(marque) ? 'checkbox' : 'checkbox-outline'}
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.filterItemText, dynamicStyles.text]}>{marque}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stock */}
      <View style={[styles.section, dynamicStyles.section]}>
        <View style={styles.stockRow}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>📦 En stock</Text>
          <Switch
            value={inStock}
            onValueChange={setInStock}
            trackColor={{ false: '#ccc', true: colors.primary }}
          />
        </View>
      </View>

      {/* Tri */}
      <View style={[styles.section, dynamicStyles.section]}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>🔄 Trier par</Text>
        {sortOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.filterItem,
              dynamicStyles.filterItem,
              sortBy === option.id && styles.filterItemSelected,
            ]}
            onPress={() => setSortBy(option.id)}
          >
            <Ionicons
              name={sortBy === option.id ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.filterItemText, dynamicStyles.text]}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Boutons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primary }]}
          onPress={handleReset}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, dynamicStyles.button]}
          onPress={handleApplyFilters}
        >
          <Text style={styles.buttonTextPrimary}>Appliquer les filtres</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    <BottomNavBar />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  priceDisplay: {
    marginBottom: 15,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 10,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  filterItemSelected: {
    opacity: 0.7,
  },
  filterItemText: {
    marginLeft: 12,
    fontSize: 14,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextPrimary: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
