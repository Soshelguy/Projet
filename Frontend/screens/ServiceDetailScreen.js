/**
 * ServiceDetailScreen: A screen for displaying a service's details
 * 
 * Props:
 *  - route: An object containing the service ID
 *  - navigation: A navigation object for navigating between screens
 */
import React, { useState, useEffect, useContext } from 'react';
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
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from '../FavoritesContext';
import { useAuth } from '../AuthContext';
import moment from 'moment';
import ServiceBookingModal from '../components/ServiceBookingModal';

const ServiceDetailScreen = ({ route, navigation }) => {
    const { serviceId } = route.params;
    const [service, setService] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userBookings, setUserBookings] = useState([]);
    const [canRate, setCanRate] = useState(false);
    const [hasCompletedBooking, setHasCompletedBooking] = useState(false);
    const { isServiceFavorite, toggleFavoriteService } = useFavorites();
    const isFavorite = serviceId ? isServiceFavorite(serviceId) : false;
    const { authToken, user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [unavailableSlots, setUnavailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(true);

    useEffect(() => {
        getCurrentUser();
        if (serviceId) {
            fetchServiceDetails();
            fetchUserBookings();
            fetchUnavailableSlots();

        }
    }, [serviceId]);
    // Check user on mount or whenever user changes (e.g. re-login)
    useEffect(() => {
        if (!user) {
        // If user is not logged in, you can decide how to handle it
        console.log('No user found. Possibly show a login prompt or redirect.');
        }
    }, [user]);

    useEffect(() => {
        if (user && serviceId) {
            checkBookingStatus();
        }
    }, [user, serviceId]);

    useEffect(() => {
        if (serviceId && currentUserId) {
          fetchData();
        }
      }, [serviceId, currentUserId]);
    
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          await fetchServiceDetails();
          // You could also call fetchUserBookings() or checkBookingStatus() in parallel here
        } catch (err) {
          console.error('Error in fetchData:', err);
        } finally {
          setLoading(false);
        }
      };
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

    const fetchUnavailableSlots = async () => {
        setLoadingSlots(true);
        try {
            const response = await fetch(`http://192.168.1.2:5000/api/bookings/unavailable-slots/${serviceId}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
    
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error('Invalid response format from server');
            }
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch unavailable slots');
            }
            
            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format received');
            }
    
            setUnavailableSlots(data);
        } catch (error) {
            console.error('Error fetching unavailable slots:', error);
            setUnavailableSlots([]);
            Alert.alert(
                'Error',
                'Failed to load available time slots. Please try again later.'
            );
        } finally {
            setLoadingSlots(false);
        }
    };
    // Generate available time slots
    const generateTimeSlots = () => {
        const slots = [
            '09:00', '10:00', '11:00', '12:00', 
            '13:00', '14:00', '15:00', '16:00', 
            '17:00', '18:00'
        ];
        return slots;
    };
    const isDateFullyBooked = (date) => {
        const formattedDate = moment(date).format('YYYY-MM-DD');
        const slotsForDate = unavailableSlots.filter(slot => slot.date === formattedDate);
        const totalTimeSlots = generateTimeSlots().length;
        return slotsForDate.length >= totalTimeSlots;
    };

    // Generate next 7 days for booking
    const generateAvailableDates = () => {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = moment().add(i, 'days');
            dates.push({
                date: date,
                isAvailable: !isDateFullyBooked(date)
            });
        }
        return dates;
    };
    const isSlotUnavailable = (date, time) => {
        if (!date || !time || !Array.isArray(unavailableSlots)) return false;
        
        const formattedDate = moment(date).format('YYYY-MM-DD');
        return unavailableSlots.some(slot => 
            slot.date === formattedDate && 
            slot.time === time
        );
    };
    const fetchServiceDetails = async () => {
        try {
            const response = await fetch(`http://192.168.1.2:5000/api/services/${serviceId}`);
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
        if (!currentUserId) return;
        
        try {
            const response = await fetch(`http://192.168.1.2:5000/api/bookings/user/${currentUserId}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch bookings');
            }
    
            const bookings = await response.json();
            setUserBookings(bookings);
            
            const hasCompletedBooking = bookings.some(
                booking => booking.service_id === parseInt(serviceId) && 
                          booking.status === 'completed'
            );
            setCanRate(hasCompletedBooking);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            Alert.alert('Error', 'Failed to fetch booking history');
        }
    };
      
        
    // Check if the user has completed a booking for this service
// Update handleBooking function
const handleBooking = async (bookingDetails) => {
    try {
        if (!user) {
            Alert.alert('Error', 'Please log in to book services');
            return;
        }

        // Check for existing active booking
        const existingBooking = userBookings.find(
            booking => booking.service_id === parseInt(serviceId) && 
            ['pending', 'confirmed'].includes(booking.status)
        );

        if (existingBooking) {
            Alert.alert(
                'Booking Failed', 
                'You already have an active booking for this service. Please wait until your current booking is completed.'
            );
            setShowBookingModal(false);
            return;
        }

        const bookingData = {
            service_id: serviceId,
            booking_date: bookingDetails.booking_date,
            booking_time: bookingDetails.booking_time
        };

        const response = await fetch('http://192.168.1.2:5000/api/bookings/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(bookingData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            if (data.status === 'DUPLICATE_BOOKING') {
                // Handle validation message (not an error)
                Alert.alert('Booking Status', data.message);
                setShowBookingModal(false);
                return;
            }
            // Handle actual errors
            throw new Error(data.error || 'Booking creation failed');
        }

        setShowBookingModal(false);
        Alert.alert('Booking Successful', 'Your booking has been submitted.');
        navigation.navigate('ChatScreen', { 
            bookingId: data.id, 
            serviceId, 
            providerId: service.user_id 
        });

    } catch (error) {
        if (!error.message?.includes('active booking')) {
            console.error('Error creating booking:', error);
        }
        Alert.alert('Error', error.message || 'Failed to create booking.');
    }
};

    const handleRating = async () => {
        try {
            if (rating === 0) {
                Alert.alert('Error', 'Please select a rating');
                return;
            }

            const response = await fetch('http://192.168.1.2:5000/api/ratings/create', {
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
        if (!user?.id) return;
        
        try {
            const response = await fetch(`http://192.168.1.2:5000/api/bookings/user/${user.id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to check booking status');
            }
            
            const bookings = await response.json();
            const completed = bookings.some(
                booking => booking.service_id === parseInt(serviceId) && 
                          booking.status === 'completed'
            );
            setHasCompletedBooking(completed);
        } catch (error) {
            console.error('Error checking booking status:', error);
            Alert.alert('Error', 'Failed to check booking status');
        }
    };

    const sendNotification = async (userId, title, message) => {
        try {
            await fetch('http://192.168.1.2:5000/api/notifications/create', {
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

    // Show error if something went wrong
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            // Clear error and re-fetch
            setError(null);
            fetchData();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

     // Show if service is missing or failed to load
  if (!service) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Service ot found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
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
                    onPress={() => toggleFavoriteService(serviceId)} 
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
                    <View style={styles.bookingSection}>
                    <Text style={styles.sectionTitle}>Book This Service</Text>
                    <TouchableOpacity 
                        style={styles.bookButton}
                        onPress={() => setShowBookingModal(true)}
                    >
                        <Icon name="calendar" size={24} color="#fff" />
                        <Text style={styles.bookButtonText}>Schedule Booking</Text>
                    </TouchableOpacity>
                </View>
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

           {/* Booking Modal with Calendar and Time Slots */}
           <Modal
    visible={showBookingModal}
    transparent={true}
    animationType="slide"
    onRequestClose={() => setShowBookingModal(false)}
>
    <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
            <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => setShowBookingModal(false)}
            >
                <Icon name="close" size={24} color="#1F654C" />
            </TouchableOpacity>
            
            <ServiceBookingModal
                visible={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                onConfirm={(date, time) => {
                    handleBooking({
                        booking_date: moment(date).format('YYYY-MM-DD'),
                        booking_time: time
                    });
                }}
                serviceId={serviceId}
                authToken={authToken}
            />
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
    container: { 
        flex: 1, 
        backgroundColor: '#fff' 
    },
    image: { 
        width: '100%', 
        height: 250, 
        resizeMode: 'cover' 
    },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        padding: 16 
    },
    title: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#333', 
        flex: 1 
    },
    favoriteButton: {
        marginLeft: 16 
    },
    detailsContainer: { 
        padding: 16 
    },
    price: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#1F654C', 
        marginVertical: 8 
    },
    ratingContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginVertical: 8 
    },
    rating: { 
        marginLeft: 4, 
        fontSize: 16, 
        color: '#666' 
    },
    category: { 
        fontSize: 14, 
        fontStyle: 'italic', 
        color: '#888', 
        marginVertical: 8 
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    closeModalButton: {
        position: 'absolute',
        right: 20,
        top: 20,
        zIndex: 1,
    },
    description: { 
        fontSize: 16, 
        lineHeight: 24, 
        color: '#555', 
        marginBottom: 16 
    },
    bookingSection: {
        backgroundColor: '#F0F4F8',
        padding: 16,
        marginTop: 16,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F654C',
        marginBottom: 12,
    },
    unavailableTimeSlot: {
        backgroundColor: '#f5f5f5',
        borderColor: '#ddd',
        opacity: 0.7
    },
    unavailableTimeSlotText: {
        color: '#999'
    },
    selectedTimeSlotText: {
        color: '#ffffff'
    },
    timeSlotsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 10
    },
    unavailableDateButton: {
        backgroundColor: '#f5f5f5',
        opacity: 0.7,
        borderColor: '#ddd'
    },
    unavailableDateText: {
        color: '#999'
    },
    unavailableTimeSlot: {
        backgroundColor: '#f5f5f5',
        opacity: 0.7,
        borderColor: '#FF4444'
    },
    unavailableTimeSlotText: {
        color: '#999'
    },
    selectedTimeSlotTextWhite: {
        color: '#ffffff',
    },
    unavailableIcon: {
        position: 'absolute',
        top: 5,
        right: 5,
    },
    bookButton: {
        backgroundColor: '#1F654C',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
    },
    bookButtonText: {
        color: '#fff',
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
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
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F654C',
        textAlign: 'center',
        marginBottom: 20,
    },
    subTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    dateScrollView: {
        marginBottom: 20,
    },
    dateButton: {
        backgroundColor: '#E6F2EF',
        borderRadius: 10,
        padding: 10,
        marginRight: 10,
        alignItems: 'center',
        width: 70,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold', 
        marginBottom: 16
    },
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
    selectedDateButton: {
        backgroundColor: '#1F654C',
    },
    dateText: {
        color: '#1F654C',
        fontSize: 12,
    },
    dateNumberText: {
        color: '#1F654C',
        fontSize: 16,
        fontWeight: 'bold',
    },
    timeSlotsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    timeSlotButton: {
        backgroundColor: '#E6F2EF',
        borderRadius: 8,
        padding: 10,
        margin: 5,
        width: '30%',
        alignItems: 'center',
    },
    selectedTimeSlotButton: {
        backgroundColor: '#1F654C',
    },
    timeSlotText: {
        color: '#1F654C',
        fontWeight: '600',
    },
    messageInput: {
        backgroundColor: '#F0F4F8',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        height: 100,
    },
    confirmBookingButton: {
        backgroundColor: '#1F654C',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    confirmBookingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeModalButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: '#E6F2EF',
        borderRadius: 20,
        padding: 5,
    },
    starsContainer: { flexDirection: 'row', marginBottom: 16 },
    star: { marginHorizontal: 8 },
});

export default ServiceDetailScreen;