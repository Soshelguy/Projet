import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * CategoryDetailScreen
 * 
 * This screen displays a list of subcategories for the selected category.
 * It also provides navigation to the SubcategoryScreen when a subcategory is selected.
 * 
 * @param {Object} props - The props passed to the component
 * @param {Object} props.route - The route object containing the category info
 * @param {Object} props.navigation - The navigation object
 * 
 * @returns {ReactElement} - The component
 */
const CategoryDetailScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const { width } = useWindowDimensions();

  // Render a subcategory card with its name and icon
  const renderSubcategoryCard = ({ item }) => (
    <TouchableOpacity 
      style={[styles.subcategoryCard, { borderColor: category.color, width: width * 0.45, height: width * 0.35 }]}
      onPress={() => navigation.navigate('SubcategoryScreen', { 
        parentCategory: category,
        subcategory: item 
      })}
    >
      <View style={[styles.subcategoryIconContainer, { backgroundColor: category.color + '20' }]}>
        <Icon 
          name={item.icon} 
          size={30} 
          color={category.color} 
        />
      </View>
      <Text style={styles.subcategoryName}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category.name}</Text>
      </View>
      <FlatList
        data={category.subcategories}
        renderItem={renderSubcategoryCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.subcategoryList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // Container for the screen
  container: {
    flex: 1,
    marginTop: 20,
    backgroundColor: '#F5F5F5',
  },

  // Header container
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
  },
  // Back button
  backButton: {
    marginRight: 15,
  },
  // Header title
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Subcategory list container
  subcategoryList: {
    padding: 10,
  },
  // Subcategory card
  subcategoryCard: {
    borderRadius: 15,
    borderWidth: 1,
    margin: 5,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  // Subcategory icon container
  subcategoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  // Subcategory name text
  subcategoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default CategoryDetailScreen;

