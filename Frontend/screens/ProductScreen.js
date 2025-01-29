import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { CartContext } from '../CartContext';
import { AppSettingsContext } from '../AppSettingsContext';

const ProductScreen = ({ route, navigation }) => {
    // Extract productId from route parameters
    const { productId } = route.params;

    // State hooks for managing product details, quantity, favorites, loading status, and similar products
    const [productDetails, setProductDetails] = useState(null);
    const [productQuantity, setProductQuantity] = useState(1);
    const [favoriteStatus, setFavoriteStatus] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [relatedProducts, setRelatedProducts] = useState([]);

    // Context hooks for cart operations and app settings
    const { addToCart, cartItems } = useContext(CartContext);
    const { darkMode } = useContext(AppSettingsContext);

    useEffect(() => {
        // Fetch product details and similar products on component mount
        const fetchProductDetails = async () => {
            try {
                const response = await fetch(`https://cf8f-197-203-19-175.ngrok-free.app/api/products/${productId}`);
                const data = await response.json();
                if (response.ok) {
                    setProductDetails(data);
                    await fetchRelatedProducts(data.id);
                } else {
                    console.error('Error fetching product:', data.message);
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchRelatedProducts = async (productId) => {
            try {
                const response = await fetch(`https://cf8f-197-203-19-175.ngrok-free.app/api/products/similar/${productId}`);
                const data = await response.json();
                if (response.ok) {
                    setRelatedProducts(data);
                } else {
                    console.error('Error fetching similar products:', data.message);
                }
            } catch (error) {
                console.error('Error fetching similar products:', error);
            }
        };

        fetchProductDetails();
    }, [productId]);

    // Update product quantity ensuring it remains positive
    const updateQuantity = (value) => {
        if (value > 0) {
            setProductQuantity(value);
        }
    };

    // Toggle favorite status of the product
    const toggleFavoriteStatus = () => {
        setFavoriteStatus(!favoriteStatus);
    };

    // Add product to cart and navigate to OrderSummaryScreen
    const addProductToCart = () => {
        addToCart({ ...productDetails, quantity: productQuantity });
        navigation.navigate('OrderSummaryScreen');
    };

    // Render product rating stars
    const renderProductRating = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const stars = [];

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Icon key={i} name="star" size={16} color="#A5F1E9" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<Icon key={i} name="star-half" size={16} color="#A5F1E9" />);
            } else {
                stars.push(<Icon key={i} name="star-outline" size={16} color="#A5F1E9" />);
            }
        }

        return stars;
    };

    // Show loading indicator while fetching product data
    if (isLoading) {
        return <ActivityIndicator 
            size="large" 
            color={darkMode ? '#D9C49D' : '#5B8A62'} 
            style={[styles.loadingIndicator, darkMode && styles.darkModeLoadingIndicator]} 
        />;
    }

    return (
        <SafeAreaView style={styles.container}>
            {productDetails && (
                <>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Icon name="arrow-back" size={24} color="#A5F1E9" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{productDetails.name}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('OrderSummaryScreen')}>
                            <Icon name="cart-outline" size={24} color="#A5F1E9" />
                            {Object.keys(cartItems).length > 0 && (
                                <View style={styles.cartBadge}>
                                    <Text style={styles.cartBadgeText}>{Object.keys(cartItems).length}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <Image source={{ uri: productDetails.img }} style={styles.productImage} />
                        <View style={styles.productInfo}>
                            <View style={styles.nameAndFavorite}>
                                <Text style={styles.productName}>{productDetails.name}</Text>
                                <TouchableOpacity onPress={toggleFavoriteStatus}>
                                    <Icon name={favoriteStatus ? "heart" : "heart-outline"} size={24} color="#A5F1E9" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.productWeight}>{productDetails.weight}</Text>
                            <Text style={styles.productPrice}>{productDetails.price} Dz</Text>
                            <View style={styles.ratingContainer}>
                                {renderProductRating(productDetails.rating || 0)}
                                <Text style={styles.ratingText}>({productDetails.rating || 0})</Text>
                            </View>

                            <View style={styles.quantityContainer}>
                                <TouchableOpacity onPress={() => updateQuantity(productQuantity - 1)} style={styles.quantityButton}>
                                    <Text style={styles.quantityButtonText}>-</Text>
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>{productQuantity}</Text>
                                <TouchableOpacity onPress={() => updateQuantity(productQuantity + 1)} style={styles.quantityButton}>
                                    <Text style={styles.quantityButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.addToCartButton} onPress={addProductToCart}>
                                <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                            </TouchableOpacity>

                            <Text style={styles.similarProductsTitle}>Similar Products</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.similarProductsContainer}>
                                {relatedProducts.map((item) => (
                                    <TouchableOpacity 
                                        key={item.id} 
                                        style={styles.similarProductCard} 
                                        onPress={() => navigation.navigate('ProductScreen', { productId: item.id })}
                                    >
                                        <Image source={{ uri: item.img }} style={styles.similarProductImage} />
                                        <Text style={styles.similarProductName}>{item.name}</Text>
                                        <Text style={styles.similarProductPrice}>{item.price} Dz</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </ScrollView>
                </>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E2541',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#A5F1E9',
    },
    scrollContainer: {
        padding: 20,
    },
    productImage: {
        width: '100%',
        height: 250,
        borderRadius: 15,
        marginBottom: 20,
    },
    productInfo: {
        backgroundColor: '#2C2C2C',
        borderRadius: 15,
        padding: 20,
    },
    nameAndFavorite: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
    },
    productWeight: {
        fontSize: 16,
        color: '#888',
        marginBottom: 5,
    },
    productPrice: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#A5F1E9',
        marginBottom: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    ratingText: {
        marginLeft: 5,
        color: '#A5F1E9',
    },
    quantityContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    quantityButton: {
        backgroundColor: '#A5F1E9',
        borderRadius: 15,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: 24,
        color: '#2C2C2C',
        fontWeight: 'bold',
    },
    quantityText: {
        fontSize: 18,
        color: '#fff',
        marginHorizontal: 20,
    },
    addToCartButton: {
        backgroundColor: '#A5F1E9',
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    addToCartButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C2C2C',
    },
    similarProductsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#A5F1E9',
        marginBottom: 15,
    },
    similarProductsContainer: {
        marginBottom: 20,
    },
    similarProductCard: {
        backgroundColor: '#143626',
        borderRadius: 15,
        padding: 10,
        marginRight: 15,
        width: 120,
    },
    similarProductImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginBottom: 10,
    },
    similarProductName: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 5,
    },
    similarProductPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#A5F1E9',
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
        color: '#2C2C2C',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default ProductScreen;
