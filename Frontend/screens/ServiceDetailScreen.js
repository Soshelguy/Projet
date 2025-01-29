/**
 * ServiceDetailScreen: A screen for displaying a service's details
 * 
 * Props:
 *  - route: An object containing the service ID
 *  - navigation: A navigation object for navigating between screens
 */
import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    Image, 
    TouchableOpacity, 
    StyleSheet,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from '../FavoritesContext';
import { useAuth } from '../AuthContext';

const ServiceDetailScreen = ({ route, navigation }) => {
    const { serviceId } = route.params;
    const [service, setService] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userBookings, setUserBookings] = useState([]);
    const [canRate, setCanRate] = useState(false);
    const [hasCompletedBooking, setHasCompletedBooking] = useState(false);
    const { checkIfFavorite, toggleFavorite } = useFavorites();
    const isFavorite = serviceId ? checkIfFavorite(serviceId) : false;
    const { user } = useAuth();

    useEffect(() => {
        getCurrentUser();
        if (serviceId) {
            fetchServiceDetails();
            fetchUserBookings();
        }
    }, [serviceId]);

    useEffect(() => {
        if (user && serviceId) {
            checkBookingStatus();
        }
    }, [user, serviceId]);

    // Fetch the service details from the API
    const getCurrentUser = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const { id } = JSON.parse(userData);
                setCurrentUserId(id);
            }
        } catch (error) {
            console.error('Error getting current user:', error);
            setError('Failed to get user data');
        }
    };

    const fetchServiceDetails = async () => {
        try {
            const response = await fetch(`https://cf8f-197-203-19-175.ngrok-free.app/api/services/${serviceId}`);
            if (!response.ok) throw new Error('Service fetch failed');

            
            const data = await response.json();
            // Normalize the data
            const normalizedService = {
                ...data,
                price: parseFloat(data.price) || 0,
                average_rating: parseFloat(data.average_rating) || 0,
                total_ratings: parseInt(data.total_ratings) || 0,
                category: data.category || 'Uncategorized',
                description: data.description || 'No description available',
                image: data.image || 'default_image_url',
            };
            setService(normalizedService);
        } catch (error) {
            setError('Failed to load service details');
        } finally {
            setLoading(false);
        }
    };

    // Fetch the user's bookings from the API
    const fetchUserBookings = async () => {
        try {
            const response = await fetch(`https://cf8f-197-203-19-175.ngrok-free.app/api/services/bookings/user/${currentUserId}`, {
                headers: {
                    'user-id': currentUserId 
                }
            });
            if (!response.ok) throw new Error('Failed to fetch bookings');

            
            const bookings = await response.json();
            setUserBookings(bookings);
            
            const hasCompletedBooking = bookings.some(
                booking => booking.service_id === serviceId && booking.status === 'completed'
            );
            setCanRate(hasCompletedBooking);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    // Check if the user has completed a booking for this service
    const handleBooking = async () => {
        try {
            if (!message.trim()) {
                Alert.alert('Error', 'Please enter a message for the provider');
                return;
            }
    
            if (!user) {
                Alert.alert('Error', 'Please log in to book services');
                return;
            }
    
            const response = await fetch('https://cf8f-197-203-19-175.ngrok-free.app/api/services/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': user.id.toString() 
                },
                body: JSON.stringify({
                    serviceId,
                    message
                })
            });
    
            if (!response.ok) throw new Error('Booking creation failed');
    
            const booking = await response.json();
            
            setShowBookingModal(false);
            navigation.navigate('ChatScreen', { 
                bookingId: booking.id,
                serviceId,
                providerId: service.user_id
            });
        } catch (error) {
            console.error('Error creating booking:', error);
            Alert.alert('Error', 'Failed to create booking');
        }
    };

    const handleRating = async () => {
        try {
            if (rating === 0) {
                Alert.alert('Error', 'Please select a rating');
                return;
            }

            const response = await fetch('https://cf8f-197-203-19-175.ngrok-free.app/api/ratings/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    serviceId,
                    userId: currentUserId,
                    rating,
                    feedback
                })
            });

            if (!response.ok) throw new Error('Rating submission failed');

            await fetchServiceDetails();
            setShowRatingModal(false);
            Alert.alert('Success', 'Thank you for your feedback!');

            await sendNotification(service.user_id, 'New Rating', 
                `Your service ${service.name} received a new rating`);

        } catch (error) {
            console.error('Error submitting rating:', error);
            Alert.alert('Error', 'Failed to submit rating');
        }
    };
    const checkBookingStatus = async () => {
        try {
            const response = await fetch(`https://cf8f-197-203-19-175.ngrok-free.app/api/services/bookings/user`, {
                headers: {
                    'user-id': user.id.toString()
                }
            });
            if (!response.ok) throw new Error('Failed to check booking status');
            
            const bookings = await response.json();
            const completed = bookings.some(
                booking => booking.service_id === parseInt(serviceId) && 
                          booking.status === 'completed'
            );
            setHasCompletedBooking(completed);
        } catch (error) {
            console.error('Error checking booking status:', error);
        }
    };

    const sendNotification = async (userId, title, message) => {
        try {
            await fetch('https://cf8f-197-203-19-175.ngrok-free.app/api/notifications/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    title,
                    message,
                    type: 'service'
                })
            });
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1F654C" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={fetchServiceDetails}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!service) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Service not found</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.retryButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Image 
                source={{ uri: service.image }} 
                style={styles.image}
            />
            
            <View style={styles.header}>
                <Text style={styles.title}>{service.name}</Text>
                <TouchableOpacity 
                    onPress={() => toggleFavorite(serviceId)} 
                    style={styles.favoriteButton}
                >
                    <Icon 
                        name={isFavorite ? 'heart' : 'heart-outline'} 
                        size={24} 
                        color={isFavorite ? '#ff4444' : '#000'} 
                    />
                </TouchableOpacity>
            </View>
            
            <View style={styles.detailsContainer}>
                <Text style={styles.price}>${service.price.toFixed(2)}</Text>
                <TouchableOpacity 
                    style={styles.ratingContainer}
                    onPress={() => canRate && setShowRatingModal(true)}
                >
                    <Icon name="star" size={20} color="#A5F1E9" />
                    <Text style={styles.rating}>
                        {service.average_rating.toFixed(1)} ({service.total_ratings})
                    </Text>
                </TouchableOpacity>
                
                <Text style={styles.category}>{service.category}</Text>
                <Text style={styles.description}>{service.description}</Text>
                
                {currentUserId !== service.user_id && (
                    <TouchableOpacity 
                        style={styles.bookButton}
                        onPress={() => setShowBookingModal(true)}
                    >
                        <Text style={styles.bookButtonText}>Book Now</Text>
                    </TouchableOpacity>
                )}
            </View>
            {hasCompletedBooking && (
                <TouchableOpacity 
                    style={styles.ratingButton}
                    onPress={() => setShowRatingModal(true)}
                >
                    <Text style={styles.ratingButtonText}>Rate Service</Text>
                </TouchableOpacity>
            )}

            {/* Booking Modal */}
            <Modal
                visible={showBookingModal}
                transparent={true}
                onRequestClose={() => setShowBookingModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Book Service</Text>
                        <TextInput
                            placeholder="Message for the provider"
                            value={message}
                            onChangeText={setMessage}
                            style={styles.messageInput}
                            multiline
                        />
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleBooking}
                        >
                            <Text style={styles.submitText}>Submit Booking</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowBookingModal(false)}
                        >
                            <Icon name="close" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Rating Modal */}
            <Modal
                visible={showRatingModal}
                transparent={true}
                onRequestClose={() => setShowRatingModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Rate Service</Text>
                        <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => setRating(star)}
                                >
                                    <Icon
                                        name={rating >= star ? 'star' : 'star-outline'}
                                        size={30}
                                        color="#A5F1E9"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            placeholder="Your feedback (optional)"
                            value={feedback}
                            onChangeText={setFeedback}
                            style={styles.messageInput}
                            multiline
                        />
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleRating}
                        >
                            <Text style={styles.submitText}>Submit Rating</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowRatingModal(false)}
                        >
                            <Icon name="close" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    image: { width: '100%', height: 250, resizeMode: 'cover' },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#333', flex: 1 },
    favoriteButton: { marginLeft: 16 },
    detailsContainer: { padding: 16 },
    price: { fontSize: 18, fontWeight: 'bold', color: '#1F654C', marginVertical: 8 },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
    rating: { marginLeft: 4, fontSize: 16, color: '#666' },
    category: { fontSize: 14, fontStyle: 'italic', color: '#888', marginVertical: 8 },
    description: { fontSize: 16, lineHeight: 24, color: '#555', marginBottom: 16 },
    bookButton: {
        backgroundColor: '#1F654C',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    bookButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    ratingButton: {
        backgroundColor: '#FFD700',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    ratingButtonText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 18, color: '#f00', textAlign: 'center', marginBottom: 16 },
    retryButton: {
        backgroundColor: '#1F654C',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    retryButtonText: { color: '#fff', fontSize: 16 },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    messageInput: {
        width: '100%',
        height: 80,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 8,
        marginBottom: 16,
        textAlignVertical: 'top',
    },
    feedbackInput: {
        width: '100%',
        height: 100,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 8,
        marginBottom: 16,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#1F654C',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
        width: '100%',
    },
    submitText: { color: '#fff', fontSize: 16 },
    closeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#eee',
        borderRadius: 50,
        padding: 8,
    },
    starsContainer: { flexDirection: 'row', marginBottom: 16 },
    star: { marginHorizontal: 8 },
});

export default ServiceDetailScreen;
