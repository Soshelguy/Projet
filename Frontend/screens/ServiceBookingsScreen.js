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

    const renderBookingItem = ({ item }) => (
        <View style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
                <Image 
                    source={{ uri: item.customer_image || 'https://via.placeholder.com/50' }}
                    style={styles.customerImage}
                />
                <View style={styles.bookingInfo}>
                    <Text style={styles.customerName}>{item.customer_name}</Text>
                    <Text style={styles.bookingDate}>
                        {new Date(item.booking_date).toLocaleDateString()} at {item.booking_time}
                    </Text>
                </View>
                <View style={styles.statusContainer}>
                    <Text style={[
                        styles.statusText,
                        { color: item.status === 'pending' ? '#FFA500' : '#4CAF50' }
                    ]}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                </View>
            </View>
            
            <View style={styles.actionButtons}>
                <TouchableOpacity 
                    style={styles.chatButton}
                    onPress={() => navigation.navigate('Chat', { 
                        bookingId: item.id,
                        customerName: item.customer_name
                    })}
                >
                    <Icon name="chatbubble-outline" size={20} color="#FFF" />
                    <Text style={styles.buttonText}>Chat with Customer</Text>
                </TouchableOpacity>
            </View>
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
    bookingCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    bookingHeader: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    customerImage: {
        width: 50,
        height: 50,
        borderRadius: 25
    },
    bookingInfo: {
        flex: 1,
        marginLeft: 15
    },
    customerName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333'
    },
    bookingDate: {
        fontSize: 14,
        color: '#666',
        marginTop: 4
    },
    statusContainer: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F0F0F0'
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600'
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