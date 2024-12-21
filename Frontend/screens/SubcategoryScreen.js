import React, { useState, useRef, useEffect } from 'react';
import { 
  SafeAreaView,
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  StyleSheet, 
  Dimensions,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const SubcategoryScreen = ({ route }) => {
  const { parentCategory } = route.params;
  const navigation = useNavigation();

  const [selectedSubcategory, setSelectedSubcategory] = useState(parentCategory.subcategories[0].name);
  const [currentSubcategory, setCurrentSubcategory] = useState(parentCategory.subcategories[0]);
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState(
    Object.keys(parentCategory.subcategories[0].subsubcategories)[0]
  );

  const [services, setServices] = useState({});
  const [loadingServices, setLoadingServices] = useState(false);

  const sectionPositions = useRef({});
  const scrollViewRef = useRef(null);

  const scrollToSection = (sectionId) => {
    const positionY = sectionPositions.current[sectionId];
    if (positionY !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: positionY, animated: true });
    }
  };

  // Update currentSubcategory and reset selectedSubSubcategory when selectedSubcategory changes
  useEffect(() => {
    const newSubcategory = parentCategory.subcategories.find(sub => sub.name === selectedSubcategory);
    setCurrentSubcategory(newSubcategory);
    setSelectedSubSubcategory(Object.keys(newSubcategory.subsubcategories)[0]);
  }, [selectedSubcategory]);

  // Fetch and group services when currentSubcategory changes
  useEffect(() => {
    const fetchServices = async () => {
      if (!currentSubcategory) return;
      setLoadingServices(true);
      try {
        const response = await fetch(
          `https://8b7f-41-100-123-0.ngrok-free.app/api/services?category=${encodeURIComponent(parentCategory.name)}&subcategory=${encodeURIComponent(selectedSubcategory)}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }

        const data = await response.json();
        const subsubcategoriesKeys = Object.keys(currentSubcategory.subsubcategories);

        // Group services by subsubcategory of currentSubcategory
        const groupedServices = subsubcategoriesKeys.reduce((groups, subsubcat) => {
          const serviceGroup = data.filter(service => service.subsubcategory === subsubcat);
          if (serviceGroup.length > 0) {
            groups[subsubcat] = serviceGroup;
          }
          return groups;
        }, {});

        setServices(groupedServices);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, [currentSubcategory]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{parentCategory.name}</Text>
        </View>

        {/* Subcategories Horizontal ScrollView */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.subcategoryScrollView}
        >
          {parentCategory.subcategories.map((subcat, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.subcategoryItem,
                selectedSubcategory === subcat.name && styles.selectedSubcategoryItem,
              ]}
              onPress={() => {
                setSelectedSubcategory(subcat.name);
                sectionPositions.current = {};
                if (scrollViewRef.current) {
                  scrollViewRef.current.scrollTo({ y: 0, animated: false });
                }
              }}
            >
              <Text style={styles.subcategoryItemText}>{subcat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SubSubcategories Horizontal ScrollView */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.subsubcategoryScrollView}
        >
          {Object.keys(currentSubcategory.subsubcategories).map((subsubcat, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.subsubcategoryItem,
                selectedSubSubcategory === subsubcat && styles.selectedSubsubcategoryItem,
              ]}
              onPress={() => {
                setSelectedSubSubcategory(subsubcat);
                scrollToSection(subsubcat);
              }}
            >
              <Text style={styles.subsubcategoryItemText}>{subsubcat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content Area */}
        {loadingServices ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>Loading services...</Text>
          </View>
        ) : (
          <ScrollView style={styles.contentContainer} ref={scrollViewRef}>
            {Object.keys(services).length > 0 ? (
              Object.keys(services).map((subsubcat) => (
                <View
                  key={subsubcat}
                  onLayout={(event) => {
                    const { y } = event.nativeEvent.layout;
                    sectionPositions.current[subsubcat] = y;
                  }}
                >
                  {/* Section Header */}
                  <Text style={styles.sectionHeader}>{subsubcat}</Text>
                  <View style={styles.itemsGrid}>
                    {services[subsubcat].map((service) => (
                      <TouchableOpacity 
                        key={service.id}
                        style={styles.itemCard}
                        onPress={() => {
                          // Navigate to service details screen if needed
                        }}
                      >
                        <Image
                          source={{ uri: service.image }} // Ensure 'service.image' contains a valid image URL
                          style={styles.itemImage}
                        />
                        <Text style={styles.itemTitle}>{service.name}</Text>
                        <Text style={styles.itemDescription}>{service.description}</Text>
                        <Text style={styles.itemPrice}>${service.price}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noServicesContainer}>
                <Text>No services available for this category.</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    marginTop: Platform.OS === 'android' ? 25 : 0,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Styles for subcategory scroll view
  subcategoryScrollView: {
    backgroundColor: '#E0F7FA', // Light cyan
    paddingVertical: 10,
    maxHeight: 60,
  },
  subcategoryItem: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 5,
    backgroundColor: '#80DEEA', // Medium cyan
    borderRadius: 20,
  },
  subcategoryItemText: {
    fontSize: 14,
    color: 'black',
  },
  selectedSubcategoryItem: {
    backgroundColor: '#26C6DA', // Darker cyan
  },
  // Styles for subsubcategory scroll view
  subsubcategoryScrollView: {
    backgroundColor: '#FFF9C4', // Light yellow
    paddingVertical: 10,
    maxHeight: 60,
  },
  subsubcategoryItem: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 5,
    backgroundColor: '#FFF176', // Medium yellow
    borderRadius: 20,
  },
  subsubcategoryItemText: {
    fontSize: 14,
    color: 'black',
  },
  selectedSubsubcategoryItem: {
    backgroundColor: '#FFD54F', // Darker yellow
  },
  // Content styles
  contentContainer: {
    flex: 1,
    padding: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: width * 0.45 - 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
    marginHorizontal: 5,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  itemImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 5,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  itemDescription: {
    fontSize: 12,
    color: '#777',
    marginBottom: 5,
    textAlign: 'left',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'left',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noServicesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SubcategoryScreen;