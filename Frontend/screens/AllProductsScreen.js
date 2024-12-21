import React, { useState, useContext, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Dimensions, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { useCart } from '../CartContext';
import { AppSettingsContext } from '../AppSettingsContext';
import { BlurView } from '@react-native-community/blur';
const { width } = Dimensions.get('window');

const AllProductsScreen = ({ navigation }) => {
  const { darkMode } = useContext(AppSettingsContext);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);  
  const BACKEND_URL = 'https://8b7f-41-100-123-0.ngrok-free.app'; 

  const { cartCount, productQuantities = {}, addToCart, removeFromCart } = useCart(); 

  const categories = [
    'All', 'Meats', 'Vege', 'Fruits', 'Breads', 'Dairy', 'Snacks', 'Drinks'
  ];

  const filterOptions = [
    { label: 'All', value: 'All' },
    { label: 'Price: Low to High', value: 'PriceLowToHigh' },
    { label: 'Price: High to Low', value: 'PriceHighToLow' },
    { label: 'Weight: Low to High', value: 'WeightLowToHigh' },
    { label: 'Weight: High to Low', value: 'WeightHighToLow' },
    { label: 'Discounted Items', value: 'Discounted' },
    { label: 'New Arrivals', value: 'NewArrivals' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://8b7f-41-100-123-0.ngrok-free.app0/api/products');
        if (!response.ok) {
          throw new Error('Error fetching products');
        }
        const data = await response.json();
        if (!data || !Array.isArray(data)) {
          throw new Error('Invalid product data');
        }
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, selectedFilter, products]);    

  const filterProducts = () => {
    if (!products || products.length === 0) return;

    let filtered = products.filter((product) => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory === 'All' || product.category === selectedCategory)
    );

    switch (selectedFilter) {
      case 'PriceLowToHigh':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'PriceHighToLow':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'WeightLowToHigh':
        filtered.sort((a, b) => parseFloat(a.weight) - parseFloat(b.weight));
        break;
      case 'WeightHighToLow':
        filtered.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
        break;
      case 'Discounted':
        filtered = filtered.filter((product) => product.discounted);
        break;
      case 'NewArrivals':
        filtered = filtered.filter((product) => product.isNewArrival);
        break;
    }

    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <View style={[styles.container,darkMode && styles.darkModeContainer, styles.centerContent]}>
            <ActivityIndicator size="large"  color={darkMode ? '#D9C49D' : '#1E2541'}  />
        </View>
    );
}

  if (error) {
    return <View style={styles.centerContainer}><Text>Error: {error}</Text></View>;
  }

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
    style={[styles.productCard, darkMode && styles.darkModeProductCard]}
    onPress={() => navigation.navigate('ProductScreen', {
        productId: item.id,
        name: item.name,
        price: item.price.toString(),
        image: `${BACKEND_URL}${item.image}`, // Pass full image URL
      })}
    >
      <Image source={{ uri: `${BACKEND_URL}${item.image}` || 'default-image-url' }} style={styles.productImage} />
      <BlurView 
  intensity={darkMode ? 0 : 20} 
  tint={darkMode ? "dark" : "light"} 
  style={styles.productInfo}
>
  <Text 
    style={[styles.productName, darkMode && styles.darkModeText]} 
    numberOfLines={1}
  >
    {item.name}
  </Text>
  <Text 
    style={[styles.productWeight, darkMode && styles.darkModeSubtext]} 
    numberOfLines={1}
  >
    {item.weight}
  </Text>
  <View style={styles.productFooter}>
    <Text 
      style={[styles.productPrice, darkMode && styles.darkModePriceText]}
    >
      {item.price ? `${item.price} Dz` : 'Price not available'}
    </Text>
    {productQuantities[item.id] ? (
      <View style={styles.quantityContainer}>
        <TouchableOpacity style={styles.quantityButton} onPress={() => removeFromCart(item.id)}>
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{productQuantities[item.id]}</Text>
        <TouchableOpacity style={styles.quantityButton} onPress={() => addToCart(item)}>
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    )}
  </View>
</BlurView>

    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, darkMode && styles.darkModeContainer]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={darkMode ? '#D9C49D' : '#1E2541'}   />
        </TouchableOpacity>
        <Text style={styles.headerTitle && styles.darkModeHeaderTitle}>All Products</Text>
        <TouchableOpacity onPress={() => navigation.navigate('OrderSummaryScreen')} style={styles.cartButton}>
        <Icon 
                name="cart-outline" 
                size={24} 
                color={darkMode ? '#D9C49D' : '#1E2541'} 
              />
                        {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, darkMode && styles.darkModeSearchContainer]}>
      <Icon name="search-outline" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
              style={[styles.searchInput, darkMode && styles.darkModeSearchInput]}
              placeholder="Search for 'Grocery'"
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <Picker
          selectedValue={selectedCategory}
          style={[styles.picker, darkMode && styles.darkModePicker]}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        >
          {categories.map((category) => (
            <Picker.Item key={category} label={category} value={category} />
          ))}
        </Picker>

        <Picker
          selectedValue={selectedFilter}
          style={[styles.picker, darkMode && styles.darkModePicker]}
          onValueChange={(itemValue) => setSelectedFilter(itemValue)}
        >
          {filterOptions.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>

      <FlatList
        data={filteredProducts || []} 
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productList}
      />
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCFB', // Light mode background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E2541',
  },
  cartButton: {
    position: 'relative',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDFCFB',
  },
  errorText: {
    color: '#1E2541',
    fontSize: 18,
    textAlign: 'center',
  },
  cartBadge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: '#A5F1E9',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#1E2541',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEAE1',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDFCFB',
  },
  searchIcon: {
    marginRight: 10,
    color: '#888',
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#1E2541',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  picker: {
    height: 50,
    width: '48%',
    color: '#1E2541',
    backgroundColor: '#EFEAE1',
  },
  productList: {
    paddingHorizontal: 10,
  },
  productCard: {
    backgroundColor: '#EFEAE1',
    borderRadius: 15,
    padding: 15,
    margin: 5,
    width: '47%',
    alignItems: 'center',
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  productInfo: {
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E2541',
    textAlign: 'center',
    marginBottom: 5,
  },
  productWeight: {
    fontSize: 12,
    color: '#444444',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A5F1E9',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#A5F1E9',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 10,
  },
  addButtonText: {
    color: '#1E2541',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#A5F1E9',
    borderRadius: 15,
    height: 30,
    width: '100%',
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#1E2541',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E2541',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
},
  darkModeContainer: {
    backgroundColor: '#1E2541',
    flex: 1,

  },
  darkModeHeaderTitle: {
    color: '#A5F1E9',
    fontSize: 20,
    fontWeight: 'bold',
  },
  darkModeSearchContainer: {
    backgroundColor: '#2C2C2C',
  },
  darkModeSearchInput: {
    color: '#FFFFFF',
  },
  darkModePicker: {
    color: '#A5F1E9',
    backgroundColor: '#2C2C2C',
  },
  darkModeText: {
    color: '#fff',
  },
  darkModeSubtext: {
    color: '#ddd',
  },
  darkModeProductCard: {
    backgroundColor: '#2C2C2C',
  },
  darkModeProductName: {
    color: '#FFFFFF',
  },
  darkModeProductWeight: {
    color: '#888',
  },
  darkModeProductPrice: {
    color: '#A5F1E9',
  },
  darkModeAddButton: {
    backgroundColor: '#A5F1E9',
  },
  darkModeAddButtonText: {
    color: '#1E2541',
  },
});

export default AllProductsScreen;