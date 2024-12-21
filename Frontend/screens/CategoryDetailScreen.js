
import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const CategoryDetailScreen = ({ route, navigation }) => {
  const { category } = route.params;

  const renderSubcategoryCard = ({ item }) => (
    <TouchableOpacity 
      style={[styles.subcategoryCard, { borderColor: category.color }]}
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
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:20,
    backgroundColor: '#F5F5F5',
  },
  mapContainer: {
    height: width * 0.6,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  locationTextContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 10,
    borderRadius: 10,
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  categoriesContainer: {
    flex: 1,
    padding: 10,
  },
  categoryList: {
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: width * 0.45,
    height: width * 0.4,
    borderRadius: 15,
    borderWidth: 1,
    margin: 5,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  categoryIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subcategoryList: {
    padding: 10,
  },
  subcategoryCard: {
    width: width * 0.45,
    height: width * 0.35,
    borderRadius: 15,
    borderWidth: 1,
    margin: 5,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  subcategoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  subcategoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  subItemList: {
    padding: 10,
  },
  subItemCard: {
    width: width * 0.45,
    height: width * 0.2,
    borderRadius: 10,
    borderWidth: 1,
    margin: 5,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  subItemName: {
    fontSize: 14,
    color: 'black',
  },
});

export default CategoryDetailScreen;