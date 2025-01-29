/**
 * ServicesScreen component
 * This component displays a list of services and allows the user to filter by category
 * and search for services by name
 */
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Image, Dimensions, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BlurView } from '@react-native-community/blur';
import { AppSettingsContext } from '../AppSettingsContext';

const { width } = Dimensions.get('window');

/**
 * ServicesScreen component
 * @param {object} props - component props
 * @param {function} props.navigation - navigation function
 * @param {object} props.route - route object
 */
const ServicesScreen = ({ navigation, route }) => {
    const { darkMode } = useContext(AppSettingsContext);

    // State variables
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(0);

    // Categories data
    const categories = [
        { id: 0, name: 'All', icon: 'apps-outline' },
        ...(route.params?.categories || []).filter(cat => cat.id !== 0),
        { id: 1, name: 'Cleaning', icon: 'trash-bin-outline' },
        { id: 2, name: 'Delivery', icon: 'bicycle-outline' },
        { id: 3, name: 'Tutoring', icon: 'school-outline' },
        { id: 4, name: 'Plumbing', icon: 'water-outline' },
        { id: 5, name: 'Electrician', icon: 'flash-outline' },
        { id: 6, name: 'Gardening', icon: 'leaf-outline' },
        { id: 7, name: 'Painting', icon: 'color-palette-outline' },
        { id: 8, name: 'Moving', icon: 'car-outline' },
        { id: 9, name: 'Carpentry', icon: 'hammer-outline' },
        { id: 10, name: 'Babysitting', icon: 'person-outline' },
        { id: 11, name: 'Trainer', icon: 'fitness-outline' },
        { id: 12, name: 'Repairs', icon: 'construct-outline' },
    ];

    // Fetch services from API
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('https://cf8f-197-203-19-175.ngrok-free.app/api/services', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
        
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
        
                const data = await response.json();
                setServices(data);
            } catch (error) {
                console.error('Error fetching services:', error);
                setServices([]); 
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    // Filter services by category and search query
    const filteredServices = services.filter(service => 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedCategory === 0 || service.category === categories[selectedCategory].name)
    );

    
    // Render category item
    const renderCategory = ({ item }) => (
        <TouchableOpacity 
            style={styles.categoryCard}
            onPress={() => setSelectedCategory(item.id)}
        >
            <View 
                style={[styles.categoryIconContainer, 
                    { 
                        backgroundColor: selectedCategory === item.id 
                            ? (darkMode ? '#D9C49D' : '#2C2C2C') 
                            : (darkMode ? '#2C2C2C' : '#EFEAE1')
                    }
                ]}
            >
                <Icon 
                    name={item.icon} 
                    size={24} 
                    color={selectedCategory === item.id 
                        ? (darkMode ? '#1E2541' : '#A5F1E9') 
                        : (darkMode ? '#D9C49D' : '#1E2541')
                    }
                />
            </View>
            <Text style={[styles.categoryText, darkMode && styles.darkModeCategoryText]}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );


    // Render service item
    const renderService = ({ item }) => (
        <TouchableOpacity 
            style={[styles.serviceCard, darkMode && styles.darkModeServiceCard]}
            onPress={() => navigation.navigate('ServiceDetailScreen', { serviceId: item.id, service: item })}
        >
            <Image source={{ uri: item.image }} style={styles.serviceImage} />
            <BlurView 
                intensity={80} 
                tint={darkMode ? "dark" : "light"} 
                style={styles.serviceInfo}
            >
                <Text style={[styles.serviceName, darkMode && styles.darkModeText]} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={[styles.serviceDescription, darkMode && styles.darkModeSubtext]} numberOfLines={1}>
                    {item.description}
                </Text>
                <View style={styles.serviceFooter}>
                    <Text style={[styles.servicePrice, darkMode && styles.darkModePriceText]}>
                        ${parseFloat(item.price || 0).toFixed(2)}
                    </Text>
                    <TouchableOpacity 
                        style={[styles.bookButton, darkMode && styles.darkModeBookButton]}
                        onPress={() => navigation.navigate('ServiceDetailScreen', { 
                            serviceId: item.id,
                            service: item
                        })}
                    >
                        <Text style={[styles.bookButtonText, darkMode && styles.darkModeBookButtonText]}>
                            Book
                        </Text>
                    </TouchableOpacity>
                </View>
            </BlurView>
        </TouchableOpacity>
    );


    // Loading indicator
    if (loading) {
        return (
            <View style={[styles.container,darkMode && styles.darkModeContainer, styles.centerContent]}>
                <ActivityIndicator size="large"  color={darkMode ? '#D9C49D' : '#1E2541'}  />
            </View>
        );
    }
    

    return (
        <View style={[styles.container, darkMode && styles.darkModeContainer]}>
            <View style={[styles.searchContainer, darkMode && styles.darkModeSearchContainer]}>
                <Icon 
                    name="search-outline" 
                    size={20} 
                    color={darkMode ? '#D9C49D' : '#FFFFFF'} 
                    style={styles.searchIcon} 
                />
                <TextInput
                    style={[styles.searchInput, darkMode && styles.darkModeSearchInput]}
                    placeholder="Search for services"
                    placeholderTextColor={darkMode ? '#888' : '#FFFFFF'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <View style={styles.categoriesContainer}>
                <FlatList
                    data={categories}
                    renderItem={renderCategory}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                />
            </View>
            <FlatList
                data={filteredServices}
                renderItem={renderService}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.serviceList}
            />
            
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E0F7FA',
        paddingTop: 50,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C3E50',
        borderRadius: 25,
        paddingHorizontal: 15,
        marginHorizontal: 20,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        height: 50,
        color: '#FFFFFF',
        fontSize: 16,
    },
    categoriesContainer: {
        marginBottom: 20,
        
    },
    categoriesList: {
        paddingHorizontal: 20,
    },
    categoryCard: {
        alignItems: 'center',
        marginRight: 20,
        
    },
    categoryIconContainer: {
        backgroundColor:'#FFFFFF',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryText: {
        color: '#1F654C',
        marginTop: 5,
        fontSize: 12,
    },
    serviceList: {
        paddingHorizontal: 10,
    },
    serviceCard: {
        backgroundColor: '#EFEAE1',
        borderRadius: 15,
        overflow: 'hidden',
        margin: 10,
        width: (width - 60) / 2,
    },
    serviceImage: {
        width: '100%',
        height: 120,
    },
    serviceInfo: {
        padding: 10,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E2541',
        marginBottom: 5,
    },
    serviceDescription: {
        fontSize: 12,
        color: '#444444',
        marginBottom: 5,
    },
    serviceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    servicePrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#A5F1E9',
    },
    bookButton: {
        backgroundColor: '#A5F1E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        height:24,
    },
    bookButtonText: {
        color: '#1E2541',
        fontWeight: 'bold',
        fontSize: 12,
    },
    addServiceButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#1E2541',
        borderRadius: 30,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#A5F1E9',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 50,
    },
    darkModeContainer: {
        backgroundColor: '#1E2541',
    },
    darkModeSearchContainer: {
        backgroundColor: '#2C2C2C',
    },
    darkModeSearchInput: {
        color: '#FFFFFF',
    },
    darkModeCategoryText: {
        color: '#D9C49D',
    },
    darkModeServiceCard: {
        backgroundColor: '#2C2C2C',
    },
    darkModeText: {
        color: '#fff',
    },
    darkModeSubtext: {
        color: '#ddd',
    },
    darkModePriceText: {
        color: '#A5F1E9',
    },
    darkModeBookButton: {
        backgroundColor: '#A5F1E9',
    },
    darkModeBookButtonText: {
        color: '#1E2541',
    },
    darkModeAddServiceButton: {
        backgroundColor: '#A5F1E9',
    },
    darkModeLoadingIndicator: {
        backgroundColor: '#1E2541',
    },
});

export default ServicesScreen;