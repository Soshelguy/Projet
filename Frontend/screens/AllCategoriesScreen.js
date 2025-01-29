import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppSettingsContext } from '../AppSettingsContext'; // adjust the import path as necessary

/**
 * AllCategoriesScreen
 * 
 * This screen displays a list of all main categories as cards with
 * their respective subcategories. It also provides navigation to the
 * CategoryDetailScreen when a category is selected.
 * 
 * @param {Object} props - The props passed to the component
 * @param {Function} props.navigation - The navigation object
 * 
 * @returns {ReactElement} - The component
 */
const AllCategoriesScreen = ({ navigation }) => {
  const { darkMode } = useContext(AppSettingsContext);

  /**
   * renderCategoryItem
   * 
   * This function renders a single category item in the list.
   * It takes an object with the category properties and renders a
   * TouchableOpacity component with the category details.
   * 
   * @param {Object} item - The category item
   * @returns {ReactElement} - The rendered item
   */
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.categoryCard, 
        darkMode && styles.darkModeCategoryCard
      ]}
      onPress={() => navigation.navigate('CategoryDetailScreen', { 
        categoryId: item.id,
        subcategories: item.subcategories 
      })}
    >
      <View 
        style={[
          styles.categoryIconContainer, 
          { 
            backgroundColor: darkMode ? 'rgba(217, 196, 157, 0.2)' : '#EFEAE1' 
          }
        ]}
      >
        <Icon 
          name={item.icon} 
          size={32} 
          color={darkMode ? '#D9C49D' : '#1E2541'} 
        />
      </View>
      <Text 
        style={[
          styles.categoryName, 
          darkMode && styles.darkModeText
        ]}
      >
        {item.name}
      </Text>
      <View style={styles.subcategoriesPreview}>
        {item.subcategories.slice(0, 3).map((subcat, index) => (
          <Text 
            key={index} 
            style={[
              styles.subcategoryText, 
              darkMode && styles.darkModeSubtext
            ]}
            numberOfLines={1}
          >
            {subcat}
          </Text>
        ))}
        {item.subcategories.length > 3 && (
          <Text 
            style={[
              styles.moreCategoriesText, 
              { color: darkMode ? '#A5F1E9' : '#1E2541' }
            ]}
          >
            +{item.subcategories.length - 3} more
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, darkMode && styles.darkModeContainer]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Icon 
            name="arrow-back" 
            size={24} 
            color={darkMode ? '#D9C49D' : '#1E2541'} 
          />
        </TouchableOpacity>
        <Text 
          style={[
            styles.screenTitle, 
            darkMode && styles.darkModeText
          ]}
        >
          All Categories
        </Text>
      </View>

      <FlatList
        data={mainCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.categoryGrid}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

/**
 * Styles
 * 
 * The styles used in the component
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  darkModeContainer: {
    backgroundColor: '#1E2541',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  backButton: {
    marginRight: 15,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E2541',
  },
  categoryGrid: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    margin: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkModeCategoryCard: {
    backgroundColor: '#2C2C2C',
  },
  categoryIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E2541',
    marginBottom: 10,
    textAlign: 'center',
  },
  subcategoriesPreview: {
    alignItems: 'center',
    width: '100%',
  },
  subcategoryText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 3,
  },
  moreCategoriesText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  darkModeText: {
    color: '#FFFFFF',
  },
  darkModeSubtext: {
    color: '#BBB',
  },
});

export default AllCategoriesScreen;

