import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Dimensions, 
  Platform, 
  PermissionsAndroid 
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const MAIN_CATEGORIES = [
  {
    id: 'products',
    name: 'Products',
    icon: 'basket-outline',
    color: '#8BC34A',
    subcategories: [
      {
        name: 'Beverages',
        icon: 'beer-outline',
        subsubcategories: {
          'Hot Drinks': ['Coffee', 'Tea', 'Hot Chocolate', 'Herbal Infusions', 'Chai Latte'],
          'Cold Drinks': ['Iced Coffee', 'Iced Tea', 'Smoothies', 'Milkshakes', 'Frozen Drinks'],
          'Soft Drinks': ['Cola', 'Lemonade', 'Energy Drinks', 'Sports Drinks', 'Sparkling Water'],
          'Juices': ['Fresh Fruit Juice', 'Vegetable Juice', 'Mixed Juice', 'Concentrated Juice', 'Coconut Water'],
          'Water': ['Still Water', 'Sparkling Water', 'Flavored Water', 'Mineral Water', 'Spring Water']
        }
      },
      {
        name: 'Snacks',
        icon: 'fast-food-outline',
        subsubcategories: {
          'Chips & Crisps': ['Potato Chips', 'Corn Chips', 'Tortilla Chips', 'Vegetable Chips', 'Rice Crisps'],
          'Nuts & Seeds': ['Almonds', 'Cashews', 'Pistachios', 'Peanuts', 'Mixed Nuts', 'Pumpkin Seeds'],
          'Sweet Snacks': ['Chocolates', 'Cookies', 'Candies', 'Protein Bars', 'Fruit Snacks'],
          'Healthy Snacks': ['Dried Fruits', 'Trail Mix', 'Granola Bars', 'Rice Cakes', 'Seaweed Snacks'],
          'Savory Snacks': ['Crackers', 'Popcorn', 'Pretzels', 'Beef Jerky', 'Rice Crackers']
        }
      },
      {
        name: 'Fruits & Vegetables',
        icon: 'nutrition-outline',
        subsubcategories: {
          'Fresh Fruits': ['Apples', 'Bananas', 'Oranges', 'Berries', 'Tropical Fruits'],
          'Fresh Vegetables': ['Leafy Greens', 'Root Vegetables', 'Cruciferous', 'Tomatoes', 'Peppers'],
          'Frozen': ['Frozen Fruits', 'Frozen Vegetables', 'Mixed Frozen', 'Smoothie Mixes'],
          'Dried': ['Dried Fruits', 'Sun-dried Tomatoes', 'Dried Mushrooms'],
          'Pre-cut': ['Cut Fruits', 'Salad Mixes', 'Stir-fry Mixes', 'Vegetable Platters']
        }
      }
    ]
  },
  {
    id: 'services',
    name: 'Services',
    icon: 'construct-outline',
    color: '#2196F3',
    subcategories: [
      {
        name: 'Home Services',
        icon: 'home-outline',
        subsubcategories: {
          'Cleaning': ['House Cleaning', 'Carpet Cleaning', 'Window Cleaning', 'Deep Cleaning'],
          'Repairs': ['Plumbing', 'Electrical', 'Appliance Repair', 'General Maintenance'],
          'Gardening': ['Lawn Mowing', 'Hedge Trimming', 'Weeding', 'Garden Design'],
          'Moving Services': ['Packing', 'Unpacking', 'Transportation', 'Storage Solutions']
        }
      },
      {
        name: 'Personal Services',
        icon: 'person-outline',
        subsubcategories: {
          'Fitness': ['Personal Training', 'Yoga Classes', 'Group Fitness', 'Home Gym Setup'],
          'Beauty': ['Hair Styling', 'Makeup', 'Nail Services', 'Spa Treatments'],
          'Tutoring': ['Math', 'Science', 'Languages', 'Music Lessons', 'Test Prep'],
          'Wellness': ['Massage Therapy', 'Meditation', 'Counseling', 'Nutritional Advice']
        }
      },
      {
        name: 'Tech Support',
        icon: 'laptop-outline',
        subsubcategories: {
          'IT Support': ['Network Setup', 'Data Recovery', 'System Troubleshooting', 'Software Installation'],
          'Web Development': ['Website Design', 'E-commerce Setup', 'SEO Services', 'Hosting Solutions'],
          'App Development': ['Mobile App Development', 'UI/UX Design', 'Testing', 'App Maintenance'],
          'Device Repairs': ['Smartphone Repair', 'Laptop Repair', 'Tablet Repair', 'Peripheral Repair']
        }
      }
    ]
  },
  {
    id: 'catering',
    name: 'Catering',
    icon: 'pizza-outline',
    color: '#F44336',
    subcategories: [
      {
        name: 'Groceries',
        icon: 'cart-outline',
        subsubcategories: {
          'Fresh Produce': ['Fruits', 'Vegetables'],
          'Meat & Fish': ['Chicken', 'Beef', 'Pork', 'Fish', 'Seafood'],
          'Dairy': ['Milk', 'Cheese', 'Butter', 'Yogurt', 'Cream'],
          'Frozen Foods': ['Frozen Vegetables', 'Frozen Snacks', 'Frozen Meals', 'Frozen Desserts']
        }
      },
      {
        name: 'Takeout',
        icon: 'restaurant-outline',
        subsubcategories: {
          'Pizza': ['Margherita', 'Pepperoni', 'Veggie', 'BBQ Chicken', 'Hawaiian'],
          'Burgers': ['Beef Burgers', 'Chicken Burgers', 'Veggie Burgers', 'Cheeseburgers'],
          'Sushi': ['Nigiri', 'Sashimi', 'Maki', 'Uramaki', 'Temaki'],
          'Sandwiches': ['Club Sandwich', 'BLT', 'Veggie Sandwich', 'Grilled Cheese']
        }
      },
      {
        name: 'Fast Food',
        icon: 'fast-food-outline',
        subsubcategories: {
          'Burgers': ['Cheeseburgers', 'Double Burgers', 'Chicken Burgers'],
          'Fries': ['Regular Fries', 'Cheese Fries', 'Curly Fries', 'Sweet Potato Fries'],
          'Shakes': ['Vanilla Shake', 'Chocolate Shake', 'Strawberry Shake', 'Oreo Shake'],
          'Tacos': ['Beef Tacos', 'Chicken Tacos', 'Fish Tacos', 'Veggie Tacos']
        }
      }
    ]
  },
  {
    id: 'non-consumables',
    name: 'Non-Consumables',
    icon: 'hammer-outline',
    color: '#9C27B0',
    subcategories: [
      {
        name: 'Repairs & Tools',
        icon: 'wrench-outline',
        subsubcategories: {
          'Power Tools': ['Drills', 'Saws', 'Sanders', 'Impact Wrenches'],
          'Hand Tools': ['Hammers', 'Screwdrivers', 'Pliers', 'Wrenches'],
          'Repair Kits': ['Electronics Kits', 'Car Repair Kits', 'Home Repair Kits']
        }
      },
      {
        name: 'Furniture',
        icon: 'sofa-outline',
        subsubcategories: {
          'Living Room': ['Sofas', 'Chairs', 'Coffee Tables', 'TV Stands'],
          'Bedroom': ['Beds', 'Wardrobes', 'Dressers', 'Nightstands'],
          'Office': ['Desks', 'Office Chairs', 'Bookshelves', 'File Cabinets']
        }
      },
      {
        name: 'Home Appliances',
        icon: 'home-outline',
        subsubcategories: {
          'Large Appliances': ['Refrigerators', 'Washing Machines', 'Air Conditioners', 'Ovens'],
          'Small Appliances': ['Microwaves', 'Blenders', 'Toasters', 'Coffee Makers']
        }
      }
    ]
  }
];




const HomeScreen = () => {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);

  async function requestLocationPermission() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'We need access to your location to show your current position.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else if (Platform.OS === 'ios') {
      const status = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      return status === RESULTS.GRANTED;
    }
    return false;
  }

  async function getAddressFromCoordinates(latitude, longitude) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const json = await response.json();
      if (json.address) {
        const city =
          json.address.city || json.address.town || json.address.village;
        const country = json.address.country;
        return { city, country };
      }
    } catch (error) {
      console.log('Error in reverse geocoding:', error);
    }
    return null;
  }
  useEffect(() => {
    (async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        console.log('Permission to access location was denied');
        setLocation({
          text: 'Location permission denied',
        });
        return;
      }

      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          const address = await getAddressFromCoordinates(latitude, longitude);

          setLocation({
            latitude,
            longitude,
            text: address
              ? `${address.city}, ${address.country}`
              : 'Location found',
          });
        },
        (error) => {
          console.log('Error getting location:', error);
          setLocation({
            text: 'Unable to retrieve location',
          });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    })();
  }, []);
  const renderCategoryCard = ({ item }) => (
    <TouchableOpacity 
      style={[styles.categoryCard, { borderColor: item.color }]}
      onPress={() => navigation.navigate('CategoryDetailScreen', { category: item })}
    >
      <View style={[styles.categoryIconContainer, { backgroundColor: item.color + '20' }]}>
        <Icon 
          name={item.icon} 
          size={30} 
          color={item.color} 
        />
      </View>
      <Text style={styles.categoryName}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Location Map Section */}
      {location && location.latitude && location.longitude ? (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="You are here"
            />
          </MapView>
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationText}>
              {location.text}
            </Text>
          </View>
        </View>
      ) : (
        <Text style={styles.loadingText}>
          {location && location.text ? location.text : 'Loading...'}
        </Text>
      )}
      {/* Categories Section */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={MAIN_CATEGORIES}
          renderItem={renderCategoryCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.categoryList}
        />
      </View>
    </View>
  );
};

// Styles
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:20,
    backgroundColor: '#F5F5F5',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
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
export default HomeScreen;