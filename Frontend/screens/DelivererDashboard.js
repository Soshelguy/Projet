import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../AuthContext';

const DelivererDashboard = () => {
    const [availableDeliveries, setAvailableDeliveries] = useState([]);
    const [earnings, setEarnings] = useState({ today: 0, week: 0 });
    const [rating, setRating] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuth();

    const fetchDashboardData = async () => {
        setAvailableDeliveries([
            {
                id: 1,
                pickupAddress: "123 Main St",
                deliveryAddress: "456 Oak Ave",
                distance: "2.5 km",
                estimatedPay: "15.00",
                estimatedTime: "20 mins"
            },
            {
                id: 2,
                pickupAddress: "789 Pine St",
                deliveryAddress: "321 Elm St",
                distance: "3.8 km",
                estimatedPay: "18.50",
                estimatedTime: "25 mins"
            }
        ]);

        setEarnings({
            today: 85.50,
            week: 425.75
        });

        setRating(4.8);
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchDashboardData().finally(() => setRefreshing(false));
    }, []);

    const renderDeliveryCard = (delivery) => (
        <TouchableOpacity 
            key={delivery.id}
            style={styles.deliveryCard}
            onPress={() => {}}
        >
            <View style={styles.deliveryHeader}>
                <Icon name="location" size={24} color="#1F654C" />
                <Text style={styles.estimatedPay}>${delivery.estimatedPay}</Text>
            </View>
            
            <View style={styles.deliveryDetails}>
                <View style={styles.addressContainer}>
                    <Text style={styles.addressLabel}>Pickup:</Text>
                    <Text style={styles.address}>{delivery.pickupAddress}</Text>
                </View>
                
                <View style={styles.addressContainer}>
                    <Text style={styles.addressLabel}>Deliver to:</Text>
                    <Text style={styles.address}>{delivery.deliveryAddress}</Text>
                </View>
                
                <View style={styles.deliveryFooter}>
                    <Text style={styles.deliveryInfo}>
                        <Icon name="time-outline" size={16} /> {delivery.estimatedTime}
                    </Text>
                    <Text style={styles.deliveryInfo}>
                        <Icon name="map-outline" size={16} /> {delivery.distance}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.welcomeText}>Welcome back, {user?.name}</Text>
                    <View style={styles.ratingContainer}>
                        <Icon name="star" size={24} color="#A5F1E9" />
                        <Text style={styles.rating}>{rating}</Text>
                    </View>
                </View>

                {/* Earnings Section */}
                <View style={styles.earningsContainer}>
                    <View style={styles.earningBox}>
                        <Text style={styles.earningLabel}>Today's Earnings</Text>
                        <Text style={styles.earningAmount}>${earnings.today}</Text>
                    </View>
                    <View style={styles.earningBox}>
                        <Text style={styles.earningLabel}>This Week</Text>
                        <Text style={styles.earningAmount}>${earnings.week}</Text>
                    </View>
                </View>

                {/* Available Deliveries Section */}
                <View style={styles.deliveriesSection}>
                    <Text style={styles.sectionTitle}>Available Deliveries</Text>
                    {availableDeliveries.map(renderDeliveryCard)}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E0F7FA',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: '600',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        marginLeft: 5,
        fontSize: 16,
        fontWeight: '600',
    },
    earningsContainer: {
        flexDirection: 'row',
        padding: 15,
        justifyContent: 'space-between',
    },
    earningBox: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
        margin: 5,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    earningLabel: {
        fontSize: 14,
        color: '#666',
    },
    earningAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F654C',
        marginTop: 5,
    },
    deliveriesSection: {
        padding: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
    },
    deliveryCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    deliveryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    estimatedPay: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F654C',
    },
    deliveryDetails: {
        gap: 10,
    },
    addressContainer: {
        marginBottom: 5,
    },
    addressLabel: {
        fontSize: 12,
        color: '#666',
    },
    address: {
        fontSize: 14,
        fontWeight: '500',
    },
    deliveryFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    deliveryInfo: {
        fontSize: 14,
        color: '#666',
    },
});

export default DelivererDashboard;