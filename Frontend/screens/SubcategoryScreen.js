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
  // Destructure parentCategory from route parameters
  const { parentCategory } = route.params;
  const navigation = useNavigation();

  // State variables for managing selected category and services
  const [activeSubcategory, setActiveSubcategory] = useState(parentCategory.subcategories[0].name);
  const [activeSubcategoryData, setActiveSubcategoryData] = useState(parentCategory.subcategories[0]);
  const [activeSubSubcategory, setActiveSubSubcategory] = useState(
    Object.keys(parentCategory.subcategories[0].subsubcategories)[0]
  );

  const [services, setServices] = useState({});
  const [isFetchingServices, setIsFetchingServices] = useState(false);

  // Refs for handling scroll positions
  const sectionOffsets = useRef({});
  const scrollViewRef = useRef(null);

  const scrollToSubSubcategory = (subSubcategoryName) => {
    const yOffset = sectionOffsets.current[subSubcategoryName];
    if (yOffset !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: yOffset, animated: true });
    }
  };

  // Update activeSubcategoryData and reset activeSubSubcategory when activeSubcategory changes
  useEffect(() => {
    const newSubcategoryData = parentCategory.subcategories.find(sub => sub.name === activeSubcategory);
    setActiveSubcategoryData(newSubcategoryData);
    setActiveSubSubcategory(Object.keys(newSubcategoryData.subsubcategories)[0]);
  }, [activeSubcategory]);

  // Fetch and organize services when activeSubcategoryData changes
  useEffect(() => {
    const fetchAndGroupServices = async () => {
      if (!activeSubcategoryData) return;
      setIsFetchingServices(true);
      try {
        const response = await fetch(
          `http://192.168.1.2:5000/api/services?category=${encodeURIComponent(parentCategory.name)}&subcategory=${encodeURIComponent(activeSubcategory)}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }

        const servicesData = await response.json();
        const subSubcategoryNames = Object.keys(activeSubcategoryData.subsubcategories);

        // Group services by subsubcategory
        const organizedServices = subSubcategoryNames.reduce((groups, subSubcategory) => {
          const relatedServices = servicesData.filter(service => service.subsubcategory === subSubcategory);
          if (relatedServices.length > 0) {
            groups[subSubcategory] = relatedServices;
          }
          return groups;
        }, {});

        setServices(organizedServices);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setIsFetchingServices(false);
      }
    };

    fetchAndGroupServices();
  }, [activeSubcategoryData]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{parentCategory.name}</Text>
        </View>

        {/* Subcategories Navigation */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.subcategoryScrollContainer}
        >
          {parentCategory.subcategories.map((subcategory, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.subcategoryItem,
                activeSubcategory === subcategory.name && styles.selectedSubcategoryItem,
              ]}
              onPress={() => {
                setActiveSubcategory(subcategory.name);
                sectionOffsets.current = {};
                if (scrollViewRef.current) {
                  scrollViewRef.current.scrollTo({ y: 0, animated: false });
                }
              }}
            >
              <Text style={styles.subcategoryText}>{subcategory.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SubSubcategories Navigation */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.subsubcategoryScrollContainer}
        >
          {Object.keys(activeSubcategoryData.subsubcategories).map((subSubcategory, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.subsubcategoryItem,
                activeSubSubcategory === subSubcategory && styles.selectedSubsubcategoryItem,
              ]}
              onPress={() => setActiveSubSubcategory(subSubcategory)}
            >
              <Text style={styles.subsubcategoryText}>{subSubcategory}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Services Display */}
        {isFetchingServices ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>Loading services...</Text>
          </View>
        ) : (
          <ScrollView style={styles.servicesContainer} ref={scrollViewRef}>
            {Object.keys(services).length > 0 ? (
              Object.keys(services).map((subSubcategory) => (
                <View
                  key={subSubcategory}
                  onLayout={(event) => {
                    const { y } = event.nativeEvent.layout;
                    sectionOffsets.current[subSubcategory] = y;
                  }}
                >
                  {/* SubSubcategory Header */}
                  <Text style={styles.sectionHeader}>{subSubcategory}</Text>
                  <View style={styles.servicesGrid}>
                    {services[subSubcategory].map((service) => (
                      <TouchableOpacity 
                      key={service.id}
                      style={styles.serviceCard}
                      onPress={() => {
                        navigation.navigate('ServiceDetailScreen', { 
                          serviceId: service.id,
                          service: service
                        });
                      }}
                    >
                        <Image
                          source={{ uri: service.image }} // Ensure 'service.image' is a valid URL
                          style={styles.serviceImage}
                        />
                        <Text style={styles.serviceTitle}>{service.name}</Text>
                        <Text style={styles.serviceDescription}>{service.description}</Text>
                        <Text style={styles.servicePrice}>${service.price}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noServicesWrapper}>
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
  subcategoryScrollContainer: {
    backgroundColor: '#E0F7FA',
    paddingVertical: 10,
    maxHeight: 60,
  },
  subcategoryItem: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 5,
    backgroundColor: '#80DEEA',
    borderRadius: 20,
  },
  subcategoryText: {
    fontSize: 14,
    color: 'black',
  },
  selectedSubcategoryItem: {
    backgroundColor: '#26C6DA',
  },
  subsubcategoryScrollContainer: {
    backgroundColor: '#FFF9C4',
    paddingVertical: 10,
    maxHeight: 60,
  },
  subsubcategoryItem: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 5,
    backgroundColor: '#FFF176',
    borderRadius: 20,
  },
  subsubcategoryText: {
    fontSize: 14,
    color: 'black',
  },
  selectedSubsubcategoryItem: {
    backgroundColor: '#FFD54F',
  },
  servicesContainer: {
    flex: 1,
    padding: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: width * 0.45 - 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  serviceImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 5,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  serviceDescription: {
    fontSize: 12,
    color: '#777',
    marginBottom: 5,
    textAlign: 'left',
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'left',
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noServicesWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SubcategoryScreen;
