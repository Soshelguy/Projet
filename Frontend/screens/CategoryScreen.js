import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';

// Component for displaying products within a specific category
const CategoryScreen = ({ route }) => {
    const { categoryName } = route.params; // Destructure category name from route params
    const [products, setProducts] = useState([]); // State to store fetched products
    const [fetchError, setFetchError] = useState(null); // State to store fetch error message

    useEffect(() => {
        // Function to fetch products by the given category name
        const fetchProductsByCategory = async () => {
            try {
                // Fetch products from the API filtered by category name
                const response = await axios.get(`https://cf8f-197-203-19-175.ngrok-free.app/api/products?name=${categoryName}`);
                setProducts(response.data); // Update products state with fetched data
            } catch (error) {
                console.error('Error fetching products:', error);
                setFetchError('Failed to fetch products. Please try again later.');
            }
        };

        fetchProductsByCategory();
    }, [categoryName]); // Re-run effect when categoryName changes

    // Function to render each product item
    const renderProductItem = ({ item }) => (
        <View style={styles.productCard}>
            <TouchableOpacity>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>Dz {item.price}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    // Display error message if product fetching fails
    if (fetchError) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{fetchError}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={products} // Pass products to FlatList
                renderItem={renderProductItem} // Render each item using renderProductItem
                keyExtractor={(item) => item._id} // Use unique identifier as the key
                ListEmptyComponent={() => <Text>No products available in this category.</Text>} // Message when list is empty
            />
        </View>
    );
};

// Styles for CategoryScreen component
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    productCard: {
        backgroundColor: '#fff',
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
    },
    productInfo: {
        padding: 16,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    productPrice: {
        fontSize: 14,
        color: '#888',
        marginTop: 8,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
});

export default CategoryScreen;

