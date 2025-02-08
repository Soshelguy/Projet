import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    RefreshControl 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../AuthContext';

const ServiceBookingsScreen = ({ route, navigation }) => {
    const { service } = route.params;
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { authToken } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return '#FFA500'; // Orange
            case 'confirmed':
                return '#4CAF50'; // Green
            case 'completed':
                return '#2196F3'; // Blue
            case 'cancelled':
                return '#FF4444'; // Red
            default:
                return '#999';
        }
    };
    useEffect(() => {
        if (!service?.id) {
            Alert.alert('Error', 'Invalid service information');
            navigation.goBack();
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [service?.id, authToken]);
    
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchBookings().finally(() => setRefreshing(false));
    }, []);
    const fetchBookings = async () => {
        if (!service?.id || !authToken) {
            setLoading(false);
            return;
        }
    
        try {
            console.log('Fetching:', `http://192.168.1.2:5000/api/bookings/service/${service.id}`);
            const response = await fetch(
                `http://192.168.1.2:5000/api/bookings/service/${service.id}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            const text = await response.text();
    
            const data = JSON.parse(text);
            setBookings(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert('Error', 'Could not load bookings');
        } finally {
            setLoading(false);
        }
    };
    const updateBookingStatus = async (bookingId, newStatus) => {
        try {
            const response = await fetch(
                `http://192.168.1.2:5000/api/bookings/${bookingId}/status`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: newStatus })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            // Update local state
            setBookings(prevBookings => 
                prevBookings.map(booking => 
                    booking.id === bookingId 
                        ? { ...booking, status: newStatus }
                        : booking
                )
            );
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'Failed to update booking status');
        }
    };
   
    const renderBookingItem = ({ item }) => (
        <View style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
                <Image 
                    source={{ uri: item.customer_image || 'https://via.placeholder.com/50' }}
                    style={styles.customerImage}
                />
                <View style={styles.bookingInfo}>
                    <Text style={styles.customerName}>{item.customer_name}</Text>
                    <View style={styles.dateTimeContainer}>
                        <Icon name="calendar-outline" size={16} color="#666" />
                        <Text style={styles.bookingDate}>
                            {new Date(item.booking_date).toLocaleDateString()}
                        </Text>
                        <Icon name="time-outline" size={16} color="#666" />
                        <Text style={styles.bookingTime}>
                            {item.booking_time}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Text>
                    </View>
                </View>
            </View>
    
    
            <View style={styles.statusOptionsContainer}>
            {['pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                <TouchableOpacity
                    key={status}
                    style={[
                        styles.statusOption,
                        item.status === status && styles.selectedStatus,
                        { backgroundColor: getStatusColor(status) }
                    ]}
                    onPress={() => updateBookingStatus(item.id, status)}
                >
                    <Text style={styles.statusOptionText}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        <View style={styles.divider} />

        <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => navigation.navigate('ChatScreen', {
                bookingId: item.id,
                customerName: item.customer_name
            })}
        >
            <Icon name="chatbubble-outline" size={20} color="#1F654C" />
            <Text style={styles.chatButtonText}>Message Customer</Text>
        </TouchableOpacity>
    </View>
);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1F654C" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.serviceHeader}>
                <Text style={styles.serviceTitle}>{service.name}</Text>
                <Text style={styles.bookingsCount}>
                    {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                </Text>
            </View>
            
            <FlatList
                atList
                data={bookings}
                renderItem={renderBookingItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.bookingsList}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#1F654C']}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No bookings yet</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    serviceHeader: {
        padding: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0'
    },
    serviceTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F654C'
    },
    bookingsCount: {
        fontSize: 16,
        color: '#666',
        marginTop: 5
    },
    bookingsList: {
        padding: 15
    },
    statusOptionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0'
    },
    statusOption: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        minWidth: 80,
        alignItems: 'center'
    },
    selectedStatus: {
        borderWidth: 2,
        borderColor: '#FFF'
    },
    statusOptionText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600'
    },
    bookingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    bookingHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    customerImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12
    },
    bookingInfo: {
        flex: 1
    },
    customerName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 6
    },
    dateTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    bookingDate: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
        marginRight: 12
    },
    bookingTime: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20
    },
    statusText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600'
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 12
    },
    chatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E6F2EF',
        padding: 12,
        borderRadius: 8,
        marginTop: 4
    },
    chatButtonText: {
        color: '#FFFFFF',
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '500'
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0'
    },
    chatButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1F654C',
        padding: 12,
        borderRadius: 8
    },
    buttonText: {
        color: '#FFF',
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600'
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 20
    },
    emptyText: {
        fontSize: 16,
        color: '#666'
    }
});

export default ServiceBookingsScreen;